import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { a, useSpring, SpringValue } from '@react-spring/three';
import { AuthState } from './SceneController';

// Premium Physical Materials for stylized cinematic aesthetic
const skinMaterial = new THREE.MeshPhysicalMaterial({ color: '#ffcba4', roughness: 0.3, clearcoat: 0.2 });
const shirtMaterial = new THREE.MeshPhysicalMaterial({ color: '#fb923c', roughness: 0.8, clearcoat: 0.05 }); // Orange hoodie
const trousersMaterial = new THREE.MeshPhysicalMaterial({ color: '#3b82f6', roughness: 0.9, clearcoat: 0.05 }); // Blue trousers
const shoeMaterial = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.6 });
const hairMaterial = new THREE.MeshPhysicalMaterial({ color: '#1e293b', roughness: 0.9 });
const harnessMaterial = new THREE.MeshPhysicalMaterial({ color: '#facc15', roughness: 0.6, metalness: 0.2 }); // Yellow harness

interface CharacterProps {
  authState: AuthState;
  pullProgress: SpringValue<number>;
  [key: string]: any;
}

export default function Character({ authState, pullProgress, ...props }: CharacterProps) {
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);

  // Spring Interpolation for climbing targets
  const { charX, charY, charZ, rotationX, rotationY } = useSpring({
    charX: authState === 'loading' ? -4 : (authState === 'intro' ? -1.8 : (authState === 'climbing' ? -1.8 : 0)),
    charY: authState === 'loading' ? -4 : (authState === 'intro' ? -2.3 : (authState === 'climbing' ? 2.2 : 2.4)),
    charZ: authState === 'intro' ? 0.5 : (authState === 'climbing' ? 0 : 0.3),
    rotationX: authState === 'climbing' ? -0.2 : 0,
    rotationY: authState === 'intro' ? Math.PI : (authState === 'climbing' ? Math.PI / 2 : 0),
    config: (key) => {
      if (key === 'charY' && authState === 'climbing') return { mass: 2, tension: 20, friction: 18 };
      if (key === 'charX' && (authState === 'summit' || authState === 'reach')) return { mass: 1, tension: 50, friction: 15 };
      return { mass: 2, tension: 70, friction: 14 };
    }
  });

  useFrame(({ clock, pointer }) => {
    const t = clock.getElapsedTime();

    if (headRef.current && (authState === 'summit' || authState === 'open')) {
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, (pointer.x * Math.PI) / 6, 0.1);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -(pointer.y * Math.PI) / 6, 0.1);
    }

    if (leftArmRef.current && rightArmRef.current && leftLegRef.current && rightLegRef.current && torsoRef.current) {
      if (authState === 'climbing') {
        const climbCycle = t * 4; 
        
        leftArmRef.current.rotation.x = Math.PI - 0.2 + Math.max(0, Math.sin(climbCycle)) * 1.2;
        leftArmRef.current.rotation.z = Math.max(0, Math.sin(climbCycle)) * 0.4;
        rightArmRef.current.rotation.x = Math.PI - 0.2 + Math.max(0, Math.sin(climbCycle - Math.PI/2)) * 1.2;
        rightArmRef.current.rotation.z = -Math.max(0, Math.sin(climbCycle - Math.PI/2)) * 0.4;
        leftLegRef.current.rotation.x = -0.6 + Math.max(0, Math.sin(climbCycle - Math.PI)) * 0.9;
        rightLegRef.current.rotation.x = -0.6 + Math.max(0, Math.sin(climbCycle - Math.PI * 1.5)) * 0.9;
        torsoRef.current.rotation.z = Math.sin(climbCycle) * 0.15; 
        const bounce = Math.pow(Math.max(0, Math.sin(climbCycle - Math.PI)), 2) * 0.1 + Math.pow(Math.max(0, Math.sin(climbCycle - Math.PI*1.5)), 2) * 0.1;
        torsoRef.current.position.y = 1.2 + bounce;

      } else if (authState === 'intro' || authState === 'loading') {
        headRef.current!.rotation.x = -0.5;
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0.2, 0.1);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0.2, 0.1);
        torsoRef.current.rotation.z = 0;
      } else if (authState === 'summit') {
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, 0.1);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 0.1);
        torsoRef.current.position.y = THREE.MathUtils.lerp(torsoRef.current.position.y, 1.2, 0.1);
      } else if (authState === 'reach' || authState === 'grab' || authState === 'pull' || authState === 'open') {
        const p = pullProgress ? pullProgress.get() : 0;
        const grabArmRotX = -Math.PI / 5; 
        const pullArmRotX = Math.PI / 4; 

        if (authState === 'reach' || authState === 'grab') {
           leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, grabArmRotX, 0.1);
           rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, grabArmRotX, 0.1);
           leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 0.15, 0.1);
           rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -0.15, 0.1);
        } else {
           const strainShake = Math.sin(t * 40) * 0.02 * p;
           leftArmRef.current.rotation.x = grabArmRotX + (pullArmRotX - grabArmRotX) * p;
           rightArmRef.current.rotation.x = grabArmRotX + (pullArmRotX - grabArmRotX) * p;
           leftArmRef.current.rotation.z = 0.15;
           rightArmRef.current.rotation.z = -0.15;
           torsoRef.current.rotation.x = -0.1 + (-0.6 + strainShake) * p;
           torsoRef.current.position.y = 1.0 - 0.3 * p;
           leftLegRef.current.rotation.x = -0.2 - 0.4 * p;
           rightLegRef.current.rotation.x = -0.2 - 0.4 * p;
        }
      }
    }
  });

  return (
    <a.group position-x={charX as any} position-y={charY as any} position-z={charZ as any} rotation-x={rotationX as any} rotation-y={rotationY as any} {...props}>
      {/* Downscale since he's a tiny guy compared to the giant card */}
      <group scale={0.4}>
        
        <group ref={torsoRef} position={[0, 1.2, 0]}>
          <RoundedBox args={[0.9, 1.2, 0.5]} radius={0.2} smoothness={4} material={shirtMaterial} castShadow receiveShadow />
          
          {/* Harness detailing */}
          <RoundedBox position={[0, -0.4, 0.26]} args={[0.92, 0.1, 0.1]} radius={0.02} material={harnessMaterial} castShadow />
          <RoundedBox position={[-0.3, -0.6, 0]} args={[0.1, 0.4, 0.52]} radius={0.02} material={harnessMaterial} castShadow />
          <RoundedBox position={[0.3, -0.6, 0]} args={[0.1, 0.4, 0.52]} radius={0.02} material={harnessMaterial} castShadow />

          {/* Head */}
          <group ref={headRef} position={[0, 0.9, 0]}>
            <RoundedBox args={[0.7, 0.7, 0.7]} radius={0.2} smoothness={4} material={skinMaterial} castShadow receiveShadow />
            <RoundedBox args={[0.75, 0.2, 0.75]} position={[0, 0.35, -0.05]} radius={0.1} smoothness={4} material={hairMaterial} castShadow receiveShadow />
            {/* Eyes */}
            <mesh position={[-0.15, 0.05, 0.36]} castShadow>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshPhysicalMaterial color="#1e293b" />
            </mesh>
            <mesh position={[0.15, 0.05, 0.36]} castShadow>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshPhysicalMaterial color="#1e293b" />
            </mesh>
          </group>

          {/* Left Arm */}
          <group ref={leftArmRef} position={[-0.6, 0.4, 0]}>
            <RoundedBox args={[0.3, 1.0, 0.3]} position={[0, -0.4, 0]} radius={0.15} smoothness={4} material={shirtMaterial} castShadow />
            <mesh position={[0, -1.0, 0]} material={skinMaterial} castShadow>
              <sphereGeometry args={[0.18, 16, 16]} />
            </mesh>
          </group>

          {/* Right Arm */}
          <group ref={rightArmRef} position={[0.6, 0.4, 0]}>
            <RoundedBox args={[0.3, 1.0, 0.3]} position={[0, -0.4, 0]} radius={0.15} smoothness={4} material={shirtMaterial} castShadow />
            <mesh position={[0, -1.0, 0]} material={skinMaterial} castShadow>
              <sphereGeometry args={[0.18, 16, 16]} />
            </mesh>
          </group>
        </group>

        {/* Left Leg */}
        <group ref={leftLegRef} position={[-0.25, 0.6, 0]}>
          <RoundedBox args={[0.35, 1.0, 0.35]} position={[0, -0.1, 0]} radius={0.15} smoothness={4} material={trousersMaterial} castShadow receiveShadow />
          <RoundedBox args={[0.4, 0.2, 0.5]} position={[0, -0.6, 0.1]} radius={0.1} smoothness={4} material={shoeMaterial} castShadow />
        </group>
        
        {/* Right Leg */}
        <group ref={rightLegRef} position={[0.25, 0.6, 0]}>
          <RoundedBox args={[0.35, 1.0, 0.35]} position={[0, -0.1, 0]} radius={0.15} smoothness={4} material={trousersMaterial} castShadow receiveShadow />
          <RoundedBox args={[0.4, 0.2, 0.5]} position={[0, -0.6, 0.1]} radius={0.1} smoothness={4} material={shoeMaterial} castShadow />
        </group>
      </group>
    </a.group>
  );
}
