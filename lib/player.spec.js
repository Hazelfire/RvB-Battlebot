const Player = require('./player');
const expect = require('chai').expect;
const assert = require('assert');
const _ = require('lodash');
const Expression = require('./util/expression');
var playerData = require('./characterData');

describe('Player', ()=>{
	describe('fromMention', ()=>{
		it('should fail on bad mention', ()=>{
			expect(()=>Player.fromMention('not-a-valid-mention')).to.throw(assert.AssertionError)
		})
		it('should succeed on valid mention', ()=>{
			Player.fromMention('<@!1234567809876543>')
		})
		it('should succeed on strange format mention', ()=>{
			Player.fromMention('<@1234567809876543>')
		})
		it('should successfully extract id from mention', ()=>{
			let player = Player.fromMention('<@!1234567809876543>')
			expect(player.getID()).to.be.equal('1234567809876543')
		})
	})
	describe('fromID', ()=>{
		it('should not throw', ()=>{
			Player.fromID('test')
		})
		it('should correctly set id', ()=>{
			let player = Player.fromID('test')
			expect(player.getID()).to.be.equal('test')
		})
	})
	describe('mention', ()=>{
    let mention, player;
    it('should not throw on create player', ()=>{
      mention = '<@!1234567809876543>'
      player = Player.fromMention(mention)
    });
		it('should not throw', ()=>{
			player.mention()
		})
		it('should be the same as original mention', ()=>{
			expect(player.mention()).to.be.equal(mention)
		})
	})
	describe('reference', ()=>{
    let mention, player;
    it('should not throw on create player', ()=>{
      mention = '<@!1234567809876543>'
      player = Player.fromMention(mention)
    });
		it('should be the same as mention', ()=>{
			expect(player.reference()).to.be.equal(player.mention())
		})
	})
	describe('getController', ()=>{
    let mention, player;
    it('should not throw on create player', ()=>{
      mention = '<@!1234567809876543>'
      player = Player.fromMention(mention)
    });
		it('should be equal to self', ()=>{
			expect(player.getController()).to.equal(player)
		})
	})
	describe('attack', ()=>{ // TODO this test is horrible, try again
    let attacker, target;
    it('should not throw on create players', ()=>{
      attacker = Player.fromID('test1');
		  target = Player.fromID('test2');

      let attack = {
        name: "test",
        attackRoll: "+2",
        defenceType: "ac",
        damageRoll: "1d10",
        damageType: "slashing",
        aoe: false
      };
      
      playerData.get('test1').attacks.push(attack);

    });
		it('should not throw', ()=>{
			attacker.attack(target, "test");
		});
	})
})
