import KeywordList from "./KeywordList.js";
import CoreNLP from "../services/NLP/CoreNLP.js";

/**
 * Interface
 */
class NLPTools 
{
	constructor()
	{
		if (this instanceof StaticClass) 
		{
			throw Error('A static class cannot be instantiated.');
		}
	}

	static async keywordExtractionAndSorting(NLQuestion)
	{
		throw new Error("Method 'keywordExtractionAndSorting' must be implemented.");
	}

	static async getSynonyms(keyword)
	{
		throw new Error("Method 'getSynonyms' must be implemented.");
	}
	
}

export { NLPTools };
export default  { NLPTools };