import { CoreNLP } from "../services/NLP/CoreNLP.js";
import { NLPTools } from "./NLPTools.js";
import { ConceptNet } from "../services/NLP/ConceptNet.js";

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
		return CoreNLP.extractAndSort();
	}
	
	static async getSynonyms(keyword)
	{
		return ConceptNet.getSynonyms(keyword);
	}

}

export { NLPToolsParameters };
export default  { NLPToolsParameters };