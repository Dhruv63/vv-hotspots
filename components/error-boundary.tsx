"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  private handleReload = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-cyber-black text-white p-4">
          <div className="max-w-md w-full bg-cyber-dark border border-cyber-pink p-6 rounded-lg shadow-[0_0_20px_rgba(255,0,128,0.2)] text-center">
            <div className="w-16 h-16 bg-cyber-pink/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyber-pink">
              <AlertTriangle className="w-8 h-8 text-cyber-pink" />
            </div>
            <h2 className="text-xl font-mono font-bold text-cyber-pink mb-2">System Error</h2>
            <p className="text-gray-400 font-mono text-sm mb-6">
              Something went wrong. The application encountered an unexpected error.
            </p>
            {this.state.error && (
              <div className="bg-black/50 p-3 rounded text-left mb-6 overflow-auto max-h-32">
                <p className="text-red-400 text-xs font-mono whitespace-pre-wrap">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            <button
              onClick={this.handleReload}
              className="w-full py-3 bg-cyber-pink text-white font-mono font-bold rounded flex items-center justify-center gap-2 hover:bg-cyber-pink/80 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              RELOAD PAGE
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
