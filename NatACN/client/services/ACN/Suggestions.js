import * as Utils from '../../models/Utils.js';
import { SparklisAPI } from "./SparklisAPI.js";

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
	
	async create(constr, place, QTPath)
	{
		return await this._sugg.create(constr, place, QTPath);
	}
	
	async createMatch(constr, place)
	{
		return  await this._sugg.createMatch(constr, place);
	}
	
	async create_all(instr, place)
	{
		return  await this._sugg.create_all(instr, place);
	}
	
}

class WikidataSuggestions
{
	
	/**
	 * Si word contient plusieurs mots, split de word en liste de mots
	
	 */
	/**
	 *
	 * @param constr
	 * @param place
	 * @returns {Promise<Array<sparklis-suggestion>>}
	 * @private
	 */
	async _create_first(constr, place)
	{
		
		let forest =  (await place.getConceptSuggestions(false, constr)).forest;
		
		forest = _preprocessConceptSuggestions(forest);
		return _findChildSuggestionList(forest);
		//return navState.resultTerms.map(term=>{ return { type: "IncrTerm", term:term} });
	}
	
	
	async create(constr, place, QTpath)
	{
		let suggestionList;
		if (SparklisAPI.hasEmptyQuery(place))//si la query de la place est vide
		{
			suggestionList = await this._create_first(constr, place);
		}
		else
		{
			console.log("Current word or synonym", typeof constr === "Object"?constr.searchQuery.kwds:constr)
			
			try
			{
				//console.warn("fetching wikidata entities by sparklis constraint", constr)
				let forest =  (await place.getConceptSuggestions(false, constr)).forest;
				//console.warn("fetching wikidata entities by sparklis constraint - DONE", forest)
				//console.log(forest);
				forest = _preprocessConceptSuggestions(forest);
				suggestionList = _findChildSuggestionList(forest);
				suggestionList = _removeAlreadyAppliedSuggestion(suggestionList, QTpath);
				
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
	
	async createMatch(constr, place)
	{
		let suggestions;
		let forest
		try
		{
			forest = (await place.getTermSuggestions(false, constr)).forest;
			forest = _preprocessTermSuggestions(forest);
			const suggestionList = _findChildSuggestionList(forest);
			//filtering suggestionList among current keyword
			if(suggestionList.length===0)
			{
				suggestions = [];
			}
			else
			{
				suggestions = [{type: "IncrConstr", constr: constr, filterType: "Mixed"}];//risque de ne pas marcher
			}
		}
		catch(e)
		{
			suggestions = [];
		}
		
		return  suggestions;
	}
	async createMatch_old(navState)
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

	async create_all(instr, place)
	{
		return  _create_all(instr, place);
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

async function  _create_all(instr, place)
{
	let suggestionList = [];
	
	//console.log("here");
	let forest =  (await place.getConceptSuggestions(false, "True")).forest;
	console.log(forest)
	forest = _preprocessConceptSuggestions(forest);
	
	suggestionList = _findChildSuggestionList(forest);
	
	suggestionList = _removeAlreadyAppliedSuggestion(suggestionList, place);
	
	
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

function _removeAlreadyAppliedSuggestion(suggestionList, QTpath)
{
	//incr.uri?incr.uri:incr.pred["uri"+incr.pred.type[1]]
	
	if(QTpath.length && (QTpath._list[QTpath.length-1]._incr.uri || QTpath._list[QTpath.length-1]._incr.pred))
	{
		
		let incr = QTpath._list[QTpath.length-1]._incr;
		
		let qturi = incr.uri?incr.uri:incr.pred["uri"+incr.pred.type[1]]
		for (let i = suggestionList.length - 1; i >= 0; i--) {
			let incr2 = suggestionList[i];
			let suri = incr2.uri?incr2.uri:incr2.pred["uri"+incr2.pred.type[1]]
			if (qturi === suri) {
				//console.warn("remove last applied QT")
				suggestionList.splice(i, 1);
			}
		}
	}
	return suggestionList;
}

function _filterSuggestion(suggestionList, keywordList)
{

}

export { Suggestions }
export default { Suggestions, WikidataSuggestions, DefaultSuggestions }