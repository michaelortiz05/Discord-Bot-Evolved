const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { econUserInfo } = require('./../../internals/econ');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('balance')
		.setDescription('Displays your currency and token balance'),

	async execute(interaction) {
		const balanceInfo = await econUserInfo.returnBalance(interaction.member.user.id);

		const balanceEmbed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle(`**Balance for ${interaction.member.user.username}**`)
			.addFields(
				{ name: ' ', value: '*vBucks:\nChatGPT Tokens:\ndallE Tokens:*', inline: true },
				{ name: ' ', value: `**${balanceInfo.BALANCE}\n${balanceInfo.GPT_TOKENS}\n${balanceInfo.DALLE_TOKENS}**`, inline: true },
			);

		interaction.reply({ embeds: [ balanceEmbed ] });
	},
};
