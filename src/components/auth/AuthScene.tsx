import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import ENSLogo3D from '../../three/ENSLogo3D';

// Background particle field
function ParticleField({ count = 120 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 24;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 4;
      const isGold = Math.random() < 0.12;
      col[i * 3] = isGold ? 1.0 : 0.04;
      col[i * 3 + 1] = isGold ? 0.84 : 0.52;
      col[i * 3 + 2] = isGold ? 0.0 : 1.0;
    }
    return [pos, col];
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = state.clock.elapsedTime * 0.02;
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.015) * 0.04;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} vertexColors transparent opacity={0.65} sizeAttenuation />
    </points>
  );
}

// Concentric animated rings in the background
function BackgroundRings() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.z = state.clock.elapsedTime * 0.05;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.07) * 0.1;
  });

  return (
    <group ref={group} position={[0, 0, -3]}>
      {[3.5, 5.0, 6.8].map((r, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r, 0.015, 8, 120]} />
          <meshBasicMaterial
            color="#0A84FF"
            transparent
            opacity={0.06 - i * 0.015}
          />
        </mesh>
      ))}
    </group>
  );
}

// Scene root — connects mouse parallax to the logo
function SceneContent({ mouseX = 0, mouseY = 0, performanceTier = 'high' }: {
  mouseX: number;
  mouseY: number;
  performanceTier: string;
}) {
  return (
    <>
      <BackgroundRings />
      <ParticleField count={performanceTier === 'high' ? 120 : 60} />

      {/* 3D ENS logo with real texture */}
      <Suspense fallback={null}>
        <ENSLogo3D
          scale={1}
          autoRotate={false}
          floatAmplitude={0.1}
          mouseX={mouseX}
          mouseY={mouseY}
          glowIntensity={1.2}
        />
      </Suspense>
    </>
  );
}

interface AuthSceneProps {
  mouseX?: number;
  mouseY?: number;
  performanceTier?: 'high' | 'medium' | 'low';
}

export default function AuthScene({ mouseX = 0, mouseY = 0, performanceTier = 'high' }: AuthSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 55 }}
      dpr={performanceTier === 'high' ? [1, 2] : [1, 1]}
      gl={{ antialias: performanceTier === 'high', alpha: true }}
      style={{ background: 'transparent' }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 5]} intensity={1.0} color="#FFFFFF" />
      <pointLight position={[-4, -3, 2]} intensity={0.6} color="#3BA0FF" />

      {/* Background stars */}
      <Stars
        radius={30}
        depth={12}
        count={performanceTier === 'high' ? 600 : 250}
        factor={2}
        saturation={0.2}
        fade
        speed={0.4}
      />

      <SceneContent mouseX={mouseX} mouseY={mouseY} performanceTier={performanceTier} />

      {/* Subtle depth fog */}
      <fog attach="fog" args={['#030B1A', 12, 30]} />
    </Canvas>
  );
}
