var assert = require("assert")
var playerData = require('./characterData')
const Expression = require('./util/expression')
const _ = require('lodash')
let xpScaling = 5

levelCaps = [0, 300, 900, 2700, 6500, 1400, 2300, 3400, 4800, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000].map((xp)=>xp/xpScaling)
class Player{
	constructor(){
		
	}
	
	static fromMention(userMention){
		let player = new Player()
		let match = userMention.match(/^<@!?(.*)>$/)
		assert(match, userMention + " is not a valid player mention")
		
		player.id=match[1]
		this.setSavedInfo(player, player.id)
		player.advantage = false
		player.disadvantage = false
		
		
		return player
	}
	
	static setSavedInfo(player, playerID){
		let saveInfo = playerData.get(playerID)
		
		assert(saveInfo.hp, "you have not set a hp maximum, use !hpmax to set")
		player.hp = saveInfo.hp
		player.hpMax = saveInfo.hp

		assert(saveInfo.hp, "you have not set an ac, use !ac to set")
		player.ac = saveInfo.ac
		
		player.scores = saveInfo.scores
		
    player.vulnerabilities = saveInfo.vulnerabilities;
    player.resistances = saveInfo.resistances;

		if(!saveInfo.xp){
			saveInfo.xp = 0
			playerData.save()
		}
		player.xp = saveInfo.xp
		
		player.saveProfs = saveInfo.saveProfs
	}
	
	static fromID(userID){
		let player = new Player()
		player.id = userID
		this.setSavedInfo(player, player.id)
		
		player.advantage = false
		player.disadvantage = false
		
		return player
	}
	
	mention(){
		return "<@!" + this.id + ">"
	}
	
	getID(){
		return this.id
	}
	
	reference(){
		return this.mention()
	}
	
	getController(){
		return this
	}
	
  saveThrow(type){
    let saveBonus = target.getModifiers()[type];
    if(this.hasSaveProfinciency(type)){
      saveBonus += this.getProficiencyBonus();
    }
    return new Expression("1d20+" + saveBonus);
  }

  getAttackByName(name){
		let savedAttacks = playerData.get(this.id).attacks
		let attack = savedAttacks.find((candidate)=>candidate.name === name)
		assert(attack, name + " is not one of your saved attacks")
    return attack;
  }


	attack(target, attackName){
    let attack = this.getAttackByName(attackName);
    let attackExpression, defenceExpression;
		if(attack.defenceType == "ac"){
			defenceExpression = new Expression(target.ac + "")
		  attackExpression = new Expression("1d20" + attack.attackRoll)
		}else{
			defenceExpression = new Expression("1d20 +" + target[attack.defenceType + "save"])
      attackExpression = new Expression(attack.attackRoll + "")

		}
		let attackRoll = this.rollAttack(this.expandModifiers(attack.attackRoll))
		this.advantage = false
		this.disadvantage = false
		defenceExpression.evaluate()
    let damageExpression;
    if(target.vulnerabilities.includes(attack.damageType)){
      damageExpression = new Expression("2*("+this.expandModifiers(attack.damageRoll)+")");
    }else if(target.resistances.includes(attack.damageType)){
       damageExpression = new Expression("0.5*(" + this.expandModifiers(attack.damageRoll) + ")");
    }else{
       damageExpression = new Expression(this.expandModifiers(attack.damageRoll));
    }
    
			
    damageExpression.evaluate()

    let message = "";
		if(attackRoll >=defenceExpression.total){
			target.changeHP(-damageExpression.total)
			
			message += this.mention() + " attacked " + target.mention() + " and dealt " + damageExpression.total + "! ( " + damageExpression.expansion + " )"
		}else if(attack.aoe){
      let halfDamage = Math.floor(damageExpression.total/2);
      target.changeHP(-halfDamage);

      message = target.mention() + " succeeded on their save (" + attackRoll + " vs " + defenceExpression + "), and took " +  damageExpression.total + " damage"

    }else{
			message = this.mention() + " missed! (" + attackRoll + " vs " + defenceExpression.total + ")"
		}
    if(target.isDead()){
      message += "\n" + target.mention() + " has died"
      let pastLevel = this.getLevel()
      this.awardXP(target.getXP() + 100)
      let currentLevel = this.getLevel()
      
      if(pastLevel < currentLevel){
        message += "\n" + this.mention() + " is now level " + currentLevel
      }
    }
    return message;
	}
	

	rollAttack(bonus){
		let attackExpression = new Expression("1d20")
    let roll;
		if(this.advantage){
			roll = Math.max(attackExpression.evaluate().total, attackExpression.evaluate().total)
		}else if(this.disadvantage){
			roll = Math.min(attackExpression.evaluate().total, attackExpression.evaluate().total)
		}else{
			roll = attackExpression.evaluate().total
	  }
  }
	
	expandModifiers(expression){
		let replacements = _.clone(this.getModifiers())
		replacements.prof = this.getProficiencyBonus()
		let finishedExpression = expression
		Object.entries(replacements).forEach((replacement)=>{
			finishedExpression = finishedExpression.replace(replacement[0],replacement[1])
		})
		return finishedExpression
	}
	
	getHP(){
		return this.hp
	}
	
	setHP(hp){
		this.hp = hp
	}
	
	changeHP(amount){
		this.hp =Math.min(amount + this.hp,this.hpMax)
	}
	
	isDead(){
		return this.hp <= 0
	}
	
	toggleAdvantage(){
		this.advantage = !this.advantage
		if(this.advantage){
			this.disadvantage = false
		}
	}
	
	hasAdvantage(){
		return this.advantage
	}
	
	toggleDisadvantage(){
		this.disadvantage = !this.disadvantage
		if(this.disadvantage){
			this.advantage = false
		}
	}
	
	hasDisadvantage(){
		return this.disadvantage
	}
	
	getLevel(){
		let levelCount = 0
		levelCaps.forEach((cap)=>{
			if(cap <=this.xp){
				levelCount += 1
			}
		})
		return levelCount
	}
	
	getXP(){
		return this.xp
	}
	
	awardXP(amount){
		let player = playerData.get(this.id)
		player.xp += amount
		this.xp += amount
		playerData.save()
	}
	
	getProficiencyBonus(){
		return Math.ceil(this.getLevel()/4) + 1
	}
	
	setXP(amount){
		let player = playerData.get(this.id)
		player.xp = amount
		this.xp = amount
		playerData.save()
	}
	
	getModifiers(){
		return Object.entries(this.scores).map((scorePair)=>[scorePair[0],Math.floor((scorePair[1] - 10)/ 2)]).reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {})
	}
	
	hasSaveProficiency(prof){
		return this.saveProfs.includes(prof)
	}
}

module.exports = Player
