// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function log(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}${data ? '\n' + data : ''}`);
}
