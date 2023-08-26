const { SlashCommandBuilder } = require('discord.js');
const gTTS = require('gtts');
const { player } = require('../../objects');
const { sendMessage } = require('../../internals/client');

// OPTION VALUES
// interaction.options._hoistedOptions = { name: '', type: <int>, value: '' }
// TYPE String = 3

const TTS_FILE_PATH = 'tmp/tts.mp3';
module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('Tests configured commands'),

	async execute(interaction) {
        await testAddSongs(interaction, [
            "Ndzln1UEyf0",
            "Where'd all the Time Go Dr. Dog",
            "Myxomatosis",
            "Fire Away Chris Stapleton",
            "https://www.youtube.com/watch?v=zol2MJf6XNE",
        ]);
        // - Same number of characters as a video ID
        // - Possibly blocked video
        // - Link
        // - Video ID
        // - Long Title

        // testSkip(interaction);
        // testQueue(interaction);

        // testSendMessage(interaction);
	},
};

function testSendMessage(interaction) {
    interaction.editReply("Reply Edited!");
    const channelId = interaction.channel.id;
    sendMessage("Message Sent!");
}

async function testAddSongs(interaction, songList) {
    const { execute } = require('../player/play');
    for (song of songList) {
        interaction.options._hoistedOptions = [ { name: 'source', type: 3, value: song } ];
        await execute(interaction);
    }
    await interaction.deleteReply();
}
function testSkip(interaction) {
    const { execute } = require('../player/skip');
    execute(interaction);
    interaction.deleteReply();
}
function testQueue(interaction) {
    const { execute } = require('../player/queue');
    execute(interaction);
}