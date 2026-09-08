import { useState, useEffect } from 'react';

type PerformanceTier = 'high' | 'medium' | 'low';

export function usePerformance(): PerformanceTier {
  const [tier, setTier] = useState<PerformanceTier>('high');

  useEffect(() => {
    // Check reduced motion preference
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setTier('low');
      return;
    }

    // Check for mobile
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setTier('medium');
      return;
    }

    // Basic GPU benchmark via canvas
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
      if (!gl) {
        setTier('low');
        return;
      }
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string;
        if (renderer.toLowerCase().includes('intel') || renderer.toLowerCase().includes('swiftshader')) {
          setTier('medium');
          return;
        }
      }
      setTier('high');
    } catch {
      setTier('medium');
    }
  }, []);

  return tier;
}
