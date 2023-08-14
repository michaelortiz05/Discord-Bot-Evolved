const Stripe = require('stripe');
const { econUserInfo } = require('./econ-db');

// TODO get this variable from .env; does not work on windows!
const dotenv = require('dotenv');
dotenv.config();
const stripe = Stripe(process.STRIPE_SECRET_KEY);


class PaymentWebhookEndpoint {
	constructor() {
		const express = require('express');
		const app = express();

		app.post('/payments', express.raw({ type: 'application/json' }), (req, res) => {

			// webhook signature testing
			const endpointSecret = process.STRIPE_ENDPOINT_SECRET;
			const signature = req.headers['stripe-signature'];
			try { stripe.webhooks.constructEvent(req.body, signature, endpointSecret); }
			catch (err) {
				res.status(400).send(`Invalid Signature: ${err}`);
				console.log(`Invalid Signature: ${err}`);
				return;
			}

			// this is just req.body with express.json enabled
			const body = JSON.parse(req.body.toString());


			this.processPayment(body).then(
				(status) => {
					res.status(200).send(status);
				},
				(rejStatus) => {

					// TODO invalidate payment if there is an error
					console.log(`Webhook Error: ${rejStatus}`);
					res.status(400).send(`Webhook Error: ${rejStatus}`);
				},
			);


		});

		const PORT = 443;
		app.listen(PORT, () => {
			console.log(`Payment webhook receiver listening on port ${PORT}`);
		});
	}

	processPayment(webhookBody) {
		return new Promise((res, rej) => {
			const payment = webhookBody.data.object;

			const name = payment.customer_details.name;
			const userId = payment.custom_fields[0].numeric.value;
			// const email = payment.customer_details.email;
			const amount = payment.amount_total;

			console.log(`Received payment from ${name} for amount ${amount} || User ID: ${userId}`);

			econUserInfo.getDBUser(userId).then(
				(dbUser) => {
					const newBalance = parseInt((parseInt(dbUser.BALANCE.N) + amount) * 0.95);

					// TODO add idempotency with id check or rate limit
					econUserInfo.updateBalance(userId, newBalance.toString());
					return res('OK');
				},
				() => { return rej('No existing user in database!'); },
			);
		});
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
