import { useState, useEffect } from 'react';
import { useSpring } from '@react-spring/three';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import Character from './Character.tsx';
import Rope from './Rope.tsx';
import FoldingCard from './FoldingCard.tsx';

export type AuthState = 'loading' | 'switching' | 'intro' | 'climbing' | 'summit' | 'reach' | 'grab' | 'pull' | 'open' | 'success';
export type FormMode = 'login' | 'signup';

// Dynamic cinematic camera
function CameraRig({ authState }: { authState: AuthState }) {
  useFrame((state) => {
    // Zoom in during the Hero shot, but pull BACK OUT during 'open' so the UI is clearly usable
    const isHero = authState === 'reach' || authState === 'grab' || authState === 'pull';
    const targetZ = isHero ? 7.5 : 9;
    const targetY = isHero ? 1.0 : 0;
    
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.05);
    state.camera.lookAt(0, isHero ? 1.0 : 0, 0); // Keep focused cleanly
  });
  return null;
}

export default function SceneController() {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [mode, setMode] = useState<FormMode>('login');
  
  // Shared scalar for 100% visual lock between Character IK and Rope Spline
  const { pullProgress } = useSpring({
    pullProgress: authState === 'pull' || authState === 'open' ? 1 : 0,
    config: { mass: 3, tension: 40, friction: 14 } // Heavy, physical heave
  });

  // Cinematic Timeline
  const runSequence = async () => {
    // 1. Scene Object Settles
    setAuthState('intro'); 
    await new Promise(r => setTimeout(r, 800));
    
    // 2. Climb Sequence (3 seconds)
    setAuthState('climbing');
    await new Promise(r => setTimeout(r, 3000)); 
    
    // 3. Summit (Walks to center)
    setAuthState('summit');
    await new Promise(r => setTimeout(r, 1000)); 
    
    // 4. Reach for rope
    setAuthState('reach');
    await new Promise(r => setTimeout(r, 600)); 

    // 5. Establish grip, rope tauts
    setAuthState('grab');
    await new Promise(r => setTimeout(r, 400)); 
    
    // 6. Hero Pull (triggers mathematical locking, 2 seconds)
    setAuthState('pull');
    await new Promise(r => setTimeout(r, 2000)); 
    
    // 7. Complete unfold and release
    setAuthState('open');
  };

  useEffect(() => {
    // Initial load sequence
    setTimeout(runSequence, 800);
  }, []);

  const onToggleMode = async () => {
    if (authState === 'open') {
      setMode(prev => prev === 'login' ? 'signup' : 'login');
    }
  };

  const onSuccess = () => {
    setAuthState('success');
  };

  return (
    <group>
      <CameraRig authState={authState} />
      
      <Character authState={authState} pullProgress={pullProgress} />
      
      <Rope authState={authState} pullProgress={pullProgress} />

      <FoldingCard 
        authState={authState} 
        mode={mode}
        onToggleMode={onToggleMode} 
        onSuccess={onSuccess} 
      />
    </group>
  );
}
