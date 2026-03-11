---
description: Use when the user asks to modify, style, or add features to the frontend landing page. Covers React components, Less styles, scroll animations, and HeroUI widgets.
---

# Frontend Landing Page Skill

## Stack
- **Bundler**: Vite 7+ (latest beta)
- **Framework**: React 19+ (pure SPA, no framework mode)
- **Styling**: Less (no Tailwind) - all styles in `frontend/src/index.less`
- **UI Library**: HeroUI (`@heroui/react`) for Cards, Buttons, Chips, etc.
- **Animations**: Framer Motion for scroll reveals, parallax, and transitions
- **Headless UI**: `@headlessui/react` for accessible unstyled components (Dialogs, Menus, etc.)

## Key Files
- `frontend/src/main.jsx` - Entry point with HeroUI provider
- `frontend/src/App.jsx` - All page sections (Hero, Countdown, Details, Highlights, Tickets)
- `frontend/src/index.less` - All styles using BEM naming with Less nesting
- `frontend/src/components/ScrollReveal.jsx` - Scroll-triggered reveal animation wrapper
- `frontend/src/components/ParallaxSection.jsx` - Parallax scroll effect wrapper
- `frontend/src/components/ScrollHint.jsx` - Animated scroll indicator
- `frontend/src/hooks/useScrollProgress.js` - Global scroll progress (0-1)
- `frontend/vite.config.js` - Vite config with Less and API proxy to :8080

## Design Principles
- **Mobile-first**: Base styles target mobile, use `@media (min-width: 768px)` for desktop
- **Dark theme**: Deep purple/black palette (`#0a0a0f` bg, `#8b5cf6` accent)
- **Scroll-reactive**: Sections animate in on scroll using `ScrollReveal` and `ParallaxSection`
- **BEM naming**: `.block__element` pattern in Less with `&__element` nesting

## Commands
- `npm run dev` (from frontend/) - Dev server with HMR
- `npm run build` (from frontend/) - Production build to `frontend/dist/`

## When Adding New Sections
1. Create the section component in `App.jsx`
2. Wrap content in `<ScrollReveal>` for entrance animations
3. Use `<ParallaxSection>` for parallax background effects
4. Add styles to `index.less` following the existing BEM pattern
5. Use HeroUI components (Card, Button, Chip, etc.) for interactive widgets

## API Integration
- Vite proxies `/api/*` to `http://localhost:8080` (Go backend)
- Ticket booking: `POST /api/tickets/book` with `{name, email}`
- Availability: `GET /api/tickets/available` returns `{available, sold, total}`
