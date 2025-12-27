export async function* fakeStream(text: string, delayMs: number = 30): AsyncGenerator<string> {
    const words = text.split(/(\s+)/);

    for (const word of words) {
        yield word;
        await new Promise(r => setTimeout(r, delayMs));
    }
}