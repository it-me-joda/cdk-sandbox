export function log(message: string) {
    let timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
}