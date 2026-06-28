type ErrorContext = Record<string, unknown>;

export function reportClientError(error: unknown, context?: ErrorContext) {
  if (process.env.NODE_ENV === "development") {
    console.error("[movo]", error, context);
    return;
  }

  // Hook for Sentry/Datadog: set NEXT_PUBLIC_ERROR_REPORT_URL to enable.
  const endpoint = process.env.NEXT_PUBLIC_ERROR_REPORT_URL;
  if (!endpoint) return;

  const message = error instanceof Error ? error.message : String(error);
  const payload = {
    message,
    stack: error instanceof Error ? error.stack : undefined,
    context,
    url: typeof window !== "undefined" ? window.location.href : undefined,
    ts: new Date().toISOString(),
  };

  void fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => undefined);
}
