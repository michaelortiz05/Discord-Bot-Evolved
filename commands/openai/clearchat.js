const { SlashCommandBuilder } = require('discord.js');
const { chatManager } = require('../../internals/ai-manager');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clearchat')
		.setDescription('delete your current chat history with odin'),
	async execute(interaction) {
		const userid = interaction.user.id;
        const clear = chatManager.clearChat(userid);
        if (clear)
            await interaction.reply(`Chat cleared!`);
        else
            await interaction.reply(`Oops! Couldn't delete chat history!`);
	},
};