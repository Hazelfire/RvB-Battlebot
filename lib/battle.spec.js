const Battle = require('./battle')
const Player = require('./player')
const expect = require('chai').expect
const Exception = require('assert').AssertionError
const _ = require('lodash')

describe('Battle', ()=>{
	describe('constructor', () =>{
		let battle;
		it('should not throw on constructor',()=>{
			battle = new Battle()
		})
		it('should not have started', ()=>{
			expect(battle.hasStarted()).to.be.false
		})
		it('should not have any players', ()=>{
			expect(battle.playerCount()).to.be.equal(0)
		})
		it('should not allow getting a turn', ()=>{
			expect(() => battle.getTurn()).to.throw(Exception)
		})
		it('should not allow setting a turn', ()=>{
			expect(() => battle.setTurn(new Player())).to.throw(Exception)
		})
		it('should not next turn', ()=>{
			expect(()=>battle.nextTurn()).to.throw(Exception)
		})
		it('should not allow getting initiative', ()=>{
			expect(() =>battle.getInitiative()).to.throw(Exception)
		})
		it('should not allow setting initiative', ()=>{
			expect(()=>battle.setInitiative([])).to.throw(Exception)
		})
	})
	
	describe('get and add players', ()=>{
    let player, id, battle;
    it('should not throw on player construction', ()=>{
      id = 'test'
      battle = new Battle()
      player = Player.fromID(id)
    })
		it('should not throw error on add', ()=>{
			battle.addPlayer(player)
		})
		
		it('should have one player',()=>{
			expect(battle.playerCount()).to.be.equal(1)
		})
		it('should be able to get player by id', ()=>{
			expect(battle.getPlayerFromID(id)).to.be.equal(player)
		})
		it('should be able to get player by reference', ()=>{
			expect(battle.getPlayerFromMention(player.mention())).to.be.equal(player)
		})
		it('should include player', ()=>{
			expect(battle.includes(player)).to.be.true
		})
	})
	
	describe('removing players', ()=>{
    let players, battle;
		let playerNames = ["1", "2", "3", "4", "5", "6"]
    it('should not throw on adding players', ()=>{
      players = playerNames.map((name)=>Player.fromID(name))
      battle = new Battle()
      players.forEach((player)=>{
        battle.addPlayer(player)
      })
    })
		it('should not allow removing non existant players', ()=>{
			let newPlayer = Player.fromID('new')
			expect(()=>battle.removePlayer(newPlayer)).to.throw(Exception)
		})
		it('should allow removing the first player', ()=>{
			battle.removePlayer(_.first(players))
		})
		it('should allow removing the last player', ()=>{
			battle.removePlayer(_.last(players))
		})
		it('should allow removing all players',()=>{
			players.slice(1, players.length - 1).forEach((player)=>{
				battle.removePlayer(player)
			})
		})
		it('removing the last player should stop the battle', ()=>{
			expect(battle.hasStarted()).to.be.false
		})
	})
	
	describe('start', ()=>{
    let battle;
    it('should not throw on adding players', ()=>{
    
      let player1 = Player.fromID('test1')
      let player2 = Player.fromID('test2')
      battle = new Battle()
      battle.addPlayer(player1)
      battle.addPlayer(player2)
    })
		it('should not throw on start', ()=>{
			battle.start()
		})
		it('should have started', ()=>{
			expect(battle.hasStarted()).to.be.true
		})
	})
	
	describe('get and set turns', ()=>{
    let players, battle;
		let playerNames = ["1", "2", "3", "4", "5", "6"]
    it('should not throw on adding players', ()=>{
      players = playerNames.map((name)=>Player.fromID(name))
      battle = new Battle()
      players.forEach((player)=>{
        battle.addPlayer(player)
      })
      battle.start()
    })
		it('should allow getTurn', ()=>{
			battle.getTurn()
		})
		it('nexTurn should be a different player', ()=>{
			let lastTurn = battle.getTurn()
			battle.nextTurn()
			expect(battle.getTurn()).to.not.equal(lastTurn)
		})
		
		it('current turn should be a player',()=>{
			expect(battle.includes(battle.getTurn())).to.be.true
		})
		it('should allow setTurn', ()=>{
			battle.setTurn(_.sample(players))
		})
		it('should change turn when setTurn', ()=>{
			let player = _.sample(players)
			battle.setTurn(player)
			expect(battle.getTurn()).to.be.equal(player)
		})
	})
})
