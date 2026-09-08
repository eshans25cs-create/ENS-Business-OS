import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
  count?: number;
  mouseX?: number;
  mouseY?: number;
}

export default function ParticleField({ count = 1500, mouseX = 0, mouseY = 0 }: ParticleFieldProps) {
  const ref = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

      // Color: mix of cyan and blue
      const t = Math.random();
      colors[i * 3] = t * 0.0 + (1 - t) * 0.0;
      colors[i * 3 + 1] = t * 0.78 + (1 - t) * 0.39;
      colors[i * 3 + 2] = t * 1.0 + (1 - t) * 1.0;
    }
    return [positions, colors];
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.y = t * 0.008 + mouseX * 0.05;
    ref.current.rotation.x = mouseY * 0.03;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
