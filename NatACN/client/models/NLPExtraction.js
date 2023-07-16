import coreNLP, { CoreNLP } from "../services/NLP/CoreNLP.js";
import { SpaCyNER } from "../services/NLP/SpaCyNER.js";
import { InstrList } from "./InstrList.js";
import { Instruction } from "./Instruction.js";
import { Noeud, Tree } from "./Tree.js";
import { NLPToolsParameters } from "./NLToolsParameters.js";
class NLPExtraction
{
	static _lemma_to_exclude = ['be', 'have', 'do']
	static _dependent_word_to_exclude = ['I', 'you', 'me']//Modaux déjà exclus
	static NETOOL = SpaCyNER
	constructor()
	{
		//super();
		if (this instanceof StaticClass)
		{
			throw Error('A static class cannot be instantiated.');
		}
	}

	// static async extractMultiple(NLQuestion)
	// {
	// 	await NLPExtraction._natOrder_SpaCy(NLQuestion);
	// 	//generate
	// 	NLPExtraction.combinaisons = getPermutations(this._orderedkwList_json);
	// 	console.log(NLPExtraction.combinaisons)
	// 	//filtrage selon les dépendances
	// 	let combinaisons = NLPExtraction.combinaisons.filter(l=>checkDependencies(l))
	// 	if(combinaisons.length)
	// 	{
	// 		NLPExtraction.combinaisons = combinaisons
	// 	}
	// 	//filtrage selon NE en début (si y a un NE)
	// 	if(NLPExtraction._hasNE())
	// 	{
	// 		NLPExtraction.combinaisons = NLPExtraction.combinaisons.filter(l=>isNEfirst(l))
	// 	}
	// 	//console.log(NLPExtraction.combinaisons)
	// 	NLPExtraction.combinaisons = NLPExtraction.combinaisons.map(kwl=>InstrList.toInstrList(kwl))
	// 	return NLPExtraction.combinaisons
	// }
	static async instrTree(NLQuestion, coreNLP)
	{
		this._orderedkwList = await NLPExtraction._natOrder(NLQuestion, coreNLP);
		//get syn
		for (const kw of this._orderedkwList_json)
		{
			//console.warn(kw)
			kw.synset = kw.type !=='NE'?
				InstrList.toInstrList((await NLPToolsParameters.getSynonyms(kw)).concat([kw.word]))
				: undefined;//InstrList.toInstrList(kw.word);
			console.log(kw.word, kw.synset)
		}
		//generate permutation
		const permutation = getPermutations(this._orderedkwList_json);
		NLPExtraction.combinaisons = NLPExtraction._copyListOfLists(permutation);

		//if(this._orderedkwList.length>2)
		//{
		//generate all possible permutations
		//console.log(NLPExtraction.combinaisons)
		NLPExtraction.orderedCombinaisons = []
		//CONSTRAINTS
		//filtrage selon les dépendences
		let combinaisonsDep = NLPExtraction.combinaisons.filter(l=>checkDependencies(l))
		//
		// //filtrage selon NE et Dep
		let combinaisonsNEFirstDep = []
		//
		// //filtrage selon NE en début (si y a un NE)
		let combinaisonsNE = []
		//
		if(NLPExtraction._hasNE())
		{
			combinaisonsNEFirstDep = combinaisonsDep.filter(l=>l[0].type === 'NE')
			combinaisonsNE = NLPExtraction.combinaisons.filter(l=>isNEfirst(l))
		}
		//
		//
		//
		console.log("NEDEP",combinaisonsNEFirstDep,"NE",combinaisonsNE,"DEP",combinaisonsDep)
		NLPExtraction._addMissingLists(NLPExtraction.orderedCombinaisons, combinaisonsNEFirstDep);
		NLPExtraction._addMissingLists(NLPExtraction.orderedCombinaisons, combinaisonsNE);
		NLPExtraction._addMissingLists(NLPExtraction.orderedCombinaisons, combinaisonsDep);
		//CONSTRAINTS
		//NLPExtraction._addMissingLists(NLPExtraction.orderedCombinaisons, NLPExtraction.combinaisons);
		console.log(NLPExtraction.orderedCombinaisons)
		// }
		// else
		// {
		// 	NLPExtraction.orderedCombinaisons = NLPExtraction.combinaisons.filter(l=>isNEfirst(l))
		//
		// }


		NLPExtraction.instrTreeI = new Tree(w => new Instruction(w), NLPExtraction.orderedCombinaisons);
		NLPExtraction.instrTreeI.globalDeepth = this._orderedkwList.length;
		console.log("Selected combinaison in tree",NLPExtraction.instrTreeI.toString())
		return NLPExtraction.instrTreeI
	}

	static _copyListOfLists(listOfLists) {
		const newList = [];

		for (const list of listOfLists) {
			const newListInner = [];

			for (const item of list) {
				// Effectuez la copie de chaque élément de la liste
				// Si les éléments sont de type primitif ou des objets immuables, une simple affectation suffit
				// Si les éléments sont des objets mutables, vous pouvez utiliser une méthode appropriée pour effectuer une copie en profondeur

				// Exemple de copie en utilisant JSON.parse et JSON.stringify (fonctionne uniquement pour les objets sérialisables en JSON)
				const copiedItem = item;

				newListInner.push(copiedItem);
			}

			newList.push(newListInner);
		}

		return newList;
	}


	static _addMissingLists(A, B) {
		for (const list of B) {
			if (!this._hasList(A, list)) {
				A.push(list);
			}
		}
		return A
	}

	static _hasList(lists, targetList) {
		for (const list of lists) {
			if (this._isSameList(list, targetList)) {
				return true;
			}
		}
		return false;
	}

	static _isSameList(list1, list2) {
		if (list1.length !== list2.length) {
			return false;
		}

		for (let i = 0; i < list1.length; i++) {
			if (list1[i].word !== list2[i].word) {
				return false;
			}
		}

		return true;
	}


	// _isPathExistsDFS(node, path) {
	// 	if (path.length === 0) {
	// 		return true; // Si le chemin est vide, il existe toujours
	// 	}
	//
	// 	const target = path[0]; // Le premier élément du chemin à rechercher
	// 	const remainingPath = path.slice(1); // Le reste du chemin à rechercher après le premier élément
	//
	// 	if (node.value.toString() === target.toString()) {
	// 		if (remainingPath.length === 0) {
	// 			return true; // Si le nœud correspond à la cible et il n'y a pas de reste de chemin, le chemin est trouvé
	// 		}
	//
	// 		for (const child of node.children) {
	// 			if (this._isPathExistsDFS(child, remainingPath)) {
	// 				return true; // Si le reste du chemin existe à partir d'un enfant, le chemin est trouvé
	// 			}
	// 		}
	// 	}
	//
	// 	return false; // Si aucune correspondance n'a été trouvée, le chemin n'existe pas
	// }
	//


	static _hasNE()
	{
		return NLPExtraction._neList.length>0
	}

	static async extract(NLQuestion)
	{
		await NLPExtraction._natOrder(NLQuestion);
		return this._orderedkwList;
	}

	static _clearKeywordsCoreNLP()
	{
		console.warn(this._kwList, CoreNLP.keywords.map(e=>e.word), SpaCyNER.NE);
		NLPExtraction._clearFromNE()
		console.warn(this._kwList.map(e=>e.word));
		this._kwList = CoreNLP.mergeCompoundWord(this._kwList);
		console.warn(this._kwList);
		NLPExtraction._clearFromLemma()
		//console.warn(this._kwList.map(e=>{return e.word}));
		CoreNLP.keywords = this._kwList
		//console.warn(this._kwList)
	}

	static _clearFromLemma()
	{
		this._kwList = this._kwList.filter(kw=>!NLPExtraction._lemma_to_exclude.includes(kw.lemma))
		//console.warn(this._kwList.map(e=>{return [e.word, e.lemma]}), NLPExtraction._lemma_to_exclude);
	}

	/**
	 * supprimer les NE de la kwList en enrichissant les infos des NE de la neList
	 * @private
	 */
	static _clearFromNE()
	{
		//console.log(this._neList)
		for (const ne of this._neList) {
			//console.log(ne,this._kwList.map(e=>e.word).toString())
			for (const kw of this._kwList) {

				if (chevauchement(ne, kw)) {
					let obj_longest_string = plus_grand_string_info(ne, kw)
					ne["word"] = obj_longest_string.word// supprimer et start char et end char à jour
					ne["start_char"] = obj_longest_string.start_char
					ne["end_char"] = obj_longest_string.end_char
					ne["pos_tag"] = kw.pos_tag;
					ne["dependencies"] = (kw.dependencies?kw.dependencies:[]).concat(ne.dependencies);
					ne["index"] = kw.index;
					ne["indexes"] = (kw.indexes?kw.indexes:[]).concat(ne.indexes);
				}

			}
			/*//find
			let kw_ne_like = NLPExtraction.chevauchement(ne, this._kwList)
			console.log("NE like",kw_ne_like, ne, this._kwList)
			//replace by ne in _kwList
			if(kw_ne_like !== undefined)
			{
				//supprimer la ne
				this._kwList.splice(kw_ne_like[1],1);
				//ajouter le tag à la NE
				this._neList = this._neList.map((e)=>
				{
					//console.log(e, kw_ne_like)
					if(e===kw_ne_like[0])
					{
						//console.log(e)
						let obj_longest_string = plus_grand_string_info(e,kw_ne_like[2])
						e["word"] = obj_longest_string.word// supprimer et start char et end char à jour
						e["start_char"] = obj_longest_string.start_char
						e["end_char"] = obj_longest_string.end_char
						e["pos_tag"] = kw_ne_like[2].pos_tag;
						e["dependencies"] = kw_ne_like[2].dependencies.concat(e.dependencies);
						e["index"] = kw_ne_like[2].index;
						e["indexes"] = kw_ne_like[2].indexes;
					}
					return e
				})
				//console.log(this._neList)
				//this._kwList[kw_ne_like[1]] = kw_ne_like[0]
				//this._kwList[kw_ne_like[1]].word =  plus_grand_string(kw_ne_like[0].word, kw_ne_like[2].word)
				// this._kwList[kw_ne_like[1]].pos_tag = kw_ne_like[0].pos_tag?kw_ne_like[0].pos_tag: kw_ne_like[2].pos_tag
				//supprimer les restes de ne
				//console.warn(this._kwList,kw_ne_like[1])
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
		//supprimer les elements de la kwList qui ont un mot qui chevauche un NE
		for (const ne of this._neList)
		{
			
			this._kwList = this._kwList.filter(e=>!chevauchement(ne, e))
		}*/
		}
	}

	static _findKwNELike(ne, kwList)
	{
		let ne_kw_like = kwList.map((kw,i) =>
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
	 * @returns {Promise<InstrList>}
	 * @private
	 */
	static async _NE_first_CoreNLP(NLQuestion)
	{
		await CoreNLP.fetch(NLQuestion)
		this._kwList = await CoreNLP.getKeyword();
		this._neList = await CoreNLP.getNE();
		NLPExtraction._clearKeywordsCoreNLP(this._kwList);
		let list = this._neList.map(ne=>{ne.type="NE";return ne}).concat(this._kwList.filter(kw=>kw.type!=='NE'))
		this._orderedkwList = InstrList.toInstrList(list);//serialization
		return this._orderedkwList;
	}

	static async _NE_first_SpaCy(NLQuestion)
	{
		await CoreNLP.fetch(NLQuestion)
		this._kwList = await CoreNLP.getKeyword();
		this._neList = await SpaCyNER.getNE(NLQuestion);
		//console.log(this._kwList);
		NLPExtraction._clearKeywordsCoreNLP(this._kwList);
		//console.log(this._kwList);
		let list = this._neList.map(ne=>{ne.type="NE";return ne}).concat(this._kwList.filter(kw=>kw.type!=='NE'))
		this._orderedkwList = InstrList.toInstrList(list);//serialization
		console.warn("Extracted LIST :", this._orderedkwList.toString())
		return this._orderedkwList;
	}

	static async _natOrder(NLQuestion, coreNLP)
	{

		coreNLP?CoreNLP._fetch = JSON.parse(coreNLP):await CoreNLP.fetch(NLQuestion)
		this._kwList = await CoreNLP.getKeyword();
		//console.log(this._kwList);
		CoreNLP.enrichDependences(this._kwList);
		//console.log(this._kwList);
		this._neList = await this.NETOOL.getNE(NLQuestion);
		//console.log(this._neList,this._kwList);
		NLPExtraction._clearKeywordsCoreNLP(this._kwList);
		//fusion NE word
		let list = this._neList.map(ne=>{ne.type="NE";return ne}).concat(this._kwList.filter(kw=>kw.type!=='NE'))
		console.log(list);

		//tri
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

		//supprimer les doublons
		console.log(list);
		this._orderedkwList_json = supprimerChevauchements(list);
		// //ajouter mot manquant
		// console.warn(await CoreNLP.keywords_POSextracted);
		//ajouter les dependences manquantes
		CoreNLP.enrichDependences(this._orderedkwList_json);
		this._orderedkwList = InstrList.toInstrList(list);//serialization
		console.warn("Extracted LIST :", this._orderedkwList.toString())
		return this._orderedkwList;
	}

	static resetClass()
	{
		this._kwList = undefined;
		this._neList = undefined;
		this._orderedkwList = undefined;
	}
}

function isNEfirst(list)
{
	return list[0].type==='NE'
}

function genererCombinaisons(liste)
{
	var combinaisons = [];

	function backtrack(combinaisonActuelle, index)
	{
		combinaisons.push(combinaisonActuelle.slice());

		for (var i = index; i < liste.length; i++)
		{
			combinaisonActuelle.push(liste[i]);
			backtrack(combinaisonActuelle, i + 1);
			combinaisonActuelle.pop();
		}
	}

	backtrack([], 0);

	return combinaisons;
}

function getPermutations(strings) {
	const result = [];

	function permute(arr, m = []) {
		if (arr.length === 0) {
			result.push(m);
		} else {
			for (let i = 0; i < arr.length; i++) {
				const curr = arr.slice();
				const next = curr.splice(i, 1);
				permute(curr.slice(), m.concat(next));
			}
		}
	}

	permute(strings);

	return result[0]?result:[strings];
}
function checkDependencies(list) {

	for (let i = 0; i < list.length - 1; i++) {
		const currentObj = list[i];
		const nextObj = list[i + 1];
		let foundMatch = false;
		if(currentObj.dependencies && nextObj.dependencies)
		{
			if(hasCommonObject(currentObj.dependencies, nextObj.dependencies))
			{
				foundMatch = true
			}
			if(!foundMatch)
			{
				return false
			}
		}
		//return false
	}

	return true;
}
function hasCommonObject(list1, list2) {
	//console.log(list1,list2)
	for (let obj1 of list1) {
		for (let obj2 of list2) {
			if (areObjectsEqual(obj1, obj2)) {
				return true;
			}
		}
	}

	return false;
}
function areObjectsEqual(obj1, obj2) {
	const stringifiedObj1 = JSON.stringify(obj1);
	const stringifiedObj2 = JSON.stringify(obj2);

	return stringifiedObj1 === stringifiedObj2;
}

function plus_grand_string_info(obj1,obj2)
{
	if(obj1.word.length>obj2.word.length)
	{
		return obj1
	}
	return obj2

}

function plus_grand_string(string1, string2)
{
	if (string1.length > string2.length) {
		return string1;
	} else {
		return string2;
	}
}

function chevauchement(kw1, kw2) {
	return Math.max(kw1.start_char, kw2.start_char) <= Math.min(kw1.end_char, kw2.end_char);
}


function supprimerChevauchements(keywordList) {

	for (var i = 0; i < keywordList.length; i++) {
		var keyword1 = keywordList[i];

		for (var j = i + 1; j < keywordList.length; j++) {
			var keyword2 = keywordList[j];

			if (chevauchement(keyword1, keyword2)) {
				if (keyword1.word.length < keyword2.word.length) {
					keywordList.splice(i, 1);
					i--;
					break;
				} else {
					keywordList.splice(j, 1);
					j--;
				}
			}
		}
	}

	return keywordList;
}


export { NLPExtraction }
export default { NLPExtraction }