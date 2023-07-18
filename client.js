const { Client } = require('discord.js');
const { GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates ] });


function destroy() {
	client.destroy();
}

function sendMessage(channelId, message) {
	client.channels.cache.get(channelId).send(message);
}

module.exports = { client, destroy, sendMessage };