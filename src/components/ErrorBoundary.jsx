import { Component } from 'react';
import { createLogger } from '../utils/logger';

const log = createLogger('ErrorBoundary');

export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { log.error('Render failure', error, info.componentStack); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="fatal" role="alert">
        <h2>Something went wrong displaying this page</h2>
        <p>Reload the page. If it keeps happening, check the browser console for the logged error.</p>
      </div>
    );
  }
}
