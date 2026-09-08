import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Torus, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface SecurityRingsProps {
  isSignup?: boolean;
  authState?: string;
}

export default function SecurityRings({ isSignup = false, authState = 'idle' }: SecurityRingsProps) {
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const ring3 = useRef<THREE.Mesh>(null);
  const ring4 = useRef<THREE.Mesh>(null);

  const coreColor = isSignup ? '#00F5D4' : '#00C6FF';
  const ringColor = authState === 'authenticating' ? '#FFD600' : authState === 'error' ? '#FF1744' : coreColor;
  const pulseSpeed = authState === 'authenticating' ? 3.0 : 0.8;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ring1.current) ring1.current.rotation.z = t * 0.3;
    if (ring2.current) {
      ring2.current.rotation.x = t * 0.2;
      ring2.current.rotation.y = t * 0.15;
    }
    if (ring3.current) {
      ring3.current.rotation.y = -t * 0.25;
      ring3.current.rotation.z = t * 0.1;
    }
    if (ring4.current) ring4.current.rotation.x = -t * 0.18;

    // Pulse scale on authenticating
    const scale = 1 + Math.sin(t * pulseSpeed) * 0.04;
    if (ring1.current) ring1.current.scale.setScalar(scale);
  });

  return (
    <group>
      {/* Outer ring */}
      <Torus ref={ring1} args={[2.2, 0.015, 8, 80]}>
        <meshStandardMaterial color={ringColor} emissive={ringColor} emissiveIntensity={0.8} transparent opacity={0.6} />
      </Torus>

      {/* Tilted ring */}
      <Torus ref={ring2} args={[1.8, 0.012, 8, 64]} rotation={[Math.PI / 3, 0, 0]}>
        <meshStandardMaterial color={ringColor} emissive={ringColor} emissiveIntensity={0.6} transparent opacity={0.5} />
      </Torus>

      {/* Inner ring */}
      <Torus ref={ring3} args={[1.4, 0.01, 8, 64]} rotation={[0, Math.PI / 4, Math.PI / 6]}>
        <meshStandardMaterial color={ringColor} emissive={ringColor} emissiveIntensity={0.5} transparent opacity={0.4} />
      </Torus>

      {/* Tiny detail ring */}
      <Torus ref={ring4} args={[2.6, 0.008, 6, 80]} rotation={[Math.PI / 5, Math.PI / 3, 0]}>
        <meshStandardMaterial color={ringColor} emissive={ringColor} emissiveIntensity={0.4} transparent opacity={0.25} />
      </Torus>

      {/* Energy core */}
      <Sphere args={[0.45, 32, 32]}>
        <meshStandardMaterial
          color={coreColor}
          emissive={coreColor}
          emissiveIntensity={1.2}
          transparent
          opacity={0.9}
        />
      </Sphere>

      {/* Point light from core */}
      <pointLight color={coreColor} intensity={2} distance={8} />
    </group>
  );
}
