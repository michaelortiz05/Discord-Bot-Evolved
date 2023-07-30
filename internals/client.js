const { Client } = require('discord.js');
const { GatewayIntentBits } = require('discord.js');
const config = require('./config.json');
const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMembers,
	GatewayIntentBits.GuildVoiceStates,
] });

function destroy() {
	client.destroy();
}

function sendMessage(channelId, message) {
	return client.channels.cache.get(channelId).send(message);
}

function getServerUsers() {
	const guild = client.guilds.cache.get(config.guildId);
	return guild.members.fetch();
}

module.exports = { client, destroy, sendMessage, getServerUsers };