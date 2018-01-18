const monsters = require('./monsters.json')
const assert = require('assert')
const Expression = require('../util/expression')

class NPC{
	constructor(controller, name, id){
		this.controller = controller
		this.name = name
		this.id = id
		this.setSavedInfo(name)
		this.advantage = false
		this.disadvantage = false
	}
	
	setSavedInfo(name){
		let saveInfo = monsters[name]
		assert(saveInfo, name + " is not a saved monster")
		let hpExpression = new Expression(saveInfo.hpmax)
		hpExpression.evaluate()		
		this.hp = hpExpression.total
		this.hpMax = hpExpression.total
		this.attacks = saveInfo.attacks
		this.ac = saveInfo.ac
		this.scores = saveInfo.scores
		this.xp = saveInfo.xp
	}
	
	mention(){
		return this.name + "(" + this.id + ", controlled by " + this.controller.mention() + ")" 
	}
	
	getID(){
		return this.id
	}
	
	getXP(){
		return this.xp
	}
	
	reference(){
		return this.getID()
	}
	
	getController(){
		return this.controller
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
	
	rollAttack(bonus){
		let attackExpression = new Expression("1d20" + bonus)
		if(this.advantage){
			return Math.max(attackExpression.evaluate().total, attackExpression.evaluate().total)
		}else if(this.disadvantage){
			return Math.min(attackExpression.evaluate().total, attackExpression.evaluate().total)
		}else{
			return attackExpression.evaluate().total
		}
	}
	
	attack(target, attackName){
		let savedAttacks = this.attacks
		let attack = savedAttacks.find((candidate)=>candidate.name === attackName)
		assert(attack, attackName + " is not one of your saved attacks")
		
    let attackExpression;
		let defenceExpression;
		if(attack.defenceType == "ac"){
			defenceExpression = new Expression(target.ac + "")
		  attackExpression = new Expression("1d20" + attack.attackRoll)
		}else{
			defenceExpression = new Expression("1d20 +" + target[attack.defenceType + "save"])
      attackExpression = new Expression(attack.attackRoll + "")

		}
		let attackRoll = this.rollAttack(attack.attackRoll)
		this.advantage = false
		this.disadvantage = false
		defenceExpression.evaluate()
    let damageExpression = new Expression(attack.damageRoll)
			
    damageExpression.evaluate()

    let message;
    if(attackRoll >=defenceExpression.total){
			target.changeHP(-damageExpression.total)
			
			message = this.mention() + " attacked " + target.mention() + " and dealt " + damageExpression.total + "! ( " + damageExpression.expansion + " )"
			return message
		}else if(attack.aoe){
      let halfDamage = Math.floor(damageExpression.total/2);
      target.changeHP(-halfDamage);

      message = target.mention() + " succeeded on their save (" + attackRoll + " vs " + defenceExpression + "), and took " +  damageExpression.total + " damage"
		}
    if(target.isDead()){
      message += "\n" + target.mention() + " has died"
    }
    return message;
	}
	
	getModifiers(){
		return Object.entries(this.scores).map((scorePair)=>[scorePair[0],Math.floor((scorePair[1] - 10)/ 2)]).reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {})
	}
	
	hasSaveProficiency(prof){
		return false
	}
}

module.exports = NPC
