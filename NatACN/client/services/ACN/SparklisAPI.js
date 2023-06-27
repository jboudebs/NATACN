import * as Utils from '../../models/Utils.js';
import { ACN } from "../../models/ACN.js";
import { QTList } from "../../models/QTList.js";
import { QT } from "../../models/QT.js";
import * as Constraint from "./Constraint.js";
import { Suggestions } from "./Suggestions.js";
import { NLPTools } from "../../models/NLPTools.js";
import {NLPToolsParameters} from "../../models/NLToolsParameters.js";


/**
  * SparklisAPI
  *
  * @class SparklisAPI
  * @extends {ACN}
  */

class SparklisAPI extends ACN
{
	static _sparklis;
	static _view_mode = true;
	constructor()
	{
		super();
	}
	
	async init()
	{
		await SparklisAPI._waitForSparklis();
		this._sparklis = sparklis;
		this.endpointConfig();
		
		this._sparklis.home();
		
	}
	
	async changeEndpoint(string, place)
	{
		this._sparklis.changeEndpoint(string);
		await this.getResults(place);
	}
	
	async endpointConfig()
	{
		if(this._sparklis.endpoint().includes('wikidata'))
		{
			this.getLabelFromUri = this._getLabelFromUriWiki;
		}
		else if(this._sparklis.endpoint().includes('mondial'))
		{
			this.getLabelFromUri = this._getLabelFromUriMondial;
		}
	}
	
	async getPlace()
	{
		await this.getResults();
		return this._sparklis.currentPlace()
	}
	
	async setPlace(place)
	{
		await this.getResults(place);
		return this._sparklis.setCurrentPlace(place)
	}
	
	/**
	 *
	 * @param instr
	 * @param place
	 * @returns {Promise<QTList>}
	 */
	async getFilteredQT(instr, place)
	{
		let qtList = new QTList();
		
		//case current keyword is a NE
		if(instr.getType() === 'NE' && instr.toString().length>2)
		{
			const ne = instr.toString();
			console.log("Current NE :", ne);
			//Constraint Sparklis match
			const constr = await new Constraint.Constraint().create(ne);
			console.log('Constraint :', constr);
			//get filtred QT list from Sparklis
			qtList.add(await (new Suggestions()).createMatch(constr, place));
			console.warn(qtList)
			if(qtList.length){qtList.get(0).setLabel(ne)}
		}
		//case current instr is a keyword
		else if(instr.toString().length>2)
		{
			const synonyms = instr.getSynset();
			//.toString().toLowerCase().split(",").filter(e=>e.length>2);
			console.log("Current synonyms :",synonyms.toString());
			
			for(const syn of synonyms.get())//nouvelle contrainte pour chaque synonyme
			{
				const constr = await new Constraint.Constraint().create(syn.toString().toLowerCase());//A changer avec les syn
				console.log('Constraint :', constr);
				try{
					//get filtred suggestion list from Sparklis
					let suggList = await (new Suggestions()).create(constr, place);
					if(suggList==='error' || suggList===undefined)
					{
						//await Utils.sleep(6000);
						qtList = new QTList([]);
					}
					else
					{
						//change into QT list
						//console.warn("Sugg",suggList);
						qtList.add(suggList);
						//console.log(qtList);
					}
				}
				catch (e)
				{
					console.error(e);
					qtList = new QTList([]);
				}
			}
			
			let qtList_toRemove=[]
			//adding relatedness score for each QT
			for (const qt of qtList.getList())
			{
				//console.log(qt);
				//fetch label
				const label = await this.getLabelFromUri(qt.getIncr());
				//console.log(label);
				//remove ID QT
				const regex = /\b(ID|i_d|id|Id)\b|\b(ID|i_d|id|Id)\b$/;
				if (label.match(regex))
				{
					console.warn('ici ID identifié', label)
					qtList_toRemove.push(qt);
				}
				else
				{
					
					qt.setLabel(label);
					//relatedness
					const relatedness = await NLPToolsParameters.getRelatedness(qt.getLabel(),instr.toString())
					qt.setScore(relatedness);
				}
				
			}
			
			for (const qtListToRemoveElement of qtList_toRemove)
			{
				qtList.removeQT(qtListToRemoveElement)
			}
			
			//ranking the QT list
			qtList = qtList.rankByScore();
		}
		else
		{
			console.error("mot clé trop petit")
			qtList = new QTList([]);
		}
		
		//alternative de filtrage
		// if(qtList.isEmpty()&&!this._sparklis.endpoint().includes('wikidata'))
		// {
		// 	console.log("Alternative filtering")
		// 	qtList = await this._getFilteredQTbyRelatedness(navState);
		// 	//ranking the QT list
		// 	qtList = qtList.rankByScore();
		// }
		console.log(qtList)
		return qtList;
	}
	
	
	/**
	 * recuperer le label
	 * @param navState
	 * @returns {Promise<QTList>}
	 */
	async getFilteredQT_old(navState)
	{
		console.log(navState)
		let qtList = new QTList();
		//case current keyword is a NE
		if(navState.getCurrentKeyword().getType() === 'NE' && navState.getCurrentKeyword().toString().length>2)
		{
			const ne = navState.getCurrentKeyword().toString();
			console.log("Current NE :", ne);
			//Constraint Sparklis match
			navState.setConstraint(await new Constraint.Constraint().create(ne));
			console.log('Constraint :', navState.getConstraint());
			//get filtred QT list from Sparklis
			qtList.add(await (new Suggestions()).createMatch(navState));
			if(qtList.length){qtList.get(0).setLabel(ne)};
		}
		//case current keyword is not a NE
		else if(navState.getCurrentKeyword().toString().length>2)
		{
			const synonyms = navState.getCurrentKeywordSynonyms();
				//.toString().toLowerCase().split(",").filter(e=>e.length>2);
			console.log("Current synonyms :",synonyms);
			
			for(const syn of synonyms.get())//nouvelle contrainte pour chaque synonyme
			{
				navState.setConstraint(await new Constraint.Constraint().create(syn.toString().toLowerCase()));//A changer avec les syn
				console.log('Constraint :', navState.getConstraint());
				try{
					//get filtred suggestion list from Sparklis
					let suggList = await (new Suggestions()).create(navState);
					if(suggList==='error' || suggList===undefined)
					{
						//await Utils.sleep(6000);
						qtList = new QTList([]);
					}
					else
					{
						//change into QT list
						//console.warn("Sugg",suggList);
						qtList.add(suggList);
						//console.log(qtList);
					}
				}
				catch (e)
				{
					console.log(e);
					qtList = new QTList([]);;
				}
			}
			
			//adding relatedness score for each QT
			for (const qt of qtList.getList())
			{
				//console.log(qt);
				//fetch label
				const label = await this.getLabelFromUri(qt.getIncr());
				//console.log(label);
				qt.setLabel(label);
				
				//relatedness
				const relatedness = await NLPToolsParameters.getRelatedness(qt.getLabel(),navState.getCurrentKeyword().toString())
				qt.setScore(relatedness);
				
			}
			
			//ranking the QT list
			qtList = qtList.rankByScore();
		}
		else
		{
			console.error("mot clé trop petit")
			qtList = new QTList([]);
		}
		
		//alternative de filtrage
		if(qtList.isEmpty()&&!sparklis.endpoint().includes('wikidata'))
		{
			console.log("Alternative filtering")
			qtList = await this._getFilteredQTbyRelatedness(navState);
			//ranking the QT list
			qtList = qtList.rankByScore();
		}
		
		return qtList;
	}
	
	//Alternate filtering in case the sparklis filtering is empty
	async _getFilteredQTbyRelatedness(navState)
	{
		let qtList = new QTList();
		
		const synonyms = navState.getCurrentKeywordSynonyms()
			.toString().toLowerCase().split(",").filter(e=>e.length>2);
		console.log("Current synonyms :",synonyms);
		const keyword = navState.getCurrentKeyword()
		
		for(const syn of synonyms)//nouvelle contrainte pour chaque synonyme
		{
			try
			{
				//get unfiltered suggestion list from Sparklis
				let suggList = await (new Suggestions()).create_all(navState);
				if(suggList==='error')
				{
					await Utils.sleep(6000);
					qtList = 'error'; break;
				}
				else
				{
					//console.log(suggList);
					for (const s of suggList)
					{
						//console.log(s);
						const label = await this._getLabelFromUriMondial(s);
						const synRelatedness = await NLPToolsParameters.getRelatedness(label,syn);
						const kwRelatedness = await NLPToolsParameters.getRelatedness(label,keyword);
						if( synRelatedness>=0.2 && kwRelatedness>=0.2)
						{
							let qt = new QT(s);
							qt.setScore(kwRelatedness);
							qt.setLabel(label);
							qtList.add(qt);
						}
					}
					//console.log("filtered qtList",qtList);
				}
			}
			catch (e)
			{
				console.log(e);
				qtList = 'error'; break;
			}
		}
		
		
		//ranking the QT list
		qtList.filterByScore(0.2);
		qtList = qtList.rankByScore();
	
		
		return qtList;
	}
	
	async _getLabelFromUriWiki(incr)
	{
		//const incr = qt.getIncr()
		const uri = incr.uri?incr.uri:incr.pred["uri"+incr.pred.type[1]];//cas des incrPred
		const id = uri.replace('http://www.wikidata.org/entity/', '')
			.replace('http://www.wikidata.org/prop/direct/', '')
			.replace('http://www.wikidata.org/prop/statement/', '');
		
		//recuperer le label
		
		let labelQuery = "SELECT ?item ?itemLabel WHERE {" + "   VALUES ?item { wd:"+id+' }' + '   SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }}';
		
		let res = await sparklis.evalSparql(labelQuery);
		return res.rows[0][1].str;
	}

	
	async _getLabelFromUriMondial(incr)
	{
		//const incr = qt.getIncr()
		const uri = incr.uri?incr.uri:incr.pred["uri"+incr.pred.type[1]];//cas des incrPred
		const label = uri.split('#')[1];

		return label;
	}

	async navigate(place, qt)
	{
		
		console.log("Waiting for Sparklis to update.");
		let newPlace = place.applySuggestion(qt.getIncr());
		console.log('Navigate through ', qt.getLabel());
		await this.getResults(newPlace);
		console.log("Sparklis has navigated");
		
		if(SparklisAPI._view_mode)
		{
			this._sparklis.setCurrentPlace(newPlace)
			await this.getResults(newPlace);
		}
		
		return newPlace;
	}

	async back()
	{
		console.log("Waiting for Sparklis to update.");
		sparklis.back();
		await this.getResults();
		console.log("Sparklis has updated a back.");
	}

	
	async home()
	{

		console.log("Waiting for Sparklis to update.");

		this._sparklis.home();
		await this.getResults();
		
		console.log("Sparklis has updated a home.")
	}
	
	async getResults(place)
	{
		place = place?place:this._sparklis.currentPlace();
		let res = await new Promise(resolve=>{
			place.onEvaluated(()=>resolve(place.results()))});
		return res;
	}
	
	static hasEmptyQuery(place)
	{
		return place.sparql == null;
	}

	async main(navState)
	{
		try
		{
			// let res = await new Promise(resolve=>{
			// 	sparklis.currentPlace().onEvaluated(()=>resolve(sparklis.currentPlace().results()))});
			// console.log(res.rows);
			await Utils.sleep(10000);
			let res = await new Promise(resolve=>{
			 	sparklis.currentPlace().onEvaluated(()=>resolve(sparklis.currentPlace().results()))});
			
			for (const r of res.rows)
			{
				const uri = r[0].uri;
				await sparklis.termLabels().sync();
				await sparklis.classLabels().sync();
				await sparklis.propertyLabels().sync();
				//console.log(sparklis.termLabels().info(uri));
				
				console.log(sparklis.classLabels().info(uri));
				//console.log(sparklis.propertyLabels().info(uri));
			}
		}
		catch (e)
		{
			console.error(e);
		}
	}
/**
 * OLD
 */
	/**
	 * A changer
	 * @returns
	 */
	 static _sparklisExists()
	 {
		 return typeof sparklis != "undefined";
	 }
 
	 /**
	  * A changer
	  * @returns
	  */
	 static async _waitForSparklis()
	 {
		 let sparklis_exists = false;

		 while (!sparklis_exists)
		 {
			 await Utils.sleep(250);
			 console.log("nope");
			 sparklis_exists = SparklisAPI._sparklisExists();
		 }
		 
		 while (sparklis.currentPlace().hasPartialResults())
		 {
			 await Utils.sleep(250);
			 console.log("nope !");
			 sparklis_exists = SparklisAPI._sparklisExists();
			}
			
		
		 this._sparklis = sparklis;
		 // await SparklisAPI._updateConceptSuggestions("True");
		 // await SparklisAPI._updateTermSuggestions("True");
		 console.log("Sparklis activé");
	 }

// 	/**
// 	 * Exclure les concepts qui ne sont ni des relations ni des Classes ni de fréquence > 0
// 	 * @param {sparklis-suggestions-forest} suggestions_forest
// 	 * @returns {sparklis-suggestions-forest}
// 	 */
// 	 static _preprocessConceptSuggestions(suggestions_forest)
// 	 {
// 		 return suggestions_forest == null? [] : suggestions_forest.filter(s => (s.item.suggestion.type === 'IncrRel' || s.item.suggestion.type === 'IncrType') && s.item.frequency.value > 0);
//
// 	}
//
// 	 _preprocessConceptSuggestions(suggestions_forest)
// 	{
// 		return suggestions_forest == null? [] : suggestions_forest.filter(s => (s.item.suggestion.type === 'IncrRel' || s.item.suggestion.type === 'IncrType') && s.item.frequency.value > 0);
// 	}
//
// 	/**
// 	 * Récupère les suggestions de concepts proposées apr Sparklis
// 	 * @param {*} constr
// 	 * @returns
// 	 */
// 	static async _updateConceptSuggestions(constr)
// 	{
// 		let partial_suggs = await sparklis.currentPlace().getConceptSuggestions(false, constr);
// 		this._concept_suggestion_forest = this._preprocessConceptSuggestions(partial_suggs.forest);
//
// 	}
//
// 	async _updateConceptSuggestions(constr)
// 	{
// 		const partial_suggs = await sparklis.currentPlace().getConceptSuggestions(false, constr);
// 		return this._preprocessConceptSuggestions(partial_suggs.forest);
// 	}
//
// 	 /**
// 	  *
// 	  * @param {String} word
// 	  * @param boolConstr
// 	  * @returns {Array} La premiere suggestion Concept de type 'IncrType'
// 	  * ou dans le cas échéant la premiere suggestion Concept de type 'IncrType'
// 	  * ou dans le cas échéant []
// 	  */
// 	 static async _getConceptSuggestion(word, boolConstr = true)
// 	 {
// 		 try {
// 			 //Contrainte
// 			 let constr = null;
// 			 if (boolConstr)
// 			 {  try
// 			 {
// 				 constr = await new Constraint().create(word.toString().toLowerCase());
// 				 constr.kwds.map(x=>Utils.camelize(x))///////////////////////////////////////
// 				 console.log('constr :', constr);
// 				 await this._updateConceptSuggestions(constr);
//
//
// 			 }
// 			 catch (e)
// 			 {
// 				 console.error(e)
// 			 }
// 			 }
// 			 //
// 			 //console.log(this._concept_suggestion_forest);
//
// 			 if (!Utils.isEmpty(this._concept_suggestion_forest))
// 			 {
// 				 console.log("Concept suggestions found, sorting ...");
// 				 //return await this._sortConceptSuggestion_v1(this._concept_suggestion_forest);
// 				 //return this._filterConceptSuggestion_v0(this._concept_suggestion_forest);
// 				 return await this._sortConceptSuggestion_v2(word.toString());
// 			 }
// 			 else
// 			 {
// 				 if (word === "True")
// 				 {
// 					 console.log('No concept suggestions found.');
// 				 }
// 				 else
// 				 {
// 					 console.log('No concept suggestions found for ' + word + '.');
// 				 }
// 				 return [];
// 			 }
// 		 }
// 		 catch(e)
// 		 {
// 			 console.error(e);
// 		 }
//
//
// 	 }
//
//
//
// 	 /**
// 	  * Ordre de priorité sur les Classes puis les Relations
// 	  * @returns {sparklis-suggestion}
// 	  */
// 	 static _filterConceptSuggestion_v0()
// 	 {
// 		 let selected_suggestion = this._concept_suggestion_forest.find(suggestion => suggestion.item.suggestion.type === 'IncrType' && suggestion.item.frequency !== 0);
//
// 		 if (Utils.isEmpty(selected_suggestion))
// 		 {
// 			 return selected_suggestion.item.suggestion;
// 		 }
//
// 		 selected_suggestion = this._concept_suggestion_forest.find(suggestion => suggestion.item.suggestion.type === 'IncrRel' && suggestion.item.frequency !== 0);
//
// 		 if (Utils.isEmpty(selected_suggestion))
// 		 {
// 			 return selected_suggestion.item.suggestion;
// 		 }
//
// 		 return selected_suggestion.item.suggestion;
// 	 }
//
// 	 /**
// 	  * Compte le nombre de suggestions possibles si la suggestion s était appliquée
// 	  * /!\ marche pas
// 	  * @param {*} s
// 	  * @param {*[]} suggestion_to_sort
// 	  */
// 	 static async _getCountSuggestions(s, suggestion_to_sort)
// 	 {
//
// 		 const suggestion = s.item.suggestion;
// 		 console.log(suggestion);
// 		 await SparklisAPI.activateSuggestion(suggestion);
// 		 console.log("Activation de "+ suggestion.uri+".");
// 		 //await new Promise(()=>setTimeout(()=>{console.log('done');},5000));
// 		 ///*
// 		 console.log("Query :", sparklis.currentPlace().query());
// 		 await this._updateConceptSuggestions("True");
// 		 await this._updateTermSuggestions("True");
// 		 const count_suggestions = (this._concept_suggestion_forest).length + (this._term_suggestion_forest).length;
// 		 console.log('suggestion to sort',[suggestion, count_suggestions]);
// 		 suggestion_to_sort.push({'suggestion': suggestion, 'count': count_suggestions});
// 		 await SparklisAPI.back_old();
// 		 //*/
//
// 	 }
//
// 	 static async back_old()
// 	 {
// 		 await sparklis.back();
// 		 await this._updateConceptSuggestions("True");
// 		 await this._updateTermSuggestions("True");
// 	 }
//
// 	  /**
// 	   * Tri en fonction du nombre de suggestions possibles si la suggestion s était appliquée
// 	   * /!\ marche pas
// 	   */
// 	 static async _sortConceptSuggestion_v1()
// 	 {
// 		 let suggestion_to_sort = [];
//
// 		 if (this._concept_suggestion_forest.length !== 0)
// 		 {
// 			 //count
// 			 for (const suggestion of this._concept_suggestion_forest)
// 			 {
// 				 await this._getCountSuggestions(suggestion, suggestion_to_sort);
// 			 }
// 			 //sort
// 			 const sorted_suggestion = suggestion_to_sort.sort(function comp(s1,s2){if (s1.count>s2.count){return 1}else{return-1}});
// 			 console.log(sorted_suggestion);
//
// 			 //retour du meilleur
// 			 return sorted_suggestion[0].suggestion;
// 		 }
//
//
// 		 //renvoie la liste vide
// 		 return selected_suggestion
// 	 }
//
// 	 static _getLabel(suggestion)
// 	 {
// 		 const uri = suggestion.uri;
// 		 if (suggestion.type === "IncrType")
// 		 {
// 			 return sparklis.classLabels().info(uri);
// 		 }
// 		 if (suggestion.type === "IncrRel")
// 		 {
// 			 //(sparklis.propertyLabels().info(uri).label);
// 			 return sparklis.propertyLabels().info(uri).label;
// 		 }
// 		 if (suggestion.type === "IncrTerm")
// 		 {
// 			 return sparklis.termLabels().info(uri).label;
// 		 }
//
// 	 }
//
// 	 /**
// 	  * Works only on DBpédia, sorted by relatedness
// 	  * recupère le label tel qu'il soit le dernier mot avant un /
// 	  * temporise par un appel à conceptNet/sec
// 	  *
// 	  * @param {*} word
// 	  * @returns
// 	  */
// 	 static async _sortConceptSuggestion_v2(word)
// 	 {
// 		 let suggestion_to_sort = [];
//
// 		 if (!Utils.isEmpty(this._concept_suggestion_forest))
// 		 {
// 			 //count
// 			 for (const suggestion of this._concept_suggestion_forest)
// 			 {
//
// 				 //console.log("Similarité sémantique entre " + word + " et " + suggestion.item.suggestion.uri + ".");
// 				 //recuperer le label de la suggestion
// 				 //console.warn("getting label");
// 				 const suggestion_label = this._getLabel(suggestion.item.suggestion);
//
// 				 if(!/\d/.test(suggestion_label) && !suggestion_label.includes(" ID"))//exclusion des labels comportant des chiffres et les ID
// 				 {
// 					 //recuperer la relatedness
// 					 const relatedness = await new Promise(async (resolve)=>setTimeout(async ()=>resolve(await ConceptNet.getRelatedness(word, suggestion_label)), 1000));
// 					 //console.warn("Relatedness :", relatedness);
//
// 					 if(relatedness > 0.2) //exclusion des relatedness avec mu<0.2
// 					 {
// 						 suggestion_to_sort.push({'suggestion': suggestion.item.suggestion, 'relatedness': relatedness});
// 					 }
//
// 					 if(relatedness === 1)
// 					 {
// 						 return suggestion.item.suggestion;
// 					 }
// 				 }
// 			 }
// 			 //sort
// 			 const sorted_suggestion = suggestion_to_sort.sort(function comp(s1,s2){if (s1.relatedness < s2.relatedness){return 1}else{return-1}});
// 			 console.log(sorted_suggestion);
//
// 			 //retour du meilleur et priorité sur les classes
// 			 return Utils.isEmpty(sorted_suggestion)?{}:sorted_suggestion.find(s => (s.suggestion.type === "IncrType" && s.relatedness === sorted_suggestion[0].relatedness))?
// 					 sorted_suggestion.find(s => (s.suggestion.type === "IncrType" && s.relatedness === sorted_suggestion[0].relatedness)).suggestion:
// 					 sorted_suggestion[0].suggestion
// 		 }
// 		 else
// 		 {
// 			 throw new Error("No Selected Concept Suggestions")
// 		 }
// 	 }
//
//
//
// 	 /**
// 	  * Exclure les Terms qui ne sont ni des Terms ni de fréquence > 0
// 	  * @param {sparklis-suggestions-forest} suggestions_forest
// 	  * @returns {sparklis-suggestions-forest}
// 	  */
// 	  static _preprocessTermSuggestions(suggestions_forest)
// 	  {
// 		  return suggestions_forest.filter(s => s.item.suggestion.type === 'IncrTerm' && (s.item.frequency !== 0 && s.item.frequency.value !== 0));
//
// 	  }
// 		 _preprocessTermSuggestions(suggestions_forest)
// 	  {
// 		  return suggestions_forest.filter(s => s.item.suggestion.type === 'IncrTerm' && (s.item.frequency !== 0 && s.item.frequency.value !== 0));
//
// 	  }
//
// 	 /**
// 	  * Récupère les suggestions d'entitées proposées par Sparklis en fonction d'une contrainte
// 	  * @param {*} constr
// 	  * @returns
// 	  */
// 	 static async _updateTermSuggestions(constr)
// 	 {
// 		 let suggestion_forest  = await sparklis.currentPlace().getTermSuggestions(true, constr);
// 		 this._term_suggestion_forest  = this._preprocessTermSuggestions(suggestion_forest.forest)
// 		 if(this._term_suggestion_forest == null)
// 		 {
// 			 console.warn("SparklisAPI._term_suggestion_forest null");
// 			 throw new Error("Return null when looking for Term suggestions")
// 		 }
// 	 }
// 	  async _updateTermSuggestions(constr)
// 	 {
// 		let suggestion_forest  = await sparklis.currentPlace().getTermSuggestions(true, constr);
// 		this._suggestion_forest  = this._preprocessTermSuggestions(suggestion_forest.forest)
// 		if(this._suggestion_forest == null)
// 		{
// 			console.warn("SparklisAPI._term_suggestion_forest null");
// 			throw new Error("Return null when looking for Term suggestions")
// 		}
// 	 }
//
// 	 /**
// 	  *
// 	  * @param {*} word
// 	  * @returns La suggestion Term si elle est unique
// 	  * ou la contrainte "matches" si il y a plusieurs Term
// 	  * ou dans le cas échéant []
// 	  */
// 	 static async _getTermSuggestion(word)
// 	 {
// 		 try {
// 			 const constr = await new Constraint().create(word.toString());
// 			 await this._updateTermSuggestions(constr);
// 			 const selected_term = this._term_suggestion_forest.filter(suggestion => suggestion.item.frequency!==0 && suggestion.item.suggestion.type === 'IncrTerm');
//
// 			 if (Utils.isEmpty(selected_term))
// 			 {
// 				 console.log('No term suggestions found for ' + word + '.');
// 				 return selected_term;
// 			 }
// 			 /* pb mapping
// 			 if (selected_term.length === 1)
// 			 {
// 				 console.log('Un term unique trouvé pour ' + word + '.');
// 				 return selected_term[0].item.suggestion;
// 			 }
// 			 */
// 			 console.log('Plusieurs term trouvés, activation d\'un *matches* pour ' + word + '.');
// 			 return { type: "IncrConstr", constr: constr, filterType: ("Mixed") };
// 		 }
// 		 catch (error)
// 		 {
// 			 console.error(error)
// 		 }
// 	 }
//
// 	 /**
// 	  *  Version asynchrone, attend que les suggestions se mettent à jour
// 	  * @param {sparklis-suggestion} suggestion
// 	  */
//
// 	 static async activateSuggestion(suggestion)
// 	 {
// 		 if (!Utils.isEmpty(suggestion))
// 		 {
//
// 			 console.log("Waiting for Sparklis to update.");
// 			 const old_sugg = SparklisAPI._concept_suggestion_forest;
//
//
// 			 sparklis.activateSuggestion(suggestion);
//
// 		 }
// 	 }
//
// 	async activateSuggestion(suggestion)
// 	 {
// 		 if(!Utils.isEmpty(suggestion))
// 		 {
//
// 			 console.log("Waiting for Sparklis to update.");
// 			 this._updateConceptSuggestions("True");
// 			 sparklis.activateSuggestion(suggestion);
//
//
// 			 console.log("Sparklis updated.")
// 		 }
// 		 else
// 		 {
// 			 console.log("suggestion empty", suggestion);
// 		 }
// 	 }
//
//
// 	 /**
// 	  * Activation dans Sparklis d'une suggestion
// 	  * correspondant à un mot ou groupe de mots provenant d'une phrase en NL
// 	  * @param {String} word mot ou groupe de mot
// 	  * @param boolConstr
// 	  */
// 	 static async activateWord(word, boolConstr = true)
// 	 {
// 		 const concept_suggestion_forest = this._concept_suggestion_forest;
// 		 const term_suggestion_forest = this._term_suggestion_forest;
// 		 console.log("current word :", word);
// 		 console.log("Looking for Concept suggestion...");
// 		 const concept_suggestion = await this._getConceptSuggestion(word.toString(), boolConstr);
// 		 console.log('Chosen concept suggestion : ', concept_suggestion);
// 		 if (!Utils.isEmpty(concept_suggestion))
// 		 {
// 			 await SparklisAPI.activateSuggestion(concept_suggestion);
// 		 }
// 		 else
// 		 {
// 			 console.log("Looking for Term suggestion...");
// 			 const term_suggestion = await this._getTermSuggestion(word.toString());
// 			 if (!Utils.isEmpty(term_suggestion))
// 			 {
// 				 await SparklisAPI.activateSuggestion(term_suggestion);
// 			 }
// 			 else
// 			 {
// 				 console.log("Looking for semantic similarities with current concepts...")
// 				 this._concept_suggestion_forest = concept_suggestion_forest;
// 				 this._term_suggestion_forest = term_suggestion_forest;
// 				 const suggestion = await this._getConceptSuggestion(word.toString(), false);
// 				 if (!Utils.isEmpty(suggestion))
// 				 {
// 					 await SparklisAPI.activateSuggestion(suggestion);
// 				 }
// 				 else
// 				 {
//
// 					 console.log("No suggestion found for " + word + ".")
// 					 await SparklisAPI.activateSuggestion({type: "IncrTriple" , arg: "S"});
// 				 }
// 			 }
// 		 }
//
// 	 }
//
 }

export { SparklisAPI };
export default { SparklisAPI };