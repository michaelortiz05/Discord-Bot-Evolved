const { SlashCommandBuilder } = require('discord.js');
const { purchaseToken } = require('./../../internals/econ');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('purchase')
		.setDescription('Displays your currency and token balance'),

	async execute(interaction) {
		purchaseToken(interaction.member.user.id);
	},
};
