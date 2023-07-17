const { Client } = require('discord.js');
const { GatewayIntentBits } = require('discord.js');
const Player = require('./player');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');

const client = new Client({ intents: [ GatewayIntentBits.Guilds ] });
const player = new Player();

function client_destroy() {
    client.destroy();
}

function joinUserChannel(interaction) {
   
    if (interaction.member.voice.channel == null) {
        interaction.reply('User must be in voice channel!')
        return new Error('noConnection');
    } else if (!getVoiceConnection(interaction.channel.guild.id)) { //TODO Something wrong with this!
        const connection = joinVoiceChannel({
            channelId: interaction.member.voice.channel.id,
            guildId: interaction.channel.guild.id,
            adapterCreator: interaction.channel.guild.voiceAdapterCreator,
            selfDeaf: false
        });
        return connection;
    }
    return connection;
}

module.exports = { client, client_destroy, player, joinUserChannel };
