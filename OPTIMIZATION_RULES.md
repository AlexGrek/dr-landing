# Frontend Optimization Rules

## Code Splitting Strategy

This project uses `React.lazy` + `Suspense` for route-level and modal-level code splitting. Vite's `manualChunks` config separates heavy vendor libraries into isolated chunks.

### Lazy-loaded components (App.jsx)
| Component | Trigger | Why |
|---|---|---|
| `AdminPanel` | Route `/birthday_is_for_me` | Pulls in `recharts` (351 KB) + `js-yaml` (20 KB) — never needed on the landing page |
| `VerifyRegistration` | Route `/verify/:code` | Standalone page, no reason to load on main page |
| `RegisterWizard` | Registration modal opens | Only needed after user clicks "Register Now" |
| `TicketConfirmation` | Registration succeeds | Only needed after successful form submission |
| `rulesText.js` | Rules modal or wizard stage | ~4 KB of text, dynamically imported |

### Vendor chunks (vite.config.js `manualChunks`)
| Chunk | Contents | Loaded by |
|---|---|---|
| `vendor-motion` | `framer-motion` | Main landing page (always) |
| `vendor-charts` | `recharts` | AdminPanel only |
| `vendor-yaml` | `js-yaml` | AdminPanel only |

## Rules for New Components

1. **Route-level pages** (`/some-path` renders a full page) must always be lazy-loaded with `React.lazy(() => import(...))` and wrapped in `<Suspense>`.

2. **Modal/dialog content** that imports additional dependencies should be lazy-loaded. The modal shell (`MorphModal`) stays eagerly loaded; only its children are lazy.

3. **Config data** (JSON arrays, large text blobs) used only inside lazy components do not need separate dynamic imports — they'll be split automatically with their parent chunk. Only add a dynamic `import()` when the same config is used by both the main bundle and a lazy component (to avoid duplicating it into the main bundle).

4. **New vendor dependencies**: If a new heavy library (>20 KB gzipped) is only used by a lazy-loaded component, add it to `manualChunks` in `vite.config.js` so it gets its own cacheable chunk. If it's used across multiple chunks, let Vite handle it automatically.

5. **Suspense fallbacks**: Use `<div className="lazy-loading">Loading...</div>` for consistency. The style is defined in `index.less`.

## What NOT to Lazy Load

- `ScrollReveal`, `MorphModal` — used immediately on the main page, must be eagerly imported.
- `framer-motion` hooks/components — core to the landing page scroll experience.
- Small config files (<2 KB) used only by eagerly-loaded sections.

## Build Verification

After any change to imports or chunking, run `npm run build` in `frontend/` and check:
- No "Generated an empty chunk" warnings (indicates a `manualChunks` entry that Vite can't isolate).
- Lazy components appear as separate `.js` files in the build output.
- `vendor-charts` and `vendor-yaml` are not referenced by the main `index-*.js` chunk.
