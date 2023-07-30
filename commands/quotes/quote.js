const { SlashCommandBuilder } = require('discord.js');
const { sendMessage } = require('../../internals/client');
const config = require('../../internals/config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('quote')
		.setDescription('Quote Someone')
		.addStringOption(option =>
			option
				.setName('quote')
				.setDescription('Quote')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('orator')
				.setDescription('Orator')
				.setRequired(true)),

	async execute(interaction) {
		const quoteString = interaction.options.getString('quote') + ' — ' + interaction.options.getString('orator');
		sendMessage(config.quoteChannelId, quoteString);
		interaction.reply('Quote Added!');
	},
};

