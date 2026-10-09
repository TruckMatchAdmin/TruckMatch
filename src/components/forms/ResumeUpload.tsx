"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, X, Loader2, AlertCircle, Sparkles } from "lucide-react";

interface ResumeUploadProps {
  onUploadSuccess: (url: string, fileName: string) => void;
  onRemove: () => void;
  currentFileName?: string;
  currentUrl?: string;
  required?: boolean;
  hasError?: boolean;
}

export function ResumeUpload({
  onUploadSuccess,
  onRemove,
  currentFileName,
  currentUrl,
  required = true,
  hasError = false,
}: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    url: string;
    size?: number;
  } | null>(
    currentUrl && currentFileName
      ? { name: currentFileName, url: currentUrl }
      : null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024 * 1024) {
      return `(${(bytes / 1024).toFixed(1)} Ko)`;
    }
    return `(${(bytes / (1024 * 1024)).toFixed(1)} Mo)`;
  };

  const handleFileProcess = async (file: File) => {
    setError(null);

    // Vérification taille (10 Mo)
    if (file.size > 10 * 1024 * 1024) {
      setError("Le fichier dépasse 10 Mo. Veuillez sélectionner un fichier plus léger.");
      return;
    }

    // Vérification format
    const validExtensions = [".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!validExtensions.includes(ext)) {
      setError("Format non accepté. Les formats acceptés sont PDF, DOC, DOCX, PNG et JPG.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/resume", {
        method: "POST",
        body: formData,
      });

      let data: any = null;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          data = await res.json();
        } catch {
          data = null;
        }
      }

      if (!res.ok) {
        if (res.status === 413) {
          throw new Error("Le fichier est trop volumineux pour le serveur (maximum 10 Mo).");
        }
        throw new Error(
          data?.error || `Erreur serveur (${res.status}). Veuillez réessayer avec un fichier plus léger ou contacter le support.`
        );
      }

      if (!data) {
        throw new Error("Réponse inattendue du serveur lors de l'envoi.");
      }

      setUploadedFile({
        name: data.fileName || file.name,
        url: data.url,
        size: data.fileSize || file.size,
      });

      onUploadSuccess(data.url, data.fileName || file.name);
    } catch (err: any) {
      setError(err.message || "Erreur de connexion.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onRemove();
  };

  return (
    <div className="resume-upload-wrapper">
      <div className="resume-upload-header">
        <div className="resume-label-row">
          <label className="resume-label-title" htmlFor="resume-file-input">
            <span className="resume-label-icon">
              <FileText size={18} />
            </span>
            <span>Déposer mon CV (Curriculum Vitae)</span>
            {required && <span className="required-star">*</span>}
          </label>
          <span className="badge-required-pill">
            Obligatoire
          </span>
        </div>
        <p className="helper-text-pro">
          Le dépôt de votre CV est obligatoire pour permettre aux recruteurs de consulter vos expériences, vos tournées et vos habilitations.
        </p>
      </div>

      <input
        id="resume-file-input"
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        style={{ display: "none" }}
      />

      {/* État : Fichier téléversé */}
      {uploadedFile ? (
        <div className="resume-uploaded-card">
          <div className="resume-uploaded-left">
            <div className="resume-file-icon">
              <FileText size={24} />
            </div>
            <div className="resume-file-info">
              <div className="resume-file-name-row">
                <span className="resume-file-name">{uploadedFile.name}</span>
                <span className="resume-file-size">{formatSize(uploadedFile.size)}</span>
              </div>
              <div className="resume-file-status">
                <CheckCircle2 size={14} className="text-success" />
                <span>CV enregistré et prêt à être transmis</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="resume-remove-btn"
            title="Supprimer ce CV"
            aria-label="Supprimer ce CV"
          >
            <X size={16} />
            <span>Changer de fichier</span>
          </button>
        </div>
      ) : (
        /* État : Zone de dépôt Drag & Drop */
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`resume-dropzone ${isDragging ? "resume-dropzone-dragging" : ""} ${uploading ? "resume-dropzone-uploading" : ""} ${hasError ? "resume-dropzone-error" : ""}`}
        >
          {uploading ? (
            <div className="dropzone-loading">
              <Loader2 size={32} className="animate-spin text-primary" />
              <div className="font-bold text-sm text-navy mt-2">Téléversement de votre CV en cours...</div>
              <div className="text-xs text-muted">Stockage sécurisé sur les serveurs TruckMatch</div>
            </div>
          ) : (
            <>
              <div className="dropzone-icon-wrap">
                <UploadCloud size={28} className="text-primary" />
              </div>
              <div className="dropzone-content">
                <div className="dropzone-main-text">
                  <strong>Glissez-déposez votre CV ici</strong> ou <span className="dropzone-link">cliquez pour parcourir</span>
                </div>
                <div className="dropzone-sub-text">
                  Formats acceptés : PDF, Word (.doc, .docx) ou Image (.png, .jpg) • Max 10 Mo
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <div className="resume-error-pill">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
