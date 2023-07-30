async function withTimeout(maxtime, asyncFn, context, ...args) {
	const timeout = new Promise((_, reject) => {
		const timer = setTimeout(() => {
			clearTimeout(timer);
			reject(new Error('Function execution timed out.'));
		}, maxtime);
	});
	const boundAsyncFn = asyncFn.bind(context);
	return await Promise.race([boundAsyncFn(...args), timeout]);
}

module.exports = { withTimeout };