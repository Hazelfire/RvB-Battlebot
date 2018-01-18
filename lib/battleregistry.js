var assert = require("assert")
var Battle = require("./battle")

class BattleRegistry{
	constructor(){
		this.battles = {}
	}
	
	addBattle(channelID){
		assert(!this.battles[channelID], "A battle has already been created for this channel")
		this.battles[channelID] = new Battle()
	}
	
	getBattle(channelID){
		let battle = this.battles[channelID]
		assert(battle, "The battle has not been created for this channel")
		return battle
	}
	
	endBattle(channelID){
		assert(this.battles[channelID], "The battle has not been created yet");
		delete this.battles[channelID]
	}
}

module.exports = BattleRegistry