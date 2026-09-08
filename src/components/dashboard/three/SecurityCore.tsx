import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Torus } from '@react-three/drei';
import * as THREE from 'three';

interface SecurityCoreProps {
  status?: 'safe' | 'verify' | 'suspicious' | 'high';
}

const STATUS_COLORS = {
  safe: '#00F5D4',
  verify: '#FFD600',
  suspicious: '#FF6D00',
  high: '#FF1744',
};

export default function SecurityCore({ status = 'safe' }: SecurityCoreProps) {
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const ring3 = useRef<THREE.Mesh>(null);

  const color = STATUS_COLORS[status];
  const pulseSpeed = status === 'safe' ? 0.6 : status === 'verify' ? 1.2 : 2.0;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.4) * 0.2;
      groupRef.current.rotation.y = t * 0.05;
    }
    if (ring1.current) ring1.current.rotation.z = t * 0.25;
    if (ring2.current) {
      ring2.current.rotation.x = t * 0.2;
      ring2.current.rotation.y = t * 0.15;
    }
    if (ring3.current) ring3.current.rotation.y = -t * 0.18;
    if (innerRef.current) {
      const scale = 1 + Math.sin(t * pulseSpeed) * 0.05;
      innerRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer shell */}
      <mesh>
        <icosahedronGeometry args={[1.8, 1]} />
        <meshStandardMaterial color="#050e1e" emissive={color} emissiveIntensity={0.15} transparent opacity={0.3} wireframe={false} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[1.82, 1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} transparent opacity={0.12} wireframe />
      </mesh>

      {/* Rings */}
      <Torus ref={ring1} args={[2.4, 0.018, 8, 80]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} transparent opacity={0.6} />
      </Torus>
      <Torus ref={ring2} args={[2.0, 0.014, 8, 64]} rotation={[Math.PI / 3, 0, 0]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} transparent opacity={0.5} />
      </Torus>
      <Torus ref={ring3} args={[1.5, 0.01, 8, 64]} rotation={[0, Math.PI / 4, Math.PI / 6]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.4} />
      </Torus>

      {/* Inner core */}
      <group ref={innerRef}>
        <Sphere args={[0.6, 32, 32]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} transparent opacity={0.95} />
        </Sphere>
        <pointLight color={color} intensity={3} distance={12} />
      </group>

      {/* Mid sphere */}
      <Sphere args={[1.1, 32, 32]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.1} transparent opacity={0.06} />
      </Sphere>
    </group>
  );
}
