class Constraint
/**
 * Factory en fonction du endpoint
 */
{
	constructor()
	{
		if (sparklis.endpoint().includes('wikidata'))
		{
			this._constraint = new WikidataConstraint();
			return this._constraint;
		} 
		else
		{
			this._constraint = new DefaultConstraint();
			return this._constraint;
		}
	}

	async create(word)
	{
		return await this._constraint.create(word);
	} 

}

class WikidataConstraint
{
	/**
	 * Si word contient plusieurs mot, split de word en liste de mots
	 * @param {String} word 
	 * @returns 
	 */
	async create(word)
	{
		const constr = await sparklis.externalSearchConstr({ type: "WikidataSearch",
			kwds: [(typeof word === 'string')?word:word.toString().replaceAll(',',' ')] }); //word.includes(" ")?word.split(" "):[word]
		if (constr == null)
		{
			throw new Error("No match found for " + word + " in Wikidata External Search.");
		}
		return constr;
	}
}

class DefaultConstraint
{
	async create(wordList)
	{
		return await new Promise(resolve=>{ 
			resolve({ type: "MatchesAny", kwds: wordList});/////////
		});
	} 
}

export { Constraint, WikidataConstraint, DefaultConstraint }
export default { Constraint, WikidataConstraint, DefaultConstraint }