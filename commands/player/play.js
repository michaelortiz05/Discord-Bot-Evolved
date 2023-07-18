const { SlashCommandBuilder } = require('discord.js');
const playdl = require('play-dl');
const { player } = require('../../objects');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play a Song via YouTube')
		.addStringOption(option =>
			option
				.setName('source')
				.setDescription('audio source to play ')
				.setRequired(true)),

	async execute(interaction) {

		const source = interaction.options.getString('source');

		if (playdl.yt_validate(source) == 'search') {
			const res = await playdl.search(source, { source: { youtube : 'video' }, limit: 1 });
			const url = res[0].url;
			const title = res[0].title;

			player.subscribeToConnection(interaction);
			const stream = await playdl.stream(url);

			player.addSong(title, stream, url);

			interaction.reply(`*Added to Queue:*  ${title}`);
		}
		else if (playdl.yt_validate(source) == 'video') {
			player.subscribeToConnection(interaction);
			const stream = await playdl.stream(source);
			const info = (await playdl.video_basic_info(source)).video_details;
			const url = info.url;
			const title = info.title;

			player.addSong(title, stream, url);

			interaction.reply(`*Added to Queue:*  ${title}`);
		}
	},
};
