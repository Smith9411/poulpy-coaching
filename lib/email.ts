import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = resendApiKey ? new Resend(resendApiKey) : null;

interface SendBookingEmailParams {
  studentName: string;
  studentEmail: string;
  studentDiscord: string;
  planName: string;
  planPrice: string;
  planDuration: string;
  bookingDate: string; // YYYY-MM-DD
  bookingTime: string; // HH:mm
  game?: string;
}

/**
 * Génère le lien d'ajout direct à Google Calendar
 */
function generateGoogleCalendarUrl({
  planName,
  bookingDate,
  bookingTime,
  game,
}: {
  planName: string;
  bookingDate: string;
  bookingTime: string;
  game?: string;
}): string {
  try {
    const [hours, minutes] = bookingTime.split(':').map(Number);
    const start = new Date(`${bookingDate}T${String(hours || 0).padStart(2, '0')}:${String(minutes || 0).padStart(2, '0')}:00`);
    const end = new Date(start.getTime() + 90 * 60 * 1000); // 1h30 par défaut

    const formatGCal = (d: Date) =>
      d.toISOString().replace(/-|:|\.\d\d\d/g, '');

    const title = encodeURIComponent(`Coaching E-sport ${game || 'Valorant'} — Poulpy Coaching`);
    const details = encodeURIComponent(
      `Session de coaching e-sport officielle avec Coach Poulpy (Atheris Esport).\n\nFormule : ${planName}\nLieu : Serveur Discord Poulpy Coaching (rejoins le salon vocal en avance)\nMatériel : Micro branché et partage d'écran 60 FPS activé.`
    );
    const location = encodeURIComponent('Discord Poulpy Coaching (https://discord.gg/BC24FH4xpd)');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatGCal(start)}/${formatGCal(end)}&details=${details}&location=${location}`;
  } catch (e) {
    return 'https://calendar.google.com/';
  }
}

/**
 * Envoie un e-mail de confirmation cyberpunk responsive et élégant à l'élève
 */
export async function sendBookingConfirmationEmail(params: SendBookingEmailParams) {
  const {
    studentName,
    studentEmail,
    studentDiscord,
    planName,
    planPrice,
    planDuration,
    bookingDate,
    bookingTime,
    game = 'Valorant',
  } = params;

  if (!studentEmail) {
    console.warn('[Email] Aucun email renseigné pour l\'envoi de la confirmation.');
    return { error: 'Email manquant' };
  }

  const gCalUrl = generateGoogleCalendarUrl({
    planName,
    bookingDate,
    bookingTime,
    game,
  });

  const formattedDate = (() => {
    try {
      const d = new Date(bookingDate);
      return d.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return bookingDate;
    }
  })();

  const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de session — Poulpy Coaching</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0B0A0D; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #FFFFFF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0B0A0D; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Container -->
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #121117; border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.8);">
          
          <!-- Header Branded -->
          <tr>
            <td style="padding: 28px 32px; background: linear-gradient(135deg, #1A1822 0%, #121117 100%); border-bottom: 1px solid rgba(255,255,255,0.08); text-align: center;">
              <img src="https://www.poulpy-coaching.fr/poulpy-octopus.png" alt="Poulpy Coaching" width="56" height="56" style="margin-bottom: 12px; display: inline-block;" />
              <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 2px; color: #FFFFFF;">POULPY COACHING</h1>
              <p style="margin: 4px 0 0; font-size: 11px; color: #00B4A0; letter-spacing: 1px; font-family: monospace;">RÉSERVATION CONFIRMÉE // ACCÈS OFFICIEL</p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 24px;">
              <p style="font-size: 15px; line-height: 1.6; margin: 0 0 20px; color: #E5E5E5;">
                Salut <strong style="color: #FFFFFF;">${studentName}</strong>,
              </p>
              <p style="font-size: 14px; line-height: 1.6; margin: 0 0 24px; color: #A0A0A5;">
                Ta séance d'entraînement e-sport avec <strong>Coach Poulpy</strong> est officiellement validée et synchronisée sur le planning !
              </p>

              <!-- Session Details Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #1A1822; border-left: 3px solid #CA1C30; border-radius: 8px; margin-bottom: 28px; padding: 18px 20px;">
                <tr>
                  <td>
                    <div style="font-size: 11px; text-transform: uppercase; color: #888890; font-family: monospace; letter-spacing: 1px; margin-bottom: 6px;">Détails de la séance</div>
                    <div style="font-size: 16px; font-weight: bold; color: #FFFFFF; margin-bottom: 12px;">${planName}</div>
                    
                    <table width="100%" cellspacing="0" cellpadding="4" style="font-size: 13px; color: #CCCCCC;">
                      <tr>
                        <td width="30%" style="color: #777780;">📅 Date :</td>
                        <td><strong style="color: #FFFFFF; text-transform: capitalize;">${formattedDate}</strong></td>
                      </tr>
                      <tr>
                        <td style="color: #777780;">⏰ Heure :</td>
                        <td><strong style="color: #00B4A0; font-family: monospace; font-size: 14px;">${bookingTime}</strong> (${planDuration})</td>
                      </tr>
                      <tr>
                        <td style="color: #777780;">🎮 Jeu :</td>
                        <td><strong style="color: #FFFFFF;">${game}</strong></td>
                      </tr>
                      <tr>
                        <td style="color: #777780;">💬 Discord :</td>
                        <td><strong style="color: #FFFFFF; font-family: monospace;">${studentDiscord}</strong></td>
                      </tr>
                      <tr>
                        <td style="color: #777780;">💳 Montant :</td>
                        <td><strong style="color: #FFFFFF;">${planPrice}</strong></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Action Buttons -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <a href="${gCalUrl}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; text-align: center; background-color: #CA1C30; color: #FFFFFF; font-weight: bold; font-size: 13px; text-decoration: none; padding: 14px 20px; border-radius: 8px; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(202,28,48,0.35);">
                      📅 AJOUTER À MON GOOGLE AGENDA
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <a href="https://discord.gg/BC24FH4xpd" target="_blank" style="display: block; width: 100%; box-sizing: border-box; text-align: center; background-color: #5865F2; color: #FFFFFF; font-weight: bold; font-size: 13px; text-decoration: none; padding: 13px 20px; border-radius: 8px; letter-spacing: 0.5px;">
                      💬 REJOINDRE LE DISCORD OFFICIEL
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Checklist -->
              <div style="background-color: #16151D; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 18px 20px; font-size: 12px; line-height: 1.7; color: #9A9AA0;">
                <div style="font-weight: bold; color: #FFFFFF; margin-bottom: 8px; font-size: 13px;">📌 Checklist avant le cours :</div>
                • Vérifie que ton micro et ton casque fonctionnent correctement.<br/>
                • Active l'option <strong>Partage d'écran 60 FPS</strong> sur Discord.<br/>
                • Lance ton jeu 5 minutes avant le début de la séance.<br/>
                • Poulpy te contactera sur Discord avant l'heure convenue.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0E0D12; border-top: 1px solid rgba(255,255,255,0.06); text-align: center; font-size: 11px; color: #666670; font-family: monospace;">
              Poulpy Coaching · Coaching E-sport Valorant & Apex Legends<br/>
              Besoin d'aide ? Réponds directement à cet email ou contacte-nous sur Discord.<br/>
              <span style="color: #444450; font-size: 10px; margin-top: 6px; display: inline-block;">https://www.poulpy-coaching.fr</span>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  // 1. Si Resend est configuré, envoi officiel en production
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'Poulpy Coaching <contact@poulpy-coaching.fr>',
        to: studentEmail,
        replyTo: 'contact@poulpy-coaching.fr',
        subject: `🎯 Session Confirmée : ${planName} le ${formattedDate} à ${bookingTime}`,
        html: htmlContent,
      });

      if (error) {
        console.error('[Resend Error]', error);
        return { error: error.message };
      }

      console.log(`[Email Sent] Confirmation envoyée avec succès à ${studentEmail} (ID: ${data?.id})`);
      return { success: true, id: data?.id };
    } catch (err: any) {
      console.error('[Resend Exception]', err);
      return { error: err.message };
    }
  }

  // 2. Si pas encore de clé RESEND_API_KEY, log de secours (évite de faire crasher les réservations)
  console.log(`[Email Notice] Email prêt pour ${studentEmail} (${planName} le ${bookingDate} à ${bookingTime}), en attente de la clé RESEND_API_KEY.`);
  return { simulated: true };
}
