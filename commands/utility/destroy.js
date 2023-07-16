const { SlashCommandBuilder } = require("discord.js");
const { client_destroy } = require('../../manager')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("destroy")
        .setDescription("Destroy bot client and logout"),
    async execute(interaction) {
        client_destroy();
        interaction.reply('I will kidnap the President of the United States');
  },
};