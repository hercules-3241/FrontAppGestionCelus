interface ErrorBody {
  message?: unknown;
  fields?: unknown;
}

/** Extracts the message from the backend's error body ({ message } or { fields }), or returns the fallback. */
export function mensajeErrorApi(error: unknown, fallback: string): string {
  const body = (error as { response?: { data?: ErrorBody } } | null)?.response?.data;
  if (typeof body?.message === 'string' && body.message) return body.message;
  if (body?.fields && typeof body.fields === 'object') {
    const primero = Object.values(body.fields as Record<string, unknown>).find(v => typeof v === 'string');
    if (typeof primero === 'string') return primero;
  }
  return fallback;
}
