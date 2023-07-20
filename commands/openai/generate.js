const { SlashCommandBuilder } = require('discord.js');
const { openai } = require('../../objects');
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
        try {
            const response = await openai.createImage({
                prompt: interaction.options.getString('prompt'),
                n: 1,
                size: "1024x1024",
            });
            imageurl = response.data.data[0].url;
            await interaction.followUp(imageurl);
        } catch (error) {
            if (error.response) {
                console.log(error.response.status);
                console.log(error.response.data);
            } 
            else 
                console.log(error.message);
            await interaction.followUp("Something went wrong! Try again!");
        }
	},
};