import * as Utils from '../../models/Utils.js';
import { Keyword } from "../../models/Keyword.js";

class ConceptNet
{
	static last_time = 0;
	
	static async  _fetch(uri)
	{
		//Too many request Handle
		let time_now = Date.now()
		let i = 0;
		while(time_now - ConceptNet.last_time<1000 && i<11)
		{
			i++;
			time_now = Date.now();
			await Utils.sleep(100);
			//console.error(time_now, ConceptNet.last_time);
		}
		
		ConceptNet.last_time = time_now;
		//console.log(time_now, ConceptNet.last_time);
		
		const JSON = await fetch(uri).then((value) => { return value.json(); });
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
		const uri = "http://api.conceptnet.io/query?start=/c/en/"+Utils.snakize(Utils.uncamelize(word.toString()))+"&rel=/r/Synonym&filter=/c/en";
		console.log("Asking for synonyms :"+uri);
		const JSON = await ConceptNet._fetch(uri);

		for (const edge of JSON.edges )
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
	static async getRelatedness(word1, word2)
	{
		//console.log(word1);
		
		const uri = "https://api.conceptnet.io/relatedness?node1=/c/en/" + Utils.snakize(Utils.uncamelize(word1.toString())).toLowerCase() + "&node2=/c/en/" + Utils.snakize(Utils.uncamelize(word2.toString())).toLowerCase();
		
		const JSON = await ConceptNet._fetch(uri);
		
		console.log(uri, JSON.value);
		return JSON.value;
	}

	static async main()
	{
		let kw = new Keyword("word");
		let syn = await ConceptNet.getSynonyms(kw);
		let rel = await ConceptNet.getRelatedness(kw, "parole");
		console.log(syn);
		console.log(rel);
	}
}
//await ConceptNet.main()

export { ConceptNet }
export default { ConceptNet }