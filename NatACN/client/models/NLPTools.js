
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
	
	static async getRelatedness(word1, word2)
	{
		throw new Error("Method 'getRelatedness' must be implemented.");
	}
	
}

export { NLPTools };
export default  { NLPTools };