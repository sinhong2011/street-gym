import { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { EXERCISES, HERO_SEQUENCE } from "../pose/exercises";
import { BONES, sampleTrack, solve, type Joints, type Vec } from "../pose/skeleton";
import { C, FONT } from "../theme";

const U = 0.1; // skeleton units -> world units
const FLOOR_Y = -11.6;
const BAR_HALF = 9;

/** Normalised hero progress -> which move is playing and the joints for it. */
const heroAt = (p: number) => {
  const x = ((p % 1) + 1) % 1;
  let acc = 0;
  for (let i = 0; i < HERO_SEQUENCE.length; i++) {
    const seg = HERO_SEQUENCE[i];
    if (x < acc + seg.weight || i === HERO_SEQUENCE.length - 1) {
      const local = Math.min((x - acc) / seg.weight, 0.9999);
      const ex = EXERCISES[seg.id];
      const { pose, label } = sampleTrack(ex.keys, local);
      return { ex, index: i, local, label, j: solve(pose, ex.constraint) };
    }
    acc += seg.weight;
  }
  throw new Error("unreachable");
};

const v3 = ([x, y]: Vec, z: number) => new THREE.Vector3(x * U, -y * U, z);
const UP = new THREE.Vector3(0, 1, 0);

const Bone: React.FC<{ a: THREE.Vector3; b: THREE.Vector3; r: number; mat: THREE.Material }> = ({ a, b, r, mat }) => {
  const d = new THREE.Vector3().subVectors(b, a);
  const len = d.length();
  const q = new THREE.Quaternion().setFromUnitVectors(UP, d.clone().normalize());
  const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
  return (
    <mesh position={mid} quaternion={q} castShadow material={mat}>
      <capsuleGeometry args={[r, Math.max(len, 0.001), 6, 14]} />
    </mesh>
  );
};

const Body: React.FC<{ j: Joints; mat: THREE.Material; accent?: THREE.Material }> = ({ j, mat, accent }) => {
  const zs = 0.62; // half shoulder width
  const zh = 0.42; // half hip width
  const sN = v3(j.neck, zs), sF = v3(j.neck, -zs);
  const hN = v3(j.hip, zh), hF = v3(j.hip, -zh);
  return (
    <group>
      {/* torso as a tapered pair + shoulder/hip girdles */}
      <Bone a={v3(j.hip, 0)} b={v3(j.neck, 0)} r={0.62} mat={mat} />
      <Bone a={sN} b={sF} r={0.3} mat={mat} />
      <Bone a={hN} b={hF} r={0.34} mat={mat} />
      <mesh position={v3(j.head, 0)} castShadow material={mat}>
        <sphereGeometry args={[BONES.headR * U, 24, 24]} />
      </mesh>
      <Bone a={v3(j.neck, 0)} b={v3(j.head, 0)} r={0.18} mat={mat} />
      {/* arms */}
      <Bone a={sN} b={v3(j.elbow, zs)} r={0.24} mat={mat} />
      <Bone a={v3(j.elbow, zs)} b={v3(j.hand, zs * 0.9)} r={0.2} mat={mat} />
      <Bone a={sF} b={v3(j.elbowFar, -zs)} r={0.24} mat={mat} />
      <Bone a={v3(j.elbowFar, -zs)} b={v3(j.handFar, -zs * 0.9)} r={0.2} mat={mat} />
      {/* legs */}
      <Bone a={hN} b={v3(j.knee, zh)} r={0.32} mat={mat} />
      <Bone a={v3(j.knee, zh)} b={v3(j.foot, zh)} r={0.25} mat={mat} />
      <Bone a={hF} b={v3(j.kneeFar, -zh)} r={0.32} mat={mat} />
      <Bone a={v3(j.kneeFar, -zh)} b={v3(j.footFar, -zh)} r={0.25} mat={mat} />
      {accent &&
        [v3(j.elbow, zs), v3(j.knee, zh), v3(j.elbowFar, -zs), v3(j.kneeFar, -zh)].map((p, i) => (
          <mesh key={i} position={p} material={accent}>
            <sphereGeometry args={[0.27, 16, 16]} />
          </mesh>
        ))}
    </group>
  );
};

const Rig: React.FC = () => {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: C.ink, roughness: 0.92, metalness: 0.05 }), []);
  const steel = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2b2723", roughness: 0.35, metalness: 0.8 }), []);
  const h = BAR_HALF;
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow material={steel}>
        <cylinderGeometry args={[0.19, 0.19, h * 2 + 0.6, 24]} />
      </mesh>
      {[-h, h].map((z) => (
        <mesh key={z} position={[0, FLOOR_Y / 2 + 0.15, z]} castShadow material={mat}>
          <cylinderGeometry args={[0.3, 0.3, -FLOOR_Y + 0.3, 20]} />
        </mesh>
      ))}
    </group>
  );
};

const Chalk: React.FC<{ frame: number }> = ({ frame }) => {
  const geo = useMemo(() => new THREE.BufferGeometry(), []);
  const N = 140;
  const positions = useMemo(() => new Float32Array(N * 3), []);
  for (let i = 0; i < N; i++) {
    const sx = random(`x${i}`) * 26 - 13;
    const sy = random(`y${i}`) * 18 + FLOOR_Y;
    const sz = random(`z${i}`) * 16 - 8;
    const speed = 0.006 + random(`s${i}`) * 0.012;
    positions[i * 3] = sx + Math.sin(frame * 0.02 + i) * 0.4;
    positions[i * 3 + 1] = FLOOR_Y + ((sy - FLOOR_Y + frame * speed) % 18);
    positions[i * 3 + 2] = sz;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(positions.slice(), 3));
  return (
    <points geometry={geo}>
      <pointsMaterial color={C.paper} size={0.07} transparent opacity={0.85} sizeAttenuation />
    </points>
  );
};

const CameraRig: React.FC<{ frame: number; total: number }> = ({ frame, total }) => {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    const t = (frame / total) * Math.PI * 2;
    const yaw = 0.6 + Math.sin(t) * 0.3; // three-quarter view that drifts, never blocked by a post
    const r = 38;
    camera.position.set(Math.sin(yaw) * r, -6.5 + Math.sin(t * 2) * 1.5, Math.cos(yaw) * r);
    camera.lookAt(0, -3.2, 0);
    camera.updateProjectionMatrix();
  }, [camera, frame, total]);
  return null;
};

export const HeroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const p = frame / durationInFrames;
  const now = heroAt(p);

  const ink = useMemo(() => new THREE.MeshStandardMaterial({ color: C.ink, roughness: 0.75, metalness: 0.1 }), []);
  const accent = useMemo(() => new THREE.MeshStandardMaterial({ color: C.signal, roughness: 0.5, emissive: C.signal, emissiveIntensity: 0.25 }), []);
  const ghostMats = useMemo(
    () => [0.14, 0.09, 0.05, 0.025].map((o) => new THREE.MeshBasicMaterial({ color: C.signal, transparent: true, opacity: o, depthWrite: false })),
    [],
  );
  const echoes = ghostMats.map((m, i) => ({ m, j: heroAt(p - (i + 1) * 0.006).j }));

  // Title card per move: slides in at each segment start.
  const segStart = HERO_SEQUENCE.slice(0, now.index).reduce((a, s) => a + s.weight, 0);
  const segFrames = HERO_SEQUENCE[now.index].weight * durationInFrames;
  const local = frame - segStart * durationInFrames;
  const cardIn = interpolate(local, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cardOut = interpolate(local, [segFrames - 14, segFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const card = Math.min(cardIn, cardOut);

  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 80% at 50% 30%, ${C.paper} 0%, ${C.paperDeep} 70%, #cfc5b3 100%)` }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ fov: 34, near: 0.1, far: 200 }} gl={{ antialias: true }}>
        <CameraRig frame={frame} total={durationInFrames} />
        <fog attach="fog" args={[C.paperDeep, 50, 110]} />
        <hemisphereLight args={[C.paper, "#8a7c66", 1.1]} />
        <directionalLight
          position={[9, 14, 10]}
          intensity={2.4}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-16}
          shadow-camera-right={16}
          shadow-camera-top={16}
          shadow-camera-bottom={-16}
        />
        <pointLight position={[-8, -2, -6]} intensity={60} color={C.signal} distance={30} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, 0]} receiveShadow>
          <planeGeometry args={[120, 120]} />
          <meshStandardMaterial color={C.paperDeep} roughness={1} />
        </mesh>
        {/* chalk-line court marks */}
        {[-4, 4].map((x) => (
          <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, FLOOR_Y + 0.01, 0]}>
            <planeGeometry args={[0.06, 30]} />
            <meshBasicMaterial color={C.signal} />
          </mesh>
        ))}

        <Rig />
        {echoes.map((e, i) => (
          <Body key={i} j={e.j} mat={e.m} />
        ))}
        <Body j={now.j} mat={ink} accent={accent} />
        <Chalk frame={frame} />
      </ThreeCanvas>

      {/* Motion-graphic HUD, part of the rendered video */}
      <div style={{ position: "absolute", left: 56, top: 56, right: 56, display: "flex", justifyContent: "space-between", fontFamily: FONT.display, color: C.ink }}>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: 5 }}>SEQ.{String(now.index + 1).padStart(2, "0")}/03</div>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: 3, fontVariantNumeric: "tabular-nums", color: C.inkSoft }}>
          {String(frame).padStart(4, "0")}F
        </div>
      </div>
      <div style={{ position: "absolute", left: 56, right: 56, bottom: 64, color: C.ink, opacity: card, transform: `translateY(${(1 - card) * 30}px)` }}>
        <div style={{ fontFamily: FONT.display, fontSize: 30, fontWeight: 800, letterSpacing: 6, color: C.signal }}>{now.ex.en.toUpperCase()}</div>
        <div style={{ fontFamily: FONT.serif, fontSize: 112, fontWeight: 900, lineHeight: 1 }}>{now.ex.zh}</div>
        <div style={{ fontFamily: FONT.sans, fontSize: 30, fontWeight: 600, marginTop: 18, minHeight: 40 }}>{now.label}</div>
      </div>
    </AbsoluteFill>
  );
};
