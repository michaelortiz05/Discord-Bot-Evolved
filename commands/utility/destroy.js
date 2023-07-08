const { SlashCommandBuilder } = require('discord.js');
const { botEmitter } = require('../../events');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('destroy')
		.setDescription('Destroy bot client and logout'),
	async execute(interaction) {
		interaction.reply('Logging out...');
		botEmitter.emit('destroy');
	},
};