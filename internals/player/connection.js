const { joinVoiceChannel } = require('@discordjs/voice');
const { sendMessage } = require('../client');

class Connection {

    constructor() {
        this.connection = null;
    }

    loadInteraction(interaction) {
        if (this.connection) {
			return;
		}
        this.interaction = interaction;
    }

    subscribe(player) {
		if (this.interaction.member.voice.channel == null) {			
			return new Error('noConnection');
		}

		this.textChannelId = this.interaction.channel.id;

		this.connection = joinVoiceChannel({
			channelId: this.interaction.member.voice.channel.id,
			guildId: this.interaction.channel.guild.id,
			adapterCreator: this.interaction.channel.guild.voiceAdapterCreator,
			selfDeaf: false,
		});
		this.connection.subscribe(player);
    }

    sendMessage(message) {
        sendMessage(this.textChannelId, message);
    }

    unsubscribe() {
        if (this.connection) {
			this.connection.destroy();
			this.connection = null;
		}
    }
}

const connection = new Connection();
module.exports = { connection };

// INTERACTION
// CONNECTION