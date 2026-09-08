import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';

interface ENSLogo3DProps {
  scale?: number;
  autoRotate?: boolean;
  floatAmplitude?: number;
  mouseX?: number;
  mouseY?: number;
  glowIntensity?: number;
}

// Gear tooth geometry helper
function createGearShape(outerR: number, innerR: number, teeth: number, toothDepth: number): THREE.Shape {
  const shape = new THREE.Shape();
  const toothAngle = (Math.PI * 2) / teeth;
  const halfTooth = toothAngle * 0.35;

  for (let i = 0; i < teeth; i++) {
    const angle = i * toothAngle;
    // Inner valley
    shape.moveTo(
      Math.cos(angle - halfTooth * 1.1) * innerR,
      Math.sin(angle - halfTooth * 1.1) * innerR
    );
    // Tooth bottom-left
    shape.lineTo(
      Math.cos(angle - halfTooth) * outerR,
      Math.sin(angle - halfTooth) * outerR
    );
    // Tooth top
    shape.lineTo(
      Math.cos(angle + halfTooth) * outerR,
      Math.sin(angle + halfTooth) * outerR
    );
    // Back to inner
    shape.lineTo(
      Math.cos(angle + halfTooth * 1.1) * innerR,
      Math.sin(angle + halfTooth * 1.1) * innerR
    );
  }
  shape.closePath();
  return shape;
}

// The gear ring component
function GearRing({ radius = 1.6, thickness = 0.12, depth = 0.15 }: {
  radius?: number;
  thickness?: number;
  depth?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.z += 0.003; // slow clockwise rotation
  });

  const gearGeometry = useMemo(() => {
    const outerR = radius;
    const innerR = radius - thickness;
    const shape = createGearShape(outerR, innerR, 24, 0.06);

    // Subtract the inner circle
    const hole = new THREE.Path();
    hole.absarc(0, 0, innerR - 0.04, 0, Math.PI * 2, true);
    shape.holes.push(hole);

    const extrudeSettings = {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.01,
      bevelSegments: 2,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [radius, thickness, depth]);

  return (
    <mesh ref={meshRef} geometry={gearGeometry} position={[0, 0, -depth / 2]}>
      <meshStandardMaterial
        color="#1A3A6B"
        metalness={0.9}
        roughness={0.2}
        emissive="#0A2550"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

// The orbit ring (gold ellipse)
function OrbitRing() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.z = state.clock.elapsedTime * 0.4;
  });

  return (
    <mesh ref={meshRef} rotation={[Math.PI / 3, 0, 0]}>
      <torusGeometry args={[1.7, 0.025, 8, 80]} />
      <meshStandardMaterial
        color="#FFD700"
        metalness={0.95}
        roughness={0.1}
        emissive="#FFD700"
        emissiveIntensity={0.4}
      />
    </mesh>
  );
}

// The rising arrow element
function RisingArrow() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = 0.05 + Math.sin(state.clock.elapsedTime * 1.2) * 0.04;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
  });

  const arrowShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0.06, -0.08);
    shape.lineTo(0.03, -0.08);
    shape.lineTo(0.03, -0.35);
    shape.lineTo(-0.03, -0.35);
    shape.lineTo(-0.03, -0.08);
    shape.lineTo(-0.06, -0.08);
    shape.closePath();

    const extrudeSettings = { depth: 0.04, bevelEnabled: false };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  return (
    <group ref={groupRef} position={[0.85, 0.6, 0.1]} rotation={[0, 0, Math.PI / 6]}>
      <mesh geometry={arrowShape}>
        <meshStandardMaterial
          color="#4FC3F7"
          metalness={0.8}
          roughness={0.2}
          emissive="#0A84FF"
          emissiveIntensity={0.6}
        />
      </mesh>
    </group>
  );
}

// Logo face with the actual texture
function LogoFace({ texture }: { texture: THREE.Texture }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    // Subtle pulse scale
    const s = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.008;
    meshRef.current.scale.setScalar(s);
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
      {/* Slightly extruded disc with logo texture */}
      <cylinderGeometry args={[1.38, 1.38, 0.12, 64]} />
      <meshStandardMaterial
        map={texture}
        metalness={0.3}
        roughness={0.5}
        transparent
      />
    </mesh>
  );
}

// Glowing halo behind the logo
function GlowHalo() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity =
      0.12 + Math.sin(state.clock.elapsedTime * 0.6) * 0.05;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -0.2]}>
      <circleGeometry args={[1.7, 64]} />
      <meshBasicMaterial
        color="#0A84FF"
        transparent
        opacity={0.15}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Outer blue glow disc
function OuterGlow() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity =
      0.06 + Math.sin(state.clock.elapsedTime * 0.4) * 0.03;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -0.3]}>
      <circleGeometry args={[2.2, 64]} />
      <meshBasicMaterial
        color="#0A84FF"
        transparent
        opacity={0.08}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Small floating particles around the logo
function LogoParticles() {
  const meshRef = useRef<THREE.Points>(null);
  const count = 60;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 1.5 + Math.random() * 0.8;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = Math.sin(angle) * r;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
      // Blue / gold mix
      const isGold = Math.random() < 0.2;
      col[i * 3] = isGold ? 1.0 : 0.04;
      col[i * 3 + 1] = isGold ? 0.84 : 0.52;
      col[i * 3 + 2] = isGold ? 0.0 : 1.0;
    }
    return [pos, col];
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.z += 0.002;
    meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

export default function ENSLogo3D({
  scale = 1,
  autoRotate = true,
  floatAmplitude = 0.12,
  mouseX = 0,
  mouseY = 0,
  glowIntensity = 1,
}: ENSLogo3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);

  // Load the ENS logo texture
  const texture = useLoader(TextureLoader, '/ens-logo.jpg');

  useEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.center.set(0.5, 0.5);
      texture.repeat.set(1, 1);
    }
  }, [texture]);

  useFrame((state) => {
    if (!groupRef.current || !innerRef.current) return;

    // Float up and down
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * floatAmplitude;

    // Mouse parallax tilt
    innerRef.current.rotation.y += (mouseX * 0.4 - innerRef.current.rotation.y) * 0.06;
    innerRef.current.rotation.x += (-mouseY * 0.3 - innerRef.current.rotation.x) * 0.06;

    // Slow self-rotation if autoRotate
    if (autoRotate) {
      groupRef.current.rotation.y += 0.004;
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      {/* Outer glow discs */}
      <OuterGlow />
      <GlowHalo />

      {/* Inner rotating group (responds to mouse) */}
      <group ref={innerRef}>
        {/* Logo face with texture */}
        <LogoFace texture={texture} />

        {/* Gear ring around the logo */}
        <GearRing radius={1.58} thickness={0.18} depth={0.14} />

        {/* Gold orbit ellipse */}
        <OrbitRing />

        {/* Rising arrow element */}
        <RisingArrow />
      </group>

      {/* Floating particles */}
      <LogoParticles />

      {/* Point lights for dramatic lighting */}
      <pointLight position={[2, 2, 2]} intensity={glowIntensity * 1.5} color="#0A84FF" />
      <pointLight position={[-2, -1, 1]} intensity={glowIntensity * 0.8} color="#3BA0FF" />
      <pointLight position={[0, 0, 3]} intensity={glowIntensity * 0.5} color="#FFD700" />
    </group>
  );
}
