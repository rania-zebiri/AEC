class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate text-pure">
          <div className="text-center card p-8 max-w-md">
            <h1 className="text-2xl font-mono text-red mb-4">Portfolio System Error</h1>
            <p className="text-fog mb-6 font-sans">We're sorry, but the portfolio module encountered an error.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary w-full"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function PortfolioApp() {
  try {
    return (
      <Layout data-name="portfolio-app" data-file="portfolio-app.js">
        <Portfolio />
      </Layout>
    );
  } catch (error) {
    console.error('App component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <PortfolioApp />
  </ErrorBoundary>
);