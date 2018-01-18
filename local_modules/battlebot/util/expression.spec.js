const Expression = require('../util/expression')
const expect = require('chai').expect
const Exception = require('assert').AssertionError

describe('Expression', ()=>{
	describe('happy path', ()=>{
		let expression;
		let roll = "2d8 + 2"
		it('should not throw on constructor', ()=>{
			expression = new Expression(roll)
		})
		it('should have set expression correctly',()=>{
			expect(expression.expression).to.be.equal(roll)
		})
		it('should evaluate without error', ()=>{
			expression.evaluate()
		})
	})
	describe('unhappy path', ()=>{
		it('should throw on invalid roll', ()=>{
			let expression = new Expression("2***4")
			expect(()=>expression.evaluate()).to.throw(Exception)
		})
	})
})
