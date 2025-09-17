import { SparklisAPI } from "../../client/services/ACN/SparklisAPI.js";
import { NatACN } from '../../client/models/NatACN.js';
import Utils, { isEqual } from "../../client/models/Utils.js";
import { NLPExtraction } from "../../client/models/NLPExtraction.js";
import { CoreNLP } from "../../client/services/NLP/CoreNLP.js";
import { ConceptNet } from "../../client/services/NLP/ConceptNet.js";
import { SpaCySimilarity } from "../../client/services/NLP/SpaCySimilarity.js";
import { sleep } from "../../client/models/Utils.js";
import { Instruction } from "../../client/models/Instruction.js";
import { QTList } from "../../client/models/QTList.js";
import { QT } from "../../client/models/QT.js";
//import { SpaCy } from "/Users/jboudebs/WebstormProjects/NatACN_API/NatACN/client/models/Utils.js";
//import { Doc } from '/Users/jboudebs/WebstormProjects/NatACN_API/NatACN/client/services/NLP/SpaCy/src/index.js'

var sparklisAPI;
var natACN;
var home_place;

var error_count = 0;

try
{
	//INIT
	console.log("natACN calcul")
	sparklisAPI = new SparklisAPI();
	await sparklisAPI.init();
	console.log(sparklis);
	
	//handler alert windows
	(function() {
		var _old_alert = window.alert;
		window.alert = function() {
			//console.error("Waiting for 60s...")
			//Utils.sleep(60010)
			//console.error("Waited for 60s")
			error_count++
			console.error('ALERT HANDLED')
			return true
		};
		window.confirm = function() {
			console.error('CONFIRM HANDLED');
			return true;
		};
	})();
	
	// sparklis_extension.hookResults = function(res)
	// {
	// 	if(res.includes("Rate limit exceeded"))
	// 	{
	// 		console.error("CATCHED")
	// 	}
	// 	console.log(res)
	// 	return res;
	// }
	
	// var last_time = 0;
	//
	// sparklis_extension.hookSparql =
	// 	async function(sparql) {
	// 		//Too many request Handle
	// 		let time_now = Date.now()
	// 		let i = 0;
	// 		while(time_now - last_time<1010 && i<11)
	// 		{
	// 			i++;
	// 			time_now = Date.now();
	// 			console.error("WAIIIIIIIIIIIT")
	// 			await sleep(100);
	// 			console.error("WAIIIIIIIIIIITED")
	// 			//console.error(time_now, ConceptNet.last_time);
	// 		}
	//
	// 		last_time = time_now;
	// 		//console.log(time_now, ConceptNet.last_time);
	//
	// 		return sparql
	// 	};

	await sparklisAPI.init();
	natACN = new NatACN(sparklisAPI);
	//INIT
	//DB
	home_place = await sparklisAPI.getPlace() ;
	//await sparklisAPI.changeEndpoint("https://query.wikidata.org/sparql", home_place)
	//DB
	//TEST UNIQUE QUESTION
	let question = "author";
	//
	//tests
	// const res = await natACN.natNavigation(question, home_place);
	// console.dir("Results : ",res);
	// console.error(SparklisAPI.error_count);
	// await sparklisAPI.setCurrentPlace(res.bestNavigation.place);
	//TEST UNIQUE QUESTION

	//TEST TREE
	//let tree = await NLPExtraction.extractTree(question);
	//TEST TREE

	//TEST ConceptNet Synonyms
	//const word = "state";
	//const synset = await ConceptNet.getSynonyms(word);
	//console.warn("Synset of "+word)
	//console.log(synset)
	//console.log(synset.length)
	//TEST ConceptNet Synonyms

	//TEST SPACY SIM
	//SpaCySimilarity.main();
	//TEST SPACY SIM

	//TEST Suggestion limit
	// let instr = new Instruction("educated")
	// instr._lemma = "educate";
	// let QTpath = new QTList();
	// let qtList = await sparklisAPI.getFilteredQT_MixedRelTopK(instr, home_place, QTpath);
	// console.log(qtList)
	//TEST Suggestion limit
	
	//test getFiltered
	$( "#test" ).on( "click", async function( event )
	{
		//TEST getFiltered
		// let instr = new Instruction("author")
		// instr._lemma = "author";
		// let QTpath = new QTList([new QT()]);
		//
		// let qtList = await sparklisAPI.getFilteredQT(instr, sparklis.currentPlace(), QTpath);
		// console.log(instr, qtList)
		//TEST getFiltered
		//TEST navigate
		// let JSON_object = {
		// 	"_incr": {
		// 		"type": "IncrRel",
		// 		"uri": "http://jena.apache.org/text#analyzer",
		// 		"orientation": "Fwd"
		// 	},
		// 	"_ori": "Fwd",
		// 	"_label": "analyzer",
		// 	"_score": 0.993
		// }
		// let qt = new QT(JSON_object);
		// console.log(qt);
		// await sparklisAPI.navigate(sparklis.currentPlace(),qt)
		//TEST navigate
		
		const res = await natACN.natNavigation(question, sparklis.currentPlace());
		console.dir("Results : ",res);
		console.error(SparklisAPI.error_count);
		await sparklisAPI.setCurrentPlace(res.bestNavigation.place);
		
	})
	
	
	

	//reprise
	//await getNatACN(9);



}
catch (e)
{
	console.error(e);
}

async function QALD()
{
	console.log("test");

	await SparklisAPI._waitForSparklis();
	//console.log(sparklis);
	//console.log(sparklis.currentPlace());

	getSimpleQALD();

}

async function evalQuery(query)
{
	let res;
	console.log("eval query",query)
	try
	{
		res = await sparklis.evalSparql(query+"LIMIT 200");
	}
	catch (e)
	{
		console.error(e);
		res = [];
		return res
	}
	console.log("res client json", res);
	return res;
}

// SELECT ?item ?itemLabel WHERE {
//   VALUES ?item { wd:Q81230 wd:P580 }
//   SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
// }
async function extractLabels(query)
{
	console.log(query);
	const regex = /(wd|wdt|p|pq|rdfs|xsd)\:([a-z]|[A-Z]|[0-9])*/g;
	const regexPrefix = /(wdt|wd|pq|p|rdfs|xsd)\:*/g;
	const wikidataLabelExtracted = query.match(regex);
	//console.log(query,wikidataLabelExtracted)
	const wikidataIDs = wikidataLabelExtracted.map((e) => e.replace(regexPrefix,"wd:"));

	//console.log(wikidataIDs);




	let labelsQuery = "SELECT ?item ?itemLabel WHERE {" + "   VALUES ?item {";
	for (const e of wikidataIDs)
	{
		labelsQuery+= e+" ";
	}
	labelsQuery+= '}' + '   SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }}';
	console.log(labelsQuery);
	let res = await sparklis.evalSparql(labelsQuery);
	console.log("label res", res);
	return res.rows.map((e)=>
	{
		return  {   "wikidataID" : e[0].uri.replace('http://www.wikidata.org/entity/',''),
			"label" : e[1].str
		}
	});
}

function postQALD(data)
{
	const Http = new XMLHttpRequest();
	const url = 'http://localhost:3000';
	Http.open("POST", url);
	Http.setRequestHeader("Accept", "application/json");
	Http.setRequestHeader("Content-Type", "application/json");
	Http.onreadystatechange = function ()
	{
		if (Http.readyState === 4)
		{
			console.log(Http.status);
			console.log(Http.responseText);
			if(Http.responseText)
			{
				getQALD(Http.responseText);
			}
		}
	};
	try
	{
		data = data?JSON.stringify(data): `{
				  "Id": 78912,
				  "Customer": "Jason Sweet",
				  "Quantity": 1,
				  "Price": 18.00
				}`;

	}
	catch (e)
	{
		console.error(e);
	}
	console.log("post", data);
	Http.send(data);

}

function getSimpleQALD()
{
	const Http = new XMLHttpRequest();
	const url = 'http://localhost:3000/';
	Http.open("GET", url);
	Http.onreadystatechange = async function ()
	{
		if (Http.readyState === 4)
		{
			console.log(Http.status);
			console.log(Http.responseText);
			console.log(JSON.parse(Http.responseText));
			const json = JSON.parse(Http.responseText);
			const query = json.query;
			const qald = json.qald;
			const labeled_question = json.labeled_question.question;
			const labels = await extractLabels(query);
			//console.log("extractLabels",labels)
			const answer_query = await evalQuery(query);
			let resultsQALD = [];
			await natACN.natNavigate(qald, resultsQALD);
			let resultsLQ = [];
			await natACN.natNavigate(labeled_question, resultsLQ);
			const data = {
				"id": json.id,
				"question": {
					"qald" : json.question,
					"labeled_question" : labeled_question,
					"sparql": query
				},
				"answer": {
					"our_ref": answer_query,
					"qald_ref": json.answers,
					"qald_NatACN": resultsQALD.answer,
					"labeled_question_NatACN": resultsLQ.answers
				},
				"labeled_question" : {
					"question": labeled_question,
					"labels" : labels}
			}
			postQALD(data);
		}
	};
	console.log("get Simple");
	Http.send();

}

function getQALD(id)
{
	const Http = new XMLHttpRequest();
	const url = 'http://localhost:3000/'+id;
	Http.open("GET", url);
	// Http.setRequestHeader("Accept", "application/json");
	// Http.setRequestHeader("Content-Type", "application/json");
	Http.onreadystatechange = async function ()
	{
		if (Http.readyState === 4)
		{
			console.log(Http.status);
			console.log(Http.responseText);
			console.log(JSON.parse(Http.responseText));
			const json = JSON.parse(Http.responseText);
			const query = json.query;
			const qald = json.qald;
			const labeled_question = json.labeled_question.question;
			const labels = await extractLabels(query);
			//console.log("extractLabels",labels)
			const answer_query = await evalQuery(query);
			let resultsQALD = [];
			await natACN.natNavigate(qald, resultsQALD);
			let resultsLQ = [];
			await natACN.natNavigate(labeled_question, resultsLQ);
			const data = {
				"id": json.id,
				"question": {
					"qald" : json.question,
					"labeled_question" : labeled_question,
					"sparql": query
				},
				"answer": {
					"our_ref": answer_query,
					"qald_ref": json.answers,
					"qald_NatACN": resultsQALD.answer,
					"labeled_question_NatACN": resultsLQ.answers
				},
				"labeled_question" : {
					"question": labeled_question,
					"labels" : labels}
			}
			postQALD(data);

		}
	};

	console.log("get");
	Http.send();

}

/*
	CALCUL NatACN
 */

async function calculNatACN()
{
	//init NatACN
	console.log("natACN calcul")
	sparklisAPI = new SparklisAPI();
	await SparklisAPI._waitForSparklis();
	console.log(sparklis);
	console.log(sparklis.currentPlace());

	await sparklisAPI.init();


	natACN = new NatACN(sparklisAPI);
	await getSimpleNatACN();
}

/**
 * Calcul d'une question
 * @param q
 * @returns {Promise<void>}
 */


/**
 * get the first question to start
 */
function getSimpleNatACN()
{
	const Http = new XMLHttpRequest();
	const url = 'http://localhost:3000/';
	Http.open("GET", url);
	// Http.setRequestHeader("Accept", "application/json");
	// Http.setRequestHeader("Content-Type", "application/json");
	Http.onreadystatechange = async function ()
	{
		if (Http.readyState === 4)
		{
			console.log(Http.status);
			console.log(JSON.parse(Http.responseText));

			const qald = JSON.parse(Http.responseText)
			const query = qald.query;
			const question = qald.question;
			//const labeled_question = qald.labeled_question.question;

			const answer = (await evalQuery(query)).rows;

			let resultsQALD = [];
			let lQTRes = JSON.parse('{"longest" : false, "res" : []}');
			await natACN.natNavigate(question, resultsQALD, lQTRes);
			await sparklisAPI.home();
			let resultsLQ = [];
			//await natACN.natNavigate(labeled_question, resultsLQ);
			//await sparklisAPI.home();

			const score = score();

			console.log(answer);
			const data = {  "id": qald.id,
				"question": qald.question,
				"query": query,
				"answer":
					{   "our_ref": answer,
						"qald": qald.answer.qald,
						"QTList+_res" : lQTRes.res,
						"NatACN_qald": resultsQALD[0].answer//,//à changer
						//"NatACN_labeled_question": resultsLQ.answers//à changer
					},
				//"labeled_question" :
				//	{   "question": qald.labeled_question.question,
				//		"labels" : qald.labeled_question.labels
				//	},
				"NatACN_info" :
					{
						"qald" : resultsQALD//,
						//"labeled_question": resultsLQ
					}
			}
			postNatACN(data);
		}
	};
	console.log("GET Simple - client");
	Http.send();

}


function postNatACN(data)
{
	const Http = new XMLHttpRequest();
	const url = 'http://localhost:3000';
	Http.open("POST", url);
	Http.setRequestHeader("Accept", "application/json");
	Http.setRequestHeader("Content-Type", "application/json");
	Http.onreadystatechange = function ()
	{
		if (Http.readyState === 4)
		{
			console.log(Http.status);
			//console.log(Http.responseText);
			if(Http.responseText)
			{
				getNatACN(Http.responseText);
			}
		}
	};
	try
	{
		data = data?JSON.stringify(data): `{
				  "Id": 78912,
				  "Customer": "Jason Sweet",
				  "Quantity": 1,
				  "Price": 18.00
				}`;

	}
	catch (e)
	{
		console.error(e);
	}
	console.log("post");
	//console.log(data);
	Http.send(data);

}

async function resetNatACN()
{
	//MAJ interface
	$("#clear-log").click();
	
	await sparklisAPI.resetClass();
	NLPExtraction.resetClass();
	CoreNLP.resetClass();
	//SpaCy.resetClass();
}

function getNatACN(id)
{
	const Http = new XMLHttpRequest();
	const url = 'http://localhost:3000/'+id;
	Http.open("GET", url);
	//Http.setRequestHeader("Access-Control-Allow-Origin", "*");
	// Http.setRequestHeader("Content-Type", "application/json");
	Http.onreadystatechange = async function ()
	{
		if (Http.readyState === 4)
		{
			//reception de la question qald à analyser
			console.log(Http.status);
			//console.log(Http.responseText);
			const httpres = JSON.parse(Http.responseText);
			const qald = httpres.qald;
			const coreNLP = httpres.coreNLP;

			//evaluation du SPARQL dans WIKIDATA - ref
			const query = qald.query.sparql
				//WIKIDATA
				.replace('PREFIX bd: <http://www.bigdata.com/rdf#> PREFIX dct: <http://purl.org/dc/terms/> PREFIX geo: <http://www.opengis.net/ont/geosparql#> PREFIX p: <http://www.wikidata.org/prop/> PREFIX pq: <http://www.wikidata.org/prop/qualifier/> PREFIX ps: <http://www.wikidata.org/prop/statement/> PREFIX psn: <http://www.wikidata.org/prop/statement/value-normalized/> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX wd: <http://www.wikidata.org/entity/> PREFIX wds: <http://www.wikidata.org/entity/statement/> PREFIX wdt: <http://www.wikidata.org/prop/direct/> PREFIX wdv: <http://www.wikidata.org/value/> PREFIX wikibase: <http://wikiba.se/ontology#> PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> ','')
				//MONDIAL
				.replace("PREFIX n1: <http://www.semwebtech.org/mondial/10/meta#>", '');
			const question = qald.question[0].string;
			const ids = undefined//await extractLabels(query)
			//console.warn(ids.map(e=>e.label).toString())
			var answer = (await evalQuery(query)).rows;
			natACN.QRes = answer;
			//console.log(answer);

			//evaluation de la question NL dans NatACN - res
			let resultsQALD = [];
			let bestRes;
			let natACNquery;
			let launch = true
			const start = Date.now();
			const res = launch?await natACN.natNavigation(question, home_place, coreNLP):null;
			console.dir(res);
			const runtime = Date.now() - start;//millis
			launch?res.bestNavigation?bestRes = await sparklisAPI.getResults(res.bestNavigation.place):null:null;
			launch?res.bestNavigation?natACNquery = await res.bestNavigation.place.sparql():null:null;
			const stats_sparklis = {
				"home_count" : SparklisAPI.home_count,
				"changeEndpoint_count" : SparklisAPI.changeEndpoint_count,
				"endpoint_count" : SparklisAPI.endpoint_count,
				"currentPlace_count" : SparklisAPI.currentPlace_count,
				"setCurrentPlace_count" : SparklisAPI.setCurrentPlace_count,
				"termLabels_count" : SparklisAPI.termLabels_count,
				"classLabels_count" : SparklisAPI.classLabels_count,
				"propertyLabels_count" : SparklisAPI.propertyLabels_count,
				"sync_count" : SparklisAPI.sync_count,
				"info_count" : SparklisAPI.info_count,
				"evalSparql_count" : SparklisAPI.evalSparql_count,
				"back_count" : SparklisAPI.back_count,
				"onEvaluated_count" : SparklisAPI.onEvaluated_count,
				"results_count" : SparklisAPI.results_count
				
			}
			//console.log(bestRes);
			await resetNatACN();
			console.error(stats_sparklis);

			//Comparaison des réponses entre ref et res
			const score = scoring(sparklisRestoRes(answer),sparklisRestoRes(bestRes));

			//formatage de l'historique de la recherche dans NatACN
			const data = {  "id": qald.id,
				"question": qald.question[0].string,
				"qald_query": query,
				"query": natACNquery,
				"answer":
					{   "our_ref": answer,
						"qald": qald.answers.results,
						"NatACN_qald": bestRes
					},
				"ids":ids?ids.map(e=>e.label).toString():undefined,
				"score" : score,
				"NatACN_info" :
					res?res.bestNavigation?{
						"QTpath" : res.bestNavigation.QTpath,
						"instrPath" : res.bestNavigation.instrPath,
						"instrTree" : res.instrTree.toString(),
						"extracted_kw" : res.extracted_kw.toString()
					}:{"instrTree" : res.instrTree.toString()}:undefined,
				"runtime" : runtime,
				"nb_call" : NatACN.appel,
				"stats_Sparklis" : stats_sparklis,
				"error_count" : SparklisAPI.error_count
			}
			console.log(data);

			//envoi au serveur
			postNatACN(data);

		}
	};

	console.log("get");
	Http.send();

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