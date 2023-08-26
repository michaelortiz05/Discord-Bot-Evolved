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

        connection.sendMessage('*Queue Has Ended — No More Songs in Queue');
        connection.unsubscribe()

		const queueDisplayEmitter = queueDisplay.returnEmitter();
        queueDisplayEmitter.emit('queueDisplay');
	}
	async playSong() {

		// remakes stream if it has been deleted
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
		if (playdl.yt_validate(source) == 'search') {
			return this.loadSearch(source);
		}
		else if (playdl.yt_validate(source) == 'video') {
			return this.loadUrl(source);
		}
	}
	async loadUrl(source) {

		// playdl.video_basic_info thinks 11 char inputs w/o spaces are video IDs
		let info;
		try {
			info = (await playdl.video_basic_info(source)).video_details;
		}
		catch {
			if (source.length == 11) { this.loadSearch(source); }
			return;
		}
		let stream = playdl.stream(source);

		const url = info.url;
		const title = info.title;
		const duration = this.setDuration(info.durationRaw);

		if (connection.subscribe(this.player) instanceof Error) { return; }

        try { stream = await stream; }
        catch(err) { 
            console.log(`Error Loading Song: ${err}`)
            return; 
        }
		this.pushSongToQueue(stream, title, url, duration);
		return title;
	}
	async loadSearch(source) {
		const res = await playdl.search(source, { source: { youtube : 'video' }, limit: 1 });
		const url = res[0].url;

		let stream;
		try {
			stream = playdl.stream(url);
		}
		catch {
            console.log('Could not load song!')
			return;
		}
		const title = res[0].title;
		const duration = this.setDuration(res[0].durationRaw);

		if (connection.subscribe(this.player) instanceof Error) { return; }

        try { stream = await stream; }
        catch(err) { 
            console.log(`Error Loading Song: ${err}`)
            return; 
        }
		this.pushSongToQueue(stream, title, url, duration);
		return title;
	}
	pushSongToQueue(stream, title, url, duration) {
		const resource = createAudioResource(stream.stream, { inputType: stream.type });

		this.queue.push({
			title: title,
			audio: resource,
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
		this.settings[setting] = option;
		console.log(`${this.settings[setting]} changed to ${option}`);
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