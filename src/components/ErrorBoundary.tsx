import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-950 p-4">
          <div className="text-center max-w-md">
            <div className="w-14 h-14 rounded-full border-2 border-amber-500/40 flex items-center justify-center mx-auto mb-5 text-amber-500 text-2xl font-bold">
              !
            </div>
            <h1 className="font-display text-2xl font-semibold text-stone-100 mb-2">
              Une erreur est survenue
            </h1>
            <p className="text-sm text-stone-400 leading-relaxed mb-6">
              Désolé, quelque chose s'est mal passé. Rechargez la page pour réessayer.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold text-sm transition-colors"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
