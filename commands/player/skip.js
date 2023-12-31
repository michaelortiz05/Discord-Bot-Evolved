const { SlashCommandBuilder } = require('discord.js');
const { player } = require('../../internals/player/player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skips the Current Song in the Queue'),

	async execute(interaction) {
		if (player.isPlaying()) {
			const currentSong = player.returnCurrentSong();
			player.playNextSong();

            try {
                interaction.reply(`*Skipping Song —* **${currentSong.title}**`);
            }
            catch { }
		}
		else {
            interaction.reply('*No Songs in Queue!*');
		}
	},
};