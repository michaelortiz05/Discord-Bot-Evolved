const { SlashCommandBuilder, Client } = require('discord.js');
const gTTS = require('gtts');
const { player, joinUserChannel } = require('../../manager');

const fs = require('node:fs');

const TTS_FILE_PATH = 'tmp/tts.mp3';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tts')
		.setDescription('Converts text to speech')
        .addStringOption(option => 
            option
                .setName('text')
                .setDescription('Text to convert')
                .setRequired(true)),

	async execute(interaction) {
        const connection = await joinUserChannel(interaction);
        if (connection instanceof Error) return;

        const tts_text = interaction.options.getString('text');
        await saveFile(tts_text);


        player.playTTS(TTS_FILE_PATH, connection);

        interaction.reply('*\"' + tts_text + '\"*');


        // connection.destroy();
	}
};

function saveFile(tts_text) {
    return new Promise((resolve, reject) => {
        const tts = new gTTS(tts_text, 'en');

        tts.save(TTS_FILE_PATH, function (err, result) {
            if(err) { return reject(err); }
            else { return resolve(); }
        })
    });
}
