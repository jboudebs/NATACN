import * as Utils from '../../models/Utils.js';
import {Keyword} from "../../models/Keyword.js";

class ConceptNet
{
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
		const JSON = await fetch(uri).then((value) => {return value.json();});

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
	 * Récupère la similarité sémantique appelée Relatednes 
	 * @param {*} word1 
	 * @param {*} word2 
	 * @returns
	 */
	static async getRelatedness(word1, word2)
	{

		const uri = "https://api.conceptnet.io/relatedness?node1=/c/en/" + Utils.snakize(Utils.uncamelize(word1.toString())).toLowerCase() + "&node2=/c/en/" + Utils.snakize(Utils.uncamelize(word2.toString())).toLowerCase();

		console.log(uri);

		const JSON = await fetch(uri).then((value) => { return value.json(); });

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