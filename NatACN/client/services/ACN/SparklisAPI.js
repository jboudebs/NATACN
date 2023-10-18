import * as Utils from '../../models/Utils.js';
import { ACN } from "../../models/ACN.js";
import { QTList } from "../../models/QTList.js";
import { QT } from "../../models/QT.js";
import * as Constraint from "./Constraint.js";
import { Suggestions } from "./Suggestions.js";
import { NLPTools } from "../../models/NLPTools.js";
import { NLPToolsParameters } from "../../models/NLToolsParameters.js";
import { InstrList } from "../../models/InstrList.js";
import { SpaCySimilarity } from "../NLP/SpaCySimilarity.js";
import { Instruction } from "../../models/Instruction.js";


/**
  * SparklisAPI
  *
  * @class SparklisAPI
  * @extends {ACN}
  */



class SparklisAPI extends ACN
{
	static _sparklis;
	static MU_Syn = 0.1;
	static MU_Instr = 0.1;
	static _view_mode = true;
	static labelDico = [];
	static k_QTcandidats = 11;

	//stats
	static sparklis_call = 0
	static last_time = 0;
	static onEvalWait = 1000//ms
	static home_count = 0;
	static changeEndpoint_count = 0;
	static endpoint_count=0;
	static currentPlace_count = 0;
	static setCurrentPlace_count = 0;
	static termLabels_count= 0;
	static classLabels_count= 0;
	static propertyLabels_count= 0;
	static sync_count = 0;
	static info_count = 0;
	static evalSparql_count = 0;
	static back_count = 0;
	static onEvaluated_count= 0;
	static results_count= 0;
	static error_count = 0
	//stats
	constructor()
	{
		super();
	}
	
	
	
	async init()
	{
		await SparklisAPI._waitForSparklis();
		this._sparklis = async function (){
			return sparklis};
		await this.endpointConfig();
		SparklisAPI.home_count++;
		await (await this._sparklis()).home();
		
		
	}
	
	async resetClass()
	{
		await this.home();
		SparklisAPI.sparklis_call = 0
		SparklisAPI.last_time = 0;
		SparklisAPI.onEvalWait = 1000//ms
		SparklisAPI.home_count = 0;
		SparklisAPI.changeEndpoint_count = 0;
		SparklisAPI.endpoint_count=0;
		SparklisAPI.currentPlace_count = 0;
		SparklisAPI.setCurrentPlace_count = 0;
		SparklisAPI.termLabels_count= 0;
		SparklisAPI.classLabels_count= 0;
		SparklisAPI.propertyLabels_count= 0;
		SparklisAPI.sync_count = 0;
		SparklisAPI.info_count = 0;
		SparklisAPI.evalSparql_count = 0;
		SparklisAPI.back_count = 0;
		SparklisAPI.onEvaluated_count= 0;
		SparklisAPI.results_count= 0;
		SparklisAPI.error_count = 0
	}
	
	async changeEndpoint(string, place)
	{
		SparklisAPI.changeEndpoint_count++;
		(await this._sparklis()).changeEndpoint(string);
		
		await this.getResults(place);
	}
	
	async endpointConfig()
	{
		SparklisAPI.endpoint_count++;
		SparklisAPI.endpoint_count++;
		console.log((await this._sparklis()));
		if((await this._sparklis()).endpoint().includes('wikidata'))
		{
			//this._getLabelFromUri = this._getLabelFromUriWiki;
		}
		else if((await this._sparklis()).endpoint().includes('mondial'))
		{
			//this._getLabelFromUri = this._getLabelFromUriMondial;
		}
	}
	
	async getPlace()
	{
		await this.getResults();
		SparklisAPI.currentPlace_count++
		return (await this._sparklis()).currentPlace()
	}
	
	async setPlace(place)
	{
		await this.getResults(place);
		SparklisAPI.setCurrentPlace_count++;
		return (await this._sparklis()).setCurrentPlace(place);
	}
	
	async qtToMatch(synString, labelList)
	{
		return this.stringMatch(synString, labelList);
	}
	
	async SpacySim(synString, labelList)
	{
		return await SpaCySimilarity.getSimilarities(synString, labelList)
	}
	
	async stringMatch(synString, labelList)
	{
		let filteredList = labelList.map(e=>
		{
			return {"word1":synString, "word2":e, "similarity":(e.toString().includes(synString.toString())||synString.toString().includes(e.toString()))}
		});
		return filteredList
	}

	async getFilteredQT(instr, place, QTpath) {
		return await this.getFilteredQT_Mixed(instr, place, QTpath)
	}
	
	async getFilteredQT_Mixed(instr, place, QTpath)
	{
		let obviousQTList = await this.getFilteredQT_obviousQT(instr, place, QTpath);
		console.log("obviousQTList",obviousQTList);
		let constraintQTList = await this.getFilteredQT_ExternalSearchBug(instr, place, QTpath);
		console.log("constraintQTList",constraintQTList);
		constraintQTList instanceof Array && !constraintQTList.length?constraintQTList = new QTList():null;
		let mixedQTList = new QTList([]);
		mixedQTList.add(obviousQTList._list);
		mixedQTList.add(constraintQTList._list);
		console.warn("mixedQTList before filtering",mixedQTList.toString())
		//mixedQTList.filterByScore(SparklisAPI.MU_Instr);

		if(QTpath.length&&instr.getType() !== 'NE') {
			mixedQTList = mixedQTList.filterRelation();
		}
		mixedQTList = mixedQTList.rankByScore();
		mixedQTList.slice(0,SparklisAPI.k_QTcandidats)
		//console.warn("mixedQTList before filtering",mixedQTList.toString())
		//console.warn("mixedQTList after filtering",mixedQTList.toString())
		return mixedQTList;
	}
	
	/**
	 *
	 * @param instr
	 * @param place
	 * @param QTpath
	 * @returns {Promise<QTList>}
	 */
	async getFilteredQT_obviousQT(instr, place, QTpath)
	{
		if(QTpath.length&&instr.getType() !== 'NE')
		{
			let filteredQTList = new QTList([]);
			let qtList;
			//let qtList = new QTList([]);
			try
			{
				//get T_i
				let suggList = await (new Suggestions()).create("True", place, QTpath);

				if(suggList==="error")
				{
					SparklisAPI.error_count++;
					console.log(SparklisAPI.error_count)
					const e = new Error("Filtered QT in error and empty");
					console.error(e);
					qtList = new QTList([]);
					return qtList;
				}
				//console.error("typeof ", suggList);
				// qtList = await Promise.all(suggList.map(async s=>
				// 	{   let qt = new QT(s);
				// 		qt.setLabel(await this._getLabelFromUri(s));
				// 		return qt
				// 	}));
				qtList = await this._getLabelFromMultipleUriWiki(suggList); //les index correspondent
				console.log(qtList)

				//console.error("typeof ", qtList);
				//console.log("typeof ",typeof qtList, typeof qtList[0], qtList[0]);
				
				//filter ID label
				const regex = /\b(ID|i_d|id|Id)\b|\b(ID|i_d|id|Id)\b$/;
				qtList = new QTList(qtList._list.filter(qt => !qt.getLabel().match(regex)));
				console.dir(qtList);
			}
			catch (e)
			{
				console.error(e);
				qtList = new QTList([]);
				return qtList;
			}
			//synset search T_i
			const synonyms = InstrList.toInstrList(await instr.getSynset());
			let labelList = qtList.map(qt=>qt.getLabel())
			console.log(labelList)
			console.log("Current synonyms :",synonyms.toString());
			for(const syn of synonyms.get())//nouvelle contrainte pour chaque synonyme
			{
				//une requete
				const synsetQTLabelList = (await this.qtToMatch(syn.toString(),labelList))
					.filter(e=>e.similarity>=SparklisAPI.MU_Syn)
					.map(e=>e.word2);
				console.log(synsetQTLabelList);
				const synsetQTList = qtList.filter(qt=>synsetQTLabelList.includes(qt.getLabel()));
				console.log(synsetQTList);
				filteredQTList.add(synsetQTList);
			}
			
			console.log(filteredQTList);
			labelList = filteredQTList.map(qt=>qt.getLabel());
			//get Sim score
			const simList = await NLPToolsParameters.getRelatedness(instr.getLemma(),labelList)
			console.log(simList,filteredQTList)
			for(const indexqt in filteredQTList._list)
			{
				console.log(indexqt)
				filteredQTList._list[indexqt].setScore(simList[indexqt].similarity)
			}
			//filtering thanks to instr
			filteredQTList.filterByScore(SparklisAPI.MU_Instr);
			//ranking

			filteredQTList.rankByScore();
			//console.warn(filteredQTList);
			return filteredQTList;
		}
		else
		{
			return new QTList([]);
		}
	}
	
	async getSemProxScore(word, place, QTpath)
	{
		console.log("trying getSemProxScore")
		let instr = new Instruction(word);
		let synset = InstrList.toInstrList((await NLPToolsParameters.getSynonyms(kw)).concat([word]))
		instr.setSynset(synset);
		let QT = await this.getFilteredQT_newConstraint(instr, place, QTpath);
		
		let sommeScore = 0;
		for (const qt in QT)
		{
			sommeScore+=qt.getScore();
		}
		
		const averageSemScore = sommeScore/QT.length
		console.log("score : ",averageSemScore)
		return averageSemScore;
	}

	/**
	 *
	 * @param instr
	 * @param place
	 * @param QTpath
	 * @returns {Promise<QTList>}
	 */
	async getFilteredQT_newConstraint(instr, place, QTpath)
	{
		if(QTpath.length&&instr.getType() !== 'NE')
		{
			let filteredQTList = new QTList([]);
			let qtList;
			//let qtList = new QTList([]);
			try
			{
				//get T_i
				let suggList = await (new Suggestions()).create("True", place, QTpath);

				qtList = await this._getLabelFromMultipleUriWiki(suggList); //les indexes correspondent
				console.log(qtList.length.toString());

				//filter ID label
				const regex = /\b(ID|i_d|id|Id)\b|\b(ID|i_d|id|Id)\b$/;
				qtList = new QTList(qtList.filter(qt => !qt.getLabel().match(regex)));
				console.dir(qtList);
			}
			catch (e)
			{
				console.error(e);
				qtList = new QTList([]);
				return qtList
			}
			//synset search T_i
			const synonyms = InstrList.toInstrList(instr.getSynset());
			let labelList = qtList.map(qt=>qt.getLabel())
			console.log(labelList)
			console.log("Current synonyms :",synonyms.toString());
			for(const syn of synonyms.get())//nouvelle contrainte pour chaque synonyme
			{
				//une requete
				const synsetQTLabelList = (await SpaCySimilarity.getSimilarities(syn.toString(),labelList))
					.filter(e=>e.similarity>=SparklisAPI.MU_Syn)
					.map(e=>e.word2);
				console.log(synsetQTLabelList);
				const synsetQTList = qtList.filter(qt=>synsetQTLabelList.includes(qt.getLabel()));
				console.log(synsetQTList);
				filteredQTList.add(synsetQTList);
			}

			console.log(filteredQTList);
			labelList = filteredQTList.map(qt=>qt.getLabel());
			//get Sim score
			const simList = await SpaCySimilarity.getSimilarities(instr.toString(),labelList)
			for(const indexqt in filteredQTList._list)
			{
				filteredQTList._list[indexqt].setScore(simList[indexqt].similarity)
			}
			console.log(filteredQTList);
			//filtering thanks to instr
			//filteredQTList.filterByScore(SparklisAPI.MU_Instr)

			//ranking
			filteredQTList.rankByScore();

			return filteredQTList;
		}
		else
		{
			return await this.getFilteredQT_ExternalSearchBug(instr, place, QTpath)
		}
	}

	/**
	 *
	 * @param instr
	 * @param place
	 * @returns {Promise<QTList>}
	 */
	async getFilteredQT_ExternalSearchBug(instr, place, QTpath)
	{
		let qtList = new QTList();
		
		//case current keyword is a NE
		if(instr.getType() === 'NE' && instr.toString().length>2)
		{
			const ne = instr.toString();
			console.log("Current NE :", ne);
			//Constraint Sparklis match
			const constr = instr.getConstr()?instr.getConstr():await new Constraint.Constraint().create(ne);
			instr.setConstr(constr);
			console.log('Constraint :', constr);
			//get filtred QT list from Sparklis
			const sugg = await (new Suggestions()).createMatch(constr, place)
			console.log(sugg);
			if(sugg.length)
			{
				let matchQT = new QT(sugg[0]);
				console.dir(matchQT.getIncr().toString());
				matchQT.setScore(1);
				qtList.add(matchQT);
				//console.warn(qtList)
				if(qtList.length){qtList.get(0).setLabel(ne)}
			}
			
		}
		//case current instr is a keyword
		else if(!instr.type)
		{
			console.log(instr)
			let synonyms = await instr.getSynset();
			console.log(synonyms)
			if(typeof synonyms !== 'InstrList')
			{
				synonyms = InstrList.toInstrList(synonyms);
			}
			//.toString().toLowerCase().split(",").filter(e=>e.length>2);
			//console.log(synonyms)
			console.log("Current synonyms :",synonyms.toString());
			
			for(const syn of synonyms.get())//nouvelle contrainte pour chaque synonyme
			{
				const constr = syn.getConstr()?syn.getConstr():await new Constraint.Constraint().create(syn.toString().toLowerCase());
				syn.setConstr(constr);
				
				console.log('Constraint :', constr);
				try{
					//get filtred suggestion list from Sparklis
					let suggList = await (new Suggestions()).create(constr, place, QTpath);
					console.log(suggList);
					if(suggList==='error' || suggList===undefined)
					{
						//await Utils.sleep(6000);
						SparklisAPI.error_count++
						console.error("error", SparklisAPI.error_count);
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
					return qtList;
				}
			}
			
			let qtList_toRemove=[]
			
			//fetching labels for QTs
			let incrList = qtList.getList().map(qt=>qt.getIncr());
			//console.warn("incrList : ", incrList)
			qtList = await this._getLabelFromMultipleUriWiki(incrList);
			//console.warn("qtList(with labels) : ", qtList);
			
			//adding relatedness score for each QT
			for (const qt of qtList.getList())
			{
				console.log(qt);
				//fetch label
				const label = qt.getLabel();
				console.log(label);
				//remove ID QT
				const regex = /\b(ID|i_d|id|Id)\b|\b(ID|i_d|id|Id)\b$/;
				if (label.match(regex))
				{
					//console.warn('ici ID identifié', label)
					qtList_toRemove.push(qt);
				}
				else
				{
					
					qt.setLabel(label);
					//relatedness
					const relatedness = await NLPToolsParameters.getRelatedness(qt.getLabel(),instr.getLemma())
					console.log("Dico relatedness",qt.getLabel(),instr.toString(), relatedness)
					if(relatedness>=SparklisAPI.MU_Syn)
					{
						qt.setScore(relatedness);
					}
					else
					{
						qtList_toRemove.push(qt);
					}
				}
				
			}
			
			for (const qtListToRemoveElement of qtList_toRemove)
			{
				qtList.removeQT(qtListToRemoveElement)
			}
			
			//ranking the QT list
			qtList = qtList.rankByScore();
			
			//alternative de filtrage
			// if(qtList.isEmpty()&&QTpath.length!==0)//&&!(await this._sparklis()).endpoint().includes('wikidata'))
			// {
			// 	console.log("Alternative filtering")
			// 	qtList = await this._getFilteredQTbyRelatedness(instr, place);
			// 	//ranking the QT list
			// 	qtList = qtList.rankByScore();
			// }
		}
		else
		{
			console.error("mot clé non interprété")
			qtList = new QTList([]);
		}
		
		
		// console.log(qtList)
		return qtList;
	}
	
	
	/**
	 * recuperer le label
	 * @param navState
	 * @returns {Promise<QTList>}
	 */
	// async getFilteredQT_old(navState)
	// {
	// 	console.log(navState)
	// 	let qtList = new QTList();
	// 	//case current keyword is a NE
	// 	if(navState.getCurrentKeyword().getType() === 'NE' && navState.getCurrentKeyword().toString().length>2)
	// 	{
	// 		const ne = navState.getCurrentKeyword().toString();
	// 		console.log("Current NE :", ne);
	// 		//Constraint Sparklis match
	// 		navState.setConstraint(await new Constraint.Constraint().create(ne));
	// 		console.log('Constraint :', navState.getConstraint());
	// 		//get filtred QT list from Sparklis
	// 		qtList.add(await (new Suggestions()).createMatch(navState));
	// 		if(qtList.length){qtList.get(0).setLabel(ne)};
	// 	}
	// 	//case current keyword is not a NE
	// 	else if(navState.getCurrentKeyword().toString().length>2)
	// 	{
	// 		const synonyms = navState.getCurrentKeywordSynonyms();
	// 			//.toString().toLowerCase().split(",").filter(e=>e.length>2);
	// 		console.log("Current synonyms :",synonyms);
	//
	// 		for(const syn of synonyms.get())//nouvelle contrainte pour chaque synonyme
	// 		{
	// 			navState.setConstraint(await new Constraint.Constraint().create(syn.toString().toLowerCase()));//A changer avec les syn
	// 			console.log('Constraint :', navState.getConstraint());
	// 			try{
	// 				//get filtred suggestion list from Sparklis
	// 				let suggList = await (new Suggestions()).create(navState);
	// 				if(suggList==='error' || suggList===undefined)
	// 				{
	// 					//await Utils.sleep(6000);
	// 					qtList = new QTList([]);
	// 				}
	// 				else
	// 				{
	// 					//change into QT list
	// 					//console.warn("Sugg",suggList);
	// 					qtList.add(suggList);
	// 					//console.log(qtList);
	// 				}
	// 			}
	// 			catch (e)
	// 			{
	// 				console.log(e);
	// 				qtList = new QTList([]);;
	// 			}
	// 		}
	//
	// 		//adding relatedness score for each QT
	// 		for (const qt of qtList.getList())
	// 		{
	// 			//console.log(qt);
	// 			//fetch label
	// 			const label = await this.getLabelFromUri(qt.getIncr());
	// 			//console.log(label);
	// 			qt.setLabel(label);
	//
	// 			//relatedness
	// 			const relatedness = await NLPToolsParameters.getRelatedness(qt.getLabel(),navState.getCurrentKeyword().toString())
	// 			qt.setScore(relatedness);
	//
	// 		}
	//
	// 		//ranking the QT list
	// 		qtList = qtList.rankByScore();
	// 	}
	// 	else
	// 	{
	// 		console.error("mot clé trop petit")
	// 		qtList = new QTList([]);
	// 	}
	//
	// 	//alternative de filtrage
	// 	if(qtList.isEmpty()&&!sparklis.endpoint().includes('wikidata'))
	// 	{
	// 		console.log("Alternative filtering")
	// 		qtList = await this._getFilteredQTbyRelatedness(navState);
	// 		//ranking the QT list
	// 		qtList = qtList.rankByScore();
	// 	}
	//
	// 	return qtList;
	// }
	
	//Alternate filtering in case the (await this._sparklis()) filtering is empty
	async _getFilteredQTbyRelatedness(instr, place)
	{
		let qtList = new QTList();
		
		const synonyms = instr.getSynset();
		console.log("Current synonyms :",synonyms);
		const keyword = instr.toString();
		
		for(const syn of synonyms._list)//nouvelle contrainte pour chaque synonyme
		{
			try
			{
				//get unfiltered suggestion list from Sparklis
				let suggList = await (new Suggestions()).create_all(instr, place);
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
						const label = await this.getLabelFromUri(s);
						const regex = /\b(ID|i_d|id|Id)\b|\b(ID|i_d|id|Id)\b$/;
						if (!label.match(regex))
						{
							if(syn.toString()!==keyword.toString())
							{
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
							else
							{
								const kwRelatedness = await NLPToolsParameters.getRelatedness(label,keyword);
								if(kwRelatedness>=0.2)
								{
									let qt = new QT(s);
									qt.setScore(kwRelatedness);
									qt.setLabel(label);
									qtList.add(qt);
								}
							}
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
	async getLabelFromUri(incr)
	{
		let label = this.getRelatedDico(incr);
		if(!label)
		{
			this.getlabelIncr?this.getlabelIncr = []:null;
			this.getlabelIncr = this.getlabelIncr.push(incr);
			label = await this._getLabelFromUri(incr);
			this.pushRelatedDico(incr,label)
		}
		
		return label;
	}
	getRelatedDico(incr)
	{
		let label = undefined;
		const uri = incr.uri?incr.uri:incr.pred["uri"+incr.pred.type[1]]
		for (const labeledIncr of SparklisAPI.labelDico)
		{
			const incrD = labeledIncr.incr;
			const uriD = incrD.uri?incrD.uri:incrD.pred["uri"+incrD.pred.type[1]]
			if( uri === uriD && incr.arg===incrD.arg)
			{
				//console.warn("comp incr",incr, incrD)
				return incrD.label;
			}
		}
		return label
	}
	
	pushRelatedDico(incr,label)
	{
		SparklisAPI.labelDico.push({"incr":incr,"label":label})
	}
	
	static resetClass()
	{
		SparklisAPI.labelDico = []
	}
	
	async _getLabelFromUri(incr)
	{
		console.log(incr)
		SparklisAPI.endpoint_count++
		if((await this._sparklis()).endpoint().includes("mondial"))
		{
			return await this._getLabelFromUriMondial(incr);
		}
		else
		{
			SparklisAPI.termLabels_count++;
			SparklisAPI.classLabels_count++;
			SparklisAPI.propertyLabels_count++;
			SparklisAPI.sync_count+=3
			await (await this._sparklis()).termLabels().sync();
			await (await this._sparklis()).classLabels().sync();
			await (await this._sparklis()).propertyLabels().sync();
			
			const uri = incr.uri;
			if (incr.type === "IncrType")
			{
				SparklisAPI.classLabels_count++;
				SparklisAPI.info_count++;
				return (await this._sparklis()).classLabels().info(uri);
			}
			else if (incr.type === "IncrRel")
			{
				SparklisAPI.propertyLabels_count++;
				SparklisAPI.info_count++;
				//((await this._sparklis()).propertyLabels().info(uri).label);
				return (await this._sparklis()).propertyLabels().info(uri).label;
			}
			else if (incr.type === "IncrTerm")
			{
				SparklisAPI.termLabels_count++;
				SparklisAPI.info_count++;
				return (await this._sparklis()).termLabels().info(uri).label;
			}
			else if (incr.type === "IncrPred")
			{
				//sparklis ne sait pas faire
				console.error("incr type is IncrPred")
			}
			else
			{
				console.error("incr type not recognize")
			}
			
		}
	}

	async _getLabelFromUriWiki(incr)
	{

		//const incr = qt.getIncr()
		const uri = incr.uri?incr.uri:incr.pred["uri"+incr.pred.type[1]];//cas des incrPred
		const id = uri.replace('http://www.wikidata.org/entity/', '')
			.replace('http://www.wikidata.org/prop/direct/', '')
			.replace('http://www.wikidata.org/prop/statement/', '');

		//recuperer le label
		console.log(id)
		let labelQuery = "SELECT ?itemLabel WHERE {  wd:"+id+" rdfs:label ?itemLabel    FILTER (lang(?itemLabel) = \"en\")  }"
		console.log(labelQuery)
		SparklisAPI.evalSparql_count++
		let res = await (await this._sparklis()).evalSparql(labelQuery);
		console.log(res);
		if(!res.rows.length) {return ""}
		const label = res.rows[0][0].str;
		return res.rows[0][0].str;
	}
	
	static async getURIsFromWikidata(labelQuery)
	{
		//Too many request Handle
		let time_now = Date.now()
		let i = 0;
		while(time_now - this.SparklisAPI.last_time<1010 && i<11)
		{
			i++;
			time_now = Date.now();
			await Utils.sleep(100);
			//console.error(time_now, ConceptNet.SparklisAPI.last_time);
		}
		
		this.SparklisAPI.last_time = time_now;
		//console.log(time_now, ConceptNet.SparklisAPI.last_time);
		
		console.log(labelQuery)
		const uri = 'https://query.wikidata.org/sparql';
		const params = {
			query: labelQuery,
			format: 'json',
		};
		
		const JSON = await fetch(uri, params
		).then((value) => { return value.json(); });
		return JSON;
	}
	
	/**
	 *
	 * @param incrList
	 * @returns {Promise<QTList>}
	 * @private
	 */
	async _getLabelFromMultipleUriWiki(incrList)
	{
		
		
		//const incr = qt.getIncr()
		let ids = ""
		for (const incr of incrList)
		{
			const uri = incr.uri?incr.uri:incr.pred["uri"+incr.pred.type[1]];//cas des incrPred
			ids = ids + "wd:"+this._getWikidataID(uri).toString()+" "
		}
		//SELECT ?entity ?label
		// WHERE {
		//   VALUES ?entity { wd:Q42 wd:Q123 wd:Q456 }  # Remplacez ces identifiants par votre liste d'entités
		//   ?entity rdfs:label ?label.
		//   FILTER (lang(?label) = "en")  # Vous pouvez spécifier la langue des labels (dans cet exemple : français)
		// }
		let labelQuery = "SELECT ?entity ?label WHERE {  VALUES ?entity { " + ids + "} ?entity rdfs:label ?label.    FILTER (lang(?label) = \"en\")  BIND(STRBEFORE(STR(?entity), \"://\") AS ?value)} ORDER BY ?value"
		console.log(labelQuery)
		SparklisAPI.evalSparql_count++
		let res = (await (await this._sparklis()).evalSparql(labelQuery)).rows;
		//console.error(res);

		// résultats a mapper selon les noms d'entitées
		let qtList = new QTList([])
		for (const incr of incrList)
		{
			let qt = new QT(incr);
			const uri = (incr.uri?incr.uri:incr.pred["uri"+incr.pred.type[1]])
			//console.log(uri);
			const r = res.find(r=>this._getWikidataID(r[0].uri) === this._getWikidataID(uri));
			if(r!==undefined)//cas ou le label existe en anglais
			{
				qt.setLabel(r[1].str)
				qtList.add(qt)
			}
			
		}

		return  qtList;
	}

	_getWikidataID(uri)
	{
		const id = uri.replace('http://www.wikidata.org/entity/', '')
			.replace('http://www.wikidata.org/prop/direct/', '')
			.replace('http://www.wikidata.org/prop/statement/', '');
		return id
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
		try
		{
		
		console.log("Waiting for Sparklis to update.");
		let newPlace;
		try
		{
			newPlace = place.applySuggestion(qt.getIncr());
		}
		catch (e)
		{
			console.error("POST apply",e)
		}
		console.log('Navigate through ', qt.getLabel());
		await this.getResults(newPlace);
		console.log("Sparklis has navigated");
		
		if(SparklisAPI._view_mode)
		{
			try
			{
				SparklisAPI.setCurrentPlace_count++
				await (await this._sparklis()).setCurrentPlace(newPlace)
			}
			catch (e)
			{
				console.error("POST setCurrent",e)//stack overflow error
			}
			
			await this.getResults(newPlace);
		}
			return newPlace;
		}
		catch (e)
		{
			console.log(e)
			return null;
		}
		
		
	}

	async back()
	{
		console.log("Waiting for Sparklis to update.");
		SparklisAPI.back_count++;
		await (await this._sparklis()).back();
		await this.getResults();
		console.log("Sparklis has updated a back.");
	}

	
	async home()
	{

		console.log("Waiting for Sparklis to update.");
		SparklisAPI.home_count++;
		(await this._sparklis()).home();
		await this.getResults();
		
		console.log("Sparklis has updated a home.")
	}
	
	async getResults(place)
	{
		try{
			place?null:SparklisAPI.currentPlace_count++;
			place = place?place:(await this._sparklis()).currentPlace();
			SparklisAPI.onEvaluated_count++;
			SparklisAPI.results_count++;
			let res = await new Promise(resolve=>{
				place.onEvaluated(()=>resolve(place.results()));});
			await Utils.sleep(SparklisAPI.onEvalWait);
			return res;
		}catch (e)
		{
			await Utils.sleep(SparklisAPI.onEvalWait);
			console.trace();
			console.error("in getResults", e);
			return null;
		}
	}
	
	async setCurrentPlace(place)
	{
		try{
			place?null:SparklisAPI.currentPlace_count++;
			SparklisAPI.setCurrentPlace_count++;
			place = place?place:(await this._sparklis()).currentPlace();
			SparklisAPI.onEvaluated_count++;
			let res = await new Promise(resolve=>{
				place.onEvaluated(async ()=>resolve((await this._sparklis()).setCurrentPlace(place)))});
			await Utils.sleep(SparklisAPI.onEvalWait);
			return res;
		}
		catch(e)
		{
			await Utils.sleep(SparklisAPI.onEvalWait);
			console.trace();
			console.error("in setCurrentPlace", e);
			return null;
		}
		
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
			// 	sparklis.currentPlace().onEvaluated(()=>resolve((await this._sparklis()).currentPlace().results()))});
			// console.log(res.rows);
			await Utils.sleep(10000);
			let res = await new Promise(resolve=>{
			 	sparklis.currentPlace().onEvaluated(async ()=>resolve((await this._sparklis()).currentPlace().results()))});
			
			for (const r of res.rows)
			{
				const uri = r[0].uri;
				await (await this._sparklis()).termLabels().sync();
				await (await this._sparklis()).classLabels().sync();
				await (await this._sparklis()).propertyLabels().sync();
				//console.log((await this._sparklis()).termLabels().info(uri));
				
				console.log((await this._sparklis()).classLabels().info(uri));
				//console.log((await this._sparklis()).propertyLabels().info(uri));
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
		 return typeof sparklis !== "undefined";
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
			
		
		 //(await this._sparklis()) = sparklis;
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
// 		let partial_suggs = await (await this._sparklis()).currentPlace().getConceptSuggestions(false, constr);
// 		this._concept_suggestion_forest = this._preprocessConceptSuggestions(partial_suggs.forest);
//
// 	}
//
// 	async _updateConceptSuggestions(constr)
// 	{
// 		const partial_suggs = await (await this._sparklis()).currentPlace().getConceptSuggestions(false, constr);
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
// 		 console.log("Query :", (await this._sparklis()).currentPlace().query());
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
// 		 await (await this._sparklis()).back();
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
// 			 return (await this._sparklis()).classLabels().info(uri);
// 		 }
// 		 if (suggestion.type === "IncrRel")
// 		 {
// 			 //((await this._sparklis()).propertyLabels().info(uri).label);
// 			 return (await this._sparklis()).propertyLabels().info(uri).label;
// 		 }
// 		 if (suggestion.type === "IncrTerm")
// 		 {
// 			 return (await this._sparklis()).termLabels().info(uri).label;
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
// 		 let suggestion_forest  = await (await this._sparklis()).currentPlace().getTermSuggestions(true, constr);
// 		 this._term_suggestion_forest  = this._preprocessTermSuggestions(suggestion_forest.forest)
// 		 if(this._term_suggestion_forest == null)
// 		 {
// 			 console.warn("SparklisAPI._term_suggestion_forest null");
// 			 throw new Error("Return null when looking for Term suggestions")
// 		 }
// 	 }
// 	  async _updateTermSuggestions(constr)
// 	 {
// 		let suggestion_forest  = await (await this._sparklis()).currentPlace().getTermSuggestions(true, constr);
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
// 			 (await this._sparklis()).activateSuggestion(suggestion);
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
// 			 (await this._sparklis()).activateSuggestion(suggestion);
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