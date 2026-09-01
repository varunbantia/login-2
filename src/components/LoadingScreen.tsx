import { useProgress } from '@react-three/drei';

export default function LoadingScreen() {
  const { progress } = useProgress();
  
  if (progress === 100) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-brand-cream font-sans transition-opacity duration-500">
      <h1 className="text-2xl font-semibold mb-4 text-slate-800 tracking-tight">Initializing Experience</h1>
      <div className="w-64 h-1 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-brand-blue rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
