const { SlashCommandBuilder } = require('discord.js');
const { player } = require('../../internals/player/player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('end')
		.setDescription('Ends the current queue | Overwrites loop settings'),

	async execute(interaction) {
		player.endQueue();
        const user = interaction.member.user.username
        interaction.reply(user + ' used the **end** command!')
	},
};