const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { player } = require('../../objects');
const { sendMessage } = require('../../client');
const { buttonEmitter } = require('../../events/interactionCreate');

const delSongButtons = [];
const songButtons = [];
const queueMessages = [];

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

		for (let i = 0; i < queue.length; i++) {
			delSongButtons.push(new ButtonBuilder()
				.setCustomId('songDel_' + (i).toString())
				.setLabel('❌')
				.setStyle(ButtonStyle.Secondary));
			songButtons.push(new ButtonBuilder()
				.setCustomId('songName_' + (i).toString())
				.setLabel(queue[i].title));
			if (i == player.returnSongIndex()) {
				songButtons[i].setStyle(ButtonStyle.Success);
			}
			else {
				songButtons[i].setStyle(ButtonStyle.Primary);
			}
		}
		let actionRowArr = [];
		for (let i = 0; i < queue.length; i++) {
			actionRowArr.push(new ActionRowBuilder().addComponents(delSongButtons[i], songButtons[i]));
			if (i % 5 == 4 || i == queue.length) {
				queueMessages.push(sendMessage(textChannelId, { components: actionRowArr }));
				actionRowArr = [];
			}
		}
		buttonEmitter.on('songDel', (songIndex) => {
			player.deleteSong(songIndex);
			// deleteButton(queue.length, songIndex);
		});

		buttonEmitter.on('songName', (songIndex) => {
			player.playSong(songIndex);
		});
	},
};

// rerendering queue
// problem for later

// function deleteButton(queueLength, songIndex) {
// 	delSongButtons.splice(songIndex, 1);
// 	songButtons.splice(songIndex, 1);
// 	queueLength -= 1;

// 	const currentSongIndex = player.returnSongIndex();

// 	for (let i = 0; i < queueLength; i++) {
// 		delSongButtons[i].setCustomId('songDel_' + (i).toString());
// 		songButtons[i].setCustomId('songName_' + (i).toString());
// 	}
// 	if (songIndex == currentSongIndex) {
// 		for (let i = 0; i < queueLength; i++) {
// 			if (i == currentSongIndex) {
// 				songButtons[i].setStyle(ButtonStyle.Success);
// 			}
// 			else {
// 				songButtons[i].setStyle(ButtonStyle.Primary);
// 			}
// 		}
// 	}
// }

// function reRenderQueue(queueLength) {
// 	for (let i = 0; i < queueLength; i++) {

// 	}
// }