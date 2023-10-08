

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
		//console.warn(word)
		if (word.length >= 3)
		{
			const constr = await sparklis.externalSearchConstr({
				type: "WikidataSearch", kwds: (typeof word === 'string') ? [word.replaceAll("”"," ")] : word.replaceAll("”"," ")
			});
			if (constr == null)
			{
				throw new Error("No match found for " + word + " in Wikidata External Search.");
			}
			return constr;
		}
		else
		{
			console.error(word + " is too short for Wikidata External Search.");
			return null;
		}
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