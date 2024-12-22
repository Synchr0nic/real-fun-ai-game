<script lang="ts">
	import welcome from "$lib/images/svelte-welcome.webp";
	import welcomeFallback from "$lib/images/svelte-welcome.png";
	import { confetti } from "@neoconfetti/svelte";
	import { reducedMotion } from "$lib/utils/reduced-motion";
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";
	import Header from "./Header.svelte";

	let shouldShowConfetti = $state(false);
	if (browser) {
		if (!localStorage.getItem("confetti")) shouldShowConfetti = true;
		localStorage.setItem("confetti", "true");
	}

	function handleClick() {
		goto("/game");
	}
</script>

<svelte:head>
	<title>RFAG</title>
	<meta name="description" content="A Real Fun AI Game" />
</svelte:head>

{#if shouldShowConfetti}
	<div
		class="fixed left-0 top-0 overflow-hidden w-screen h-screen pointer-events-none"
	>
		<div
			class="relative left-1/2 top-[30%]"
			use:confetti={{
				particleCount: $reducedMotion ? 0 : undefined,
				force: 0.7,
				stageWidth: window.innerWidth,
				stageHeight: window.innerHeight,
				colors: ["#ff3e00", "#40b3ff", "#676778"],
			}}
		></div>
	</div>
{/if}

<div class="app">
	<Header />
	<main class="py-8 px-4 max-w-4xl mx-auto">
		<section class="text-center mb-12">
			<div class="mb-8">
				<h1 class="text-4xl font-bold mb-4">
					<div class="flex items-center justify-center">
						<span class="text-xl font-semibold text-gray-700 mr-4"
							>Click me</span
						>
						<span
							class="inline-block w-full max-w-xs mb-4"
							style="filter: invert(0.7);"
						>
							<picture>
								<source srcset={welcome} type="image/webp" />
								<img
									src={welcomeFallback}
									alt="Welcome"
									draggable="false"
									class="w-full"
								/>
							</picture>
						</span>
						<span class="text-xl font-semibold text-gray-700 ml-4"
							>to start playing</span
						>
					</div>
					<span class="block text-2xl">TO A REAL FUN AI GAME</span>
				</h1>
				<h2 class="text-lg text-gray-600 leading-relaxed">
					RFAG is a unique RPG experience that blends traditional
					turn-based gameplay with dynamic AI-generated visuals.
					Explore a world shaped by your decisions, manage your
					inventory and stats, and navigate a world with real-time
					day/night cycles ☀️🌙. Be prepared for unexpected dangers
					that can randomly occur, adding an element of surprise to
					your adventures ⚠️.
				</h2>
			</div>
			<h3 class="text-xl font-semibold mb-2">About RFAG 📖</h3>
			<p class="text-gray-700 mb-4">
				RFAG (real-fun-ai-game): A multiplayer/singleplayer turn-based
				RPG where your choices shape a dynamic world. Experience
				adventures with AI-generated visuals, a full inventory system,
				user stats, real-time day/night cycles, and unexpected dangers
				that can randomly occur.
			</p>
			<button
				class="mt-4 flex items-center justify-center m-auto relative group"
				onclick={handleClick}
			>
				<span
					class="text-xl font-semibold text-gray-700 mr-4 relative glow-text"
					>Click me</span
				>
				<img
					class="max-w-xs mx-auto"
					src="https://github.com/user-attachments/assets/a25daad5-649d-42ac-8e22-d986021f30d3"
					alt="logo"
				/>
				<span
					class="text-xl font-semibold text-gray-700 ml-4 relative glow-text"
					>to start playing</span
				>
			</button>
		</section>

		<section class="mb-8">
			<h3 class="text-2xl font-semibold mb-4">Features ✨</h3>
			<div class="overflow-x-auto">
				<table class="min-w-full bg-white border border-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Feature
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Description
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200">
						<tr>
							<td class="px-6 py-4 whitespace-nowrap"
								>🧑‍🤝‍🧑 Multiplayer/Singleplayer</td
							>
							<td class="px-6 py-4">Play solo or with friends.</td
							>
						</tr>
						<tr>
							<td class="px-6 py-4 whitespace-nowrap"
								>🎲 Turn-Based Gameplay</td
							>
							<td class="px-6 py-4"
								>Strategic and thoughtful combat and
								exploration.</td
							>
						</tr>
						<tr>
							<td class="px-6 py-4 whitespace-nowrap"
								>🌍 Dynamic World</td
							>
							<td class="px-6 py-4"
								>Your choices directly impact the game world.</td
							>
						</tr>
						<tr>
							<td class="px-6 py-4 whitespace-nowrap"
								>🖼️ AI-Generated Visuals</td
							>
							<td class="px-6 py-4">
								Experience a unique and ever-changing visual
								landscape.
							</td>
						</tr>
						<tr>
							<td class="px-6 py-4 whitespace-nowrap"
								>🎒 Full Inventory System</td
							>
							<td class="px-6 py-4"
								>Collect and manage items to aid your journey.</td
							>
						</tr>
						<tr>
							<td class="px-6 py-4 whitespace-nowrap"
								>📊 User Stats</td
							>
							<td class="px-6 py-4"
								>Track your progress and character development.</td
							>
						</tr>
						<tr>
							<td class="px-6 py-4 whitespace-nowrap"
								>☀️🌙 Real-Time Day/Night Cycles</td
							>
							<td class="px-6 py-4"
								>Experience the world changing around you.</td
							>
						</tr>
						<tr>
							<td class="px-6 py-4 whitespace-nowrap"
								>⚠️ Random Dangers</td
							>
							<td class="px-6 py-4"
								>Be prepared for unexpected events and
								challenges.</td
							>
						</tr>
					</tbody>
				</table>
			</div>
		</section>
	</main>
	<footer>
		<p>
			Contact 📧 For questions or feedback, please submit an <a
				href="https://github.com/Synchr0nic/real-fun-ai-game/issues"
				>issue</a
			>.
		</p>
	</footer>
</div>

<style>
	h1,
	h2,
	p {
		font-weight: 400;
	}

	p {
		line-height: 1.5;
	}

	a {
		color: var(--color-theme-1);
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}

	h1 {
		font-size: 2rem;
		text-align: center;
	}

	h2 {
		font-size: 1rem;
	}

	button:focus:not(:focus-visible) {
		outline: none;
	}

	@media (min-width: 720px) {
		h1 {
			font-size: 2.4rem;
		}
	}

	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
	.glow-text {
		color: white;
		text-shadow:
			0 0 5px #40b3ff,
			0 0 10px #40b3ff,
			0 0 15px #40b3ff;
		transition: text-shadow 0.3s ease-in-out;
	}

	.group:hover .glow-text {
		text-shadow:
			0 0 8px #40b3ff,
			0 0 16px #40b3ff,
			0 0 24px #40b3ff;
	}
</style>
