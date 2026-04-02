import { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const STAR_COUNT = 2000;
const NEBULA_COUNT = 400;

function Stars() {
  const ref = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(STAR_COUNT * 3);
    const col = new Float32Array(STAR_COUNT * 3);
    const siz = new Float32Array(STAR_COUNT);

    for (let i = 0; i < STAR_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;

      const colorChoice = Math.random();
      if (colorChoice < 0.3) {
        col[i * 3] = 0.6; col[i * 3 + 1] = 0.4; col[i * 3 + 2] = 1.0;
      } else if (colorChoice < 0.5) {
        col[i * 3] = 0.4; col[i * 3 + 1] = 0.6; col[i * 3 + 2] = 1.0;
      } else if (colorChoice < 0.65) {
        col[i * 3] = 1.0; col[i * 3 + 1] = 0.85; col[i * 3 + 2] = 0.5;
      } else {
        col[i * 3] = 0.9; col[i * 3 + 1] = 0.9; col[i * 3 + 2] = 1.0;
      }

      siz[i] = Math.random() * 3 + 0.5;
    }
    return [pos, col, siz];
  }, []);

  const { size } = useThree();

  const handlePointerMove = useCallback((e: PointerEvent) => {
    mouseRef.current.x = (e.clientX / size.width - 0.5) * 2;
    mouseRef.current.y = -(e.clientY / size.height - 0.5) * 2;
  }, [size]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.02 + mouseRef.current.x * 0.3;
    ref.current.rotation.x = t * 0.01 + mouseRef.current.y * 0.3;
  });

  // Listen to pointer events on the canvas
  const { gl } = useThree();
  useMemo(() => {
    gl.domElement.addEventListener("pointermove", handlePointerMove);
    return () => gl.domElement.removeEventListener("pointermove", handlePointerMove);
  }, [gl, handlePointerMove]);

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={0.04}
        sizeAttenuation
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function NebulaParticles() {
  const ref = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(NEBULA_COUNT * 3);
    const col = new Float32Array(NEBULA_COUNT * 3);

    for (let i = 0; i < NEBULA_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 5 + 2;
      pos[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 3;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 3;

      const c = Math.random();
      if (c < 0.4) {
        col[i * 3] = 0.5; col[i * 3 + 1] = 0.2; col[i * 3 + 2] = 0.8;
      } else if (c < 0.7) {
        col[i * 3] = 0.2; col[i * 3 + 1] = 0.4; col[i * 3 + 2] = 0.9;
      } else {
        col[i * 3] = 0.3; col[i * 3 + 1] = 0.7; col[i * 3 + 2] = 0.6;
      }
    }
    return [pos, col];
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.03;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={0.08}
        sizeAttenuation
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

const GalaxyBackground = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-auto">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: false }}
        dpr={[1, 1.5]}
      >
        <Stars />
        <NebulaParticles />
        <ambientLight intensity={0.1} />
      </Canvas>
    </div>
  );
};

export default GalaxyBackground;
