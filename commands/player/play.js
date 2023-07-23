const { SlashCommandBuilder } = require('discord.js');
const playdl = require('play-dl');
const { player } = require('../../objects');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Add a Song to the Queue')
		.addStringOption(option =>
			option
				.setName('source')
				.setDescription('audio source to play')
				.setRequired(true)),

	async execute(interaction) {

		const source = interaction.options.getString('source');
		interaction.deferReply();

		if (playdl.yt_validate(source) == 'search') {
			addSongSearch(interaction, source);
		}
		else if (playdl.yt_validate(source) == 'video') {
			addSongVideo(interaction, source);
		}
	},
};

async function addSongSearch(interaction, source) {
	const res = await playdl.search(source, { source: { youtube : 'video' }, limit: 1 });
	const url = res[0].url;
	const title = res[0].title;

	let stream;
	try {
		stream = await playdl.stream(url);
		interaction.editReply(`*Added to Queue:*  **${title}**`);
	}
	catch {
		interaction.editReply('*Could Not Load Song*');
		return;
	}

	player.subscribeToConnection(interaction);
	player.addSong(title, stream, url);
}

async function addSongVideo(interaction, source) {
	let info;

	// playdl.video_basic_info thinks 11 char inputs w/o spaces are video IDs
	// this logic tests that
	try {
		info = (await playdl.video_basic_info(source)).video_details;
	}
	catch {
		if (source.length == 11) { addSongSearch(interaction, source); }
		return;
	}

	const url = info.url;
	const title = info.title;

	interaction.editReply(`*Added to Queue:*  ${title}`);

	const stream = await playdl.stream(source);

	player.subscribeToConnection(interaction);
	player.addSong(title, stream, url);
}
