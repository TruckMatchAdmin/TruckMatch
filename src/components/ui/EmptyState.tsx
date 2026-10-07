import React from "react";
import Link from "next/link";
import { LucideIcon, Search, UserPlus } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  secondaryActionText?: string;
  secondaryActionHref?: string;
}

export function EmptyState({
  icon: Icon = Search,
  title,
  description,
  actionText = "Créer mon profil",
  actionHref = "/chauffeurs",
  secondaryActionText,
  secondaryActionHref,
}: EmptyStateProps) {
  return (
    <div className="empty-state-box">
      <div className="empty-state-icon-wrapper">
        <Icon size={32} className="empty-state-icon" />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      <div className="empty-state-actions">
        {actionText && actionHref && (
          <Link href={actionHref} className="btn btn-primary">
            <UserPlus size={18} />
            <span>{actionText}</span>
          </Link>
        )}
        {secondaryActionText && secondaryActionHref && (
          <Link href={secondaryActionHref} className="btn btn-outline">
            <span>{secondaryActionText}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
