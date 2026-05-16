"use client";

import { usePiAuth } from "@/app/pi-auth-provider";

export function AuthLoadingScreen() {
  const { error, isAuthenticating, signIn } = usePiAuth();
  const message = error
    ? error
    : isAuthenticating
      ? "Waiting for Pi sign-in..."
      : "Pi authentication is required.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full px-6 text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-primary/20" />
            <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Pi Network Authentication</h2>
          <p
            className={`text-sm ${
              error ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {message}
          </p>
        </div>

        {error && (
          <button
            onClick={signIn}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}