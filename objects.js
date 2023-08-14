// all permanent objects declared in this file

function Initialize() {
	const { PaymentWebhookEndpoint } = require('./internals/econ/payments.js');
	new PaymentWebhookEndpoint();
}

const { Player } = require('./internals/player');
const player = new Player();

module.exports = { player, Initialize };