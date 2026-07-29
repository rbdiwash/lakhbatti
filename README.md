# Lakhbatti — Cleaning & Gardening Services

A modern **Next.js 16** website for Lakhbatti, a cleaning contractor company based in Sydney.  
Built with React 19, Tailwind CSS v4, Axios, and TanStack React Query.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Getting Started](#getting-started)
3. [Project Structure](#project-structure)
4. [Environment Variables](#environment-variables)
5. [Employee Registration System](#employee-registration-system)
   - [Architecture](#architecture)
   - [Wizard Steps](#wizard-steps)
   - [Data Flow](#data-flow)
   - [Adding a new Step](#adding-a-new-step)
6. [Quote Form](#quote-form)
7. [Connecting a Real API](#connecting-a-real-api)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS v4 |
| Icons | `react-icons` (Lucide set) |
| HTTP client | Axios |
| Server-state / mutations | TanStack React Query v5 |
| Form state | React Context |

---

## Getting Started

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build
yarn start
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
├── components/          # Shared UI components
│   ├── header.tsx       # Sticky nav header
│   ├── footer.tsx       # Dark teal footer
│   ├── logo.tsx         # Logo image wrapper
│   ├── icons.tsx        # All icons re-exported from react-icons/lu
│   ├── providers.tsx    # QueryClientProvider (wraps layout)
│   ├── cta.tsx          # CTA banner block
│   ├── service-card.tsx # Service card with image
│   └── quote-form.tsx   # Client-facing multi-step quote wizard
├── lib/
│   ├── api.ts           # Axios instance + API functions
│   ├── site.ts          # Brand config, nav links, services data
│   ├── steps.ts         # Registration wizard step definitions
│   └── types.ts         # All TypeScript types
├── register/            # ─── Employee Registration System ───
│   ├── page.tsx         # /register route (server component)
│   ├── context.tsx      # RegistrationContext + useRegistration hook
│   ├── wizard.tsx       # Wizard shell: progress bar + step router
│   ├── ui.tsx           # Reusable form primitives (Input, Select, Toggle…)
│   └── steps/
│       ├── step-personal.tsx       # Step 1
│       ├── step-contact.tsx        # Step 2
│       ├── step-work-rights.tsx    # Step 3
│       ├── step-availability.tsx   # Step 4
│       ├── step-compliance.tsx     # Step 5
│       ├── step-training.tsx       # Step 6
│       ├── step-bank.tsx           # Step 7
│       └── step-review.tsx         # Step 8 (submit via React Query)
├── quote/               # Client-facing quote request flow
├── about/
├── services/
└── contact/
```

---

## Environment Variables

Create a `.env.local` file in the project root:

```bash
# Quote form — get a free key at https://web3forms.com
NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=your-key-here

# Employee registration API (replace with your backend URL when ready)
NEXT_PUBLIC_API_URL=https://jsonplaceholder.typicode.com
```

> **Note:** `NEXT_PUBLIC_*` variables are safe to expose in the browser.  
> Never put secrets (database passwords, private keys) with `NEXT_PUBLIC_` prefix.

---

## Employee Registration System

### Architecture

```
/register (page.tsx)
  └── <RegistrationProvider>        ← React Context: holds all form state
        └── <RegistrationWizard>   ← step router + progress bar
              └── <Step1–8>        ← each step reads/writes context
                    └── <StepNav>  ← Back / Continue / Submit buttons
```

**Why Context instead of a library like Formik or React Hook Form?**  
The form is split across 8 separate components with no shared `<form>` tag.  
Context gives clean, shared state with zero extra dependencies.  
React Query handles only the final API mutation (submit), keeping concerns separated.

### Wizard Steps

| # | Route key | File | Fields |
|---|-----------|------|--------|
| 1 | `personal` | `step-personal.tsx` | First/last name, DOB, gender, photo |
| 2 | `contact` | `step-contact.tsx` | Email, phone, address, SMS/email toggles, emergency contact |
| 3 | `work-rights` | `step-work-rights.tsx` | Visa status, expiry, TFN, ABN |
| 4 | `availability` | `step-availability.tsx` | Work type, days, times, urgency, pay rate, leave entitlements, travel |
| 5 | `compliance` | `step-compliance.tsx` | Police check, WWC check, insurance, COVID vax, other docs |
| 6 | `training` | `step-training.tsx` | Certifications, machines, specialisations, references |
| 7 | `bank` | `step-bank.tsx` | BSB, account, payment method, super fund |
| 8 | `review` | `step-review.tsx` | Full summary, T&C toggle, submit (React Query mutation) |

### Data Flow

```
User fills Step N
  → updates context via update* functions
  → validates (inline, per step)
  → calls nextStep()

Step 8 (Review):
  → buildPayload() assembles EmployeeRegistration object
  → useMutation({ mutationFn: submitRegistration }) POSTs via Axios
  → success → show confirmation with application ID
  → error   → show retry message
```

### Adding a new Step

1. Add a `StepConfig` entry to `app/lib/steps.ts`.
2. Create `app/register/steps/step-your-name.tsx` — import `useRegistration`, `StepHeading`, `StepNav`.
3. Add the corresponding fields to `EmployeeRegistration` in `app/lib/types.ts` and the context defaults in `context.tsx`.
4. Add the component to the `STEP_COMPONENTS` array in `wizard.tsx`.

---

## Quote Form

The client-facing quote flow lives at `/quote`.  
It uses a self-contained wizard (`app/components/quote-form.tsx`) with its own local state and
posts to [Web3Forms](https://web3forms.com) via a direct `fetch` call — no backend needed.

Set `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` in `.env.local` to activate email delivery.

---

## Connecting a Real API

All API calls go through `app/lib/api.ts`.

**To swap the dummy endpoint:**

```ts
// app/lib/api.ts
export async function submitRegistration(data: EmployeeRegistration) {
  // Change this URL to your real endpoint:
  const response = await apiClient.post("/api/employees/register", data);
  return response.data;
}
```

Set `NEXT_PUBLIC_API_URL` in `.env.local` to point at your backend.  
The Axios instance already attaches `Authorization: Bearer <token>` from `localStorage` if present — wire up your auth flow there.
