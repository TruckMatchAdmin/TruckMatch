import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/auth/session";

if (typeof globalThis.WebSocket === "undefined") {
  (globalThis as any).WebSocket = class DummyWebSocket {};
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azxwqcdnwkolodxwsqoq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function POST(request: Request) {
  try {
    const session = getSession(request);
    if (!session || (session.role !== "company" && session.role !== "admin")) {
      return NextResponse.json({ error: "Accès refusé. Connexion entreprise requise." }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const mediaType = formData.get("type") as string || "media"; // "logo" ou "cover"

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier d'image reçu." }, { status: 400 });
    }

    // Limite de taille : 8 Mo
    const MAX_SIZE = 8 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "L'image dépasse la taille maximale de 8 Mo. Veuillez choisir une image plus légère." },
        { status: 400 }
      );
    }

    // Types autorisés : Images PNG, JPEG, WEBP, SVG
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format non supporté. Veuillez envoyer une image JPG, PNG, WEBP ou SVG." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const filePath = `${mediaType}_${Date.now()}_${sanitizedName}`;

    // Tenter l'upload dans le bucket 'company-media'
    let bucketName = "company-media";
    let { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    // En cas d'erreur sur le bucket 'company-media', fallback sur le bucket 'resumes' qui est public
    if (error) {
      bucketName = "resumes";
      const fallbackUpload = await supabaseAdmin.storage
        .from(bucketName)
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: true,
        });
      error = fallbackUpload.error;
    }

    if (error) {
      console.error("Storage upload error:", error);
      return NextResponse.json(
        { error: "Erreur lors de l'enregistrement de l'image : " + error.message },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      fileName: file.name,
      fileSize: file.size,
      mediaType,
    });
  } catch (err: any) {
    console.error("Company media upload error:", err);
    return NextResponse.json(
      { error: "Erreur lors du téléchargement : " + err.message },
      { status: 500 }
    );
  }
}
