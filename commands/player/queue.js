const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { player } = require('../../objects');
const { sendMessage } = require('../../client');
const { buttonEmitter } = require('../../events/interactionCreate');

let queueMessages = [];

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
		interaction.reply('*Song Queue:*');

		const textChannelId = interaction.channel.id;
		renderMessages(textChannelId);

		buttonEmitter.on('songDel', (songIndex) => {
			buttonEmitter.removeAllListeners('songDel');
			buttonEmitter.removeAllListeners('songName');
			deleteMessages();
			interaction.editReply(`*deleted*  **${player.returnSong(songIndex).title}**`);
			player.deleteSong(songIndex);
			// renderMessages(textChannelId); <-- Strange behavior
		});

		buttonEmitter.on('songName', (songIndex) => {
			buttonEmitter.removeAllListeners('songDel');
			buttonEmitter.removeAllListeners('songName');
			interaction.editReply('*Changed Current Song*');
			player.playSong(songIndex);
			deleteMessages();
		});
	},
};

function deleteMessages() {
	for (const message of queueMessages) {
		message.delete();
	}
	queueMessages = [];
}

async function renderMessages(textChannelId) {
	const queue = player.returnQueue();

	// TODO only render updates
	const delSongButtons = [];
	const songButtons = [];

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

	let i = 0;
	let actionRowArr = [];
	while (i < queue.length) {
		actionRowArr.push(new ActionRowBuilder().addComponents(delSongButtons[i], songButtons[i]));
		i += 1;
		if (i % 5 == 0 || i == queue.length) {
			queueMessages.push(await sendMessage(textChannelId, { components: actionRowArr }));
			actionRowArr = [];
		}
	}
}