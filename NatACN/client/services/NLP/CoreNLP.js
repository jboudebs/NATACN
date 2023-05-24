import { KeywordList } from '../../models/KeywordList.js';
import { Keyword } from '../../models/Keyword.js';

class CoreNLP
{
	static _tag_to_extract = ['NN', 'VB']
	
	
	/**
	 * extraction from CoreNLP.run
	 * @param NLQuestion
	 * @returns {Promise<void>}
	 */
	static async fetch(NLQuestion){
		let coreNLP_fetch = new Promise(resolve=>
				{
					fetch('http://corenlp.run', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
						},
						body: NLQuestion,
						})
						.then((response) => response.json())
						//Then with the data from the response in JSON...
						.then((data) => {
						console.log('CoreNLP Success:', data);
						resolve(data);
						})
						//Then with the error genereted...
						.catch((error) => {
						console.error('Error:', error);
						}
					);
				}
			);
			CoreNLP._fetch = await coreNLP_fetch;
	}
	
	
	static getNE(){
		if(!CoreNLP.NE)
		{
			CoreNLP.NE = CoreNLP._fetch.sentences[0].entitymentions.map(e=>{if(e.ner !== 'TITLE' && e.ner !== 'NATIONALITY')return {"word": e.text, "type": "NE", "start_char": e.characterOffsetBegin, "end_char":e.characterOffsetEnd}}).filter(e=> e != undefined)
		}
		return CoreNLP.NE
	};
	
	static getKeyword(){
		if(!CoreNLP.keywords)
		{
			CoreNLP.keywords =
				CoreNLP._fetch.sentences[0].tokens.map(e =>
				{
					if (CoreNLP._tag_to_extract.some(tag=>e.pos.startsWith(tag)))
					{
						return {"word": e.word, "pos_tag": e.pos, "start_char": e.characterOffsetBegin, "end_char" : e.characterOffsetEnd, "index" : e.index,"lemma": e.lemma};
					}
				})
				.filter(e => e !== undefined)
			CoreNLP.keywords_ini = CoreNLP._fetch.sentences[0].tokens.map(e =>
			{
				
					return {"word": e.word, "pos_tag": e.pos, "start_char": e.characterOffsetBegin, "end_char" : e.characterOffsetEnd, "index" : e.index,"lemma": e.lemma};
				
			})
		}
		return CoreNLP.keywords
	};
	
	
	
	//clearing extraction
	static mergeCompoundWord()
	{
		//liste des indexes des couples
		let compound_indexes = CoreNLP._findCompoundIndexes();
		CoreNLP.keywords = fusionnerMotsCles(CoreNLP.keywords, compound_indexes);
		
	}
	
	static _findCompoundIndexes()
	{
		//identification couples
		let compound_indexes = CoreNLP._fetch.sentences[0].enhancedPlusPlusDependencies.map(dep => {if(dep.dep==="compound"){return [dep.dependent,dep.governor]}}).filter(couple=>couple !== undefined).reverse();
		//fusion des couples qui ont un element en commun
		compound_indexes = fusionnerListes(compound_indexes);
		//ajout des indexes restants
		compound_indexes =  ajouterIndexesManquants(compound_indexes, CoreNLP.keywords.map(e=>e.index));
		
		return compound_indexes
	}
	
	
	
	static serialization_NatACN()
	{
		CoreNLP.NE = KeywordList.toKeywordList(CoreNLP.NE);
		CoreNLP.keywords = KeywordList.toKeywordList(CoreNLP.keywords);
	}
	
	
	
	
	/*******
	 * OLD 2
	 *
	 * ********/
	
	/**
	 *
	 * @param NLQuestion
	 * @returns {Promise<void>}
	 */
	// static async fetch(NLQuestion)
	// {
	// 	let fetcH = new Promise(resolve=>
	// 		{
	// 			fetch('http://corenlp.run', {
	// 				method: 'POST',
	// 				headers: {
	// 					'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
	// 				},
	// 				body: NLQuestion,
	// 				})
	// 				.then((response) => response.json())
	// 				//Then with the data from the response in JSON...
	// 				.then((data) => {
	// 				console.log('CoreNLP Success:', data);
	// 				resolve(data);
	// 				})
	// 				//Then with the error genereted...
	// 				.catch((error) => {
	// 				console.error('Error:', error);
	// 				}
	// 			);
	// 		}
	// 	);
	// 	CoreNLP._fetch = await fetcH;
	// }

	// static extractAndSort()
	// {
	// 	CoreNLP.extractNN_VB();
	// 	CoreNLP.merge();
	// 	CoreNLP.NEFirst();
	// 	return KeywordList.toKeywordList(CoreNLP._filtered_list);
	// }

/**
 * old version
 */

	/**
	 * extraction de mots jugés pertinents pour être activé
	 * un mot est pertinent si c'est un nom ou un verbe non lié à un pronom "I" ou "you"
	 * @returns 
	 */
	// static extractNN_VB(){
	// 	let extracted_word_list = [];
	// 	let word_to_exclude = [];
	// 	//console.log(CoreNLP._fetch);
	// 	for(let i = 0; i < CoreNLP._fetch.sentences[0].basicDependencies.length; i++)
	// 	{
	// 		let word = (CoreNLP._fetch.sentences[0].basicDependencies)[i];
	// 		if (CoreNLP._dependent_word_to_exclude.includes(word.governorGloss))
	// 		{
	// 			word_to_exclude.push(word.dependentGloss);
	// 		}
	// 		if (CoreNLP._dependent_word_to_exclude.includes(word.dependentGloss))
	// 		{
	// 			word_to_exclude.push(word.governorGloss);
	// 		}
	// 		if (word.dep === 'mark' && word.dependentGloss === 'to')
	// 		{
	// 			word_to_exclude.push(word.governorGloss);
	// 		}
	// 	}
	//
	// 	//console.log("word_to_exclude :", word_to_exclude);
	// 	// construire l'ensemble de mot pertinent
	// 	for(let i = 0; i < (CoreNLP._fetch.sentences)[0].tokens.length; i++)
	// 	{
	// 		let token = ((CoreNLP._fetch.sentences)[0].tokens)[i]
	// 		if(token.pos.startsWith('NN')||(token.pos.startsWith('VB') && token.index !== 1))//qui sont des noms et des verbes (pas des verbes infinitifs)
	// 		{
	// 			if(!(word_to_exclude.includes(token.word)//qui ne sont pas à dépendants de "I" et "you"
	// 			||CoreNLP._lemma_to_exclude.includes(token.lemma)))// ou qui ont pour lemme "be" ou have
	// 			{
	// 				if(token.pos.startsWith('NN'))
	// 				{
	// 					extracted_word_list.push(token.lemma);
	// 				}
	// 				else
	// 				{
	// 					extracted_word_list.push(token.word);
	//
	// 				}
	// 			}
	// 		}
	// 	};
	// 	//console.log("extracted_word_list :", extracted_word_list);
	// 	CoreNLP._extracted_word_list = extracted_word_list;
	// }

	/**
	 * fusionne les mots composés dans un liste de mots extraits à partir d'infos des dépendances
	 * @returns liste avec des mots fusionnés
	 */
	// static mergeCompoundWords()
	// {
	// 	let merged_word_list = CoreNLP._extracted_word_list;
	// 	for(let i = 0; i < CoreNLP._fetch.sentences[0].basicDependencies.length; i++)
	// 	{
	// 		let word = CoreNLP._fetch.sentences[0].basicDependencies[i]
	// 		if ((word.dep ==='compound'))
	// 		{
	// 			const word_to_merge_list = [word.dependentGloss, word.governorGloss];
	// 			merged_word_list = merged_word_list.filter(e=>!word_to_merge_list.includes(e));
	// 			console.log(merged_word_list);
	//
	// 			if ((merged_word_list.lenght===0) && merged_word_list[merged_word_list.length-1].includes(word.governorGloss))
	// 			{
	// 				merged_word_list[merged_word_list.length-1] = merged_word_list[merged_word_list.length-1].replace(word.governorGloss, word.dependentGloss+' '+word.governorGloss);
	// 			}
	// 			else
	// 			{
	// 				merged_word_list.push((word.dependentGloss+' '+word.governorGloss));//merged_word_list.push(camelize(word.dependentGloss+' '+word.governorGloss));
	// 			}
	// 		}
	// 	};
	// 	console.log('merged_word_list',merged_word_list)
	// 	CoreNLP._merged_word_list = merged_word_list;
	// }

	/**
	 * Ajout au début des NE si déjà presents dans la liste de mots
	 * @returns
	 */
	// static NEFirst()
	// {
	// 	// let word_list = CoreNLP._merged_word_list;
	// 	// console.log(word_list);
	// 	// const NE_fetch = CoreNLP._fetch.sentences[0].entitymentions.map(w=>w.text);
	// 	// this._NE_fetch = NE_fetch;
	// 	// console.log("NE :", NE_fetch);
	// 	// const filtered_list = word_list.filter(w=>!NE_fetch.includes(w));
	// 	// console.log("filtered_list :", filtered_list);
	// 	// for(let i = 0; i < NE_fetch.length; i++)
	// 	// {
	// 	// 	let ne = NE_fetch[0]
	// 	// 	if(word_list.includes(ne))
	// 	// 	{
	// 	// 		filtered_list.unshift(ne);
	// 	// 	}
	// 	// }	//ajout au début des NE si déjà presents dans la liste
	// 	// //console.log("unshifted_list :", filtered_list);
	// 	// CoreNLP._filtered_list = filtered_list;
	// 	// console.log("CoreNLP._filtered_list : ", filtered_list);
	//
	// 	const word_list = CoreNLP._merged_word_list;
	// 	const NE_fetch = CoreNLP._fetch.sentences[0].entitymentions.map(w=>w.text);
	// 	console.log("Named Entity",NE_fetch);
	// 	let first = [];
	// 	for(let w of word_list)
	// 	{
	// 		for (let ne of NE_fetch)
	// 		{
	// 			if((ne === w || w.includes(ne)) && (!first.includes(w)))//TO DO y a ptetre mieux non ?
	// 			{
	// 				first.push(w);
	// 			}
	// 		}
	// 	}
	// 	CoreNLP._NE_fetch = first;
	// 	CoreNLP._filtered_list = first.concat(word_list.filter(e=>!first.includes(e)));
	// 	console.log("String list",CoreNLP._filtered_list);
	// }
	
	/**
	 * To apply after a fetch
	 * @returns a list of ne in the NLQuestion from the last fetch
	 */
	// static getNE_old()
	// {
	// 	return CoreNLP._fetch.sentences[0].entitymentions.map(w=>w.text);
	// }

	// static merge()
	// {
	// 	let extracted_list = CoreNLP._extracted_word_list;
	// 	//console.log("extracted_list",extracted_list.toString());
	// 	//extract compound word
	// 	//console.warn(CoreNLP._fetch.sentences[0].basicDependencies);
	// 	let dependences_coupled_word = CoreNLP._fetch.sentences[0].basicDependencies.map(dep => {if(dep.dep==="compound"){return [dep.dependentGloss,dep.governorGloss]}}).filter(couple=>couple !== undefined).reverse();
	// 	//console.warn(dependences_coupled_word);
	// 	let gouv = '';
	// 	let merge_couple = [];
	// 	for (let i = 0; i < dependences_coupled_word.length;  i++)
	// 	{
	// 		//console.log(gouv);
	// 		const couple = dependences_coupled_word[i];
	// 		//console.log(couple);
	// 		if(couple[1] === gouv)
	// 		{
	// 			//merge couple[0]
	// 			const old_merge = merge_couple[merge_couple.length-1].toString();
	// 			merge_couple.pop();
	// 			merge_couple.push(couple[0] + " " + old_merge);
	//
	// 		}
	// 		else
	// 		{
	// 			//merge
	// 			merge_couple.push(couple[0] + " " + couple[1])
	//
	// 			gouv = couple[1];
	// 		}
	// 	}
	// 	//console.warn(merge_couple);//.reverse
	// 	if(merge_couple.length !== 0)
	// 	{
	// 		let  currentConpoundWord;
	// 		do{
	// 			currentConpoundWord = merge_couple.pop();
	// 			for (let i = 0; i < extracted_list.length;  i++)
	// 			{
	// 				const currentConpoundWord_splited = currentConpoundWord.split(" ");
	// 				const following_extracted_word = extracted_list.map((e,index)=>
	// 																{if((index >= i)
	// 																	&& index < i + currentConpoundWord_splited.length
	// 																	&& i < extracted_list.length - currentConpoundWord_splited.length + 1
	// 																	)
	// 																	{return e}
	// 																}).filter(couple=>couple !== undefined);
	//
	// 				//console.warn(following_extracted_word, currentConpoundWord_splited);
	// 				//if match
	// 				if(following_extracted_word.toString()===currentConpoundWord_splited.toString())
	// 				{
	// 					//delete and replace
	// 					const s = extracted_list.splice(i+1, currentConpoundWord_splited.length-1)
	// 					//console.log("suppressing :",s);
	// 					extracted_list[i] = currentConpoundWord;
	// 					//console.log("new list",extracted_list.toString());
	//
	//
	// 				}
	// 			}
	//
	// 		}while(merge_couple.length!==0)
	// 	}
	//
	// 		CoreNLP._merged_word_list = extracted_list;
	//
	// }

// 	static extract_old()
// 	{
// 		let extracted_words = CoreNLP._fetch.sentences[0].tokens.map(e=>{
// 																		if(e.pos.startsWith("NN"))
// 																		{
// 																			return e.lemma
// 																		}
// 																		if(e.pos.startsWith("VB"))
// 																		{
// 																			return e.word
// 																		}
//
// 																	}).filter(e=>e!==undefined)
// 		console.log(extracted_words);
// 	}
	
	static resetClass()
	{
		CoreNLP._fetch = undefined;
		CoreNLP.NE = undefined;
		CoreNLP.keywords =undefined;
		
	}
}

function fusionnerMotsCles(l, c) {
	const motsClesFusionnes = [];
	
	for (const couple of c) {
		let motCleFusionne1 = l.filter(e => e.index === couple[0])[0];
		if (couple.length>1)
		{
			console.log(couple, l, CoreNLP.keywords_ini)
			for (let i = 1; i < couple.length; i++) {
				let motCleFusionne2 = l.filter(e => e.index === couple[i])[0];
				if(!motCleFusionne2)
				{
					motCleFusionne2 = CoreNLP.keywords_ini.filter(e => e.index === couple[i])[0];
				}
				motCleFusionne1 = fusionnerMotCle(motCleFusionne1, motCleFusionne2)
			}
		}
		motsClesFusionnes.push(motCleFusionne1);
	}
	return motsClesFusionnes;
}

function fusionnerMotCle(motCleFusionne1, motCleFusionne2)
{
	console.log(motCleFusionne1)
	if(motCleFusionne1.start_char>motCleFusionne2.end_char)
	{
		let a = motCleFusionne1;
		motCleFusionne1 = motCleFusionne2;
		motCleFusionne2 = a;
	}
	console.log("ici")
	let motCleFusionne = {  "word": motCleFusionne1.word + " " + motCleFusionne2.word,
							"pos_tag": motCleFusionne1.pos_tag, "start_char": motCleFusionne1.start_char,
							"end_char" : motCleFusionne2.end_char, "index" : motCleFusionne1.index,
							"lemma": motCleFusionne1.lemma + " " + motCleFusionne2.lemma} ;
	return motCleFusionne;
}

function ajouterIndexesManquants(l, o) {
	for (const entier of o) {
		let estPresent = false;
		
		for (const sousListe of l) {
			if (sousListe.includes(entier)) {
				estPresent = true;
				break;
			}
		}
		
		if (!estPresent) {
			let index = 0;
			
			while (index < l.length && l[index][0] < entier) {
				index++;
			}
			
			l.splice(index, 0, [entier]);
		}
	}
	return l
}


// function fusionnerListes(l) {
// 	let merged = false;
//
// 	do {
// 		merged = false;
//
// 		for (let i = 0; i < l.length - 1; i++) {
// 			for (let j = i + 1; j < l.length; j++) {
// 				const mergedList = fusionnerDeuxListes(l[i], l[j]);
//
// 				if (mergedList) {
// 					l[i] = mergedList;
// 					l.splice(j, 1);
// 					merged = true;
// 					break;
// 				}
// 			}
//
// 			if (merged) {
// 				break;
// 			}
// 		}
// 	} while (merged);
//
// 	return l;
// }
//
// function fusionnerDeuxListes(liste1, liste2) {
// 	const mergedList = [];
//
// 	let i = 0;
// 	let j = 0;
//
// 	while (i < liste1.length && j < liste2.length) {
// 		if (liste1[i] < liste2[j]) {
// 			mergedList.push(liste1[i]);
// 			i++;
// 		} else if (liste1[i] > liste2[j]) {
// 			mergedList.push(liste2[j]);
// 			j++;
// 		} else {
// 			mergedList.push(liste1[i]);
// 			i++;
// 			j++;
// 		}
// 	}
//
// 	// Ajouter les éléments restants de liste1, le cas échéant
// 	while (i < liste1.length) {
// 		mergedList.push(liste1[i]);
// 		i++;
// 	}
//
// 	// Ajouter les éléments restants de liste2, le cas échéant
// 	while (j < liste2.length) {
// 		mergedList.push(liste2[j]);
// 		j++;
// 	}
//
// 	// Vérifier si les listes ont été fusionnées
// 	if (mergedList.length < liste1.length + liste2.length) {
// 		return mergedList;
// 	}
//
// 	return null; // Aucune fusion n'a eu lieu
// }
function fusionnerListes(listes) {
	const listesFusionnees = [];
	
	for (const liste of listes) {
		let fusionnee = false;
		
		// Parcourir les listes fusionnées existantes
		for (let i = 0; i < listesFusionnees.length; i++) {
			const listeExistante = listesFusionnees[i];
			
			// Vérifier s'il y a un élément en commun
			if (liste.some(item => listeExistante.includes(item))) {
				// Fusionner les listes en conservant l'ordre croissant
				listeExistante.push(...liste.filter(item => !listeExistante.includes(item)).sort((a, b) => a - b));
				fusionnee = true;
				break;
			}
		}
		
		// Si la liste n'a pas été fusionnée, l'ajouter telle quelle
		if (!fusionnee) {
			listesFusionnees.push(liste.slice());
		}
		
		
	}
	
	// tri des sous listes
	for (const listeElement of listesFusionnees)
	{
		listeElement.sort()
	}
	
	return listesFusionnees;
}

export { CoreNLP }
export default { CoreNLP }