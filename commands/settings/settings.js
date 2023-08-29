const { SlashCommandBuilder } = require('discord.js');
const { player } = require('../../internals/player/player');
const { econUserInfo } = require('../../internals/econ/econ-db');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('settings')
		.setDescription('Change Bot Settings')
		.addSubcommand(subcommand =>
			subcommand
				.setName('player')
				.setDescription('Player Options')
				.addBooleanOption(option =>
					option.setName('loop')
						.setDescription('Whether the player loops back upon reaching the end of the Queue'),
				),
		)
		.addSubcommandGroup(subcommandGroup =>
			subcommandGroup
				.setName('market')
				.setDescription('Market Options')
				.addSubcommand(subcommand =>
					subcommand
						.setName('update')
						.setDescription('Adds users to the market if they are not there already'),
				)
				.addSubcommand(subcommand =>
					subcommand
						.setName('paycheck')
						.setDescription('Updates monthly income'),
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
		else if (interaction.options.getSubcommandGroup() == 'market') {
			if (interaction.options.getSubcommand() == 'update') {
				econUserInfo.updateUsers();
			}
			else if (interaction.options.getSubcommand() == 'paycheck') {
				econUserInfo.addAllIncomes();
			}
		}
	},
};