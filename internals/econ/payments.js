const Stripe = require('stripe');
const { econUserInfo } = require('./econ-db');

// TODO get this variable from .env; does not work on windows!
const config = require('../config.json');
const key = config.STRIPE_SECRET_KEY;
const stripe = Stripe(key);


class PaymentWebhookEndpoint {
	constructor() {
		const express = require('express');
		const app = express();

		app.post('/payments', express.raw({ type: 'application/json' }), (req, res) => {

			// webhook signature testing
			const endpointSecret = config.STRIPE_ENDPOINT_SECRET;
			const signature = req.headers['stripe-signature'];
			try { stripe.webhooks.constructEvent(req.body, signature, endpointSecret); }
			catch (err) {
				res.status(400).send(`Invalid Signature: ${err}`);
				console.log(`Invalid Signature: ${err}`);
				return;
			}

			// this is just req.body with express.json enabled
			const body = JSON.parse(req.body.toString());

			try {
				this.processPayment(body);

				res.status(200).send('OK');
			}
			catch (err) {
				console.log(`Webhook Error: ${err}`);
				res.status(400).send(`Webhook Error: ${err}`);
			}


		});

		const PORT = 443;
		app.listen(PORT, () => {
			console.log(`Payment webhook receiver listening on port ${PORT}`);
		});
	}

	async processPayment(webhookBody) {
		const payment = webhookBody.data.object;

		const name = payment.customer_details.name;
		const userId = payment.custom_fields[0].numeric.value;
		// const email = payment.customer_details.email;
		const amount = payment.amount_total;

		console.log(`Received payment from ${name} for amount ${amount} || User ID: ${userId}`);

		// TODO add error handling; don't want people's money to go into the void
		let dbUser;
		try {
			dbUser = await econUserInfo.getDBUser(userId);
		}
		catch (err) {
			console.log(err);
			return;
		}

		const newBalance = parseInt(dbUser.BALANCE.N) + amount;

		// TODO add idempotency with id check or rate limit
		econUserInfo.updateBalance(userId, newBalance.toString());
	}
}


// class PaymentInfo {

// 	async returnInvoices() {
// 		const invoices = await stripe.invoices.list();
// 		console.log(invoices);
// 	}
// 	async returnInvoice(invoiceId) {
// 		const invoice = await stripe.invoices.retrieve(invoiceId);
// 		console.log(invoice);
// 	}

// 	async getPayment(paymentId) {
// 		const payment = await stripe.paymentIntents.retrieve(paymentId);
// 		console.log(payment);
// 	}
// }

module.exports = { PaymentWebhookEndpoint };
