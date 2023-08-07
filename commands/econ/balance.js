const { SlashCommandBuilder } = require('discord.js');
const { econUserInfo } = require('./../../internals/econ');
const { returnBalanceEmbed } = require('../../internals/display');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('balance')
		.setDescription('Displays your currency and token balance'),

	async execute(interaction) {
		const dbUser = await econUserInfo.getDBUser(interaction.member.user.id);

		const balanceEmbed = returnBalanceEmbed(dbUser);
		interaction.reply({ embeds: [ balanceEmbed ] });
	},
};
