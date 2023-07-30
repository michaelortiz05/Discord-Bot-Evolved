// all permanent objects declared in this file
const { Player } = require('./internals/player');
const player = new Player();

const { UserCurrencyTable } = require('./internals/market');
const userCurrencyTable = new UserCurrencyTable;

module.exports = { player, userCurrencyTable };