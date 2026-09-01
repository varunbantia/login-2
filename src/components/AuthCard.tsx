import { useRef } from 'react';
import { Html, RoundedBox } from '@react-three/drei';
import { useSpring, a, SpringValue } from '@react-spring/three';
import { AuthState } from './SceneController';
import * as THREE from 'three';

// Premium Volumetric Glass Material
const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  metalness: 0.15,
  roughness: 0.05,
  transmission: 0.95, // max glass-like
  ior: 1.5,
  thickness: 2.0, // more volumetric glass refraction
  opacity: 1,
  transparent: true,
});

interface AuthCardProps {
  authState: AuthState;
  cardY: SpringValue<number>;
  onToggleMode: () => void;
  onSuccess: () => void;
}

export default function AuthCard({ authState, cardY, onToggleMode, onSuccess }: AuthCardProps) {
  const group = useRef<THREE.Group>(null);
  
  // Spring physics for card rotation based on auth state
  const { rotation } = useSpring({
    rotation: authState === 'intro' ? [0.2, 0, 0] : [0, 0, 0],
    config: { mass: 2, tension: 120, friction: 14 } 
  });

  return (
    <a.group ref={group as any} position-y={cardY as any} rotation={rotation as any}>
      {/* 3D Glass Base */}
      <RoundedBox args={[3.2, 4.2, 0.1]} radius={0.1} smoothness={4} material={glassMaterial} castShadow receiveShadow />
      
      {/* UI Overlay via Html */}
      <Html 
        transform 
        occlude 
        distanceFactor={4}
        position={[0, 0, 0.06]} 
        style={{ width: '400px', height: '520px' }}
        className="flex flex-col p-8 select-none pointer-events-auto"
      >
        <div className="w-full h-full flex flex-col justify-between" style={{ backgroundColor: 'transparent' }}>
          
          <div className="flex-1 transition-all duration-500">
            {authState === 'signup' ? (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-semibold text-slate-800 tracking-tight">Create Account</h2>
                </div>
                <div className="space-y-3">
                  <input type="text" placeholder="Name" className="w-full px-4 py-3 bg-white/60 backdrop-blur-md rounded-xl border border-white/40 focus:outline-none focus:ring-2 focus:ring-brand-coral shadow-sm transition-all text-slate-700 placeholder-slate-400" />
                  <input type="email" placeholder="Email" className="w-full px-4 py-3 bg-white/60 backdrop-blur-md rounded-xl border border-white/40 focus:outline-none focus:ring-2 focus:ring-brand-coral shadow-sm transition-all text-slate-700 placeholder-slate-400" />
                  <input type="password" placeholder="Password" className="w-full px-4 py-3 bg-white/60 backdrop-blur-md rounded-xl border border-white/40 focus:outline-none focus:ring-2 focus:ring-brand-coral shadow-sm transition-all text-slate-700 placeholder-slate-400" />
                </div>
                <button 
                  onClick={onSuccess}
                  className="w-full py-3.5 bg-brand-coral hover:bg-rose-500 text-white font-medium rounded-xl shadow-[0_4px_14px_0_rgba(251,113,133,0.39)] hover:shadow-[0_6px_20px_rgba(251,113,133,0.23)] hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0"
                >
                  Create Account
                </button>
              </div>
            ) : (
              <div className="space-y-6 mt-4">
                <div className="text-center space-y-1">
                  <h2 className="text-3xl font-semibold text-slate-800 tracking-tight">Welcome Back</h2>
                  <p className="text-slate-500 font-medium">Log in to continue</p>
                </div>
                <div className="space-y-4">
                  <input type="email" placeholder="Email" className="w-full px-4 py-3.5 bg-white/70 backdrop-blur-xl rounded-xl border border-white/50 focus:outline-none focus:ring-2 focus:ring-brand-blue shadow-sm transition-all text-slate-700 placeholder-slate-400 font-medium" />
                  <input type="password" placeholder="Password" className="w-full px-4 py-3.5 bg-white/70 backdrop-blur-xl rounded-xl border border-white/50 focus:outline-none focus:ring-2 focus:ring-brand-blue shadow-sm transition-all text-slate-700 placeholder-slate-400 font-medium" />
                </div>
                <button 
                  onClick={onSuccess}
                  className="w-full py-4 mt-2 bg-brand-blue hover:bg-blue-600 text-white font-medium rounded-xl shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0"
                >
                  Log In
                </button>
              </div>
            )}
          </div>

          <div className="text-center pt-4 border-t border-slate-200/50">
            <button 
              onClick={onToggleMode}
              className="text-slate-500 hover:text-slate-800 font-medium text-sm transition-colors cursor-pointer"
            >
              {authState === 'signup' ? "Already have an account? Log in" : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
      </Html>
    </a.group>
  );
}
