import { Client } from 'pg';
import { GAME_STATES, type GameState } from './types/state';
import { CLEAN_DB_TABLES_NEXT_RUN } from './config';

const dbConfig = {
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5432,
};

const defaultGameState: GameState = {
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
};

async function setupDatabase() {
    const client = new Client(dbConfig);
    try {
        await client.connect();
        console.log('Connected to the database.');
        if (CLEAN_DB_TABLES_NEXT_RUN) {
            await client.query('DROP TABLE IF EXISTS user_games');
            await client.query('DROP TABLE IF EXISTS gamestate');
            await client.query('DROP TABLE IF EXISTS users');
            console.log('Dropped existing tables (if any).');
            await client.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL
            );
            `);
            console.log('Created users table.');
            await client.query(`
                CREATE TABLE gamestate (
                    id SERIAL PRIMARY KEY,
                    messages JSONB NOT NULL,
                    current_scene TEXT,
                    state TEXT NOT NULL,
                    user_prefs JSONB NOT NULL,
                    image_cache JSONB NOT NULL,
                    inventory JSONB NOT NULL
                );
            `);
            console.log('Created gamestate table.');
            await client.query(`
                CREATE TABLE user_games (
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    game_id INTEGER REFERENCES gamestate(id) ON DELETE CASCADE,
                    PRIMARY KEY (user_id, game_id)
                );
            `);
            console.log('Created user_games table.');
        }
    } catch (err) {
        console.error('Error during database setup:', err);
    } finally {
        // await client.end();
        // console.log('Database connection closed.');
        console.log('Database is ready!');
    }
}

setupDatabase();

// const user = await createUser("testuser");
// if (user) {
//     console.log('(OK) created user testuser:', user)
// } else {
//     console.log("(FAIL) error creating user")
//     return;
// }
export async function createUser(username: string): Promise<{ id: number; username: string } | null> {
    const client = new Client(dbConfig);
    try {
        await client.connect();
        const res = await client.query('INSERT INTO users (username) VALUES ($1) RETURNING id, username', [username]);
        return res.rows[0];
    } catch (err) {
        console.error('Error creating user:', err);
        return null;
    } finally {
        await client.end();
    }
}

// const userGet = await getUser(user.id)
// if (userGet) {
//     console.log('(OK) getUser test:', userGet)
// } else {
//     console.log("(FAIL) error getting user");
//     return;
// }
export async function getUser(userId: number): Promise<{ id: number; username: string } | null> {
    const client = new Client(dbConfig);
    try {
        await client.connect();
        const res = await client.query('SELECT id, username FROM users WHERE id = $1', [userId]);
        return res.rows[0] || null;
    } catch (err) {
        console.error('Error getting user:', err);
        return null;
    } finally {
        await client.end();
    }
}

// const userUpdate = await updateUser(user.id, "testuserUpdated");
// if (userUpdate) {
//     console.log('(OK) updateUser test:', userUpdate)
// } else {
//     console.log("(FAIL) error updating user");
//     return;
// }
export async function updateUser(userId: number, username: string): Promise<{ id: number; username: string } | null> {
    const client = new Client(dbConfig);
    try {
        await client.connect();
        const res = await client.query('UPDATE users SET username = $1 WHERE id = $2 RETURNING id, username', [username, userId]);
        return res.rows[0] || null;
    } catch (err) {
        console.error('Error updating user:', err);
        return null;
    } finally {
        await client.end();
    }
}

// const deleteUserTest = await deleteUser(user.id)
// if (deleteUserTest) {
//     console.log("(OK) User delete test:", deleteUserTest)
// } else {
//     console.log("(FAIL) error deleting user")
//     return;
// }
export async function deleteUser(userId: number): Promise<boolean> {
    const client = new Client(dbConfig);
    try {
        await client.connect();
        await client.query('DELETE FROM users WHERE id = $1', [userId]);
        return true;
    } catch (err) {
        console.error('Error deleting user:', err);
        return false;
    } finally {
        await client.end();
    }
}

// const listAllUsers = await listUsers()
// if (listAllUsers) {
//     console.log('(OK) listAllUsers test:', listAllUsers)
// } else {
//     console.log('(FAIL) error listing all users')
// }
export async function listUsers(): Promise<{ id: number; username: string }[]> {
    const client = new Client(dbConfig);
    try {
        await client.connect();
        const res = await client.query('SELECT id, username FROM users');
        return res.rows;
    } catch (err) {
        console.error('Error listing users:', err);
        return [];
    } finally {
        await client.end();
    }
}

// const newGame1 = await createGameState(user.id)
// if (newGame1) {
//     console.log('(OK) createGameState test:', newGame1)
// } else {
//     console.log("(FAIL) error creating gameState");
//     return;
// }
export async function createGameState(userId: number, initialGameState?: GameState): Promise<{ id: number; messages: Message[]; current_scene: string | null; state: GAME_STATES; user_prefs: UserPrefs; image_cache: { [key: string]: string }; inventory: InventoryItem[] } | null> {
    const client = new Client(dbConfig);
    const gameState = initialGameState ? initialGameState : defaultGameState
    try {
        await client.connect();
        const res = await client.query(
            'INSERT INTO gamestate (messages, current_scene, state, user_prefs, image_cache, inventory) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, messages, current_scene, state, user_prefs, image_cache, inventory',
            [
                gameState.messages,
                gameState.current_scene,
                gameState.state,
                gameState.user_prefs,
                gameState.image_cache,
                gameState.inventory,
            ]
        );
        const gameStateId = res.rows[0].id;
        await client.query('INSERT INTO user_games (user_id, game_id) VALUES ($1, $2)', [userId, gameStateId])
        return {
            ...res.rows[0],
            messages: res.rows[0].messages,
            user_prefs: res.rows[0].user_prefs,
            image_cache: res.rows[0].image_cache,
            inventory: res.rows[0].inventory,
        }
    } catch (err) {
        console.error('Error creating game state:', err);
        return null;
    } finally {
        await client.end();
    }
}

// const game1 = await getGameState(newGame1.id)
// if (game1) {
//     console.log('(OK) getGameState test:', game1)
// } else {
//     console.log("(FAIL) error getting gameState");
//     return;
// }
export async function getGameState(gameId: number): Promise<{ id: number; messages: Message[]; current_scene: string | null; state: GAME_STATES; user_prefs: UserPrefs; image_cache: { [key: string]: string }; inventory: InventoryItem[] } | null> {
    const client = new Client(dbConfig);
    try {
        await client.connect();
        const res = await client.query('SELECT id, messages, current_scene, state, user_prefs, image_cache, inventory FROM gamestate WHERE id = $1', [gameId]);
        if (!res.rows[0]) return null
        return {
            ...res.rows[0],
            messages: res.rows[0].messages,
            user_prefs: res.rows[0].user_prefs,
            image_cache: res.rows[0].image_cache,
            inventory: res.rows[0].inventory,
        }
    } catch (err) {
        console.error('Error getting game state:', err);
        return null;
    } finally {
        await client.end();
    }
}

// const updatedGame = await updateGameState(newGame1.id, {
//     state: GAME_STATES.PLAYING
// })
// if (updatedGame) {
//     console.log('(OK) updateGameState test:', updatedGame)
// } else {
//     console.log("(FAIL) error updating gameState");
//     return;
// }
export async function updateGameState(gameId: number, gameStateUpdate: Partial<GameState>): Promise<{ id: number; messages: Message[]; current_scene: string | null; state: GAME_STATES; user_prefs: UserPrefs; image_cache: { [key: string]: string }; inventory: InventoryItem[] } | null> {
    const client = new Client(dbConfig);
    try {
        await client.connect();
        const gameState = await getGameState(gameId);
        if (!gameState) {
            return null
        }
        const updatedGameState = { ...gameState, ...gameStateUpdate }
        const res = await client.query(
            'UPDATE gamestate SET messages = $1, current_scene = $2, state = $3, user_prefs = $4, image_cache = $5, inventory = $6 WHERE id = $7 RETURNING id, messages, current_scene, state, user_prefs, image_cache, inventory',
            [
                updatedGameState.messages,
                updatedGameState.current_scene,
                updatedGameState.state,
                updatedGameState.user_prefs,
                updatedGameState.image_cache,
                updatedGameState.inventory,
                gameId
            ]
        );
        return {
            ...res.rows[0],
            messages: res.rows[0].messages,
            user_prefs: res.rows[0].user_prefs,
            image_cache: res.rows[0].image_cache,
            inventory: res.rows[0].inventory,
        }
    } catch (err) {
        console.error('Error updating game state:', err);
        return null;
    } finally {
        await client.end();
    }
}

// const resetGame = await resetGameState(newGame1.id)
// if (resetGame) {
//     console.log('(OK) resetGameState test:', resetGame)
// } else {
//     console.log("(FAIL) error reseting gameState");
//     return;
// }
export async function resetGameState(gameId: number): Promise<{ id: number; messages: Message[]; current_scene: string | null; state: GAME_STATES; user_prefs: UserPrefs; image_cache: { [key: string]: string }; inventory: InventoryItem[] } | null> {
    return updateGameState(gameId, defaultGameState);
}

// const deleteGameTest = await deleteGameState(newGame3.id)
// if (deleteGameTest) {
//     console.log("(OK) Game delete test:", deleteGameTest)
// } else {
//     console.log("(FAIL) error deleting game")
//     return;
// }
export async function deleteGameState(gameId: number): Promise<boolean> {
    const client = new Client(dbConfig);
    try {
        await client.connect();
        await client.query('DELETE FROM gamestate WHERE id = $1', [gameId]);
        return true;
    } catch (err) {
        console.error('Error deleting game state:', err);
        return false;
    } finally {
        await client.end();
    }
}

// const listAllGames = await listGames()
// if (listAllGames) {
//     console.log('(OK) listAllGames test:', listAllGames)
// } else {
//     console.log('(FAIL) error listing all games')
//     return;
// }
export async function listGames(): Promise<{ id: number; messages: Message[]; current_scene: string | null; state: GAME_STATES; user_prefs: UserPrefs; image_cache: { [key: string]: string }; inventory: InventoryItem[] }[]> {
    const client = new Client(dbConfig);
    try {
        await client.connect();
        const res = await client.query('SELECT id, messages, current_scene, state, user_prefs, image_cache, inventory FROM gamestate');
        return res.rows.map(row => ({
            ...row,
            messages: row.messages,
            user_prefs: row.user_prefs,
            image_cache: row.image_cache,
            inventory: row.inventory,
        }));
    } catch (err) {
        console.error('Error listing game states:', err);
        return [];
    } finally {
        await client.end();
    }
}

// const addUsertoGame = await addUserToGame(user2.id, newGame1.id)
// if (addUsertoGame) {
//     console.log("(OK) User add to Game test:", addUsertoGame)
// } else {
//     console.log("(FAIL) error adding user to game")
//     return;
// }
export async function addUserToGame(userId: number, gameId: number): Promise<boolean> {
    const client = new Client(dbConfig);
    try {
        await client.connect();
        await client.query('INSERT INTO user_games (user_id, game_id) VALUES ($1, $2)', [userId, gameId]);
        return true;
    } catch (err) {
        console.error('Error adding user to game:', err);
        return false;
    } finally {
        await client.end();
    }
}

// const removeUserfromGame = await removeUserFromGame(user2.id, newGame1.id)
// if (removeUserfromGame) {
//     console.log("(OK) User remove from game test:", removeUserfromGame)
// } else {
//     console.log("(FAIL) error removing user from game")
//     return;
// }
export async function removeUserFromGame(userId: number, gameId: number): Promise<boolean> {
    const client = new Client(dbConfig);
    try {
        await client.connect();
        await client.query('DELETE FROM user_games WHERE user_id = $1 AND game_id = $2', [userId, gameId]);
        return true;
    } catch (err) {
        console.error('Error removing user from game:', err);
        return false;
    } finally {
        await client.end();
    }
}

// const listGamesTest = await listUserGames(user.id)
// if (listGamesTest) {
//     console.log('(OK) listUserGames test:', listGamesTest)
// } else {
//     console.log('(FAIL) error listing user games')
//     return;
// }
export async function listUserGames(userId: number): Promise<{ id: number; messages: Message[]; current_scene: string | null; state: GAME_STATES; user_prefs: UserPrefs; image_cache: { [key: string]: string }; inventory: InventoryItem[] }[]> {
    const client = new Client(dbConfig);
    try {
        await client.connect();
        const res = await client.query(`
            SELECT gs.id, gs.messages, gs.current_scene, gs.state, gs.user_prefs, gs.image_cache, gs.inventory
            FROM gamestate gs
            INNER JOIN user_games ug ON gs.id = ug.game_id
            WHERE ug.user_id = $1
        `, [userId]);
        return res.rows.map(row => ({
            ...row,
            messages: row.messages,
            user_prefs: row.user_prefs,
            image_cache: row.image_cache,
            inventory: row.inventory,
        }));
    } catch (err) {
        console.error('Error listing user game states:', err);
        return [];
    } finally {
        await client.end();
    }
}

/*
You have access to the following functions for managing users and game states in a PostgreSQL database. All functions are asynchronous and return a Promise.

**User Functions:**

*   `createUser(username: string)`: Creates a new user with the given username. Returns an object with `id` and `username`, or `null` on failure.
*   `getUser(userId: number)`: Retrieves a user by their ID. Returns an object with `id` and `username`, or `null` if not found.
*   `updateUser(userId: number, username: string)`: Updates a user's username. Returns an object with `id` and `username`, or `null` if not found.
*   `deleteUser(userId: number)`: Deletes a user by their ID. Returns `true` on success, `false` on failure.
*   `listUsers()`: Returns an array of all users, each with `id` and `username`.

**Game State Functions:**

*   `createGameState(userId: number, initialGameState?: GameState)`: Creates a new game state for a user. Optionally takes an `initialGameState` object. Returns a game state object with `id`, `messages`, `current_scene`, `state`, `user_prefs`, `image_cache`, and `inventory`, or `null` on failure.
*   `getGameState(gameId: number)`: Retrieves a game state by its ID. Returns a game state object or `null` if not found.
*   `updateGameState(gameId: number, gameStateUpdate: Partial<GameState>)`: Updates a game state. Takes a `gameStateUpdate` object with partial updates. Returns the updated game state object or `null` if not found.
*   `resetGameState(gameId: number)`: Resets a game state to its default values. Returns the reset game state object or `null` if not found.
*   `deleteGameState(gameId: number)`: Deletes a game state by its ID. Returns `true` on success, `false` on failure.
*   `listGames()`: Returns an array of all game states.
*   `addUserToGame(userId: number, gameId: number)`: Adds a user to a game. Returns `true` on success, `false` on failure.
*   `removeUserFromGame(userId: number, gameId: number)`: Removes a user from a game. Returns `true` on success, `false` on failure.
*   `listUserGames(userId: number)`: Returns an array of game states associated with a user.

**Data Types:**

*   `GAME_STATES`: An enum with possible game states.
*   `GameState`: An object with properties like `messages` (array of message objects), `current_scene` (string or null), `state` (enum `GAME_STATES`), `user_prefs` (object), `image_cache` (object), and `inventory` (array).
*   `Message`: An object with `role` and `content` properties.
*   `UserPrefs`: An object with `name`, `theme`, and `art_style` properties.
*   `InventoryItem`: An object representing an item in the inventory.

**Usage:**

Call these functions using `await` within an `async` function. For example: `const user = await createUser("testuser");`

Remember to handle potential `null` returns and errors.
*/