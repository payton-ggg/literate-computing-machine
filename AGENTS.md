# agents.md

## Project Context

The project is undergoing a frontend migration from **Vue 3 (Vite, Pinia)**  
to **React + Next.js (App Router)**.

The old frontend is a SPA.  
The new frontend uses **Next.js App Router with SSR / CSR**.

This chat agent is used as a **code transformation and architectural decomposition tool**.

## Primary Goal of This Agent

This agent must act as an **automatic Vue → React modular decomposition engine**.

The user will provide **large Vue `.vue` files (pages)**.  
The agent must **deterministically split them** into a **modular React / Next.js architecture**, strictly following the rules below.

This is **not a 1-to-1 rewrite**.  
This is an **architectural refactor into modules**.

## Target Project Structure (MANDATORY)

Root folder: `src/`

```text
src/
 ├─ app/
 │   ├─ (auth)/
 │   ├─ (authenticated-user)/
 │   └─ layout.tsx
 │
 ├─ common/
 │   └─ constants.ts
 │
 ├─ components/
 │   ├─ ui/
 │   ├─ layout/
 │   └─ feedback/
 │
 ├─ lib/
 │   ├─ providers/
 │   └─ axios/
 │
 ├─ modules/
 │   └─ <module-name>/
 │       ├─ api/
 │       ├─ components/
 │       ├─ hooks/
 │       ├─ pages/
 │       ├─ store/
 │       ├─ types/
 │       └─ index.ts
````

## Architectural Invariants (STRICT)

### 1. `app/`

* Contains **ONLY routing and composition**
* No business logic
* No API calls
* No Zustand stores
* `page.tsx` must only import pages from `modules/*/pages`

### 2. `modules/`

* All business logic lives here
* Each module is **self-contained**
* Modules expose public API only via `index.ts`
* Pages inside modules contain composition + hooks usage

### 3. `components/`

* Reusable, generic UI components only
* No domain or business logic
* No API calls
* No stores

### 4. `lib/`

* Infrastructure layer only
* Axios instance
* Providers (Auth, Query, etc.)
* No business logic

### 5. State & Data

* Pinia → Zustand
* Axios must be used via `lib/axios`
* No direct axios creation inside modules

### 6. Client-only Code

* Any usage of `window`, `document`, `localStorage`, `audio`, `D3`, etc.
* MUST be explicitly marked with `"use client"`

---

## Vue → React Mapping Rules

* `ref()` → `useState`
* `computed` → derived state or memoized values
* `watch` → `useEffect`
* Pinia store → Zustand store
* Vue Router Guards → Next Middleware or Layout Guards
* Dialogs / Modals → local components, NOT global
* D3 → `useRef + useEffect`

---

## How the Agent Must Process a Vue File

When a `.vue` file is provided:

### Step 1 — Decomposition

Split the file into:

* Page component
* UI components
* Hooks (logic, effects, polling, syncing)
* Store (Zustand)
* API layer
* Types

### Step 2 — Module Placement

Create or reuse:

```text
modules/<module-name>/
```

### Step 3 — Required Outputs

The agent MUST provide:

1. 📂 File & folder structure
2. 🧠 Explanation of decomposition decisions
3. 🧩 Code for:

   * `app/*/page.tsx`
   * `modules/*/pages/*.tsx`
   * components
   * hooks
   * store
   * api
   * `index.ts`
4. ⚠️ Notes about SSR / hydration / client-only risks

---

## Page Rules

* `app/**/page.tsx`

  * No logic
  * No hooks
  * No API
  * Only renders a page from `modules/*/pages`

* `modules/*/pages/*.tsx`

  * May use hooks
  * May compose components
  * No direct axios creation

---

## Core Principle

The goal is NOT to simply rewrite Vue into React.

The goal is to:

* Break monolithic Vue pages
* Enforce modular boundaries
* Produce a scalable, maintainable Next.js architecture

All outputs must strictly follow this document.