const { EmbedBuilder } = require('discord.js');

function returnBalanceEmbed(dbUser) {

	return new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle(`**Balance for ${dbUser.USERNAME.S}**`)
		.addFields(
			{ name: ' ', value: '*vBucks:\nChatGPT Tokens:\ndallE Tokens:*', inline: true },
			{ name: ' ', value: `**${dbUser.BALANCE.N}\n${dbUser.GPT_TOKENS.N}\n${dbUser.DALLE_TOKENS.N}**`, inline: true },
		);
}

module.exports = { returnBalanceEmbed };