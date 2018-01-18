const BattleRegistry = require('./battleregistry')
const expect = require('chai').expect
const assert = require('assert')
const _ = require('lodash')

describe('BattleRegistry',()=>{
	describe('constructor', ()=>{
		it('should not throw',()=>{
			expect(()=>new BattleRegistry()).to.not.throw()
		})
	})
	describe('adding battles', ()=>{
		let battleRegistry = new BattleRegistry()
		it('should add the battle', ()=>{
			battleRegistry.addBattle('id')
			expect(battleRegistry.getBattle('id').toString()).to.be.equal('Battle')
		})
		it('should not allow getting battles that do not exist', ()=>{
			expect(()=>battleRegistry.getBattle('not-an-id')).to.throw(assert.AssertionError)
		})
		it('should not allow adding battles for ids that already exist', ()=>{
			battleRegistry.addBattle('id2')
			expect(()=>battleRegistry.addBattle('id2')).to.throw(assert.AssertionError)
		})
	})
	describe('ending battles', ()=>{
		let battleRegistry = new BattleRegistry()
		it('should delete the battle', ()=>{
			battleRegistry.addBattle('id')
			battleRegistry.endBattle('id')
			expect(()=>battleRegistry.getBattle('id')).to.throw(assert.AssertionError)
		})
		it('should throw on deleting non-existant battle', ()=>{
			expect(()=>battleRegistry.endBattle('not-an-id')).to.throw(assert.AssertionError)
		})
	})
})