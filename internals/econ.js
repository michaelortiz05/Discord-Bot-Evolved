const { DynamoDB } = require('@aws-sdk/client-dynamodb');

const { econUserTableName, econCurrencyTableName } = require('./config.json');
const { getServerUsers } = require('./client');
const { returnBalanceEmbed } = require('./display');
const ddb = new DynamoDB({ apiVersion: '2012-08-10' });

class EconUserInfo {

	getDBUsers() {
		return new Promise((res, rej) => {
			const params = {
				TableName: econUserTableName,
			};
			ddb.scan(params, (err, data) => {
				if (err) { return rej(err); }
				else { return res(data.Items); }
			});
		});
	}
	getDBUser(userId) {
		return new Promise((res, rej) => {
			const params = {
				TableName: econUserTableName,
				Key: {
					USER_ID: { N: userId },
				},
			};
			ddb.getItem(params, (err, data) => {
				if (err) { return rej(err); }
				else { return res(data.Item); }
			});
		});
	}
	addUser(userId, username, balance, allowance) {
		const params = {
			TableName: econUserTableName,
			Item: {
				USER_ID: { N: userId },
				USERNAME: { S: username },
				BALANCE: { N: balance.toString() },
				INCOME: { N: allowance.toString() },
				GPT_TOKENS: { N: '0' },
				DALLE_TOKENS: { N: '0' },
			},
		};
		ddb.putItem(params, (err) => {
			if (err) {
				console.log(`Could not add ${username} to table || Error: ${err}`);
			}
			else {
				console.log(`Added ${username} to table`);
			}
		});
	}
	updateUsername(userId, username) {
		const params = this.returnUpdateJson(userId, 'USERNAME', { 'S': username });

		ddb.updateItem(params, (err) => {
			if (err) {
				console.log(`Could not update ${userId} to name ${username} || Error: ${err}`);
			}
			else {
				console.log(`Updated ${userId} to name ${username}`);
			}
		});
	}
	updateTokens(userId, tokenString, tokenQuantity) {
		const params = this.returnUpdateJson(userId, tokenString, { 'N': tokenQuantity });

		ddb.updateItem(params, (err) => {
			if (err) {
				console.log(`Could not update ${tokenString} of ${userId} by quantity ${tokenQuantity} || Error: ${err}`);
			}
			else {
				console.log(`Updated ${tokenString} of ${userId} to quantity ${tokenQuantity}`);
			}
		});
	}
	updateBalance(userId, newBalance) {
		const params = this.returnUpdateJson(userId, 'BALANCE', { 'N': newBalance });

		ddb.updateItem(params, (err) => {
			if (err) {
				console.log(`Could not update balance of ${userId} to ${newBalance} || Error: ${err}`);
			}
			else {
				console.log(`Updated balance of ${userId} to ${newBalance}`);
			}
		});
	}

	async addAllIncomes() {
		const dbUsers = await this.getDBUsers();
		const userList = [];
		for (const user of dbUsers) {
			userList.push({
				USER_ID: user.USER_ID.N,
				BALANCE: user.BALANCE.N,
				INCOME: user.INCOME.N,
			});
		}

		const chunks = [];
		for (let i = 0; i < userList.length; i += 100) {
			chunks.push(userList.slice(i, i + 100));
		}

		chunks.forEach(chunk => {
			const params = { TransactItems: [] };
			for (const user of chunk) {
				const newBalance = (parseInt(user.BALANCE) + parseInt(user.INCOME)).toString();
				params.TransactItems.push({
					Update: this.returnUpdateJson(user.USER_ID, 'BALANCE', { 'N': newBalance }),
				});
			}
			ddb.transactWriteItems(params, (err) => {
				if (err) {
					console.log(`Could not update chunk || Error: ${err}`);
				}
				else {
					console.log('Updated chunk');
				}
			});
		});
	}

	async updateUsers() {
		let serverUsers = getServerUsers();
		let dbUsers = this.getDBUsers();

		const DBUsernameSet = new Set();
		const DBUserIdSet = new Set();
		dbUsers = await dbUsers;
		for (const user of dbUsers) {
			DBUsernameSet.add(user.USERNAME.S);
			DBUserIdSet.add(user.USER_ID.N);
		}

		serverUsers = await serverUsers;
		for (const user of serverUsers) {
			const userId = user[1].user.id;
			const username = user[1].user.username;
			if (username != 'Odin' && username != 'Frigg'
            && !DBUsernameSet.has(username)) {
				if (DBUserIdSet.has(userId)) { this.updateUsername(userId, username); }
				else { this.addUser(userId, username, 0, 100);}
			}
		}
	}

	returnUpdateJson(userId, attribute, newValue) {
		const updateJson = {
			TableName: econUserTableName,
			Key: {
				USER_ID : { N: userId },
			},
			ExpressionAttributeNames: {
				'#X': attribute,
			},
			ExpressionAttributeValues: {
				':x': newValue,
			},
			UpdateExpression : 'SET #X = :x',
		};
		return updateJson;
	}
}

class EconCurrencyInfo {

	getTokenInfo() {
		return new Promise((res, rej) => {
			const params = {
				TableName: econCurrencyTableName,
			};
			ddb.scan(params, (err, data) => {
				if (err) { return rej(err); }
				else { return res(data.Items); }
			});
		});
	}

	updatePrice(tokenString, newPrice) {
		const params = this.returnUpdateJson(tokenString, 'PRICE', { 'N': newPrice });

		ddb.updateItem(params, (err) => {
			if (err) {
				console.log(`Could not update ${tokenString} to price ${newPrice} || Error: ${err}`);
			}
			else {
				console.log(`Updated ${tokenString} to price ${newPrice}`);
			}
		});
	}
	updateQuantity(tokenString, newQuantity) {
		const params = this.returnUpdateJson(tokenString, 'PRICE', { 'N': newQuantity });

		ddb.updateItem(params, (err) => {
			if (err) {
				console.log(`Could not update ${tokenString} to quantity ${newQuantity} || Error: ${err}`);
			}
			else {
				console.log(`Updated ${tokenString} to quantity ${newQuantity}`);
			}
		});
	}

	returnUpdateJson(tokenString, attribute, newValue) {
		const updateJson = {
			TableName: econCurrencyTableName,
			Key: {
				TOKEN_ID : { S: tokenString },
			},
			ExpressionAttributeNames: {
				'#X': attribute,
			},
			ExpressionAttributeValues: {
				':x': newValue,
			},
			UpdateExpression : 'SET #X = :x',
		};
		return updateJson;
	}
}

const econUserInfo = new EconUserInfo();
const econCurrencyInfo = new EconCurrencyInfo();

async function purchaseToken(userId, tokenString, tokenQuantity) {
	let dbUser = econUserInfo.getDBUser(userId);
	const tokenInfo = await econCurrencyInfo.getTokenInfo();

	for (const token of tokenInfo) {
		if (token.TOKEN_ID.S == tokenString) {
			const newShopQuantity = parseInt(token.QUANTITY.N) - tokenQuantity;
			if (newShopQuantity < 0) { return `There are only ${token.QUANTITY.N} token(s) remaining!`; }

			dbUser = await dbUser;

			const cost = parseInt(token.PRICE.N) * tokenQuantity;
			const newUserBalance = parseInt(dbUser.BALANCE.N) - cost;
			if (newUserBalance < 0) { return `This action would cost: ${cost} | Remaining balance: ${dbUser.BALANCE.N}`;}

			const newUserQuantity = parseInt(dbUser[tokenString].N) + tokenQuantity;

			// updates the DDB table
			econCurrencyInfo.updateQuantity(token.TOKEN_ID.S, newShopQuantity.toString());
			econUserInfo.updateBalance(userId, newUserBalance.toString());
			econUserInfo.updateTokens(userId, tokenString, newUserQuantity.toString());

			// updates the local user info for the embed display
			dbUser.BALANCE.N = newUserBalance;
			dbUser[tokenString].N = newUserQuantity;

			const balanceEmbed = returnBalanceEmbed(dbUser);
			return {
				content: `*Purchased ${tokenQuantity} ${token.TOKEN_NAME.S}!*`,
				embeds: [ balanceEmbed ] };
		}
	}
	return new Error(`No Existent tokens of Name '${tokenString}'`);
}

module.exports = { econUserInfo, econCurrencyInfo, purchaseToken };
