import { Router } from "express";
import youtubesearchapi from 'youtube-search-api';

const router = Router();

router.post('/get_music', async (req, res) => {
	try {
		const data = req.body;
		if (!data) {
			console.warn('No JSON data received in /check_image request');
			res.status(400).json({ error: 'No data received' });
			return;
		}
		const prompt: string | undefined = data.prompt;
		if (!prompt || typeof prompt !== 'string') {
			console.warn('Prompt is required and must be a string in /get_music request');
			res.status(400).json({ error: 'Prompt is required and must be a string' });
			return;
		}
		const musicVideo = await youtubesearchapi.GetListByKeyword(`${prompt} game background music`, false, 1, [{ type: "video" }])
		res.json({ musicVideoID: musicVideo.items[0].id, musicVideo, link: "https://www.youtube.com/watch?v=" + musicVideo.items[0].id });
		return;
	} catch (error: any) {
		console.error(`Error in check_image endpoint: ${error.message}`);
		res.status(500).json({ error: error.message });
		return;
	}
})

export default router;