import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, SoftShadows, ContactShadows, PerformanceMonitor } from '@react-three/drei';
import SceneController from './components/SceneController.tsx';
import LoadingScreen from './components/LoadingScreen.tsx';

function App() {
  const [dpr, setDpr] = useState(1.5);

  return (
    <div className="w-screen h-screen bg-[#fffdfa] overflow-hidden">
      <Suspense fallback={<LoadingScreen />}>
        <Canvas 
          shadows 
          camera={{ position: [0, 0, 9], fov: 45 }}
          dpr={dpr}
          gl={{ antialias: true, toneMappingExposure: 1.1 }}
        >
          <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(2)} />
          
          <SoftShadows size={15} samples={16} focus={0.5} />
          <ambientLight intensity={0.6} />
          <directionalLight castShadow position={[5, 10, 5]} intensity={1.8} shadow-mapSize={[1024, 1024]} shadow-bias={-0.0001} />
          <directionalLight position={[-5, 5, -5]} intensity={0.7} color="#e0e7ff" />
          
          <Environment preset="studio" />
          <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={20} blur={2.5} far={4} />

          <SceneController />
        </Canvas>
      </Suspense>
    </div>
  );
}

export default App;
