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
	 *
	 * @returns 
	 */
	async create(word)
	{
		const constr = await sparklis.externalSearchConstr({ type: "WikidataSearch",
			kwds: (typeof word === 'string')?[word]:word }); //word.includes(" ")?word.split(" "):[word]
		if (constr == null)
		{
			throw new Error("No match found for " + word + " in Wikidata External Search.");
		}
		return constr;
	}
}



class DefaultConstraint
{
	async create(word)
	{
		return {type: "MatchesAny", kwds: (typeof word === 'string')?[word]:word };
	}
}

export { Constraint, WikidataConstraint, DefaultConstraint }
export default { Constraint, WikidataConstraint, DefaultConstraint }