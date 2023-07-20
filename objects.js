// all permanent objects declared in this file
const { Configuration, OpenAIApi } = require("openai");
const { Player } = require('./player');
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const player = new Player();
const openai = new OpenAIApi(configuration);
module.exports = { player, openai };