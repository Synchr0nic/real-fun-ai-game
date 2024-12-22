import express from "express";
import { resetGameState } from "../utils";

const router = express.Router();

router.use('/', (req, res, next) => {
	resetGameState();
	next();
});

export default router;