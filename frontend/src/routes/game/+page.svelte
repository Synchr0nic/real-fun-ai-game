<script lang="ts">
	import store from "$lib/store";
	const { musicid, musicvol, isPlaying } = store;
	// import { sendMessage } from "./gameLogic";
	import {
		muteVideo,
		pauseVideo,
		setVolume,
		startPlaying,
		stopVideo,
		unmuteVideo,
	} from "./musicPlayer";
	import CircleAlert from "lucide-svelte/icons/circle-alert";
	import Button from "flowbite-svelte/Button.svelte";
	import Checkbox from "flowbite-svelte/Checkbox.svelte";
	import Label from "flowbite-svelte/Label.svelte";
	import Input from "flowbite-svelte/Input.svelte";
	import { DarkMode } from "flowbite-svelte";
	let username = $state("");
	let password = $state("");
	let confirmPassword = $state("");
	let remember = $state(false);
	let mode = $state<"login" | "register">("login");
</script>

<svelte:head>
	<title>Play RFAG!</title>
	<!-- <title>Interactive Story Explorer</title> -->
	<meta name="description" content="Play RFAG Now! Invite Your Friends! 🌌" />
</svelte:head>

<div class="flex min-h-screen flex-col-reverse sm:flex-row">
	<div
		class="flex w-[100%] sm:w-[50%] sm:m-auto bg-[linear-gradient(90deg,#37ed4530,#ffffff)] dark:bg-[linear-gradient(90deg,#37ed4530,#1f2936)] min-h-screen"
		style="border-top-right-radius: 40px; border-bottom-right-radius: 40px;"
	>
		<div class="m-auto p-4">
			<h1 class="text-black dark:text-white text-5xl font-serif text-center m-auto">
				Welcome to RFAG
			</h1>
			<table
				class="min-w-full text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-800 mt-5"
				style="zoom: 0.8;"
			>
				<thead class="bg-gray-100 dark:bg-gray-700">
					<tr>
						<th
							class="px-2 py-1 font-medium text-gray-700 uppercase tracking-wider dark:text-gray-300"
						>
							Feature
						</th>
						<th
							class="px-2 py-1 font-medium text-gray-700 uppercase tracking-wider dark:text-gray-300"
						>
							Description
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 dark:divide-gray-700">
					<tr>
						<td
							class="px-2 py-1 whitespace-nowrap dark:text-gray-200"
							>🧑‍🤝‍🧑 Multiplayer/Singleplayer</td
						>
						<td class="px-2 py-1 dark:text-gray-200"
							>Play solo or with friends.</td
						>
					</tr>
					<tr>
						<td
							class="px-2 py-1 whitespace-nowrap dark:text-gray-200"
							>🎲 Turn-Based Gameplay</td
						>
						<td class="px-2 py-1 dark:text-gray-200"
							>Strategic and thoughtful combat and exploration.</td
						>
					</tr>
					<tr>
						<td
							class="px-2 py-1 whitespace-nowrap dark:text-gray-200"
							>🌍 Dynamic World</td
						>
						<td class="px-2 py-1 dark:text-gray-200"
							>Your choices directly impact the game world.</td
						>
					</tr>
					<tr>
						<td
							class="px-2 py-1 whitespace-nowrap dark:text-gray-200"
							>🖼️ AI-Generated Visuals</td
						>
						<td class="px-2 py-1 dark:text-gray-200"
							>Experience a unique and ever-changing visual
							landscape.</td
						>
					</tr>
					<tr>
						<td
							class="px-2 py-1 whitespace-nowrap dark:text-gray-200"
							>🎒 Full Inventory System</td
						>
						<td class="px-2 py-1 dark:text-gray-200"
							>Collect and manage items to aid your journey.</td
						>
					</tr>
					<tr>
						<td
							class="px-2 py-1 whitespace-nowrap dark:text-gray-200"
							>📊 User Stats</td
						>
						<td class="px-2 py-1 dark:text-gray-200"
							>Track your progress and character development.</td
						>
					</tr>
					<tr>
						<td
							class="px-2 py-1 whitespace-nowrap dark:text-gray-200"
							>☀️🌙 Real-Time Day/Night Cycles</td
						>
						<td class="px-2 py-1 dark:text-gray-200"
							>Experience the world changing around you.</td
						>
					</tr>
					<tr>
						<td
							class="px-2 py-1 whitespace-nowrap dark:text-gray-200"
							>⚠️ Random Dangers</td
						>
						<td class="px-2 py-1 dark:text-gray-200"
							>Be prepared for unexpected events and challenges.</td
						>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
	<div
		class="flex sm:w-[50%] items-center m-auto p-6 space-y-4 md:space-y-6 sm:p-2 justify-center bg-bg-gray-100 dark:bg-gray-800 min-h-screen"
	>
		<form class="flex flex-col space-y-6" style="width: 100%; max-width: 400px;" action="/">
			<div class="flex justify-between">
				<h3
					class="flex h-fit m-auto ml-0 text-xl font-medium text-gray-900 dark:text-white p-0"
				>
					{mode === "login"
						? "Login to your account"
						: "Register a new account"}
				</h3>
				<DarkMode
					class="text-primary-500 dark:text-primary-600 border dark:border-gray-800 m-auto mr-0"
				/>
			</div>
			<Label class="space-y-2">
				<span
					>{mode === "login"
						? "Your username"
						: "Choose a username"}</span
				>
				<Input
					type="text"
					name="username"
					placeholder="Enter your username..."
					required
					bind:value={username}
				/>
			</Label>
			<Label class="space-y-2">
				<span
					>{mode === "login"
						? "Your password"
						: "Choose a password"}</span
				>
				<Input
					type="password"
					name="password"
					placeholder="•••••"
					required
					bind:value={password}
				/>
			</Label>
			{#if mode === "register"}
				<Label class="space-y-2">
					<span>Confirm your password</span>
					<Input
						type="password"
						name="confirm-password"
						placeholder="•••••"
						required
						bind:value={confirmPassword}
					/>
				</Label>
			{/if}
			<div class="flex items-start">
				<Checkbox bind:checked={remember} class="select-none"
					>Remember me</Checkbox
				>
				{#if mode === "login"}
					<div
						onclick={(e) => {
							alert(
								"Sorry... You should've kept it somewhere safe... xD",
							);
						}}
						onkeypress={(e) => {
							if (e.key === "Enter") {
								alert(
									"Sorry... You should've kept it somewhere safe... xD",
								);
							}
						}}
						role="button"
						tabindex="0"
						class="ml-auto text-sm text-blue-700 hover:underline dark:text-blue-500 border-none outline-none cursor-pointer"
					>
						Forgot password?
					</div>
				{/if}
			</div>
			<Button type="submit" class="w-full1"
				>{mode === "login" ? "Sign in" : "Sign up"}</Button
			>
			<p class="text-sm font-light text-gray-500 dark:text-gray-400">
				{mode === "login"
					? "Don't have an account yet?"
					: "Already have an account?"}
				<span
					onclick={() => {
						if (mode === "login") {
							mode = "register";
						} else {
							mode = "login";
						}
					}}
					onkeypress={(e) => {
						if (e.key === "Enter") {
							if (mode === "login") {
								mode = "register";
							} else {
								mode = "login";
							}
						}
					}}
					role="button"
					tabindex="0"
					class="font-medium text-primary-600 hover:underline dark:text-primary-500 cursor-pointer"
					>{mode === "login" ? "Sign up" : "Sign in"}</span
				>
			</p>
		</form>
	</div>
</div>

<main>
	<div class="container">
		<div
			class="inventory-container"
			style="width:20%; height: auto; border: 2px solid #fff; padding: 10px; margin-right: 10px;"
		>
			<CircleAlert color="#ff3e98" />
			<h3>Inventory</h3>
			<ul id="inventory-list"></ul>
		</div>
		<div style="width: 80%">
			<div class="image-container">
				<img
					id="game-image"
					class="game-image"
					style="display: none;"
					alt="Game Scene"
				/>
				<div id="image-loading" class="image-loading">
					Awaiting your first move...
				</div>
			</div>
			<div class="chat-container">
				<div id="chat-messages" class="chat-messages">
					<div class="message assistant">
						<div class="message-content">
							What's your name, brave explorer?
						</div>
					</div>
				</div>
				<div class="options-container" id="options-container"></div>
				<div class="input-container">
					<select id="action-select">
						<option value="">Select Action</option>
						<option value="acquire">Acquire</option>
						<option value="use">Use</option>
						<option value="consume">Consume</option>
						<option value="attack">Attack</option>
						<option value="ability">Ability</option>
					</select>
					<input
						type="text"
						id="user-input"
						placeholder="Write your own response..."
						maxlength="100"
						onkeypress={(event) => {
							// if (event.key === "Enter") sendMessage();
						}}
					/>
					<!-- <button onclick={() => sendMessage()}>Send</button> -->
				</div>
			</div>
		</div>
	</div>

	<div id="music" class="flex m-auto gap-3 w-fit">
		{#if $isPlaying}
			<input
				type="range"
				id="musicvol"
				bind:value={$musicvol}
				oninput={() => setVolume()}
			/>
			<button onclick={() => stopVideo()}>Stop</button>
			<button onclick={() => pauseVideo()}>Pause</button>
			<button onclick={() => muteVideo()}>Mute</button>
			<button onclick={() => unmuteVideo()}>Unmute</button>
		{:else}
			<button onclick={() => startPlaying()}>Play</button>
		{/if}
		<select
			onchange={(event) => {
				store.musicid.set((event.target as HTMLSelectElement).value);
				startPlaying();
			}}
		>
			<option value="uxf1FUU8mk0">Desert</option>
			<option value="K4Ad2MXKLv8">RPG</option>
			<option value="mJbQDVCgn84">Mars</option>
			<option value="Nd7e4SNjGBM">Forest</option>
		</select>
	</div>

	<div id="player" style="display: none;"></div>
</main>

<input type="text" id="musicid" bind:value={$musicid} hidden />

<style>
	main {
		margin: 0;
		padding: 20px;
		font-family: "Courier New", monospace;
		background-color: #000;
		color: #fff;
		line-height: 1.4;
		min-height: 100vh;
	}

	.container {
		max-width: 1024px;
		margin: 0 auto;
		padding: 0 10px;
		font-family: "Courier New", monospace;
		display: flex;
	}

	.image-container {
		width: 100%;
		height: 512px;
		margin: 20px auto;
		background-color: #000;
		border: 2px solid #fff;
		border-radius: 0;
		overflow: hidden;
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
		box-shadow: none;
		font-family: "Courier New", monospace;
	}

	.game-image {
		width: 100%;
		height: 100%;
		object-fit: contain;
		image-rendering: -webkit-optimize-contrast;
		image-rendering: crisp-edges;
		opacity: 0.8;
	}

	.image-loading {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: #fff;
		font-size: 1.2em;
		text-align: center;
		width: 80%;
		font-family: "Courier New", monospace;
	}

	.chat-container {
		width: 100%;
		margin: 20px auto;
		height: 300px;
		overflow-y: auto;
		background-color: #000;
		border: 2px solid #fff;
		border-radius: 0;
		padding: 15px;
		box-sizing: border-box;
		font-family: "Courier New", monospace;
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	.chat-container::-webkit-scrollbar {
		display: none;
	}

	.message {
		margin-bottom: 10px;
	}

	.message-content {
		padding: 10px;
		border-radius: 0;
		word-wrap: break-word;
		font-family: "Courier New", monospace;
	}

	:global(.user) {
		text-align: right;
	}

	:global(.user) .message-content {
		padding: 10px;
		margin: 5px 0;
		border-radius: 0;
		word-wrap: break-word;
		font-family: "Courier New", monospace;
		background-color: transparent;
	}

	.assistant {
		text-align: left;
	}

	.assistant .message-content {
		padding: 10px;
		margin: 5px 0;
		border-radius: 0;
		border-left: 3px solid #fff;
		word-wrap: break-word;
		background-color: transparent;
		font-family: "Courier New", monospace;
	}

	.input-container {
		width: 100%;
		margin: 20px auto;
		display: flex;
		gap: 10px;
		box-sizing: border-box;
		font-family: "Courier New", monospace;
	}

	input[type="text"] {
		flex: 1;
		padding: 12px;
		border: 2px solid #fff;
		border-radius: 0;
		background-color: #000;
		color: #fff;
		font-size: 16px;
		font-family: "Courier New", monospace;
	}

	select {
		padding: 12px;
		border: 2px solid #fff;
		border-radius: 0;
		background-color: #000;
		color: #fff;
		font-size: 16px;
		font-family: "Courier New", monospace;
		width: 180px;
	}

	button {
		padding: 12px 24px;
		border: 2px solid #fff;
		border-radius: 0;
		background-color: transparent;
		color: #fff;
		cursor: pointer;
		font-size: 16px;
		white-space: nowrap;
		font-family: "Courier New", monospace;
	}

	button:hover {
		background-color: #555;
		font-family: "Courier New", monospace;
	}

	.options-container {
		margin-top: 10px;
		display: flex;
		flex-direction: column;
		font-family: "Courier New", monospace;
	}

	@media (max-width: 600px) {
		:global(body) {
			padding: 10px;
		}

		.container {
			padding: 0 5px;
			flex-direction: column;
		}

		.image-container {
			height: 300px;
		}

		.chat-container {
			height: 250px;
		}

		.input-container {
			flex-direction: column;
			gap: 5px;
		}

		button {
			width: 100%;
		}

		:global(.user) .message-content,
		.assistant .message-content {
			margin-left: 0;
			margin-right: 0;
		}

		.inventory-container {
			width: auto;
			margin-right: 0px;
		}
	}
</style>
