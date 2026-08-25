import React from 'react';

interface Props {
  children?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[FPStudio ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="w-16 h-16 bg-lime-500/10 border border-lime-500/30 rounded-2xl flex items-center justify-center mx-auto text-lime-400 font-black text-2xl">
              FP
            </div>
            <div>
              <h2 className="text-xl font-black uppercase text-white tracking-tight">FPStudio Salvador</h2>
              <p className="text-sm text-zinc-400 mt-2">
                Ocorreu uma pequena instabilidade na inicialização. Clique abaixo para carregar normalmente.
              </p>
            </div>
            <div className="space-y-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3.5 px-6 rounded-xl bg-lime-400 text-black font-black uppercase tracking-wider text-sm hover:bg-lime-300 transition shadow-lg cursor-pointer"
              >
                Recarregar Sistema
              </button>
              <button
                onClick={() => {
                  try {
                    window.localStorage?.clear();
                    window.location.href = window.location.origin;
                  } catch (e) {}
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-xs hover:bg-zinc-700 transition cursor-pointer"
              >
                Limpar Cache e Reiniciar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
