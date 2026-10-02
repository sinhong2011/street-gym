// 《囚徒健身》六藝 × 十式：每一式都有自己的動畫軌跡。
// Poses are authored in the conventions of skeleton.ts (absolute degrees, 0 = down, 90 = right).
import { CARDIO, EXERCISES, P, WARMUP, type Exercise, type Prop } from "./exercises";
import { solve, type Constraint, type Joints, type Keyframe, type Pose, type Vec } from "./skeleton";

export type Step = { zh: string; en: string; how: string; ex: Exercise };

const FLOOR = (y = 0): Prop => ({ kind: "floor", y });

/** One rep: lower (or raise) to `b`, pause, return. */
const rep = (a: Pose, b: Pose, labels: [string, string, string], pause = 0.1): Keyframe[] => [
  { t: 0, pose: a, label: labels[0] },
  { t: 0.5 - pause / 2, pose: b, label: labels[1] },
  { t: 0.5 + pause / 2, pose: b, label: labels[2] },
  { t: 1, pose: a },
];

const make = (
  id: string,
  zh: string,
  en: string,
  constraint: Constraint,
  keys: Keyframe[],
  opts: { trace?: Exercise["trace"]; seconds?: number; props?: Exercise["props"] } = {},
): Exercise => ({
  id,
  zh,
  en,
  apparatus: "none",
  constraint,
  keys,
  seconds: opts.seconds ?? 4,
  trace: opts.trace ?? "neck",
  props: opts.props,
});

// ======================= 推 · PUSH =======================
// Flat body frame (torso 90): the level constraint tilts the whole body so the feet/knees land on the floor.
const PUSH_L: [string, string, string] = ["離心 · 2 秒下放", "底部 · 停頓一拍", "向心 · 推起，身體一直線"];
const pushTop = (kneel = false): Pose => P(90, 96, [0, 0], kneel ? [-90, -145] : [-90, -90]);
const pushBottom = (depth: number, kneel = false): Pose => P(90, 98, [-130 * depth, 4 * depth], kneel ? [-90, -145] : [-90, -90]);
const BEHIND_BACK: [number, number] = [-120, -69];

type PushOpt = { handH?: number; kneel?: boolean; depth?: number; far?: "behind" | "ball" | "lever"; wall?: boolean };
const push = (n: number, zh: string, en: string, o: PushOpt): Exercise => {
  const handH = o.handH ?? 0;
  const depth = o.depth ?? 1;
  const top = pushTop(o.kneel);
  const bottom = pushBottom(depth, o.kneel);
  if (o.far === "behind") {
    top.armFar = BEHIND_BACK;
    bottom.armFar = BEHIND_BACK;
  }
  const pins: Constraint["pins"] = [];
  const props: Prop[] = [FLOOR(handH)];
  if (o.far === "ball") {
    props.push({ kind: "ball", x: 11, y: -7, r: 7 });
    pins.push({ limb: "armFar", at: [11, -14], bend: -1 });
  }
  if (o.far === "lever") {
    props.push({ kind: "ball", x: 28, y: -7, r: 7 });
    pins.push({ limb: "armFar", at: [28, -14], bend: -1 });
  }
  if (o.wall) props.push({ kind: "wall", x: 2, y0: -70, y1: handH });
  else if (handH > 4) props.push({ kind: "box", x: -9, y: 0, w: 18, h: handH });
  return make(
    `push-${n}`,
    zh,
    en,
    { anchor: "hand", at: [0, 0], level: { joint: o.kneel ? "knee" : "foot", dy: handH }, pins },
    rep(top, bottom, PUSH_L),
    { props: () => props },
  );
};

// ======================= 蹲 · SQUAT =======================
const SQ_L: [string, string, string] = ["離心 · 髖膝同時屈曲", "底部 · 不反彈", "向心 · 全腳掌推地"];
const sqTop = P(180, 182, [12, 12], [0, 0]);
const sqFull = P(145, 158, [90, 92], [100, -30]);
const sqHalf = P(165, 172, [70, 74], [55, -25]);
const ON_FEET: Constraint = { anchor: "foot", at: [0, 0] };

const squat = (n: number, zh: string, en: string, top: Pose, bottom: Pose, extra: Partial<Constraint> = {}, props: Exercise["props"] = () => [FLOOR()]): Exercise =>
  make(`squat-${n}`, zh, en, { ...ON_FEET, ...extra }, rep(top, bottom, SQ_L), { trace: "hip", props });

const withFar = (p: Pose, far: Partial<Pose>): Pose => ({ ...p, ...far });

// ======================= 拉 · PULL =======================
const PULL_L: [string, string, string] = ["啟動 · 肩胛下沉後收", "頂點 · 停頓", "離心 · 控制下放"];
const ON_BAR: Constraint = { anchor: "hand", at: [0, 0] };
const hang = P(180, 182, [180, 180], [4, 6]);
const chin = P(186, 176, [30, 175], [10, 4]);
const halfHang = P(182, 180, [95, 178], [6, 6]);
const BAR: Prop = { kind: "bar", x: 0, y: 0 };

const pull = (n: number, zh: string, en: string, a: Pose, b: Pose, extra: Partial<Constraint> = {}, props: Prop[] = [BAR]): Exercise =>
  make(`pull-${n}`, zh, en, { ...ON_BAR, ...extra }, rep(a, b, PULL_L), { trace: "head", props: () => props });

// ======================= 舉 · LEG RAISE =======================
const LEG_L: [string, string, string] = ["骨盆後傾 · 腹部發力", "頂點 · 停頓", "離心 · 慢放不擺盪"];
const ON_HIP: Constraint = { anchor: "hip", at: [0, 0] };
const lyingTorso = (leg: [number, number]) => P(-90, -90, [90, 90], leg);
const hangLegs = (leg: [number, number], torso = 180) => P(torso, torso + 2, [180 - (torso - 180) * 0.2, 180 - (torso - 180) * 0.2], leg);

const legFlat = (n: number, zh: string, en: string, keys: Keyframe[]): Exercise =>
  make(`leg-${n}`, zh, en, ON_HIP, keys, { trace: "foot", props: () => [FLOOR(4)] });
const legHang = (n: number, zh: string, en: string, keys: Keyframe[]): Exercise =>
  make(`leg-${n}`, zh, en, ON_BAR, keys, { trace: "foot", props: () => [BAR] });

// ======================= 橋 · BRIDGE =======================
const BR_L: [string, string, string] = ["推起 · 髖部向上", "頂點 · 拱起停頓", "下放 · 控制回到地面"];
const brFull = P(-68, -42, [340, -20], [60, -5]);
const handsOnFloor = (limb: "arm" | "armFar"): NonNullable<Constraint["pins"]>[number] => ({
  limb,
  at: (j: Joints): Vec => {
    const h = limb === "arm" ? j.hand : j.handFar;
    return [h[0], Math.min(h[1], 0)];
  },
  bend: 1,
});

// ======================= 倒 · HANDSTAND =======================
const HS_L: [string, string, string] = ["離心 · 頭部向前下", "底部 · 停頓", "向心 · 推地伸肘"];
const hsTop = P(0, 0, [0, 0], [-182, -182]);
const hsFull = P(12, 4, [-95, 0], [-172, -172]);
const hsHalf = P(6, 2, [-50, 0], [-177, -177]);
const ON_HANDS: Constraint = { anchor: "hand", at: [0, 0] };
const hspu = (n: number, zh: string, en: string, a: Pose, b: Pose, extra: Partial<Constraint> = {}, props: Prop[] = [FLOOR()]): Exercise =>
  make(`hs-${n}`, zh, en, { ...ON_HANDS, ...extra }, rep(a, b, HS_L), { trace: "head", props: () => props });
const ARM_OUT: [number, number] = [-100, -100];

// ---------- static scenery that depends on a solved pose ----------
const halfBridgeMid = P(-80, -66, [250, -20], [100, 2]);
const halfBridgeHip = solve(halfBridgeMid, { anchor: "hand", at: [0, 0], level: { joint: "foot", dy: 0 } }).hip;

const standing = P(180, 182, [180, 180], [0, 0]);
const archBack = P(228, 240, [255, 255], [18, -22]);
const bridgeFromFeet = P(292, 318, [338, 338], [62, -8]);
const wallWalkTop = P(198, 204, [212, 212], [6, -6]);
const wallWalkLow = P(268, 292, [292, 292], [44, -34]);
const WALL_X = -36;
const handsOnWall = (limb: "arm" | "armFar"): NonNullable<Constraint["pins"]>[number] => ({
  limb,
  at: (j: Joints): Vec => [WALL_X + 1.5, (limb === "arm" ? j.hand : j.handFar)[1]],
  bend: -1,
});

// ===================================================================

export const PROGRESSIONS: Record<string, Step[]> = {
  push: [
    { zh: "牆壁俯臥撐", en: "Wall Push-up", how: "面向牆站立，雙手與肩同高同寬撐牆，胸口靠近牆面再推回。", ex: push(1, "牆壁俯臥撐", "Wall Push-up", { handH: 52, wall: true }) },
    { zh: "上斜俯臥撐", en: "Incline Push-up", how: "雙手撐在桌面或椅面，身體保持一直線，胸口觸及支撐物邊緣。", ex: push(2, "上斜俯臥撐", "Incline Push-up", { handH: 28 }) },
    { zh: "跪姿俯臥撐", en: "Kneeling Push-up", how: "以膝蓋為支點，膝到肩一直線，胸口下到離地一拳高。", ex: push(3, "跪姿俯臥撐", "Kneeling Push-up", { kneel: true }) },
    { zh: "半俯臥撐", en: "Half Push-up", how: "標準撐姿，只下放到手肘約九十度，在半程內累積力量。", ex: push(4, "半俯臥撐", "Half Push-up", { depth: 0.55 }) },
    { zh: "標準俯臥撐", en: "Full Push-up", how: "雙手與肩同寬，全程身體一直線，胸口幾乎觸地再推起。", ex: push(5, "標準俯臥撐", "Full Push-up", {}) },
    { zh: "窄距俯臥撐", en: "Close Push-up", how: "兩手食指相觸放在胸口正下方，肱三頭負荷大增（側視角下軌跡同標準版）。", ex: push(6, "窄距俯臥撐", "Close Push-up", {}) },
    { zh: "偏重俯臥撐", en: "Uneven Push-up", how: "一手撐地、另一手放在籃球上，重心偏向撐地手。", ex: push(7, "偏重俯臥撐", "Uneven Push-up", { far: "ball" }) },
    { zh: "單臂半俯臥撐", en: "½ One-Arm Push-up", how: "雙腳分開加寬支撐，另一手放在背後，單臂只做半程。", ex: push(8, "單臂半俯臥撐", "½ One-Arm Push-up", { far: "behind", depth: 0.55 }) },
    { zh: "槓桿俯臥撐", en: "Lever Push-up", how: "一手撐地，另一手伸直壓在前方的籃球上，只提供最少的輔助。", ex: push(9, "槓桿俯臥撐", "Lever Push-up", { far: "lever" }) },
    { zh: "單臂俯臥撐", en: "One-Arm Push-up", how: "單手撐地，雙腳分開，全程下到底，髖部不可旋轉。", ex: push(10, "單臂俯臥撐", "One-Arm Push-up", { far: "behind" }) },
  ],

  squat: [
    {
      zh: "肩倒立深蹲",
      en: "Shoulderstand Squat",
      how: "以肩膀倒立、雙手托腰，屈膝把膝蓋帶到額頭，再伸直雙腿。",
      ex: make(
        "squat-1",
        "肩倒立深蹲",
        "Shoulderstand Squat",
        { anchor: "neck", at: [0, -3] },
        rep(P(0, -90, [90, 200], [180, 180]), P(8, -90, [90, 205], [238, 104]), ["屈膝 · 膝蓋帶向額頭", "底部 · 停頓", "伸直雙腿向上"]),
        { trace: "knee", props: () => [FLOOR()] },
      ),
    },
    {
      zh: "折刀深蹲",
      en: "Jackknife Squat",
      how: "雙手撐在前方約膝高的支撐物上，身體前折，用手分擔重量蹲到底。",
      ex: squat(2, "折刀深蹲", "Jackknife Squat", P(118, 128, [60, 60], [0, 0]), P(126, 140, [60, 60], [100, -30]), {
        pins: [
          { limb: "arm", at: [40, -46], bend: 1 },
          { limb: "armFar", at: [40, -46], bend: 1 },
        ],
      }, () => [FLOOR(), { kind: "box", x: 34, y: -46, w: 20, h: 46 }]),
    },
    {
      zh: "支撐深蹲",
      en: "Supported Squat",
      how: "雙手扶住穩固的直立物，借手的輔助下蹲到底再站起。",
      ex: squat(3, "支撐深蹲", "Supported Squat", P(176, 180, [90, 90], [0, 0]), P(150, 160, [90, 90], [100, -30]), {
        pins: (["arm", "armFar"] as const).map((limb) => ({ limb, at: (j: Joints): Vec => [30, j.neck[1] + 10], bend: 1 as const })),
      }, () => [FLOOR(), { kind: "pole", x: 31.5 }]),
    },
    { zh: "半深蹲", en: "Half Squat", how: "下蹲到大腿約與地面成 45 度即站起，膝蓋對準腳尖。", ex: squat(4, "半深蹲", "Half Squat", sqTop, sqHalf) },
    { zh: "標準深蹲", en: "Full Squat", how: "雙腳與肩同寬，蹲到大腿後側貼住小腿，腳跟不離地。", ex: squat(5, "標準深蹲", "Full Squat", sqTop, sqFull) },
    { zh: "窄距深蹲", en: "Close Squat", how: "雙腳併攏，對踝關節活動度與平衡要求更高（側視角下軌跡同標準版）。", ex: squat(6, "窄距深蹲", "Close Squat", sqTop, sqFull) },
    {
      zh: "偏重深蹲",
      en: "Uneven Squat",
      how: "一腳踩在籃球上，主要由著地腳發力，籃球腳只輔助平衡。",
      ex: squat(7, "偏重深蹲", "Uneven Squat", sqTop, sqFull, {
        pins: [{ limb: "legFar", at: [16, -18], bend: -1 }],
      }, () => [FLOOR(), { kind: "ball", x: 16, y: -9, r: 9 }]),
    },
    {
      zh: "單腿半深蹲",
      en: "½ One-Leg Squat",
      how: "另一腿向前伸直離地，支撐腿下蹲到半程。",
      ex: squat(8, "單腿半深蹲", "½ One-Leg Squat", withFar(sqTop, { legFar: [28, 28] }), withFar(P(160, 168, [75, 78], [60, -30]), { legFar: [72, 76] })),
    },
    {
      zh: "輔助單腿深蹲",
      en: "Assisted One-Leg Squat",
      how: "單腿蹲到底，同側手扶住直立物提供少量輔助。",
      ex: squat(9, "輔助單腿深蹲", "Assisted One-Leg Squat", withFar(sqTop, { legFar: [24, 24] }), withFar(sqFull, { legFar: [84, 88] }), {
        pins: [{ limb: "armFar", at: (j: Joints): Vec => [30, j.neck[1] + 12], bend: 1 }],
      }, () => [FLOOR(), { kind: "pole", x: 31.5 }]),
    },
    {
      zh: "單腿深蹲",
      en: "One-Leg Squat",
      how: "俗稱手槍蹲：另一腿前伸，雙手前平舉，單腿蹲到底再站起。",
      ex: squat(10, "單腿深蹲", "One-Leg Squat", withFar(sqTop, { legFar: [24, 24] }), withFar(P(140, 156, [92, 94], [100, -30]), { legFar: [86, 90] })),
    },
  ],

  pull: [
    {
      zh: "垂直引體",
      en: "Vertical Pull",
      how: "面對門框或柱子站立，雙手握住，身體後傾再把胸口拉向支撐物。",
      ex: make(
        "pull-1",
        "垂直引體",
        "Vertical Pull",
        { ...ON_FEET, pins: (["arm", "armFar"] as const).map((limb) => ({ limb, at: [14, -84] as Vec, bend: 1 as const })) },
        rep(P(191, 194, [140, 140], [11, 11]), P(181, 183, [140, 140], [1, 1]), ["身體後傾 · 手臂伸直", "頂點 · 胸口貼近", "離心 · 慢慢後傾"]),
        { trace: "neck", props: () => [FLOOR(), { kind: "pole", x: 15.5 }] },
      ),
    },
    {
      zh: "水平引體",
      en: "Horizontal Pull",
      how: "躺在穩固的桌子或低槓下，腳跟著地，身體一直線把胸口拉向槓。",
      ex: pull(2, "水平引體", "Horizontal Pull", P(270, 266, [190, 190], [90, 90]), P(270, 264, [40, 170], [90, 90]), { level: { joint: "foot", dy: 62 } }, [BAR, FLOOR(62)]),
    },
    {
      zh: "折刀引體",
      en: "Jackknife Pull-up",
      how: "雙腳放在前方椅子上，身體與腿成直角，腿部輔助把下巴拉過槓。",
      ex: pull(3, "折刀引體", "Jackknife Pull-up", hang, chin, {
        pins: (["leg", "legFar"] as const).map((limb) => ({ limb, at: [46, 58] as Vec, bend: -1 as const })),
      }, [BAR, FLOOR(100), { kind: "box", x: 38, y: 58, w: 20, h: 42 }]),
    },
    { zh: "半引體", en: "Half Pull-up", how: "從手肘九十度開始，把下巴拉過槓，只練上半程。", ex: pull(4, "半引體", "Half Pull-up", halfHang, chin) },
    { zh: "標準引體", en: "Full Pull-up", how: "從直臂懸垂開始，下巴過槓，再控制下放到手臂完全伸直。", ex: pull(5, "標準引體", "Full Pull-up", hang, chin) },
    { zh: "窄距引體", en: "Close Pull-up", how: "雙手靠攏握槓，二頭與背闊負荷提高（側視角下軌跡同標準版）。", ex: pull(6, "窄距引體", "Close Pull-up", hang, chin) },
    {
      zh: "偏重引體",
      en: "Uneven Pull-up",
      how: "一手握槓，另一手握住掛在槓上的毛巾較低處，主力在握槓手。",
      ex: pull(7, "偏重引體", "Uneven Pull-up", hang, chin, { pins: [{ limb: "armFar", at: [0, 26], bend: 1 }] }, [BAR, { kind: "rope", x: 0, y0: 0, y1: 30 }]),
    },
    {
      zh: "單臂半引體",
      en: "½ One-Arm Pull-up",
      how: "單手握槓，從手肘九十度拉到頂點，另一手放鬆垂下。",
      ex: pull(8, "單臂半引體", "½ One-Arm Pull-up", withFar(halfHang, { armFar: [14, 6] }), withFar(chin, { armFar: [20, 8] })),
    },
    {
      zh: "輔助單臂引體",
      en: "Assisted One-Arm Pull-up",
      how: "單手握槓，另一手握住毛巾最低處，只在需要時給一點幫助。",
      ex: pull(9, "輔助單臂引體", "Assisted One-Arm Pull-up", hang, chin, { pins: [{ limb: "armFar", at: [0, 40], bend: 1 }] }, [BAR, { kind: "rope", x: 0, y0: 0, y1: 44 }]),
    },
    {
      zh: "單臂引體",
      en: "One-Arm Pull-up",
      how: "單手全程從直臂懸垂拉到下巴過槓，身體不旋轉。",
      ex: pull(10, "單臂引體", "One-Arm Pull-up", withFar(hang, { armFar: [12, 4] }), withFar(chin, { armFar: [20, 8] })),
    },
  ],

  leg: [
    {
      zh: "坐姿屈膝",
      en: "Knee Tuck",
      how: "坐在椅子邊緣，雙手扶椅，身體微後仰，把膝蓋收向胸口。",
      ex: make(
        "leg-1",
        "坐姿屈膝",
        "Knee Tuck",
        { ...ON_HIP, pins: (["arm", "armFar"] as const).map((limb) => ({ limb, at: [-12, 4] as Vec, bend: -1 as const })) },
        rep(P(200, 194, [0, 0], [78, 72]), P(196, 190, [0, 0], [150, 22]), LEG_L),
        { trace: "foot", props: () => [{ kind: "box", x: -18, y: 5, w: 28, h: 45 }, FLOOR(50)] },
      ),
    },
    { zh: "平臥抬膝", en: "Flat Knee Raise", how: "仰臥屈膝，腳跟貼地，把膝蓋抬到胸口上方。", ex: legFlat(2, "平臥抬膝", "Flat Knee Raise", rep(lyingTorso([135, 15]), lyingTorso([200, 70]), LEG_L)) },
    { zh: "平臥屈舉腿", en: "Flat Bent Leg Raise", how: "仰臥，膝蓋保持約九十度，從低處把大腿舉到垂直。", ex: legFlat(3, "平臥屈舉腿", "Flat Bent Leg Raise", rep(lyingTorso([128, 40]), lyingTorso([180, 90]), LEG_L)) },
    {
      zh: "平臥蛙舉腿",
      en: "Flat Frog Raise",
      how: "從雙腿伸直平放開始，屈膝上收，到頂點時伸直雙腿朝天。",
      ex: legFlat(4, "平臥蛙舉腿", "Flat Frog Raise", [
        { t: 0, pose: lyingTorso([92, 92]), label: "屈膝上收" },
        { t: 0.3, pose: lyingTorso([160, 40]), label: "伸直雙腿朝天" },
        { t: 0.5, pose: lyingTorso([180, 180]), label: "頂點 · 停頓" },
        { t: 0.62, pose: lyingTorso([180, 180]), label: "伸直腿慢放" },
        { t: 1, pose: lyingTorso([92, 92]) },
      ]),
    },
    { zh: "平臥直舉腿", en: "Flat Straight Leg Raise", how: "仰臥雙腿伸直併攏，舉到與地面垂直，下背貼地。", ex: legFlat(5, "平臥直舉腿", "Flat Straight Leg Raise", rep(lyingTorso([92, 92]), lyingTorso([180, 180]), LEG_L)) },
    { zh: "懸垂屈膝", en: "Hanging Knee Raise", how: "雙手懸垂於單槓，膝蓋抬到胸口高度，不靠擺盪。", ex: legHang(6, "懸垂屈膝", "Hanging Knee Raise", rep(hangLegs([0, 0]), hangLegs([120, -10], 190), LEG_L)) },
    { zh: "懸垂屈舉腿", en: "Hanging Bent Leg Raise", how: "懸垂，膝蓋保持九十度，把大腿舉到與地面平行以上。", ex: legHang(7, "懸垂屈舉腿", "Hanging Bent Leg Raise", rep(hangLegs([0, -80]), hangLegs([105, 15], 190), LEG_L)) },
    {
      zh: "懸垂蛙舉腿",
      en: "Hanging Frog Raise",
      how: "懸垂，屈膝上收後在頂點伸直雙腿，再直腿下放。",
      ex: legHang(8, "懸垂蛙舉腿", "Hanging Frog Raise", [
        { t: 0, pose: hangLegs([0, 0]), label: "屈膝上收" },
        { t: 0.3, pose: hangLegs([120, -10], 190), label: "頂點伸直雙腿" },
        { t: 0.5, pose: hangLegs([100, 100], 192), label: "停頓" },
        { t: 0.6, pose: hangLegs([100, 100], 192), label: "直腿慢放" },
        { t: 1, pose: hangLegs([0, 0]) },
      ]),
    },
    { zh: "懸垂半舉腿", en: "Partial Straight Leg Raise", how: "懸垂，雙腿伸直舉到與地面平行。", ex: legHang(9, "懸垂半舉腿", "Partial Straight Leg Raise", rep(hangLegs([0, 0]), hangLegs([92, 92], 190), LEG_L)) },
    { zh: "懸垂直舉腿", en: "Hanging Straight Leg Raise", how: "懸垂，雙腿伸直一路舉到腳背碰到單槓。", ex: { ...EXERCISES.legraise, id: "leg-10", props: () => [BAR], apparatus: "none" } },
  ],

  bridge: [
    {
      zh: "短橋",
      en: "Short Bridge",
      how: "仰臥屈膝，肩膀與腳掌著地，把髖部推高到肩膝一直線。",
      ex: make(
        "bridge-1",
        "短橋",
        "Short Bridge",
        { anchor: "neck", at: [0, -3], level: { joint: "foot", dy: 3 }, pins: [handsOnFloor("arm"), handsOnFloor("armFar")] },
        rep(P(-90, -90, [90, 90], [135, 15]), P(-68, -82, [90, 90], [100, 10]), BR_L),
        { trace: "hip", props: () => [FLOOR()] },
      ),
    },
    {
      zh: "直橋",
      en: "Straight Bridge",
      how: "坐姿雙腿伸直，雙手撐在髖後，把髖部推起成反向平板。",
      ex: make(
        "bridge-2",
        "直橋",
        "Straight Bridge",
        { anchor: "hand", at: [0, 0], level: { joint: "foot", dy: 0 } },
        rep(P(180, 184, [-20, -20], [90, 90]), P(252, 262, [-4, -4], [72, 72]), BR_L),
        { trace: "hip", props: () => [FLOOR()] },
      ),
    },
    {
      zh: "高低橋",
      en: "Angled Bridge",
      how: "雙手撐在床或長椅上、雙腳著地，在斜角下完成拱橋。",
      ex: make(
        "bridge-3",
        "高低橋",
        "Angled Bridge",
        { anchor: "hand", at: [0, 0], level: { joint: "foot", dy: 30 } },
        rep(P(-84, -60, [345, -10], [100, 4]), brFull, BR_L),
        { trace: "hip", props: () => [FLOOR(30), { kind: "box", x: -14, y: 0, w: 22, h: 30 }] },
      ),
    },
    {
      zh: "頭橋",
      en: "Head Bridge",
      how: "從仰臥把身體推起，以頭頂和雙腳支撐成拱形，雙手輔助。",
      ex: make(
        "bridge-4",
        "頭橋",
        "Head Bridge",
        {
          anchor: "foot",
          at: [0, 0],
          level: { joint: "head", dy: -6.4 },
          pins: (["arm", "armFar"] as const).map((limb) => ({ limb, at: (j: Joints): Vec => [j.head[0] + 8, 0], bend: 1 as const })),
        },
        rep(P(-90, -90, [160, -20], [135, 10]), P(-58, -10, [160, -20], [70, -4]), BR_L),
        { trace: "hip", props: () => [FLOOR()] },
      ),
    },
    {
      zh: "半橋",
      en: "Half Bridge",
      how: "把籃球墊在下背，雙手撐地，以半程拱橋建立脊椎柔軟度。",
      ex: make(
        "bridge-5",
        "半橋",
        "Half Bridge",
        { anchor: "hand", at: [0, 0], level: { joint: "foot", dy: 0 } },
        rep(halfBridgeMid, brFull, BR_L),
        { trace: "hip", props: () => [FLOOR(), { kind: "ball", x: halfBridgeHip[0], y: -11, r: 11 }] },
      ),
    },
    { zh: "標準橋", en: "Full Bridge", how: "仰臥，手掌置於耳旁，手臂與雙腿伸直把身體推成完整的拱。", ex: { ...EXERCISES.bridge, id: "bridge-6", props: () => [FLOOR()], apparatus: "none" } },
    {
      zh: "下行橋",
      en: "Wall Walking (Down)",
      how: "背對牆站立，向後仰，雙手沿牆一步步往下走到地面。",
      ex: make(
        "bridge-7",
        "下行橋",
        "Wall Walking (Down)",
        { ...ON_FEET, pins: [handsOnWall("arm"), handsOnWall("armFar")] },
        rep(wallWalkTop, wallWalkLow, ["雙手沿牆往下走", "最低點 · 停頓", "雙手沿牆走回"]),
        { trace: "hand", seconds: 6, props: () => [FLOOR(), { kind: "wall", x: WALL_X, y0: -120, y1: 0 }] },
      ),
    },
    {
      zh: "上行橋",
      en: "Wall Walking (Up)",
      how: "從低處開始，雙手沿牆往上走，回到站姿；重點在起身的控制。",
      ex: make(
        "bridge-8",
        "上行橋",
        "Wall Walking (Up)",
        { ...ON_FEET, pins: [handsOnWall("arm"), handsOnWall("armFar")] },
        rep(wallWalkLow, wallWalkTop, ["雙手沿牆往上走", "站直 · 停頓", "回到低處"]),
        { trace: "hand", seconds: 6, props: () => [FLOOR(), { kind: "wall", x: WALL_X, y0: -120, y1: 0 }] },
      ),
    },
    {
      zh: "合橋",
      en: "Closing Bridge",
      how: "站姿雙手過頭，向後拱身，控制地讓雙手落地成標準橋。",
      ex: make(
        "bridge-9",
        "合橋",
        "Closing Bridge",
        { ...ON_FEET, pins: [handsOnFloor("arm"), handsOnFloor("armFar")] },
        [
          { t: 0, pose: standing, label: "雙手過頭 · 髖部前推" },
          { t: 0.3, pose: archBack, label: "向後拱身 · 眼睛找地面" },
          { t: 0.5, pose: bridgeFromFeet, label: "雙手落地 · 標準橋" },
          { t: 0.8, pose: bridgeFromFeet, label: "回到起始（下一式才要求站起）" },
          { t: 1, pose: standing },
        ],
        { trace: "hand", seconds: 6, props: () => [FLOOR()] },
      ),
    },
    {
      zh: "鐵板橋",
      en: "Stand-to-Stand Bridge",
      how: "從站姿後仰下橋，再從橋的位置直接站起，全程不借助外力。",
      ex: make(
        "bridge-10",
        "鐵板橋",
        "Stand-to-Stand Bridge",
        { ...ON_FEET, pins: [handsOnFloor("arm"), handsOnFloor("armFar")] },
        [
          { t: 0, pose: standing, label: "後仰下橋" },
          { t: 0.22, pose: archBack },
          { t: 0.42, pose: bridgeFromFeet, label: "橋 · 重心移向雙腳" },
          { t: 0.56, pose: bridgeFromFeet, label: "推地 · 從橋站起" },
          { t: 0.78, pose: archBack },
          { t: 1, pose: standing },
        ],
        { trace: "hand", seconds: 7, props: () => [FLOOR()] },
      ),
    },
  ],

  hs: [
    {
      zh: "靠牆頭倒立",
      en: "Wall Headstand",
      how: "頭頂與雙手成三角支撐，背靠牆，雙腿收起再伸直靠牆。",
      ex: make(
        "hs-1",
        "靠牆頭倒立",
        "Wall Headstand",
        { anchor: "head", at: [0, -6.4], pins: (["arm", "armFar"] as const).map((limb) => ({ limb, at: [-15, 0] as Vec, bend: 1 as const })) },
        [
          { t: 0, pose: P(0, 0, [-90, 0], [-60, -190]), label: "團身 · 膝蓋收向胸口" },
          { t: 0.4, pose: P(-3, 0, [-90, 0], [-186, -186]), label: "伸直雙腿 · 腳跟靠牆" },
          { t: 0.75, pose: P(-3, 0, [-90, 0], [-186, -186]), label: "保持 · 頸部中立" },
          { t: 1, pose: P(0, 0, [-90, 0], [-60, -190]) },
        ],
        { trace: "foot", seconds: 5, props: () => [FLOOR(), { kind: "wall", x: 10, y0: -110, y1: 0 }] },
      ),
    },
    {
      zh: "烏鴉式",
      en: "Crow Stand",
      how: "蹲下雙手撐地，膝蓋頂在手肘外側，身體前傾讓雙腳離地。",
      ex: make(
        "hs-2",
        "烏鴉式",
        "Crow Stand",
        ON_HANDS,
        [
          { t: 0, pose: P(118, 135, [-18, 0], [52, -70]), label: "蹲姿 · 膝蓋貼上手肘" },
          { t: 0.4, pose: P(78, 70, [-36, 0], [28, -128]), label: "前傾 · 雙腳離地" },
          { t: 0.78, pose: P(78, 70, [-36, 0], [28, -128]), label: "保持 · 手指抓地" },
          { t: 1, pose: P(118, 135, [-18, 0], [52, -70]) },
        ],
        { trace: "foot", seconds: 5, props: () => [FLOOR()] },
      ),
    },
    {
      zh: "靠牆倒立",
      en: "Wall Handstand",
      how: "雙手離牆約一掌距離撐地，踢腿上牆，手臂鎖直保持。",
      ex: make(
        "hs-3",
        "靠牆倒立",
        "Wall Handstand",
        ON_HANDS,
        [
          { t: 0, pose: P(40, 30, [-25, -25], [-5, -5]), label: "屈體 · 肩膀越過手掌" },
          { t: 0.4, pose: P(-2, -2, [0, 0], [-186, -186]), label: "上牆 · 推地伸肩" },
          { t: 0.78, pose: P(-2, -2, [0, 0], [-186, -186]), label: "保持 · 肋骨內收" },
          { t: 1, pose: P(40, 30, [-25, -25], [-5, -5]) },
        ],
        { trace: "foot", seconds: 6, props: () => [FLOOR(), { kind: "wall", x: 9, y0: -120, y1: 0 }] },
      ),
    },
    { zh: "半倒立撐", en: "Half Handstand Push-up", how: "靠牆倒立，只下放到手肘約九十度再推回。", ex: hspu(4, "半倒立撐", "Half Handstand Push-up", hsTop, hsHalf) },
    { zh: "標準倒立撐", en: "Handstand Push-up", how: "靠牆倒立，下放到頭頂輕觸地面，再推回直臂。", ex: hspu(5, "標準倒立撐", "Handstand Push-up", hsTop, hsFull) },
    { zh: "窄距倒立撐", en: "Close Handstand Push-up", how: "雙手併攏撐地完成倒立撐（側視角下軌跡同標準版）。", ex: hspu(6, "窄距倒立撐", "Close Handstand Push-up", hsTop, hsFull) },
    {
      zh: "偏重倒立撐",
      en: "Uneven Handstand Push-up",
      how: "一手撐地、一手撐在籃球上，重心偏向撐地手。",
      ex: hspu(7, "偏重倒立撐", "Uneven Handstand Push-up", hsTop, hsFull, { pins: [{ limb: "armFar", at: [-3, -14], bend: 1 }] }, [FLOOR(), { kind: "ball", x: -3, y: -7, r: 7 }]),
    },
    {
      zh: "單臂半倒立撐",
      en: "½ One-Arm Handstand Push-up",
      how: "單臂倒立撐，另一手向側伸平衡，只做上半程。",
      ex: hspu(8, "單臂半倒立撐", "½ One-Arm Handstand Push-up", withFar(hsTop, { armFar: ARM_OUT }), withFar(hsHalf, { armFar: ARM_OUT })),
    },
    {
      zh: "槓桿倒立撐",
      en: "Lever Handstand Push-up",
      how: "一手撐地，另一手伸直撐在側方的籃球上，提供最少輔助。",
      ex: hspu(9, "槓桿倒立撐", "Lever Handstand Push-up", hsTop, hsFull, { pins: [{ limb: "armFar", at: [-24, -12], bend: 1 }] }, [FLOOR(), { kind: "ball", x: -24, y: -6, r: 6 }]),
    },
    {
      zh: "單臂倒立撐",
      en: "One-Arm Handstand Push-up",
      how: "徒手力量的巔峰之一：單臂靠牆倒立，全程下放再推起。",
      ex: hspu(10, "單臂倒立撐", "One-Arm Handstand Push-up", withFar(hsTop, { armFar: ARM_OUT }), withFar(hsFull, { armFar: ARM_OUT })),
    },
  ],
};

/** Every playable exercise: the flagship skills plus all 60 progression steps. */
export const LIBRARY: Record<string, Exercise> = {
  ...EXERCISES,
  ...CARDIO,
  ...WARMUP,
  ...Object.fromEntries(Object.values(PROGRESSIONS).flatMap((steps) => steps.map((s) => [s.ex.id, s.ex]))),
};
