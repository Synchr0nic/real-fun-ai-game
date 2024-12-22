let musicPlayer;
let currentVideoID = "";
let isPlaying = false;
const DEBUG_MUSIC_PLAYER = false;
function startPlaying() {
    if (DEBUG_MUSIC_PLAYER) console.log("You selected to start playing music...")
    if (musicPlayer) {
        const videoID = document.getElementById('musicid').value;
        const isNewVideo = currentVideoID !== videoID;
        if (DEBUG_MUSIC_PLAYER) console.log("isNewVideo?", isNewVideo)
        currentVideoID = videoID;
        if (DEBUG_MUSIC_PLAYER) console.log("Music player already loaded...")
        if (isNewVideo) {
            if (DEBUG_MUSIC_PLAYER) console.log("Loading New Video", videoID)
            musicPlayer.loadVideoById(videoID);
        }
        if (isPlaying) {
            if (DEBUG_MUSIC_PLAYER) console.log("Already playing");
        } else {
            if (DEBUG_MUSIC_PLAYER) console.log("Playing...");
            if (musicPlayer.getPlayerState() !== YT.PlayerState.PLAYING) musicPlayer.playVideo();
            if (musicPlayer.isMuted()) musicPlayer.unMute();
        }
        return
    }
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}
function onYouTubeIframeAPIReady() {
    if (DEBUG_MUSIC_PLAYER) console.log("YouTube is ready...")
    const videoID = document.getElementById('musicid').value;
    if (DEBUG_MUSIC_PLAYER) console.log("Loading", videoID)
    currentVideoID = videoID;
    musicPlayer = new YT.Player('player', {
        videoId: videoID,
        playerVars: {
            width: '1920',
            height: '1080',
            'autoplay': 1,
            'rel': 0,
            'showinfo': 0,
            'modestbranding': 1,
            'playsinline': 1,
            'showinfo': 0,
            'cc_load_policy': 1,
            'rel': 0,
            'controls': 0,
            'color': 'white',
            'loop': 1,
            'mute': 0,
            'origin': location.origin
        },
        events: {
            'onReady': () => {
                onPlayerReady();
            },
            'onStateChange': onPlayerStateChange
        }
    });
}
function onPlayerReady() {
    if (DEBUG_MUSIC_PLAYER) console.log("Just Started playing...")
    isPlaying = true;
    musicPlayer.playVideo();
    musicPlayer.unMute();
    musicPlayer.setVolume(musicPlayer.setVolume(document.getElementById('musicvol').value));
    createVideoQualities();
    const playbackQuality = musicPlayer.getPlaybackQuality();
    const suggestedQuality = document.getElementById('qualities').value;
    if (DEBUG_MUSIC_PLAYER) console.log("Quality: " + playbackQuality);
    if (playbackQuality !== suggestedQuality) {
        if (DEBUG_MUSIC_PLAYER) console.log("Setting quality to " + suggestedQuality);
        musicPlayer.setPlaybackQuality(suggestedQuality);
    }
}
function onPlayerStateChange(event) {
    isPlaying = event.data == YT.PlayerState.PLAYING
    if (isPlaying) {
        const videoData = musicPlayer.getVideoData();
        console.log(videoData.title + ' by ' + videoData.author + ' (' + videoData.video_id + ')')
    }
    if (DEBUG_MUSIC_PLAYER) console.log("Music Player state changed isPlaying?", isPlaying, event,
        event.data == YT.PlayerState.UNSTARTED ? 'UNSTARTED' :  // -1
            event.data == YT.PlayerState.ENDED ? 'ENDED' :  // 0
                event.data == YT.PlayerState.PLAYING ? 'PLAYING' :  // 1
                    event.data == YT.PlayerState.PAUSED ? 'PAUSED' :  // 2
                        event.data == YT.PlayerState.BUFFERING ? 'BUFFERING' :  // 3
                            event.data == YT.PlayerState.CUED ? 'CUED' : 'Unknown' // 5
    )
}
function stopVideo() {
    if (!musicPlayer) return;
    if (isPlaying) {
        musicPlayer.stopVideo();
        isPlaying = false;
    } else {
        if (DEBUG_MUSIC_PLAYER) console.log("Already stopped");
    }
}
function pauseVideo() {
    if (!musicPlayer) return;
    if (isPlaying) {
        musicPlayer.pauseVideo();
        isPlaying = false;
    } else {
        if (DEBUG_MUSIC_PLAYER) console.log("Already paused");
    }
}
function muteVideo() {
    if (!musicPlayer) return;
    musicPlayer.mute();
}
function unmuteVideo() {
    if (!musicPlayer) return;
    musicPlayer.unMute();
}
function createVideoQualities() {
    if (!musicPlayer) return;
    const qualitiesSelect = document.getElementById('qualities');
    qualitiesSelect.textContent = '';
    for (const quality of musicPlayer.getAvailableQualityLevels()) {
        const newOption = document.createElement('option');
        newOption.value = quality;
        newOption.textContent = quality;
        qualitiesSelect.append(newOption)
    }
}