import { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { Exercise } from "../pose/exercises";
import { LIBRARY } from "../pose/progressions";
import { BONES, sampleTrack, solve, type Joints, type Vec } from "../pose/skeleton";
import { C, FONT } from "../theme";
import { Scenery, sceneryBounds } from "./Scenery";

export type ExerciseSceneProps = { exerciseId: string; figNo?: number; hud?: boolean };

const ECHOES = 6;
const ECHO_GAP = 0.028;

const jointsAt = (ex: Exercise, p: number): { j: Joints; label?: string } => {
  const { pose, label } = sampleTrack(ex.keys, p);
  return { j: solve(pose, ex.constraint), label };
};

/** World-space bounds over the whole loop, padded for apparatus. */
const boundsOf = (ex: Exercise) => {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i < 72; i++) {
    const { j } = jointsAt(ex, i / 72);
    for (const [x, y] of Object.values(j)) {
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
  }
  const r = BONES.headR + 4;
  minX -= r; minY -= r; maxX += r; maxY += r;
  if (ex.props) {
    const { xs, ys } = sceneryBounds(ex.props(jointsAt(ex, 0).j));
    minX = Math.min(minX, ...xs); maxX = Math.max(maxX, ...xs);
    minY = Math.min(minY, ...ys); maxY = Math.max(maxY, ...ys);
  }
  if (ex.apparatus === "parallettes") maxY = Math.max(maxY, 20);
  if (ex.apparatus !== "bar" && ex.apparatus !== "pole") maxY = Math.max(maxY, 2);
  return { minX, minY, maxX, maxY };
};

const Figure: React.FC<{ j: Joints; opacity?: number; color?: string; ghost?: boolean }> = ({
  j,
  opacity = 1,
  color = C.ink,
  ghost,
}) => {
  const w = 4.4; // world units, like the bones
  const seg = (a: Vec, b: Vec, width: number, stroke: string) => (
    <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={stroke} strokeWidth={width} strokeLinecap="round" />
  );
  const far = ghost ? color : C.inkSoft;
  return (
    <g opacity={opacity}>
      {/* far limbs */}
      {seg(j.neck, j.elbowFar, w * 0.8, far)}
      {seg(j.elbowFar, j.handFar, w * 0.72, far)}
      {seg(j.hip, j.kneeFar, w * 0.9, far)}
      {seg(j.kneeFar, j.footFar, w * 0.8, far)}
      {/* trunk */}
      {seg(j.hip, j.neck, w * 1.55, color)}
      <circle cx={j.head[0]} cy={j.head[1]} r={BONES.headR} fill={color} />
      {/* near limbs */}
      {seg(j.hip, j.knee, w, color)}
      {seg(j.knee, j.foot, w * 0.88, color)}
      {seg(j.neck, j.elbow, w * 0.88, color)}
      {seg(j.elbow, j.hand, w * 0.8, color)}
      {!ghost &&
        [j.elbow, j.knee, j.hip, j.neck].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={1.5} fill={C.paper} stroke={C.signal} strokeWidth={0.7} />
        ))}
    </g>
  );
};

const Apparatus: React.FC<{ ex: Exercise; s: number; b: ReturnType<typeof boundsOf> }> = ({ ex, s, b }) => {
  const stroke = C.ink;
  const floorLine = (y: number) => (
    <g>
      <line x1={b.minX - 400} x2={b.maxX + 400} y1={y} y2={y} stroke={stroke} strokeWidth={2 * s} />
      {Array.from({ length: 80 }, (_, i) => {
        const x = b.minX - 400 + i * 12;
        return <line key={i} x1={x} y1={y} x2={x - 5} y2={y + 5} stroke={C.rule} strokeWidth={0.6 * s} />;
      })}
    </g>
  );
  switch (ex.apparatus) {
    case "bar":
      return (
        <g>
          <line x1={-60} x2={60} y1={0} y2={0} stroke={C.rule} strokeWidth={0.6 * s} strokeDasharray={`${2 * s} ${2 * s}`} />
          <circle cx={0} cy={0} r={5} fill="none" stroke={C.signal} strokeWidth={0.8} />
          <circle cx={0} cy={0} r={2.8} fill={C.ink} />
        </g>
      );
    case "pole":
      return <line x1={-1} x2={-1} y1={b.minY - 300} y2={b.maxY + 300} stroke={C.ink} strokeWidth={2.6} />;
    case "parallettes":
      return (
        <g>
          <path d="M -9 20 L -5 0 L 5 0 L 9 20" fill="none" stroke={C.ink} strokeWidth={1.6} strokeLinejoin="round" />
          <circle cx={0} cy={0} r={1.8} fill={C.ink} />
          {floorLine(20)}
        </g>
      );
    case "none":
      return null;
    default:
      return floorLine(0);
  }
};

export const ExerciseScene: React.FC<ExerciseSceneProps> = ({ exerciseId, figNo = 1, hud = true }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const ex = LIBRARY[exerciseId] ?? LIBRARY.pushup;

  const loopFrames = Math.round(ex.seconds * fps);
  const p = (frame % loopFrames) / loopFrames;
  const rep = Math.floor(frame / loopFrames) + 1;

  const b = useMemo(() => boundsOf(ex), [ex]);
  const path = useMemo(() => {
    const pts: Vec[] = [];
    for (let i = 0; i <= 90; i++) pts.push(jointsAt(ex, i / 90).j[ex.trace]);
    return pts;
  }, [ex]);

  // Fit the figure into the frame, leaving room for the HUD.
  const padX = width * 0.14;
  const padTop = height * 0.2;
  const padBottom = height * 0.2;
  const bw = b.maxX - b.minX;
  const bh = b.maxY - b.minY;
  const scale = Math.min((width - padX * 2) / bw, (height - padTop - padBottom) / bh);
  const s = 1 / scale; // stroke widths are authored in screen px / scale
  const ox = width / 2 - ((b.minX + b.maxX) / 2) * scale;
  const oy = padTop + (height - padTop - padBottom) / 2 - ((b.minY + b.maxY) / 2) * scale;

  const now = jointsAt(ex, p);
  const echoes = Array.from({ length: ECHOES }, (_, i) => jointsAt(ex, p - (i + 1) * ECHO_GAP).j).reverse();

  // Trailing trace: the last 30% of the loop, in signal orange.
  const tail: Vec[] = [];
  for (let i = 0; i <= 30; i++) tail.push(jointsAt(ex, p - 0.3 + (i / 30) * 0.3).j[ex.trace]);
  const toD = (pts: Vec[]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");

  const labelKey = now.label ?? "";
  const labelIn = interpolate(
    p,
    [ex.keys.find((k) => k.label === labelKey)?.t ?? 0, (ex.keys.find((k) => k.label === labelKey)?.t ?? 0) + 0.06],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const seconds = frame / fps;
  const gridStep = width / 16;

  return (
    <AbsoluteFill style={{ backgroundColor: C.paper, fontFamily: FONT.sans, color: C.ink }}>
      {/* Muybridge backdrop: numbered vertical rules */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 17 }, (_, i) => (
          <g key={i}>
            <line x1={i * gridStep} x2={i * gridStep} y1={0} y2={height} stroke={C.rule} strokeWidth={i % 4 === 0 ? 1.4 : 0.7} />
            <text x={i * gridStep + 6} y={height - 14} fontSize={13} fill={C.inkSoft} fontFamily={FONT.display} letterSpacing={1}>
              {String(i).padStart(2, "0")}
            </text>
          </g>
        ))}
        <line x1={0} x2={width} y1={height * 0.12} y2={height * 0.12} stroke={C.rule} strokeWidth={0.7} />
        <line x1={0} x2={width} y1={height * 0.88} y2={height * 0.88} stroke={C.rule} strokeWidth={0.7} />

        <g transform={`translate(${ox} ${oy}) scale(${scale})`}>
          <Apparatus ex={ex} s={s} b={b} />
          {ex.props && <Scenery props={ex.props(now.j)} px={s} span={[b.minX - 400, b.maxX + 400]} />}
          <path d={toD(path)} fill="none" stroke={C.inkSoft} strokeWidth={0.6 * s} strokeDasharray={`${1.5 * s} ${3 * s}`} opacity={0.6} />
          {echoes.map((j, i) => (
            <Figure key={i} j={j} ghost color={C.signal} opacity={0.05 + (i / ECHOES) * 0.16} />
          ))}
          <path d={toD(tail)} fill="none" stroke={C.signal} strokeWidth={1.3} strokeLinecap="round" />
          <Figure j={now.j} />
          <circle cx={now.j[ex.trace][0]} cy={now.j[ex.trace][1]} r={2.2} fill={C.signal} />
        </g>
      </svg>

      {hud && (
        <>
          <div style={{ position: "absolute", left: 48, top: 40, right: 48, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontFamily: FONT.display, fontSize: 22, letterSpacing: 4, fontWeight: 700, color: C.signal }}>
                FIG.{String(figNo).padStart(2, "0")} — {ex.en.toUpperCase()}
              </div>
              <div style={{ fontFamily: FONT.serif, fontSize: 64, fontWeight: 900, lineHeight: 1.05, marginTop: 6 }}>{ex.zh}</div>
            </div>
            <div style={{ textAlign: "right", fontFamily: FONT.display, fontWeight: 700, letterSpacing: 2 }}>
              <div style={{ fontSize: 18, color: C.inkSoft }}>REP</div>
              <div style={{ fontSize: 64, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{String(rep).padStart(2, "0")}</div>
              <div style={{ fontSize: 18, color: C.inkSoft, fontVariantNumeric: "tabular-nums" }}>T+{seconds.toFixed(1)}s</div>
            </div>
          </div>

          <div style={{ position: "absolute", left: 48, right: 48, bottom: 46 }}>
            <div
              style={{
                fontSize: 30,
                fontWeight: 700,
                opacity: labelIn,
                transform: `translateY(${(1 - labelIn) * 14}px)`,
                marginBottom: 18,
              }}
            >
              {labelKey}
            </div>
            <div style={{ position: "relative", height: 6, background: C.paperDeep }}>
              <div style={{ position: "absolute", inset: 0, width: `${p * 100}%`, background: C.ink }} />
              {ex.keys.map((k, i) => (
                <div key={i} style={{ position: "absolute", left: `${k.t * 100}%`, top: -5, width: 2, height: 16, background: C.signal }} />
              ))}
            </div>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
