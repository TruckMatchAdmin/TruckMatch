"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreerOffreRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/espace-entreprise?tab=create-job");
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060b13",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#38bdf8",
        fontFamily: "inherit",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div
          style={{
            width: 18,
            height: 18,
            border: "2px solid #38bdf8",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>
          Redirection vers la page dédiée de publication d&apos;offre...
        </span>
      </div>
    </div>
  );
}
