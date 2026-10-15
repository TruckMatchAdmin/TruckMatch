/**
 * Modèles d'emails HTML professionnels TruckMatch
 * Conçus sur fond blanc pur (#ffffff) pour faire ressortir le logo officiel
 */

export interface EmailTrackingPayload {
  trackingId: string;
  recipientEmail: string;
  emailType:
    | "welcome_driver"
    | "welcome_company"
    | "payment_subscription"
    | "payment_driver_boost"
    | "support_message_notification"
    | "candidate_application"
    | "candidate_application_receipt";
  subject: string;
  sentAt: string;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.startsWith("http")
  ? process.env.NEXT_PUBLIC_SITE_URL
  : "https://truckmatch.fr";

/**
 * Base layout HTML pour tous les emails avec fond blanc
 */
function getEmailLayout({
  title,
  preheader,
  contentHtml,
  trackingToken,
}: {
  title: string;
  preheader: string;
  contentHtml: string;
  trackingToken: string;
}): string {
  const logoUrl = `${SITE_URL}/api/mail/logo.png?token=${encodeURIComponent(trackingToken)}`;
  const trackPixelUrl = `${SITE_URL}/api/mail/track?token=${encodeURIComponent(trackingToken)}`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-spacing: 0;
    }
    td {
      padding: 0;
    }
    img {
      border: 0;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f1f5f9;
      padding: 30px 10px;
    }
    .main {
      background-color: #ffffff;
      margin: 0 auto;
      width: 100%;
      max-width: 600px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }
    .header-logo {
      background-color: #ffffff;
      padding: 35px 25px 25px 25px;
      text-align: center;
      border-bottom: 2px solid #f8fafc;
    }
    .content-body {
      padding: 35px 35px 30px 35px;
      font-size: 15px;
      line-height: 1.6;
      color: #334155;
      background-color: #ffffff;
    }
    .cta-btn {
      display: inline-block;
      padding: 14px 28px;
      background-color: #0284c7;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 15px;
      border-radius: 8px;
      text-align: center;
      margin: 20px 0;
    }
    .cta-btn-emerald {
      background-color: #059669;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px 30px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
      line-height: 1.5;
    }
    .tag-pill {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      background-color: #e0f2fe;
      color: #0369a1;
      margin-bottom: 12px;
    }
    .highlight-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px 18px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <!-- Preheader invisible -->
  <div style="display:none; font-size:1px; color:#ffffff; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
    ${preheader}
  </div>

  <table class="wrapper" role="presentation">
    <tr>
      <td align="center">
        <table class="main" role="presentation">
          
          <!-- En-tête obligatoire sur fond blanc avec le logo officiel TruckMatch -->
          <tr>
            <td class="header-logo">
              <a href="${SITE_URL}" target="_blank" style="text-decoration:none;">
                <img src="${logoUrl}" alt="TruckMatch — Les entreprises trouvent leurs chauffeurs. Les chauffeurs trouvent leur route." width="280" style="display:block; width:280px; max-width:100%; height:auto; margin:0 auto;" />
              </a>
            </td>
          </tr>

          <!-- Contenu du mail -->
          <tr>
            <td class="content-body">
              ${contentHtml}
            </td>
          </tr>

          <!-- Pied de page officiel -->
          <tr>
            <td class="footer">
              <div style="font-weight:600; color:#334155; margin-bottom:4px;">
                TruckMatch — Plateforme Officielle de Recrutement du Transport Routier
              </div>
              <div>
                Une question ? Contactez notre exploitation : <a href="mailto:jobs@truckmatch.fr" style="color:#0284c7; text-decoration:none;">jobs@truckmatch.fr</a>
              </div>
              <div style="margin-top:12px; font-size:11px; color:#94a3b8;">
                © ${new Date().getFullYear()} TruckMatch. Tous droits réservés. Envoi sécurisé sans intermédiaire.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

  <!-- Pixel de tracking d'ouverture d'email & notification Telegram -->
  <img src="${trackPixelUrl}" width="1" height="1" style="display:none; width:1px; height:1px; border:0;" alt="" />
</body>
</html>`;
}

/**
 * 1. Email de Bienvenue Chauffeur / Candidat
 */
export function renderWelcomeDriverEmail({
  firstName,
  email,
  trackingToken,
}: {
  firstName: string;
  email: string;
  trackingToken: string;
}): { subject: string; html: string } {
  const name = firstName ? firstName.trim() : "Conducteur";
  const subject = `Bienvenue sur TruckMatch, ${name} ! Votre route commence ici`;
  const preheader = "Votre compte candidat est activé. Trouvez des tournées sans intermédiaire.";

  const contentHtml = `
    <div class="tag-pill">CONDUCTEUR CERTIFIÉ</div>
    <h1 style="font-size:22px; font-weight:800; color:#0f172a; margin:0 0 16px 0; line-height:1.3;">
      Bienvenue parmi nous, ${name} !
    </h1>
    
    <p>
      Votre inscription sur <strong>TruckMatch</strong> est validée avec succès. Vous rejoignez le 1er réseau de mise en relation directe entre conducteurs routiers et transporteurs.
    </p>

    <div class="highlight-card">
      <h3 style="margin:0 0 10px 0; font-size:15px; color:#0f172a;">Ce qui fait la différence sur TruckMatch :</h3>
      <ul style="margin:0; padding-left:18px; color:#475569; font-size:14px; line-height:1.7;">
        <li><strong>0 Intermédiaire & 0 Commission :</strong> Négociez directement avec l'exploitant sans agence d'intérim.</li>
        <li><strong>Salaires Intégraux :</strong> Aucun prélèvement sur vos primes, paniers repas et heures supplémentaires.</li>
        <li><strong>Tournées adaptées :</strong> Régionale (retour tous les soirs), Nationale ou Relais de nuit selon vos préférences.</li>
      </ul>
    </div>

    <p style="margin-bottom:8px;">
      <strong>Prochaine étape :</strong> complétez vos permis (CE, C, FIMO, ADR) et déposez votre CV pour que les exploitants de votre secteur puissent vous contacter dès aujourd'hui.
    </p>

    <div style="text-align:center; margin:28px 0;">
      <a href="${SITE_URL}/espace-candidat" class="cta-btn cta-btn-emerald" target="_blank">
        Accéder à mon Espace Candidat →
      </a>
    </div>

    <p style="font-size:13px; color:#64748b; margin-top:20px;">
      Votre identifiant de connexion : <strong>${email}</strong>
    </p>
  `;

  return {
    subject,
    html: getEmailLayout({ title: subject, preheader, contentHtml, trackingToken }),
  };
}

/**
 * 2. Email de Bienvenue Entreprise / Recruteur
 */
export function renderWelcomeCompanyEmail({
  companyName,
  contactName,
  email,
  trackingToken,
}: {
  companyName: string;
  contactName?: string;
  email: string;
  trackingToken: string;
}): { subject: string; html: string } {
  const cName = companyName ? companyName.trim() : "Entreprise Partenaire";
  const subject = `Bienvenue sur TruckMatch, ${cName} ! Recrutez vos chauffeurs routiers`;
  const preheader = "Votre espace transporteur est prêt. Accédez au vivier de conducteurs qualifiés.";

  const contentHtml = `
    <div class="tag-pill" style="background-color:#dcfce7; color:#166534;">TRANSPORTEUR PARTENAIRE</div>
    <h1 style="font-size:22px; font-weight:800; color:#0f172a; margin:0 0 16px 0; line-height:1.3;">
      Bienvenue sur TruckMatch, ${contactName ? contactName : cName} !
    </h1>

    <p>
      Nous sommes ravis d'accueillir <strong>${cName}</strong> sur la plateforme de recrutement dédiée au transport routier de marchandises.
    </p>

    <div class="highlight-card">
      <h3 style="margin:0 0 10px 0; font-size:15px; color:#0f172a;">Vos outils recruteur disponibles immédiatement :</h3>
      <ul style="margin:0; padding-left:18px; color:#475569; font-size:14px; line-height:1.7;">
        <li><strong>Vivier Conducteurs Certifiés :</strong> Accédez aux profils de conducteurs SPL, PL, Porteur et VUL disponibles dans votre région.</li>
        <li><strong>Dépôt d'Offres Direct :</strong> Publiez vos offres d'emploi en quelques clics sans commissions abusives.</li>
        <li><strong>Page Vitrine Entreprise Dédiée :</strong> Présentez votre matériel, vos valeurs et vos engagements conducteurs sur votre page publique personnalisée.</li>
      </ul>
    </div>

    <div style="text-align:center; margin:28px 0;">
      <a href="${SITE_URL}/espace-entreprise" class="cta-btn" target="_blank">
        Ouvrir mon Tableau de Bord Entreprise →
      </a>
    </div>

    <p style="font-size:13px; color:#64748b; margin-top:20px;">
      Compte exploitation associé : <strong>${email}</strong>
    </p>
  `;

  return {
    subject,
    html: getEmailLayout({ title: subject, preheader, contentHtml, trackingToken }),
  };
}

/**
 * 3. Email de Remerciement Paiement Abonnement ou Crédits Entreprise
 */
export function renderPaymentCompanyEmail({
  companyName,
  email,
  orderNumber,
  productName,
  amountEur,
  paidAt,
  credits,
  trackingToken,
}: {
  companyName: string;
  email: string;
  orderNumber: string;
  productName: string;
  amountEur: number;
  paidAt: string;
  credits?: number;
  trackingToken: string;
}): { subject: string; html: string } {
  const subject = `Confirmation de commande #${orderNumber} — ${productName} activé | TruckMatch`;
  const preheader = `Votre commande de ${amountEur.toFixed(2)} € est confirmée. Vos accès sont opérationnels.`;

  const contentHtml = `
    <div class="tag-pill" style="background-color:#fef3c7; color:#92400e;">PAIEMENT CONFIRMÉ • REÇU OFFICIEL</div>
    <h1 style="font-size:22px; font-weight:800; color:#0f172a; margin:0 0 16px 0; line-height:1.3;">
      Merci pour votre confiance, ${companyName} !
    </h1>

    <p>
      Nous vous confirmons la bonne réception de votre règlement. Vos accès et crédits ont été automatiquement débloqués sur votre compte.
    </p>

    <!-- Détail de la commande -->
    <div class="highlight-card" style="background-color:#ffffff; border:1px solid #cbd5e1;">
      <table style="width:100%; font-size:14px; color:#334155;" role="presentation">
        <tr>
          <td style="padding:6px 0; color:#64748b;">Numéro de commande :</td>
          <td style="padding:6px 0; text-align:right; font-weight:700; font-family:monospace; color:#0f172a;">${orderNumber}</td>
        </tr>
        <tr>
          <td style="padding:6px 0; color:#64748b;">Produit souscrit :</td>
          <td style="padding:6px 0; text-align:right; font-weight:700; color:#0f172a;">${productName}</td>
        </tr>
        <tr>
          <td style="padding:6px 0; color:#64748b;">Date de validation :</td>
          <td style="padding:6px 0; text-align:right; color:#0f172a;">${paidAt}</td>
        </tr>
        ${credits ? `
        <tr>
          <td style="padding:6px 0; color:#64748b;">Crédits déblocage profils :</td>
          <td style="padding:6px 0; text-align:right; font-weight:700; color:#059669;">+${credits} crédits</td>
        </tr>` : ''}
        <tr style="border-top:1px solid #e2e8f0;">
          <td style="padding:10px 0 0 0; font-weight:800; font-size:16px; color:#0f172a;">Montant réglé TTC :</td>
          <td style="padding:10px 0 0 0; text-align:right; font-weight:900; font-size:18px; color:#0284c7;">${amountEur.toFixed(2).replace('.', ',')} €</td>
        </tr>
      </table>
    </div>

    <div style="text-align:center; margin:28px 0;">
      <a href="${SITE_URL}/espace-entreprise" class="cta-btn" target="_blank">
        Consulter mes crédits & conducteurs →
      </a>
    </div>

    <p style="font-size:13px; color:#64748b; line-height:1.5;">
      Ce document tient lieu de justificatif de paiement. Une facture électronique détaillée est également disponible dans votre onglet <em>Facturation</em>.
    </p>
  `;

  return {
    subject,
    html: getEmailLayout({ title: subject, preheader, contentHtml, trackingToken }),
  };
}

/**
 * 4. Email de Remerciement Paiement Boost Visibilité Candidat 4,99 € (3 mois)
 */
export function renderPaymentDriverBoostEmail({
  driverName,
  email,
  orderNumber,
  amountEur = 4.99,
  paidAt,
  expiresAt,
  trackingToken,
}: {
  driverName: string;
  email: string;
  orderNumber: string;
  amountEur?: number;
  paidAt: string;
  expiresAt: string;
  trackingToken: string;
}): { subject: string; html: string } {
  const name = driverName ? driverName.trim() : "Conducteur";
  const subject = `Félicitations ${name} ! Votre Boost Visibilité est activé pour 3 mois (4,99 €)`;
  const preheader = "Votre profil est propulsé en 1ère position des recherches transporteurs.";

  const contentHtml = `
    <div class="tag-pill" style="background-color:#fef3c7; color:#b45309;">★ BOOST CANDIDAT 3 MOIS ACTIVÉ</div>
    <h1 style="font-size:22px; font-weight:800; color:#0f172a; margin:0 0 16px 0; line-height:1.3;">
      Félicitations ${name}, vous êtes en tête de liste !
    </h1>

    <p>
      Nous vous confirmons l'activation immédiate de votre <strong>Boost Visibilité Candidat</strong> sur TruckMatch pour un montant de <strong>${amountEur.toFixed(2).replace('.', ',')} € TTC</strong>.
    </p>

    <!-- Avantages activés -->
    <div class="highlight-card" style="background-color:#fefce8; border:1px solid #fde047;">
      <h3 style="margin:0 0 10px 0; font-size:15px; color:#854d0e;">Vos 4 avantages actifs dès maintenant :</h3>
      <ul style="margin:0; padding-left:18px; color:#713f12; font-size:14px; line-height:1.7;">
        <li>🥇 <strong>1er de Liste :</strong> Vous apparaissez en tête des résultats de recherche pour tous les transporteurs de votre secteur.</li>
        <li>⭐ <strong>Badge Candidat Premium :</strong> Un badge doré prestigieux met en valeur votre sérieux et votre profil.</li>
        <li>🛡️ <strong>Label Candidat Fiable :</strong> Vos permis (CE, C, FIMO, FCO) sont mis en avant avec priorité de confiance.</li>
        <li>⚡ <strong>Contact Direct Privilégié :</strong> Vos coordonnées sont suggérées aux exploitants dès qu'une tournée ou un CDI se libère.</li>
      </ul>
    </div>

    <!-- Récapitulatif -->
    <div class="highlight-card" style="background-color:#ffffff; border:1px solid #e2e8f0;">
      <table style="width:100%; font-size:13px; color:#334155;" role="presentation">
        <tr>
          <td style="padding:4px 0; color:#64748b;">Référence commande :</td>
          <td style="padding:4px 0; text-align:right; font-weight:700; font-family:monospace;">${orderNumber}</td>
        </tr>
        <tr>
          <td style="padding:4px 0; color:#64748b;">Formule :</td>
          <td style="padding:4px 0; text-align:right; font-weight:700;">Pack Visibilité Conducteur (3 Mois)</td>
        </tr>
        <tr>
          <td style="padding:4px 0; color:#64748b;">Date d'activation :</td>
          <td style="padding:4px 0; text-align:right;">${paidAt}</td>
        </tr>
        <tr>
          <td style="padding:4px 0; color:#64748b;">Valable jusqu'au :</td>
          <td style="padding:4px 0; text-align:right; font-weight:700; color:#059669;">${expiresAt}</td>
        </tr>
        <tr style="border-top:1px solid #f1f5f9;">
          <td style="padding:8px 0 0 0; font-weight:700; color:#0f172a;">Total réglé TTC :</td>
          <td style="padding:8px 0 0 0; text-align:right; font-weight:900; font-size:16px; color:#d97706;">${amountEur.toFixed(2).replace('.', ',')} €</td>
        </tr>
      </table>
    </div>

    <div style="text-align:center; margin:28px 0;">
      <a href="${SITE_URL}/espace-candidat" class="cta-btn cta-btn-emerald" target="_blank">
        Voir mon profil boosté en direct →
      </a>
    </div>

    <p style="font-size:12px; color:#64748b; text-align:center;">
      Paiement unique sans reconduction tacite ni prélèvement automatique ultérieur.
    </p>
  `;

  return {
    subject,
    html: getEmailLayout({ title: subject, preheader, contentHtml, trackingToken }),
  };
}

/**
 * 5. Notification Candidat : Nouveau message reçu dans son espace candidat
 */
export function renderNewSupportMessageEmail({
  driverName,
  messagePreview,
  senderName = "L'équipe Support TruckMatch",
  trackingToken,
}: {
  driverName: string;
  messagePreview: string;
  senderName?: string;
  trackingToken: string;
}): { subject: string; html: string } {
  const name = driverName ? driverName.trim() : "Conducteur";
  const subject = `💬 Nouveau message de TruckMatch sur votre espace candidat`;
  const preheader = `${senderName} vous a envoyé un nouveau message dans votre espace personnel.`;

  // Tronquer proprement le preview s'il est très long
  const cleanPreview = messagePreview.length > 280
    ? messagePreview.substring(0, 277) + "..."
    : messagePreview;

  const contentHtml = `
    <div class="tag-pill" style="background-color:#e0f2fe; color:#0369a1;">
      💬 SUPPORT & EXPLOITATION TRUCKMATCH
    </div>

    <h1 style="font-size:22px; font-weight:800; color:#0f172a; margin:0 0 16px 0; line-height:1.3;">
      Bonjour ${name}, vous avez reçu un nouveau message !
    </h1>

    <p style="margin:0 0 16px 0; font-size:15px; color:#334155;">
      <strong>${senderName}</strong> vient de vous écrire directement dans votre espace candidat TruckMatch :
    </p>

    <!-- Message Quoted Card -->
    <div style="background-color:#f8fafc; border-left:4px solid #0284c7; border-top:1px solid #e2e8f0; border-right:1px solid #e2e8f0; border-bottom:1px solid #e2e8f0; border-radius:8px; padding:18px 20px; margin:20px 0;">
      <div style="font-size:12px; font-weight:700; color:#0284c7; text-transform:uppercase; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
        ✉️ Message reçu :
      </div>
      <div style="font-size:15px; color:#1e293b; line-height:1.6; white-space:pre-wrap; font-style:italic;">
        "${cleanPreview}"
      </div>
    </div>

    <p style="margin:0 0 20px 0; font-size:14px; color:#64748b;">
      Vous pouvez consulter l'historique complet et répondre directement depuis votre cockpit chauffeur en un clic.
    </p>

    <div style="text-align:center; margin:26px 0;">
      <a href="${SITE_URL}/espace-candidat?tab=messages" class="cta-btn" target="_blank" style="padding:14px 32px; font-size:15px; font-weight:800; background-color:#0284c7; color:#ffffff !important; border-radius:8px; text-decoration:none; display:inline-block; box-shadow:0 4px 12px rgba(2, 132, 199, 0.25);">
        Accéder à ma messagerie & Répondre →
      </a>
    </div>

    <div class="highlight-card" style="background-color:#f0fdf4; border:1px solid #bbf7d0; margin-top:24px;">
      <div style="font-size:13px; color:#166534; line-height:1.5;">
        🔒 <strong>Échanges 100% sécurisés :</strong> Vos échanges sont confidentiels et archivés directement sur votre espace TruckMatch sans divulgation de vos coordonnées personnelles non consenties.
      </div>
    </div>
  `;

  return {
    subject,
    html: getEmailLayout({ title: subject, preheader, contentHtml, trackingToken }),
  };
}

/**
 * 6. Email de présentation de candidature transmis à l'entreprise / recruteur
 */
export function renderCandidateApplicationEmail({
  companyName,
  jobTitle,
  candidateName,
  candidateEmail,
  candidatePhone,
  candidateCity,
  permits = [],
  fimo = false,
  fco = false,
  chronoCard = false,
  experience = "",
  message = "",
  resumeUrl,
  trackingToken,
}: {
  companyName: string;
  jobTitle: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  candidateCity?: string;
  permits?: string[];
  fimo?: boolean;
  fco?: boolean;
  chronoCard?: boolean;
  experience?: string;
  message?: string;
  resumeUrl?: string;
  trackingToken: string;
}): { subject: string; html: string } {
  const cleanName = candidateName ? candidateName.trim() : "Un conducteur routier";
  const permitBadges = permits.length > 0 ? permits.join(", ") : "Non spécifié";
  const subject = `🚚 Candidature Chauffeur : ${cleanName} (${permitBadges}) pour ${jobTitle}`;
  const preheader = `Nouvelle candidature qualifiée transmise via TruckMatch pour votre offre ${jobTitle}`;

  const cleanMessage = message ? message.trim() : "";

  const contentHtml = `
    <div class="tag-pill" style="background-color:#ecfdf5; color:#047857; border:1px solid #a7f3d0;">
      ✨ NOUVELLE CANDIDATURE TRUCKMATCH
    </div>

    <h1 style="font-size:22px; font-weight:800; color:#0f172a; margin:0 0 14px 0; line-height:1.3;">
      Nouvelle candidature pour : <span style="color:#0284c7;">${jobTitle}</span>
    </h1>

    <p style="margin:0 0 18px 0; font-size:15px; color:#334155; line-height:1.5;">
      Bonjour <strong>${companyName}</strong>,<br>
      Un conducteur routier disponible vient de postuler directement à votre opportunité via la plateforme <strong>TruckMatch</strong>. Voici la synthèse de son profil :
    </p>

    <!-- Fiche Conducteur Qualifiée -->
    <div style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:20px; margin:20px 0;">
      <table style="width:100%; border-collapse:collapse;">
        <tr>
          <td style="padding:6px 0; font-size:13px; color:#64748b; width:130px;">Candidat :</td>
          <td style="padding:6px 0; font-size:15px; font-weight:700; color:#0f172a;">${cleanName}</td>
        </tr>
        <tr>
          <td style="padding:6px 0; font-size:13px; color:#64748b;">Localisation :</td>
          <td style="padding:6px 0; font-size:14px; font-weight:600; color:#1e293b;">${candidateCity || "France"}</td>
        </tr>
        <tr>
          <td style="padding:6px 0; font-size:13px; color:#64748b;">Permis détenus :</td>
          <td style="padding:6px 0; font-size:14px; font-weight:700; color:#0284c7;">${permitBadges}</td>
        </tr>
        <tr>
          <td style="padding:6px 0; font-size:13px; color:#64748b;">Expérience :</td>
          <td style="padding:6px 0; font-size:14px; font-weight:600; color:#1e293b;">${experience || "Expérimenté"}</td>
        </tr>
        <tr>
          <td style="padding:6px 0; font-size:13px; color:#64748b;">Conformité FIMO/FCO :</td>
          <td style="padding:6px 0; font-size:14px; font-weight:600; color:#059669;">
            ${fimo || fco ? "✅ FIMO/FCO Marchandises à jour" : "À vérifier lors de l'entretien"}
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0; font-size:13px; color:#64748b;">Carte conducteur :</td>
          <td style="padding:6px 0; font-size:14px; font-weight:600; color:#059669;">
            ${chronoCard ? "✅ Carte chrononumérique valide" : "À vérifier"}
          </td>
        </tr>
      </table>

      ${cleanMessage ? `
      <div style="margin-top:16px; padding-top:14px; border-top:1px dashed #cbd5e1;">
        <div style="font-size:12px; font-weight:700; color:#475569; text-transform:uppercase; margin-bottom:6px;">Mot du candidat :</div>
        <div style="font-size:14px; color:#1e293b; font-style:italic; line-height:1.5;">"${cleanMessage}"</div>
      </div>
      ` : ""}
    </div>

    <!-- Contact Direct Rapide -->
    <div style="background-color:#f0fdf4; border:1px solid #86efac; border-radius:10px; padding:18px 20px; margin:20px 0; text-align:center;">
      <p style="margin:0 0 12px 0; font-size:14px; font-weight:700; color:#166534;">
        📞 Contact direct avec le candidat :
      </p>
      <div style="display:flex; justify-content:center; gap:16px; flex-wrap:wrap; text-align:center;">
        <a href="tel:${candidatePhone}" style="padding:12px 24px; font-size:15px; font-weight:800; background-color:#16a34a; color:#ffffff !important; border-radius:8px; text-decoration:none; display:inline-block; margin:4px;">
          Appeler : ${candidatePhone}
        </a>
        <a href="mailto:${candidateEmail}?subject=Suite à votre candidature TruckMatch - ${encodeURIComponent(jobTitle)}" style="padding:12px 24px; font-size:15px; font-weight:800; background-color:#0284c7; color:#ffffff !important; border-radius:8px; text-decoration:none; display:inline-block; margin:4px;">
          Répondre par email (${candidateEmail})
        </a>
      </div>
      ${resumeUrl ? `
      <div style="margin-top:14px;">
        <a href="${resumeUrl}" target="_blank" style="font-size:13px; font-weight:700; color:#0369a1; text-decoration:underline;">
          📄 Télécharger le CV du conducteur
        </a>
      </div>
      ` : ""}
    </div>

    <!-- Présentation TruckMatch -->
    <div class="highlight-card" style="background-color:#f8fafc; border:1px solid #cbd5e1; margin-top:24px;">
      <div style="font-size:13px; color:#475569; line-height:1.5;">
        🚛 <strong>Transmis gratuitement par TruckMatch :</strong> La plateforme française dédiée au recrutement et à la mise en relation directe des professionnels du transport routier. Recrutez vos prochains conducteurs qualifiés sur <a href="${SITE_URL}" style="color:#0284c7; font-weight:700;">truckmatch.fr</a>.
      </div>
    </div>
  `;

  return {
    subject,
    html: getEmailLayout({ title: subject, preheader, contentHtml, trackingToken }),
  };
}

/**
 * 7. Email d'accusé de réception pour le candidat
 */
export function renderCandidateApplicationReceiptEmail({
  candidateName,
  jobTitle,
  companyName,
  destinationEmail,
  trackingToken,
}: {
  candidateName: string;
  jobTitle: string;
  companyName: string;
  destinationEmail?: string;
  trackingToken: string;
}): { subject: string; html: string } {
  const cleanName = candidateName ? candidateName.trim() : "Conducteur";
  const subject = `✅ Candidature transmise avec succès à ${companyName}`;
  const preheader = `Votre candidature pour le poste de ${jobTitle} a bien été remise à ${companyName}`;

  const contentHtml = `
    <div class="tag-pill" style="background-color:#ecfdf5; color:#047857; border:1px solid #a7f3d0;">
      ✅ CANDIDATURE CONFIRMÉE
    </div>

    <h1 style="font-size:22px; font-weight:800; color:#0f172a; margin:0 0 16px 0; line-height:1.3;">
      Bravo ${cleanName}, votre candidature est envoyée !
    </h1>

    <p style="margin:0 0 16px 0; font-size:15px; color:#334155; line-height:1.5;">
      Votre profil et vos coordonnées ont été transmis avec succès au service recrutement de <strong>${companyName}</strong> pour l'offre :
    </p>

    <div style="background-color:#f8fafc; border-left:4px solid #10b981; border-radius:6px; padding:14px 18px; margin:18px 0;">
      <div style="font-size:15px; font-weight:700; color:#0f172a;">${jobTitle}</div>
      <div style="font-size:13px; color:#64748b; margin-top:4px;">Entreprise : ${companyName}</div>
    </div>

    <p style="margin:0 0 16px 0; font-size:14px; color:#475569; line-height:1.5;">
      Le recruteur dispose désormais de votre numéro de téléphone et de votre synthèse de compétences. Si votre profil correspond aux tournées prévues, il vous contactera directement par téléphone ou email.
    </p>

    <div style="text-align:center; margin:26px 0;">
      <a href="${SITE_URL}/espace-candidat" class="cta-btn" target="_blank" style="padding:14px 32px; font-size:15px; font-weight:800; background-color:#10b981; color:#ffffff !important; border-radius:8px; text-decoration:none; display:inline-block;">
        Accéder à mon espace candidat →
      </a>
    </div>

    <div class="highlight-card" style="background-color:#f0fdf4; border:1px solid #bbf7d0; margin-top:20px;">
      <div style="font-size:13px; color:#166534; line-height:1.5;">
        💡 <strong>Conseil TruckMatch :</strong> Gardez votre téléphone à portée de main durant les jours ouvrés et vérifiez que votre répondeur est accueillant pour maximiser vos chances d'embauche !
      </div>
    </div>
  `;

  return {
    subject,
    html: getEmailLayout({ title: subject, preheader, contentHtml, trackingToken }),
  };
}


