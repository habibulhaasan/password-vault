"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Cpu, Key, Lock, Database, EyeOff } from "lucide-react";

export function SecuritySpecsCard() {
  const specs = [
    {
      label: "Encryption Cipher",
      value: "AES-GCM 256-bit",
      description: "Authenticated encryption with fresh 12-byte random IV per record",
      icon: Lock,
    },
    {
      label: "Key Derivation Function",
      value: "PBKDF2-HMAC-SHA-256",
      description: "600,000 rounds with 16-byte cryptographically secure salt",
      icon: Cpu,
    },
    {
      label: "Vault Key Storage",
      value: "Volatile RAM Only",
      description: "Non-extractable CryptoKey purged upon lock or tab closure",
      icon: Key,
    },
    {
      label: "Decryption Verification",
      value: "Canary Auth Token",
      description: "Authenticates master password without decrypting stored credentials",
      icon: EyeOff,
    },
    {
      label: "Zero-Knowledge Database",
      value: "Encrypted at Rest",
      description: "Firebase/Firestore only ever holds ciphertext; plaintext never transmits",
      icon: Database,
    },
  ];

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                Cryptographic Architecture
              </CardTitle>
              <CardDescription className="text-xs">
                Zero-Knowledge specification and cryptographic guarantees
              </CardDescription>
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px]"
          >
            Zero-Knowledge Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border/60">
          {specs.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="py-3 first:pt-0 last:pb-0 flex items-start gap-3"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground shrink-0 mt-0.5">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5">
                    <span className="text-xs font-medium text-foreground">
                      {item.label}
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-primary">
                      {item.value}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

