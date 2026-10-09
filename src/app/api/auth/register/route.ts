import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// Regex pour valider un numéro français strict à 10 chiffres (ex: 0612345678 ou 06 12 34 56 78)
const PHONE_REGEX = /^0[1-9][0-9]{8}$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      type, // 'driver' | 'company'
      // Driver fields
      firstName,
      lastName,
      email,
      phone,
      birthDate,
      address,
      postalCode,
      city,
      department,
      latitude,
      longitude,
      permits,
      fimo,
      fco,
      chronoCard,
      adr,
      caces,
      specialties,
      experience,
      missionType,
      availability,
      resumeUrl,
      resumeName,
      // Company fields
      siret,
      companyName,
      contactFirstName,
      contactLastName,
      contactRole,
      nafCode,
      tvaNumber,
      fleetSize,
      targetDrivers,
    } = body;

    // Normalisation du téléphone (nettoyage des espaces, tirets, points)
    const cleanPhone = (phone || "").replace(/[\s\.\-_]/g, "");

    if (!cleanPhone || !PHONE_REGEX.test(cleanPhone)) {
      return NextResponse.json(
        { error: "Le numéro de téléphone doit comporter exactement 10 chiffres (ex: 0612345678)." },
        { status: 400 }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Veuillez fournir une adresse email valide." },
        { status: 400 }
      );
    }

    // ==========================================
    // INSCRIPTION CHAUFFEUR
    // ==========================================
    if (type === "driver") {
      if (!firstName || !lastName) {
        return NextResponse.json(
          { error: "Le prénom et le nom sont obligatoires." },
          { status: 400 }
        );
      }

      if (!birthDate) {
        return NextResponse.json(
          { error: "La date de naissance est obligatoire." },
          { status: 400 }
        );
      }

      // Vérification majorité (18 ans révolus)
      const birth = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      if (age < 18) {
        return NextResponse.json(
          { error: "Vous devez avoir au moins 18 ans pour vous inscrire comme conducteur routier." },
          { status: 400 }
        );
      }

      if (!address || !postalCode || !city) {
        return NextResponse.json(
          { error: "L'adresse complète avec code postal et ville est obligatoire." },
          { status: 400 }
        );
      }

      if (!resumeUrl) {
        return NextResponse.json(
          { error: "Le dépôt de votre CV est obligatoire pour valider votre inscription de candidat." },
          { status: 400 }
        );
      }

      const { data, error } = await supabase.from("drivers").insert([
        {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim().toLowerCase(),
          phone: cleanPhone,
          birth_date: birthDate,
          address: address.trim(),
          postal_code: postalCode.trim(),
          city: city.trim(),
          department: department || null,
          latitude: latitude || null,
          longitude: longitude || null,
          permits: permits || [],
          fimo: Boolean(fimo),
          fco: Boolean(fco),
          chrono_card: Boolean(chronoCard),
          adr: adr || [],
          caces: caces || [],
          specialties: specialties || [],
          experience: experience || "1-3",
          mission_type: missionType || [],
          availability: availability || "immediate",
          resume_url: resumeUrl || null,
          resume_name: resumeName || null,
        },
      ]).select();

      if (error) {
        if (error.code === "23505") {
          return NextResponse.json(
            { error: "Un compte avec cette adresse email existe déjà sur TruckMatch." },
            { status: 409 }
          );
        }
        console.error("Supabase driver insert error:", error);
        return NextResponse.json(
          { error: "Erreur lors de l'enregistrement de votre profil chauffeur : " + error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Profil chauffeur créé avec succès !",
        data: data?.[0],
      });
    }

    // ==========================================
    // INSCRIPTION ENTREPRISE
    // ==========================================
    if (type === "company") {
      const cleanSiret = (siret || "").replace(/[\s\.\-_]/g, "");
      if (!cleanSiret || cleanSiret.length !== 14 || !/^\d{14}$/.test(cleanSiret)) {
        return NextResponse.json(
          { error: "Le numéro SIRET doit contenir exactement 14 chiffres (recherche gouvernementale)." },
          { status: 400 }
        );
      }

      if (!companyName) {
        return NextResponse.json(
          { error: "La raison sociale de l'entreprise est obligatoire." },
          { status: 400 }
        );
      }

      if (!contactFirstName || !contactLastName) {
        return NextResponse.json(
          { error: "Le nom et prénom du responsable sont obligatoires." },
          { status: 400 }
        );
      }

      if (!address || !postalCode || !city) {
        return NextResponse.json(
          { error: "L'adresse du siège/établissement est obligatoire." },
          { status: 400 }
        );
      }

      const { data, error } = await supabase.from("companies").insert([
        {
          siret: cleanSiret,
          company_name: companyName.trim(),
          contact_first_name: contactFirstName.trim(),
          contact_last_name: contactLastName.trim(),
          contact_role: contactRole || "Dirigeant / Exploitation",
          email: email.trim().toLowerCase(),
          phone: cleanPhone,
          address: address.trim(),
          postal_code: postalCode.trim(),
          city: city.trim(),
          naf_code: nafCode || null,
          tva_number: tvaNumber || null,
          fleet_size: fleetSize || "1-5",
          target_drivers: targetDrivers || [],
        },
      ]).select();

      if (error) {
        if (error.code === "23505") {
          return NextResponse.json(
            { error: "Une entreprise avec ce SIRET ou cet email est déjà enregistrée." },
            { status: 409 }
          );
        }
        console.error("Supabase company insert error:", error);
        return NextResponse.json(
          { error: "Erreur lors de l'enregistrement de l'entreprise : " + error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Compte entreprise créé avec succès !",
        data: data?.[0],
      });
    }

    return NextResponse.json(
      { error: "Type d'inscription invalide (doit être 'driver' ou 'company')." },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Register API error:", err);
    return NextResponse.json(
      { error: "Une erreur inattendue est survenue lors de l'inscription." },
      { status: 500 }
    );
  }
}
