"use client";

import React, { useState } from "react";
import { 
  Globe, 
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CredentialIconProps {
  credential: { title: string; websiteUrl?: string; logoUrl?: string | null };
  className?: string;
  size?: number;
}

function inferDomain(title: string, url?: string): string {
  if (url) {
    try {
      const u = new URL(url.startsWith('http') ? url : "https://" + url);
      return u.hostname.replace(/^www\./, '').toLowerCase();
    } catch {
      // fallback to title logic
    }
  }

  const t = title.toLowerCase().trim();
  
  if (t.includes("gmail") || t.includes("google")) return "google.com";
  if (t.includes("outlook") || t.includes("hotmail") || t.includes("microsoft")) return "microsoft.com";
  if (t.includes("yahoo")) return "yahoo.com";
  if (t.includes("github")) return "github.com";
  if (t.includes("gitlab")) return "gitlab.com";
  if (t.includes("apple") || t.includes("icloud")) return "apple.com";
  if (t.includes("facebook") || t.includes("meta")) return "facebook.com";
  if (t.includes("twitter") || t.includes("x.com") || t.includes("twitter.com")) return "x.com";
  if (t.includes("linkedin")) return "linkedin.com";
  if (t.includes("amazon") || t.includes("aws")) return "amazon.com";
  if (t.includes("netflix")) return "netflix.com";
  if (t.includes("spotify")) return "spotify.com";
  if (t.includes("slack")) return "slack.com";
  if (t.includes("discord")) return "discord.com";
  if (t.includes("figma")) return "figma.com";
  if (t.includes("trello")) return "trello.com";
  if (t.includes("jira") || t.includes("atlassian")) return "atlassian.com";
  if (t.includes("paypal")) return "paypal.com";
  if (t.includes("stripe")) return "stripe.com";
  if (t.includes("reddit")) return "reddit.com";
  if (t.includes("instagram")) return "instagram.com";
  if (t.includes("tiktok")) return "tiktok.com";

  return "";
}

export function CredentialIcon({ credential, className, size = 16 }: CredentialIconProps) {
  const [imgError, setImgError] = useState(false);
  const domain = inferDomain(credential.title, credential.websiteUrl);

  const containerStyle = cn(
    "flex items-center justify-center shrink-0 rounded-md bg-muted text-muted-foreground overflow-hidden",
    className
  );

  if (credential.logoUrl && !imgError) {
    return (
      <div className={containerStyle} style={{ width: size + 16, height: size + 16 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={credential.logoUrl}
          alt={credential.title + " logo"}
          className="object-contain"
          style={{ width: size, height: size }}
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  if (domain && !imgError) {
    return (
      <div className={containerStyle} style={{ width: size + 16, height: size + 16 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={"https://s2.googleusercontent.com/s2/favicons?domain=" + domain + "&sz=128"}
          alt={domain + " icon"}
          className="object-contain"
          style={{ width: size, height: size }}
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div className={containerStyle} style={{ width: size + 16, height: size + 16 }}>
      {domain ? <Globe size={size} /> : <Lock size={size} />}
    </div>
  );
}
