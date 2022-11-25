import * as Utils from '../../models/Utils.js';
import { ACN } from "../../models/ACN.js";
import { QTList } from "../../models/QTList.js";
import * as Constraint from "./Constraint.js"
import ConceptNet from '../NLP/ConceptNet.js';


/**
  * SparklisAPI
  *
  * @class SparklisAPI
  * @extends {ACN}
  */

class SparklisAPI extends ACN
{
	static _sparklis;
	constructor()
	{
		super();
	}
	//CONTROLLER
	async init()
	{
		await SparklisAPI._waitForSparklis();
		this._sparklis = sparklis;
		this._sparklis.home();
	}

	async getFilteredQT(navState)
	{
		this._suggestion_forest = undefined;
		let syn = navState.getCurrentKeywordSynonyms().toString().toLowerCase().split(",");
		console.log(syn);
		//contrainte Spraklis
		let constr = await new Constraint.Constraint().create(syn);
		console.log('constr :', constr);
		let qtList;
		//get increment
		if(navState.getCurrentKeyword().getType() === 'NE')
		{
			
			
			qtList =  new QTList([{ type: "IncrConstr", constr: { type: "MatchesAny", kwds: [navState.getCurrentKeyword().toString()] }, filterType: ("Mixed") }]);
			
		}
		else 
		{
			await this._updateConceptSuggestions(constr);
			let toto = this._suggestion_forest.map(x=>x.item.suggestion);
			
			let tata = toto.filter(e=>{return!((navState.getQTPath().includes(e)))}); ////permet pas d'actionner plusieurs increments similaires
			qtList = new QTList(tata);
		}
		await  this.getResults();
		//concept forest
		//term forest
		console.log(this._suggestion_forest);
		return qtList;
	}

	async navigate(qt)
	{
		await this.activateSuggestion(qt);
		console.log('navigate through ', qt);
		await  this.getResults();
	}

	async back()
	{
		console.log("Waiting for Sparklis to update.");
		const old_sugg = await this._updateConceptSuggestions("True");
		try {
			await Utils.sleep(250);
			console.warn("sleep");
			sparklis.back();
			await  this.getResults();
			console.log("Sparklis has updated a back.")
		}catch(e)
		{
			console.warn("sleep more");
			console.error(e);
			await Utils.sleep(1000);
			this.back()
		}
	}

	
	async home()
	{

		console.log("Waiting for Sparklis to update.");
		//const old_sugg = await this._updateConceptSuggestions("True");
		//console.warn(old_sugg);
		sparklis.home();
		await  this.getResults();

		// while(this._suggestion_forest === old_sugg || Utils.isEmpty(this._suggestion_forest))
		// {
			
		// 	await this._updateConceptSuggestions("True");
		// 	//console.log(sugg);
		// 	await Utils.sleep(250);
		// }
		console.log("Sparklis has updated a home.")
	}
	
	async getResults()
	{
		//let res = sparklis.currentPlace().results();
		let res = await new Promise(resolve=>{
				sparklis.currentPlace().onEvaluated(()=>resolve(sparklis.currentPlace().results()))});
		let i = 0;
		//console.warn(Utils.isEmpty(res.columns), res.columns);
		// while(Utils.isEmpty(res.columns) && i<5)
		// {
		// 	console.warn("here");
		// 	Utils.sleep(1000);
		// 	res = sparklis.currentPlace().results();
		// 	i++;
		// }
		console.log(res)
		return res;
	}

	async main(navState)
	{

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
		 await SparklisAPI._updateConceptSuggestions("True");
		 await SparklisAPI._updateTermSuggestions("True");
		 console.log("Sparklis activé");
	 }

	/**
	 * Exclure les concepts qui ne sont ni des relations ni des Classes ni de fréquence > 0
	 * @param {sparklis-suggestions-forest} suggestions_forest 
	 * @returns {sparklis-suggestions-forest}
	 */
	 static _preprocessConceptSuggestions(suggestions_forest)
	 {
		 return suggestions_forest == null? [] : suggestions_forest.filter(s => (s.item.suggestion.type === 'IncrRel' || s.item.suggestion.type === 'IncrType') && s.item.frequency.value > 0);
		
	}

	 _preprocessConceptSuggestions(suggestions_forest)
	{
		return suggestions_forest == null? [] : suggestions_forest.filter(s => (s.item.suggestion.type === 'IncrRel' || s.item.suggestion.type === 'IncrType') && s.item.frequency.value > 0);
	}
	
	/**
	 * Récupère les suggestions de concepts proposées apr Sparklis
	 * @param {*} constr 
	 * @returns 
	 */
	static async _updateConceptSuggestions(constr)
	{
		let partial_suggs = await sparklis.currentPlace().getConceptSuggestions(false, constr);
		this._concept_suggestion_forest = this._preprocessConceptSuggestions(partial_suggs.forest);
	
	 }
	
	 async _updateConceptSuggestions(constr)
	{
		let partial_suggs = await sparklis.currentPlace().getConceptSuggestions(false, constr);
		this._suggestion_forest = this._preprocessConceptSuggestions(partial_suggs.forest);
		return this._suggestion_forest;

	}
 
	 /**
	  *
	  * @param {String} word
	  * @param boolConstr
	  * @returns {Array} La premiere suggestion Concept de type 'IncrType'
	  * ou dans le cas échéant la premiere suggestion Concept de type 'IncrType'
	  * ou dans le cas échéant []
	  */
	 static async _getConceptSuggestion(word, boolConstr = true)
	 {
		 try {
			 //Contrainte
			 let constr = null;
			 if (boolConstr)
			 {  try
			 {
				 constr = await new Constraint().create(word.toString().toLowerCase());
				 constr.kwds.map(x=>Utils.camelize(x))///////////////////////////////////////
				 console.log('constr :', constr);
				 await this._updateConceptSuggestions(constr);
				 
				 
			 }
			 catch (e)
			 {
				 console.error(e)
			 }
			 }
			 //
			 //console.log(this._concept_suggestion_forest);
			
			 if (!Utils.isEmpty(this._concept_suggestion_forest))
			 {
				 console.log("Concept suggestions found, sorting ...");
				 //return await this._sortConceptSuggestion_v1(this._concept_suggestion_forest);
				 //return this._filterConceptSuggestion_v0(this._concept_suggestion_forest);
				 return await this._sortConceptSuggestion_v2(word.toString());
			 }
			 else
			 {
				 if (word === "True")
				 {
					 console.log('No concept suggestions found.');
				 }
				 else
				 {
					 console.log('No concept suggestions found for ' + word + '.');
				 }
				 return [];
			 }
		 }
		 catch(e)
		 {
			 console.error(e);
		 }
		 
		 
	 }
 
 
	 
	 /**
	  * Ordre de priorité sur les Classes puis les Relations
	  * @returns {sparklis-suggestion}
	  */
	 static _filterConceptSuggestion_v0()
	 {
		 let selected_suggestion = this._concept_suggestion_forest.find(suggestion => suggestion.item.suggestion.type === 'IncrType' && suggestion.item.frequency !== 0);
		 
		 if (Utils.isEmpty(selected_suggestion)) 
		 {
			 return selected_suggestion.item.suggestion;    
		 }
		 
		 selected_suggestion = this._concept_suggestion_forest.find(suggestion => suggestion.item.suggestion.type === 'IncrRel' && suggestion.item.frequency !== 0);
		 
		 if (Utils.isEmpty(selected_suggestion))
		 {
			 return selected_suggestion.item.suggestion;    
		 } 
		 
		 return selected_suggestion.item.suggestion;
	 }
 
	 /**
	  * Compte le nombre de suggestions possibles si la suggestion s était appliquée
	  * /!\ marche pas
	  * @param {*} s
	  * @param {*[]} suggestion_to_sort
	  */
	 static async _getCountSuggestions(s, suggestion_to_sort)
	 {
		 
		 const suggestion = s.item.suggestion;
		 console.log(suggestion);
		 await SparklisAPI.activateSuggestion(suggestion);
		 console.log("Activation de "+ suggestion.uri+".");
		 //await new Promise(()=>setTimeout(()=>{console.log('done');},5000));
		 ///*
		 console.log("Query :", sparklis.currentPlace().query());
		 await this._updateConceptSuggestions("True");
		 await this._updateTermSuggestions("True");
		 const count_suggestions = (this._concept_suggestion_forest).length + (this._term_suggestion_forest).length;
		 console.log('suggestion to sort',[suggestion, count_suggestions]);
		 suggestion_to_sort.push({'suggestion': suggestion, 'count': count_suggestions});
		 await SparklisAPI.back_old();
		 //*/
		 
	 }
 
	 static async back_old()
	 {
		 await sparklis.back();
		 await this._updateConceptSuggestions("True");
		 await this._updateTermSuggestions("True");
	 }
	 
	  /**
	   * Tri en fonction du nombre de suggestions possibles si la suggestion s était appliquée
	   * /!\ marche pas
	   */
	 static async _sortConceptSuggestion_v1()
	 {
		 let suggestion_to_sort = [];
		 
		 if (this._concept_suggestion_forest.length !== 0)
		 {
			 //count
			 for (const suggestion of this._concept_suggestion_forest)
			 {
				 await this._getCountSuggestions(suggestion, suggestion_to_sort);
			 }
			 //sort
			 const sorted_suggestion = suggestion_to_sort.sort(function comp(s1,s2){if (s1.count>s2.count){return 1}else{return-1}});
			 console.log(sorted_suggestion);
 
			 //retour du meilleur
			 return sorted_suggestion[0].suggestion;
		 }
		 
 
		 //renvoie la liste vide
		 return selected_suggestion
	 }
 
	 static _getLabel(suggestion)
	 {
		 const uri = suggestion.uri;
		 if (suggestion.type === "IncrType")
		 {
			 return sparklis.classLabels().info(uri);
		 }
		 if (suggestion.type === "IncrRel")
		 {
			 //(sparklis.propertyLabels().info(uri).label);
			 return sparklis.propertyLabels().info(uri).label;
		 }
		 if (suggestion.type === "IncrTerm")
		 {
			 return sparklis.termLabels().info(uri).label;
		 }
 
	 }
 
	 /**
	  * Works only on DBpédia, sorted by relatedness
	  * recupère le label tel qu'il soit le dernier mot avant un /
	  * temporise par un appel à conceptNet/sec
	  * 
	  * @param {*} word
	  * @returns 
	  */
	 static async _sortConceptSuggestion_v2(word)
	 {
		 let suggestion_to_sort = [];
		 
		 if (!Utils.isEmpty(this._concept_suggestion_forest))
		 {
			 //count
			 for (const suggestion of this._concept_suggestion_forest)
			 {
				 
				 //console.log("Similarité sémantique entre " + word + " et " + suggestion.item.suggestion.uri + ".");
				 //recuperer le label de la suggestion
				 //console.warn("getting label");
				 const suggestion_label = this._getLabel(suggestion.item.suggestion);
 
				 if(!/\d/.test(suggestion_label) && !suggestion_label.includes(" ID"))//exclusion des labels comportant des chiffres et les ID
				 {
					 //recuperer la relatedness
					 const relatedness = await new Promise(async (resolve)=>setTimeout(async ()=>resolve(await ConceptNet.getRelatedness(word, suggestion_label)), 1000));
					 //console.warn("Relatedness :", relatedness);
					 
					 if(relatedness > 0.2) //exclusion des relatedness avec mu<0.2
					 {
						 suggestion_to_sort.push({'suggestion': suggestion.item.suggestion, 'relatedness': relatedness});
					 } 
 
					 if(relatedness === 1)
					 {
						 return suggestion.item.suggestion;
					 }
				 }
			 }
			 //sort
			 const sorted_suggestion = suggestion_to_sort.sort(function comp(s1,s2){if (s1.relatedness < s2.relatedness){return 1}else{return-1}});
			 console.log(sorted_suggestion);
 
			 //retour du meilleur et priorité sur les classes
			 return Utils.isEmpty(sorted_suggestion)?{}:sorted_suggestion.find(s => (s.suggestion.type === "IncrType" && s.relatedness === sorted_suggestion[0].relatedness))?
					 sorted_suggestion.find(s => (s.suggestion.type === "IncrType" && s.relatedness === sorted_suggestion[0].relatedness)).suggestion:
					 sorted_suggestion[0].suggestion
		 }
		 else
		 {
			 throw new Error("No Selected Concept Suggestions")
		 }
	 }
 
	 
 
	 /**
	  * Exclure les Terms qui ne sont ni des Terms ni de fréquence > 0
	  * @param {sparklis-suggestions-forest} suggestions_forest 
	  * @returns {sparklis-suggestions-forest}
	  */
	  static _preprocessTermSuggestions(suggestions_forest)
	  {
		  return suggestions_forest.filter(s => s.item.suggestion.type === 'IncrTerm' && (s.item.frequency !== 0 && s.item.frequency.value !== 0));
  
	  }
		 _preprocessTermSuggestions(suggestions_forest)
	  {
		  return suggestions_forest.filter(s => s.item.suggestion.type === 'IncrTerm' && (s.item.frequency !== 0 && s.item.frequency.value !== 0));
  
	  }
	 
	 /**
	  * Récupère les suggestions d'entitées proposées par Sparklis en fonction d'une contrainte
	  * @param {*} constr 
	  * @returns 
	  */
	 static async _updateTermSuggestions(constr)
	 {
		 let suggestion_forest  = await sparklis.currentPlace().getTermSuggestions(true, constr);
		 this._term_suggestion_forest  = this._preprocessTermSuggestions(suggestion_forest.forest)
		 if(this._term_suggestion_forest == null)
		 {
			 console.warn("SparklisAPI._term_suggestion_forest null");
			 throw new Error("Return null when looking for Term suggestions")
		 }
	 }
	  async _updateTermSuggestions(constr)
	 {
		let suggestion_forest  = await sparklis.currentPlace().getTermSuggestions(true, constr);
		this._suggestion_forest  = this._preprocessTermSuggestions(suggestion_forest.forest)
		if(this._suggestion_forest == null)
		{
			console.warn("SparklisAPI._term_suggestion_forest null");
			throw new Error("Return null when looking for Term suggestions")
		}
	 }
 
	 /**
	  * 
	  * @param {*} word 
	  * @returns La suggestion Term si elle est unique 
	  * ou la contrainte "matches" si il y a plusieurs Term
	  * ou dans le cas échéant []
	  */
	 static async _getTermSuggestion(word)
	 {
		 try {
			 const constr = await new Constraint().create(word.toString());
			 await this._updateTermSuggestions(constr);
			 const selected_term = this._term_suggestion_forest.filter(suggestion => suggestion.item.frequency!==0 && suggestion.item.suggestion.type === 'IncrTerm');
 
			 if (Utils.isEmpty(selected_term))
			 {
				 console.log('No term suggestions found for ' + word + '.');
				 return selected_term;
			 }
			 /* pb mapping
			 if (selected_term.length === 1)
			 {
				 console.log('Un term unique trouvé pour ' + word + '.');
				 return selected_term[0].item.suggestion;
			 } 
			 */
			 console.log('Plusieurs term trouvés, activation d\'un *matches* pour ' + word + '.');
			 return { type: "IncrConstr", constr: constr, filterType: ("Mixed") };    
		 } 
		 catch (error) 
		 {
			 console.error(error)
		 }
	 }
 
	 /**
	  *  Version asynchrone, attend que les suggestions se mettent à jour
	  * @param {sparklis-suggestion} suggestion 
	  */
 
	 static async activateSuggestion(suggestion)
	 {
		 if(!Utils.isEmpty(suggestion))
		 {
 
			 console.log("Waiting for Sparklis to update.");
			 const old_sugg = SparklisAPI._concept_suggestion_forest;
			 
			 
			 
			 sparklis.activateSuggestion(suggestion);
			 while(SparklisAPI._concept_suggestion_forest === old_sugg || Utils.isEmpty(SparklisAPI._concept_suggestion_forest))
			 {
				 
				 await SparklisAPI._updateConceptSuggestions("True");
				 //console.log(sugg);
				 await Utils.sleep(250);
				}
				console.log("Sparklis updated.")
			}
	 }
	async activateSuggestion(suggestion)
	 {
		 if(!Utils.isEmpty(suggestion))
		 {
			 
			 console.log("Waiting for Sparklis to update.");
			 let old_sugg = this._suggestion_forest;
			 this._updateConceptSuggestions("True");
			 sparklis.activateSuggestion(suggestion);
			 console.log(JSON.stringify(this._suggestion_forest));
			 console.log(JSON.stringify(old_sugg));
			 let i = 0;
			 while((JSON.stringify(this._suggestion_forest)===JSON.stringify(old_sugg)|| Utils.isEmpty(this._suggestion_forest))&& (i<4))
			 {
				 await this._updateConceptSuggestions("True");
				 //console.log(sugg);
				 await Utils.sleep(250);
				}
				i++;
			}
			console.log("Sparklis updated.")
	 }
	 
 
	 /**
	  * Activation dans Sparklis d'une suggestion
	  * correspondant à un mot ou groupe de mots provenant d'une phrase en NL
	  * @param {String} word mot ou groupe de mot
	  * @param boolConstr
	  */
	 static async activateWord(word, boolConstr = true)
	 {
		 const concept_suggestion_forest = this._concept_suggestion_forest;
		 const term_suggestion_forest = this._term_suggestion_forest;
		 console.log("current word :", word);
		 console.log("Looking for Concept suggestion...");
		 const concept_suggestion = await this._getConceptSuggestion(word.toString(), boolConstr);
		 console.log('Chosen concept suggestion : ', concept_suggestion);
		 if (!Utils.isEmpty(concept_suggestion)) 
		 {
			 await SparklisAPI.activateSuggestion(concept_suggestion);
		 }
		 else 
		 {
			 console.log("Looking for Term suggestion...");
			 const term_suggestion = await this._getTermSuggestion(word.toString());
			 if (!Utils.isEmpty(term_suggestion)) 
			 {
				 await SparklisAPI.activateSuggestion(term_suggestion);
			 }
			 else 
			 {
				 console.log("Looking for semantic similarities with current concepts...")
				 this._concept_suggestion_forest = concept_suggestion_forest;
				 this._term_suggestion_forest = term_suggestion_forest;
				 const suggestion = await this._getConceptSuggestion(word.toString(), false);
				 if (!Utils.isEmpty(suggestion)) 
				 {
					 await SparklisAPI.activateSuggestion(suggestion);
				 } 
				 else 
				 {
					 
					 console.log("No suggestion found for " + word + ".")
					 await SparklisAPI.activateSuggestion({type: "IncrTriple" , arg: "S"});
				 }
			 }
		 }
 
	 }

}

export { SparklisAPI };
export default { SparklisAPI };