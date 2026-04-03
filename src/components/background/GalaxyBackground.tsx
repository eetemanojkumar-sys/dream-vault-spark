import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const STAR_COUNT = 3000;
const SHOOTING_STAR_COUNT = 5;

function Stars() {
  const ref = useRef<THREE.Points>(null);

  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(STAR_COUNT * 3);
    const col = new Float32Array(STAR_COUNT * 3);
    const siz = new Float32Array(STAR_COUNT);

    for (let i = 0; i < STAR_COUNT; i++) {
      // Distribute in a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 8 + Math.random() * 12;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const c = Math.random();
      if (c < 0.25) {
        col[i * 3] = 0.7; col[i * 3 + 1] = 0.5; col[i * 3 + 2] = 1.0;
      } else if (c < 0.45) {
        col[i * 3] = 0.4; col[i * 3 + 1] = 0.7; col[i * 3 + 2] = 1.0;
      } else if (c < 0.6) {
        col[i * 3] = 1.0; col[i * 3 + 1] = 0.9; col[i * 3 + 2] = 0.6;
      } else {
        col[i * 3] = 0.95; col[i * 3 + 1] = 0.95; col[i * 3 + 2] = 1.0;
      }

      siz[i] = Math.random() * 2.5 + 0.3;
    }
    return [pos, col, siz];
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.008;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.005) * 0.1;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={0.035}
        sizeAttenuation
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function Nebula() {
  const ref = useRef<THREE.Points>(null);
  const count = 600;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Spiral arm distribution
      const arm = Math.floor(Math.random() * 3);
      const armAngle = (arm / 3) * Math.PI * 2;
      const dist = Math.random() * 6 + 1;
      const spread = 0.8;
      const angle = armAngle + dist * 0.3 + (Math.random() - 0.5) * spread;

      pos[i * 3] = Math.cos(angle) * dist + (Math.random() - 0.5) * 1.5;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 2;
      pos[i * 3 + 2] = Math.sin(angle) * dist + (Math.random() - 0.5) * 1.5;

      const palette = Math.random();
      if (palette < 0.35) {
        // Deep purple
        col[i * 3] = 0.4; col[i * 3 + 1] = 0.15; col[i * 3 + 2] = 0.7;
      } else if (palette < 0.6) {
        // Electric blue
        col[i * 3] = 0.15; col[i * 3 + 1] = 0.35; col[i * 3 + 2] = 0.85;
      } else if (palette < 0.8) {
        // Teal
        col[i * 3] = 0.1; col[i * 3 + 1] = 0.6; col[i * 3 + 2] = 0.65;
      } else {
        // Pink accent
        col[i * 3] = 0.7; col[i * 3 + 1] = 0.2; col[i * 3 + 2] = 0.5;
      }
    }
    return [pos, col];
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.015;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={0.12}
        sizeAttenuation
        transparent
        opacity={0.25}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function ShootingStars() {
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  const stars = useMemo(() => {
    return Array.from({ length: SHOOTING_STAR_COUNT }, () => ({
      delay: Math.random() * 20,
      speed: 0.8 + Math.random() * 1.2,
      x: (Math.random() - 0.5) * 16,
      y: 3 + Math.random() * 4,
      z: -5 - Math.random() * 5,
    }));
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    stars.forEach((star, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      const cycle = ((t - star.delay) * star.speed) % 12;
      if (cycle > 0 && cycle < 1.5) {
        mesh.visible = true;
        const progress = cycle / 1.5;
        mesh.position.set(
          star.x + progress * 6,
          star.y - progress * 4,
          star.z
        );
        mesh.scale.setScalar(1 - progress * 0.7);
        (mesh.material as THREE.MeshBasicMaterial).opacity = (1 - progress) * 0.8;
      } else {
        mesh.visible = false;
      }
    });
  });

  return (
    <>
      {stars.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          visible={false}
        >
          <sphereGeometry args={[0.02, 4, 4]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>
      ))}
    </>
  );
}

const GalaxyBackground = () => {
  return (
    <div className="fixed inset-0 z-0" style={{ pointerEvents: "none" }}>
      <Canvas
        camera={{ position: [0, 1.5, 8], fov: 55 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
        dpr={[1, 1.5]}
      >
        <Stars />
        <Nebula />
        <ShootingStars />
      </Canvas>
    </div>
  );
};

export default GalaxyBackground;
