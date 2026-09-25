"use client";

import React, { useState } from "react";
import { 
  Globe, 
  Code,
  Users, 
  Briefcase, 
  Mail, 
  CreditCard, 
  Server, 
  Gamepad2,
  PenTool,
  Layout,
  MessageSquare,
  Database,
  Cloud,
  Lock,
  Smartphone
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SecureIconProps {
  secureItem: { title: string; websiteUrl?: string; logoUrl?: string | null };
  className?: string;
  size?: number;
}

function getDomain(url?: string): string {
  if (!url) return "";
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return "";
  }
}

function getLucideIcon(title: string, url?: string) {
  const t = title.toLowerCase();
  const d = getDomain(url);
  const match = `${t} ${d}`;

  if (match.includes("github") || match.includes("gitlab")) return Code;
  if (match.includes("twitter") || match.includes("x.com")) return MessageSquare;
  if (match.includes("facebook") || match.includes("meta")) return Users;
  if (match.includes("linkedin")) return Briefcase;
  if (match.includes("mail") || match.includes("gmail") || match.includes("outlook") || match.includes("yahoo")) return Mail;
  if (match.includes("bank") || match.includes("card") || match.includes("paypal") || match.includes("stripe")) return CreditCard;
  if (match.includes("aws") || match.includes("server") || match.includes("host") || match.includes("digitalocean")) return Server;
  if (match.includes("game") || match.includes("steam") || match.includes("xbox") || match.includes("epic")) return Gamepad2;
  if (match.includes("figma")) return PenTool;
  if (match.includes("trello") || match.includes("jira")) return Layout;
  if (match.includes("slack") || match.includes("discord")) return MessageSquare;
  if (match.includes("db") || match.includes("database") || match.includes("mongo") || match.includes("sql")) return Database;
  if (match.includes("cloud") || match.includes("azure") || match.includes("gcp")) return Cloud;
  if (match.includes("apple") || match.includes("icloud") || match.includes("phone")) return Smartphone;

  return null;
}

export function SecureIcon({ secureItem, className, size = 16 }: SecureIconProps) {
  const [imgError, setImgError] = useState(false);
  const domain = getDomain(secureItem.websiteUrl);

  const containerStyle = cn(
    "flex items-center justify-center shrink-0 rounded-md bg-muted text-muted-foreground",
    className
  );

  // 1. If custom logo URL is provided and hasn't errored
  if (secureItem.logoUrl && !imgError) {
    return (
      <div className={containerStyle} style={{ width: size + 16, height: size + 16 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={secureItem.logoUrl}
          alt={`${secureItem.title} logo`}
          className="rounded-sm object-contain"
          style={{ width: size, height: size }}
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // 2. Map to common Lucide icons
  const MappedIcon = getLucideIcon(secureItem.title, secureItem.websiteUrl);
  if (MappedIcon) {
    return (
      <div className={containerStyle} style={{ width: size + 16, height: size + 16 }}>
        <MappedIcon size={size} />
      </div>
    );
  }

  // 3. Fallback to Google Favicon if domain exists and hasn't errored
  if (domain && !imgError) {
    return (
      <div className={containerStyle} style={{ width: size + 16, height: size + 16 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://s2.googleusercontent.com/s2/favicons?domain=${domain}&sz=${size * 2}`}
          alt={`${domain} icon`}
          className="rounded-sm object-contain"
          style={{ width: size, height: size }}
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // 4. Ultimate fallback
  return (
    <div className={containerStyle} style={{ width: size + 16, height: size + 16 }}>
      {domain ? <Globe size={size} /> : <Lock size={size} />}
    </div>
  );
}

