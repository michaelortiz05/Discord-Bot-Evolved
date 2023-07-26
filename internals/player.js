const { createAudioPlayer, createAudioResource, AudioPlayerStatus, joinVoiceChannel } = require('@discordjs/voice');
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const playdl = require('play-dl');
const EventEmitter = require('events');

const { sendMessage } = require('./../client');
const { buttonEmitter } = require('./../events/interactionCreate');
const { unlink } = require('fs');

class Player {
	constructor() {
		this.player = createAudioPlayer();
		this.queue = [];
		this.connection = null;

		this.songIndex = -1;
		this.currentSong = null;
		this.ttsFilePath = '';
		this.loop = false;
		this.duration = {
			hours: 0,
			minutes: 0,
			seconds: 0,
		};

		this.queueClickEmitter = new EventEmitter();

		this.player.on('error', (error) => {
			console.error('Error:', error.message);
		});

		this.player.on('stateChange', (oldState, newState) => {
			if (newState.status == 'playing') {
				console.log(newState.status);
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

			sendMessage(this.textChannelId, `*Now Playing:*  **${this.currentSong.title}**\n${this.currentSong.url}`);
		}
		else if (this.loop == true) {
			this.songIndex = -1;

			this.playNextSong();
		}
		else {
			this.player.stop();
			this.songIndex = -1;
			this.queue = [];
		}
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

	// ADD SONG LOGIC /play
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

	addSong(interaction) {
		const source = interaction.options.getString('source');
		interaction.deferReply();

		if (playdl.yt_validate(source) == 'search') {
			this.loadSearch(interaction, source);
		}
		else if (playdl.yt_validate(source) == 'video') {
			this.loadUrl(interaction, source);
		}
	}
	async loadUrl(interaction, source) {
		let info;

		// playdl.video_basic_info thinks 11 char inputs w/o spaces are video IDs
		try {
			info = (await playdl.video_basic_info(source)).video_details;
		}
		catch {
			if (source.length == 11) { this.loadSearch(interaction, source); }
			return;
		}

		const url = info.url;
		const title = info.title;
		const duration = this.setDuration(info.durationRaw);

		interaction.editReply(`*Added to Queue:*  ${title}`);

		const stream = await playdl.stream(source);

		this.subscribeToConnection(interaction);
		this.pushSongToQueue(stream, title, url, duration);
	}
	async loadSearch(interaction, source) {
		const res = await playdl.search(source, { source: { youtube : 'video' }, limit: 1 });
		const url = res[0].url;
		const title = res[0].title;
		const duration = this.setDuration(res[0].durationRaw);

		let stream;
		try {
			stream = await playdl.stream(url);
			interaction.editReply(`*Added to Queue:*  **${title}**`);
		}
		catch {
			interaction.editReply('*Could Not Load Song*');
			return;
		}

		this.subscribeToConnection(interaction);
		this.pushSongToQueue(stream, title, url, duration);
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
		if (songIndex == this.songIndex) {
			this.playNextSong();
		}
		if (songIndex <= this.songIndex) {
			this.currentSong.audio = null;
			this.songIndex -= 1;
		}
		this.removeDuration(this.queue[songIndex].duration);
		console.log('Audio player deleted song: ' + this.queue[songIndex].title);
		this.queue.splice(songIndex, 1);
	}

	// QUEUE RENDERING LOGIC /queue
	// TODO remove previous queue message if new one is rendered
	//             eventlistener or store the data in this.options
	displayQueue(interaction) {
		const currentSong = this.currentSong;

		if (currentSong == null) {
			interaction.reply('*Queue is Empty*');
			return;
		}

		const queueMessages = [];
		this.renderQueueMessages(interaction, queueMessages);

		this.queueClickEmitter.emit('queueDisplay');
		this.queueClickEmitter.once('queueDisplay', () => {
			console.log('queueDisplay');
			this.deleteQueueMessages(queueMessages);
			interaction.deleteReply();
		});

		buttonEmitter.removeAllListeners('songDel');
		buttonEmitter.removeAllListeners('songName');

		this.addButtonEmitters(interaction, queueMessages);
	}
	addButtonEmitters(interaction, queueMessages) {
		buttonEmitter.on('songDel', (songIndex) => {
			buttonEmitter.removeAllListeners('songDel');
			buttonEmitter.removeAllListeners('songName');
			this.queueClickEmitter.removeAllListeners('queueDisplay');

			this.deleteSong(songIndex);
			this.deleteQueueMessages(queueMessages);
			interaction.editReply(`*Removed from Queue: *  **${this.queue[songIndex].title}**`);
		});

		buttonEmitter.on('songName', (songIndex) => {
			buttonEmitter.removeAllListeners('songDel');
			buttonEmitter.removeAllListeners('songName');
			this.queueClickEmitter.removeAllListeners('queueDisplay');

			if (this.isPlaying()) { this.currentSong.audio = null; }
			this.currentSong = this.queue[songIndex];
			this.songIndex = songIndex;
			this.playSong();

			this.deleteQueueMessages(queueMessages);
			interaction.editReply('*Changed Current Song*');

			sendMessage(this.textChannelId, `*Now Playing:*  **${this.currentSong.title}**\n${this.currentSong.url}`);
		});
	}
	async renderQueueMessages(interaction, queueMessages) {

		interaction.reply(`**Song Queue**  |  *Songs: ${this.queue.length}*  |  *Duration: ${this.displayDuration()}*`);

		const textChannelId = interaction.channel.id;

		// TODO only render updates
		const delSongButtons = [];
		const songButtons = [];

		for (let i = 0; i < this.queue.length; i++) {
			delSongButtons.push(new ButtonBuilder()
				.setCustomId('songDel_' + (i).toString())
				.setLabel('❌')
				.setStyle(ButtonStyle.Secondary));
			songButtons.push(new ButtonBuilder()
				.setCustomId('songName_' + (i).toString())
				.setLabel(this.queue[i].title));
			if (i == this.songIndex) {
				songButtons[i].setStyle(ButtonStyle.Success);
			}
			else {
				songButtons[i].setStyle(ButtonStyle.Primary);
			}
		}
		let i = 0;
		let actionRowArr = [];
		while (i < this.queue.length) {
			actionRowArr.push(new ActionRowBuilder().addComponents(delSongButtons[i], songButtons[i]));
			i += 1;
			if (i % 5 == 0 || i == this.queue.length) {
				queueMessages.push(await sendMessage(textChannelId, { components: actionRowArr }));
				actionRowArr = [];
			}
		}
	}
	deleteQueueMessages(queueMessages) {
		for (const message of queueMessages) {
			message.delete();
		}
		queueMessages = [];
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

	isPlaying() {
		if (this.songIndex == -1) { return false; }
		else { return true; }
	}
}

module.exports = { Player };