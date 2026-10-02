import { useEffect, useState } from "react";
import { HOTSPOTS, PAIN_LIGHT, PREHAB, WARMUP_FLOW } from "../content";
import { LIBRARY } from "../pose/progressions";
import { DEMO, FPS } from "../remotion/compositions";
import { ExerciseScene, type ExerciseSceneProps } from "../remotion/ExerciseScene";
import { AnatomyView, BACK, FRONT } from "./Anatomy";
import type { HotspotKey } from "./Anatomy3D";
import { ANATOMY_CREDIT, Anatomy3DLazy } from "./Anatomy3DLazy";
import { ChronoStrip, LazyPlayer } from "./kit";

const TOTAL = WARMUP_FLOW.reduce((a, w) => a + w.sec, 0);
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export const WarmupFlow: React.FC = () => {
  const [idx, setIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(WARMUP_FLOW[0].sec);
  const cur = WARMUP_FLOW[idx];

  useEffect(() => {
    if (!running) return;
    const end = Date.now() + left * 1000;
    const id = setInterval(() => {
      const s = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setLeft(s);
      if (s === 0) {
        clearInterval(id);
        if (idx < WARMUP_FLOW.length - 1) {
          setIdx(idx + 1);
          setLeft(WARMUP_FLOW[idx + 1].sec);
        } else setRunning(false);
      }
    }, 250);
    return () => clearInterval(id);
    // restart the interval only when the item or running state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, idx]);

  const go = (i: number) => {
    setIdx(i);
    setLeft(WARMUP_FLOW[i].sec);
  };
  const ex = cur.ex ? LIBRARY[cur.ex] : null;
  const elapsed = WARMUP_FLOW.slice(0, idx).reduce((a, w) => a + w.sec, 0) + (cur.sec - left);

  return (
    <div className="wu">
      <ol className="wu-list">
        {WARMUP_FLOW.map((w, i) => (
          <li key={w.zh} className={i === idx ? "on" : i < idx && running ? "done" : ""}>
            <button onClick={() => go(i)} aria-current={i === idx ? "step" : undefined}>
              <span className="wu-no">{String(i + 1).padStart(2, "0")}</span>
              <span className="wu-name">
                <b>{w.zh}</b>
                <em>{w.dose}</em>
              </span>
              {w.ex ? <ChronoStrip exerciseId={w.ex} frames={4} from={0} to={0.5} className="wu-strip" /> : <span className="wu-strip wu-text">示範請看說明</span>}
            </button>
          </li>
        ))}
      </ol>

      <div className="wu-stage">
        {ex ? (
          <LazyPlayer<ExerciseSceneProps>
            className="frame"
            component={ExerciseScene}
            inputProps={{ exerciseId: ex.id, figNo: idx + 1, hud: true }}
            width={DEMO.width}
            height={DEMO.height}
            fps={FPS}
            durationInFrames={Math.round(ex.seconds * FPS * 6)}
            label={`${ex.zh}示範動畫`}
          />
        ) : (
          <div className="frame wu-card" style={{ aspectRatio: `${DEMO.width} / ${DEMO.height}` }}>
            <span className="wu-card-no">FIG.{String(idx + 1).padStart(2, "0")}</span>
            <b>{cur.zh}</b>
            <p>{cur.how}</p>
          </div>
        )}
        <div className="wu-ctl">
          <div className="wu-time">
            <span className="wu-left">{mmss(left)}</span>
            <span className="wu-of">
              {cur.zh} · 全部 {mmss(elapsed)} / {mmss(TOTAL)}
            </span>
          </div>
          <div className="wu-bar"><i style={{ transform: `scaleX(${elapsed / TOTAL})` }} /></div>
          <p className="wu-how">{cur.how}</p>
          <div className="wu-btns">
            <button className={`btn ${running ? "btn-ink" : "btn-signal"}`} onClick={() => setRunning((r) => !r)}>
              {running ? "暫停" : idx === 0 && left === cur.sec ? "跟著做" : "繼續"}
            </button>
            <button className="btn btn-line" onClick={() => go(Math.min(idx + 1, WARMUP_FLOW.length - 1))} disabled={idx === WARMUP_FLOW.length - 1}>
              下一個
            </button>
            <button className="btn btn-line" onClick={() => { setRunning(false); go(0); }}>重來</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const InjuryMap: React.FC = () => {
  const [sel, setSel] = useState("shoulder");
  const h = HOTSPOTS.find((x) => x.key === sel)!;
  const none = () => 0 as const;
  const dots = (view: "front" | "back") =>
    HOTSPOTS.filter((x) => x.view === view).flatMap((x) => {
      const xs = x.x === 100 ? [100] : [x.x, 200 - x.x];
      return xs.map((cx, i) => (
        <g key={`${x.key}-${i}`} className={`hs ${x.key === sel ? "on" : ""}`} onClick={() => setSel(x.key)} role="button" aria-label={x.zh}>
          <circle cx={cx} cy={x.y} r={16} className="hs-ring" />
          <circle cx={cx} cy={x.y} r={7} className="hs-dot" />
        </g>
      ));
    });

  return (
    <div className="inj">
      <figure className="inj-fig">
        <Anatomy3DLazy
          level={none}
          names={{}}
          hotspots={HOTSPOTS.map((x) => ({ key: x.key as HotspotKey, on: x.key === sel }))}
          onHotspot={setSel}
          label="3D 人體模型上標示的常見受傷部位"
          fallback={
            <svg viewBox="0 0 420 470" aria-label="常見受傷部位">
              <g>
                <AnatomyView shapes={FRONT} level={none} names={{}} onPick={() => {}} />
                {dots("front")}
              </g>
              <g transform="translate(220 0)">
                <AnatomyView shapes={BACK} level={none} names={{}} onPick={() => {}} />
                {dots("back")}
              </g>
            </svg>
          }
        />
        <p className="a3d-credit">{ANATOMY_CREDIT}</p>
        <div className="inj-tabs" role="tablist" aria-label="受傷部位">
          {HOTSPOTS.map((x) => (
            <button key={x.key} role="tab" aria-selected={x.key === sel} className={x.key === sel ? "on" : ""} onClick={() => setSel(x.key)}>
              {x.zh}
            </button>
          ))}
        </div>
      </figure>

      <div className="inj-detail" role="tabpanel" key={h.key}>
        <h3 className="inj-title">{h.zh}</h3>
        <dl>
          <dt>為什麼會受傷</dt>
          <dd>{h.cause}</dd>
          <dt>怎麼預防</dt>
          <dd>{h.prevent}</dd>
          <dt className="warn">警訊</dt>
          <dd>{h.warn}</dd>
        </dl>

        <h3 className="sub-title inj-sub">疼痛紅綠燈</h3>
        <ol className="light">
          {PAIN_LIGHT.map((p) => (
            <li key={p.k} className={`lt-${p.k}`}>
              <span className="lt-zh">{p.zh}</span>
              <span className="lt-r">{p.r}</span>
              <span className="lt-d">{p.d}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export const Prehab: React.FC = () => (
  <div className="prehab">
    <div>
      <h3 className="sub-title">防傷小課表</h3>
      <p className="fine">每週 2–3 次，每次約 10 分鐘。可以接在熱身後，或放在休息日。</p>
    </div>
    <ol>
      {PREHAB.map((p, i) => (
        <li key={p.zh}>
          <span className="pb-i">{String(i + 1).padStart(2, "0")}</span>
          <b>{p.zh}</b>
          <span className="pb-t">{p.target}</span>
          <span className="pb-d">{p.dose}</span>
        </li>
      ))}
    </ol>
  </div>
);
