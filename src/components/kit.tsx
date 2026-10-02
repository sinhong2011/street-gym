import { Player, type PlayerRef } from "@remotion/player";
import { useEffect, useRef, useState, type ComponentType, type CSSProperties } from "react";
import { moveForExercise, showMuscles } from "../lib/links";
import { LIBRARY } from "../pose/progressions";
import { Scenery } from "../remotion/Scenery";
import { BONES, sampleTrack, solve, type Joints, type Vec } from "../pose/skeleton";
import { C } from "../theme";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Adds `.is-in` once an element scrolls into view. */
export const useReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -12% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
};

const useInView = <T extends Element>(margin = "200px") => {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setVisible(e.isIntersecting);
        if (e.isIntersecting) setNear(true);
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return { ref, near, visible };
};

type LazyPlayerProps<P extends Record<string, unknown>> = (
  | { component: ComponentType<P>; lazy?: never }
  /** Code-split composition: its module (e.g. three.js) loads only when the player mounts. Must be a stable reference. */
  | { lazy: () => Promise<{ default: ComponentType<P> }>; component?: never }
) & {
  inputProps: P;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  className?: string;
  label: string;
};

/** Remotion Player that mounts when near the viewport and only plays while visible. */
export function LazyPlayer<P extends Record<string, unknown>>(props: LazyPlayerProps<P>) {
  const { ref, near, visible } = useInView<HTMLDivElement>();
  const player = useRef<PlayerRef>(null);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    const p = player.current;
    if (!p || reduced) return;
    if (visible) p.play();
    else p.pause();
  }, [visible, near, reduced]);

  // Restart from the top whenever the shown exercise changes.
  const propsKey = JSON.stringify(props.inputProps);
  useEffect(() => {
    player.current?.seekTo(0);
  }, [propsKey]);

  return (
    <div
      ref={ref}
      className={props.className}
      style={{ aspectRatio: `${props.width} / ${props.height}` } as CSSProperties}
      role="img"
      aria-label={props.label}
    >
      {near && (
        <Player
          ref={player}
          {...(props.lazy ? { lazyComponent: props.lazy } : { component: props.component! })}
          renderLoading={() => <div className="player-loading">載入動畫…</div>}
          inputProps={props.inputProps}
          compositionWidth={props.width}
          compositionHeight={props.height}
          fps={props.fps}
          durationInFrames={props.durationInFrames}
          loop
          autoPlay={!reduced}
          controls={reduced}
          clickToPlay={false}
          acknowledgeRemotionLicense
          style={{ width: "100%", height: "100%" }}
        />
      )}
    </div>
  );
}

// ---------- static pose glyphs (chronophotography strips, leverage diagram) ----------

export const PoseLines: React.FC<{ j: Joints; w: number; color?: string; far?: string }> = ({
  j,
  w,
  color = C.ink,
  far = C.inkSoft,
}) => {
  const s = (a: Vec, b: Vec, k: number, c: string) => (
    <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={c} strokeWidth={w * k} strokeLinecap="round" />
  );
  return (
    <g>
      {s(j.neck, j.elbowFar, 0.8, far)}
      {s(j.elbowFar, j.handFar, 0.72, far)}
      {s(j.hip, j.kneeFar, 0.9, far)}
      {s(j.kneeFar, j.footFar, 0.8, far)}
      {s(j.hip, j.neck, 1.55, color)}
      <circle cx={j.head[0]} cy={j.head[1]} r={BONES.headR} fill={color} />
      {s(j.hip, j.knee, 1, color)}
      {s(j.knee, j.foot, 0.88, color)}
      {s(j.neck, j.elbow, 0.88, color)}
      {s(j.elbow, j.hand, 0.8, color)}
    </g>
  );
};

/** A Muybridge-style row of frozen frames from an exercise loop. */
export const ChronoStrip: React.FC<{ exerciseId: string; frames?: number; from?: number; to?: number; className?: string }> = ({
  exerciseId,
  frames = 8,
  from = 0,
  to = 0.5,
  className,
}) => {
  const ex = LIBRARY[exerciseId];
  const shots = Array.from({ length: frames }, (_, i) => {
    const t = from + ((to - from) * i) / (frames - 1);
    return solve(sampleTrack(ex.keys, t).pose, ex.constraint);
  });
  const all = shots.flatMap((j) => Object.values(j));
  const minX = Math.min(...all.map((v) => v[0])) - 9;
  const maxX = Math.max(...all.map((v) => v[0])) + 9;
  const minY = Math.min(...all.map((v) => v[1])) - 9;
  const maxY = Math.max(...all.map((v) => v[1])) + 9;
  const vb = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
  return (
    <ol className={`chrono ${className ?? ""}`} aria-label={`${ex.zh} 連續動作分解`}>
      {shots.map((j, i) => (
        <li key={i} style={{ "--i": i } as CSSProperties}>
          <svg viewBox={vb} aria-hidden>
            {ex.apparatus === "bar" && <circle cx={0} cy={0} r={2.4} fill={C.signal} />}
            {ex.apparatus === "floor" && <line x1={minX} x2={maxX} y1={0} y2={0} stroke={C.rule} strokeWidth={1} />}
            {ex.props && <Scenery props={ex.props(j)} px={1} span={[minX, maxX]} />}
            <PoseLines j={j} w={5} />
          </svg>
          <span>{String(i + 1).padStart(2, "0")}</span>
        </li>
      ))}
    </ol>
  );
};


/** "See the muscles" link: focuses the 3D muscle map on the movement behind an exercise. */
export const MuscleLink: React.FC<{ exId: string }> = ({ exId }) => {
  const move = moveForExercise(exId);
  if (!move) return null;
  return (
    <button className="muscle-link" onClick={() => showMuscles(move)}>
      看練到的肌肉 <span aria-hidden>→</span>
    </button>
  );
};
