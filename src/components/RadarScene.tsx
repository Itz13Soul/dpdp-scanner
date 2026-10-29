"use client";

import { useRef, useSyncExternalStore } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group } from "three";

function subscribe(cb: () => void) {
  const q = window.matchMedia("(prefers-reduced-motion: reduce)");
  q.addEventListener("change", cb);
  return () => q.removeEventListener("change", cb);
}

function useStill() {
  return useSyncExternalStore(subscribe, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, () => true);
}

export type Node = { category: string };

const COLOR: Record<string, string> = {
  advertising: "#f87171",
  "session-replay": "#fb923c",
  analytics: "#fbbf24",
  social: "#f472b6",
  "tag-manager": "#fcd34d",
  "consent-platform": "#60a5fa",
  other: "#94a3b8",
};

function Orbit({ nodes, still }: { nodes: Node[]; still: boolean }) {
  const g = useRef<Group>(null);
  useFrame((_, dt) => {
    if (g.current && !still) g.current.rotation.y += dt * 0.25;
  });
  return (
    <group rotation={[0.45, 0, 0.1]}>
      <mesh>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial color="#2dd4bf" emissive="#2dd4bf" emissiveIntensity={0.35} wireframe />
      </mesh>
      <group ref={g}>
        {nodes.map((n, i) => {
          const ring = 1.8 + (i % 3) * 0.55;
          const a = (i / Math.max(nodes.length, 1)) * Math.PI * 2 + (i % 3);
          const c = COLOR[n.category] ?? COLOR.other;
          return (
            <mesh key={i} position={[Math.cos(a) * ring, ((i % 5) - 2) * 0.18, Math.sin(a) * ring]}>
              <sphereGeometry args={[0.13, 16, 16]} />
              <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.5} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

export default function RadarScene({ nodes }: { nodes: Node[] }) {
  const still = useStill();
  return (
    <Canvas camera={{ position: [0, 1.4, 6.2], fov: 40 }} frameloop={still ? "demand" : "always"} dpr={[1, 1.75]}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 5, 4]} intensity={1.3} />
      <Orbit nodes={nodes} still={still} />
    </Canvas>
  );
}
