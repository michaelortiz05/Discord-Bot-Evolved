const { Events } = require('discord.js');
const { sendMessage } = require('../internals/client');
const config = require('./../internals/config.json');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		sendMessage(config.notificationChannelId, '*Odin is online!*');
	},
};