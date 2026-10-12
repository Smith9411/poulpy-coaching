import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function generateGoogleCalendarUrl({
  planName,
  bookingDate,
  bookingTime,
  game,
}) {
  try {
    const [hours, minutes] = bookingTime.split(':').map(Number);
    const start = new Date(`${bookingDate}T${String(hours || 0).padStart(2, '0')}:${String(minutes || 0).padStart(2, '0')}:00`);
    const end = new Date(start.getTime() + 90 * 60 * 1000);

    const formatGCal = (d) =>
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

async function main() {
  const studentName = 'Thomas';
  const studentEmail = 'tborgesbessonnet@gmail.com';
  const studentDiscord = 'tborges#0001';
  const planName = 'Séance Découverte (Offerte)';
  const planPrice = '0€';
  const planDuration = '30 min';
  const bookingDate = '2026-10-14';
  const bookingTime = '18:00';
  const game = 'Valorant';

  const gCalUrl = generateGoogleCalendarUrl({
    planName,
    bookingDate,
    bookingTime,
    game,
  });

  const formattedDate = new Date(bookingDate).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const isFree = true;

  const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Séance confirmée — Poulpy Coaching</title>
</head>
<body style="margin: 0; padding: 32px 12px; background-color: #121316; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <!-- Container Principal -->
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #1A1C22; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; overflow: hidden; box-shadow: 0 16px 48px rgba(0,0,0,0.45);">
          
          <!-- En-tête Branded Sobre -->
          <tr>
            <td style="padding: 36px 36px 18px; text-align: center;">
              <img src="https://www.poulpy-coaching.fr/poulpy-octopus.png" alt="Poulpy Coaching" width="52" height="52" style="display: inline-block; margin-bottom: 12px;" />
              <div style="font-size: 13px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: #CA1C30;">POULPY COACHING</div>
              <h1 style="margin: 12px 0 0; font-size: 24px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.3px;">Séance confirmée</h1>
            </td>
          </tr>

          <!-- Message d'introduction naturel -->
          <tr>
            <td style="padding: 0 36px 22px; text-align: center;">
              <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #A0A4B0;">
                Salut <span style="color: #FFFFFF; font-weight: 600;">${studentName}</span>, ton créneau est validé sur le planning. Prépare-toi, on va analyser ton jeu et débloquer ton plein potentiel.
              </p>
            </td>
          </tr>

          <!-- Séparateur discret -->
          <tr>
            <td style="padding: 0 36px;">
              <div style="height: 1px; background-color: rgba(255,255,255,0.07);"></div>
            </td>
          </tr>

          <!-- Détails de la séance (Épuré & aligné) -->
          <tr>
            <td style="padding: 22px 36px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 9px 0; font-size: 14px; color: #7E8494;" width="38%">Formule</td>
                  <td style="padding: 9px 0; font-size: 14px; color: #FFFFFF; font-weight: 600; text-align: right;">
                    ${planName}
                    <span style="color: #00B4A0; font-weight: 600; font-size: 12px; margin-left: 6px; padding: 2px 8px; background: rgba(0,180,160,0.12); border-radius: 12px;">Offerte</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 9px 0; font-size: 14px; color: #7E8494; border-top: 1px solid rgba(255,255,255,0.04);">Date</td>
                  <td style="padding: 9px 0; font-size: 14px; color: #FFFFFF; font-weight: 600; text-align: right; border-top: 1px solid rgba(255,255,255,0.04); text-transform: capitalize;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 9px 0; font-size: 14px; color: #7E8494; border-top: 1px solid rgba(255,255,255,0.04);">Heure</td>
                  <td style="padding: 9px 0; font-size: 14px; color: #FFFFFF; font-weight: 600; text-align: right; border-top: 1px solid rgba(255,255,255,0.04);">
                    ${bookingTime} <span style="color: #7E8494; font-weight: 400; font-size: 13px;">(${planDuration})</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 9px 0; font-size: 14px; color: #7E8494; border-top: 1px solid rgba(255,255,255,0.04);">Jeu</td>
                  <td style="padding: 9px 0; font-size: 14px; color: #FFFFFF; font-weight: 600; text-align: right; border-top: 1px solid rgba(255,255,255,0.04);">${game}</td>
                </tr>
                <tr>
                  <td style="padding: 9px 0; font-size: 14px; color: #7E8494; border-top: 1px solid rgba(255,255,255,0.04);">Ton Discord</td>
                  <td style="padding: 9px 0; font-size: 14px; color: #FFFFFF; font-family: ui-monospace, SFMono-Regular, monospace; text-align: right; border-top: 1px solid rgba(255,255,255,0.04);">${studentDiscord}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Séparateur discret -->
          <tr>
            <td style="padding: 0 36px 26px;">
              <div style="height: 1px; background-color: rgba(255,255,255,0.07);"></div>
            </td>
          </tr>

          <!-- Boutons d'action modernes & attractifs -->
          <tr>
            <td style="padding: 0 36px 34px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-bottom: 12px;">
                    <a href="${gCalUrl}" target="_blank" style="display: block; box-sizing: border-box; text-align: center; background: linear-gradient(135deg, #E02438 0%, #B81426 100%); color: #FFFFFF; font-weight: 600; font-size: 14px; text-decoration: none; padding: 15px 24px; border-radius: 12px; letter-spacing: 0.3px; box-shadow: 0 6px 20px rgba(202,28,48,0.35);">
                      📅 Ajouter à mon agenda Google
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <a href="https://discord.gg/BC24FH4xpd" target="_blank" style="display: block; box-sizing: border-box; text-align: center; background: rgba(88, 101, 242, 0.12); border: 1px solid rgba(88, 101, 242, 0.4); color: #8EA1FF; font-weight: 600; font-size: 14px; text-decoration: none; padding: 14px 24px; border-radius: 12px; letter-spacing: 0.3px;">
                      💬 Rejoindre le Discord Poulpy Coaching
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer épuré -->
          <tr>
            <td style="padding: 20px 36px 26px; background-color: #15171C; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
              <p style="margin: 0; font-size: 12px; color: #626775;">
                Poulpy Coaching · Coaching E-sport Valorant & Apex Legends
              </p>
              <p style="margin: 6px 0 0; font-size: 11px;">
                <a href="https://www.poulpy-coaching.fr" style="color: #8E92A0; text-decoration: none;">poulpy-coaching.fr</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  console.log('Sending test email via Resend to', studentEmail);
  let res = await resend.emails.send({
    from: 'Poulpy Coaching <contact@poulpy-coaching.fr>',
    to: studentEmail,
    replyTo: 'contact@poulpy-coaching.fr',
    subject: `🎯 Session Confirmée : ${planName} le ${formattedDate} à ${bookingTime}`,
    html: htmlContent,
  });

  if (res.error && (res.error.message?.toLowerCase().includes('domain') || res.error.message?.toLowerCase().includes('verify'))) {
    console.warn('[Resend] Fallback onboarding@resend.dev');
    res = await resend.emails.send({
      from: 'Poulpy Coaching <onboarding@resend.dev>',
      to: studentEmail,
      replyTo: 'contact@poulpy-coaching.fr',
      subject: `🎯 Session Confirmée : ${planName} le ${formattedDate} à ${bookingTime}`,
      html: htmlContent,
    });
  }

  if (res.error) {
    console.error('Error:', res.error);
    process.exit(1);
  }

  console.log('Success! Email ID:', res.data?.id);
}

main().catch(console.error);
