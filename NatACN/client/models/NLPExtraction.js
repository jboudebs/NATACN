import coreNLP, { CoreNLP } from "../services/NLP/CoreNLP.js";
import { SpaCy } from "../services/NLP/SpaCy.js";
import { KeywordList } from "./KeywordList.js";


class NLPExtraction
{
	static _lemma_to_exclude = ['be', 'have', 'do']
	static _dependent_word_to_exclude = ['I', 'you', 'me']//Modaux déjà exclus
	
	constructor()
	{
		//super();
		if (this instanceof StaticClass)
		{
			throw Error('A static class cannot be instantiated.');
		}
	}
	
	static async extract(NLQuestion)
	{
		await NLPExtraction._natOrder_SpaCy(NLQuestion);
		return this._orderedkwList;
	}
	
	static _clearKeywordsCoreNLP()
	{
		console.warn(this._kwList, CoreNLP.keywords, CoreNLP.NE, SpaCy.NE);
		CoreNLP.mergeCompoundWord();
		this._kwList = CoreNLP.getKeyword()
		console.warn(this._kwList.map(e=>{return e.word}));
		NLPExtraction._clearFromNE()
		console.warn(this._kwList.map(e=>{return e.word}));
		NLPExtraction._clearFromLemma()
		console.warn(this._kwList.map(e=>{return e.word}));
		CoreNLP.keywords = this._kwList
	}
	
	static _clearFromLemma()
	{
		this._kwList = this._kwList.filter(kw=>!NLPExtraction._lemma_to_exclude.includes(kw.lemma))

	}
	
	static _clearFromNE()
	{
		console.log(this._neList)
		for (const ne of this._neList)
		{
			//find
			let kw_ne_like = NLPExtraction._findKwNELike(ne, this._kwList)
			//replace by ne in _kwList
			if(kw_ne_like !== undefined)
			{
				//supprimer la ne
				this._kwList.splice(kw_ne_like[1],1);
				//ajouter le tag à la NE
				this._neList.find(e=>{if(e==kw_ne_like[1]){e[pos_tag]=kw_ne_like[0].pos_tag}})
				// this._kwList[kw_ne_like[1]] = kw_ne_like[0]
				// this._kwList[kw_ne_like[1]].word =  plus_grand_string(kw_ne_like[0].word, kw_ne_like[2].word)
				// this._kwList[kw_ne_like[1]].pos_tag = kw_ne_like[0].pos_tag?kw_ne_like[0].pos_tag: kw_ne_like[2].pos_tag
				//supprimer les restes de ne
				console.warn(this._kwList,kw_ne_like[1])
				const neLittles = this._kwList[kw_ne_like[1]]?this._kwList[kw_ne_like[1]].word.split(" "):"";
				if(neLittles.length>1)
				{
					for (const neLittle of neLittles)
					{
						let kw_ne_like = NLPExtraction._findKwNELike(ne, this._kwList)
						if(kw_ne_like !== undefined)
						{
							const topop = this._kwList.map((kw,i) => {if(kw_ne_like[1]===i && kw_ne_like[0].type!=='NE'){return kw_ne_like[0]}}).filter(e=>e!==undefined)[0];
							if(topop!==undefined)
							{
								this._kwList.pop(topop)
							}
	
						}
					}
				}
			}
			
		}
	}
	
	static _findKwNELike(ne, kwList)
	{
		const ne_kw_like = kwList.map((kw,i) =>
			{
				const list = [ne,i,kw]
				if((kw.word.includes(ne.word) && ne.start_char >= kw.start_char && ne.end_char >= kw.end_char) ||
				   (ne.word.includes(kw.word) && ne.start_char <= kw.start_char && ne.end_char <= kw.end_char) ||
				   (ne.start_char >= kw.start_char && ne.start_char <= kw.end_char) ||
				   (ne.end_char >= kw.start_char && ne.end_char <= kw.end_char))
				{
					return list
				}
				
			}
		).filter(e=>e!==undefined)[0]
		return ne_kw_like;
	}
	
	
	/**
	 * Algo NE First
	 * @param NLQuestion
	 * @returns {Promise<KeywordList>}
	 * @private
	 */
	static async _NE_first_CoreNLP(NLQuestion)
	{
		await CoreNLP.fetch(NLQuestion)
		this._kwList = await CoreNLP.getKeyword();
		this._neList = await CoreNLP.getNE();
		NLPExtraction._clearKeywordsCoreNLP(this._kwList);
		let list = this._neList.map(ne=>{ne.type="NE";return ne}).concat(this._kwList.filter(kw=>kw.type!=='NE'))
		this._orderedkwList = KeywordList.toKeywordList(list);//serialization
		return this._orderedkwList;
	}
	
	static async _NE_first_SpaCy(NLQuestion)
	{
		await CoreNLP.fetch(NLQuestion)
		this._kwList = await CoreNLP.getKeyword();
		this._neList = await SpaCy.getNE(NLQuestion);
		console.log(this._kwList);
		NLPExtraction._clearKeywordsCoreNLP(this._kwList);
		console.log(this._kwList);
		let list = this._neList.map(ne=>{ne.type="NE";return ne}).concat(this._kwList.filter(kw=>kw.type!=='NE'))
		this._orderedkwList = KeywordList.toKeywordList(list);//serialization
		console.warn("ORDERED LIST :", this._orderedkwList.toString())
		return this._orderedkwList;
	}
	
	static async _natOrder_SpaCy(NLQuestion)
	{
		await CoreNLP.fetch(NLQuestion)
		this._kwList = await CoreNLP.getKeyword();
		this._neList = await SpaCy.getNE(NLQuestion);
		NLPExtraction._clearKeywordsCoreNLP(this._kwList);
		let list = this._neList.map(ne=>{ne.type="NE";return ne}).concat(this._kwList.filter(kw=>kw.type!=='NE'))
		list.sort(function(a, b) {
			var nomA = a.start_char;
			var nomB = b.start_char;
			
			if (nomA < nomB) {
				return -1;
			}
			if (nomA > nomB) {
				return 1;
			}
			return 0;
		});
		console.warn(list)
		this._orderedkwList = KeywordList.toKeywordList(list);//serialization
		console.warn("ORDERED LIST :", this._orderedkwList.toString())
		return this._orderedkwList;
	}
	
	static resetClass()
	{
		this._kwList = undefined;
		this._neList = undefined;
		this._orderedkwList = undefined;
	}
}

function plus_grand_string(string1, string2)
{
	if (string1 > string2) {
		return string1;
	} else {
		return string2;
	}
}

export { NLPExtraction }
export default { NLPExtraction }