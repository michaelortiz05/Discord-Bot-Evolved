const { SlashCommandBuilder } = require('discord.js');
const { player } = require('../../objects');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('List and Edit Queue'),

	async execute(interaction) {
		player.displayQueue(interaction);
	},
};