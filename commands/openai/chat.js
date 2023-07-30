const { SlashCommandBuilder } = require('discord.js');
const { chatManager, withTimeout } = require('../../internals/ai-manager');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('chat')
		.setDescription('ask Odin anything!')
		.addStringOption(option =>
			option
				.setName('message')
				.setDescription('bot message')
				.setRequired(true)),
	async execute(interaction) {
		const userid = interaction.user.id;
		const message = interaction.options.getString('message');
		await interaction.deferReply();
		try {
			let response = await withTimeout(15000, chatManager.chat, chatManager, userid, message);
			await interaction.editReply(response);
			console.log(response);
		} catch (error) {
			await interaction.editReply("Odin timed out!");
			console.log(error);
		}
	},
};