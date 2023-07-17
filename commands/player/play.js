const { SlashCommandBuilder } = require('discord.js');
const playdl = require('play-dl');
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

		const source = interaction.options.getString('source');

		if (playdl.yt_validate(source) == 'search') {
			const res = await playdl.search(source, { source: { youtube : 'video' }, limit: 1 });
			const videoUrl = res[0].url;

			player.subscribeToConnection(connection);
			const stream = await playdl.stream(videoUrl);
			player.addSong(stream);

			interaction.reply(`*Now Playing:*  ${videoUrl}`);
		}
		else if (playdl.yt_validate(source) == 'video') {
			player.subscribeToConnection(connection);
			const stream = await playdl.stream(source);
			player.addSong(stream);

			interaction.reply(`*Now Playing:*  ${source}`);
		}
		// TODO add playlist support
		// else if (playdl.yt_validate(source) == 'playlist') {
		// }

		// TODO test \/ \/
		// else {
		// 	const r = await yts(source);
		// 	console.log(r);
		// }
	},
};