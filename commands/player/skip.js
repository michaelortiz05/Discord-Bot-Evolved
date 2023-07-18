const { SlashCommandBuilder } = require('discord.js');
const { player } = require('../../objects');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skips the Current Song in the Queue'),

	async execute(interaction) {

		const currentSong = player.returnCurrentSong();
		player.playNextSong();
		interaction.reply(`*Skipping Song —* **${currentSong.title}**`);
	},
};

