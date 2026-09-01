import { useRef } from 'react';
import { Html, RoundedBox } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import * as THREE from 'three';
import { AuthState, FormMode } from './SceneController';

interface FoldingCardProps {
  authState: AuthState;
  mode: FormMode;
  onToggleMode: () => void;
  onSuccess: () => void;
}

export default function FoldingCard({ authState, mode, onToggleMode, onSuccess }: FoldingCardProps) {
  const group = useRef<THREE.Group>(null);
  
  const isUnfolded = authState === 'open';
  
  // Dynamic material based on mode
  const shellMaterial = new THREE.MeshPhysicalMaterial({
    color: mode === 'signup' ? '#ffe4e6' : '#e2e8f0', // Coral/pink for signup, Slate for login
    metalness: 0.2,
    roughness: 0.3,
    clearcoat: 0.5,
  });

  // Origami Unfolding Mechanics
  const { frontFold, formSlide } = useSpring({
    frontFold: isUnfolded ? -Math.PI / 1.6 : 0, 
    formSlide: isUnfolded ? 0.02 : -0.2, 
    config: { mass: 4, tension: 40, friction: 12 } 
  });

  // Hoist out of screen during switch
  const { hoistY } = useSpring({
    hoistY: (authState === 'success' || authState === 'switching') ? 8 : (authState === 'intro' || authState === 'loading' ? 0 : 0),
    config: { mass: 3, tension: 60, friction: 18 }
  });

  return (
    <a.group ref={group as any} position-y={hoistY as any}>
      {/* Back Base (Static) */}
      <RoundedBox args={[3.2, 4.8, 0.2]} radius={0.05} smoothness={4} material={shellMaterial} castShadow receiveShadow />

      {/* Climbing Holds along left edge */}
      <group position={[-1.6, 0, 0.1]} castShadow receiveShadow>
         <mesh position={[0, -2.0, 0]}>
           <sphereGeometry args={[0.1, 16, 16]} />
           <meshPhysicalMaterial color="#f87171" roughness={0.8} />
         </mesh>
         <mesh position={[-0.05, -1.2, 0]}>
           <boxGeometry args={[0.15, 0.1, 0.1]} />
           <meshPhysicalMaterial color="#38bdf8" roughness={0.8} />
         </mesh>
         <mesh position={[0.05, -0.4, 0]}>
           <sphereGeometry args={[0.08, 16, 16]} />
           <meshPhysicalMaterial color="#facc15" roughness={0.8} />
         </mesh>
         <mesh position={[-0.02, 0.5, 0]}>
           <boxGeometry args={[0.1, 0.15, 0.1]} />
           <meshPhysicalMaterial color="#f87171" roughness={0.8} />
         </mesh>
         <mesh position={[0.08, 1.4, 0]}>
           <sphereGeometry args={[0.11, 16, 16]} />
           <meshPhysicalMaterial color="#38bdf8" roughness={0.8} />
         </mesh>
         <mesh position={[-0.05, 2.1, 0]}>
           <boxGeometry args={[0.15, 0.08, 0.1]} />
           <meshPhysicalMaterial color="#facc15" roughness={0.8} />
         </mesh>
      </group>

      {/* Internal Sliding Panel */}
      <a.group position-z={formSlide as any}>
        <Html 
          transform 
          distanceFactor={4.5}
          position={[0, 0, 0.12]} 
          className="flex flex-col p-6 w-[400px] h-[600px] pointer-events-auto bg-transparent z-50"
        >
          {isUnfolded && mode === 'login' && (
            <div className="flex flex-col space-y-6">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-slate-800 tracking-tight">Welcome Back</h2>
                <p className="text-slate-500 mt-2 font-medium">Sign in to continue</p>
              </div>
              <input type="email" placeholder="Email Address" className="px-5 py-4 rounded-xl bg-slate-100 text-slate-700 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 border border-slate-200" />
              <input type="password" placeholder="Password" className="px-5 py-4 rounded-xl bg-slate-100 text-slate-700 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 border border-slate-200" />
              <div className="flex justify-between items-center text-sm font-semibold text-slate-500">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded text-blue-500 w-4 h-4 cursor-pointer" /> Remember me
                </label>
                <span className="text-blue-500 hover:text-blue-600 cursor-pointer">Forgot password?</span>
              </div>
              <button onClick={onSuccess} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-[0_4px_14px_rgba(59,130,246,0.39)] transition-all cursor-pointer">LOG IN</button>
              <div className="text-center text-slate-500 text-sm mt-4 font-medium">
                Don't have an account? <span onClick={onToggleMode} className="text-[#f43f5e] font-bold cursor-pointer hover:underline cursor-pointer">Create one</span>
              </div>
            </div>
          )}

          {isUnfolded && mode === 'signup' && (
            <div className="flex flex-col space-y-4">
              <div className="text-center mb-2">
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Create Account</h2>
                <p className="text-slate-500 mt-1 font-medium">Join us to get started</p>
              </div>
              <input type="text" placeholder="Full Name" className="px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-medium placeholder-slate-400 border border-slate-200" />
              <input type="email" placeholder="Email Address" className="px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-medium placeholder-slate-400 border border-slate-200" />
              <input type="password" placeholder="Password" className="px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-medium placeholder-slate-400 border border-slate-200" />
              <input type="password" placeholder="Confirm Password" className="px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-medium placeholder-slate-400 border border-slate-200" />
              <button onClick={onSuccess} className="bg-[#f43f5e] hover:bg-[#e11d48] text-white font-bold py-4 rounded-xl shadow-[0_4px_14px_rgba(244,63,94,0.39)] transition-all mt-4 cursor-pointer">CREATE ACCOUNT</button>
              <div className="text-center text-slate-500 text-sm mt-2 font-medium">
                Already have an account? <span onClick={onToggleMode} className="text-blue-500 font-bold cursor-pointer hover:underline cursor-pointer">Log in</span>
              </div>
            </div>
          )}
        </Html>
      </a.group>

      {/* Left Front Door */}
      <a.group position={[-1.6, 0, 0.1]} rotation-y={frontFold as any}>
        <RoundedBox position={[0.8, 0, 0]} args={[1.6, 4.8, 0.1]} radius={0.05} smoothness={4} material={shellMaterial} castShadow receiveShadow>
          <Html transform distanceFactor={4.5} position={[0.8, 1.5, 0.06]} className="pointer-events-none">
            <div className="relative flex items-center justify-center">
              <div className="absolute right-0 flex items-center pr-1">
                <h1 className="text-4xl font-black text-slate-800 tracking-tighter whitespace-nowrap">DRE</h1>
              </div>
            </div>
          </Html>
        </RoundedBox>
      </a.group>

      {/* Right Front Door */}
      <a.group position={[1.6, 0, 0.1]} rotation-y={frontFold.to(v => -v) as any}>
        <RoundedBox position={[-0.8, 0, 0]} args={[1.6, 4.8, 0.1]} radius={0.05} smoothness={4} material={shellMaterial} castShadow receiveShadow>
          <Html transform distanceFactor={4.5} position={[-0.8, 1.5, 0.06]} className="pointer-events-none">
            <div className="relative flex items-center justify-center">
              <div className="absolute left-0 flex items-center pl-1">
                <h1 className="text-4xl font-black text-slate-800 tracking-tighter whitespace-nowrap">ATORS</h1>
              </div>
            </div>
          </Html>
        </RoundedBox>
      </a.group>

      {/* Mechanical Center Pulley */}
      <group position={[0, 2.4, 0.1]}>
        <mesh rotation-x={Math.PI / 2}>
           <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
           <meshStandardMaterial color="#1f2937" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.1, 0.05]}>
           <boxGeometry args={[0.08, 0.2, 0.2]} />
           <meshStandardMaterial color="#f87171" />
        </mesh>
      </group>
    </a.group>
  );
}
