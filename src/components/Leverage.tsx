import { useEffect, useRef, useState } from "react";
import { LEVERAGE } from "../content";
import { solve, type Pose } from "../pose/skeleton";
import { C } from "../theme";
import { PoseLines, prefersReducedMotion } from "./kit";

/** Push-up plank inclined θ degrees above horizontal (negative = feet elevated). */
const plank = (theta: number, kneel: number): Pose => {
  const torso = 90 + theta;
  const thigh = torso - 180;
  // kneeling folds the shin up behind the knee and brings the hands back under the shoulders
  const shin = thigh - kneel * 50;
  const arm = theta - kneel * 16;
  return { torso, head: torso + 4, arm: [arm, arm], leg: [thigh, shin] };
};

const useTween = (target: number, ms = 650) => {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (prefersReducedMotion()) {
      setV(target);
      return;
    }
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / ms, 1);
      const e = 1 - Math.pow(1 - t, 4); // ease-out-quart
      const x = a + (target - a) * e;
      from.current = x;
      setV(x);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
};

export const Leverage: React.FC = () => {
  const [idx, setIdx] = useState(3);
  const cur = LEVERAGE[idx];
  const theta = useTween(cur.angle);
  const kneel = useTween(cur.knees ? 1 : 0);
  const load = useTween(cur.load);

  const pose = plank(theta, kneel);
  const anchor = kneel > 0.5 ? "knee" : "foot";
  const j = solve(pose, { anchor, at: [0, 0] });
  const lowest = Math.max(j.hand[1], j.foot[1], kneel > 0.5 ? j.knee[1] : -Infinity, 0);
  const floor = lowest;
  const handLift = floor - j.hand[1]; // box under hands
  const feetLift = floor - j.foot[1]; // box under feet
  const isWall = cur.key === "wall";

  return (
    <div className="lev">
      <div className="lev-copy">
        <p className="eyebrow">互動 · Leverage</p>
        <h3 className="lev-title">同一個俯臥撐，<br />手上承受的體重比例</h3>
        <div className="lev-load" aria-live="polite">
          <span className="lev-num">{Math.round(load)}</span>
          <span className="lev-pct">%</span>
          <span className="lev-unit">體重</span>
        </div>
        <div className="lev-bar"><i style={{ transform: `scaleX(${load / 100})` }} /></div>
        <div className="lev-seg" role="radiogroup" aria-label="俯臥撐變式">
          {LEVERAGE.map((l, i) => (
            <button key={l.key} role="radio" aria-checked={i === idx} className={i === idx ? "on" : ""} onClick={() => setIdx(i)}>
              {l.zh}
            </button>
          ))}
        </div>
        <p className="fine">測力板研究的約略估算，會因身形與手位而異。單臂俯臥撐則把這份負荷全部壓在一隻手上。</p>
      </div>

      <svg className="lev-fig" viewBox="-72 -92 144 120" aria-label={`${cur.zh}俯臥撐示意`}>
        <g transform={`translate(${-(j.foot[0] + j.hand[0]) / 2} ${20 - floor})`}>
        <line x1={-200} x2={200} y1={floor} y2={floor} stroke={C.ink} strokeWidth={0.8} />
        {isWall ? (
          <rect x={j.hand[0]} y={-90} width={4} height={90 + floor} fill={C.ink} />
        ) : (
          <>
            {handLift > 3 && <rect x={j.hand[0] - 8} y={j.hand[1]} width={16} height={handLift} fill="none" stroke={C.ink} strokeWidth={0.8} />}
            {feetLift > 3 && <rect x={j.foot[0] - 8} y={j.foot[1]} width={16} height={feetLift} fill="none" stroke={C.ink} strokeWidth={0.8} />}
          </>
        )}
        <line x1={j.hand[0]} x2={j.hand[0]} y1={j.hand[1] - 34} y2={j.hand[1] - 6} stroke={C.signal} strokeWidth={1.4} markerEnd="url(#arr)" />
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill={C.signal} />
          </marker>
        </defs>
        <PoseLines j={j} w={4.4} />
        </g>
      </svg>
    </div>
  );
};
