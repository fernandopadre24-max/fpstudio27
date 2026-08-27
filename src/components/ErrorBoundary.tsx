import React from 'react';

interface Props {
  children?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[FPStudio ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  private handleRetry = () => {
    try {
      this.setState({ hasError: false, error: undefined });
    } catch (e) {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  };

  private handleClearAndReload = () => {
    try {
      if (typeof window !== 'undefined') {
        const keysToRemove = [
          'fpstudio_custom_settings_v1',
          'fpstudio_active_client_data',
          'fpstudio_clients_data',
          'fpstudio_services_data',
          'fpstudio_reviews_data',
          'fpstudio_admin_credentials',
          'fpstudio_active_client_id',
          'fpstudio_client_logged_in',
          'fpstudio_active_staff_user',
        ];
        keysToRemove.forEach((k) => {
          try {
            window.localStorage?.removeItem(k);
          } catch (e) {}
        });
        this.setState({ hasError: false, error: undefined });
        window.location.reload();
      }
    } catch (e) {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="max-w-md w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6 backdrop-blur-xl">
            <div className="w-16 h-16 bg-[#00FF41]/10 border border-[#00FF41]/30 rounded-2xl flex items-center justify-center mx-auto text-[#00FF41] font-black text-2xl shadow-[0_0_25px_rgba(0,255,65,0.2)]">
              FP
            </div>
            <div>
              <h2 className="text-xl font-black uppercase text-white tracking-tight">FPStudio Salvador</h2>
              <p className="text-sm text-zinc-400 mt-2">
                O estúdio está pronto para carregar. Clique no botão abaixo para acessar o sistema normalmente.
              </p>
              {this.state.error && (
                <div className="mt-3 p-3 bg-red-950/40 border border-red-800/40 rounded-xl text-left overflow-auto max-h-32 text-xs text-red-300 font-mono">
                  {this.state.error.name}: {this.state.error.message}
                </div>
              )}
            </div>
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={this.handleRetry}
                className="w-full py-3.5 px-6 rounded-xl bg-[#00FF41] text-black font-black uppercase tracking-wider text-sm hover:bg-[#00e038] transition shadow-[0_0_20px_rgba(0,255,65,0.3)] cursor-pointer active:scale-98"
              >
                Abrir Sistema Agora
              </button>
              <button
                type="button"
                onClick={this.handleClearAndReload}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-800/80 text-zinc-300 font-bold text-xs hover:bg-zinc-700 transition cursor-pointer border border-zinc-700/50 active:scale-98"
              >
                Recarregar & Sincronizar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
