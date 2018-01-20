var _ = require('lodash');
var commands = require('./commands')
var assert = require('assert')
class BattleBot{
	constructor(){
		this.errors = require('./errors.json')
	}
	
	message(message, userID, channelID){
		try{
			let args = message.split(" ").filter((arg) => arg.length > 0)
			assert(commands[args[0]], args[0] + " is not a command")
			return commands[args[0]](_.tail(args),userID,channelID)
		}catch(e){
			if(e instanceof assert.AssertionError){
				return e.message
			}else{
				console.log(e)
				return _.sample(this.errors)
			}
		}
	}
}

module.exports = BattleBot;
