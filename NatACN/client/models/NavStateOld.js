import { Instruction } from "./Instruction.js"
import { InstrList } from "./InstrList.js"
import { QT } from "./QT.js"
import { QTList } from "./QTList.js"
import { NLPToolsParameters } from "./NLToolsParameters.js"

class NavStateOld
{
	//navstate to follow search state and node in navState tree and iterator
	constructor(NLQuestion, _keywordList)
	{
		this._id = 0;
		this._NLQuestion = NLQuestion;
		this._keywordList = _keywordList instanceof InstrList?_keywordList:null;
		this._currentKeywordList = null;
		this._currentKeyword = _keywordList instanceof Instruction?_keywordList:null;
		this._currentKeywordSynonyms = _keywordList instanceof Instruction?_keywordList.synset:undefined;
		this._end = false;
		this._QTPath = new QTList([]);
		this._longestQTPath = {
			QTPath: QTList.copy(this._QTPath), Res: []
		}
		this._currentResults = null;
		
	}
	static keywordToNavState(NLQuestion, keyword)
	{
		if(keyword!=='ROOT')
		{
			
			let navState = new NavState(NLQuestion)
			delete navState._id;
			delete navState._keywordList;
			delete navState._currentKeywordList;
			navState._currentKeyword = keyword;
			return navState
		}
		else if(keyword==='ROOT') return 'ROOT'
		return null
	}

	async init()
	{
		this._keywordList = this._keywordList?this._keywordList:await NLPToolsParameters.keywordExtractionAndSorting(this._NLQuestion);
		this._currentKeywordList = InstrList.copy(this._keywordList);
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
		copy._keywordList = InstrList.copy(navstate.getKeywordList());//this.keywordList = this.NLTool.preprocessing(s);
		copy._currentKeywordList = InstrList.copy(navstate.getCurrentKeywordList());
		copy._currentKeyword = Instruction.copy(navstate.getCurrentKeyword());
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
			this._currentKeywordSynonyms = InstrList.toInstrList(syn);
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
		//console.log(navstateRes._longestQTPath);
		//console.log(this._longestQTPath);
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
	
	toString()
	{
		return this._currentKeyword
	}

	static async main()
	{
		let navstate =  new NavState('word')
		await navstate.init();
		//console.log(navstate);
		await navstate.updateNextKeyword();
		//console.log(navstate);
	}

}

export { NavState };
export default { NavState };
