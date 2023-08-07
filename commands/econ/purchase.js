const { SlashCommandBuilder } = require('discord.js');
const { purchaseToken } = require('./../../internals/econ');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('purchase')
		.setDescription('Displays your currency and token balance')
		.addIntegerOption(option =>
			option.setName('amount')
				.setDescription('Number of tokens you wish to buy')
				.setRequired(true),
		)
		.addStringOption(option =>
			option.setName('currency')
				.addChoices(
					{ name: 'GPT', value: 'GPT_TOKENS' },
					{ name: 'dallE', value: 'DALLE_TOKENS' },
				)
				.setDescription('Type of token you wish to buy')
				.setRequired(true),
		),
	async execute(interaction) {
		const userId = interaction.member.user.id;
		const tokenString = interaction.options.getString('currency');
		const tokenQuantity = interaction.options.getInteger('amount');

		try {
			const purchaseReply = await purchaseToken(userId, tokenString, tokenQuantity);
			interaction.reply(purchaseReply);
		}
		catch (err) {
			console.log(err);
			interaction.reply('Something went wrong!');
		}
	},
};
