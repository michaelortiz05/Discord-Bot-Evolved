const { createAudioPlayer, createAudioResource, AudioPlayerStatus, joinVoiceChannel } = require('@discordjs/voice');
const { unlink } = require('node:fs');
const { sendMessage } = require('./client');
const playdl = require('play-dl');

class Player {
	constructor() {

		this.player = createAudioPlayer();
		this.queue = [];
		this.songIndex = -1;
		this.currentSong = null;
		this.connection = null;
		this.ttsFilePath = '';

		this.settings = {
			loop: false,
		};

		this.player.on('error', (error) => {
			console.error('Error:', error.message);
		});

		this.player.on('stateChange', (oldState, newState) => {
			console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
		});

		this.player.on(AudioPlayerStatus.Idle, () => {
			this.playNextSong();
			if (!this.isPlaying()) { this.endOfQueueEvent(); }
		});
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

		if (this.connection) {
			this.connection.destroy();
			this.connection = null;
		}

		sendMessage(this.textChannelId, '*Queue Has Ended — No More Songs in Queue');
	}

	subscribeToConnection(interaction) {
		if (this.connection) {
			return;
		}

		if (interaction.member.voice.channel == null) {
			// TODO this currently errors out
			interaction.reply('User must be in voice channel!');
			return new Error('noConnection');
		}

		this.textChannelId = interaction.channel.id;

		this.connection = joinVoiceChannel({
			channelId: interaction.member.voice.channel.id,
			guildId: interaction.channel.guild.id,
			adapterCreator: interaction.channel.guild.voiceAdapterCreator,
			selfDeaf: false,
		});
		this.connection.subscribe(this.player);
	}

	playTTS(tts_file_path) {
		this.player.play(createAudioResource(tts_file_path));

		this.ttsFilePath = tts_file_path;
	}

	addSong(title, stream, url) {
		const resource = createAudioResource(stream.stream, { inputType: stream.type });

		this.queue.push({ title: title, audio: resource, url: url });
		if (!this.isPlaying()) {
			console.log('playing next song...');
			this.playNextSong();
		}
	}

	// this is getting called twice when the queue ends -- I see no
	//      way to fix it as it is being called simultaneously by the
	//      eventlistener and /skip functions
	playNextSong() {
		if (this.isPlaying()) { this.currentSong.audio = null; }

		this.songIndex = Math.floor(this.songIndex + 1);
		if (this.songIndex < this.queue.length) {

			this.currentSong = this.queue[this.songIndex];
			this.play();

			sendMessage(this.textChannelId, `*Now Playing:*  **${this.currentSong.title}**\n${this.currentSong.url}`);
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

	playSong(songIndex) {
		if (this.isPlaying()) { this.currentSong.audio = null; }

		this.currentSong = this.queue[songIndex];
		this.songIndex = songIndex;
		this.play();

		sendMessage(this.textChannelId, `*Now Playing:*  **${this.currentSong.title}**\n${this.currentSong.url}`);
	}
	async play() {
		console.log(`Song Index: ${this.songIndex} || Queue Length: ${this.queue.length}`);

		// remakes stream if it has been deleted
		if (this.currentSong.audio == null) {
			const stream = await playdl.stream(this.currentSong.url);
			const resource = createAudioResource(stream.stream, { inputType: stream.type });
			this.currentSong.audio = resource;
		}
		this.player.play(this.currentSong.audio);
	}

	deleteSong(songIndex) {
		console.log('Deleting Song: ' + this.queue[songIndex].title);
		if (songIndex == this.songIndex) {
			console.log('deleted song == current song');
			this.playNextSong();
		}
		if (songIndex <= this.songIndex) {
			this.currentSong = null;
			this.songIndex -= 1;
		}
		this.queue.splice(songIndex, 1);
	}

	returnSong(index) {
		return this.queue[index];
	}
	returnCurrentSong() {
		return this.currentSong;
	}
	returnSongIndex() {
		return this.songIndex;
	}
	returnQueue() {
		return this.queue;
	}

	isPlaying() {
		if (this.songIndex == -1) { return false; }
		else { return true; }
	}

	clearQueue() {
		this.queue = [];
	}

	changeSettings(setting, option) {
		this.settings[setting] = option;
		console.log(this.settings[setting]);
	}
}

module.exports = { Player };