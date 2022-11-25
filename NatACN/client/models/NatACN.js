import { CoreNLP } from "../services/NLP/CoreNLP.js";
import { ACN } from "./ACN.js"
import { KeywordList } from "./KeywordList.js"
import { NavState } from "./NavState.js";
import { NLPToolsParameters } from "./NLToolsParameters.js"

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
		this.navState.setCurrentKeywordList(KeywordList.toKeywordList(keywordList_init));
	}
	

	async natNavigate(NLQuestion, results)
	{
		let qResults = [];
		this.navState = new NavState(NLQuestion);
		//await this.navstate.init();
		const startq = Date.now();
		await this.NLpreprocessing();
		
		this.navState = await this.natNavigateRec(this.navState, qResults);
		const millis = Date.now() - startq;
		console.log(await this.acn.getResults());
		results.push({"NLQuestion" : NLQuestion, "answer": await this.acn.getResults(), "HistoryResults" : qResults, "NE" : CoreNLP._NE_fetch, "navStateRes" : this.navState , "millis" : millis});
		return this.navState;
	}
	
/**
 *  qResults = chemin gagnant
 * @returns 
 */
	async natNavigateRec(navState, qResults)
	{
		console.log("input navState :", (await navState).toString());
		qResults.push({"navstate" : navState});
		if (!navState.hasNextKeyword())
		{
			navState.setEnd();
			return navState;
		}
		else
		{
			await navState.updateNextKeyword();
			navState._candidatesQT = await this.acn.getFilteredQT(navState);

			for (let i = 0; i < navState._candidatesQT.length; i++)
			{
				let qt = navState._candidatesQT.get(i);
				
				await this.acn.navigate(qt);

				let currentNavState = NavState.copy(navState);
				currentNavState.addQT(qt);
				
				navState.setLongestQTPath(currentNavState.getQTPath());
				console.log("currentNavState :", currentNavState.toString());
				console.log("navState :", navState.toString());
				
				let navStateRes = await this.natNavigateRec(currentNavState, qResults);
				navState.setLongestQTPath(navStateRes.getQTPath());
				console.log("navStateRes :", navStateRes.toString());
				
				if (!navStateRes.isEnd())
				{
					console.warn(navState.toString());
					await this.acn.back();
				}
				else
				{
					return navStateRes;
				}
			};
			return navState;
		}
	}

}


export { NatACN };
export default { NatACN };