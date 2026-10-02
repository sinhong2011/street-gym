// A tiny side-view kinematic skeleton shared by the 2D (SVG) and 3D (three.js) renderers.
//
// Angles are absolute, in degrees, in screen space (y points down):
//   0 = pointing down, 90 = pointing right, 180 = pointing up, -90 / 270 = pointing left.
// The figure "faces" right. Every pose is pure data, so it can be interpolated by frame.

export type Vec = [number, number];

export type Limb = [upper: number, lower: number];

export type Pose = {
  torso: number; // hip -> neck
  head: number; // neck -> head centre
  arm: Limb; // near arm (shoulder -> elbow, elbow -> hand)
  leg: Limb; // near leg (hip -> knee, knee -> foot)
  armFar?: Limb;
  legFar?: Limb;
  /** Whole-body vertical offset after anchoring (negative = airborne), for jumps. */
  lift?: number;
};

export type JointName =
  | "hip"
  | "neck"
  | "head"
  | "elbow"
  | "hand"
  | "knee"
  | "foot"
  | "elbowFar"
  | "handFar"
  | "kneeFar"
  | "footFar";

export type Joints = Record<JointName, Vec>;

export const BONES = {
  torso: 30,
  neck: 11,
  headR: 6.4,
  upperArm: 17,
  foreArm: 15,
  thigh: 24,
  shin: 23,
} as const;

const RAD = Math.PI / 180;

export const dir = (deg: number): Vec => [Math.sin(deg * RAD), Math.cos(deg * RAD)];

const add = (a: Vec, len: number, deg: number): Vec => {
  const d = dir(deg);
  return [a[0] + d[0] * len, a[1] + d[1] * len];
};

export const forwardKinematics = (p: Pose): Joints => {
  const hip: Vec = [0, 0];
  const neck = add(hip, BONES.torso, p.torso);
  const head = add(neck, BONES.neck, p.head);
  const armFar = p.armFar ?? p.arm;
  const legFar = p.legFar ?? p.leg;
  const elbow = add(neck, BONES.upperArm, p.arm[0]);
  const hand = add(elbow, BONES.foreArm, p.arm[1]);
  const elbowFar = add(neck, BONES.upperArm, armFar[0]);
  const handFar = add(elbowFar, BONES.foreArm, armFar[1]);
  const knee = add(hip, BONES.thigh, p.leg[0]);
  const foot = add(knee, BONES.shin, p.leg[1]);
  const kneeFar = add(hip, BONES.thigh, legFar[0]);
  const footFar = add(kneeFar, BONES.shin, legFar[1]);
  return { hip, neck, head, elbow, hand, elbowFar, handFar, knee, foot, kneeFar, footFar };
};

const mapJoints = (j: Joints, fn: (v: Vec) => Vec): Joints =>
  Object.fromEntries(Object.entries(j).map(([k, v]) => [k, fn(v)])) as Joints;

export type PinLimb = "arm" | "armFar" | "leg" | "legFar";

/** Pins a hand or foot to a world point (a ball, a towel, a wall…) with two-bone IK, applied after anchoring. */
export type Pin = {
  limb: PinLimb;
  at: Vec | ((j: Joints) => Vec);
  /** +1 bends the middle joint clockwise from the root->target line (screen space), -1 counter-clockwise. */
  bend: 1 | -1;
};

export type Constraint = {
  /** Joint pinned to `at` (hands on the bar, feet on the floor…). */
  anchor: JointName;
  at: Vec;
  /** Optional second joint: the whole body is rotated about the anchor so this joint lands `dy` below the anchor. */
  level?: { joint: JointName; dy: number };
  pins?: Pin[];
};

const LIMBS: Record<PinLimb, { root: JointName; mid: JointName; end: JointName; a: number; b: number }> = {
  arm: { root: "neck", mid: "elbow", end: "hand", a: BONES.upperArm, b: BONES.foreArm },
  armFar: { root: "neck", mid: "elbowFar", end: "handFar", a: BONES.upperArm, b: BONES.foreArm },
  leg: { root: "hip", mid: "knee", end: "foot", a: BONES.thigh, b: BONES.shin },
  legFar: { root: "hip", mid: "kneeFar", end: "footFar", a: BONES.thigh, b: BONES.shin },
};

/** Two-bone IK. An unreachable target leaves the limb fully extended toward it. */
const ik = (root: Vec, target: Vec, a: number, b: number, bend: 1 | -1): [Vec, Vec] => {
  const dx = target[0] - root[0];
  const dy = target[1] - root[1];
  const d = Math.hypot(dx, dy);
  const dc = Math.min(Math.max(d, Math.abs(a - b) + 1e-3), a + b - 1e-3);
  const base = Math.atan2(dy, dx);
  const cosA = Math.min(Math.max((a * a + dc * dc - b * b) / (2 * a * dc), -1), 1);
  const ang = base + bend * Math.acos(cosA);
  const mid: Vec = [root[0] + a * Math.cos(ang), root[1] + a * Math.sin(ang)];
  const end: Vec = d > dc ? [root[0] + dc * Math.cos(base), root[1] + dc * Math.sin(base)] : target;
  return [mid, end];
};

/** Pose -> world-space joints, honouring the anchor (and optional levelling) constraint. */
export const solve = (pose: Pose, c: Constraint): Joints => {
  let j = forwardKinematics(pose);
  const a = j[c.anchor];
  j = mapJoints(j, (v) => [v[0] - a[0], v[1] - a[1]]);

  if (c.level) {
    const v = j[c.level.joint];
    const len = Math.hypot(v[0], v[1]);
    if (len > Math.abs(c.level.dy)) {
      let target = Math.asin(c.level.dy / len); // angle measured from +x
      if (v[0] < 0) target = Math.PI - target;
      const theta = target - Math.atan2(v[1], v[0]);
      const cs = Math.cos(theta);
      const sn = Math.sin(theta);
      j = mapJoints(j, ([x, y]) => [x * cs - y * sn, x * sn + y * cs]);
    }
  }

  const lift = pose.lift ?? 0;
  j = mapJoints(j, (v) => [v[0] + c.at[0], v[1] + c.at[1] + lift]);

  for (const pin of c.pins ?? []) {
    const L = LIMBS[pin.limb];
    const target = typeof pin.at === "function" ? pin.at(j) : pin.at;
    const [mid, end] = ik(j[L.root], target, L.a, L.b, pin.bend);
    j = { ...j, [L.mid]: mid, [L.end]: end };
  }
  return j;
};

// ---------- interpolation ----------

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpLimb = (a: Limb, b: Limb, t: number): Limb => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

export const lerpPose = (a: Pose, b: Pose, t: number): Pose => ({
  torso: lerp(a.torso, b.torso, t),
  head: lerp(a.head, b.head, t),
  arm: lerpLimb(a.arm, b.arm, t),
  leg: lerpLimb(a.leg, b.leg, t),
  armFar: lerpLimb(a.armFar ?? a.arm, b.armFar ?? b.arm, t),
  legFar: lerpLimb(a.legFar ?? a.leg, b.legFar ?? b.leg, t),
  lift: lerp(a.lift ?? 0, b.lift ?? 0, t),
});

// Smooth, non-bouncy: ease-in-out sine for strength work.
const ease = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t);

export type Keyframe = { t: number; pose: Pose; label?: string };

/** Sample a looping keyframe track at normalised progress p ∈ [0, 1). */
export const sampleTrack = (keys: Keyframe[], p: number): { pose: Pose; label?: string } => {
  const x = ((p % 1) + 1) % 1;
  for (let i = 0; i < keys.length - 1; i++) {
    const k0 = keys[i];
    const k1 = keys[i + 1];
    if (x >= k0.t && x <= k1.t) {
      const span = k1.t - k0.t || 1;
      return { pose: lerpPose(k0.pose, k1.pose, ease((x - k0.t) / span)), label: k0.label };
    }
  }
  return { pose: keys[keys.length - 1].pose, label: keys[keys.length - 1].label };
};
