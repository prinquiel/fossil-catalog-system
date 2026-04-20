import { Component } from 'react';
import { Link } from 'react-router-dom';
import './AppErrorBoundary.css';

export class AppErrorBoundary extends Component {
  /** @param {{ children: import('react').ReactNode }} props */
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  /** @param {{ message?: string }} error */
  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Error inesperado' };
  }

  /** @param {Error} error */
  componentDidCatch(error, info) {
    console.error('AppErrorBoundary:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="error-boundary">
          <p className="error-boundary__kicker">Interrupción en la interfaz</p>
          <h1 className="error-boundary__title">No pudimos mostrar esta vista</h1>
          <p className="error-boundary__text">
            Ocurrió un fallo al renderizar el contenido. Puede deberse a un problema temporal o a datos
            inesperados. Puede reintentar o volver al inicio.
          </p>
          {import.meta.env.DEV && this.state.message ? (
            <pre className="error-boundary__trace">{this.state.message}</pre>
          ) : null}
          <div className="error-boundary__actions">
            <button type="button" className="error-boundary__btn" onClick={this.handleRetry}>
              Reintentar
            </button>
            <Link to="/" className="error-boundary__link">
              Ir al inicio
            </Link>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
