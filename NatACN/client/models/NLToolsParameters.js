import { CoreNLP } from "../services/NLP/CoreNLP.js";
import { ConceptNet } from "../services/NLP/ConceptNet.js";
import { SpaCy } from "../services/NLP/SpaCy.js";
import { InstrList } from './InstrList.js';
import { Instruction } from './Instruction.js';
import { NLPExtraction } from "./NLPExtraction.js";

/**
 * Static instance of NLPTool
 * PE à changer en methodes paramètres d'un constructeur NLPTools.
 */

class NLPToolsParameters// extends NLPTools
{
	constructor()
	{
		//super();
		if (this instanceof StaticClass) 
		{
			throw Error('A static class cannot be instantiated.');
		}
	}
	
	static async keywordExtractionAndSorting(NLQuestion)
	{
		return await NLPExtraction.extract(NLQuestion);
	}

	// static async keywordExtractionAndSorting_CoreNLP_NER(NLQuestion)
	// {
	// 	await CoreNLP.fetch(NLQuestion);
	// 	CoreNLP.extractNN_VB();
	// 	CoreNLP.merge();
	// 	CoreNLP.NEFirst();
	// 	return KeywordList.toKeywordList(CoreNLP._filtered_list);
	// }
	//
	// /**
	//  * with Spacy NER
	//  * @param NLQuestion
	//  * @returns {Promise<void>}
	//  */
	// static async keywordExtractionAndSorting_spaCy_NER(NLQuestion)
	// {
	// 	await CoreNLP.extract(NLQuestion);
	// 	await SpaCy.NEFirst(NLQuestion);
	// 	// await CoreNLP.fetch(NLQuestion);
	// 	// CoreNLP.extractNN_VB();
	// 	// CoreNLP.merge();
	// 	return KeywordList.toKeywordList(CoreNLP._filtered_list);
	// }
	
	static async getSynonyms(keyword)
	{
		let synCN = await ConceptNet.getSynonyms(keyword);
		const lemma = keyword.lemma
		if(lemma)
		{
			let lemmakw = new Instruction(lemma);
			lemmakw.setType('lemma')
			synCN.push(lemmakw);
		}
		return synCN;
	}
	
	static async getRelatedness(word1, word2)
	{
		return await ConceptNet.getRelatedness(word1,word2);
	}

}

export { NLPToolsParameters };
export default  { NLPToolsParameters };