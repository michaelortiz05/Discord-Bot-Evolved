const { SlashCommandBuilder } = require('discord.js');
const { player } = require('../../objects');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Add a Song to the Queue')
		.addStringOption(option =>
			option
				.setName('source')
				.setDescription('audio source to play')
				.setRequired(true)),

	async execute(interaction) {
		player.addSong(interaction);
	},
};

