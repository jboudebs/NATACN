
import { NLPExtraction } from "./NLPExtraction.js";
import { InstrList } from "./InstrList.js";
import { QTList } from "./QTList.js";
import { isEqual } from "./Utils.js";
import { SparklisAPI } from "../services/ACN/SparklisAPI.js";

class NatACN
{
	static appel;
	constructor(acn)
	{
		this.acn = acn;
	}
	
	
	// update_navState_pointer()
	// {
	// 	this.old_pointer = this.navState_pointer
	// 	this.navState_pointer = this.navStateTree.next();
	// 	this.back = null
	// }
	//
	// async NLpreprocessing_old()
	// {
	// 	let keywordList_init = await NLPToolsParameters.keywordExtractionAndSorting(this.navState_pointer.getNLQuestion());
	// 	this.navState_pointer.setKeywordList(keywordList_init);
	// 	this.navState_pointer.setCurrentKeywordList(InstrList.copy(keywordList_init));
	// }
	// async NLpreprocessingMultiple(currentQuestion)
	// {
	// 	if(currentQuestion)
	// 	{
	// 		this.currentQuestion = currentQuestion
	// 		this.keywordListList = await NLPExtraction.extractMultiple(this.currentQuestion)
	// 	}
	// 	this.navState_pointer.setKeywordList(this.keywordListList[i]);
	// 	this.navState_pointer.setCurrentKeywordList(InstrList.copy(this.keywordListList[i]));
	// }
	
// 	async natNavigate(NLQuestion, results)
// 	{
// 		if(NLQuestion === '')
// 		{
// 			return this.navState_pointer;
// 		}
// 		let qResults = [];
//
// 		const startall = Date.now();
// 		this._currentKeywordTree = await NLPExtraction.instrTree(this.currentQuestion);
// 		const endNLP = Date.now() - startall;
// 		//TODO
// 		for (let i = 0; i < natACN.keywordListList.length-1; i++)
// 		{
// 			const startq = Date.now();
// 			this.navState_pointer = new NavState(NLQuestion, natACN.keywordListList[i]);
// 			this.navState_pointer = await this.natNavigateRec(this.navState_pointer, qResults);
// 			console.warn("Résultat :")
// 			console.warn(resultsQALD);
// 			const millis = Date.now() - startq + endNLP;
//
// 			const res = {
// 				"NLQuestion" : NLQuestion,
// 				"answer": await this.acn.getResults(),
// 				"lQTRes": this.navState_pointer.getLongestQTPath().Res,
// 				"HistoryResults" : qResults,
// 				"NE" : CoreNLP._NE_fetch,
// 				"navStateRes" : this.navState_pointer ,
// 				"millis" : millis
// 			};
// 			//console.warn(res);
// 			results.push(res);
// 			this.navStateTree.push(this.navState_pointer);
// 		}
// 		const millis = Date.now() - startall;
// 		console.log(millis)
// 		//await this.navState.init();
//
//
// 	}
// 	async natNavigateTree()
// 	{
// 		if(this.currentQuestion === '')
// 		{
// 			return this.navState_pointer;
// 		}
// 		//await this.navState.init();
// 		//let results = []
// 		//const startq = Date.now();
// 		this._currentKeywordTree = await NLPExtraction.instrTree(this.currentQuestion);
// 		let arbre = this.navStateTree
// 		arbre.createIterator()
// 		while (arbre.hasNext()) {
// 			const noeud = arbre.next();
// 		}
//
// 		this.navStateTree.createIterator()
// 		this.navState_pointer = this.navStateTree.next().valeur;
//
//
// 		this.navState_pointer = await this.natNavigateRec();
// 		//const millis = Date.now() - startq;
//
// 		// const res = {
// 		// 	"NLQuestion" : NLQuestion,
// 		// 	"answer": await this.acn.getResults(),
// 		// 	"lQTRes": this.navState_pointer.getLongestQTPath().Res,
// 		// 	"HistoryResults" : qResults,
// 		// 	"NE" : CoreNLP._NE_fetch,
// 		// 	"navStateRes" : this.navState_pointer ,
// 		// 	"millis" : millis
// 		// };
// 		//console.warn(res);
// 		//results.push(res);
// 		return this.navState_pointer;
// 	}
//
//
// 	async natNavigateMultiple(keywordList, results, i)
// 	{
// 		if(NLQuestion === '')
// 		{
// 			return this.navState_pointer;
// 		}
// 		let qResults = [];
//
//
// 		this.navState_pointer = new NavState(NLQuestion);
// 		//await this.navState.init();
//
// 		const startq = Date.now();
// 		await this.NLpreprocessing(NLQuestion);
// 		this.navState_pointer = await this.natNavigateRec(this.navState_pointer, qResults);
// 		const millis = Date.now() - startq;
//
// 		const res = {
// 			"NLQuestion" : NLQuestion,
// 			"answer": await this.acn.getResults(),
// 			"lQTRes": this.navState_pointer.getLongestQTPath().Res,
// 			"HistoryResults" : qResults,
// 			"NE" : CoreNLP._NE_fetch,
// 			"navStateRes" : this.navState_pointer ,
// 			"millis" : millis
// 		};
// 		//console.warn(res);
// 		results.push(res);
// 		return this.navState_pointer;
// 	}
// 	async natNavigateSimple(NLQuestion, results)
// 	{
// 		if(NLQuestion === '')
// 		{
// 			return this.navState_pointer;
// 		}
// 		let qResults = [];
//
//
// 		this.navState_pointer = new NavState(NLQuestion);
// 		//await this.navState.init();
//
// 		const startq = Date.now();
// 		await this.NLpreprocessing();
// 		this.navState_pointer = await this.natNavigateRec(this.navState_pointer, qResults);
// 		const millis = Date.now() - startq;
//
// 		const res = {
// 			"NLQuestion" : NLQuestion,
// 			"answer": await this.acn.getResults(),
// 			"lQTRes": this.navState_pointer.getLongestQTPath().Res,
// 			"HistoryResults" : qResults,
// 			"NE" : CoreNLP._NE_fetch,
// 			"navStateRes" : this.navState_pointer ,
// 			"millis" : millis
// 		};
// 		//console.warn(res);
// 		results.push(res);
// 		return this.navState_pointer;
// 	}
//
// /**
//  *  qResults = chemin gagnant
//  * @returns
//  */
// 	/**
// 	 *  qResults = chemin gagnant
// 	 * @returns
// 	 */
// 	async natNavigateRec()
// 	{
// 		console.log("input navState :", this.navState_pointer);
// 		if (!this.navStateTree.hasNext())
// 		{
// 			console.warn("End");
// 			this.navState_pointer.setEnd();
// 			return this.navState_pointer;
// 		}
// 		else
// 		{
// 			//gestion des back des mots-clés/instr
// 			let old_pointer = this.navState_pointer;
// 			this.navState_pointer = this.navStateTree.next();
// 			const n_back = Tree.isBack(navState_pointer,old_pointer)
// 			for (let i = 0; i < n_back; i++)
// 			{
// 				await this.acn.back();
// 			}
//
// 			if(this.navState_pointer._currentKeyword instanceof Instruction)
// 			{
// 				this.navState_pointer._candidatesQT = await this.acn.getFilteredQT(this.navState_pointer);
// 				if(this.navState_pointer._candidatesQT === 'error')
// 				{
// 					return 'error';
// 				}
// 				this.navState_pointer.setConstraint("");
//
// 				for (let i = 0; i < this.navState_pointer._candidatesQT.length; i++)
// 				{
// 					let qt = this.navState_pointer._candidatesQT.get(i);
// 					await this.acn.navigate(qt);
// 					this.navState_pointer.addQT(qt, this.acn);
//
// 					console.log("navState :", this.navState_pointer);
//
// 					let navStateRes = await this.natNavigateRec();
// 					if (navStateRes === 'error')
// 					{
// 						console.error("Error");
// 						return navStateRes;
// 					}
// 					console.log("navStateRes :", navStateRes);
// 					this.navState_pointer.setLongestQTPath(navStateRes);
//
//
// 					if (!navStateRes.isEnd())
// 					{
// 						console.warn(this.navState_pointer);
// 						await this.acn.back();
// 					}
// 					else
// 					{
// 						return navStateRes;
// 					}
// 				}
// 			}
// 			else if(this.navState_pointer._currentKeyword==='back')
// 			{
// 				console.warn(this.navState_pointer);
// 				await this.acn.back();
// 			}
//
// 			return this.navState_pointer;
// 		}
// 	}
//
// 	async natNavigateRecTree()
// 	{
// 		console.log("input navState :", (await this.navState_pointer).toString());
//
// 		if (!this.navStateTree.hasNext())
// 		{
// 			console.warn("End");
// 			this.navState_pointer.setEnd();
// 			return this.navState_pointer;
// 		}
// 		else
// 		{
// 			await this.navState_pointer.updateNextKeyword();
// 			this.navState_pointer._candidatesQT = await this.acn.getFilteredQT(this.navState_pointer);
// 			if(this.navState_pointer._candidatesQT === 'error')
// 			{
// 				return 'error';
// 			}
// 			this.navState_pointer.setConstraint("");
//
// 			for (let i = 0; i < this.navState_pointer._candidatesQT.length; i++)
// 			{
// 				let qt = this.navState_pointer._candidatesQT.get(i);
// 				await this.acn.navigate(qt);
// 				let currentNavState = NavState.copy(this.navState_pointer);
// 				await currentNavState.addQT(qt, this.acn);
//
// 				console.log("currentNavState :", currentNavState.toString());
// 				console.log("navState :", this.navState_pointer.toString());
//
// 				let navStateRes = await this.natNavigateRec(currentNavState, qResults);
// 				if (navStateRes === 'error')
// 				{
// 					console.error("Error");
// 					return navStateRes;
// 				}
// 				console.log("navStateRes :", navStateRes.toString());
// 				this.navState_pointer.setLongestQTPath(navStateRes);
//
//
// 				if (!navStateRes.isEnd())
// 				{
// 					console.warn(this.navState_pointer.toString());
// 					await this.acn.back();
// 				}
// 				else
// 				{
// 					return navStateRes;
// 				}
// 			}
// 			return this.navState_pointer;
// 		}
// 	}
	
	
	/**
	 * TEST SPACE
	 */
	
	better(place, QTpath, instrPath, bestNavigation)
	{
		return this.betterLength(place, QTpath, instrPath, bestNavigation);
	}
	betterLength(place, QTpath, instrPath, bestNavigation)
	{
		return QTpath.length>bestNavigation.QTpath.length;
	}
	betterF1(place, QTpath, instrPath, bestNavigation)
	{
		let currentNatACNRes = this.acn.getResults(place);
		let currentScore = scoring(sparklisRestoRes(currentNatACNRes), sparklisRestoRes(this.QRes))
		
		let bestNatACNRes = this.acn.getResults(bestNavigation.place);
		let bestScore = scoring(sparklisRestoRes(bestNatACNRes), sparklisRestoRes(this.QRes))
		
		return currentScore.F1score>bestScore.F1score;
		
	}
	
	async natNavigation(question, P, coreNLP)
	{
		try
		{
			
			// NLP
			console.log(question)
			let instrTree = await NLPExtraction.instrTree(question, coreNLP);
			// Navigation
			let bestNavigation = {"place": P, "QTpath": [], "instrPath": []}
			NatACN.appel = 0;
			console.dir(instrTree)
			let res = await this.natNavigateRec(instrTree.racine, P, new QTList(), new InstrList(), bestNavigation);//////
			return {"bestNavigation" : res.bestNavigation, "instrTree": instrTree, "extracted_kw" : NLPExtraction._orderedkwList}
			//return {"instrTree": instrTree}
		}
		catch (e)
		{
			console.error(e)
		}
	}
	//confusion instrNode et instr
	async natNavigateRec(instrNode, Pi, QTpath_i, instrPath_i, bestNavigation) {
		
		NatACN.appel++;
		
		// 1) Mettre à jour la meilleure navigation jusqu'à présent
		if (this.better(Pi, QTpath_i, instrPath_i, bestNavigation)) {
			bestNavigation = {"place" :Pi, "QTpath" : QTpath_i, "instrPath" : instrPath_i};
			console.warn("better", bestNavigation)
		}
		
		// 2) Interpréter l'instruction racine actuelle dans l'ACN
		// 2.a) S'il s'agit d'une feuille, toutes les instructions ont été interprétées
		if (instrNode.isLeaf()) {
			return {"place" :Pi, "QTpath" : QTpath_i, "instrPath" : instrPath_i, "bestNavigation" :bestNavigation};
		} else {
			// 2.b) Sinon, nous devons interpréter les instructions enfants
			let L_c = instrNode.getEnfants();
			// Exploration de toutes les instructions enfants
			for (let i = 0; i < L_c.length; i++) {
				let childInstrNode = L_c[i];
				
				// Filtrer le QT correspondant à l'instruction enfant actuelle
				let T_i = await this.acn.getFilteredQT(childInstrNode.valeur, Pi, QTpath_i);
				
				// Exploration de tous les QT filtrés
				for (let j = 0; j < T_i.length; j++) {
					let t_j = T_i.get(j);
					
					let P_i_1 = await this.acn.navigate(Pi, t_j); // Navigation selon t_j
					
					// Appel récursif de navigateRec avec l'instruction enfant actuelle
					let resultsNavigation = await this.natNavigateRec(childInstrNode, P_i_1, QTList.copy(QTpath_i).add(t_j), InstrList.copy(instrPath_i).add(childInstrNode.valeur), bestNavigation);
					
					bestNavigation = resultsNavigation.bestNavigation;
					if (resultsNavigation.place !== null)
					{
						return resultsNavigation; // Une solution a été trouvée
					}
					// Sinon, c'est une impasse, nous continuons l'exploration avec un autre QT
				}
				// S'il n'y a aucun QT à tester ou si tous mènent à une impasse, nous explorons avec l'instruction enfant suivante
			}
			return {"place" : null, "QTpath" : QTpath_i, "instrPath" : instrPath_i, "bestNavigation" : bestNavigation}; // Aucune instruction enfant ne permet une interprétation complète de l'ensemble d'instructions
		}
	}

	
	
	
	
	
	
	
}

function sparklisRestoRes(sparklisRes,i)
{
	console.log(sparklisRes);
	let res = [];
	if(sparklisRes&&sparklisRes.hasOwnProperty('columns'))
	{
		const nb = sparklisRes.columns.length-1;
		for (const r in sparklisRes.rows)
		{
			
			//vérifier s'il existe déjà pour éviter les doublons
			const e1 = sparklisRes.rows[r][nb];
			
			res = res.filter(e2=>!_.isEqual(e1,e2));
			
			res.push(sparklisRes.rows[r][nb]);
			
		}
	}
	else
	{
		for (const r in sparklisRes)
		{
			res.push(sparklisRes[r][sparklisRes[r].length-1]);
		}
	}
	//pb format
	res = res.filter( (ele,pos)=>res.indexOf(ele) === pos);
	console.log(res);
	res = res[0]?res:[];
	
	return res;
}
function scoring(Ad, Aqa)
{
	console.log("Calculating scores...", Ad, Aqa)
	let inter = [];
	for (const a1 in Ad)
	{
		for (const a2 in Aqa)
		{
			if (_.isEqual(Ad[a1], Aqa[a2]))
			{
				inter.push(Aqa[a2])
			}
			else
			{
			
			}
		}
	}
	console.log("inter", inter);
	const recall = inter.length / Ad.length;
	const precision = inter.length / Aqa.length;
	
	const score = {
		"recall": recall, "precision": precision, "F1score": 2 * recall * precision / (recall + precision)
	}
	
	var uniqueResultOne = function (result1,result2) {result1.filter(function(obj) {
		return !result2.some(function(obj2) {
			return _.isEqual(obj,obj2);
		});
	})};
	const onlyInLeft = (left, right, compareFunction) =>
		left.filter(leftValue =>
			!right.some(rightValue =>
				compareFunction(leftValue, rightValue)));
	
	console.warn('only in Ad', onlyInLeft(Ad,Aqa,isEqual));
	console.warn('only in Aqa', onlyInLeft(Aqa,Ad,isEqual));
	
	return score;
}


export { NatACN };
export default { NatACN };