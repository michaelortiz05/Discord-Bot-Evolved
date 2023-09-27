const { SlashCommandBuilder } = require('discord.js');
const { player } = require('../../internals/player/player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('searchqueue')
		.setDescription('Fuzzy Searches the Queue, then Plays the Closest Match Song')
        .addStringOption(option =>
			option
				.setName('search')
				.setDescription('search key')
				.setRequired(true)),

	async execute(interaction) {
		const search = interaction.options.getString('search');
        const songIndex = player.fuzzySearchQueue(search);
        player.playDifferentSong(songIndex);
        const user = interaction.member.user.username;
        interaction.reply(`${user} **searched** for song: *${search}*`);
	},
};