const { Client } = require('discord.js');
const { GatewayIntentBits } = require('discord.js');
const Player = require('./player');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const player = new Player();

function client_destroy() {
    client.destroy();
}

function player_addSong(url) {
    player.addSong(url);
}

module.exports = { client, client_destroy, player_addSong };
