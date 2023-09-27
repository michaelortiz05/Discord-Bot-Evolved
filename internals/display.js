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

        const queueDisplayMax =  (queue.length < 10 + songIndex) ? queue.length : 10 + songIndex;
        let actionRow = [];
        let actionRowList = [];
		for (let i = songIndex; i < queueDisplayMax; i++) {
            const numString = i.toString();
			const delSongButton = new ButtonBuilder()
				.setCustomId('songDel_' + numString)
				.setLabel('❌')
				.setStyle(ButtonStyle.Secondary);
            const songName = queue[i].title + " │ " + (i + 1).toString() + " │";
			const songButton = new ButtonBuilder()
				.setCustomId('songName_' + numString)
				.setLabel((songName.length > 80) ? songName.slice(0, 80) : songName);
			if (i == songIndex) {
				songButton.setStyle(ButtonStyle.Success);
			}
			else {
				songButton.setStyle(ButtonStyle.Primary);
			}

            actionRow.push(new ActionRowBuilder().addComponents(delSongButton, songButton));
            
            // every 5 rows, action rows are separated into individual messages
            if ((i - songIndex) % 5 == 4 || i == queueDisplayMax - 1) {
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