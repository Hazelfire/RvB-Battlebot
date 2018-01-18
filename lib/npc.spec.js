const NPC = require('./npc')
const Player = require('./player')
const expect = require('chai').expect
const Expression = require('../util/expression')
const _ = require('lodash')

describe('NPC', ()=>{
	describe('#consructor',()=>{
    let controller;
    it('should not thow on creating controller', ()=>{
      controller = Player.fromID('id');
    })
		let npc;
		it('should not throw on contructor', ()=>{
			npc = new NPC(controller, 'Goblin', 'TST1')
		})
		it('should have the controller set correctly', ()=>{
			expect(npc.getController()).to.be.equal(controller)
		})
		it('should have the name set correctly', ()=>{
			expect(npc.mention()).to.include('Goblin');
		})
		it('should have the id set correctly', ()=>{
			expect(npc.getID()).to.be.equal('TST1')
			expect(npc.reference()).to.be.equal('TST1')
		})
	})
	describe('attacking', ()=>{
    let controller, npc;
    it('should not throw on contructor', ()=>{
      controller = Player.fromID('id')
      npc = new NPC(controller, 'Goblin', 'TST1')
    })
		it('should not throw on attack', ()=>{
			npc.attack(npc, "scimitar")
		})
	})
})
