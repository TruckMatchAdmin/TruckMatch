/**
 * Modèles d'emails HTML professionnels TruckMatch
 * Conçus sur fond blanc pur (#ffffff) pour faire ressortir le logo officiel
 */

export interface EmailTrackingPayload {
  trackingId: string;
  recipientEmail: string;
  emailType: "welcome_driver" | "welcome_company" | "payment_subscription" | "payment_driver_boost";
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
