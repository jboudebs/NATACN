import { CoreNLP } from "../services/NLP/CoreNLP.js";
import { ACN } from "./ACN.js"
import { KeywordList } from "./KeywordList.js";
import { NavState } from "./NavState.js";
import { NLPExtraction } from "./NLPExtraction.js";
import { NLPToolsParameters } from "./NLToolsParameters.js";
import Utils from "./Utils.js";

class NatACN
{
	constructor(acn)
	{
		this.acn = acn;
		this.navState = null;
	}

	async NLpreprocessing()
	{
		let keywordList_init = await NLPToolsParameters.keywordExtractionAndSorting(this.navState.getNLQuestion());
		this.navState.setKeywordList(keywordList_init);
		this.navState.setCurrentKeywordList(KeywordList.copy(keywordList_init));
	}
	

	async natNavigate(NLQuestion, results)
	{
		if(NLQuestion === '')
		{
			return this.navState;
		}
		let qResults = [];
		
		
		this.navState = new NavState(NLQuestion);
		//await this.navState.init();
		
		const startq = Date.now();
		await this.NLpreprocessing();
		this.navState = await this.natNavigateRec(this.navState, qResults);
		const millis = Date.now() - startq;
		
		const res = {
			"NLQuestion" : NLQuestion,
			"answer": await this.acn.getResults(),
			"lQTRes": this.navState.getLongestQTPath().Res,
			"HistoryResults" : qResults,
			"NE" : CoreNLP._NE_fetch,
			"navStateRes" : this.navState ,
			"millis" : millis
		};
		//console.warn(res);
		results.push(res);
		return this.navState;
	}
	
/**
 *  qResults = chemin gagnant
 * @returns 
 */
	async natNavigateRec(navState, qResults)
	{
		//navState.setLongestQTPath(navState.getQTPath());
		console.log("input navState :", (await navState).toString());
		//controle des resultats
		qResults.push({"navstate" : navState});
		if (!navState.hasNextKeyword())
		{
			console.warn("End");
			navState.setEnd();
			return navState;
		}
		else
		{
			await navState.updateNextKeyword();
			navState._candidatesQT = await this.acn.getFilteredQT(navState);
			if(navState._candidatesQT === 'error')
			{
				return 'error';
			}
			navState.setConstraint("");
			
			for (let i = 0; i < navState._candidatesQT.length; i++)
			{
				let qt = navState._candidatesQT.get(i);
				await this.acn.navigate(qt);
				let currentNavState = NavState.copy(navState);
				await currentNavState.addQT(qt, this.acn);
				
				console.log("currentNavState :", currentNavState.toString());
				console.log("navState :", navState.toString());
				
				let navStateRes = await this.natNavigateRec(currentNavState, qResults);
				if (navStateRes === 'error')
				{
					console.error("Error");
					return navStateRes;
				}
				console.log("navStateRes :", navStateRes.toString());
				navState.setLongestQTPath(navStateRes);
				
				
				if (!navStateRes.isEnd())
				{
					console.warn(navState.toString());
					await this.acn.back();
				}
				else
				{
					return navStateRes;
				}
			}
			return navState;
		}
	}

}


export { NatACN };
export default { NatACN };