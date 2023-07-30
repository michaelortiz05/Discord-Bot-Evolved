const { SlashCommandBuilder } = require('discord.js');
const { player } = require('../../objects');
const { withTimeout } = require('./../../internals/index');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Add a Song to the Queue')
		.addStringOption(option =>
			option
				.setName('source')
				.setDescription('audio source to play')
				.setRequired(true)),

	async execute(interaction) {
		await interaction.deferReply();
		try {
			const response = await withTimeout(10, player.addSong, player, interaction);
			if (response) { await interaction.editReply(`*Now Playing:* **${response}**`); }
			else { interaction.editReply('*No song found*'); }
		}
		catch (error) {
			await interaction.editReply('Odin timed out!');
			console.log(error);
		}
	},
};

