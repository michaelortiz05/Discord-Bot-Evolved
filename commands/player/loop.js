const { SlashCommandBuilder } = require('discord.js');
const { player } = require('../../internals/player/player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('loop')
		.setDescription('Toggles Queue Loop')
        .addBooleanOption(option =>
            option.setName('toggle')
                .setDescription('Whether the player loops back upon reaching the end of the Queue')
                .setRequired(true),
        ),
async execute(interaction) {
    const loopOption = interaction.options.getBoolean('toggle');
    console.log(loopOption);
    player.changeSettings('loop', loopOption);
    if (loopOption == true) { interaction.reply('*Queue Loop On*'); }
    else { interaction.reply('*Queue Loop Off*'); }
    }
}
