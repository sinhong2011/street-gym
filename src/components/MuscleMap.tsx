import { useEffect, useState } from "react";
import { MOVE_MUSCLES, MUSCLES } from "../content";
import { SHOW_MUSCLES } from "../lib/links";
import { LIBRARY } from "../pose/progressions";
import { AnatomyView, BACK, FRONT } from "./Anatomy";
import { ANATOMY_CREDIT, Anatomy3DLazy } from "./Anatomy3DLazy";

const NAMES = Object.fromEntries(MUSCLES.map((m) => [m.key, m.zh]));

export const MuscleMap: React.FC = () => {
  const [muscle, setMuscle] = useState<string>("lats");
  // `move` is pinned (click or a link from another section); `peek` is a hover preview on top of it.
  const [move, setMove] = useState<string | null>(null);
  const [peek, setPeek] = useState<string | null>(null);

  useEffect(() => {
    const on = (e: Event) => setMove((e as CustomEvent<string>).detail);
    window.addEventListener(SHOW_MUSCLES, on);
    return () => window.removeEventListener(SHOW_MUSCLES, on);
  }, []);

  const shown = peek ?? move;
  const mv = shown ? MOVE_MUSCLES.find((x) => x.id === shown)! : null;
  const sel = MUSCLES.find((m) => m.key === muscle)!;
  const level = (key: string): 0 | 1 | 2 => {
    if (mv) return mv.p.includes(key) ? 2 : mv.s.includes(key) ? 1 : 0;
    return key === muscle ? 2 : 0;
  };
  const pick = (key: string) => {
    setMuscle(key);
    setMove(null);
  };
  const trainedBy = MOVE_MUSCLES.filter((x) => x.p.includes(muscle) || x.s.includes(muscle));

  return (
    <div className="mm">
      <figure className="mm-fig">
        <Anatomy3DLazy
          level={level}
          onPick={pick}
          names={NAMES}
          label="可旋轉的 3D 人體肌肉模型"
          fallback={
            <svg viewBox="0 0 420 470" aria-label="正面與背面肌群圖">
              <AnatomyView shapes={FRONT} level={level} names={NAMES} onPick={pick} />
              <g transform="translate(220 0)">
                <AnatomyView shapes={BACK} level={level} names={NAMES} onPick={pick} />
              </g>
            </svg>
          }
        />
        <p className="a3d-credit">{ANATOMY_CREDIT}</p>
        <figcaption>
          {mv ? (
            <>
              <b>{LIBRARY[mv.id]?.zh ?? mv.zh}</b>
              <span className="mm-key"><i className="k2" />主要 <i className="k1" />輔助</span>
              <span className="mm-does">
                主要：{mv.p.map((k) => NAMES[k]).join("、")}
                {mv.s.length > 0 && <>　輔助：{mv.s.map((k) => NAMES[k]).join("、")}</>}
              </span>
              {move && !peek && (
                <button className="linkish mm-clear" onClick={() => setMove(null)}>
                  清除，回到肌群檢視
                </button>
              )}
            </>
          ) : (
            <>
              <b>{sel.zh}</b> <span className="mm-en">{sel.en}</span>
              <span className="mm-does">{sel.does}</span>
              <span className="mm-cue">→ {sel.cue}</span>
            </>
          )}
        </figcaption>
      </figure>

      <div className="mm-table-wrap" onMouseLeave={() => setPeek(null)}>
        <table className="mm-table">
          <thead>
            <tr>
              <th scope="col"><span className="sr">肌群</span></th>
              {MOVE_MUSCLES.map((x, i) => (
                <th key={x.id} scope="col" className={i === 6 ? "split" : ""}>
                  <button
                    className={shown === x.id ? "on" : ""}
                    onMouseEnter={() => setPeek(x.id)}
                    onMouseLeave={() => setPeek(null)}
                    onClick={() => {
                      setPeek(null);
                      setMove(move === x.id ? null : x.id);
                    }}
                    aria-pressed={move === x.id}
                  >
                    {x.zh}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MUSCLES.map((m) => (
              <tr key={m.key} className={!mv && m.key === muscle ? "on" : ""}>
                <th scope="row">
                  <button onClick={() => pick(m.key)} aria-pressed={!mv && m.key === muscle}>
                    {m.zh}
                  </button>
                </th>
                {MOVE_MUSCLES.map((x, i) => {
                  const l = x.p.includes(m.key) ? 2 : x.s.includes(m.key) ? 1 : 0;
                  return (
                    <td key={x.id} className={`${i === 6 ? "split" : ""} ${shown === x.id ? "col" : ""}`}>
                      {l > 0 && <i className={`dot k${l}`} aria-label={l === 2 ? "主要" : "輔助"} />}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="fine">
          {mv ? "" : `${sel.zh}：${trainedBy.map((x) => LIBRARY[x.id]?.zh ?? x.zh).join("、")}。`} 左六欄為六藝，右七欄為街頭神技。滑過欄位預覽，點擊鎖定。
        </p>
      </div>
    </div>
  );
};
