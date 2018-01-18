var Dice = new require("./dice")
var assert = new require("assert")

class Expression{
	constructor(expression){
		this.expression = expression
	}
	
	evaluate(){
		let expansion = this.expression.replace(/(\d*)d(\d+)/g, (match) => "(" + (new Dice(match)).roll().join("+") +")")
		var trimmed = expansion.replace(/[^-()\d/*+.]/g, '')
		try{
			let total = eval(trimmed)
			this.total = total
			this.expansion = trimmed
			return {expression: trimmed, total: total}
		}
		catch(e){
			assert.fail(this.expression + " is an invalid Expression")
		}
	}	
}

module.exports = Expression