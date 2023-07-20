const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { player } = require('../../objects');
const { sendMessage } = require('../../client');
const { buttonEmitter } = require('../../events/interactionCreate');

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
					.setCustomId('songDel_' + (i).toString())
					.setLabel('❌')
					.setStyle(ButtonStyle.Secondary);
				const songButton = new ButtonBuilder()
					.setCustomId('songName_' + (i).toString())
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

		buttonEmitter.on('songName', (songIndex) => {
			player.playSong(songIndex);
		});

		buttonEmitter.on('songDel', (songIndex) => {
			player.deleteSong(songIndex);
		});
	},
};

