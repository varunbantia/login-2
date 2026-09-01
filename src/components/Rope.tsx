import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { SpringValue } from '@react-spring/three';
import * as THREE from 'three';
import { AuthState } from './SceneController';

interface RopeProps {
  authState: AuthState;
  pullProgress: SpringValue<number>;
}

export default function Rope({ authState, pullProgress }: RopeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Directly tied to the center pulley
  const mechanismPoint = new THREE.Vector3(0, 2.4, 0.1);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const p = pullProgress ? pullProgress.get() : 0;
      
      const isSlack = authState !== 'grab' && authState !== 'pull' && authState !== 'open';
      const curTension = isSlack ? 0.2 : 1.0;
      
      // Calculate dynamic strain wiggle during the pulling sequence
      const isPulling = authState === 'pull';
      const strainOffset = isPulling ? Math.sin(clock.elapsedTime * 40) * 0.03 : 0;
      
      // Mathematical Lock mirroring the IK hand clamps
      const curX = 0;
      const baseGrabY = 1.5; 
      const pulledY = 2.0;   
      const baseGrabZ = 0.2;
      const pulledZ = 0.9;
      
      // We clamp rope bottom strictly based on pull progress
      const curY = baseGrabY + (pulledY - baseGrabY) * p;
      const curZ = baseGrabZ + (pulledZ - baseGrabZ) * p + (isSlack ? -0.2 : 0); // moves closer to box when slack
      
      const curve = new THREE.CatmullRomCurve3([
        mechanismPoint, // mechanism hinge (TOP)
        // Slack midpoint with micro-bounce tension
        new THREE.Vector3(0 + strainOffset, (curY + mechanismPoint.y)/2, curZ + (1-curTension)*0.8),
        new THREE.Vector3(curX, curY, curZ) // Hand/Bottom
      ]);
      
      if (meshRef.current.geometry) meshRef.current.geometry.dispose();
      meshRef.current.geometry = new THREE.TubeGeometry(curve, 32, 0.05, 8, false); // Thick rope
    }
  });

  return (
    <mesh ref={meshRef} castShadow>
      <meshStandardMaterial color="#222222" roughness={0.9} />
    </mesh>
  );
}
