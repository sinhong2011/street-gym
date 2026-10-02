import { useEffect, useMemo, useState } from "react";
import { BIG_SIX } from "../content";
import { GOAL_LABEL, MOVE_ZH, generate, toText, type Goal, type Item, type Levels, type Settings } from "../plan/generate";
import { QUIZ, type MoveKey } from "../plan/quiz";
import { LIBRARY, PROGRESSIONS } from "../pose/progressions";
import { DEMO, FPS } from "../remotion/compositions";
import { ExerciseScene, type ExerciseSceneProps } from "../remotion/ExerciseScene";
import { LazyPlayer, MuscleLink } from "./kit";
import { LogBook } from "./LogBook";

const STORE = "street-gym:plan";
const KEYS = QUIZ.map((q) => q.key);
const DEFAULT_SETTINGS: Settings = { days: 3, minutes: 45, goal: "muscle", bar: true };

type Saved = { answers: Partial<Levels>; settings: Settings };

const load = (): Saved => {
  try {
    const s = JSON.parse(localStorage.getItem(STORE) ?? "null");
    if (s && s.answers && s.settings) return { answers: s.answers, settings: { ...DEFAULT_SETTINGS, ...s.settings } };
  } catch {
    /* ignore */
  }
  return { answers: {}, settings: DEFAULT_SETTINGS };
};

const KIND: Record<Item["kind"], string> = { warm: "熱身", skill: "技巧", main: "主訓練", next: "預習", finisher: "HIIT", cool: "收操" };

function Seg<T extends string | number | boolean>({ label, value, options, onChange }: { label: string; value: T; options: { v: T; t: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="pl-set">
      <span className="pl-set-label">{label}</span>
      <div className="pl-seg" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button key={String(o.v)} type="button" role="radio" aria-checked={o.v === value} className={o.v === value ? "on" : ""} onClick={() => onChange(o.v)}>
            {o.t}
          </button>
        ))}
      </div>
    </div>
  );
}

export const Planner: React.FC = () => {
  const [saved] = useState(load);
  const [answers, setAnswers] = useState<Partial<Levels>>(saved.answers);
  const [settings, setSettings] = useState<Settings>(saved.settings);
  const [q, setQ] = useState(() => {
    const i = KEYS.findIndex((k) => answers[k] == null);
    return i === -1 ? KEYS.length : i;
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify({ answers, settings }));
    } catch {
      /* private mode */
    }
  }, [answers, settings]);

  const done = q >= KEYS.length;
  const levels = useMemo(() => Object.fromEntries(KEYS.map((k) => [k, answers[k] ?? 1])) as Levels, [answers]);
  const program = useMemo(() => generate(levels, settings), [levels, settings]);
  const firstMain = program.days.find((d) => d.session)?.session?.items.find((i) => i.kind === "main")?.exId ?? "pushup";
  const shown = LIBRARY[preview ?? firstMain];

  const answer = (step: number) => {
    const key = KEYS[q];
    setAnswers((a) => ({ ...a, [key]: step }));
    setQ((i) => i + 1);
  };
  const bump = (key: MoveKey, d: number) => setAnswers((a) => ({ ...a, [key]: Math.min(10, Math.max(1, (a[key] ?? 1) + d)) }));
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setSettings((s) => ({ ...s, [k]: v }));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(toText(program, settings));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  };
  const print = () => {
    document.documentElement.classList.add("print-plan");
    const off = () => {
      document.documentElement.classList.remove("print-plan");
      window.removeEventListener("afterprint", off);
    };
    window.addEventListener("afterprint", off);
    window.print();
  };

  // ---------------- quiz ----------------
  if (!done) {
    const item = QUIZ[q];
    const mv = BIG_SIX.find((b) => b.key === item.key)!;
    return (
      <div className="quiz">
        <div className="quiz-progress" aria-label={`第 ${q + 1} / 6 題`}>
          {KEYS.map((k, i) => (
            <span key={k} className={i < q ? "done" : i === q ? "now" : ""}>
              {MOVE_ZH[k]}
            </span>
          ))}
        </div>
        <div className="quiz-card" key={item.key}>
          <div className="quiz-q">
            <span className="quiz-glyph">{mv.glyph}</span>
            <div>
              <p className="eyebrow">測試 {q + 1} / 6 · {mv.en}</p>
              <h3 className="quiz-title">{mv.zh}</h3>
              <p className="quiz-test">{item.test}</p>
            </div>
          </div>
          <ol className="quiz-opts">
            {item.options.map((o) => (
              <li key={o.label}>
                <button className={answers[item.key] === o.step ? "on" : ""} onClick={() => answer(o.step)}>
                  <span>{o.label}</span>
                  <i aria-hidden>→</i>
                </button>
              </li>
            ))}
          </ol>
        </div>
        <div className="quiz-nav">
          <button className="btn btn-line" onClick={() => setQ((i) => Math.max(0, i - 1))} disabled={q === 0}>
            上一題
          </button>
          <button className="linkish" onClick={() => setQ(KEYS.length)}>
            跳過測驗，直接手動設定 →
          </button>
        </div>
      </div>
    );
  }

  // ---------------- results + program ----------------
  return (
    <div className="planner">
      <div className="pl-top">
        <div className="pl-levels">
          <div className="pl-head">
            <h3 className="sub-title">你的起點</h3>
            <button className="linkish" onClick={() => setQ(0)}>重新測驗</button>
          </div>
          <ol>
            {KEYS.map((k) => {
              const lv = levels[k];
              const capped = program.levels[k] !== lv;
              return (
                <li key={k}>
                  <span className="pl-glyph">{MOVE_ZH[k]}</span>
                  <button className="pl-name" onClick={() => setPreview(PROGRESSIONS[k][lv - 1].ex.id)}>
                    <b>{String(lv).padStart(2, "0")}</b> {PROGRESSIONS[k][lv - 1].zh}
                    {capped && <em>（無單槓：第 {program.levels[k]} 式）</em>}
                  </button>
                  <span className="pl-meter" aria-hidden>
                    {Array.from({ length: 10 }, (_, i) => (
                      <i key={i} className={i < lv ? "f" : ""} />
                    ))}
                  </span>
                  <span className="pl-bump">
                    <button onClick={() => bump(k, -1)} aria-label={`${MOVE_ZH[k]} 降一式`} disabled={lv <= 1}>−</button>
                    <button onClick={() => bump(k, 1)} aria-label={`${MOVE_ZH[k]} 升一式`} disabled={lv >= 10}>+</button>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="pl-settings">
          <h3 className="sub-title">課表設定</h3>
          <Seg label="每週訓練" value={settings.days} onChange={(v) => set("days", v)} options={[2, 3, 4, 5].map((v) => ({ v: v as Settings["days"], t: `${v} 天` }))} />
          <Seg label="每次時間" value={settings.minutes} onChange={(v) => set("minutes", v)} options={[30, 45, 60].map((v) => ({ v: v as Settings["minutes"], t: `${v} 分` }))} />
          <Seg label="目標" value={settings.goal} onChange={(v) => set("goal", v)} options={(Object.keys(GOAL_LABEL) as Goal[]).map((v) => ({ v, t: GOAL_LABEL[v] }))} />
          <Seg label="器材" value={settings.bar} onChange={(v) => set("bar", v)} options={[{ v: true, t: "有單槓" }, { v: false, t: "沒有單槓" }]} />
        </div>
      </div>

      <div className="pl-out" id="plan-out">
        <div className="pl-print-head">
          STREET/GYM 課表 · 每週 {settings.days} 天 · {settings.minutes} 分鐘 · 目標：{GOAL_LABEL[settings.goal]}
        </div>
        <ol className="pl-week">
          {program.days.map((d) =>
            d.session ? (
              <li key={d.d} className="pl-day">
                <div className="pl-day-head">
                  <span className="pl-d">週{d.d}</span>
                  <b>{d.session.title}</b>
                  <span className="pl-focus">{d.session.focus}</span>
                </div>
                <ul>
                  {d.session.items.map((it, i) => (
                    <li key={i} className={`pl-it k-${it.kind} ${it.exId && it.exId === (preview ?? firstMain) ? "on" : ""}`}>
                      <span className="pl-kind">{KIND[it.kind]}</span>
                      {it.exId ? (
                        <button className="pl-it-name" onClick={() => setPreview(it.exId!)}>{it.name}</button>
                      ) : (
                        <span className="pl-it-name">{it.name}</span>
                      )}
                      <span className="pl-dose">{it.dose}</span>
                      {it.note && <span className="pl-note">{it.note}</span>}
                    </li>
                  ))}
                </ul>
              </li>
            ) : (
              <li key={d.d} className="pl-rest">
                <span className="pl-d">週{d.d}</span>
                <span>{d.rest}</span>
              </li>
            ),
          )}
        </ol>

        <aside className="pl-side">
          <div className="pl-preview">
            <LazyPlayer<ExerciseSceneProps>
              className="frame"
              component={ExerciseScene}
              inputProps={{ exerciseId: shown.id, figNo: 1, hud: true }}
              width={DEMO.width}
              height={DEMO.height}
              fps={FPS}
              durationInFrames={Math.round(shown.seconds * FPS * 4)}
              label={`${shown.zh}動作示範`}
            />
            <p className="fine">點課表中的任一動作，在這裡看示範。</p>
            <MuscleLink exId={shown.id} />
          </div>
          <div className="pl-actions">
            <button className="btn btn-ink" onClick={print}>列印課表</button>
            <button className="btn btn-line" onClick={copy}>{copied ? "已複製 ✓" : "複製文字"}</button>
          </div>
          <ul className="pl-rules">
            {[...program.capped, ...program.rules].map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </aside>
      </div>

      <LogBook program={program} levels={levels} onLevelUp={(f) => bump(f, 1)} />
    </div>
  );
};
