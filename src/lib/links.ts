// Cross-section links: any demo can ask the muscle map to focus a movement.

const FAMILY_MOVE: Record<string, string> = {
  push: "pushup",
  squat: "squat",
  pull: "pullup",
  leg: "legraise",
  bridge: "bridge",
  hs: "hspu",
};
const SKILL_MOVES = new Set(["pushup", "squat", "pullup", "legraise", "bridge", "hspu", "lsit", "handstand", "muscleup", "backlever", "frontlever", "flag", "planche"]);

/** Exercise id (e.g. "push-7", "frontlever") -> muscle-map movement id, or null for warm-ups / cardio. */
export const moveForExercise = (exId: string | undefined): string | null => {
  if (!exId) return null;
  if (SKILL_MOVES.has(exId)) return exId;
  const fam = exId.split("-")[0];
  return FAMILY_MOVE[fam] ?? null;
};

export const SHOW_MUSCLES = "sg:show-muscles";

export const showMuscles = (moveId: string) => {
  window.dispatchEvent(new CustomEvent(SHOW_MUSCLES, { detail: moveId }));
  document.getElementById("muscles")?.scrollIntoView({ behavior: "smooth", block: "start" });
};
