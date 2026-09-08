import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SecurityCore3DProps {
  mouseX?: number;
  mouseY?: number;
  isSignup?: boolean;
  authState?: string;
}

export default function SecurityCore3D({
  mouseX = 0,
  mouseY = 0,
  isSignup = false,
  authState = 'idle',
}: SecurityCore3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const floatRef = useRef<THREE.Group>(null);
  const outerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (groupRef.current) {
      // Mouse parallax
      groupRef.current.rotation.y += (mouseX * 0.3 - groupRef.current.rotation.y) * 0.05;
      groupRef.current.rotation.x += (-mouseY * 0.2 - groupRef.current.rotation.x) * 0.05;
    }

    if (floatRef.current) {
      // Gentle floating
      floatRef.current.position.y = Math.sin(t * 0.5) * 0.25;
      // Slow base rotation
      floatRef.current.rotation.y = t * 0.06;
    }

    if (outerRef.current) {
      // Pulse emissive intensity
      const intensity = authState === 'authenticating'
        ? 0.6 + Math.sin(t * 4) * 0.4
        : 0.3 + Math.sin(t * 0.8) * 0.1;
      (outerRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
    }
  });

  const primaryColor = isSignup ? '#00F5D4' : '#00C6FF';
  const emissiveColor = authState === 'error' ? '#FF1744' : primaryColor;

  return (
    <group ref={groupRef} position={[-2.5, 0, 0]}>
      <group ref={floatRef}>
        {/* Outer shield shell — icosahedron */}
        <mesh ref={outerRef}>
          <icosahedronGeometry args={[1.6, 1]} />
          <meshStandardMaterial
            color="#0a1628"
            emissive={emissiveColor}
            emissiveIntensity={0.3}
            transparent
            opacity={0.35}
            wireframe={false}
            side={THREE.FrontSide}
          />
        </mesh>

        {/* Wireframe overlay */}
        <mesh>
          <icosahedronGeometry args={[1.62, 1]} />
          <meshStandardMaterial
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={0.5}
            transparent
            opacity={0.15}
            wireframe
          />
        </mesh>

        {/* Mid holographic sphere */}
        <mesh>
          <sphereGeometry args={[1.0, 32, 32]} />
          <meshStandardMaterial
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={0.2}
            transparent
            opacity={0.08}
          />
        </mesh>
      </group>
    </group>
  );
}
