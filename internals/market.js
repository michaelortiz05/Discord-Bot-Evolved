const { DynamoDB } = require('@aws-sdk/client-dynamodb');

const config = require('../config.json');
const { getServerUsers } = require('./../client');

class UserCurrencyTable {
	constructor() {
		this.ddb = new DynamoDB({ apiVersion: '2012-08-10' });
	}

	getDBUsers() {
		return new Promise((res, rej) => {
			const params = {
				TableName: config.userCurrencyTableName,
			};
			this.ddb.scan(params, (err, data) => {
				if (err) { return rej(err); }
				else { return res(data.Items); }
			});
		});
	}
	addUser(userId, username, balance, allowance) {
		const params = {
			TableName: config.userCurrencyTableName,
			Item: {
				USER_ID: { N: userId },
				USERNAME: { S: username },
				BALANCE: { N: balance.toString() },
				INCOME: { N: allowance.toString() },
			},
		};
		this.ddb.putItem(params, (err) => {
			if (err) {
				console.log(`Could not add ${username} to table || Error: ${err}`);
			}
			else {
				console.log(`Added ${username} to table`);
			}
		});
	}
	updateUsername(userId, username) {
		const params = {
			TableName: config.userCurrencyTableName,
			Key: {
				USER_ID : { N: userId },
			},
			ExpressionAttributeNames: {
				'#X': 'USERNAME',
			},
			ExpressionAttributeValues: {
				':x': { 'S': username },
			},
			UpdateExpression : 'SET #X = :x',
		};
		this.ddb.updateItem(params, (err) => {
			if (err) {
				console.log(`Could not update ${userId} to name ${username} || Error: ${err}`);
			}
			else {
				console.log(`Updated ${userId} to name ${username}`);
			}
		});
	}
	async addAllIncomes() {
		const DBUsers = await this.getDBUsers();
		const userList = [];
		for (const user of DBUsers) {
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
				console.log(user);
				const newBalance = (parseInt(user.BALANCE) + parseInt(user.INCOME)).toString();
				params.TransactItems.push({
					Update: {
						TableName: config.userCurrencyTableName,
						Key: {
							USER_ID : { N: user.USER_ID },
						},
						ExpressionAttributeNames: {
							'#X': 'BALANCE',
						},
						ExpressionAttributeValues: {
							':x': { 'N': newBalance },
						},
						UpdateExpression : 'SET #X = :x',
					},
				});
			}
			this.ddb.transactWriteItems(params, (err) => {
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
		let DBUsers = this.getDBUsers();

		const DBUsernameSet = new Set();
		const DBUserIdSet = new Set();
		DBUsers = await DBUsers;
		for (const user of DBUsers) {
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


}

module.exports = { UserCurrencyTable };
