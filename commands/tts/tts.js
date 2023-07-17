const { SlashCommandBuilder, Client } = require('discord.js');
const gTTS = require('gtts');
const { player, joinUserChannel } = require('../../manager');

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
        // const tts = new gTTS(tts_text, 'en');
        // tts.save(TTS_FILE_PATH, function (err, result) {
        //     if(err) { throw new Error(err) }
        //     console.log('TTS request completed');
        // });   

        interaction.reply('*\"' + tts_text + '\"*');

        await player.subscribeToConnection(connection);
        player.playTTS();

        // connection.destroy();
	},
};