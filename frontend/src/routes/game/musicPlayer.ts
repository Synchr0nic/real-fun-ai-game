import { browser } from "$app/environment";
import store from "$lib/store";

let musicPlayer: any;
let YTP: any;
let currentVideoID = "";
const DEBUG_MUSIC_PLAYER = false;

let isPlaying: boolean = false;
store.isPlaying.subscribe((value) => {
    isPlaying = value;
});

let musicid: string = '';
store.musicid.subscribe((value) => {
    musicid = value;
});

let musicvol: number = 50;
store.musicvol.subscribe((value) => {
    musicvol = value;
});

export function startPlaying() {
    store.isPlaying.set(true);
    if (DEBUG_MUSIC_PLAYER) console.log("You selected to start playing music...")
    if (musicPlayer) {
        const videoID = musicid;
        const isNewVideo = currentVideoID !== videoID;
        if (DEBUG_MUSIC_PLAYER) console.log("isNewVideo?", isNewVideo)
        currentVideoID = videoID;
        if (DEBUG_MUSIC_PLAYER) console.log("Music player already loaded...")
        if (isNewVideo) {
            if (DEBUG_MUSIC_PLAYER) console.log("Loading New Video", videoID)
            musicPlayer.loadVideoById(videoID);
        }
        if (isPlaying && DEBUG_MUSIC_PLAYER) console.log("Already playing");
        if (DEBUG_MUSIC_PLAYER) console.log("Playing...");
        if (musicPlayer.getPlayerState() !== YTP.PlayerState.PLAYING) musicPlayer.playVideo();
        if (musicPlayer.isMuted()) musicPlayer.unMute();
        return
    }
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    if (DEBUG_MUSIC_PLAYER) console.log("CREATED YOUTUBE FRAME")
}

export function onYouTubeIframeAPIReady() {
    if (DEBUG_MUSIC_PLAYER) console.log("YouTube is ready...")
    const videoID = musicid;
    if (DEBUG_MUSIC_PLAYER) console.log("Loading", videoID)
    currentVideoID = videoID;
    // @ts-ignore
    YTP = YT;
    musicPlayer = new YTP.Player('player', {
        videoId: videoID,
        playerVars: { // width: '1920', // height: '1080',
            'autoplay': 1,
            'rel': 0,
            'showinfo': 0,
            'modestbranding': 1,
            'playsinline': 1,
            'cc_load_policy': 1,
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

// @ts-ignore
if (browser) window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

export function onPlayerReady() {
    if (DEBUG_MUSIC_PLAYER) console.log("Just Started playing...")
    store.isPlaying.set(true);
    musicPlayer.playVideo();
    musicPlayer.unMute();
    musicPlayer.setVolume(musicPlayer.setVolume(musicvol));
}

export function onPlayerStateChange(event: any) {
    if (isPlaying) { // isPlaying = event.data == YTP.PlayerState.PLAYING; // store.isPlaying.set(event.data == YTP.PlayerState.PLAYING);
        const videoData = musicPlayer.getVideoData();
        if (DEBUG_MUSIC_PLAYER) console.log(videoData.title + ' by ' + videoData.author + ' (' + videoData.video_id + ')')
    }
    if (DEBUG_MUSIC_PLAYER) console.log("Music Player state changed isPlaying?", isPlaying, event,
        event.data == YTP.PlayerState.UNSTARTED ? 'UNSTARTED' :  // -1
            event.data == YTP.PlayerState.ENDED ? 'ENDED' :  // 0
                event.data == YTP.PlayerState.PLAYING ? 'PLAYING' :  // 1
                    event.data == YTP.PlayerState.PAUSED ? 'PAUSED' :  // 2
                        event.data == YTP.PlayerState.BUFFERING ? 'BUFFERING' :  // 3
                            event.data == YTP.PlayerState.CUED ? 'CUED' : 'Unknown' // 5
    )
}

export function stopVideo() {
    if (!musicPlayer) return;
    if (isPlaying) {
        musicPlayer.stopVideo();
        store.isPlaying.set(false);
        if (DEBUG_MUSIC_PLAYER) console.log("Stopped Playing");
    } else {
        if (DEBUG_MUSIC_PLAYER) console.log("Already stopped");
    }
}

export function pauseVideo() {
    if (!musicPlayer) return;
    if (isPlaying) {
        musicPlayer.pauseVideo();
        store.isPlaying.set(false);
    } else {
        if (DEBUG_MUSIC_PLAYER) console.log("Already paused");
    }
}

export function muteVideo() {
    if (!musicPlayer) return;
    musicPlayer.mute();
}

export function unmuteVideo() {
    if (!musicPlayer) return;
    musicPlayer.unMute();
}

export function setVolume() {
    if (!musicPlayer) return;
    musicPlayer.setVolume(musicvol)
}