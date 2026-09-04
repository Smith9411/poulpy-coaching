'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { type Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  email: string;
  username: string;
  initial: string;
  isAdmin: boolean;
  avatarUrl?: string | null;
  bio?: string | null;
  discord?: string | null;
  twitch?: string | null;
  youtube?: string | null;
  tiktok?: string | null;
  // true quand l'utilisateur est connecté (ex: via Google) mais n'a pas
  // encore choisi de pseudo → doit passer par /auth/complete
  needsUsername: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<{ needsEmailConfirmation: boolean }>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateAvatar: (avatarUrl: string | null) => Promise<void>;
  updateUsername: (newUsername: string) => Promise<void>;
  updateBio: (newBio: string) => Promise<void>;
  updateSocials: (socials: {
    discord?: string | null;
    twitch?: string | null;
    youtube?: string | null;
    tiktok?: string | null;
  }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Construit le User affiché par le site depuis la session Supabase
// + la ligne correspondante dans la table profiles (username, is_admin).
async function buildUser(session: Session): Promise<User> {
  const meta = session.user.user_metadata || {};
  let username: string = meta.username || session.user.email?.split('@')[0] || 'Joueur';
  let isAdmin = false;
  const avatarUrl: string | null = (meta.avatar_url && typeof meta.avatar_url === 'string' && meta.avatar_url.trim() !== '') ? meta.avatar_url : null;

  let bio: string | null = null;
  let profileUsername: string | null = null;
  let discord: string | null = meta.discord || null;
  let twitch: string | null = meta.twitch || null;
  let youtube: string | null = meta.youtube || null;
  let tiktok: string | null = meta.tiktok || null;

  try {
    const { data } = await supabase
      .from('profiles')
      .select('username, is_admin, bio')
      .eq('id', session.user.id)
      .maybeSingle();
    if (data) {
      if (data.username) {
        username = data.username;
        profileUsername = data.username;
      }
      isAdmin = data.is_admin === true;
      if (typeof data.bio === 'string') bio = data.bio;
    }
  } catch {
    // profiles momentanément indisponible : on retombe sur les métadonnées
  }

  // Récupération optionnelle des colonnes réseaux si elles existent dans profiles,
  // sans jamais bloquer ou altérer isAdmin ni le profil principal.
  try {
    const { data: socialData, error: socialErr } = await supabase
      .from('profiles')
      .select('discord, twitch, youtube, tiktok')
      .eq('id', session.user.id)
      .maybeSingle();
    if (!socialErr && socialData) {
      if (socialData.discord) discord = socialData.discord;
      if (socialData.twitch) twitch = socialData.twitch;
      if (socialData.youtube) youtube = socialData.youtube;
      if (socialData.tiktok) tiktok = socialData.tiktok;
    }
  } catch {
    // Colonnes non encore migrées dans profiles, métadonnées auth utilisées
  }

  const metaUsername = typeof meta.username === 'string' ? meta.username.trim() : '';
  // Les comptes email renseignent le pseudo à l'inscription (user_metadata).
  // Les comptes Google n'ont pas de pseudo → il faut passer par /auth/complete.
  const needsUsername = !profileUsername && !metaUsername;

  return {
    id: session.user.id,
    email: session.user.email || '',
    username,
    initial: username.charAt(0).toUpperCase(),
    isAdmin,
    avatarUrl,
    bio,
    discord,
    twitch,
    youtube,
    tiktok,
    needsUsername,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      setUser(await buildUser(data.session));
    }
  };

  useEffect(() => {
    // Session existante au chargement de la page
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        setUser(await buildUser(data.session));
      }
      setIsLoading(false);
    });

    // Reste synchronisé : connexion/déconnexion, autre onglet, rafraîchissement de session
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        buildUser(session).then(setUser);
      } else {
        setUser(null);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message === 'Invalid login credentials') {
        throw new Error('Email ou mot de passe incorrect');
      }
      if (error.message === 'Email not confirmed') {
        throw new Error('Confirme ton adresse email avant de te connecter (vérifie ta boîte mail).');
      }
      throw new Error(error.message);
    }
  };

  const register = async (email: string, username: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, email } },
    });
    if (error) {
      if (error.message.includes('already registered')) {
        throw new Error('Cet email est déjà utilisé');
      }
      if (error.message.includes('Password')) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères');
      }
      throw new Error(error.message);
    }
    return { needsEmailConfirmation: !data.session };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Retour OAuth traité par /auth/callback (session dans le fragment URL)
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      if (/provider/i.test(error.message) && /not enabled|unsupported/i.test(error.message)) {
        throw new Error(
          "La connexion Google n'est pas encore activée. Configuration requise côté Supabase (voir README, section Google OAuth)."
        );
      }
      throw new Error(error.message);
    }
    // En cas de succès, le navigateur quitte la page vers Google : rien à faire ici.
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const updateAvatar = async (avatarUrl: string | null) => {
    const { error } = await supabase.auth.updateUser({
      data: { avatar_url: avatarUrl || '' },
    });
    if (error) throw error;
    setUser((prev) => (prev ? { ...prev, avatarUrl: avatarUrl || null } : null));
  };

  const updateUsername = async (newUsername: string) => {
    if (!user) return;
    const { error: authErr } = await supabase.auth.updateUser({
      data: { username: newUsername },
    });
    if (authErr) throw authErr;

    await supabase.from('profiles').update({ username: newUsername }).eq('id', user.id);
    setUser((prev) => (prev ? { ...prev, username: newUsername, initial: newUsername.charAt(0).toUpperCase() } : null));
  };

  const updateBio = async (newBio: string) => {
    if (!user) return;
    const trimmed = newBio.trim();
    const { error } = await supabase
      .from('profiles')
      .update({ bio: trimmed || null })
      .eq('id', user.id);
    if (error) throw error;
    setUser((prev) => (prev ? { ...prev, bio: trimmed || null } : null));
  };

  const updateSocials = async (socials: {
    discord?: string | null;
    twitch?: string | null;
    youtube?: string | null;
    tiktok?: string | null;
  }) => {
    if (!user) return;
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error('Non authentifié');

    const res = await fetch('/api/profile/socials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(socials),
    });

    const result = await res.json();
    if (!res.ok || result.error) {
      throw new Error(result.error || 'Erreur sauvegarde réseaux');
    }

    setUser((prev) =>
      prev
        ? {
            ...prev,
            discord: result.socials.discord,
            twitch: result.socials.twitch,
            youtube: result.socials.youtube,
            tiktok: result.socials.tiktok,
          }
        : null
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        signInWithGoogle,
        logout,
        updateAvatar,
        updateUsername,
        updateBio,
        updateSocials,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
