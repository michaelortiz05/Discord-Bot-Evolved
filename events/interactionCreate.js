const { Events } = require('discord.js');
const EventEmitter = require('events');

const buttonEmitter = new EventEmitter();

async function execute(interaction) {
	if (interaction.isChatInputCommand()) {

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
		}
		catch (error) {
			console.error(`Error executing ${interaction.commandName}`);
			console.error(error);
		}
	}

	// button format: 'type_num'
	else if (interaction.isButton()) {
		const buttonId = interaction.customId;
		const underscoreIndex = buttonId.indexOf('_');
		const buttonType = buttonId.substring(0, underscoreIndex);
		const buttonNum = buttonId.substring(underscoreIndex + 1, buttonId.length);

		console.log('emitting: ' + buttonType);
		buttonEmitter.emit(buttonType, buttonNum);
	}
	// can duplicate this for other interactions (reactions, select menus, etc.)
}

module.exports = { name: Events.InteractionCreate, buttonEmitter, execute };