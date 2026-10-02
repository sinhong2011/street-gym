// Front / back anatomical muscle chart. Shapes are authored for the figure's right half (x ≥ 100)
// on a 200 × 445 canvas and mirrored, so the body is perfectly symmetric.
import { C } from "../theme";

type Shape = { d: string; m?: string; full?: boolean };

const HEAD: Shape = { d: "M100 13 C 114 13 122 25 122 40 C 122 56 112 66 100 66 C 88 66 78 56 78 40 C 78 25 86 13 100 13 Z", full: true };
const NECK: Shape = { d: "M90 62 L110 62 L113 84 L87 84 Z", full: true };
const HAND: Shape = { d: "M172 276 C 180 274 186 281 186 292 C 186 304 180 312 174 310 C 169 302 168 288 172 276 Z" };
const FOREARM: Shape = { d: "M156 202 C 166 198 176 204 180 220 C 184 238 184 256 180 271 L 171 272 C 165 254 159 232 156 214 Z", m: "forearm" };
const DELT: Shape = { d: "M140 92 C 156 87 168 99 167 121 C 166 133 160 140 154 142 C 150 128 146 112 136 100 Z", m: "delts" };
const KNEE = (y: number): Shape => ({ d: `M120 ${y} C 124 ${y - 8} 140 ${y - 8} 144 ${y} C 142 ${y + 8} 124 ${y + 8} 120 ${y} Z` });
const FOOT: Shape = { d: "M128 422 L 144 420 C 152 426 157 432 153 437 L 126 437 Z" };

export const FRONT: Shape[] = [
  HEAD,
  NECK,
  { d: "M112 74 C 122 82 136 86 147 90 L 138 97 C 127 93 117 91 108 89 Z", m: "upperback" },
  DELT,
  { d: "M104 97 C 120 92 135 96 141 104 C 148 116 150 131 146 142 C 136 152 116 154 104 148 Z", m: "chest" },
  { d: "M146 136 C 150 142 152 151 150 162 C 147 157 145 150 145 144 Z", m: "lats" },
  { d: "M152 144 C 160 140 168 146 170 160 C 172 176 170 190 166 196 C 160 196 154 190 152 176 Z", m: "biceps" },
  FOREARM,
  HAND,
  { d: "M104 157 h 15 a 3 3 0 0 1 3 3 v 13 a 3 3 0 0 1 -3 3 h -15 Z", m: "core" },
  { d: "M104 180 h 15 a 3 3 0 0 1 3 3 v 14 a 3 3 0 0 1 -3 3 h -15 Z", m: "core" },
  { d: "M104 204 h 15 a 3 3 0 0 1 3 3 v 13 a 3 3 0 0 1 -3 3 h -15 Z", m: "core" },
  { d: "M104 227 h 15 C 120 240 112 250 104 254 Z", m: "core" },
  { d: "M126 157 C 136 156 143 151 147 148 C 149 170 147 196 141 220 C 135 226 128 226 126 222 Z", m: "core" },
  { d: "M100 252 L 106 262 L 100 272 Z", full: false },
  { d: "M107 262 C 113 246 128 233 145 230 C 154 252 156 284 152 313 C 150 325 144 333 136 335 C 128 335 120 329 116 318 C 110 300 106 280 107 262 Z", m: "quads" },
  KNEE(344),
  { d: "M122 356 C 130 352 144 354 148 366 C 152 384 148 404 142 418 L 130 420 C 126 404 120 380 122 356 Z", m: "calves" },
  FOOT,
];

export const BACK: Shape[] = [
  HEAD,
  NECK,
  { d: "M100 70 L 112 72 C 124 82 139 87 148 92 L 133 103 C 121 113 109 130 100 152 Z", m: "upperback" },
  { d: "M110 114 C 120 104 133 102 143 107 C 145 119 140 130 131 134 C 121 133 113 127 110 120 Z", m: "upperback" },
  DELT,
  { d: "M104 152 C 115 137 132 134 146 136 C 150 151 148 172 140 196 C 130 210 116 215 111 216 L 110 160 Z", m: "lats" },
  { d: "M101 156 L 108 158 C 110 188 110 212 109 232 L 101 234 Z", m: "erectors" },
  { d: "M152 140 C 160 136 170 144 172 160 C 174 176 170 192 164 198 C 158 196 154 186 152 170 Z", m: "triceps" },
  FOREARM,
  HAND,
  { d: "M102 238 C 116 227 140 227 148 239 C 154 254 150 270 140 276 C 126 280 110 276 102 268 Z", m: "glutes" },
  { d: "M108 283 C 120 280 140 282 150 285 C 154 304 150 324 142 337 C 132 341 120 337 116 329 C 110 314 106 298 108 283 Z", m: "hams" },
  KNEE(346),
  { d: "M120 356 C 130 347 146 350 150 366 C 152 382 146 396 140 404 C 134 404 126 398 122 386 C 118 374 118 362 120 356 Z", m: "calves" },
  { d: "M128 404 L 140 404 L 138 420 L 130 420 Z" },
  FOOT,
];

const MIRROR = "translate(200 0) scale(-1 1)";

export const AnatomyView: React.FC<{
  shapes: Shape[];
  level: (key: string) => 0 | 1 | 2;
  names: Record<string, string>;
  onPick: (key: string) => void;
}> = ({ shapes, level, names, onPick }) => {
  const draw = (mirror: boolean) =>
    shapes
      .filter((s) => !(mirror && s.full))
      .map((s, i) => {
        const l = s.m ? level(s.m) : 0;
        const fill = !s.m ? C.paperDeep : l === 2 ? C.signal : l === 1 ? C.signalSoft : "#d6ccbb";
        return (
          <path
            key={`${mirror}-${i}`}
            d={s.d}
            fill={fill}
            stroke={C.ink}
            strokeWidth={0.9}
            strokeLinejoin="round"
            className={s.m ? "an-m" : undefined}
            onClick={s.m ? () => onPick(s.m!) : undefined}
            style={{ transition: "fill 0.35s" }}
          >
            {s.m && <title>{names[s.m]}</title>}
          </path>
        );
      });
  return (
    <g>
      <g>{draw(false)}</g>
      <g transform={MIRROR}>{draw(true)}</g>
    </g>
  );
};
