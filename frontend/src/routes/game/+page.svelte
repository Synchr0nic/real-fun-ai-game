<script lang="ts">
	import './game.css';
	import './musicPlayer.css';
</script>

<svelte:head>
	<title>Play RFAG!</title>
	<!-- <title>Interactive Story Explorer</title> -->
	<meta name="description" content="Play RFAG Now! Invite Your Friends! 🌌" />
</svelte:head>

<div class="container">
	<div
		class="inventory-container"
		style="width:20%; height: auto; border: 2px solid #fff; padding: 10px; margin-right: 10px;"
	>
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
				/>
				<button onclick={() => sendMessage()}>Send</button>
			</div>
		</div>
	</div>
</div>

<!-- <div id="player"></div>
<input type="range" id="musicvol" value="50" oninput="musicPlayer.setVolume(this.value);" />
<button onclick="startPlaying();">Play</button>
<button onclick="stopVideo();">Stop</button>
<button onclick="pauseVideo();">Pause</button>
<button onclick="muteVideo();">Mute</button>
<button onclick="unmuteVideo();">Unmute</button>
<button onclick="document.getElementById('musicid').value='uxf1FUU8mk0';startPlaying();">Switch Desert</button>
<button onclick="document.getElementById('musicid').value='K4Ad2MXKLv8';startPlaying();">Switch RPG</button>
<button onclick="document.getElementById('musicid').value='mJbQDVCgn84';startPlaying();">Switch Mars</button>
<button onclick="document.getElementById('musicid').value='Nd7e4SNjGBM';startPlaying();">Switch Forest</button>
<input type="text" id="musicid" value="" />
<select id="qualities" onchange="musicPlayer.setPlaybackQuality(this.value);console.log('Setting quality to ' + this.value);"></select> -->
