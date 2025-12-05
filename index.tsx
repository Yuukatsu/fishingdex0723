import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Error Boundary Component to catch runtime errors
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: '#f87171', backgroundColor: '#1e293b', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>哎呀！應用程式發生錯誤。</h1>
          <p>請將以下錯誤訊息提供給開發者：</p>
          <pre style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', marginTop: '1rem', border: '1px solid #334155' }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: '2rem', padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
          >
            重新整理頁面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);