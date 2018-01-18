var Discord = require('discord.js');
var logger = require('winston');
var auth = require('./auth.json');
var BattleBot = require('battlebot');
var _ = require("lodash");

const bot = new Discord.Client();
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
	colorize: true
});
logger.level = 'debug';
var battleBot = new BattleBot();
// Initialize Discord Bot
bot.on('ready', function () {
	logger.info('Connected');
});

bot.on('message', function (message) {
	let userID = message.author.id
	let content = message.content
	let channelID = message.channel.id
	
	if(content.startsWith("!")){
		let reply = battleBot.message(content.substr(1), userID, channelID);
		message.channel.send(reply);
	}
});

bot.login(auth.token)