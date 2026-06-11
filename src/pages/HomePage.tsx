import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { CosmicWorld } from '@/components/three/CosmicWorld';
import { HUD } from '@/components/HUD';
import { ProjectDetail } from '@/components/ProjectDetail';
import { StorytellingUI } from '@/components/StorytellingUI';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          color: '#ff3366', 
          background: 'rgba(10, 10, 15, 0.95)', 
          border: '1px solid #ff3366',
          position: 'fixed', 
          zIndex: 9999, 
          top: 0, 
          left: 0, 
          right: 0,
          fontFamily: 'monospace',
          maxHeight: '50vh',
          overflow: 'auto'
        }}>
          <h2>REACT RENDER CRASH IN STORYTELLING_UI:</h2>
          <p style={{ fontWeight: 'bold' }}>{this.state.error?.toString()}</p>
          <pre style={{ color: '#fff', fontSize: '12px' }}>{this.state.error?.stack}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#020205]">
      <CosmicWorld />
      <HUD />
      <ErrorBoundary>
        <StorytellingUI />
      </ErrorBoundary>
      <ProjectDetail />
    </div>
  );
}

export default HomePage;
