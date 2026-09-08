import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Torus } from '@react-three/drei';
import * as THREE from 'three';

interface QRCubeProps {
  amount?: number;
}

export default function QRCube({ amount = 750 }: QRCubeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.18;
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.25;
    }
    if (ring1.current) ring1.current.rotation.z = t * 0.4;
    if (ring2.current) {
      ring2.current.rotation.x = t * 0.3;
      ring2.current.rotation.z = -t * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer holographic rings */}
      <Torus ref={ring1} args={[2.2, 0.02, 8, 80]}>
        <meshStandardMaterial color="#00C6FF" emissive="#00C6FF" emissiveIntensity={0.8} transparent opacity={0.5} />
      </Torus>
      <Torus ref={ring2} args={[1.8, 0.015, 8, 64]} rotation={[Math.PI / 3, 0, 0]}>
        <meshStandardMaterial color="#00F5D4" emissive="#00F5D4" emissiveIntensity={0.7} transparent opacity={0.4} />
      </Torus>

      {/* Main QR cube */}
      <group ref={innerRef}>
        {/* Cube body */}
        <Box args={[2, 2, 0.15]}>
          <meshStandardMaterial
            color="#08111F"
            emissive="#00C6FF"
            emissiveIntensity={0.05}
            transparent
            opacity={0.92}
          />
        </Box>

        {/* QR grid pattern — small cubes */}
        {generateQRPattern().map(([x, y], i) => (
          <Box key={i} args={[0.15, 0.15, 0.05]} position={[x * 0.22 - 0.77, y * 0.22 - 0.77, 0.1]}>
            <meshStandardMaterial color="#00F5D4" emissive="#00F5D4" emissiveIntensity={0.6} />
          </Box>
        ))}

        {/* Corner markers */}
        {[[-1, 1], [1, 1], [-1, -1]].map(([cx, cy], i) => (
          <Box key={`corner-${i}`} args={[0.5, 0.5, 0.06]} position={[cx * 0.65, cy * 0.65, 0.1]}>
            <meshStandardMaterial color="#00C6FF" emissive="#00C6FF" emissiveIntensity={0.9} transparent opacity={0.8} />
          </Box>
        ))}

        {/* Cube edge glow */}
        <Box args={[2.02, 2.02, 0.12]}>
          <meshStandardMaterial color="#00C6FF" emissive="#00C6FF" emissiveIntensity={0.3} transparent opacity={0.12} wireframe />
        </Box>
      </group>

      {/* Point light from the cube */}
      <pointLight color="#00C6FF" intensity={1.5} distance={8} />
    </group>
  );
}

/** Generate a pseudo-random QR-like pattern of [col, row] positions */
function generateQRPattern(): [number, number][] {
  const pattern: [number, number][] = [];
  const seed = [
    [0,0],[0,2],[0,4],[0,6],[1,1],[1,3],[2,0],[2,4],[2,5],
    [3,2],[3,6],[4,1],[4,3],[5,0],[5,2],[5,4],[6,1],[6,5],[6,6],
    [1,5],[2,2],[3,3],[3,4],[4,4],[4,6],[5,5],[5,6],[6,3],
  ];
  return seed as [number, number][];
}
