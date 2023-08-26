const { SlashCommandBuilder } = require('discord.js');
const { queueDisplay } = require('../../internals/display');
const { player } = require('../../internals/player/player');
const { buttonEmitter } = require('./../../events/interactionCreate');
const { sendMessage } = require('../../internals/client');
const { text } = require('body-parser');
const { reply } = require('../../internals');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('List and Edit Queue'),

	async execute(interaction) {
        const textChannelId = interaction.channel.id;

        let currentSong = player.returnCurrentSong();
        if (currentSong == null) {
            interaction.reply('*Queue is Empty*');
            return;
        }
        const currentSongIndex = player.returnSongIndex();
        const queue = player.returnQueue();
        const queueDuration = player.displayDuration();

        interaction.reply(`**Song Queue**  |  *Songs: ${queue.length}*  |  *Duration: ${queueDuration}*`);
        
        const queueMessages = [];
		const actionRowList = queueDisplay.returnQueueMessages(queue, currentSongIndex);
        for (let actionRow of actionRowList) {
            queueMessages.push(await sendMessage(textChannelId, { components: actionRow }));
        }
        console.log(queueMessages);
        
        const queueDisplayEmitter = queueDisplay.returnEmitter();
        queueDisplayEmitter.emit('queueDisplay');
        queueDisplayEmitter.once('queueDisplay', () => {
            try {
                removeFromDiscord(queueMessages);
                interaction.deleteReply();
            }
            catch { }
        });

        buttonEmitter.removeAllListeners('songDel');
        buttonEmitter.removeAllListeners('songName');

        buttonEmitter.on('songDel', (songIndex) => {
            buttonEmitter.removeAllListeners('songDel');
            buttonEmitter.removeAllListeners('songName');
            queueDisplayEmitter.removeAllListeners('queueDisplay');

            const songName = queue[songIndex].title;
            player.deleteSong(songIndex);
            removeFromDiscord(queueMessages);
            interaction.editReply(`*Removed from Queue: *  **${songName}**`);
        });

        buttonEmitter.on('songName', (songIndex) => {
            buttonEmitter.removeAllListeners('songDel');
            buttonEmitter.removeAllListeners('songName');
            queueDisplayEmitter.removeAllListeners('queueDisplay');

            if (player.isPlaying()) { player.playDifferentSong(songIndex); }
            currentSong = player.returnCurrentSong();

            removeFromDiscord(queueMessages);
            interaction.editReply('*Changed Current Song*');

            sendMessage(textChannelId, `*Now Playing:*  **${currentSong.title}**\n${currentSong.url}`);
        });
	},
};

function removeFromDiscord(queueMessages) {
    for (const message of queueMessages) {
        message.delete();
    }
    queueMessages = [];
} 
