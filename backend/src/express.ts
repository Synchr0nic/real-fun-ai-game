import open from 'open';
import express from 'express';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import check_image from './routes/check_image';
import homeMiddleware from './middlewares/home-middleware';
import chat from './routes/chat';
import get_music from './routes/get_music';
config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
app.use(express.json());
app.use(express.static(join(__dirname, '..', 'public')));
app.use('/', homeMiddleware);
app.use('/', check_image);
app.use('/', chat);
app.use('/', get_music);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Starting Interactive Story Explorer...`);
    console.log(`Opening your web browser...`);
    console.log(`Server running on http://localhost:${PORT}`);
    // open(`http://localhost:${PORT}`)
});
