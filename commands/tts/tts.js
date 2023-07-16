const { SlashCommandBuilder, Client } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const gTTS = require('gtts');
const player = require('../../player');

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
        //if (!getVoiceConnection(interaction.channel.guild.id)) {
        const connection = joinVoiceChannel({
            channelId: interaction.member.voice.channel.id,
            guildId: interaction.channel.guild.id,
            adapterCreator: interaction.channel.guild.voiceAdapterCreator,
        });
        //}
        const text = interaction.options.getString('text');
        const tts = new gTTS(text, 'en');
        tts.save(TTS_FILE_PATH, function (err, result) {
            if(err) { throw new Error(err) }
            console.log('TTS request completed');
        });   
        await player.addTTS(TTS_FILE_PATH);

        connection.destroy();
	},
};