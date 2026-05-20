const ENDPOINT =
  "http://127.0.0.1:7821/ingest/a36b499c-3af2-494c-bb0e-9655f8300e13"
const SESSION_ID = "684d68"

export function debugLog(
  location: string,
  message: string,
  data: Record<string, unknown>,
  hypothesisId: string,
  runId = "pre-fix",
) {
  // Solo en dev: en producción un fetch a 127.0.0.1 dispara el permiso
  // "Acceder a otras apps y servicios" (Local Network Access) en Chrome.
  if (process.env.NODE_ENV !== "development") return

  const payload = {
    sessionId: SESSION_ID,
    runId,
    hypothesisId,
    location,
    message,
    data,
    timestamp: Date.now(),
  }

  // #region agent log
  fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": SESSION_ID,
    },
    body: JSON.stringify(payload),
  }).catch(() => {})
  // #endregion
}
