const fs = require('fs')

var playerInfo = JSON.parse(fs.readFileSync('userdata.json'))

class CharacterData{
	constructor(){
		
	}
	
	static get(id){
		if(!playerInfo[id]){
			playerInfo[id] = {"attacks":[], "scores": {"str": 10, "dex": 10,"int": 10, "con": 10, "wis": 10, "cha": 10}, "hp": 10, "ac": 10, "xp": 0, saveProfs: [], "vulnerabilities": [], "resistances": []}
		}
		return playerInfo[id]
	}
	
	static save(){
		fs.writeFile("userdata.json", JSON.stringify(playerInfo), (err)=>{})
	}
	
}

module.exports = CharacterData
