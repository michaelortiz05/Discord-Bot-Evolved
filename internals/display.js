const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const EventEmitter = require('events');

function returnBalanceEmbed(dbUser) {

	return new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle(`**Balance for ${dbUser.USERNAME.S}**`)
		.addFields(
			{ name: ' ', value: '*vBucks:\nChatGPT Tokens:\ndallE Tokens:*', inline: true },
			{ name: ' ', value: `**${dbUser.BALANCE.N}\n${dbUser.GPT_TOKENS.N}\n${dbUser.DALLE_TOKENS.N}**`, inline: true },
		);
    }

class QueueDisplay {

    constructor() {
        this.queueDisplayEmitter = new EventEmitter();
    }

	returnQueueMessages(queue, songIndex) {

        let actionRow = [];
        let actionRowList = [];
		for (let i = 0; i < queue.length; i++) {
			const delSongButton = new ButtonBuilder()
				.setCustomId('songDel_' + (i).toString())
				.setLabel('❌')
				.setStyle(ButtonStyle.Secondary);
			const songButton = new ButtonBuilder()
				.setCustomId('songName_' + (i).toString())
				.setLabel((queue[i].title.length > 80) ? queue[i].title.slice(0, 80) : queue[i].title);
			if (i == songIndex) {
				songButton.setStyle(ButtonStyle.Success);
			}
			else {
				songButton.setStyle(ButtonStyle.Primary);
			}

            actionRow.push(new ActionRowBuilder().addComponents(delSongButton, songButton));
            
            // every 5 rows, action rows are separated into individual messages
            if (i % 5 == 4 || i == queue.length - 1) {
                actionRowList.push(actionRow);
				actionRow = [];
			}
		}
        return actionRowList;
	}

    returnEmitter() {
        return this.queueDisplayEmitter;
    }
}
queueDisplay = new QueueDisplay();
module.exports = { queueDisplay, returnBalanceEmbed };