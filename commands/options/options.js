const { SlashCommandBuilder } = require('discord.js');
const { player } = require('../../objects');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('options')
		.setDescription('Change Bot Settings')
		.addSubcommand(subcommand =>
			subcommand
				.setName('player')
				.setDescription('Player Options')
				.addBooleanOption(option =>
					option.setName('loop')
						.setDescription('Whether the player loops back upon reaching the end of the Queue'),
				)
				.addBooleanOption(option =>
					option.setName('test')
						.setDescription('does nothing'),
				),
		),

	async execute(interaction) {
		if (interaction.options.getSubcommand() == 'player') {
			const playerOption = interaction.options.getBoolean('loop');
			if (playerOption != null) {
				player.changeSettings('loop', playerOption);
				if (playerOption == true) { interaction.reply('*Queue Loop On*'); }
				else { interaction.reply('*Queue Loop Off*'); }
			}
		}
	},
};