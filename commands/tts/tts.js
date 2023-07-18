const { SlashCommandBuilder } = require('discord.js');
const gTTS = require('gtts');
const { player } = require('../../objects');

const TTS_FILE_PATH = 'tmp/tts.mp3';
module.exports = {
	data: new SlashCommandBuilder()
		.setName('tts')
		.setDescription('Converts Text to Speech')
		.addStringOption((option) =>
			option
				.setName('text')
				.setDescription('Text to convert')
				.setRequired(true)),

	async execute(interaction) {
		player.subscribeToConnection(interaction);

		const tts_text = interaction.options.getString('text');
		await saveFile(TTS_FILE_PATH, tts_text);

		player.playTTS(TTS_FILE_PATH);

		interaction.reply('*"' + tts_text + '"*');


		// connection.destroy();
	},
};

function saveFile(tts_file_path, tts_text) {
	return new Promise((resolve, reject) => {
		const tts = new gTTS(tts_text, 'en');

		tts.save(tts_file_path, function(err) {
			if (err) {
				return reject(err);
			}
			else {
				return resolve();
			}
		});
	});
}
