# Password Vault — AI Coding Agent Guide

> **Purpose:** This document is the persistent product and engineering specification for the Password Vault application.
>
> The coding agent should treat this file as the source of truth for architecture, security, UI/UX, coding standards, and product behavior.
>
> **Important:** Build the application incrementally. The user will give step-by-step implementation instructions separately. Do not implement the whole application at once.

---

## 1. Product Overview

Build a secure, minimal, productive personal password-management application using:

- Latest stable Next.js
- TypeScript
- Next.js App Router
- Tailwind CSS
- shadcn/ui
- Firebase Authentication
- Cloud Firestore
- Web Crypto API
- React Hook Form
- Zod
- Lucide icons

The application stores website/account credentials and helps the user quickly find, copy, update, and manage them.

### Core credential information

Each credential should support:

- Title
- Username
- Password
- Website URL
- Last login date
- Dynamically calculated days since last login
- Comments/notes
- Category
- Multiple tags
- Created date
- Updated date

### Core productivity features

- Search
- Category-wise view
- Tag filtering
- Last-login filtering
- Sorting
- Copy username
- Copy password
- Open website
- Mark as logged in
- Password visibility toggle
- Password generator
- Vault lock
- Automatic vault lock
- Responsive mobile UI
- Dark/light theme

---

# 2. Product Philosophy

The application should feel like a focused productivity tool, not an administrative CRUD dashboard.

Priorities:

1. Security
2. Simplicity
3. Speed
4. Discoverability
5. Information density
6. Accessibility
7. Maintainability

Avoid:

- Excessive dashboard cards
- Large decorative sections
- Unnecessary animations
- Excessive gradients
- Large empty spaces
- Complicated navigation
- Duplicate controls
- Over-engineering

The user should be able to find an account and copy its credentials in only a few interactions.

---

# 3. Non-Negotiable Security Principles

This is a password manager. Security is a core product requirement, not an enhancement.

## 3.1 Authentication vs Vault Encryption

Firebase Authentication and vault encryption are separate concerns.

Firebase Authentication answers:

> "Who is this user?"

Vault encryption answers:

> "Can this authenticated user decrypt the vault?"

Do not use Firebase Authentication as a substitute for vault encryption.

Do not directly use the Firebase account password as the vault encryption key.

---

## 3.2 Never Store Plaintext Vault Passwords

Do not permanently store plaintext credential passwords in Firestore.

Sensitive fields should be encrypted client-side before being persisted.

Sensitive fields may include:

- Username
- Password
- Notes/comments
- Future secret/custom fields

Non-sensitive metadata may remain plaintext when necessary for application functionality, but minimize exposed metadata.

---

## 3.3 Cryptography

Use established browser cryptography APIs.

Preferred primitives:

- Web Crypto API
- AES-GCM for authenticated encryption
- Cryptographically secure random IV/nonce
- Cryptographically secure random salt
- PBKDF2 or another well-established KDF when appropriate

Never:

- Invent an encryption algorithm
- Use custom cryptography
- Use `Math.random()` for security-sensitive randomness
- Reuse AES-GCM IVs with the same key
- Hard-code encryption keys
- Log encryption keys

If the implementation requires a security-sensitive design decision, stop and explain the issue rather than inventing a shortcut.

---

## 3.4 Sensitive Data Logging

Never log:

- Passwords
- Decrypted usernames
- Decrypted notes
- Encryption keys
- Vault unlock secrets
- Tokens
- Clipboard contents
- Sensitive Firebase data

Avoid accidental sensitive logging through:

```ts
console.log(objectContainingPassword)
```

Use safe error messages.

---

## 3.5 Browser Storage

Do not store the vault encryption key in plaintext `localStorage`.

Avoid unnecessarily storing decrypted credentials in:

- localStorage
- sessionStorage
- IndexedDB
- URLs
- query parameters

If temporary in-memory state is necessary, keep the lifetime as short as practical and clear it when the vault is locked.

---

## 3.6 Clipboard

Clipboard functionality is required, but must be treated as sensitive.

Support:

- Copy username
- Copy password

Never log clipboard values.

Provide visual confirmation such as:

> Password copied

If automatic clipboard clearing is implemented, make it best-effort because browser/platform behavior varies.

---

# 4. Threat Model

The application should be designed primarily against:

- Unauthorized Firestore access
- Cross-user data access
- Accidental plaintext storage
- Accidental secret logging
- Client-side authorization mistakes
- XSS-based credential exposure
- Secrets exposed through URLs
- Weak password generation
- Insecure cryptographic implementation
- Forgotten unlocked vault sessions
- Compromised browser/session limitations

The application cannot protect against every possible threat.

For example, if a user's device/browser is fully compromised, client-side vault security cannot guarantee protection.

The README should document realistic limitations rather than claiming absolute security.

---

# 5. Firebase Architecture

Use Firebase Authentication for identity.

Use Firestore for persistent application data.

Logical structure:

```text
users/{uid}
    credentials/{credentialId}
    categories/{categoryId}
    settings/{documentId}
```

A credential belongs to exactly one authenticated user.

Recommended conceptual path:

```text
/users/{uid}/credentials/{credentialId}
```

---

# 6. Firestore Security Rules

Security rules must enforce user ownership.

The fundamental principle:

```text
Authenticated user A
    ↓
Can access only
/users/A/...
```

User A must never be able to read:

```text
/users/B/...
```

Do not rely only on frontend filtering or hidden UI.

Firestore rules are part of the actual security boundary.

Avoid insecure rules such as:

```text
allow read, write: if request.auth != null;
```

unless the data model explicitly guarantees isolation elsewhere.

Review rules whenever a new collection is introduced.

---

# 7. Credential Data Model

Conceptual TypeScript model:

```ts
interface Credential {
  id: string;
  title: string;

  encryptedUsername: string;
  encryptedPassword: string;
  encryptedNotes?: string;

  websiteUrl?: string;

  categoryId?: string;
  tags: string[];

  lastLoginAt?: Timestamp;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

Do not permanently store:

```ts
daysSinceLastLogin
```

Calculate it dynamically from `lastLoginAt`.

---

# 8. Last Login Logic

The database stores:

```text
lastLoginAt
```

The UI calculates:

```text
daysSinceLastLogin
```

Example:

```text
lastLoginAt = 2026-09-20
today       = 2026-09-21

result = 1 day
```

Display examples:

```text
Today
1 day ago
5 days ago
30 days ago
Never logged in
```

Provide a:

> Mark as Logged In

action.

When clicked:

```text
lastLoginAt = current timestamp
```

Do not require the user to manually enter the date for normal usage.

---

# 9. Categories

Initial categories:

- Personal
- Work
- Finance
- Social
- Shopping
- Education
- Development
- Government
- Health
- Entertainment
- Other

Categories should be represented through a proper data/configuration layer rather than duplicated string literals across components.

The architecture should allow custom categories later.

---

# 10. Tags

Tags are independent of categories.

Example tags:

```text
personal
important
2FA
financial
work
rarely-used
subscription
```

A credential can have multiple tags.

Example:

```text
Category: Finance

Tags:
personal
important
2FA
```

---

# 11. Search and Filtering

Search/filtering should support:

### Search

Search appropriate metadata such as:

- Title
- Username
- Website
- Category
- Tags

Do not decrypt every secret field merely to make basic metadata search possible.

### Category filter

Examples:

```text
All
Personal
Work
Finance
Social
...
```

### Tag filter

Support:

- Single tag
- Multiple tags
- Clear filters

### Last-login filter

Support:

```text
All
Today
Within 7 days
Within 30 days
More than 30 days
Never logged in
```

### Sorting

Useful options:

- Recently updated
- Last login
- Oldest login
- Alphabetical
- Recently created

---

# 12. Dashboard UX

The dashboard should be compact and practical.

Suggested desktop structure:

```text
┌───────────────────────────────────────────────────────┐
│ Vault                                  + Add          │
├───────────────┬───────────────────────────────────────┤
│               │                                       │
│ Categories    │ Search credentials...                 │
│               │                                       │
│ All           │ Filters                               │
│ Personal      │                                       │
│ Work          │ Credential list                       │
│ Finance       │                                       │
│ Social        │                                       │
│ Shopping      │                                       │
│               │                                       │
└───────────────┴───────────────────────────────────────┘
```

Do not fill the dashboard with unnecessary statistics.

---

# 13. Credential List UX

Each credential should be represented by a compact row/card.

Example:

```text
┌────────────────────────────────────────────────────────┐
│ Facebook                         Social                │
│ hasan@example.com                                      │
│                                                        │
│ Last login: 1 day ago                                  │
│                                                        │
│ [Copy Username] [Copy Password] [Open] [More]         │
└────────────────────────────────────────────────────────┘
```

Never display plaintext passwords in the list.

Password should only become visible after an explicit user action.

---

# 14. Add/Edit Credential UX

Recommended form:

```text
Add Credential

Title
[ Facebook ]

Username
[ hasan@example.com                    Copy ]

Password
[ ••••••••••••••••••              Show  Generate ]

Website
[ https://facebook.com ]

Category
[ Social ▼ ]

Tags
[ personal ] [ important ] +

Last Login
[ 20 Sep 2026 ]

Comments
[                                        ]
[                                        ]

                         Cancel   Save
```

Required:

- Title
- Username
- Password

Optional:

- Website
- Category
- Tags
- Last login
- Comments

---

# 15. Password Field

Password input should support:

- Hidden by default
- Show/hide
- Copy
- Generate

Do not automatically expose passwords.

Use appropriate accessibility labels.

Example:

```text
Password
[ ••••••••••••••• ] [Show] [Generate]
```

---

# 16. Password Generator

Use a cryptographically secure random source.

Never use:

```ts
Math.random()
```

Support:

- Length
- Uppercase
- Lowercase
- Numbers
- Symbols

Example:

```text
Password Generator

Length
[ 20 ]

☑ Uppercase
☑ Lowercase
☑ Numbers
☑ Symbols

[ generated password ]

[Regenerate] [Use Password]
```

The generator should avoid producing invalid or biased results where practical.

---

# 17. Website URL

Website links should:

- Validate URL format
- Display safely
- Open in a new tab when appropriate
- Use safe URL handling
- Never execute arbitrary JavaScript URLs

Reject or sanitize dangerous schemes such as:

```text
javascript:
data:
```

Prefer normal web URLs.

---

# 18. Vault Lock

The vault should support:

### Manual lock

User clicks:

```text
Lock Vault
```

### Automatic lock

Options:

```text
5 minutes
15 minutes
30 minutes
Never
```

When locked:

- Hide decrypted credentials
- Clear sensitive in-memory state where practical
- Require vault unlock
- Do not continue displaying sensitive values

---

# 19. Navigation

Desktop:

```text
Vault
├── All Credentials
├── Categories
├── Tags
└── Settings
```

Potential later additions:

```text
Favorites
Recently Used
Security
Generator
```

Do not add these unless they provide real value.

---

# 20. Mobile UX

Mobile is a first-class target.

Requirements:

- No horizontal overflow
- Touch-friendly buttons
- Compact navigation
- Easy search
- Easy credential actions
- Forms fit small screens
- Bottom navigation or compact menu where appropriate
- Avoid hover-dependent interactions

Do not simply shrink the desktop UI.

Design mobile interactions intentionally.

---

# 21. Visual Design

Desired visual language:

- Minimal
- Clean
- Professional
- Calm
- High readability
- Subtle borders
- Moderate corner radius
- Limited shadows
- Strong typography hierarchy
- Consistent spacing

Avoid:

- Excessive gradients
- Glassmorphism everywhere
- Huge headings
- Excessive rounded containers
- Excessive colors
- Decorative illustrations
- Unnecessary animations

The interface should feel like a serious productivity/security application.

---

# 22. Color System

Use the existing Tailwind/shadcn semantic color system.

Prefer semantic tokens such as:

```text
background
foreground
card
muted
muted-foreground
border
primary
secondary
destructive
```

Do not scatter arbitrary color values across components.

Use color primarily to communicate:

- Primary actions
- Destructive actions
- Status
- Focus
- Errors
- Success

---

# 23. Typography

Prioritize readability.

Hierarchy:

```text
Page title
Section title
Credential title
Metadata
Secondary information
Helper text
```

Passwords and usernames should be readable but not visually dominant.

---

# 24. Accessibility

The application should support:

- Keyboard navigation
- Visible focus states
- Proper labels
- Accessible buttons
- Screen-reader-friendly controls
- Sufficient color contrast
- Meaningful error messages
- Accessible dialogs
- Escape-to-close where appropriate

Do not rely on color alone to communicate status.

---

# 25. Loading States

Avoid blank screens.

Use:

- Skeletons
- Loading indicators
- Disabled states
- Optimistic updates only where safe

For example:

```text
Loading credentials...
```

should not expose partial decrypted data accidentally.

---

# 26. Empty States

Examples:

No credentials:

```text
Your vault is empty

Add your first credential to get started.

[ Add Credential ]
```

No search result:

```text
No credentials found

Try another search or clear your filters.
```

No category credentials:

```text
No credentials in this category.
```

---

# 27. Error Handling

Errors should be:

- Human-readable
- Specific enough to be useful
- Non-sensitive

Never show:

- Encryption keys
- Firebase internal tokens
- Raw credential data
- Stack traces containing sensitive information

Development logs may be more detailed, but must still avoid secrets.

---

# 28. Form Validation

Use Zod.

Validate:

- Title
- Username
- Password
- Website URL
- Category
- Tags
- Notes length

Use React Hook Form for form state where appropriate.

Validation should happen before database operations.

---

# 29. Component Architecture

Prefer feature-oriented organization.

Recommended:

```text
app/
components/
  ui/
  layout/
  credentials/
  filters/
  password-generator/
lib/
  firebase/
  crypto/
  utils/
  validations/
hooks/
providers/
types/
```

Avoid giant components such as:

```text
Dashboard.tsx
```

containing the entire application.

Separate:

- Data access
- Business logic
- Cryptography
- UI
- Validation

---

# 30. Recommended Project Structure

```text
password-vault/
│
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── forgot-password/
│   │       └── page.tsx
│   │
│   ├── (vault)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── credentials/
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   ├── categories/
│   │   │   └── page.tsx
│   │   ├── tags/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   │
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ui/
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── mobile-nav.tsx
│   │
│   ├── credentials/
│   │   ├── credential-card.tsx
│   │   ├── credential-list.tsx
│   │   ├── credential-form.tsx
│   │   ├── credential-actions.tsx
│   │   └── password-field.tsx
│   │
│   ├── filters/
│   │   ├── search-bar.tsx
│   │   ├── category-filter.tsx
│   │   ├── tag-filter.tsx
│   │   └── sort-control.tsx
│   │
│   └── password-generator/
│       └── password-generator.tsx
│
├── lib/
│   ├── firebase/
│   │   ├── config.ts
│   │   ├── auth.ts
│   │   └── firestore.ts
│   │
│   ├── crypto/
│   │   ├── encryption.ts
│   │   ├── key-derivation.ts
│   │   └── vault.ts
│   │
│   ├── validations/
│   │   └── credential.ts
│   │
│   └── utils/
│       ├── date.ts
│       ├── clipboard.ts
│       └── password-generator.ts
│
├── hooks/
│   ├── use-auth.ts
│   ├── use-credentials.ts
│   ├── use-vault.ts
│   └── use-debounce.ts
│
├── providers/
│   ├── auth-provider.tsx
│   └── vault-provider.tsx
│
├── types/
│   ├── credential.ts
│   ├── category.ts
│   └── user.ts
│
├── firestore.rules
├── firestore.indexes.json
├── .env.local
├── package.json
└── README.md
```

This is a starting structure, not a rigid requirement. The agent may improve it if there is a clear architectural reason.

---

# 31. Coding Standards

Use strict TypeScript.

Avoid:

```ts
any
```

unless there is a documented unavoidable reason.

Prefer:

- Explicit types
- Small reusable functions
- Clear naming
- Single responsibility
- Predictable state management

Avoid:

- Duplicate business logic
- Huge utility files
- Unnecessary abstractions
- Premature optimization
- Global state for everything

---

# 32. Server/Client Boundaries

Be intentional about Next.js Server Components and Client Components.

Do not make the entire application client-side without a reason.

Sensitive browser-only cryptographic operations should run where browser Web Crypto APIs are available.

Firebase client SDK usage should be isolated to appropriate modules.

Never expose Firebase Admin SDK credentials to browser code.

---

# 33. Environment Variables

Use environment variables for configuration.

Client-exposed Firebase configuration can use the normal Next.js public environment-variable mechanism where required by Firebase's client SDK.

Never put:

- Firebase Admin private key
- Service account JSON
- Server-only secrets

into client-exposed environment variables.

Use `.env.local` locally.

Provide a `.env.example` without real secrets.

---

# 34. Performance

The application should feel fast.

Avoid:

- Unnecessary Firestore reads
- Repeated queries caused by bad effects
- Decrypting the entire vault repeatedly
- Rendering every credential unnecessarily
- Excessive global state updates

Use:

- Debounced search where appropriate
- Memoization only when justified
- Efficient Firestore queries
- Appropriate indexes
- Pagination if the dataset eventually requires it

Do not prematurely optimize a small dataset at the expense of clarity.

---

# 35. Firestore Query Strategy

Keep queryable metadata separate from encrypted sensitive fields where practical.

For example:

```text
title
categoryId
tags
lastLoginAt
updatedAt
```

may need to remain queryable.

Sensitive fields:

```text
username
password
notes
```

can be encrypted.

The exact trade-off should be documented.

Do not claim that encrypted data can be arbitrarily searched server-side without a specific searchable-encryption design.

---

# 36. Testing Requirements

Test at minimum:

### Authentication

- Register
- Login
- Logout
- Password reset
- Unauthorized access

### Credentials

- Create
- Read
- Update
- Delete

### Organization

- Category filtering
- Tag filtering
- Search
- Sorting

### Productivity

- Copy username
- Copy password
- Open website
- Mark as logged in
- Password generation

### Security

- Cross-user Firestore access denied
- Unauthenticated Firestore access denied
- No plaintext password persistence
- No sensitive console logging
- Vault lock hides decrypted data

### UI

- Desktop
- Mobile
- Empty states
- Loading states
- Error states
- Keyboard navigation

---

# 37. AI Coding Agent Workflow

The agent must work incrementally.

The user will issue commands such as:

```text
Implement step 1.
```

or:

```text
Continue with the next step.
```

When instructed to implement a step:

1. Inspect the current project.
2. Read this guide.
3. Identify the requested scope.
4. Inspect existing files before changing them.
5. Preserve working functionality.
6. Implement only the requested step.
7. Avoid unrelated refactoring.
8. Run validation.
9. Fix errors.
10. Report what was changed.
11. Stop.

Do not automatically proceed to the next feature.

---

# 38. Step Boundaries

Recommended development sequence:

```text
Step 1  — Project foundation
Step 2  — Design system and application shell
Step 3  — Firebase configuration
Step 4  — Authentication
Step 5  — Firestore architecture and security rules
Step 6  — Credential data model
Step 7  — Cryptographic architecture
Step 8  — Vault unlock/lock
Step 9  — Credential CRUD
Step 10 — Dashboard
Step 11 — Search/filter/sort
Step 12 — Categories
Step 13 — Tags
Step 14 — Copy/open actions
Step 15 — Password generator
Step 16 — Last-login tracking
Step 17 — Settings
Step 18 — Mobile optimization
Step 19 — Accessibility
Step 20 — Error/loading/empty states
Step 21 — Testing
Step 22 — Security audit
Step 23 — Production hardening
Step 24 — Deployment
```

Do not implement multiple major steps unless explicitly requested.

---

# 39. Validation After Every Step

At minimum, run:

```bash
npm run lint
npm run build
```

If the project has a type-check script, run it as well.

For example:

```bash
npx tsc --noEmit
```

Do not report a step as complete while known build/type errors remain.

---

# 40. No Mock Data

Do not add fake credentials such as:

```text
Facebook
Google
GitHub
```

unless the user explicitly requests demo data.

Use real Firebase/Firestore integration when the relevant step has been implemented.

---

# 41. No Unrequested Features

Do not automatically add:

- Sharing
- Password breach checking
- Browser extensions
- Autofill
- 2FA token generation
- Secure file storage
- Emergency access
- Multi-user vaults
- Team vaults
- Subscription systems
- Payment systems

These may be future features, but should not complicate the MVP.

---

# 42. Future-Proofing

The architecture should leave room for:

- Favorites
- Custom fields
- Secure notes
- Passkeys
- 2FA/TOTP
- Import/export
- Browser extension
- Offline support
- Multiple vaults
- Shared/team vaults

But do not implement them in the MVP unless requested.

---

# 43. Definition of Done

The application is not considered production-ready merely because it works visually.

Before final completion, verify:

- Authentication works
- Firestore ownership rules work
- Plaintext vault passwords are not persisted
- Encryption architecture is documented
- Vault lock works
- Sensitive data is not logged
- Password generator uses secure randomness
- Clipboard actions work
- Search/filtering works
- Last-login calculation works
- Mobile UI works
- Accessibility basics are covered
- Loading/error/empty states exist
- TypeScript passes
- ESLint passes
- Production build passes
- Security rules have been reviewed
- README contains setup instructions
- `.env.example` contains no real secrets
- No Firebase Admin credentials are exposed to the browser

---

# 44. Important Agent Behavior

When a requirement is ambiguous:

- Prefer the simplest secure implementation.
- Do not silently make security-sensitive assumptions.
- Explain the assumption briefly.
- If a decision materially affects the security model, stop and ask before implementing it.

When a requested implementation conflicts with the security architecture:

- Do not blindly follow it.
- Explain the risk.
- Propose the secure alternative.

When modifying existing code:

- Preserve the current design unless the requested step specifically changes it.
- Do not rewrite unrelated files.
- Do not remove working functionality.

---

# 45. Final Principle

Build this application like a real password vault, not like a normal Firebase CRUD application.

The UI can be simple.

The architecture cannot be careless.

Security, ownership isolation, encryption, vault locking, and sensitive-data handling should be designed before convenience features.

Always work one logical step at a time.
