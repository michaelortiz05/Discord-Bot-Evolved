const { ytdl } = require('ytdl-core');
// const { prism } = require('prism-media');
const { createReadStream } = require('node:fs');
const { demuxProbe, createAudioResource, createAudioPlayer, AudioPlayerStatus } = require('@discordjs/voice');

class Player {
	constructor() {
		// this.guild = guild;
		this.queue = [];
		this.player = createAudioPlayer();
		this.player.on('error', error => {
			console.error('Error:', error.message);
		});
		this.player.on(AudioPlayerStatus.Playing, (os, ns) => {
			console.log(`Went from ${os} to ${ns}`);
		});
		this.player.on(AudioPlayerStatus.Idle, () => {
			console.log('Attempting to play next song');
			this.playNextSong();
		});
		this.player.on('stateChange', (oldState, newState) => {
			console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
		});
		this.isPlaying = false;
	}

	async addSong(url) {
		// Get info about the video
		const info = await ytdl.getInfo(url);
		const title = info.videoDetails.title;
		console.log(`Now playing: ${title}`);

		const stream = ytdl.downloadFromInfo(info, {
			quality: 'highestaudio',
			highWaterMark: 1 << 25,
		});
		const resource = await this.probeAndCreateResource(createReadStream(stream));
		// const type = stream.headers['content-type'] || stream.headers['Content-Type'];
		// if (!type || !type.startsWith('audio/webm')) {
		// 	// Transcode the stream to Opus with FFmpeg
		// 	resource = stream
		// 		.pipe(new prism.FFmpeg({
		// 			args: ['-analyzeduration', '0', '-loglevel', '0', '-f', 's16le', '-ar', '48000', '-ac', '2'],
		// 		}))
		// 		.pipe(new prism.opus.Encoder({ rate: 48000, channels: 2, frameSize: 960 }));
		// }

		this.queue.push({ name : title, audio : resource });
		if (!this.isPlaying) {
			this.playNextSong();
		}
	}

    async addTTS(TTS_FILE_PATH) {
        const resource = await this.probeAndCreateResource(createReadStream(TTS_FILE_PATH));

		this.queue.push({ name : tts, audio : resource });
		if (!this.isPlaying) {
			this.playNextSong();
		}
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
		}
		else {
			console.error('Song queue is empty!');
		}
	}

	clearQueue() {
		this.queue = [];
	}
}
module.exports = Player;