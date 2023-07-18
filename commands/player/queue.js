const { SlashCommandBuilder } = require('discord.js');
const { player } = require('../../objects');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('List and Edit Queue'),
	// .addStringOption(option => option)


	async execute(interaction) {

		const queue = player.returnQueue();
		console.log();
		if (queue[0] == {}) {
			interaction.reply('*Queue is Empty*');
		}
		else {
			let responseString = `*Currently Playing —* **${queue[0].title}**\n`;
			for (let i = 0; i < queue[1].length; i++) {
				responseString += `*Position ${i + 2} —* **${queue[1][i].title}**\n`;
			}
			interaction.reply(responseString);
		}
	},
};

