import { PROGRESSIONS } from "../pose/progressions";
import type { MoveKey } from "./quiz";

export type Goal = "strength" | "muscle" | "skill" | "conditioning";
export type Settings = { days: 2 | 3 | 4 | 5; minutes: 30 | 45 | 60; goal: Goal; bar: boolean };
export type Levels = Record<MoveKey, number>;

export type Item = {
  kind: "warm" | "skill" | "main" | "next" | "finisher" | "cool";
  name: string;
  dose: string;
  exId?: string;
  step?: number;
  note?: string;
  /** Structured target for logging (main and preview items). */
  target?: { sets: number; lo: number; hi: number; unit: "下" | "秒"; family: MoveKey };
};
export type Session = { title: string; focus: string; items: Item[] };
export type Day = { d: string; session?: Session; rest: string };
export type Program = { days: Day[]; levels: Levels; rules: string[]; capped: string[] };

export const GOAL_LABEL: Record<Goal, string> = { strength: "力量", muscle: "增肌", skill: "技能", conditioning: "體能 / 減脂" };
export const MOVE_ZH: Record<MoveKey, string> = { push: "推", squat: "蹲", pull: "拉", leg: "舉", bridge: "橋", hs: "倒" };

const HOLDS = new Set(["hs-1", "hs-2", "hs-3"]);
const WEEK = ["一", "二", "三", "四", "五", "六", "日"];

const DOSE: Record<Goal, { sets: number; reps: [number, number]; hold: [number, number]; rest: string }> = {
  strength: { sets: 4, reps: [5, 8], hold: [20, 30], rest: "組間 2–3 分" },
  muscle: { sets: 3, reps: [8, 15], hold: [30, 45], rest: "組間 90 秒" },
  skill: { sets: 3, reps: [6, 10], hold: [20, 30], rest: "組間 2 分" },
  conditioning: { sets: 3, reps: [10, 15], hold: [25, 30], rest: "組間 60 秒 · 可兩兩配成超級組" },
};

const stepOf = (key: MoveKey, level: number) => PROGRESSIONS[key][Math.min(Math.max(level, 1), 10) - 1];

/** Without a bar: jackknife / full pull-ups and hanging leg raises are impossible, so cap those ladders. */
export const effectiveLevels = (levels: Levels, bar: boolean): { levels: Levels; capped: string[] } => {
  if (bar) return { levels, capped: [] };
  const out = { ...levels };
  const capped: string[] = [];
  if (out.pull > 2) (out.pull = 2), capped.push("拉：沒有單槓時先用穩固的桌子做水平引體，有機會盡快找到單槓。");
  if (out.leg > 5) (out.leg = 5), capped.push("舉：懸垂系列需要單槓，暫時以平臥直舉腿加慢速離心代替。");
  return { levels: out, capped };
};

const main = (key: MoveKey, level: number, s: Settings): Item => {
  const st = stepOf(key, level);
  const d = DOSE[s.goal];
  const sets = s.minutes === 30 ? Math.max(2, d.sets - 1) : d.sets;
  const hold = HOLDS.has(st.ex.id);
  const [lo, hi] = hold ? d.hold : d.reps;
  const unit = hold ? "秒" : "下";
  return {
    kind: "main",
    name: `${MOVE_ZH[key]} · ${st.zh}`,
    dose: `${sets} 組 × ${lo}–${hi} ${unit}`,
    exId: st.ex.id,
    step: level,
    note: d.rest,
    target: { sets, lo, hi, unit, family: key },
  };
};

const preview = (key: MoveKey, level: number): Item | null => {
  if (level >= 10) return null;
  const st = stepOf(key, level + 1);
  return { kind: "next", name: `預習下一式 · ${st.zh}`, dose: HOLDS.has(st.ex.id) ? "2 組 × 10 秒" : "2 組 × 3–5 下", exId: st.ex.id, step: level + 1, note: "不力竭，只求動作品質" };
};

type Focus = "upper" | "lower" | "full";

const skills = (L: Levels, s: Settings, focus: Focus): Item[] => {
  const handstand: Item =
    L.hs >= 4
      ? { kind: "skill", name: "倒立平衡 · 練習腳離牆", dose: "5 組 × 20–30 秒", exId: "handstand" }
      : L.hs >= 2
        ? { kind: "skill", name: "烏鴉式平衡", dose: "5 組 × 15–20 秒", exId: "hs-2" }
        : { kind: "skill", name: "靠牆頭倒立", dose: "4 組 × 15–20 秒", exId: "hs-1" };
  const lsit: Item | null = L.leg >= 5 && L.push >= 5 ? { kind: "skill", name: "L 型支撐（可先團身）", dose: "5 組 × 10 秒", exId: "lsit" } : null;
  const lever: Item | null = s.bar && L.pull >= 6 ? { kind: "skill", name: "團身前水平", dose: "5 組 × 8–12 秒", exId: "frontlever" } : null;
  const mu: Item | null = s.bar && L.pull >= 7 && L.push >= 6 ? { kind: "skill", name: "雙力臂轉換練習", dose: "5 組 × 2 下", exId: "muscleup" } : null;

  const pool = (focus === "upper" ? [mu, handstand] : focus === "lower" ? [lever, lsit, handstand] : [handstand, lsit, mu]).filter(Boolean) as Item[];
  const want = s.goal === "skill" ? 2 : s.minutes >= 45 ? 1 : 0;
  return pool.slice(0, want).map((it) => ({ ...it, note: "放在疲勞前 · 不力竭" }));
};

const WARM: Item = { kind: "warm", name: "熱身：手腕、肩胛、髖關節活動", dose: "7 分鐘", exId: "armcircle", note: "再做第一個動作的簡單版 2 組" };
const COOL: Item = { kind: "cool", name: "收操：伸展與呼吸", dose: "5 分鐘" };
const HIIT: Item = { kind: "finisher", name: "HIIT · Tabata", dose: "20 秒衝刺 / 10 秒休息 × 8", exId: "burpee", note: "波比跳 → 登山者 → 深蹲跳 → 高抬腿" };

const session = (title: string, focus: Focus, order: MoveKey[], L: Levels, s: Settings, finisher: boolean): Session => {
  const items: Item[] = [WARM, ...skills(L, s, focus), ...order.map((k) => main(k, L[k], s))];
  if (s.minutes === 60) {
    const p = preview(order[0], L[order[0]]);
    if (p) items.push(p);
  }
  if (finisher) items.push(HIIT);
  items.push(COOL);
  const focusText = order.map((k) => MOVE_ZH[k]).join(" · ");
  return { title, focus: focusText, items };
};

export const generate = (raw: Levels, s: Settings): Program => {
  const { levels: L, capped } = effectiveLevels(raw, s.bar);
  const cond = s.goal === "conditioning";

  const A = (t = "全身 A") => session(t, "full", ["push", "pull", "squat", "leg"], L, s, cond);
  const B = (t = "全身 B") => session(t, "full", ["hs", "pull", "bridge", "squat"], L, s, cond);
  const UA = session("上肢 A", "upper", ["push", "pull", "hs"], L, s, false);
  const LA = session("下肢與核心 A", "lower", ["squat", "leg", "bridge"], L, s, cond);
  const UB = session("上肢 B", "upper", ["hs", "pull", "push"], L, s, false);
  const LB = session("下肢與核心 B", "lower", ["squat", "bridge", "leg"], L, s, cond);
  const extra: Session = {
    title: "技能與體能",
    focus: "技巧 · 心肺",
    items: [WARM, ...skills(L, { ...s, goal: "skill" }, "full"), HIIT, { kind: "cool", name: "Zone 2 有氧（快走、單車）", dose: "20–30 分鐘" }],
  };

  const plan: Record<number, Session> =
    s.days === 2 ? { 0: A(), 3: B() }
    : s.days === 3 ? { 0: A(), 2: B(), 4: A("全身 A") }
    : s.days === 4 ? { 0: UA, 1: LA, 3: UB, 4: LB }
    : { 0: UA, 1: LA, 3: UB, 4: LB, 5: extra };

  const zone2Day = s.days <= 3 ? 5 : -1;
  const days: Day[] = WEEK.map((d, i) => ({
    d,
    session: plan[i],
    rest: plan[i] ? "" : i === zone2Day ? "Zone 2 有氧 30 分（選擇性）" : i === 6 ? "完全休息" : "休息 · 散步或活動度",
  }));

  const rules = [
    "每一式的所有組都做到次數上限，下次訓練就換下一式；換式後次數掉下來是正常的。",
    s.days === 3 ? "三天制：下週改為 B · A · B，兩週輪替一次。" : "",
    "每 4–6 週安排一週減量：組數減半、強度不變。",
    "記錄每一組的次數或秒數——進步看紀錄，不看感覺。",
    "關節疼痛（不是肌肉痠）就退回上一式或休息。",
  ].filter(Boolean);

  return { days, levels: L, rules, capped };
};

export const toText = (p: Program, s: Settings): string => {
  const head = `STREET/GYM 課表 · 每週 ${s.days} 天 · ${s.minutes} 分鐘 · 目標：${GOAL_LABEL[s.goal]}`;
  const body = p.days
    .map((d) =>
      d.session
        ? `\n週${d.d}　${d.session.title}（${d.session.focus}）\n` +
          d.session.items.map((it) => `  - ${it.name}：${it.dose}${it.note ? `（${it.note}）` : ""}`).join("\n")
        : `\n週${d.d}　${d.rest}`,
    )
    .join("\n");
  return `${head}\n${body}\n\n原則：\n${p.rules.map((r) => `  - ${r}`).join("\n")}`;
};
