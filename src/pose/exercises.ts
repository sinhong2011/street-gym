import { BONES, type Constraint, type Joints, type Keyframe, type Limb, type Pose } from "./skeleton";

const BONES_STANDING = BONES.thigh + BONES.shin;

export type Apparatus = "floor" | "bar" | "pole" | "parallettes" | "none";

/** Scenery in world units. `box` x/y is the top-left corner. */
export type Prop =
  | { kind: "floor"; y: number }
  | { kind: "wall"; x: number; y0: number; y1: number }
  | { kind: "box"; x: number; y: number; w: number; h: number }
  | { kind: "ball"; x: number; y: number; r: number }
  | { kind: "pole"; x: number }
  | { kind: "bar"; x: number; y: number }
  | { kind: "rope"; x: number; y0: number; y1: number };

export type Exercise = {
  id: string;
  zh: string;
  en: string;
  apparatus: Apparatus;
  constraint: Constraint;
  /** Seconds for one full loop (one rep / one hold cycle). */
  seconds: number;
  keys: Keyframe[];
  /** Joint traced as the orange motion path. */
  trace: "hip" | "neck" | "head" | "foot" | "hand" | "knee";
  /** Extra scenery; may follow the body (e.g. a pole the hands slide along). */
  props?: (j: Joints) => Prop[];
};

export const P = (torso: number, head: number, arm: Limb, leg: Limb, extra: Partial<Pose> = {}): Pose => ({
  torso,
  head,
  arm,
  leg,
  ...extra,
});

const ON_BAR: Constraint = { anchor: "hand", at: [0, 0] };
const ON_FLOOR = (level: "foot" | "hand" = "foot"): Constraint => ({
  anchor: level === "foot" ? "hand" : "foot",
  at: [0, 0],
  level: { joint: level, dy: 0 },
});

// ---------------- Convict Conditioning · Big Six ----------------

const pushUpTop = P(100, 104, [0, 0], [-80, -80]);
const pushUpBottom = P(100, 106, [-120, 12], [-80, -80]);

const squatTop = P(180, 182, [12, 12], [0, 0]);
const squatBottom = P(145, 158, [90, 92], [100, -30]);

const hang = P(180, 182, [180, 180], [4, 6]);
const chinOver = P(186, 176, [30, 175], [10, 4]);

const legsDown = P(180, 182, [180, 180], [0, 0]);
const legsUp = P(200, 196, [176, 176], [176, 176]);

const bridgeFlat = P(-90, -90, [160, -20], [135, 10]);
const bridgeFull = P(-68, -42, [340, -20], [60, -5]);

const hsTop = P(0, 0, [0, 0], [-180, -180]);
const hsBottom = P(12, 4, [-95, 0], [-172, -172]);

// ---------------- Street skills ----------------

const muHang = P(180, 182, [180, 180], [-6, -10]);
const muPull = P(165, 168, [15, 172], [8, -15]);
const muTransition = P(152, 150, [-60, 80], [-10, -12]);
const muSupport = P(175, 178, [0, 0], [0, 0]);

const flHang = P(180, 182, [180, 180], [0, 0]);
const flTuck = P(270, 262, [210, 210], [200, 60]);
const flFull = P(270, 266, [212, 212], [90, 90]);

const blHang = flHang;
const blTuck = P(95, 100, [220, 220], [10, -120]);
const blFull = P(90, 94, [222, 222], [-90, -90]);

const flagRise = P(200, 205, [-150, -150], [-20, -20], { armFar: [-30, -30] });
const flagFull = P(270, 268, [-150, -150], [90, 90], { armFar: [-30, -30], legFar: [88, 88] });

const plTuck = P(80, 86, [-30, -30], [40, -110]);
const plFull = P(92, 96, [-36, -36], [-90, -90]);

const lSupport = P(180, 182, [0, 0], [6, 6]);
const lSit = P(174, 178, [-4, -4], [90, 90]);

const pike = P(40, 30, [-25, -25], [-5, -5]);
const handstand = P(0, 0, [0, 0], [-180, -180]);

export const EXERCISES: Record<string, Exercise> = {
  pushup: {
    id: "pushup",
    zh: "標準俯臥撐",
    en: "Full Push-up",
    apparatus: "floor",
    constraint: ON_FLOOR("foot"),
    seconds: 4,
    trace: "neck",
    keys: [
      { t: 0, pose: pushUpTop, label: "離心 · 2 秒下放" },
      { t: 0.45, pose: pushUpBottom, label: "底部 · 胸口貼近地面" },
      { t: 0.55, pose: pushUpBottom, label: "向心 · 推起，核心鎖死" },
      { t: 1, pose: pushUpTop },
    ],
  },
  squat: {
    id: "squat",
    zh: "標準深蹲",
    en: "Full Squat",
    apparatus: "floor",
    constraint: { anchor: "foot", at: [0, 0] },
    seconds: 4,
    trace: "hip",
    keys: [
      { t: 0, pose: squatTop, label: "離心 · 髖膝同時屈曲" },
      { t: 0.45, pose: squatBottom, label: "底部 · 大腿貼小腿" },
      { t: 0.55, pose: squatBottom, label: "向心 · 腳掌全掌發力" },
      { t: 1, pose: squatTop },
    ],
  },
  pullup: {
    id: "pullup",
    zh: "標準引體向上",
    en: "Full Pull-up",
    apparatus: "bar",
    constraint: ON_BAR,
    seconds: 4,
    trace: "head",
    keys: [
      { t: 0, pose: hang, label: "啟動 · 肩胛先下沉" },
      { t: 0.4, pose: chinOver, label: "頂點 · 下巴過槓" },
      { t: 0.52, pose: chinOver, label: "離心 · 控制下放" },
      { t: 1, pose: hang },
    ],
  },
  legraise: {
    id: "legraise",
    zh: "懸垂直舉腿",
    en: "Hanging Straight Leg Raise",
    apparatus: "bar",
    constraint: ON_BAR,
    seconds: 4,
    trace: "foot",
    keys: [
      { t: 0, pose: legsDown, label: "骨盆後傾 · 腿伸直上舉" },
      { t: 0.42, pose: legsUp, label: "頂點 · 腳背觸槓" },
      { t: 0.54, pose: legsUp, label: "離心 · 不擺盪下放" },
      { t: 1, pose: legsDown },
    ],
  },
  bridge: {
    id: "bridge",
    zh: "標準橋",
    en: "Full Bridge",
    apparatus: "floor",
    constraint: ON_FLOOR("foot"),
    seconds: 5,
    trace: "hip",
    keys: [
      { t: 0, pose: bridgeFlat, label: "仰臥 · 手掌置於耳旁" },
      { t: 0.4, pose: bridgeFull, label: "推起 · 髖部向天花板" },
      { t: 0.6, pose: bridgeFull, label: "頂點 · 手臂伸直拱背" },
      { t: 1, pose: bridgeFlat },
    ],
  },
  hspu: {
    id: "hspu",
    zh: "倒立撐",
    en: "Handstand Push-up",
    apparatus: "floor",
    constraint: { anchor: "hand", at: [0, 0] },
    seconds: 4,
    trace: "head",
    keys: [
      { t: 0, pose: hsTop, label: "離心 · 頭部向前下" },
      { t: 0.45, pose: hsBottom, label: "底部 · 頭頂輕觸地" },
      { t: 0.55, pose: hsBottom, label: "向心 · 推地伸肘" },
      { t: 1, pose: hsTop },
    ],
  },

  muscleup: {
    id: "muscleup",
    zh: "雙力臂",
    en: "Muscle-up",
    apparatus: "bar",
    constraint: ON_BAR,
    seconds: 5,
    trace: "neck",
    keys: [
      { t: 0, pose: muHang, label: "爆發拉 · 拉到腰而非下巴" },
      { t: 0.22, pose: muPull, label: "轉換 · 手腕翻上槓面" },
      { t: 0.36, pose: muTransition, label: "推起 · 槓上臂屈伸" },
      { t: 0.5, pose: muSupport, label: "鎖定 · 直臂撐體" },
      { t: 0.62, pose: muSupport, label: "離心 · 控制回到轉換" },
      { t: 0.76, pose: muTransition, label: "離心 · 慢放回懸垂" },
      { t: 0.88, pose: muPull },
      { t: 1, pose: muHang },
    ],
  },
  frontlever: {
    id: "frontlever",
    zh: "前水平",
    en: "Front Lever",
    apparatus: "bar",
    constraint: ON_BAR,
    seconds: 6,
    trace: "foot",
    keys: [
      { t: 0, pose: flHang, label: "直臂下壓 · 背闊發力" },
      { t: 0.2, pose: flTuck, label: "團身前水平" },
      { t: 0.34, pose: flTuck, label: "伸髖 · 拉長槓桿" },
      { t: 0.52, pose: flFull, label: "全前水平 · 身體一直線" },
      { t: 0.8, pose: flFull, label: "離心 · 放回懸垂" },
      { t: 1, pose: flHang },
    ],
  },
  backlever: {
    id: "backlever",
    zh: "後水平",
    en: "Back Lever",
    apparatus: "bar",
    constraint: ON_BAR,
    seconds: 6,
    trace: "foot",
    keys: [
      { t: 0, pose: blHang, label: "肩伸展 · 胸口朝下" },
      { t: 0.22, pose: blTuck, label: "團身後水平" },
      { t: 0.36, pose: blTuck, label: "伸髖 · 夾臀" },
      { t: 0.54, pose: blFull, label: "全後水平 · 肱二頭保護" },
      { t: 0.8, pose: blFull, label: "離心 · 放回懸垂" },
      { t: 1, pose: blHang },
    ],
  },
  flag: {
    id: "flag",
    zh: "人體旗幟",
    en: "Human Flag",
    apparatus: "pole",
    constraint: ON_BAR,
    seconds: 5,
    trace: "foot",
    keys: [
      { t: 0, pose: flagRise, label: "上手拉 · 下手推" },
      { t: 0.35, pose: flagFull, label: "側鏈收緊 · 髖部上提" },
      { t: 0.7, pose: flagFull, label: "旗幟 · 身體平行地面" },
      { t: 1, pose: flagRise },
    ],
  },
  planche: {
    id: "planche",
    zh: "俄挺",
    en: "Planche",
    apparatus: "parallettes",
    constraint: { anchor: "hand", at: [0, 0] },
    seconds: 6,
    trace: "foot",
    keys: [
      { t: 0, pose: plTuck, label: "團身俄挺 · 肩胛前引" },
      { t: 0.18, pose: plTuck, label: "伸髖 · 肩前傾補償" },
      { t: 0.45, pose: plFull, label: "全俄挺 · 直臂鎖肘" },
      { t: 0.78, pose: plFull, label: "收腿回團身" },
      { t: 1, pose: plTuck },
    ],
  },
  lsit: {
    id: "lsit",
    zh: "L 型支撐",
    en: "L-Sit",
    apparatus: "parallettes",
    constraint: { anchor: "hand", at: [0, 0] },
    seconds: 5,
    trace: "foot",
    keys: [
      { t: 0, pose: lSupport, label: "撐體 · 肩下壓" },
      { t: 0.25, pose: lSit, label: "屈髖 · 股四頭鎖膝" },
      { t: 0.8, pose: lSit, label: "保持 · 腳尖繃直" },
      { t: 1, pose: lSupport },
    ],
  },
  handstand: {
    id: "handstand",
    zh: "倒立",
    en: "Press to Handstand",
    apparatus: "floor",
    constraint: { anchor: "hand", at: [0, 0] },
    seconds: 6,
    trace: "foot",
    keys: [
      { t: 0, pose: pike, label: "屈體 · 肩前傾越過手" },
      { t: 0.4, pose: handstand, label: "推起 · 肩膀推高耳朵" },
      { t: 0.78, pose: handstand, label: "平衡 · 手指控制重心" },
      { t: 1, pose: pike },
    ],
  },
};

// ---------------- Conditioning (HIIT) ----------------
const handsDown = (limb: "arm" | "armFar") => ({
  limb,
  at: (j: Joints): [number, number] => {
    const h = limb === "arm" ? j.hand : j.handFar;
    return [h[0], Math.min(h[1], 0)];
  },
  bend: 1 as const,
});

const stand = P(180, 182, [8, 8], [0, 0], { armFar: [-8, -8] });
const crouch = P(130, 140, [10, 4], [100, -30]);
const plank = P(114, 118, [14, 14], [-66, -66]);
const airborne = P(180, 182, [170, 175], [0, 0], { armFar: [165, 172], lift: -14 });

const climbA = P(114, 118, [14, 14], [40, -80], { legFar: [-66, -66] });
const climbB = P(114, 118, [14, 14], [-66, -66], { legFar: [40, -80] });

const kneeA = P(180, 182, [-35, 60], [90, -5], { armFar: [35, 130], legFar: [0, 0], lift: -3 });
const kneeB = P(180, 182, [35, 130], [0, 0], { armFar: [-35, 60], legFar: [90, -5], lift: -3 });

const jsLow = P(140, 150, [-30, -20], [96, -30]);
const jsAir = P(182, 184, [40, 60], [0, 4], { lift: -18 });

export const CARDIO: Record<string, Exercise> = {
  burpee: {
    id: "burpee",
    zh: "波比跳",
    en: "Burpee",
    apparatus: "floor",
    constraint: { anchor: "foot", at: [0, 0], pins: [handsDown("arm"), handsDown("armFar")] },
    seconds: 3,
    trace: "hip",
    keys: [
      { t: 0, pose: stand, label: "下蹲 · 雙手撐地" },
      { t: 0.2, pose: crouch, label: "向後跳成平板" },
      { t: 0.38, pose: plank, label: "收腿回蹲" },
      { t: 0.55, pose: crouch, label: "爆發起跳 · 雙手過頭" },
      { t: 0.75, pose: airborne, label: "落地緩衝" },
      { t: 1, pose: stand },
    ],
  },
  climber: {
    id: "climber",
    zh: "登山者",
    en: "Mountain Climber",
    apparatus: "floor",
    constraint: { anchor: "hand", at: [0, 0] },
    seconds: 1.4,
    trace: "knee",
    keys: [
      { t: 0, pose: climbA, label: "膝蓋快速帶向胸口 · 髖部不抬高" },
      { t: 0.5, pose: climbB },
      { t: 1, pose: climbA },
    ],
  },
  highknees: {
    id: "highknees",
    zh: "高抬腿",
    en: "High Knees",
    apparatus: "floor",
    constraint: { anchor: "hip", at: [0, -BONES_STANDING] },
    seconds: 1,
    trace: "knee",
    keys: [
      { t: 0, pose: kneeA, label: "膝蓋抬到髖高 · 前腳掌落地" },
      { t: 0.5, pose: kneeB },
      { t: 1, pose: kneeA },
    ],
  },
  jumpsquat: {
    id: "jumpsquat",
    zh: "深蹲跳",
    en: "Jump Squat",
    apparatus: "floor",
    constraint: { anchor: "foot", at: [0, 0] },
    seconds: 2,
    trace: "hip",
    keys: [
      { t: 0, pose: jsLow, label: "爆發伸髖起跳" },
      { t: 0.35, pose: jsAir, label: "落地 · 屈膝吸收衝擊" },
      { t: 0.7, pose: jsLow, label: "底部 · 預備下一下" },
      { t: 1, pose: jsLow },
    ],
  },
};

// ---------------- Warm-up ----------------
const upright = (extra: Partial<Pose> = {}) => P(180, 182, [6, 6], [0, 0], extra);

export const WARMUP: Record<string, Exercise> = {
  armcircle: {
    id: "armcircle",
    zh: "手臂繞環",
    en: "Arm Circles",
    apparatus: "floor",
    constraint: { anchor: "foot", at: [0, 0] },
    seconds: 2.4,
    trace: "hand",
    keys: [
      { t: 0, pose: upright({ arm: [0, 0], armFar: [180, 180] }), label: "大圈 · 肩膀放鬆不聳肩" },
      { t: 0.5, pose: upright({ arm: [180, 180], armFar: [360, 360] }) },
      { t: 1, pose: upright({ arm: [360, 360], armFar: [540, 540] }) },
    ],
  },
  legswing: {
    id: "legswing",
    zh: "腿擺盪",
    en: "Leg Swings",
    apparatus: "floor",
    constraint: { anchor: "footFar", at: [0, 0] },
    seconds: 1.8,
    trace: "foot",
    keys: [
      { t: 0, pose: upright({ arm: [70, 80], armFar: [-40, -30], leg: [-35, -40], legFar: [0, 0] }), label: "前後擺盪 · 軀幹保持直立" },
      { t: 0.5, pose: upright({ arm: [70, 80], armFar: [-40, -30], leg: [75, 70], legFar: [0, 0] }) },
      { t: 1, pose: upright({ arm: [70, 80], armFar: [-40, -30], leg: [-35, -40], legFar: [0, 0] }) },
    ],
  },
  hinge: {
    id: "hinge",
    zh: "髖鉸鏈",
    en: "Hip Hinge",
    apparatus: "floor",
    constraint: { anchor: "foot", at: [0, 0] },
    seconds: 3,
    trace: "hip",
    keys: [
      { t: 0, pose: P(180, 182, [0, 0], [0, 0]), label: "臀部向後推 · 背部打直" },
      { t: 0.45, pose: P(98, 104, [0, 0], [14, -6]), label: "感覺腿後側拉伸" },
      { t: 0.55, pose: P(98, 104, [0, 0], [14, -6]), label: "夾臀站直" },
      { t: 1, pose: P(180, 182, [0, 0], [0, 0]) },
    ],
  },
  lunge: {
    id: "lunge",
    zh: "弓步伸展",
    en: "Lunge & Reach",
    apparatus: "floor",
    constraint: { anchor: "foot", at: [0, 0] },
    seconds: 4,
    trace: "hand",
    keys: [
      { t: 0, pose: P(180, 182, [6, 6], [22, -2], { legFar: [-24, -24] }), label: "前腳踩穩 · 後膝下沉" },
      { t: 0.45, pose: P(196, 200, [196, 196], [82, 0], { legFar: [-46, -112] }), label: "雙手上舉 · 伸展髖屈肌" },
      { t: 0.6, pose: P(196, 200, [196, 196], [82, 0], { legFar: [-46, -112] }), label: "回到站姿" },
      { t: 1, pose: P(180, 182, [6, 6], [22, -2], { legFar: [-24, -24] }) },
    ],
  },
  squathold: {
    id: "squathold",
    zh: "深蹲停留",
    en: "Deep Squat Hold",
    apparatus: "floor",
    constraint: { anchor: "foot", at: [0, 0] },
    seconds: 3,
    trace: "hip",
    keys: [
      { t: 0, pose: P(146, 160, [60, 120], [102, -32]), label: "手肘撐開膝蓋 · 左右搖擺" },
      { t: 0.5, pose: P(156, 168, [70, 130], [96, -26]) },
      { t: 1, pose: P(146, 160, [60, 120], [102, -32]) },
    ],
  },
  downdog: {
    id: "downdog",
    zh: "平板 ↔ 下犬式",
    en: "Plank to Down Dog",
    apparatus: "floor",
    constraint: { anchor: "hand", at: [0, 0], level: { joint: "foot", dy: 0 } },
    seconds: 3.2,
    trace: "hip",
    keys: [
      { t: 0, pose: P(90, 96, [0, 0], [-90, -90]), label: "臀部推高 · 胸口壓向大腿" },
      { t: 0.45, pose: P(32, 22, [32, 32], [-32, -32]), label: "腳跟往地面" },
      { t: 0.6, pose: P(32, 22, [32, 32], [-32, -32]), label: "回到平板 · 肩膀推離地面" },
      { t: 1, pose: P(90, 96, [0, 0], [-90, -90]) },
    ],
  },
};

/** A seamless sequence for the 3D hero: all three moves start and end in a dead hang. */
export const HERO_SEQUENCE: { id: keyof typeof EXERCISES; weight: number }[] = [
  { id: "muscleup", weight: 0.4 },
  { id: "frontlever", weight: 0.3 },
  { id: "backlever", weight: 0.3 },
];
