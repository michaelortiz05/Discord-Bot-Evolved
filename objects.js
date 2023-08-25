// all permanent objects declared in this file

function Initialize() {
	const { PaymentWebhookEndpoint } = require('./internals/econ/payments.js');
	new PaymentWebhookEndpoint();
}

module.exports = { Initialize };