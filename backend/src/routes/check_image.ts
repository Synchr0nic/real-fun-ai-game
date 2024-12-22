import express from "express";
import { generateImage } from "../utils";
import { getGameState } from "../db";

const router = express.Router();

router.post('/check_image', async (req, res) => {
	try {
		const data = req.body;
		if (!data) {
			console.warn('No JSON data received in /check_image request');
			res.status(400).json({ error: 'No data received' });
			return;
		}
		const message: string | undefined = data.message;
		if (!message || typeof message !== 'string') {
			console.warn('Message is required and must be a string in /check_image request');
			res
				.status(400)
				.json({ error: 'Message is required and must be a string' });
			return;
		}

		const gameState = getGameState();
		const assistantMessages: string[] = gameState.messages
			.filter((msg) => msg.role === 'assistant')
			.map((msg) => msg.content);

		if (!assistantMessages.length) {
			console.warn('No AI message found in /check_image request');
			res.status(400).json({ error: 'No AI message found' });
			return;
		}
		const lastAIMessage: string = assistantMessages[assistantMessages.length - 1];

		const stylePrompt = gameState.user_prefs.art_style
			? `, ${gameState.user_prefs.art_style} style`
			: '';
		const cacheKey = lastAIMessage + stylePrompt;

		let imageURL: string | null = null;

		if (cacheKey in gameState.image_cache) {
			imageURL = gameState.image_cache[cacheKey];
			console.info(
				`Image URL from cache: ${imageURL} with key: ${cacheKey} in check_image`,
			);
		} else {
			imageURL = generateImage(lastAIMessage + stylePrompt);
			if (imageURL) {
				gameState.image_cache[cacheKey] = imageURL;
				setGameState(gameState);
				console.info(
					`Image URL generated: ${imageURL} with key: ${cacheKey} in check_image`,
				);
			} else {
				console.warn(
					`Image URL generation failed with description ${lastAIMessage + stylePrompt} in check_image`,
				);
			}
		}

		res.json({ image_url: imageURL });
		return;
	} catch (error: any) {
		console.error(`Error in check_image endpoint: ${error.message}`);
		res.status(500).json({ error: error.message });
		return;
	}
})

export default router;