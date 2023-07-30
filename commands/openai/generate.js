const { SlashCommandBuilder } = require('discord.js');
const { generate } = require('../../internals/ai-manager');
const { withTimeout } = require('./../../internals/index');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('generate')
		.setDescription('Generate an image with DALLE')
		.addStringOption(option =>
			option
				.setName('prompt')
				.setDescription('image description')
				.setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply();
		try {
			const image_config = {
				prompt: interaction.options.getString('prompt'),
				n: 1,
				size: '1024x1024',
			};
			const imageurl = await withTimeout(30000, generate, null, image_config);
			if (imageurl != undefined) {
				await interaction.followUp(
					{ files: [
						{ attachment: imageurl, name: 'dalle.png' },
					] });
			}
			else { await interaction.editReply('Error generating image!'); }
		}
		catch (error) {
			await interaction.editReply('Odin timed out!');
			console.log(error);
		}
	},
};