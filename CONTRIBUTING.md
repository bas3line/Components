# Contributing

Thanks for wanting to add to the collection. New components, fixes, accessibility and performance work, and ideas are all welcome.

## Setup

You need Node 20 or later.

```sh
git clone https://github.com/bas3line/Components
cd Components
npm install
npm run dev        # http://localhost:3000
```

The gallery is at `/`, and every component has a page of its own at `/preview/<slug>`.

## How it fits together

- `components/<slug>/`: one folder per component, and everything it needs. Someone should be able to copy that folder alone into their project, so a folder never imports from another component's folder.
- `components/primitives/`: the notched button and the kicker label, which any component may use.
- `lib/cn.ts`, `lib/hooks.ts`: the class-name joiner, `useInView` and `usePrefersReducedMotion`.
- `styles/tokens.css`: the palette as CSS variables and Tailwind tokens, and the few utilities Tailwind can't express (`.notch`, `.bg-dots`, `.bg-hatch`).
- `demos/<slug>.tsx`: the component dressed for its picture, plus `shot`, which tells `npm run shots` how to take it.
- `app/preview/<slug>/page.tsx`: the demo alone on a page. `app/page.tsx` is the gallery.
- `.github/readme/<slug>.png`: the pictures in the README, made by `npm run shots`.

## Adding a component

1. Put it in `components/<slug>/<Name>.tsx`, with any helpers beside it.
2. Write `demos/<slug>.tsx` and `app/preview/<slug>/page.tsx` (copy an existing pair).
3. Add it to `registry.ts`, so the gallery lists it.
4. With `npm run dev` running, take its picture: `npm run shots -- <slug>`. The first time, fetch the browser with `npx playwright install chromium`.
5. Add its section to the README: the picture, one line on what it is, how to use it, and its props.

## The rules the components follow

- **Drawn in code.** SVG and CSS, no images, no canvas libraries. Geometry is computed, and deterministic: no `Math.random()` or dates at render, so the server and the browser draw the same thing.
- **One palette.** Use the tokens (`bg-night`, `text-ink-2`, `var(--peri)`), not new hex values. Mint and lime are fills, never text on paper.
- **Props in, no data inside.** Everything a component shows comes from its props, with defaults that render a good example on their own.
- **Reduced motion is respected.** Anything that moves on its own holds still for readers who prefer reduced motion, at its finished frame, so it still says what it means.
- **Accessible.** A drawing has `role="img"` and a label; anything you can click, you can reach and work with the keyboard.
- **No new runtime dependencies.** React is the only one. If something needs a library, say why in the pull request.
- **Example content is clearly an example.** IP addresses come from the documentation ranges (`192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`, `2001:db8::/32`), and no secret looks real.

## Checks

```sh
npm run check      # typecheck, lint, production build
```

CI runs the same on every pull request. Before you open one, also look at your change at a phone width (390 px) and a laptop one (1440 px), and with reduced motion on (in Chrome's DevTools, Rendering, "Emulate CSS media feature prefers-reduced-motion").

## Pull requests

Keep each one to one change, and say what it changes, how you checked it, and include a screenshot for anything visual. Commits in the imperative ("Add the dot map"), one idea each.
