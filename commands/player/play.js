const { SlashCommandBuilder } = require('discord.js');
const { ytdl } = require('ytdl-core');
const { yts } = require('yt-search');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const player = require('../../index');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play a youtube link')
		.addStringOption(option =>
			option
				.setName('source')
				.setDescription('audio source to play ')
				.setRequired(true)),
	async execute(interaction) {
		if (!getVoiceConnection(interaction.channel.guild.id)) {
			const connection = joinVoiceChannel({
				channelId: interaction.channel.id,
				guildId: interaction.channel.guild.id,
				adapterCreator: interaction.channel.guild.voiceAdapterCreator,
			});
		}
		const source = interaction.options.getString('source');
		console.log(source);
		// eslint-disable-next-line no-empty
		if (ytdl.validateURL(source)) {
			player.addSong(source);
		}
		else {
			const r = await yts(source);
			console.log(r);
		}
	},
};