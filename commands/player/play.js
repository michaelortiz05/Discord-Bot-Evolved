const { SlashCommandBuilder } = require('discord.js');
const ytdl = require('ytdl-core');
const { yts } = require('yt-search');
const { player, joinUserChannel } = require('../../manager');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play a youtube link')
		.addStringOption(option =>
			option
				.setName('source')
				.setDescription('audio source to play ')
				.setRequired(true)),

	async execute(interaction) {
		const connection = joinUserChannel(interaction);
		if (connection instanceof Error) return;

		player.subscribeToConnection(connection);

		const source = interaction.options.getString('source');

		if (ytdl.validateURL(source)) {
			const info = await ytdl.getInfo(source);
			const title = info.videoDetails.title;
			console.log(`Now playing: ${title}`);

			const stream = ytdl(source, { filter: 'audioonly' });


			player.addSong(stream);
			interaction.reply(`***Now Playing:*** ${title}`);
		}
		// TODO test \/ \/
		else {
			const r = await yts(source);
			console.log(r);
		}
	},
};