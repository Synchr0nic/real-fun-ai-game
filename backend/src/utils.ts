import { MISTRAL_API_URL } from "./config";
import { GAME_STATES } from "./types/state";

export async function getMistralResponse(
    messages: Message[],
    max_tokens = 500,
): Promise<string> {
    if (!MISTRAL_API_URL) {
        console.error('MISTRAL_API_URL is not defined');
        return 'An error occurred while communicating with the AI service.';
    }
    try {
        console.info(`Sending request to Mistral API with messages: ${JSON.stringify(messages)}`);
        const response = await fetch(MISTRAL_API_URL, {
            method: 'POST',
            body: JSON.stringify({
                model: 'mistral-tiny',
                messages,
                max_tokens,
                temperature: 0.7,
                top_p: 0.95,
                stream: false,
            }),
            signal: AbortSignal.timeout(3000),
        });

        const data = await response.json();
        const aiResponse: string = data.choices[0].message.content;
        console.info(`Received response from Mistral API: ${aiResponse}`);
        return enforceResponseLimits(aiResponse);
    } catch (error: any) {
        console.error(`Error in getMistralResponse: ${error.message}`);
        return 'An error occurred while communicating with the AI service.';
    }
}

export function enforceResponseLimits(text: string, maxChars = 500, maxSentences = 4): string {
    const sentences = text.split('.');
    const limitedSentences = sentences.slice(0, maxSentences);
    let result = limitedSentences.join('.').trim();
    if (result.length > maxChars) {
        result = result.substring(0, maxChars).split(' ').slice(0, -1).join(' ');
    }
    return result + '.';
}

export function generateImage(description: string): string | null {
    if (!description) {
        console.warn('generateImage called with an empty description');
        return null;
    }
    try {
        const cleanDescription = description.replace('\n', ' ').trim();
        const encodedPrompt = new URLSearchParams({ prompt: cleanDescription }).toString().split('=')[1];
        const imageURL = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true&quality=95`;
        console.info(`Generated image URL: ${imageURL} with description: ${description}`);
        return imageURL;
    } catch (error: any) {
        console.error(`Error generating image URL with description ${description}: ${error.message}`);
        return null;
    }
}

export function handleUserInput(message: string): string | null {
    const gameState = getGameState();
    console.log("gameState", gameState)
    const prefs = gameState.user_prefs;
    const stateHandlers: { [key in GAME_STATES]?: (msg: string, prefs: UserPrefs) => string } = {
        [GAME_STATES.ASKING_NAME]: (msg, prefs) => handleName(msg, prefs),
        [GAME_STATES.ASKING_THEME]: (msg, prefs) => handleTheme(msg, prefs),
        [GAME_STATES.ASKING_STYLE]: (msg, prefs) => handleStyle(msg, prefs),
    };
    console.log("DEBUG", gameState.state)
    const handler = stateHandlers[gameState.state];

    if (handler) {
        const response = handler(message, prefs);
        console.info(`User input during setup: ${message} response: ${response}`);
        return response;
    }
    console.warn(`User input not during gameplay: ${message}`);
    return null;
}

export function handleName(message: string, prefs: UserPrefs): string {
    const gameState = getGameState();
    prefs.name = message.trim();
    gameState.state = GAME_STATES.ASKING_THEME;
    setGameState(gameState);
    return `Hello ${prefs.name}! What kind of world would you like to explore? (Any theme you can imagine!)`;
}

export function handleTheme(message: string, prefs: UserPrefs): string {
    const gameState = getGameState();
    prefs.theme = message.trim();
    gameState.state = GAME_STATES.ASKING_STYLE;
    setGameState(gameState);
    return `And finally, ${prefs.name}, what art style should your adventure be drawn in?`;
}

export function handleStyle(message: string, prefs: UserPrefs): string {
    const gameState = getGameState();
    prefs.art_style = message.trim();
    gameState.state = GAME_STATES.PLAYING;
    setGameState(gameState);
    return `Perfect! Your ${prefs.theme} adventure begins now, ${prefs.name}! What would you like to explore?`;
}

export function resetGameState() {
    setGameState({
        messages: [],
        current_scene: null,
        state: GAME_STATES.ASKING_NAME,
        user_prefs: {
            name: null,
            theme: null,
            art_style: null,
        },
        image_cache: {},
        inventory: [],
    });
}