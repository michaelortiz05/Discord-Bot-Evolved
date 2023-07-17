// const { prism } = require('prism-media');
const { createReadStream } = require('node:fs');
const { demuxProbe, createAudioResource, createAudioPlayer, AudioPlayerStatus, generateDependencyReport } = require('@discordjs/voice');
const { unlink } = require('node:fs');

class Player {
	constructor() {
		// this.guild = guild;
		this.queue = [];
		this.player = createAudioPlayer();
		this.player.on('error', (error) => {
			console.error('Error:', error.message);
		});
		// this.player.on(AudioPlayerStatus.Playing, (os, ns) => {
		// 	console.log(`Went from ${os} to ${ns}`);
		// });
		// this.player.on(AudioPlayerStatus.Idle, () => {
		// 	console.log('Attempting to play next song');
		// 	this.playNextSong();
		// });
		this.player.on('stateChange', (oldState, newState) => {
			console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
		});
		this.isPlaying = false;

		this.endOfQueueSettings = {
			ttsFilePath: '',
			connection: null,
		};
		this.player.on(AudioPlayerStatus.Idle, () => {
			console.log('Attempting to play next song');
			if (this.playNextSong()) {
				this.endOfQueueEvent();
			}
		});
	}

	endOfQueueEvent() {
		if (this.endOfQueueSettings.ttsFilePath) {
			unlink(this.endOfQueueSettings.ttsFilePath, (err) => {
				if (err) {
					console.log('No TTS file to delete');
				}
				console.log('TTS file deleted');
			});
			this.endOfQueueSettings.ttsFilePath = '';
		}

		if (this.endOfQueueSettings.connection) {
			this.endOfQueueSettings.connection.destroy();
		}
	}

	playTTS(tts_file_path, connection) {
		connection.subscribe(this.player);
		this.player.play(createAudioResource(tts_file_path));

		this.endOfQueueSettings.ttsFilePath = tts_file_path;
		this.endOfQueueSettings.connection = connection;
	}

	subscribeToConnection(connection) {
		connection.subscribe(this.player);
		this.endOfQueueSettings.connection = connection;
	}

	addSong(stream) {
		// Get info about the video
		const resource = createAudioResource(stream, { inlineVolume: true });
		resource.volume.setVolume(0.5);
		this.player.play(resource);

		// this.player.play(stream);
		// console.log(generateDependencyReport());
		// this.player.play(createAudioResource(stream));

		// const resource = await this.probeAndCreateResource(createReadStream(stream));
		// const type = stream.headers['content-type'] || stream.headers['Content-Type'];
		// if (!type || !type.startsWith('audio/webm')) {
		// 	// Transcode the stream to Opus with FFmpeg
		// 	resource = stream
		// 		.pipe(new prism.FFmpeg({
		// 			args: ['-analyzeduration', '0', '-loglevel', '0', '-f', 's16le', '-ar', '48000', '-ac', '2'],
		// 		}))
		// 		.pipe(new prism.opus.Encoder({ rate: 48000, channels: 2, frameSize: 960 }));
		// }
		// const audioResource = this.probeAndCreateResource(stream);
		// this.queue.push({ name: title, audio: audioResource });
		// if (!this.isPlaying) {
		// 	this.playNextSong();
		// }
	}

	async probeAndCreateResource(readableStream) {
		const { stream, type } = await demuxProbe(readableStream);
		return createAudioResource(stream, { inputType: type });
	}

	playNextSong() {
		if (this.queue.length > 0) {
			this.isPlaying = true;
			const song = this.queue.shift();
			this.player.play(song.audio);
			return true;
		}
		else {
			return false;
		}
	}

	clearQueue() {
		this.queue = [];
	}
}
module.exports = Player;
