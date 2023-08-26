const { SlashCommandBuilder } = require('discord.js');
const { connection } = require('../../internals/player/connection');
const { player } = require('../../internals/player/player');

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
        try { await interaction.deferReply(); } 
        catch { }
        
        try {
			connection.loadInteraction(interaction);

            const source = interaction.options.getString('source');
            console.log(`Command: /play ${source}`);

            try {
                const response = await withTimeout(10000, player.addSong, player, source);
                if (response) { await interaction.editReply(`*Added to Queue:* **${response}**`); }
                else { interaction.editReply('*No song found*'); }
            }
            catch (error) {
                await interaction.editReply('Odin timed out!');
                console.log(error);
            }
		}
		catch (error) {
			interaction.editReply('User must be in voice channel!');
			console.log(error);
		}

	}
};

