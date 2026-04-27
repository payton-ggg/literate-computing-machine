# Vue → React Migration Status

## ✅ Fully Migrated

| Module       | Details                                                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **auth**     | Login, Register, ForgotPassword — pages, components, API, Zustand store                                                                    |
| **ideas**    | IdeasPage — API, 14 components, 8 hooks, types, utils                                                                                      |
| **research** | FolderResearch, InterviewDetail, InsightsGraph, ListResearch — API (3), components (views/dialogs/global), hooks (6), pages (6), types (2) |
| **landing**  | LandingPage — 10 components, CSS                                                                                                           |
| **shared**   | Breadcrumbs, TokenBalanceBadge, AppHeader, AccountMenu, ConfirmDialog, ToastContainer, LogoutModal                                         |
| **lib**      | axios, i18n, providers, toast, token-balance                                                                                               |

## ❌ Not Yet Migrated

### Priority 1 — Auth Pages (missing from existing module)

| Vue Source              | Size      | Target                                                |
| ----------------------- | --------- | ----------------------------------------------------- |
| `EmailVerification.vue` | 328 lines | `modules/auth` + `app/(auth)/verify-email/page.tsx`   |
| `ResetPassword.vue`     | 368 lines | `modules/auth` + `app/(auth)/reset-password/page.tsx` |

### Priority 2 — Billing Module (API only, no UI)

| Vue Source                | Size       | Target                                  |
| ------------------------- | ---------- | --------------------------------------- |
| `Billing.vue`             | 139 lines  | `modules/billing/pages/BillingPage.tsx` |
| `Buy.vue`                 | 182 lines  | `modules/billing/pages/BuyPage.tsx`     |
| `Pricing.vue`             | 147 lines  | `modules/billing/pages/PricingPage.tsx` |
| `BillingCurrentPlan.vue`  | ~120 lines | `modules/billing/components/`           |
| `BillingPPUSettings.vue`  | ~90 lines  | `modules/billing/components/`           |
| `BillingTokenBalance.vue` | ~55 lines  | `modules/billing/components/`           |
| `BillingUsageHistory.vue` | ~65 lines  | `modules/billing/components/`           |

### Priority 3 — Settings Module (API only, no UI)

| Vue Source                  | Size         | Target                                                  |
| --------------------------- | ------------ | ------------------------------------------------------- |
| `AccountSettingsDialog.vue` | 40KB (huge!) | `modules/settings/` decomposed into multiple components |

### Priority 4 — Ideas Detail (missing from ideas module)

| Vue Source                   | Size       | Target                                                    |
| ---------------------------- | ---------- | --------------------------------------------------------- |
| `IdeaDetail.vue`             | 51KB       | `modules/ideas/pages/IdeaDetailPage.tsx` + sub-components |
| `FolderIdeas.vue`            | ~130 lines | `modules/ideas/pages/FolderIdeasPage.tsx`                 |
| `CardDetail.vue` (component) | 99KB!      | Decomposed into ideas/research components                 |

### Priority 5 — Research Gaps

| Vue Source          | Size      | Target                                                 |
| ------------------- | --------- | ------------------------------------------------------ |
| `JobTree.vue`       | 66KB      | New module or `modules/research/pages/JobTreePage.tsx` |
| `Notes.vue`         | 647 lines | New `modules/notes/` module                            |
| `InsightsGraph.vue` | 86KB      | Already partially migrated (graph view exists)         |

### Priority 6 — Shared Components Not Yet Migrated

| Vue Source                | Target                                             |
| ------------------------- | -------------------------------------------------- |
| `AudioPlayer.vue` (28KB)  | `components/ui/` or `modules/research/components/` |
| `AssignFolderDialog.vue`  | `modules/research/components/dialogs/`             |
| `SpeakerNameDialog.vue`   | `modules/research/components/dialogs/`             |
| `TransferToIdeaModal.vue` | `modules/research/components/dialogs/`             |
| `TranslationDropdown.vue` | `components/ui/`                                   |
| `UploadProgress.vue`      | `components/ui/`                                   |

## Empty App Routes (need `page.tsx`)

- `app/(auth)/verify-email/page.tsx`
- `app/(auth)/reset-password/page.tsx`
- `app/(authenticated-user)/billing/page.tsx`
- `app/(authenticated-user)/buy/page.tsx`
- `app/(authenticated-user)/pricing/page.tsx`
- `app/(authenticated-user)/settings/page.tsx`
- `app/(authenticated-user)/ideas/[id]/page.tsx`
- `app/(authenticated-user)/research/[folderId]/ideas/page.tsx`
- `app/(authenticated-user)/research/[folderId]/jobs/page.tsx`
