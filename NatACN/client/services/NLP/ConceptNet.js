import * as Utils from '../../models/Utils.js';
import { Instruction } from "../../models/Instruction.js";

class ConceptNet
{
	static last_time = 0;
	static RelatedDico = [];
	static SynsetToAsk = ["Synonym","RelatedTo"]
	
	static async  _fetch(uri)
	{
		//Too many request Handle
		let time_now = Date.now()
		let i = 0;
		while(time_now - ConceptNet.last_time<1010 && i<11)
		{
			i++;
			time_now = Date.now();
			await Utils.sleep(100);
			//console.error(time_now, ConceptNet.last_time);
		}
		
		ConceptNet.last_time = time_now;
		//console.log(time_now, ConceptNet.last_time);
		
		const JSON = await fetch(uri
			).then((value) => { return value.json(); });
		return JSON;
	}
	
	/**
	 * Recupère les synonymes d'un mot
	 * @param {*} word 
	 * @returns 
	 */
	static async getSynonyms(word)
	{
		const synonyms = [];
		let edges = [];
		for (const synset of ConceptNet.SynsetToAsk)
		{
			const uri = "http://api.conceptnet.io/query?start=/c/en/"+Utils.snakize(Utils.uncamelize(word.toString()))+"&rel=/r/"+synset+"&filter=/c/en";
			console.log("Asking for synonyms :"+uri);
			const fetch = await ConceptNet._fetch(uri);
			//console.log(fetch);
			edges = edges.concat(fetch.edges);
			//console.log(edges);
		}
		
		for (const edge of edges )
		{
			if(edge.end.language === "en")
			{
				//console.log(edge.end.label);
				synonyms.push(edge.end.label);
			}
		}
		return synonyms;
	}

	/**
	 * Récupère la similarité sémantique appelée Relatedness
	 * @param {*} word1 
	 * @param {*} word2 
	 * @returns
	 */
	static async getRelatednessFetch(word1, word2)
	{
		//console.log(word1);
		
		const uri = "https://api.conceptnet.io/relatedness?node1=/c/en/" + Utils.snakize(Utils.uncamelize(word1.toString())).toLowerCase() + "&node2=/c/en/" + Utils.snakize(Utils.uncamelize(word2.toString())).toLowerCase();
		
		const JSON = await ConceptNet._fetch(uri);
		
		console.log(uri, JSON.value);
		return JSON.value;
	}

	/**
	 * ajout de la gestion des 'word' composé de plusieurs mots, avec gestion du dico, renvoie le max
	 * @param word1
	 * @param word2
	 * @returns {Promise<{F1score, recall: number, precision: number}|*|number>}
	 */
	static async getRelatedness(word1, word2)
	{
		console.log(word1,word2)
		let relatedness = this.getRelatedDico(word1, word2);
		//console.warn("Dico", this.RelatedDico)
		if(relatedness === 0)
		{
			const listWord1 = word1.split(" ");
			const listWord2 = word2.split(" ");
			if(listWord2.length===1&&listWord1.length===1)
			{
				relatedness = await this.getRelatednessFetch(word1, word2);
				this.pushRelatedDico(word1,word2,relatedness);
			}
			else{
				for (const w1 of listWord1) {
					for (const w2 of listWord2) {
						const relLoc = await this.getRelatedness(w1, w2);
						relatedness = Math.max(relatedness, relLoc);
					}
				}
			}
		}
		
		return relatedness;
	}
	static getRelatedDico(word1, word2)
	{
		for (const couple of this.RelatedDico)
		{
			if( (couple.words[0] === word1&&couple.words[1]===word2)
			   || (couple.words[1] === word1&&couple.words[0]===word2) )
			{
				console.log("Dico found", couple.score)
				return couple.score;
			}
		}
		return 0;
	}
	
	static pushRelatedDico(word1,word2,score)
	{
		this.RelatedDico.push({"words":[word1,word2],"score":score})
	}

	static async main()
	{
		let kw = new Instruction("word");
		let syn = await ConceptNet.getSynonyms(kw);
		let rel = await ConceptNet.getRelatedness(kw, "parole");
		console.log(syn);
		console.log(rel);
	}
	
	static resetClass()
	{
		this.RelatedDico = []
	}
}
//await ConceptNet.main()

export { ConceptNet }
export default { ConceptNet }