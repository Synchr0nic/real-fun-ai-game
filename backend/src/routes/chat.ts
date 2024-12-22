import express from "express";
import { generateImage, getMistralResponse, handleUserInput } from "../utils";
import { GAME_MASTER_SYSTEM_PROMPT } from "../config";
import { GAME_STATES } from "../types/state";

const router = express.Router();

router.post('/chat', async (req, res) => {
    const gameState = getGameState();
    try {
        const data = req.body;
        console.info(`Received data in /chat: ${JSON.stringify(data)}`);

        if (!data) {
            console.warn('No JSON data received in /chat request');
            res.status(400).json({ error: 'No JSON data received' });
            return;
        }

        const userMessage: string | undefined = data.message;
        const userAction: string | undefined = data.action;
        console.info(`User message: ${userMessage}, User action: ${userAction}`);

        if (!userMessage || typeof userMessage !== 'string') {
            console.warn('Message is required in /chat request');
            res
                .status(400)
                .json({ error: 'Message is required and must be a string' });
            return;
        }

        if (gameState.state !== GAME_STATES.PLAYING) {
            const response = handleUserInput(userMessage);
            if (response) {
                let imageURL: string | null = null;
                if (gameState.state === GAME_STATES.ASKING_THEME && gameState.user_prefs.art_style) {
                    const stylePrompt = `, ${gameState.user_prefs.art_style} style`;
                    imageURL = generateImage(response + stylePrompt);
                }
                const responseData: ResponseData = {
                    content: response,
                    image_url: imageURL,
                    options: [],
                    inventory: gameState.inventory,
                };
                res.json(responseData);
                return;
            }
        }

        gameState.messages.push({ role: 'user', content: userMessage });
        setGameState(gameState);

        const initialContextMessages: Message[] = gameState.messages.length > 5 ? gameState.messages.slice(0, 5) : gameState.messages;
        let initialContextStr = initialContextMessages.reduce((acc, msg) => `${acc} ${msg.role}: ${msg.content},`, "");

        const contextMessages: Message[] = gameState.messages.slice(-6);
        let contextStr = contextMessages.reduce((acc, msg) => `${acc} ${msg.role}: ${msg.content},`, "");

        const modifiedSystemPrompt =
            GAME_MASTER_SYSTEM_PROMPT +
            `
            Use the first five messages for the initial context: ${initialContextStr}.
            And the last 5 messages as the current context: ${contextStr}.
             Always base options on the current context.
            Begin your response with a descriptive sentence of the player location. Use the current user message as the players location.
            After your descriptive text response, ALWAYS include 3 potential next actions enclosed in square brackets, for instance:
            [Explore the crater, Follow the icy trail, Setup camp]. Do not include any extra text other than this list of actions.
            Format your response using only the following format:
            <descriptive sentence about location>. <ALWAYS provide 3 options enclosed in square brackets>

           You have access to the players inventory data, ${JSON.stringify(gameState.inventory)}. You are ONLY to generate descriptive text based on the context and return three options. You are not to note when the player takes an action, or when the player acquires an item, return inventory lists, or any additional inventory information. Always provide only a descriptive message and three options.
        `;
        console.info(`Modified System Prompt: ${modifiedSystemPrompt}`);

        const messages: Message[] = [
            { role: 'system', content: modifiedSystemPrompt },
            { role: 'user', content: userAction ? `action: ${userAction} message: ${gameState.messages.slice(-1)[0].content}` : gameState.messages.slice(-1)[0].content },
        ]

        const aiMessage = await getMistralResponse(messages, 600);
        console.info(`AI Response: ${aiMessage}`);

        if (!aiMessage) {
            console.error('Could not retrieve a response from the AI');
            res.status(500).json({ error: 'Could not retrieve a response from the AI' });
            return;
        }

        let imageURL: string | null = null;
        let options: string[] = [];
        let aiContent: string = aiMessage;

        try {
            const match = aiMessage.match(/\[(.*?)\]/);
            if (match) {
                const optionsStr = match[1];
                options = optionsStr.split(',').map((option) => option.trim());
                aiContent = aiMessage.split('[')[0].trim();
            }
        } catch (error: any) {
            console.error(`Error processing options: ${error.message}`);
        }

        if (gameState.state === GAME_STATES.PLAYING) {
            const stylePrompt = gameState.user_prefs.art_style ? `, ${gameState.user_prefs.art_style} style` : '';
            const cacheKey = aiContent + stylePrompt;

            if (cacheKey in gameState.image_cache) {
                imageURL = gameState.image_cache[cacheKey];
                console.info(`Image URL from cache: ${imageURL} with cache key: ${cacheKey}`);
            } else {
                imageURL = generateImage(aiContent + stylePrompt);
                if (imageURL) {
                    gameState.image_cache[cacheKey] = imageURL;
                    setGameState(gameState);
                    console.info(`Image URL generated: ${imageURL} with cache key: ${cacheKey}`);
                } else {
                    console.warn(`Image URL generation failed with description ${aiContent + stylePrompt}`);
                }
            }
        }

        gameState.messages.push({ role: 'assistant', content: aiContent });
        setGameState(gameState);

        if (userAction === 'acquire') {
            if (userMessage.toLowerCase().includes("berries") && !gameState.inventory.some((item) => item.name.toLowerCase() === 'berries')) {
                gameState.inventory.push({ name: 'Berries', description: 'A handful of fresh, juicy forest berries.' });
                setGameState(gameState);
                aiContent += " You have acquired fresh forest berries.";
            }
            else if (userMessage.toLowerCase().includes("ferns") && !gameState.inventory.some((item) => item.name.toLowerCase() === 'ferns')) {
                gameState.inventory.push({ name: 'Ferns', description: 'A handful of fresh, vibrant ferns.' });
                setGameState(gameState);
                aiContent += " You have acquired fresh ferns.";
            }
            else if (userMessage.toLowerCase().includes("mushrooms") && !gameState.inventory.some((item) => item.name.toLowerCase() === 'mushrooms')) {
                gameState.inventory.push({ name: 'Mushrooms', description: 'A handful of fresh, edible mushrooms.' });
                setGameState(gameState);
                aiContent += " You have acquired edible mushrooms.";
            } else {
                aiContent += " There was nothing to acquire"
            }
        } else if (userAction === 'use') {
            if (userMessage.toLowerCase().includes("berries") || gameState.inventory.some((item) => item.name.toLowerCase() === 'berries')) {
                aiContent += " You used the berries.";
                gameState.inventory = gameState.inventory.filter(item => item.name.toLowerCase() != 'berries');
                setGameState(gameState);
            }
            else if (userMessage.toLowerCase().includes("ferns") || gameState.inventory.some((item) => item.name.toLowerCase() === 'ferns')) {
                aiContent += " You used the ferns.";
                gameState.inventory = gameState.inventory.filter(item => item.name.toLowerCase() != 'ferns');
                setGameState(gameState);
            }
            else if (userMessage.toLowerCase().includes("mushrooms") || gameState.inventory.some((item) => item.name.toLowerCase() === 'mushrooms')) {
                aiContent += " You used the mushrooms.";
                gameState.inventory = gameState.inventory.filter(item => item.name.toLowerCase() != 'mushrooms');
                setGameState(gameState);
            }
        }

        const responseData: ResponseData = {
            content: aiContent,
            image_url: imageURL,
            image_pending: false,
            options,
            inventory: gameState.inventory,
        };
        console.info(`Response data: ${JSON.stringify(responseData)}`);
        console.info(`Current game state: ${gameState.state}`);
        res.json(responseData);
        return;
    } catch (error: any) {
        console.error(`Error in chat endpoint: ${error.message}`);
        console.error(`Current game_state: ${JSON.stringify(gameState)}`);
        console.error(`Messages: ${JSON.stringify(gameState.messages)}`);
        res.status(500).json({ error: error.message });
        return;
    }
});

export default router;