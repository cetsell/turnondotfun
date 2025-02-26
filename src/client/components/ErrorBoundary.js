import React from 'react'
import { css } from '@firebolt-dev/css'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('UI Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          css={css`
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(255, 0, 0, 0.8);
            color: white;
            padding: 20px;
            border-radius: 4px;
            max-width: 400px;
          `}
        >
          <h3>Something went wrong</h3>
          <pre>{this.state.error?.message}</pre>
        </div>
      )
    }

    return this.props.children
  }
}
