const { SlashCommandBuilder } = require('discord.js');
const { destroy } = require('../../client');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('destroy')
		.setDescription('Destroy bot client and logout'),
	async execute(interaction) {
		destroy();
		interaction.reply('Bot Taken Offline');
	},
};
