import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Preload } from '@react-three/drei';
import SecurityCore from './SecurityCore';
import DataParticles from './DataParticles';

interface DashboardSceneProps {
  status?: 'safe' | 'verify' | 'suspicious' | 'high';
  performanceTier?: 'high' | 'medium' | 'low';
}

export default function DashboardScene({ status = 'safe', performanceTier = 'high' }: DashboardSceneProps) {
  const particleCount = performanceTier === 'high' ? 800 : performanceTier === 'medium' ? 300 : 100;

  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 55 }} gl={{ antialias: performanceTier !== 'low', alpha: true }}>
      <ambientLight intensity={0.2} color="#050e1e" />
      <directionalLight position={[5, 5, 5]} intensity={0.4} color="#00C6FF" />
      <Suspense fallback={null}>
        <SecurityCore status={status} />
        <DataParticles count={particleCount} />
        <Environment preset="night" />
        <Preload all />
      </Suspense>
    </Canvas>
  );
}
