const { demuxProbe, createAudioResource, createAudioPlayer, AudioPlayerStatus, joinVoiceChannel } = require('@discordjs/voice');
const { unlink } = require('node:fs');
const { sendMessage } = require('./client');

class Player {
	constructor() {
		// this.guild = guild;
		this.queue = [];
		this.player = createAudioPlayer();

		this.currentSong = {};
		this.isPlaying = false;
		this.connection = null;
		this.ttsFilePath = '';
		this.textChannelId = 0;

		this.player.on('error', (error) => {
			console.error('Error:', error.message);
		});

		this.player.on('stateChange', (oldState, newState) => {
			console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
		});

		this.player.on(AudioPlayerStatus.Idle, () => {
			console.log('Attempting to play next song');
			if (!this.playNextSong()) {
				this.endOfQueueEvent();
			}
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

	}

	subscribeToConnection(interaction) {
		if (this.connection) {
			return;
		}

		if (interaction.member.voice.channel == null) {
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
		if (!this.isPlaying) {
			this.playNextSong();
		}
	}

	async probeAndCreateResource(readableStream) {
		const { stream, type } = await demuxProbe(readableStream);
		return createAudioResource(stream, { inputType: type });
	}

	playNextSong() {

		// TODO add announcement when new song is playing
		if (this.queue.length > 0) {
			this.isPlaying = true;

			this.currentSong = this.queue.shift();
			this.player.play(this.currentSong.audio);

			sendMessage(this.textChannelId, `*Now Playing:*  ${this.currentSong.url}`);

			return true;
		}
		else {
			this.currentSong = {};
			return false;
		}
	}

	returnQueue() {
		return [ this.currentSong, this.queue ];
	}

	clearQueue() {
		this.queue = [];
	}
}
module.exports = Player;
