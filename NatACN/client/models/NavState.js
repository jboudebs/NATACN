import { Keyword } from "./Keyword.js"
import { KeywordList } from "./KeywordList.js"
import { QT } from "./QT.js"
import { QTList } from "./QTList.js"
import { NLPToolsParameters } from "./NLToolsParameters.js"

class NavState
{
	constructor(NLQuestion)
	{
		this._id = 0;
		this._NLQuestion = NLQuestion;
		this._keywordList = null;
		this._currentKeywordList = null;
		this._currentKeyword = null;
		this._currentKeywordSynonyms = null;
		this._end = false;
		this._QTPath = new QTList([]);
		this._longestQTPath = {
			QTPath: QTList.copy(this._QTPath), Res: []
		}
		
	}

	async init()
	{
		this._keywordList = await NLPToolsParameters.keywordExtractionAndSorting(this._NLQuestion);
		this._currentKeywordList = KeywordList.copy(this._keywordList);
	}

	toString()
	{
		return JSON.parse(JSON.stringify(this));
	}

	_incr()
	{
		this._id = this._id + 1;
	}

	static copy(navstate)
	{
		let copy = new NavState("");
		copy._id = navstate._id;
		copy._incr();
		copy._NLQuestion = navstate.getNLQuestion();
		copy._keywordList = KeywordList.copy(navstate.getKeywordList());//this.keywordList = this.NLTool.preprocessing(s);
		copy._currentKeywordList = KeywordList.copy(navstate.getCurrentKeywordList());
		copy._currentKeyword = Keyword.copy(navstate.getCurrentKeyword());
		copy._end = navstate.isEnd();
		copy._QTPath = QTList.copy(navstate.getQTPath());
		copy._longestQTPath = {
			QTPath: QTList.copy(navstate._longestQTPath.QTPath), Res: navstate._longestQTPath.Res
		}
		return copy;
	}

	hasNextKeyword()
	{
		return !this._currentKeywordList.isEmpty();
	}

	async updateNextKeyword()
	{
		this._currentKeyword = this._currentKeywordList.head();
		this._currentKeywordList = this._currentKeywordList.tail();
		if(!this.NECurrentKeyword())
		{
			let syn = (await NLPToolsParameters.getSynonyms(this._currentKeyword)).concat([this._currentKeyword]);
			this._currentKeywordSynonyms = KeywordList.toKeywordList(syn);
		}
	}
	
	NECurrentKeyword()
	{
		return this._currentKeyword.getType()==='NE';
	}
	
	getId()
	{
		return this._id;
	}

	setConstraint(constr)
	{
		this._constraint = constr;
	}
	setEnd()
	{
		this._end = true;
	}

	isEnd()
	{
		return this._end;
	}

	setKeywordList(keywordList)
	{
		this._keywordList = keywordList;
	}

	setCurrentKeywordList(keywordList)
	{
		this._currentKeywordList = keywordList;
	}

	setCurrentKeyword(keyword)
	{
		this._currentKeyword = keyword;
	}

	setQTPath(QTPath)
	{
		this._QTPath = QTPath;
	}
	
	
	/**
	 * Between the current nav state and the resulting navstate
	 * @param navstateRes
	 */
	setLongestQTPath(navstateRes)
	{
		console.log(navstateRes._longestQTPath);
		console.log(this._longestQTPath);
		if (navstateRes._longestQTPath.QTPath.length>this._longestQTPath.QTPath.length)
		{
			//y a un truc qui bug : ça recupère les resultats en cours, pas ce qui correspondent au plus long chemin :/
			console.warn("longest change")
			this._longestQTPath = {
				QTPath: QTList.copy(navstateRes._longestQTPath.QTPath), Res: navstateRes._longestQTPath.Res
			}
			console.warn(this._longestQTPath)
		}
	}

	async addQT(qt, acn)
	{
		this._QTPath.add(qt);
		if(this._longestQTPath.QTPath.length)
		{
			this._longestQTPath = {
				QTPath: QTList.copy(this._QTPath), Res: await acn.getResults()
			}
		}
		else
		{
			if(this._longestQTPath.QTPath.length<this._QTPath.length)
			{
				this._longestQTPath = {
					QTPath: QTList.copy(this._QTPath), Res: await acn.getResults()
				}
			}
		}
	}

	getKeywordList()
	{
		return this._keywordList;
	}

	getCurrentKeywordList()
	{
		return this._currentKeywordList;
	}

	getCurrentKeyword()
	{
		return this._currentKeyword;
	}

	getQTPath()
	{
		return this._QTPath;
	}

	getLongestQTPath()
	{
		return this._QTPath;
	}

	getNLQuestion()
	{
		return this._NLQuestion;
	}
	
	getConstraint()
	{
		return this._constraint;
	}

	setCurrentKeywordSynonyms(kwList)
	{
		this._currentKeywordSynonyms = kwList;
	}

	getCurrentKeywordSynonyms()
	{
		return this._currentKeywordSynonyms;
	}

	static async main()
	{
		let navstate =  new NavState('word')
		await navstate.init();
		console.log(navstate);
		await navstate.updateNextKeyword();
		console.log(navstate);
	}

}

export { NavState };
export default { NavState };
