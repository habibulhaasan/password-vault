# Password Vault 🔒

A highly secure, zero-knowledge personal password manager built with **Next.js 16**, **Firebase**, and **Tailwind CSS**. 

This application guarantees that your data remains completely private. All encryption and decryption happen strictly in your browser using the native Web Crypto API. **Your master password and unencrypted vault data are never sent to the server.**

## ✨ Features

- **Zero-Knowledge Architecture:** Your master password never leaves your device. It is used to derive a 256-bit AES-GCM encryption key locally via PBKDF2 (SHA-256).
- **Client-Side Encryption:** All credentials (usernames, passwords, notes) are encrypted and authenticated locally before being synced to Firestore.
- **Secure Password Generator:** Built-in cryptographically secure password generator utilizing `crypto.getRandomValues()` with entropy calculation.
- **Robust Security Rules:** Firestore static rules guarantee data isolation. You can only read and write to your own encrypted documents.
- **Master Password Rotation:** Seamlessly change your master password. The app dynamically batch-re-encrypts your entire vault locally.
- **Accessible & Modern UI:** Designed with fully accessible components (shadcn/ui), intelligent screen reader event buses, and a dark/light mode toggle.
- **Production Hardened:** Deploys with strict Content-Security-Policy (CSP) headers, HSTS, X-Frame-Options, and SWC directives that strip terminal logs to prevent memory leaks.

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Backend/Auth:** [Firebase](https://firebase.google.com/) (Firestore, Firebase Authentication)
- **Validation:** [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)
- **Cryptography:** Native browser [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/habibulhaasan/password-vault.git
cd password-vault
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Firebase
1. Create a new project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Firestore Database** and **Authentication** (Email/Password).
3. Deploy the provided security rules and composite indexes:
   ```bash
   npx firebase-tools deploy --only firestore
   ```
4. Copy the environment variables template:
   ```bash
   cp .env.example .env.local
   ```
5. Populate `.env.local` with your Firebase project keys.

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing

The vault is fully validated by a comprehensive suite of headless tests executed via Node's native test runner (`node:test`). Tests cover cryptographic derivation invariants, validation schemas, dynamic UI states, and strict error scrubbing.

```bash
npm test
```

## 🌐 Deployment (Vercel)

This project is optimized for deployment on Vercel. 
1. Import the repository into your Vercel dashboard.
2. Provide the 6 required `NEXT_PUBLIC_FIREBASE_*` environment variables in Vercel's project settings.
3. Once deployed, take your live Vercel domain (e.g., `your-vault.vercel.app`) and add it to the **Authorized Domains** list in the Firebase Authentication console to allow logins.

## 🛡️ Security Disclaimer

This project is a personal utility demonstrating client-side zero-knowledge architecture. While it uses NIST-recommended cryptographic primitives (AES-GCM, PBKDF2), you assume all risk when storing sensitive credentials. Always ensure your master password has sufficient entropy.
