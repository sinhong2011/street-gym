# STREET/GYM — 與重力談判

**Live:** https://street-gym.pages.dev

A guide to advanced calisthenics and street workout. It covers the science, Convict Conditioning's Big Six, a roadmap from zero, street skills, and recommended YouTube channels. All animation is generated from code with **Remotion** and **three.js**.

```bash
pnpm install
pnpm dev            # website (Vite)
pnpm studio         # Remotion Studio: preview / tweak every composition
pnpm render:hero    # render the 3D hero to out/hero.mp4
pnpm deploy         # build + deploy to Cloudflare Pages from your machine
```

## CI/CD

`.github/workflows/deploy.yml` runs on every push and pull request:

- **Pull requests:** type-check, build, deploy a preview to Cloudflare Pages, and comment the preview URL on the PR. Fork PRs build only and are not deployed.
- **Push to `main`:** the same, then deploy to production at street-gym.pages.dev.

It needs two settings in the GitHub repo:

| Name | Kind | Value |
|---|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Actions **variable** | your Cloudflare account ID |
| `CLOUDFLARE_API_TOKEN` | Actions **secret** | an API token with *Account → Cloudflare Pages → Edit* |

Without them the workflow still builds and skips the deploy step.

## How the motion works

- `src/pose/skeleton.ts` is a tiny side-view kinematic skeleton. Poses are absolute joint angles. They are solved with an anchor (hands on the bar, feet on the floor) and an optional "levelling" constraint, so limbs never stretch.
- `src/pose/exercises.ts` holds 13 movements as keyframe tracks.
- One pose engine feeds three renderers:
  - `remotion/HeroScene.tsx` draws 3D capsules with `@remotion/three`. All motion is driven by `useCurrentFrame()`.
  - `remotion/ExerciseScene.tsx` draws a 2D chronophotography demo with echoes, a joint trace and a phase HUD.
  - `components/kit.tsx` → `ChronoStrip` draws static Muybridge strips.
- The website embeds the compositions with `@remotion/player`. Each player mounts lazily and plays only while it is visible.

Remotion is free for individuals and small teams; companies may need a license (see remotion.dev/license).

## Licenses & credits

- **3D anatomy model** (`public/models/anatomy.glb`): a decimated derivative of [Z-Anatomy](https://www.z-anatomy.com/) (CC BY-SA 4.0), which includes models from BodyParts3D (© The Database Center for Life Science, CC BY-SA 2.1 JP). The model file is distributed under **CC BY-SA 4.0**. See `public/models/LICENSE.txt` and `scripts/export-anatomy.py`.
- **Remotion** is free for individuals and small teams; check remotion.dev/license for company use.
- Fitness and nutrition content is for education only and is not medical advice.
