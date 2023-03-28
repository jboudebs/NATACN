import { CoreNLP } from "../services/NLP/CoreNLP.js";
import { NLPTools } from "./NLPTools.js";
import { ConceptNet } from "../services/NLP/ConceptNet.js";
import {KeywordList} from "NatACN/client/models/KeywordList";

/**
 * Static instance of NLPTool
 * PE à changer en methodes paramètres d'un constructeur NLPTools.
 */

class NLPToolsParameters// extends NLPTools
{
	constructor()
	{
		//super();
		if (this instanceof StaticClass) 
		{
			throw Error('A static class cannot be instantiated.');
		}
	}

	static async keywordExtractionAndSorting(NLQuestion)
	{
		await CoreNLP.fetch(NLQuestion);
		CoreNLP.extractNN_VB();
		CoreNLP.merge();
		CoreNLP.NEFirst();
	}
	
	static async keywordExtractionAndSorting_SpaCyNER(NLQuestion)
	{
		await CoreNLP.fetch(NLQuestion);
		CoreNLP.extractNN_VB();
		CoreNLP.merge();
		SpaCy.NERFirst();
	}
	
	static async getSynonyms(keyword)
	{
		return await ConceptNet.getSynonyms(keyword);
	}
	
	static async getRelatedness(word1, word2)
	{
		return await ConceptNet.getRelatedness(word1,word2);
	}

}

export { NLPToolsParameters };
export default  { NLPToolsParameters };