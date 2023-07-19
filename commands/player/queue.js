const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { player } = require('../../objects');
const { sendMessage } = require('../../client');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('List and Edit Queue'),

	async execute(interaction) {
		const currentSong = player.returnCurrentSong();

		if (currentSong == null) {
			interaction.reply('*Queue is Empty*');
			return;
		}

		interaction.reply('**Song Queue:**');
		const textChannelId = interaction.channel.id;


		const queue = player.returnQueue();
		const currSongIndex = player.returnSongIndex();

		let i = 0;
		while (i < queue.length) {
			const actionRowArr = [];
			const blockSize = Math.min(queue.length - i, 5);
			const iCurr = i;
			for (i; i < blockSize + iCurr; i++) {
				const delSongButton = new ButtonBuilder()
					.setCustomId('del_' + (i).toString())
					.setLabel('❌')
					.setStyle(ButtonStyle.Secondary);
				const songButton = new ButtonBuilder()
					.setCustomId('name_' + (i).toString())
					.setLabel(queue[i].title);
				if (i == currSongIndex) {
					songButton.setStyle(ButtonStyle.Success);
				}
				else {
					songButton.setStyle(ButtonStyle.Primary);
				}

				actionRowArr.push(new ActionRowBuilder().addComponents(delSongButton, songButton));

			}
			sendMessage(textChannelId, { components: actionRowArr });
		}


		// responseString = `*Currently Playing —* **${currentSong.title}**\n`;
		// for (let i = 0; i < queue.length; i++) {
		// 	responseString += `*Position ${i + 2} —* **${queue[i].title}**\n`;
		// 	// interaction.reply(responseString);

		// 	const actionRowArr = [];

		// 	for (let i = 0; i < 5; i++) {
		// 		const numberButton = new ButtonBuilder()
		// 			.setCustomId(i.toString())
		// 			.setLabel(i.toString())
		// 			.setStyle(ButtonStyle.Primary);
		// 		const songButton = new ButtonBuilder()
		// 			.setCustomId('name' + i.toString())
		// 			.setLabel('this is a name + ' + i.toString())
		// 			.setStyle(ButtonStyle.Secondary);
		//
		// 	}


	},
};

