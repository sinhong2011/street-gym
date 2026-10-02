import { useCallback, useEffect, useRef, useState } from "react";
import { HIIT_MOVES, HIIT_PRESETS, ZONES, type HiitPreset } from "../content";
import { LIBRARY } from "../pose/progressions";
import { DEMO, FPS } from "../remotion/compositions";
import { ExerciseScene, type ExerciseSceneProps } from "../remotion/ExerciseScene";
import { LazyPlayer } from "./kit";

// ---------------- heart-rate zones ----------------

export const Zones: React.FC = () => {
  const [age, setAge] = useState(30);
  const max = Math.round(208 - 0.7 * age); // Tanaka et al. estimate
  return (
    <div className="zones">
      <div className="zones-head">
        <label className="zones-age">
          <span>年齡</span>
          <input type="range" min={15} max={70} value={age} onChange={(e) => setAge(+e.target.value)} aria-label="年齡" />
          <output>{age}</output>
        </label>
        <p className="zones-max">
          估算最大心率 <b>{max}</b> bpm
        </p>
      </div>
      <ol className="zones-bar">
        {ZONES.map((z) => (
          <li key={z.z} className={`zn-${z.z}`}>
            <span className="zn-z">{z.z}</span>
            <span className="zn-zh">{z.zh}</span>
            <span className="zn-bpm">
              {Math.round(max * z.lo)}–{Math.round(max * z.hi)}
            </span>
            <span className="zn-talk">{z.talk}</span>
          </li>
        ))}
      </ol>
      <p className="fine">最大心率以 208 − 0.7 × 年齡 估算，個體差異可達 ±10 bpm；「說話測試」往往比數字更可靠。</p>
    </div>
  );
};

// ---------------- HIIT timer ----------------

type Phase = "idle" | "ready" | "work" | "rest" | "done";
const READY = 10;

const useBeep = () => {
  const ctx = useRef<AudioContext | null>(null);
  return useCallback((freq: number, ms = 120) => {
    try {
      ctx.current ??= new AudioContext();
      const ac = ctx.current;
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.18, ac.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + ms / 1000);
      o.connect(g).connect(ac.destination);
      o.start();
      o.stop(ac.currentTime + ms / 1000 + 0.02);
    } catch {
      /* audio unavailable: the timer still works silently */
    }
  }, []);
};

export const HiitTimer: React.FC = () => {
  const [preset, setPreset] = useState<HiitPreset>(HIIT_PRESETS[0]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(1);
  const [left, setLeft] = useState(READY);
  const [running, setRunning] = useState(false);
  const [sound, setSound] = useState(true);
  const beep = useBeep();

  // Single source of truth: the end time of the current phase.
  const endAt = useRef(0);
  const pausedLeft = useRef(0);

  const enter = useCallback(
    (p: Phase, seconds: number) => {
      setPhase(p);
      setLeft(seconds);
      endAt.current = performance.now() + seconds * 1000;
      if (sound && p !== "done") beep(p === "work" ? 880 : 520, 260);
    },
    [beep, sound],
  );

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let lastWhole = -1;
    const tick = () => {
      const ms = endAt.current - performance.now();
      const s = Math.max(0, Math.ceil(ms / 1000));
      if (s !== lastWhole) {
        lastWhole = s;
        setLeft(s);
        if (sound && s > 0 && s <= 3) beep(660, 90);
      }
      if (ms <= 0) {
        if (phase === "ready") enter("work", preset.work);
        else if (phase === "work") {
          if (round >= preset.rounds) {
            enter("done", 0);
            setRunning(false);
            if (sound) beep(990, 600);
            return;
          }
          enter("rest", preset.rest);
        } else if (phase === "rest") {
          setRound((r) => r + 1);
          enter("work", preset.work);
        }
        return; // effect re-runs with the new phase
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, phase, round, preset, enter, beep, sound]);

  const start = () => {
    if (phase === "idle" || phase === "done") {
      setRound(1);
      enter("ready", READY);
    } else {
      endAt.current = performance.now() + pausedLeft.current;
    }
    setRunning(true);
  };
  const pause = () => {
    pausedLeft.current = endAt.current - performance.now();
    setRunning(false);
  };
  const reset = () => {
    setRunning(false);
    setPhase("idle");
    setRound(1);
    setLeft(READY);
  };
  const choose = (p: HiitPreset) => {
    reset();
    setPreset(p);
  };

  const moveIdx = (round - 1) % HIIT_MOVES.length;
  const showMove = phase === "rest" ? HIIT_MOVES[round % HIIT_MOVES.length] : HIIT_MOVES[moveIdx];
  const ex = LIBRARY[showMove];
  const phaseTotal = phase === "work" ? preset.work : phase === "rest" ? preset.rest : READY;
  const frac = phase === "idle" ? 0 : phase === "done" ? 1 : 1 - left / phaseTotal;
  const total = preset.rounds * (preset.work + preset.rest) - preset.rest;
  const label = { idle: "準備開始", ready: "準備", work: "衝刺", rest: "休息 · 下一個", done: "完成" }[phase];

  return (
    <div className={`hiit ph-${phase}`}>
      <div className="hiit-presets" role="radiogroup" aria-label="HIIT 課表">
        {HIIT_PRESETS.map((p) => (
          <button key={p.key} role="radio" aria-checked={p.key === preset.key} className={p.key === preset.key ? "on" : ""} onClick={() => choose(p)}>
            <b>{p.zh}</b>
            <span>{p.note}</span>
          </button>
        ))}
      </div>

      <div className="hiit-body">
        <div className="hiit-clock" aria-live="polite">
          <p className="hiit-phase">{label}</p>
          <p className="hiit-sec">{phase === "done" ? "✓" : String(left).padStart(2, "0")}</p>
          <div className="hiit-bar"><i style={{ transform: `scaleX(${frac})` }} /></div>
          <p className="hiit-round">
            第 <b>{Math.min(round, preset.rounds)}</b> / {preset.rounds} 回合 · 共 {Math.floor(total / 60)}′{String(total % 60).padStart(2, "0")}″
          </p>
          <ol className="hiit-dots" aria-hidden>
            {Array.from({ length: preset.rounds }, (_, i) => (
              <li key={i} className={i + 1 < round || phase === "done" ? "done" : i + 1 === round && phase !== "idle" ? "now" : ""} />
            ))}
          </ol>
          <div className="hiit-ctl">
            {running ? (
              <button className="btn btn-ink" onClick={pause}>暫停</button>
            ) : (
              <button className="btn btn-signal" onClick={start}>{phase === "idle" || phase === "done" ? "開始" : "繼續"}</button>
            )}
            <button className="btn btn-line" onClick={reset}>重設</button>
            <button className="btn btn-line" onClick={() => setSound((s) => !s)} aria-pressed={sound}>
              {sound ? "聲音 開" : "聲音 關"}
            </button>
          </div>
        </div>

        <div className="hiit-move">
          <LazyPlayer<ExerciseSceneProps>
            className="frame"
            component={ExerciseScene}
            inputProps={{ exerciseId: ex.id, figNo: HIIT_MOVES.indexOf(showMove) + 1, hud: true }}
            width={DEMO.width}
            height={DEMO.height}
            fps={FPS}
            durationInFrames={Math.round(ex.seconds * FPS * 6)}
            label={`${ex.zh}動作示範`}
          />
          <ul className="hiit-list">
            {HIIT_MOVES.map((id) => (
              <li key={id} className={id === showMove ? "on" : ""}>
                {LIBRARY[id].zh}
                <span>{LIBRARY[id].en}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
