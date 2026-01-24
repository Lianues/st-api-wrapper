// Ambient module declarations for runtime-only imports.
// Keep this file free of top-level imports/exports so TypeScript treats it as a global script.

declare module '/scripts/openai.js' {
  export function createGenerationParameters(
    settings: any,
    model: string,
    type: string,
    messages: any[],
    options?: any,
  ): Promise<{ generate_data: any; stream: boolean; canMultiSwipe: boolean }>;
}

