import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function DataGrid() {
  const ref = useRef<THREE.Group>(null);

  const lines = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const gridSize = 20;
    const spacing = 3;

    // Horizontal lines
    for (let z = 0; z <= gridSize; z++) {
      vertices.push(-gridSize * spacing * 0.5, -8, z * spacing - 10);
      vertices.push(gridSize * spacing * 0.5, -8, z * spacing - 10);
    }
    // Vertical lines
    for (let x = 0; x <= gridSize; x++) {
      vertices.push(x * spacing - gridSize * spacing * 0.5, -8, -10);
      vertices.push(x * spacing - gridSize * spacing * 0.5, -8, gridSize * spacing - 10);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geometry;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.position.z = (t * 0.4) % 3;
  });

  return (
    <group ref={ref}>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color="#00C6FF" transparent opacity={0.07} />
      </lineSegments>
    </group>
  );
}
