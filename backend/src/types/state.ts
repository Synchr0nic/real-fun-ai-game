export enum GAME_STATES {
	ASKING_NAME = 'ASKING_NAME',
	ASKING_THEME = 'ASKING_THEME',
	ASKING_STYLE = 'ASKING_STYLE',
	PLAYING = 'PLAYING',
}

export interface GameState {
	messages: Message[];
	current_scene: string | null;
	state: GAME_STATES;
	user_prefs: UserPrefs;
	image_cache: { [key: string]: string };
	inventory: InventoryItem[];
}
