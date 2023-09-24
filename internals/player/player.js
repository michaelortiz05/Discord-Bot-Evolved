const { createAudioPlayer, createAudioResource, AudioPlayerStatus} = require('@discordjs/voice');
const playdl = require('play-dl');
const { unlink } = require('fs');

const { connection } = require('./connection');
const { queueDisplay } = require('../display');

class Player {
	constructor() {
		this.player = createAudioPlayer();
		this.queue = [];

		this.songIndex = -1;
		this.currentSong = null;
		this.ttsFilePath = '';
		this.duration = {
			hours: 0,
			minutes: 0,
			seconds: 0,
		};
        this.endStatus = 'No More Songs in Queue';
		this.settings = {
			loop: false,
		};

		this.player.on('error', (error) => {
			console.error('Error:', error.message);
		});

		this.player.on('stateChange', (oldState, newState) => {
			if (newState.status == 'playing') {
				console.log(`Audio player now playing: ${this.currentSong.title}`);
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

			connection.sendMessage(`*Now Playing:*  **${this.currentSong.title}**\n${this.currentSong.url}`);
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
            default:     
		        throw "Invalid Search";
        }
	}
	
	async loadYoutubeVideo(source) {
		const res = await playdl.search(source, { source: { youtube : 'video' }, limit: 1 });
        console.log(res);
        let url;
        try {
		    url = res[0].url;
        }
        catch { throw 'Invalid Url!'; }

		const title = res[0].title;
		const duration = this.setDuration(res[0].durationRaw);

		if (connection.subscribe(this.player) instanceof Error) { throw 'No users in voice channel!'; }

		this.pushSongToQueue(title, url, duration);
		return title;
	}


    async loadYoutubePlaylist(source) {
        const playlist = await playdl.playlist_info(source);
        
		for (const video of playlist.videos) {

            const url = video.url;
            const title = video.title;

            const duration = this.setDuration(video.durationRaw);
            console.log(title);
    
            if (connection.subscribe(this.player) instanceof Error) { throw 'No users in voice channel!'; }
    
            this.pushSongToQueue(title, url, duration);
        }

        return playlist.title;
    }

	pushSongToQueue(title, url, duration) {

		this.queue.push({
			title: title,
			audio: null,
			url: url,
			duration: duration });
		if (!this.isPlaying()) {
			this.playNextSong();
		}
	}

	deleteSong(songIndex) {
        this.removeDuration(this.queue[songIndex].duration);
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

	setDuration(durationRaw) {
		const nColons = durationRaw.split(':').length - 1;
		let hours, minutes, seconds;

		if (nColons == 0) {
			hours = 0;
			minutes = 0;
			seconds = parseInt(durationRaw);
		}
		else if (nColons == 1) {
			const firstColonIndex = durationRaw.indexOf(':');
			hours = 0;
			minutes = parseInt(durationRaw.substring(0, firstColonIndex));
			seconds = parseInt(durationRaw.substring(firstColonIndex + 1, durationRaw.length));
		}
		else {
			const firstColonIndex = durationRaw.indexOf(':');
			const secondColonIndex = durationRaw.indexOf(':', firstColonIndex + 1);
			hours = parseInt(durationRaw.substring(0, firstColonIndex));
			minutes = parseInt(durationRaw.substring(firstColonIndex + 1, secondColonIndex));
			seconds = parseInt(durationRaw.substring(secondColonIndex + 1, durationRaw.length));
		}

		this.duration.hours += hours;
		this.duration.minutes += minutes;
		this.duration.seconds += seconds;

		this.duration.minutes += Math.floor(this.duration.seconds / 60);
		this.duration.seconds = this.duration.seconds % 60;
		this.duration.hours += Math.floor(this.duration.minutes / 60);
		this.duration.minutes = this.duration.minutes % 60;

		return { hours: hours, minutes: minutes, seconds: seconds };
	}
	removeDuration(duration) {
		this.duration.hours -= duration.hours;
		this.duration.minutes -= duration.minutes;
		this.duration.seconds -= duration.seconds;
	}
	displayDuration() {
		let hourString, minuteString, secondString;
		if (this.duration.hours < 10) { hourString = `0${this.duration.hours}`; }
		else { hourString = this.duration.hours.toString(); }
		if (this.duration.minutes < 10) { minuteString = `0${this.duration.minutes}`; }
		else { minuteString = this.duration.minutes.toString(); }
		if (this.duration.seconds < 10) { secondString = `0${this.duration.seconds}`; }
		else { secondString = this.duration.seconds.toString(); }

		return `${hourString}:${minuteString}:${secondString}`;
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
            this.queue[randomIndex] = tempSong;
        }
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