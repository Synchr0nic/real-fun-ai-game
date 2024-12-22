<script>
	import Header from "../Header.svelte";
</script>

<svelte:head>
	<title>RFAG - Account</title>
	<meta name="description" content="RFAG - Manage your account" />
	<link rel="stylesheet" href="css/home.css">
</svelte:head>

<div class="app">
	<Header />
	<main class="py-8 px-4 max-w-4xl mx-auto">
		<div class="text-column">
			<h1>RFAG - Manage your account</h1>

			<p>
				This is a <a href="https://svelte.dev/docs/kit">SvelteKit</a> app.
				You can make your own by typing the following into your command line
				and following the prompts:
			</p>

			<pre>npx sv create</pre>

			<p>
				The page you're looking at is purely static HTML, with no
				client-side interactivity needed. Because of that, we don't need
				to load any JavaScript. Try viewing the page's source, or
				opening the devtools network panel and reloading.
			</p>

			<p>
				The <a href="/sverdle">Sverdle</a> page illustrates SvelteKit's data
				loading and form handling. Try using it with JavaScript disabled!
			</p>
		</div>
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
