const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
require('any-date-parser');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('book')
		.setDescription('Book a Meeting')
		.addStringOption(option =>
			option
				.setName('name')
				.setDescription('Name of the Meeting')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('date')
				.setDescription('Date of the Meeting [M/D]')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('time')
				.setDescription('Time of the Meeting [H:MM]')
				.setRequired(true)),
	async execute(interaction) {
		const name = interaction.options.getString('name');
		let date = interaction.options.getString('date');
		let time = interaction.options.getString('time');

		// if year is not inputted
		const splitDate = date.split(/[\s/:-\\]+/);
		if (splitDate.length == 2) {
			date = new Date().getFullYear() + '-' + splitDate[0] + '-' + splitDate[1];
		}
		else if (splitDate.length != 3) {
			interaction.reply('*Invalid Date Format: Use [M/D] or [M/D/Y]*');
			return;
		}

		const splitTime = time.split(/[\s/:-\\]+/);
		if (splitTime.length == 2) {
			if (splitTime[0].length == 1) { splitTime[0] = '0' + splitTime[0]; }
			time = splitTime[0] + ':' + splitTime[1] + ':' + '00';
		}
		else if (splitTime.length == 3) {
			if (splitTime[0].length == 1) { splitTime[0] = '0' + splitTime[0]; }
			time = splitTime[0] + ':' + splitTime[1] + ':' + splitTime[2];
		}
		else {
			interaction.reply('*Invalid Time Format: Use [H:MM] or [HH:MM:SS]*');
			return;
		}

		const dateObj = Date.fromString(date + 'T' + time);
		console.log(dateObj);

		const title = `**${name}**  *(Meeting)*`;

		// could add invitations here, but server is small enough where this won't matter

		const yesButtion = new ButtonBuilder()
			.setCustomId('yes')
			.setLabel('Yes')
			.setStyle(ButtonStyle.Primary);
		const noButton = new ButtonBuilder()
			.setCustomId('no')
			.setLabel('No')
			.setStyle(ButtonStyle.Secondary);
		const responsesRow = new ActionRowBuilder()
			.addComponents(yesButtion, noButton);

		interaction.reply({
			content: title,
			components: [ responsesRow ],
		});
	},
};