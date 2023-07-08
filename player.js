const { ytdl } = require('ytdl-core');
const { prism } = require('prism-media');
const { createAudioPlayer } = require('@discordjs/voice');
class Player {
	constructor(guild) {
		this.guild = guild;
		this.queue = [];
		this.player = createAudioPlayer();
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
		let resource = stream;
		const type = stream.headers['content-type'] || stream.headers['Content-Type'];
		if (!type || !type.startsWith('audio/webm')) {
			// Transcode the stream to Opus with FFmpeg
			resource = stream
				.pipe(new prism.FFmpeg({
					args: ['-analyzeduration', '0', '-loglevel', '0', '-f', 's16le', '-ar', '48000', '-ac', '2'],
				}))
				.pipe(new prism.opus.Encoder({ rate: 48000, channels: 2, frameSize: 960 }));
		}
		this.queue.push({ name : title, audio : resource });
		if (!this.isPlaying) {
			this.playNextSong();
		}
	}

	playNextSong() {
		if (this.queue.length > 0) {
			this.isPlaying = true;
			const song = this.queue.shift();
			this.player.play(song.audio);
		}
	}

	clearQueue() {
		this.queue = [];
	}
}