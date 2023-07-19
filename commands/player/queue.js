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

		let actionRowArr = [];
		// let numButton = new ButtonBuilder()
		// 	.setCustomId('1')
		// 	.setLabel('▶️')
		// 	.setStyle(ButtonStyle.Secondary)
		// 	.setDisabled(true);
		let songButton = new ButtonBuilder()
			.setCustomId('name_1')
			.setLabel(currentSong.title)
			.setStyle(ButtonStyle.Primary);
		let delSongButton = new ButtonBuilder()
			.setCustomId('del_1')
			.setLabel('❌')
			.setStyle(ButtonStyle.Secondary);
		actionRowArr.push(new ActionRowBuilder().addComponents(delSongButton, songButton));
		sendMessage(textChannelId, { components: actionRowArr });

		const queue = player.returnQueue();
		console.log('queueLength = ' + queue.length);
		let i = 0;
		while (i < queue.length) {
			actionRowArr = [];
			const blockSize = Math.min(queue.length - i, 5);
			console.log('blocksize = ' + blockSize);
			const iCurr = i;
			for (i; i < blockSize + iCurr; i++) {
				console.log(i);
				// numButton = new ButtonBuilder()
				// 	.setCustomId((i + 2).toString())
				// 	.setLabel(Numbers.toEmoji(i + 2))
				// 	.setStyle(ButtonStyle.Secondary)
				// 	.setDisabled(true);
				songButton = new ButtonBuilder()
					.setCustomId('name_' + (i + 2).toString())
					.setLabel(queue[i].title)
					.setStyle(ButtonStyle.Primary);
				delSongButton = new ButtonBuilder()
					.setCustomId('del_' + (i + 2).toString())
					.setLabel('❌')
					.setStyle(ButtonStyle.Secondary);

				actionRowArr.push(new ActionRowBuilder().addComponents(delSongButton, songButton));

			}
			// console.log(actionRowArr);
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

