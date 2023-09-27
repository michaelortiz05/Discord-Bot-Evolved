const { SlashCommandBuilder } = require('discord.js');
const { player } = require('../../internals/player/player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('restart')
		.setDescription('Restarts the Playlist'),

	async execute(interaction) {
        player.playDifferentSong(0);
        const user = interaction.member.user.username;
        interaction.reply(user + ' **restarted** the playlist!')
	},
};