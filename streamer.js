const { ytdl } = require('ytdl-core');
const { ytSearch } = require('yt-search');
const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus, entersState } = require('@discordjs/voice');

class Streamer {
	constructor(channel) {
		this.connection = joinVoiceChannel({
			channelId: channel.id,
			guildId: channel.guild.id,
			adapterCreator: channel.guild.voiceAdapterCreator,
		});
	}
}