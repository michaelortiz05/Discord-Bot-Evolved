const { SlashCommandBuilder } = require('discord.js');
const { generate } = require('../../internals/ai-manager');
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
        await interaction.reply(`"${interaction.options.getString('prompt')}"\nworking on it...`);
        const imageurl = await generate({
            prompt: interaction.options.getString('prompt'),
            n: 1,
            size: "1024x1024",
        });
        if (imageurl != undefined) {
            await interaction.followUp(
            { files: [
            {attachment: imageurl, name: "dalle.png"},
            ]});
        }
        else
            await interaction.followUp("Something went wrong! Try again!");
	},
};