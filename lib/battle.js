var assert = require("assert")
var Dice = require("./util/dice")
var _ = require("lodash")

class Battle{
	constructor(){
		this.players = []
		this.started = false
	}
	
	start(){
		assert(!this.hasStarted(), "The battle has already started")
		this.rollInitiative()
		this.turn = 0
		this.started = true
	}
	
	hasStarted(){
		return this.started
	}
	
	addPlayer(player){
		assert(!this.includes(player), player.mention() + " is already in the battle")
		this.players.push(player)
	}
	
	includes(player){
		return this.players.map((candidate)=>candidate.id).includes(player.getID())
	}
	
	getTurn(){
		assert(this.hasStarted(), "Can't get the turn of a battle that has not started")
		return this.players[this.turn]
	}
	
	setTurn(player){
		assert(this.hasStarted(), "Can't set the turn of a battle that has not started")
		this.turn = this.players.indexOf(player)
	}
	
	nextTurn(){
		assert(this.hasStarted(), "Can't change the turn of a battle that has not started")
		this.turn = (this.turn + 1) % this.players.length 
	}
	
	removePlayer(player){
		assert(this.includes(player), player.mention() + " is not in the battle")
		let playerIndex = this.players.indexOf(player)
		this.players.splice(playerIndex, 1)
		if(this.players.length != 0){
			if(this.turn > playerIndex){
				this.turn--;
			}
			this.turn = this.turn % this.players.length
		}else{
			this.started = false
		}
	}
	
	playerCount(){
		return this.players.length
	}
	
	rollInitiative(){
		let initiative = (new Dice(this.playerCount() + "d20")).roll()
		let initiativeOrder = _.sortBy(_.zip(initiative, this.players), (initiativePair) => -(initiativePair[0] + parseInt(initiativePair[1].scores.dex)))
		this.players = initiativeOrder.map((initiativePair) => initiativePair[1])
	}
	
	getInitiative(){
		assert(this.hasStarted(), "The battle must have started to get initiative")
		return this.players.clone()
	}
	
	getInitiativeAsString(){
		return this.players.map((player)=>player.mention()).join("\n")
	}
	
	setInitiative(initiative){
		assert(this.hasStarted(), "The battle must have started to set initiative")
		this.players = _.sortBy(_.zip(initiative, this.players), (userPair) => userPair[0]).map((userPair) => userPair[1])
	}
	
	getPlayerFromMention(mention){
		let match = mention.match(/^<@!?(.*)>$/)
		if(match){
			// Is a player, get them by id
			return this.getPlayerFromID(match[1])
		}else{
			// Is a npc, mention is id
			return this.getPlayerFromID(mention)
		}
	}
	
	getPlayerFromID(ID){
		let player = this.players.find((player) => player.getID() == ID)
		assert(player, "<@!"+ID + "> is not in the battle")
		return player
	}
	
	toString(){
		return "Battle"
	}
}

module.exports = Battle
