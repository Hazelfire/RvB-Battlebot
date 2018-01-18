var assert = require("assert")
var Expression = require("../util/expression")
var BattleRegistry = require("./battleregistry")
var NPC = require("./npc")
var Player = require('./player')
var playerData = require('./characterData')
let _ = require("lodash")

let battles = new BattleRegistry()
module.exports = {
	'battle': function(args, userID, channelID){
		battles.addBattle(channelID)
		return "Starting up a battle, type !in to play!"
	},
	'roll': function(args, userID, channelID){
		assert(args.length > 0, "Usage: roll [dice]")
		let expression = new Expression(args.join(" "))
		expression.evaluate()
		return expression.expansion + " = " + expression.total
	},
	'in': function(args, userID, channelID){
		let player = Player.fromID(userID)
		if(args.length > 0){
			player = Player.fromMention(args[0])
		}
		
		let battle = battles.getBattle(channelID)
		battle.addPlayer(player)
		return player.mention() + " is in the battle"
	},
	'turn': function(args, userID, channelID){
		let battle = battles.getBattle(channelID)
		if(args.length == 0){
			let player = battle.getTurn()
			return "it is now " + player.mention() + "'s turn"
		}else{
			let player = battle.getPlayerFromMention(args[0])
			battle.setTurn(player)
			return "it is now " + player.mention() + "'s turn"
		}
	},
	'start': function(args, userID, channelID){
		let battle = battles.getBattle(channelID)
		battle.start()
		let initiative = battle.getInitiativeAsString()
		let turn = module.exports.turn([],userID,channelID)
		return initiative + "\n" + turn
	},
	"end": function(args, userID, channelID){
		battles.endBattle(channelID)
		return "Ended the battle"
	},
	"attack": function(args, userID, channelID){
		let battle = battles.getBattle(channelID)
		assert(userID == battle.getTurn().getController().getID(), "It is not <@!" + userID + ">'s turn")
		let attacking = battle.getTurn()
		let targets = _.tail(args).map((playerMention)=>battle.getPlayerFromMention(playerMention))
    let message = "";
    targets.forEach((target)=>{
      message += attacking.attack(target, args[0]) + "\n";
      if(target.isDead()){
        battle.removePlayer(target)
      }
    });
		return message
	},
	"pass": function(args,userID,channelID){
		let battle = battles.getBattle(channelID)
		assert(userID == battle.getTurn().getController().getID(), "You cannot pass someone else's turn")
		battle.nextTurn()
		return module.exports.turn([],userID,channelID)
	},
	"end": function(args,userID,channelID){
		let battle = battles.getBattle(channelID)
		assert(userID == battle.getTurn().getController().getID(), "You cannot end someone else's turn")
		battle.nextTurn()
		return module.exports.turn([],userID,channelID)
	},
	"add": function(args, userID, channelID){
		let battle = battles.getBattle(channelID)
		assert(args.length>=3, "Usage: add [id] [controller] [name]")
		let id = args[0]
		let controller = Player.fromMention(args[1])
		let name = args.slice(2, args.length).join(" ")
		let npc = new NPC(controller, name, id)
		battle.addPlayer(npc)
		return npc.mention() + " has been added to the battle"
	},
	"die": function(args, userID, channelID){
		let battle = battles.getBattle(channelID)
		let player;
		if(args.length > 0){
			player = battle.getPlayerFromMention(args[0])
		}else{
			player = battle.getPlayerFromID(userID)
		}
		battle.removePlayer(player)
		
		let message = player.mention() + " has died!"
		
		if(battle.playerCount() == 0){
			message += "\nEveryone is now dead\n" + module.exports.end([],userID,channelID)
		}
		return message
	},
	"leave": function(args,userID,channelID){
		let battle = battles.getBattle(channelID)
		let player; 
		if(args.length > 0){
			player = battle.getPlayerFromMention(args[0])
		}else{
			player = battle.getPlayerFromID(userID)
		}
		battle.removePlayer(player)
		
		let message = player.mention() + " has left!"
		
		if(battle.playerCount() == 0){
			message += "\nNo-one is in the battle\n" + module.exports.end([],userID,channelID)
		}
		return message
	},
	"initiative": function(args,userID,channelID){
		let battle = battles.getBattle(channelID)
		let message
		if(args.length == battle.playerCount()){
			message = "Changing initiative order"
			let initiative = args.map((item) => parseInt(item))
			battle.setInitiative(initiative)
		}
		return "The initiative order is:\n" + battle.getInitiativeAsString()
	},
	"hp": function(args,userID, channelID){
		let battle = battles.getBattle(channelID)
		let player;
		if(args[0]){
			player = battle.getPlayerFromMention(args[0])
		}else{
			player = battle.getPlayerFromID(userID)
		}
		if(args[1]){
			let hp = parseInt(args[1])
			assert(hp, "hp must be an integer")
			player.setHP(hp)
		}
		return player.mention() + "'s hp is " + player.getHP()
	},
	"hpmax": function(args, userID, channelID){
		let player = playerData.get(userID)
		if(args[0]){
			let hp = parseInt(args[0])
			assert(hp, "hp must be an integer")
			player.hp = hp
			playerData.save()
			return "Hit point maximum set to " + player.hp
		}else{
			return "Your hit point maximum is " + player.hp
		}
	},
	"ac": function(args, userID, channelID){
		let player = playerData.get(userID)
		if(args[0]){
			let ac = parseInt(args[0])
			assert(ac, "ac must be an integer")
			player.ac = ac
			playerData.save()
			return "Armor class set to " + player.ac
		}else{
			return "Your armor class is " + player.ac
		}
	},
	"dex": function(args, userID, channelID){
		let player = playerData.get(userID)
		if(args[0]){
			let dex = args[0]
			player.scores.dex = dex
			playerData.save()
			return "Dexterity set to " + player.scores.dex
		}else{
			return "Your dexterity is " + player.scores.dex
		}
	},
	"str": function(args, userID, channelID){
		let player = playerData.get(userID)
		if(args[0]){
			let str = args[0]
			player.scores.str = str
			playerData.save()
			return "Strength is set to " + player.scores.str
		}else{
			return "Your strength is " + player.scores.str
		}
	},
	"int": function(args, userID, channelID){
		let player = playerData.get(userID)
		if(args[0]){
			let intelligence = args[0]
			player.scores.int = intelligence
			playerData.save()
			return "Intelligence is set to " + player.scores.int
		}else{
			return "Your intelligenc is " + player.scores.int
		}
	},
	"con": function(args, userID, channelID){
		let player = playerData.get(userID)
		if(args[0]){
			let con = args[0]
			player.scores.con = con
			playerData.save()
			return "Constitution set to " + player.scores.con
		}else{
			return "Your constitution is " + player.scores.con
		}
	},
	"wis": function(args, userID, channelID){
		let player = playerData.get(userID)
		if(args[0]){
			let wis = args[0]
			player.scores.wis = wis
			playerData.save()
			return "Wisdom set to " + player.scores.wis
		}else{
			return "Your wisdom is " + player.scores.wis
		}
	},
	"cha": function(args, userID, channelID){
		let player = playerData.get(userID)
		if(args[0]){
			let cha = args[0]
			player.scores.cha = cha
			playerData.save()
			return "Charisma set to " + player.scores.cha
		}else{
			return "Your charisma is " + player.scores.cha
		}
	},
	"newattack": function(args, userID, channelID){
		let player = playerData.get(userID)
    assert(args.length >= 4, "Usage: !newattack <name> <attack roll> <defence type> <damage roll> <damage type> [AOE]");
		attackObject = {}
		attackObject.name = args[0]
		attackObject.attackRoll = args[1]
  	attackObject.defenceType = args[2]
		attackObject.damageRoll = args[3]
    attackObject.damageType = args[4]
    attackObject.aoe = args[5] == "aoe"
		player.attacks.push(attackObject)
		playerData.save()
		return "Created new attack"
	},
	"attacks": function(args, userID, channelID){
		let player = playerData.get(userID)
		if(player.attacks.length > 0){
			return player.attacks.map((attack,index)=> (index + 1) + ": " + attack.name).join("\n")
		}else{
			return "You have no saved attacks"
		}
	},
	"removeattack": function(args, userID, channelID){
		let player = playerData.get(userID)
		let attack = player.attacks.find((attack)=>attack.name==args[0])
		if(attack){
			player.attacks.splice(player.attacks.indexOf(attack), 1)
			playerData.save()
			
			return args[0] + " was removed from your attacks"
		}else{
			return args[0] + " is not an attack"
		}
	},
	"defences": function(args, userID, channelID){
		let player = Player.fromID(userID);
		let message = "";
		message+= "HP Maximum: " + player.getHP();
		message+= "\nArmor Class: " + player.ac;
		let scores = player.scores
		Object.entries(scores).forEach((scorePair)=>{
			let saveBonus = Math.floor((scorePair[1] -10)/2)
			if(player.hasSaveProficiency(scorePair[0])){
				saveBonus += player.getProficiencyBonus()
			}
			message += "\n" + scorePair[0] + " save: " + saveBonus
		})
		return message
	},
	"scores": function(args, userID, channelID){
		let player = playerData.get(userID);
		let message = "Scores:";
		let scores = player.scores
		Object.entries(scores).forEach((scorePair)=>{
			message += "\n" + scorePair[0] + ": " + scorePair[1] + " (" + Math.floor((parseInt(scorePair[1]) -10)/2) + ")"
		})
		return message
	},
	"showattack": function(args,userID,channelID){
		let player = playerData.get(userID);
		let attack = player.attacks.find((attack)=>attack.name==args[0])
		let message = "";
		message+= "Attack Bonus: " + attack.attackRoll;
		message+= "\nDefence type: " + attack.defenceType;
		message+= "\nDamage roll: " + attack.damageRoll;
		return message
	},
	"advantage": function(args,userID,channelID){
		let battle = battles.getBattle(channelID)
		let player; 
		if(args[0]){
			player = battle.getPlayerFromMention(args[0])
		}else{
			player = battle.getPlayerFromID(userID)
		}
		if(player.hasAdvantage()){
			return player.mention() + " has advantage"
		}else if(player.hasDisadvantage()){
			return player.mention() + " has disadvantage"
		}else{
			return player.mention() + " does not have advantage or disadvantage"
		}
	},
	"giveadvantage": function(args,userID,channelID){
		let battle = battles.getBattle(channelID)
		let player = battle.getPlayerFromID(userID)
		if(args[0]){
			player = battle.getPlayerFromMention(args[0])
		}else{
			player = battle.getPlayerFromID(userID)
		}
		player.toggleAdvantage()
		
		if(player.hasAdvantage()){
			return player.mention() + " now has advantage"
		}else{
			return player.mention() + " has lost advantage"
		}
	},
	"givedisadvantage": function(args,userID,channelID){
		let battle = battles.getBattle(channelID)
		let player;
		if(args[0]){
			player = battle.getPlayerFromMention(args[0])
		}else{
			player = battle.getPlayerFromID(userID)
		}
		player.toggleDisadvantage()
		
		if(player.hasDisadvantage()){
			return player.mention() + " now has disadvantage"
		}else{
			return player.mention() + " has lost disadvantage"
		}
	},
	"level": function(args, userID, channelID){
		let player = Player.fromID(userID)
		if(args[0]){
			player = Player.fromMention(args[0])
		}
		return player.mention() + " is level " + player.getLevel()
	},
	"xp": function(args, userID, channelID){
		let player = Player.fromID(userID)
		if(args[0]){
			player = Player.fromMention(args[0])
		}
		if(args[1]){
			assert(parseInt(args[1])!==NaN, args[1] + " is not a number")
			player.setXP(parseInt(args[1]))
		}
		return player.mention() + " has " + player.getXP() + " XP"
	},
	"proficiency": function(args, userID, channelID){
		let player = Player.fromID(userID)
		if(args[0]){
			player = Player.fromMention(args[0])
		}
		return player.mention() + " has a proficiency bonus of " + player.getProficiencyBonus()
	},
	"damage": function(args, userID, channelID){
		assert(args.length > 1, "Usage: !damage [player] [hp]")
		let battle = battles.getBattle(channelID)
		let player = battle.getPlayerFromMention(args[0])
		assert(parseInt(args[1])!== NaN, args[1] + " is not a number")
		player.changeHP(-parseInt(args[1]))
		message = "Removed " + args[1] + " hp from " + player.mention()
		if(player.isDead()){
			module.exports.die(args[0], userID, channelID)
		}
	},
	"savingproficiencies": function(args, userID, channelID){
		let player = playerData.get(userID)
		if(args[0]){
			player.saveProfs = args
			playerData.save()
		}
		return "<@!" + userID + "> has a save proficiencies " + player.saveProfs.join(" ")
	},
}
