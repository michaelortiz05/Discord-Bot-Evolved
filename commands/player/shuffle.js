const { SlashCommandBuilder } = require('discord.js');
const { player } = require('../../internals/player/player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shuffle')
		.setDescription('Randomizes the Order of the Queue, Then Restarts It'),

	async execute(interaction) {
		player.shuffleQueue();
        player.playDifferentSong(0);
        const user = interaction.member.user.username
        interaction.reply(user + ' used the **shuffle** command!')
	},
};