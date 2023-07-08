const EventEmitter = require('events');

class BotEvents extends EventEmitter {}

// Create an instance of your custom emitter
const botEmitter = new BotEvents();

module.exports = botEmitter;