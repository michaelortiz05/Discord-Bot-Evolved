const { SlashCommandBuilder } = require('discord.js');
const { player } = require('../../objects');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('List and Edit Queue'),

	async execute(interaction) {
		const queue = player.returnQueue();
		const currentSong = player.returnCurrentSong();
		if (currentSong == null) {
			interaction.reply('*Queue is Empty*');
		}
		else {
			let responseString = `*Currently Playing —* **${currentSong.title}**\n`;
			for (let i = 0; i < queue.length; i++) {
				responseString += `*Position ${i + 2} —* **${queue[i].title}**\n`;
			}
			interaction.reply(responseString);
		}
	},
};

