const { createAudioPlayer, createAudioResource, AudioPlayerStatus} = require('@discordjs/voice');
const playdl = require('play-dl');
const { unlink } = require('fs');
const fuzzySearch = require('fuzzy-search');

const { connection } = require('./connection');
const { queueDisplay } = require('../display');

class Player {
	constructor() {
		this.player = createAudioPlayer();
		this.queue = [];

		this.songIndex = -1;
		this.currentSong = null;
		this.ttsFilePath = '';
		this.duration = 0;
        this.endStatus = 'No More Songs in Queue';
		this.settings = {
			loop: false,
		};

        // This client_id is not secret, but rather pulled straight off of a soundcloud webpage. See:
        // https://stackoverflow.com/questions/40992480/getting-a-soundcloud-api-client-id
        playdl.setToken({
            soundcloud : {
                client_id : "LN3SusIrooc6p3hLaU2ehltKb5u21R3b",
            }
        })

		this.player.on('error', (error) => {
			console.error('Error:', error.message);
		});

		this.player.on('stateChange', (oldState, newState) => {
			if (newState.status == 'playing' && oldState.status == 'buffering') {
                connection.sendMessage(`*Now Playing:*  **${this.currentSong.title}**\n${this.currentSong.url}`);
				console.log(`Audio player now playing: ${this.currentSong.title} | ${this.currentSong.type}`);
			}
			else {
				console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
			}
		});

		this.player.on(AudioPlayerStatus.Idle, () => {
			this.playNextSong();
			if (!this.isPlaying()) { this.endOfQueueEvent(); }
		});
	}

	// this is getting called twice when the last song is skipped -- I see
	//      no way to fix it as it is being called simultaneously by the
	//      eventlistener and /skip functions
	playNextSong() {
		if (this.isPlaying()) { this.currentSong.audio = null; }

		this.songIndex = Math.floor(this.songIndex + 1);
		if (this.songIndex < this.queue.length) {

			this.currentSong = this.queue[this.songIndex];
			this.playSong();
		}
		else if (this.settings.loop == true) {
			this.songIndex = -1;

			this.playNextSong();
		}
		else {
            this.player.stop();
            this.songIndex = -1;
            this.queue = [];
		}
	}

    playDifferentSong(songIndex) {
        this.currentSong.audio = null;
        this.currentSong = this.queue[songIndex];
        this.songIndex = songIndex
        this.playSong();
    }

    endQueue() {
        this.settings.loop = false;
        this.player.stop();
        this.songIndex = -1;
        this.queue = [];

        this.endStatus = 'Queue Manually Ended'
    }

	endOfQueueEvent() {
		if (this.ttsFilePath) {
			unlink(this.ttsFilePath, (err) => {
				if (err) {
					console.log('No TTS file to delete');
				}
				console.log('TTS file deleted');
			});
			this.ttsFilePath = '';
		}

        connection.sendMessage('**Queue Has Ended** — ' + this.endStatus);
        connection.unsubscribe()
        this.endStatus = 'No More Songs in Queue';

		const queueDisplayEmitter = queueDisplay.returnEmitter();
        queueDisplayEmitter.emit('queueDisplay');
        
	}
	async playSong() {

		// remakes stream if it has been deleted
        // TODO this will only work with youtube links
		if (this.currentSong.audio == null) {
			const stream = await playdl.stream(this.currentSong.url);
			const resource = createAudioResource(stream.stream, { inputType: stream.type });
			this.currentSong.audio = resource;
		}
		this.player.play(this.currentSong.audio);
	}

	playTTS(tts_file_path) {
		this.player.play(createAudioResource(tts_file_path));
		this.ttsFilePath = tts_file_path;
	}

	async addSong(source) {

        // TODO add catch if songs can't be loaded i.e. age restricted videos
        // TODO starting a url with "www" instead of "https" marks it as a search, not a yt_video
        const searchType = await playdl.validate(source);
        
        console.log(searchType);
        switch (searchType) {
            case 'search':
                return this.loadYoutubeVideo(source);
            case 'yt_video':
                return this.loadYoutubeVideo(source);
            case 'yt_playlist':
                return this.loadYoutubePlaylist(source);
            case 'so_track':
                return this.loadSoundCloudTrack(source);
            case 'so_playlist':
                return this.loadSoundCloudPlaylist(source);
            default:     
		        throw "Invalid Search";
        }
	}
	
	async loadYoutubeVideo(source) {
		const song = await playdl.search(source, { source: { youtube : 'video' }, limit: 1 });
        console.log(song[0].thumbnails);
        try {
		    const url = song[0].url;
            const title = song[0].title;
            const duration = song[0].durationInSec;
            
            if (connection.subscribe(this.player) instanceof Error) { throw 'No users in voice channel!'; }

            this.pushSongToQueue(title, url, "yt", duration);
            return title;
        }
        catch { throw `Invalid URL for source: ${source}`; }
	}

    async loadYoutubePlaylist(source) {
        let playlist;
        try {
            playlist = await playdl.playlist_info(source);
        }
        catch { throw `Invalid playlist: ${source}`; }
		for (const video of playlist.videos) {
            try {
                const url = video.url;
                const title = video.title;
                const duration = video.durationInSec;
                console.log(title);
        
                if (connection.subscribe(this.player) instanceof Error) { throw 'No users in voice channel!'; }
        
                this.pushSongToQueue(title, url, "yt", duration);
            }
            catch { throw `Invalid URL for source: ${video.url}`; }
        }

        return playlist.title;
    }

    async loadSoundCloudTrack(source) {
        const track = await playdl.soundcloud(source);
        console.log(track);
        try {
		    const url = track.permalink;
            const title = track.name;
            const duration = track.durationInSec;
            
            if (connection.subscribe(this.player) instanceof Error) { throw 'No users in voice channel!'; }

            this.pushSongToQueue(title, url, "so", duration);
            return title;
        }
        catch { throw `Invalid URL for source: ${source}`; }
    }

    async loadSoundCloudPlaylist(source) {
        let playlist;
        try {
            playlist = await playdl.soundcloud(source);
        }
        catch { throw `Invalid playlist: ${source}`; }
        for (const track of playlist.tracks) {
            if (track.fetched == false) { break; }
            try {
                const url = track.permalink;
                const title = track.name;
                const duration = track.durationInSec;
                console.log(title);
                
                if (connection.subscribe(this.player) instanceof Error) { throw 'No users in voice channel!'; }
    
                this.pushSongToQueue(title, url, "so", duration);
            }
            catch { throw `Invalid URL for source: ${source}`; }
        }
        return playlist.name;
    }

	pushSongToQueue(title, url, type, duration) {
		this.queue.push({
			title: title,
			audio: null,
			url: url,
            type: type,
			duration: duration,
            position: this.queue.length,
        });

        this.duration += duration;

		if (!this.isPlaying()) {
			this.playNextSong();
		}
	}

	deleteSong(songIndex) {
        this.duration -= this.queue[songIndex].duration;
        const songTitle = this.queue[songIndex].title;

		if (songIndex == this.songIndex) {
			this.playNextSong();
		}
		if (songIndex <= this.songIndex) {
			this.currentSong.audio = null;
			this.songIndex -= 1;
		}

		console.log(`Audio player deleted song: ${songTitle}`);
		this.queue.splice(songIndex, 1);
	}


	displayDuration() {
        const seconds = this.duration % 60;
		let minutes = Math.floor(this.duration / 60);
        const hours = Math.floor(minutes / 60);
        minutes = minutes % 60;

        if (hours == 0) {
            return `${minutes}:${seconds}`;
        }
        else {
            return `${hours}:${minutes}:${seconds}`;
        }
	}

	changeSettings(setting, option) {
        console.log(this.settings[setting]);
        console.log(option);
		this.settings[setting] = option;
		console.log(`${this.settings[setting]} changed to ${option}`);
	}

    shuffleQueue() {
        this.currentSong.audio = null;
        let currentIndex = this.queue.length;
        let randomIndex;

        while (currentIndex > 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            const tempSong = this.queue[currentIndex];
            
            this.queue[currentIndex] = this.queue[randomIndex];
            this.queue[currentIndex].position = currentIndex;
            this.queue[randomIndex] = tempSong;
            this.queue[randomIndex].position = randomIndex;
        }
    }

    fuzzySearchQueue(input) {
        const searcher = new fuzzySearch(this.queue, ['title']);
        const song = searcher.search(input);
        return song[0].position;
    }

	returnCurrentSong() {
		return this.currentSong;
	}
    returnQueue() {
        return this.queue;
    }
    returnSongIndex() {
        return this.songIndex;
    }

	isPlaying() {
		if (this.songIndex == -1) { return false; }
		else { return true; }
	}
}

const player = new Player();
module.exports = { player };