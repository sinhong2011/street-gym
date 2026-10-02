import type { Prop } from "../pose/exercises";
import { C } from "../theme";

/** Hatched floor, walls, boxes, balls… in world units. `px` converts screen pixels to world units for hairlines. */
export const Scenery: React.FC<{ props: Prop[]; px: number; span: [number, number] }> = ({ props, px, span }) => (
  <g>
    {props.map((p, i) => {
      switch (p.kind) {
        case "floor":
          return (
            <g key={i}>
              <line x1={span[0]} x2={span[1]} y1={p.y} y2={p.y} stroke={C.ink} strokeWidth={2 * px} />
              {Array.from({ length: Math.ceil((span[1] - span[0]) / 8) }, (_, k) => {
                const x = span[0] + k * 8;
                return <line key={k} x1={x} y1={p.y} x2={x - 4} y2={p.y + 4} stroke={C.rule} strokeWidth={1.2 * px} />;
              })}
            </g>
          );
        case "wall":
          return (
            <g key={i}>
              <rect x={p.x} y={p.y0} width={3} height={p.y1 - p.y0} fill={C.ink} />
            </g>
          );
        case "box":
          return <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} fill={C.paperDeep} stroke={C.ink} strokeWidth={1.4} />;
        case "ball":
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={p.r} fill={C.signalSoft} stroke={C.ink} strokeWidth={1.2} />
              <path d={`M ${p.x - p.r} ${p.y} Q ${p.x} ${p.y - p.r * 0.5} ${p.x + p.r} ${p.y}`} fill="none" stroke={C.ink} strokeWidth={0.8} />
              <line x1={p.x} x2={p.x} y1={p.y - p.r} y2={p.y + p.r} stroke={C.ink} strokeWidth={0.8} />
            </g>
          );
        case "pole":
          return <line key={i} x1={p.x} x2={p.x} y1={-400} y2={400} stroke={C.ink} strokeWidth={2.6} />;
        case "bar":
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={5} fill="none" stroke={C.signal} strokeWidth={0.8} />
              <circle cx={p.x} cy={p.y} r={2.8} fill={C.ink} />
            </g>
          );
        case "rope":
          return <line key={i} x1={p.x} x2={p.x} y1={p.y0} y2={p.y1} stroke={C.signal} strokeWidth={2.2} strokeLinecap="round" />;
      }
    })}
  </g>
);

/** Finite extents of scenery, for framing. Floors, poles and walls are unbounded in x/y and only add a little room. */
export const sceneryBounds = (props: Prop[]) => {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const p of props) {
    if (p.kind === "box") xs.push(p.x, p.x + p.w), ys.push(p.y, p.y + p.h);
    if (p.kind === "ball") xs.push(p.x - p.r, p.x + p.r), ys.push(p.y - p.r, p.y + p.r);
    if (p.kind === "floor") ys.push(p.y + 2);
    if (p.kind === "wall") xs.push(p.x - 2, p.x + 5);
    if (p.kind === "pole") xs.push(p.x - 3, p.x + 3);
    if (p.kind === "rope") ys.push(p.y1);
  }
  return { xs, ys };
};
