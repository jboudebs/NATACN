import * as Utils from '../../models/Utils.js';

class Suggestions
	/**
	 * Factory according to the endpoint
	 * create a list of suggestions
	 */
{
	constructor()
	{
		if (sparklis.endpoint().includes('wikidata'))
		{
			this._sugg = new WikidataSuggestions();
			return this._sugg;
		}
		else
		{
			this._sugg = new DefaultSuggestions();
			return this._sugg;
		}
	}
	
	async create(navState)
	{
		return await this._sugg.create(navState);
	}
	
	async createMatch(navState)
	{
		return  await this._sugg.createMatch(navState);
	}
	
	async create_all(navState)
	{
		return  await this._sugg.create_all(navState);
	}
	
}

class WikidataSuggestions
{
	/**
	 * Si word contient plusieurs mot, split de word en liste de mots
	 * @param {NavState} navState
	 * @returns
	 */
	async _create_first(navState)
	{
		//console.log("test1", navState)
		console.log("current syn", navState.getCurrentKeywordSynonyms())
		let forest =  (await sparklis.currentPlace().getConceptSuggestions(false, navState.getConstraint())).forest;
		
		forest = _preprocessConceptSuggestions(forest);
		return _findChildSuggestionList(forest);
		//return navState.resultTerms.map(term=>{ return { type: "IncrTerm", term:term} });
	}
	
	
	async create(navState)
	{
		//console.log(navState);
		let suggestionList;
		if (navState.getId() === 0)
		{
			//console.log("here");
			suggestionList = this._create_first(navState);
		}
		else
		{
			//console.log("test1", navState)
			console.log("Current word or synonym", navState.getConstraint().searchQuery.kwds)
			
			try
			{
				console.warn("fetching wikidata entities by sparklis constraint", navState.getConstraint())
				let forest =  (await sparklis.currentPlace().getConceptSuggestions(false, navState.getConstraint())).forest;
				console.warn("fetching wikidata entities by sparklis constraint - DONE")
				//console.log(forest);
				forest = _preprocessConceptSuggestions(forest);
				suggestionList = _findChildSuggestionList(forest);
				suggestionList = _removeAlreadyAppliedSuggestion(suggestionList, navState);
				
				//console.log("concept sugg",suggestionList);
			}
			catch (e)
			{
				console.error(e);
				return "error";
			}
		}
		
		return suggestionList;
		//return navState.resultTerms.map(term=>{ return { type: "IncrTerm", term:term} });
	}
	
	async createMatch(navState)
	{
		let suggestions;
		let forest
		try
		{
			forest = (await sparklis.currentPlace().getTermSuggestions(false, navState.getConstraint())).forest;
			forest = _preprocessTermSuggestions(forest);
			const suggestionList = _findChildSuggestionList(forest);
			//filtering suggestionList among current keyword
			if(suggestionList.length===0)
			{
				suggestions = [];
			}
			else
			{
				suggestions = [{type: "IncrConstr", constr: navState.getConstraint(), filterType: "Mixed"}];//risque de ne pas marcher
			}
		}
		catch(e)
		{
			suggestions = [];
		}
		
		return  suggestions;
	}

	async create_all(navState)
	{
		return  _create_all(navState);
	}
	// async createMatch(navState)
	// {
	// 	return [{ type: "IncrSelection",
	// 			op: "And",
	// 			items: navState.resultTerms.map(term=>{ return { type: "IncrTerm", term:term} })
	// 	}]
	// 	 ;
	// }
}



class DefaultSuggestions
{
	async create(navState)
	{
		let forest =  (await sparklis.currentPlace().getConceptSuggestions(false, navState.getConstraint())).forest;
		forest = _preprocessConceptSuggestions(forest);

		let suggestionList = _findChildSuggestionList(forest);

		suggestionList = _removeAlreadyAppliedSuggestion(suggestionList, navState);

		return suggestionList;
	}
	
	async createMatch(navState)
	{
		let suggestions;
		
		let forest =  (await sparklis.currentPlace().getTermSuggestions(false, navState.getConstraint())).forest;
		forest = _preprocessTermSuggestions(forest);
		const suggestionList = _findChildSuggestionList(forest);
		
		if(suggestionList.length===0)
		{
			suggestions = [];
		}
		else
		{
			suggestions = [{type: "IncrConstr", constr: navState.getConstraint(), filterType: "Mixed"}];
		}
		
		return  suggestions;
	}
	async create_all(navState)
	{
		
		return  _create_all(navState);
	}
	
}

async function  _create_all(navState)
{
	let suggestionList = [];
	if (navState.getId() !== 0)
	{
		//console.log("here");
		let forest =  (await sparklis.currentPlace().getConceptSuggestions(false, "True")).forest;
		forest = _preprocessConceptSuggestions(forest);
		
		suggestionList = _findChildSuggestionList(forest);
		
		suggestionList = _removeAlreadyAppliedSuggestion(suggestionList, navState);
	}
	
	return suggestionList;
}

/**
 *
 * @param {sparklis-suggestion-forest} forest
 * @param {Array<sparklis-suggestion>}suggestionList
 */
function _findChildSuggestionList(forest, suggestionList=[])
{
	//console.log(forest);
	if(forest.length !== 0)
	{
		for (let tree of forest)
		{
			suggestionList.push(tree.item.suggestion)
			_findChildSuggestionList(tree.children, suggestionList);
		}
	}
	return suggestionList;
}

function _preprocessConceptSuggestions(suggestions_forest)
{
	return  suggestions_forest == null? [] : suggestions_forest.filter(s =>
		((s.item.suggestion.type === 'IncrRel' || s.item.suggestion.type === 'IncrType') && s.item.frequency.value > 0)
		|| (s.item.suggestion.type === 'IncrPred' && s.item.frequency.value > 0) );//TODO : ajouter qqch en fonction de arg
}

function _preprocessTermSuggestions(suggestions_forest)
{
	return suggestions_forest == null? [] : suggestions_forest.filter(s => (s.item.suggestion.type === 'IncrTerm') && s.item.frequency.value > 0);
}

function _removeAlreadyAppliedSuggestion(suggestionList, navState)
{
	for(const s of suggestionList)
	{
		for(const qt of navState.getQTPath().getList())
		{
			suggestionList = suggestionList.filter(s=>!Utils.isEqual(s,qt.getIncr()));//TODO : faire un fonction qui valide la similarité entre deux relations, cas des pred
		}
	}
	return suggestionList;
}

function _filterSuggestion(suggestionList, keywordList)
{

}

export { Suggestions }
export default { Suggestions, WikidataSuggestions, DefaultSuggestions }