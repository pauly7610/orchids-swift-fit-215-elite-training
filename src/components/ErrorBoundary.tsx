"use client"

import { Component, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-2 border-destructive/20">
            <CardHeader className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Something went wrong</CardTitle>
              <CardDescription>
                We encountered an unexpected error. Please try refreshing the page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm font-mono text-muted-foreground break-words">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  Refresh Page
                </Button>
                <Button
                  onClick={() => window.location.href = "/"}
                  variant="outline"
                  className="w-full"
                >
                  Go to Homepage
                </Button>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                If this problem persists, please contact us at{" "}
                <a href="tel:2679390254" className="text-primary hover:underline">
                  (267) 939-0254
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
