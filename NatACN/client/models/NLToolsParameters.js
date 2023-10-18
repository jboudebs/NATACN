import { CoreNLP } from "../services/NLP/CoreNLP.js";
import { ConceptNet } from "../services/NLP/ConceptNet.js";
import { SpaCyNER } from "../services/NLP/SpaCyNER.js";
import { InstrList } from './InstrList.js';
import { Instruction } from './Instruction.js';
import { NLPExtraction } from "./NLPExtraction.js";
import { SpaCySimilarity } from "../services/NLP/SpaCySimilarity.js";

/**
 * Static instance of NLPTool
 * PE à changer en methodes paramètres d'un constructeur NLPTools.
 */

class NLPToolsParameters// extends NLPTools
{
	static SimTOOL = ConceptNet;
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
		const lemma = keyword.lemma;
		let synCN = []
		if(lemma)
		{
			synCN = await ConceptNet.getSynonyms(lemma);
			let lemmakw = new Instruction(lemma);
			lemmakw.setType('lemma')
			synCN.add(lemmakw);
		}
		else
		{
			synCN = await ConceptNet.getSynonyms(keyword.word?keyword.word:keyword);
		}
		return synCN;
	}
	
	/**
	 * format de retour pas similaire
	 * @param word1
	 * @param word2
	 * @returns {Promise<*|*[]>}
	 */
	static async getRelatedness(word1, word2)
	{
		
		//console.warn("check", word1, word2)
		if(word2 instanceof Array && NLPToolsParameters.SimTOOL == ConceptNet)
		{
			let simList = []
			for (const word of word2)
			{
				const similarity = await NLPToolsParameters.getRelatedness(word1, word);
				simList.push({"word1": word1, "word2": word, "similarity": similarity})
			}
			console.log(simList)
			return simList
		}
		else if(NLPToolsParameters.SimTOOL == ConceptNet)
		{
			console.log("Dico")
			return await ConceptNet.getRelatedness(word1, word2);
		}
		else if (NLPToolsParameters.SimTOOL == SpaCySimilarity)
		{
			
			return await SpaCySimilarity.getSimilarities(word1,typeof word2 === 'Array'?word2:[word2]);
		}
	}

}

export { NLPToolsParameters };
export default  { NLPToolsParameters };