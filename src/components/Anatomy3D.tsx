// Interactive 3D écorché built from Z-Anatomy (CC BY-SA 4.0), exported with scripts/export-anatomy.py.
import { Canvas, useFrame, useLoader, type ThreeEvent } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { C } from "../theme";

const BASE = import.meta.env.BASE_URL;
const MODEL = `${BASE}models/anatomy.glb`;

/** Z-Anatomy object names -> the site's 13 muscle groups. */
const GROUPS: [string, RegExp][] = [
  ["chest", /pectoralis major/i],
  ["delts", /deltoid/i],
  ["triceps", /triceps brachii/i],
  ["biceps", /biceps brachii|^brachialis/i],
  ["forearm", /brachioradialis|flexor carpi|extensor carpi|flexor digitorum superficialis|extensor digitorum muscle|palmaris longus|pronator teres/i],
  ["lats", /latissimus dorsi|teres major/i],
  ["upperback", /trapezius|rhomboid|infraspinatus|teres minor|supraspinatus/i],
  ["core", /rectus abdominis|external abdominal oblique|serratus anterior/i],
  ["erectors", /iliocostalis|longissimus thoracis|spinalis thoracis/i],
  ["glutes", /gluteus maximus|gluteus medius/i],
  ["quads", /rectus femoris|vastus/i],
  ["hams", /biceps femoris|semitendinosus|semimembranosus/i],
  ["calves", /gastrocnemius|soleus/i],
];

/** Fascia sheets wrap the muscles like a skin; hide them so the muscle bellies read. */
const HIDDEN = /fascia|aponeurosis|septum|retinacul|transversalis/i;
/** …except the scalp (epicranial aponeurosis), so the head doesn't read as a bare skull. */
const SHOWN = /epicranial aponeurosis/i;

export type HotspotKey = "wrist" | "elbow" | "shoulder" | "lowback" | "knee";
type Part = { mesh: THREE.Mesh; kind: "M" | "B"; latin: string; group: string | null };

const cleanName = (o: THREE.Object3D) => {
  const raw = (o.userData?.name as string | undefined) ?? o.name;
  return raw.replace(/_/g, " ");
};

const SIDE = { side: THREE.DoubleSide } as const;
const MAT = {
  bone: new THREE.MeshStandardMaterial({ color: "#f2ece1", roughness: 0.85, ...SIDE }),
  muscle: new THREE.MeshStandardMaterial({ color: "#d8c6ae", roughness: 0.62, metalness: 0.02, ...SIDE }),
  hover: new THREE.MeshStandardMaterial({ color: "#c4ab8b", roughness: 0.6, ...SIDE }),
  primary: new THREE.MeshStandardMaterial({ color: C.signal, roughness: 0.5, emissive: C.signal, emissiveIntensity: 0.12, ...SIDE }),
  secondary: new THREE.MeshStandardMaterial({ color: C.signalSoft, roughness: 0.55, ...SIDE }),
};

type Props = {
  level: (group: string) => 0 | 1 | 2;
  onPick?: (group: string) => void;
  names?: Record<string, string>;
  hotspots?: { key: HotspotKey; on: boolean }[];
  onHotspot?: (key: HotspotKey) => void;
  label: string;
};

const useParts = () => {
  const gltf = useLoader(GLTFLoader, MODEL, (loader) => {
    const draco = new DRACOLoader();
    draco.setDecoderPath(`${BASE}draco/`);
    (loader as GLTFLoader).setDRACOLoader(draco);
  });
  return useMemo(() => {
    // useLoader caches one scene per URL; an Object3D can only live in one canvas, so each instance gets a clone
    // (geometry buffers stay shared).
    const root = gltf.scene.clone(true);
    // Normalise: centre the body at the origin, 2 units tall.
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = 2 / size.y;
    root.scale.setScalar(s);
    root.position.set(-center.x * s, -center.y * s, -center.z * s);
    root.updateMatrixWorld(true);

    const parts: Part[] = [];
    root.traverse((o) => {
      if (!(o as THREE.Mesh).isMesh) return;
      const mesh = o as THREE.Mesh;
      const name = cleanName(mesh);
      const kind = name.startsWith("B|") ? "B" : "M";
      const latin = name.slice(2).replace(/\.(l|r)$/, "").replace(/[()]/g, "");
      const group = kind === "M" ? (GROUPS.find(([, rx]) => rx.test(latin))?.[0] ?? null) : null;
      if (kind === "M" && HIDDEN.test(latin) && !SHOWN.test(latin)) {
        mesh.visible = false;
        return;
      }
      mesh.userData.part = { kind, latin, group };
      parts.push({ mesh, kind, latin, group });
    });

    // Hotspot anchors from the skeleton, in the root's world space (before the turntable rotation).
    const bbox = (rx: RegExp) => parts.filter((p) => p.kind === "B" && rx.test(p.latin)).map((p) => new THREE.Box3().setFromObject(p.mesh));
    const anchors: Record<HotspotKey, THREE.Vector3[]> = { wrist: [], elbow: [], shoulder: [], lowback: [], knee: [] };
    for (const b of bbox(/^Lunate bone$/)) anchors.wrist.push(b.getCenter(new THREE.Vector3()));
    for (const b of bbox(/^Humerus$/)) {
      const c = b.getCenter(new THREE.Vector3());
      anchors.elbow.push(new THREE.Vector3(c.x, b.min.y + 0.02, c.z));
      anchors.shoulder.push(new THREE.Vector3(c.x, b.max.y - 0.03, c.z));
    }
    for (const b of bbox(/^Vertebra L4$/)) {
      const c = b.getCenter(new THREE.Vector3());
      anchors.lowback.push(new THREE.Vector3(c.x, c.y, b.min.z - 0.06));
    }
    for (const b of bbox(/^Patella$/)) {
      const c = b.getCenter(new THREE.Vector3());
      anchors.knee.push(new THREE.Vector3(c.x, c.y, b.max.z + 0.02));
    }
    return { root, parts, anchors };
  }, [gltf]);
};

const _q = new THREE.Quaternion();

const Hotspot: React.FC<{ at: THREE.Vector3; on: boolean; onClick: () => void }> = ({ at, on, onClick }) => {
  const ring = useRef<THREE.Mesh>(null);
  useFrame(({ clock, camera }) => {
    const r = ring.current;
    if (!r || !r.parent) return;
    // Billboard: cancel the turntable rotation so the ring always faces the camera.
    r.parent.getWorldQuaternion(_q);
    r.quaternion.copy(_q.invert().multiply(camera.quaternion));
    const t = (clock.elapsedTime * 0.8) % 1;
    r.scale.setScalar(on ? 1 + t * 1.4 : 1);
    (r.material as THREE.MeshBasicMaterial).opacity = on ? 1 - t : 0.45;
  });
  return (
    <group position={at}>
      <mesh
        renderOrder={10}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <sphereGeometry args={[on ? 0.03 : 0.022, 20, 20]} />
        <meshBasicMaterial color={on ? C.signal : C.ink} depthTest={false} transparent />
      </mesh>
      <mesh ref={ring} renderOrder={9}>
        <ringGeometry args={[0.045, 0.052, 48]} />
        <meshBasicMaterial color={on ? C.signal : C.ink} depthTest={false} transparent side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const Body: React.FC<Props & { yaw: React.MutableRefObject<number>; setHover: (h: { latin: string; group: string | null; x: number; y: number } | null) => void; dragged: React.MutableRefObject<boolean> }> = ({
  level,
  onPick,
  hotspots,
  onHotspot,
  yaw,
  setHover,
  dragged,
}) => {
  const { root, parts, anchors } = useParts();
  const turn = useRef<THREE.Group>(null);
  const [hoverGroup, setHoverGroup] = useState<string | null>(null);

  useEffect(() => {
    for (const p of parts) {
      if (p.kind === "B") p.mesh.material = MAT.bone;
      else {
        const l = p.group ? level(p.group) : 0;
        p.mesh.material = l === 2 ? MAT.primary : l === 1 ? MAT.secondary : p.group && p.group === hoverGroup ? MAT.hover : MAT.muscle;
      }
    }
  }, [parts, level, hoverGroup]);

  useFrame(() => {
    if (!turn.current) return;
    turn.current.rotation.y += (yaw.current - turn.current.rotation.y) * 0.12;
  });

  const move = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const part = e.object.userData.part as Omit<Part, "mesh"> | undefined;
    if (!part || part.kind === "B") {
      setHover(null);
      setHoverGroup(null);
      return;
    }
    setHover({ latin: part.latin, group: part.group, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
    setHoverGroup(part.group);
  };

  return (
    <group ref={turn}>
      <primitive
        object={root}
        onPointerMove={move}
        onPointerOut={() => {
          setHover(null);
          setHoverGroup(null);
        }}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          if (dragged.current) return;
          const g = (e.object.userData.part as Omit<Part, "mesh"> | undefined)?.group;
          if (g) onPick?.(g);
        }}
      />
      {hotspots?.flatMap((h) =>
        anchors[h.key].map((at, i) => <Hotspot key={`${h.key}-${i}`} at={at} on={h.on} onClick={() => onHotspot?.(h.key)} />),
      )}
    </group>
  );
};

const VIEWS = [
  { zh: "正面", yaw: 0 },
  { zh: "側面", yaw: -Math.PI / 2 },
  { zh: "背面", yaw: Math.PI },
];

export default function Anatomy3D(props: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const yaw = useRef(0);
  const [view, setView] = useState(0);
  const [hover, setHover] = useState<{ latin: string; group: string | null; x: number; y: number } | null>(null);
  const [active, setActive] = useState(false);
  const drag = useRef<{ x: number; start: number } | null>(null);
  const dragged = useRef(false);

  // Only render frames while on screen.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const go = (i: number) => {
    setView(i);
    // Rotate the short way round from the current angle.
    const target = VIEWS[i].yaw;
    const cur = yaw.current;
    const delta = Math.atan2(Math.sin(target - cur), Math.cos(target - cur));
    yaw.current = cur + delta;
  };

  return (
    <div className="a3d">
      <div
        ref={wrap}
        className="a3d-canvas"
        aria-label={props.label}
        role="img"
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, start: yaw.current };
          dragged.current = false;
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const dx = e.clientX - drag.current.x;
          if (Math.abs(dx) > 4) dragged.current = true;
          yaw.current = drag.current.start + dx * 0.012;
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerLeave={() => (drag.current = null)}
      >
        <Canvas
          frameloop={active ? "always" : "demand"}
          dpr={[1, 2]}
          resize={{ offsetSize: true }}
          camera={{ fov: 23, position: [0, 0.02, 4.9], near: 0.1, far: 50 }}
          gl={{ antialias: true, alpha: true }}
        >
          <hemisphereLight args={["#fffaf0", "#8f806b", 0.9]} />
          <directionalLight position={[2.5, 3, 4]} intensity={2.2} />
          <directionalLight position={[-3, 1.5, -3]} intensity={1.1} color="#ffd9c2" />
          <Suspense fallback={null}>
            <Body {...props} yaw={yaw} setHover={setHover} dragged={dragged} />
          </Suspense>
        </Canvas>
        {hover && (
          <div className="a3d-tip" style={{ left: hover.x, top: hover.y }}>
            {hover.group && props.names?.[hover.group] && <b>{props.names[hover.group]}</b>}
            <span>{hover.latin}</span>
          </div>
        )}
      </div>
      <div className="a3d-bar">
        <div className="a3d-views" role="radiogroup" aria-label="視角">
          {VIEWS.map((v, i) => (
            <button key={v.zh} role="radio" aria-checked={i === view} className={i === view ? "on" : ""} onClick={() => go(i)}>
              {v.zh}
            </button>
          ))}
        </div>
        <span className="a3d-hint">拖曳旋轉</span>
      </div>
    </div>
  );
}
