import { Component } from 'react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, stack: null, diagnostic: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        let diagnostic = null;
        // Try to detect a raw JSON/global object being rendered
        if (error && /Objects are not valid as a React child/.test(error.message)) {
            diagnostic = 'A non-primitive object was passed directly into JSX. Look for a variable that equals the global JSON object or an unsafely parsed value.';
        }
        this.setState({ stack: info?.componentStack || null, diagnostic });
        console.group('ErrorBoundary caught error');
        console.error(error);
        console.log('Component stack:', info?.componentStack);
        if (diagnostic) console.log('Heuristic diagnostic:', diagnostic);
        console.groupEnd();
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="alert alert-error" role="alert" style={{ margin: '16px' }}>
                    <strong style={{ display: 'block', marginBottom: 4 }}>Render Error</strong>
                    <div style={{ fontSize: '.75rem', whiteSpace: 'pre-wrap', marginBottom: 8 }}>
                        {this.state.error?.message}
                        {this.state.diagnostic && `\n\nHint: ${this.state.diagnostic}`}
                        {this.state.stack && `\n\nComponent Stack:${this.state.stack}`}
                    </div>
                    <button
                        className="btn btn-danger btn-ghost"
                        onClick={() => this.setState({ hasError: false, error: null, stack: null, diagnostic: null })}
                    >Retry</button>
                </div>
            );
        }
        return this.props.children;
    }
}
