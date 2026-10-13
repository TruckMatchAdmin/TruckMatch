import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  sendWelcomeDriverEmail,
  sendWelcomeCompanyEmail,
  sendPaymentCompanyEmail,
  sendPaymentDriverBoostEmail,
  verifySmtpConnection,
} from "@/lib/email/mailer";

export async function POST(request: Request) {
  try {
    const session = getSession(request);
    // Autoriser l'administrateur ou requête directe
    const body = await request.json().catch(() => ({}));
    const { type = "all", to = "jobs@truckmatch.fr" } = body;

    // 1. Vérifier la connexion SMTP
    const smtpCheck = await verifySmtpConnection();
    if (!smtpCheck.ok) {
      return NextResponse.json(
        { error: "Échec de connexion SMTP OVH : " + smtpCheck.message },
        { status: 500 }
      );
    }

    const results: Record<string, any> = {};

    if (type === "welcome_driver" || type === "all") {
      results.welcome_driver = await sendWelcomeDriverEmail({
        email: to,
        firstName: "Gabin (Conducteur Test)",
      });
    }

    if (type === "welcome_company" || type === "all") {
      results.welcome_company = await sendWelcomeCompanyEmail({
        email: to,
        companyName: "Transports Test SAS",
        contactName: "Gabin (Directeur)",
      });
    }

    if (type === "payment_subscription" || type === "all") {
      results.payment_subscription = await sendPaymentCompanyEmail({
        email: to,
        companyName: "Transports Test SAS",
        orderNumber: `CMD-${Date.now().toString(36).toUpperCase()}`,
        productName: "Abonnement Pro Illimité",
        amountEur: 99.0,
        credits: 25,
      });
    }

    if (type === "payment_driver_boost" || type === "all") {
      results.payment_driver_boost = await sendPaymentDriverBoostEmail({
        email: to,
        driverName: "Gabin (Chauffeur SPL)",
        orderNumber: `BST-${Date.now().toString(36).toUpperCase()}`,
        amountEur: 4.99,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Emails de test envoyés avec succès à ${to} via OVH SMTP.`,
      smtp: smtpCheck,
      results,
    });
  } catch (err: any) {
    console.error("Test email error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  const check = await verifySmtpConnection();
  return NextResponse.json({
    smtpHost: process.env.SMTP_HOST || "ssl0.ovh.net",
    smtpUser: process.env.SMTP_USER || "jobs@truckmatch.fr",
    status: check.ok ? "connecté" : "erreur",
    message: check.message,
  });
}
