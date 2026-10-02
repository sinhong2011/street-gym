import { useEffect, useMemo, useState } from "react";
import { MOVE_ZH, type Levels, type Program } from "../plan/generate";
import type { MoveKey } from "../plan/quiz";
import { PROGRESSIONS } from "../pose/progressions";

const STORE = "street-gym:log";
const FAMILIES: MoveKey[] = ["push", "squat", "pull", "leg", "bridge", "hs"];
const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

type LoggedItem = { family: MoveKey; step: number; exId: string; name: string; unit: "下" | "秒"; lo: number; hi: number; sets: number[] };
type Entry = { id: string; date: string; title: string; items: LoggedItem[] };

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const loadLog = (): Entry[] => {
  try {
    const v = JSON.parse(localStorage.getItem(STORE) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};
const stepName = (f: MoveKey, step: number) => PROGRESSIONS[f][Math.min(Math.max(step, 1), 10) - 1].zh;
const passed = (it: LoggedItem) => it.sets.length > 0 && it.sets.every((r) => r >= it.hi);

// ---------------- progress chart ----------------

const W = 640;
const H = 240;
const PAD = { l: 44, r: 16, t: 28, b: 34 };

const Progress: React.FC<{ log: Entry[]; family: MoveKey }> = ({ log, family }) => {
  const [hover, setHover] = useState<number | null>(null);
  const [asTable, setAsTable] = useState(false);

  const points = useMemo(
    () =>
      log
        .flatMap((e) => e.items.filter((it) => it.family === family).map((it) => ({ date: e.date, it, total: it.sets.reduce((a, b) => a + b, 0) })))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [log, family],
  );

  if (points.length === 0) {
    return <p className="lg-empty">還沒有「{MOVE_ZH[family]}」的紀錄。照課表練完後，在左邊填入每組的次數。</p>;
  }

  const unit = points[points.length - 1].it.unit;
  const max = Math.max(...points.map((p) => p.total), 10);
  const yMax = Math.ceil(max / 10) * 10;
  const x = (i: number) => PAD.l + (points.length === 1 ? (W - PAD.l - PAD.r) / 2 : (i / (points.length - 1)) * (W - PAD.l - PAD.r));
  const y = (v: number) => PAD.t + (1 - v / yMax) * (H - PAD.t - PAD.b);
  const ticks = [0, yMax / 2, yMax];
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(i)} ${y(p.total)}`).join(" ");
  const h = hover != null ? points[hover] : null;

  return (
    <div className="lg-chart">
      <div className="lg-chart-head">
        <span>每次訓練的總{unit === "秒" ? "秒數" : "次數"}</span>
        <button className="linkish" onClick={() => setAsTable((t) => !t)}>{asTable ? "看圖表" : "看表格"}</button>
      </div>
      {asTable ? (
        <table className="lg-table">
          <thead>
            <tr><th>日期</th><th>式</th><th>每組</th><th>總計</th></tr>
          </thead>
          <tbody>
            {points.map((p, i) => (
              <tr key={i}>
                <td>{p.date.slice(5)}</td>
                <td>{String(p.it.step).padStart(2, "0")} {p.it.name}</td>
                <td>{p.it.sets.join(" / ")}</td>
                <td>{p.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="lg-svg-wrap" onMouseLeave={() => setHover(null)}>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${MOVE_ZH[family]} 的訓練量變化`}>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} className="lg-grid" />
                <text x={PAD.l - 8} y={y(t) + 4} textAnchor="end" className="lg-axis">{t}</text>
              </g>
            ))}
            {/* step changes */}
            {points.map((p, i) =>
              i > 0 && p.it.step !== points[i - 1].it.step ? (
                <g key={`s${i}`}>
                  <line x1={x(i)} x2={x(i)} y1={PAD.t - 10} y2={H - PAD.b} className="lg-step" />
                  <text x={x(i) + 5} y={PAD.t - 12} className="lg-step-label">→ 第 {p.it.step} 式</text>
                </g>
              ) : null,
            )}
            <path d={path} className="lg-line" />
            {points.map((p, i) => (
              <circle key={i} cx={x(i)} cy={y(p.total)} r={hover === i ? 6 : 4.5} className={passed(p.it) ? "lg-dot pass" : "lg-dot"} />
            ))}
            {[0, points.length - 1].filter((v, i, a) => a.indexOf(v) === i).map((i) => (
              <text key={`d${i}`} x={x(i)} y={H - 12} textAnchor={points.length === 1 ? "middle" : i === 0 ? "start" : "end"} className="lg-axis">
                {points[i].date.slice(5)}
              </text>
            ))}
            {/* hit targets larger than the marks */}
            {points.map((_, i) => (
              <rect
                key={`h${i}`}
                x={x(i) - Math.max(10, (W - PAD.l - PAD.r) / Math.max(points.length - 1, 1) / 2)}
                y={PAD.t}
                width={Math.max(20, (W - PAD.l - PAD.r) / Math.max(points.length - 1, 1))}
                height={H - PAD.t - PAD.b}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                tabIndex={0}
              />
            ))}
          </svg>
          {h && hover != null && (
            <div className="lg-tip" style={{ left: `${(x(hover) / W) * 100}%`, top: `${(y(h.total) / H) * 100}%` }}>
              <b>{h.date}</b>
              <span>第 {h.it.step} 式 · {h.it.name}</span>
              <span>{h.it.sets.join(" / ")} {h.it.unit} · 共 {h.total}</span>
              {passed(h.it) && <em>達升級標準</em>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ---------------- logger ----------------

export const LogBook: React.FC<{ program: Program; levels: Levels; onLevelUp: (f: MoveKey) => void }> = ({ program, levels, onLevelUp }) => {
  const [log, setLog] = useState<Entry[]>(loadLog);
  const sessions = program.days.filter((d) => d.session);
  const wd = WEEKDAYS[new Date().getDay()];
  const [pick, setPick] = useState(() => Math.max(0, sessions.findIndex((d) => d.d === wd)));
  const [date, setDate] = useState(today);
  const [reps, setReps] = useState<Record<string, string[]>>({});
  const [family, setFamily] = useState<MoveKey>("push");
  const [saved, setSaved] = useState<Entry | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify(log));
    } catch {
      /* private mode */
    }
  }, [log]);

  const day = sessions[Math.min(pick, sessions.length - 1)];
  const items = (day?.session?.items ?? []).filter((it) => it.kind === "main" && it.target);

  const setRep = (key: string, i: number, v: string) =>
    setReps((r) => {
      const arr = [...(r[key] ?? [])];
      arr[i] = v.replace(/[^\d]/g, "").slice(0, 3);
      return { ...r, [key]: arr };
    });

  const save = () => {
    const logged: LoggedItem[] = items
      .map((it) => {
        const t = it.target!;
        const sets = (reps[it.exId!] ?? []).slice(0, t.sets).map(Number).filter((n) => n > 0);
        return { family: t.family, step: it.step!, exId: it.exId!, name: stepName(t.family, it.step!), unit: t.unit, lo: t.lo, hi: t.hi, sets };
      })
      .filter((it) => it.sets.length > 0);
    if (logged.length === 0) return;
    const entry: Entry = { id: `${Date.now()}`, date, title: day!.session!.title, items: logged };
    setLog((l) => [...l, entry]);
    setSaved(entry);
    setReps({});
    setFamily(logged[0].family);
  };

  const remove = (id: string) => setLog((l) => l.filter((e) => e.id !== id));
  const clearAll = () => {
    if (window.confirm("確定要清除這台裝置上的所有訓練紀錄嗎？此動作無法復原。")) setLog([]);
  };

  const recent = [...log].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)).slice(0, 8);
  const ready = saved?.items.filter((it) => passed(it) && it.step === levels[it.family] && it.step < 10) ?? [];

  return (
    <div className="lg">
      <div className="lg-form">
        <h3 className="sub-title">訓練紀錄</h3>
        {sessions.length === 0 ? (
          <p className="fine">先在上面產生課表。</p>
        ) : (
          <>
            <div className="lg-pick" role="radiogroup" aria-label="今天練哪一堂">
              {sessions.map((d, i) => (
                <button key={d.d} role="radio" aria-checked={i === pick} className={i === pick ? "on" : ""} onClick={() => setPick(i)}>
                  <span>週{d.d}</span>
                  {d.session!.title}
                </button>
              ))}
            </div>
            <label className="lg-date">
              <span>日期</span>
              <input type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value || today())} />
            </label>

            <ul className="lg-items">
              {items.map((it) => {
                const t = it.target!;
                const vals = reps[it.exId!] ?? [];
                const nums = vals.slice(0, t.sets).map(Number);
                const done = nums.filter((n) => n > 0).length === t.sets && nums.every((n) => n >= t.hi);
                return (
                  <li key={it.exId}>
                    <div className="lg-it-head">
                      <b>{it.name}</b>
                      <span>目標 {t.sets} × {t.lo}–{t.hi} {t.unit}</span>
                      {done && <em className="lg-badge">達標</em>}
                    </div>
                    <div className="lg-sets">
                      {Array.from({ length: t.sets }, (_, i) => (
                        <label key={i}>
                          <span>第 {i + 1} 組</span>
                          <input
                            inputMode="numeric"
                            value={vals[i] ?? ""}
                            placeholder={String(t.hi)}
                            onChange={(e) => setRep(it.exId!, i, e.target.value)}
                            aria-label={`${it.name} 第 ${i + 1} 組${t.unit === "秒" ? "秒數" : "次數"}`}
                          />
                          <em>{t.unit}</em>
                        </label>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
            <button className="btn btn-signal" onClick={save}>儲存這次訓練</button>

            {saved && (
              <div className="lg-result" role="status">
                <p>已記錄 {saved.date} · {saved.title}。</p>
                {ready.length === 0 && <p className="fine">每一組都做到次數上限時，就可以升級到下一式。</p>}
                {ready.map((it) => (
                  <div key={it.family} className="lg-up">
                    <span>
                      <b>{MOVE_ZH[it.family]}</b> 已達升級標準：第 {it.step} 式 → 第 {it.step + 1} 式「{stepName(it.family, it.step + 1)}」
                    </span>
                    <button
                      className="btn btn-ink"
                      onClick={() => {
                        onLevelUp(it.family);
                        setSaved((s) => (s ? { ...s, items: s.items.filter((x) => x.family !== it.family) } : s));
                      }}
                    >
                      升級並更新課表
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="lg-hist">
        <div className="lg-fam" role="tablist" aria-label="動作">
          {FAMILIES.map((f) => (
            <button key={f} role="tab" aria-selected={f === family} className={f === family ? "on" : ""} onClick={() => setFamily(f)}>
              {MOVE_ZH[f]}
            </button>
          ))}
        </div>
        <Progress log={log} family={family} />

        <div className="lg-recent">
          <div className="lg-chart-head">
            <span>最近紀錄</span>
            {log.length > 0 && <button className="linkish" onClick={clearAll}>清除全部</button>}
          </div>
          {recent.length === 0 ? (
            <p className="lg-empty">紀錄會保存在這台裝置的瀏覽器裡。</p>
          ) : (
            <ul>
              {recent.map((e) => (
                <li key={e.id}>
                  <span className="lg-r-date">{e.date.slice(5)}</span>
                  <span className="lg-r-title">{e.title}</span>
                  <span className="lg-r-sum">
                    {e.items.map((it) => `${MOVE_ZH[it.family]} ${it.sets.join("/")}`).join(" · ")}
                  </span>
                  <button className="lg-del" onClick={() => remove(e.id)} aria-label={`刪除 ${e.date} 的紀錄`}>×</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
