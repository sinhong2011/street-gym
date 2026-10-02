// Shared composition specs so the website Player and Remotion Studio render identically.
export const FPS = 30;
export const HERO = { width: 1080, height: 1350, durationInFrames: FPS * 18 } as const;
export const DEMO = { width: 1280, height: 960 } as const;
