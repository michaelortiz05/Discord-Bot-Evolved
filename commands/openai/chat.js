const { SlashCommandBuilder } = require('discord.js');
const { chatManager } = require('../../internals/ai-manager');

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
        await interaction.reply(`"${message}"...`);
        const response = await chatManager.chat(userid, message);
        await interaction.followUp(response);
	},
};