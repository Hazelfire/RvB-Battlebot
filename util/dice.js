var assert = require("assert")

// Rolls a dice of the form #d#
var validDice = [4,6,8,10,12,20,100]
class Dice{
	constructor(expression){
		let match = expression.match(/^(\d*)d(\d+)$/)
		var correctFormat = match
		var diceCountLargerThan0 = parseInt(match[1]) > 0
		assert(correctFormat, "Dice must be of the correct format")
		assert(diceCountLargerThan0, "Dice count must not be 0")
		this.count = match[1]
		this.size = match[2]
	}
	
	roll(){
		let rolls = []
		for(let i = 0; i<this.count; i++){
			rolls.push(Math.floor(this.size * (Math.random()) + 1))
		}
		return rolls
	}
}

module.exports = Dice