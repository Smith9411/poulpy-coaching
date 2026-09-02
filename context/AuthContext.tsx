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
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<{ needsEmailConfirmation: boolean }>;
  logout: () => Promise<void>;
  updateAvatar: (avatarUrl: string | null) => Promise<void>;
  updateUsername: (newUsername: string) => Promise<void>;
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

  try {
    const { data } = await supabase
      .from('profiles')
      .select('username, is_admin')
      .eq('id', session.user.id)
      .single();
    if (data) {
      if (data.username) username = data.username;
      isAdmin = data.is_admin === true;
    }
  } catch {
    // profiles momentanément indisponible : on retombe sur les métadonnées
  }

  return {
    id: session.user.id,
    email: session.user.email || '',
    username,
    initial: username.charAt(0).toUpperCase(),
    isAdmin,
    avatarUrl,
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

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateAvatar, updateUsername, refreshUser }}>
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
