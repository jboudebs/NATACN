import { SparklisAPI } from "/Users/jboudebs/WebstormProjects/NatACN_API/NatACN/client/services/ACN/SparklisAPI.js";
import { NatACN } from '/Users/jboudebs/WebstormProjects/NatACN_API/NatACN/client/models/NatACN.js';
import {isEqual} from "/Users/jboudebs/WebstormProjects/NatACN_API/NatACN/client/models/Utils.js";

var sparklisAPI;
var natACN;

try
{
	
	console.log("natACN calcul")
	sparklisAPI = new SparklisAPI();
	await SparklisAPI._waitForSparklis();
	console.log(sparklis);
	
	await sparklisAPI.init();
	natACN = new NatACN(sparklisAPI);
	
	//unique question
	//let question = "What is the boiling point of water?";
	//let resultsQALD = [];
	//let lQTRes = JSON.parse('{"longest" : false, "res" : []}');
	
	//tests
	//await natACN.natNavigate(question, resultsQALD, lQTRes);
	//console.warn("Résultat :")
	//console.warn(resultsQALD);
	
	//await calculNatACN();
	//await QALD();
	// let q = {"id":5,"question":"On which stock exchanges are Siemens AG shares traded?","query":"SELECT DISTINCT ?result WHERE {wd:Q81230 wdt:P414 ?result}","answer":{"our":[[{"type":"uri","uri":"http://www.wikidata.org/entity/Q151139"}],[{"type":"uri","uri":"http://www.wikidata.org/entity/Q661834"}],[{"type":"uri","uri":"http://www.wikidata.org/entity/Q819468"}],[{"type":"uri","uri":"http://www.wikidata.org/entity/Q13677"}]],"qald":[{"type":"uri","value":"http://www.wikidata.org/entity/Q13677"},{"type":"uri","value":"http://www.wikidata.org/entity/Q151139"},{"type":"uri","value":"http://www.wikidata.org/entity/Q661834"},{"type":"uri","value":"http://www.wikidata.org/entity/Q819468"}]},"squall":{"question":"","labels":["{\"uri\": \"Q81230\",\"label\" :\"Siemens\"}","{\"uri\": \"P414\",\"label\" :\"stock exchange\"}"]}};
	// await calcul(q);
	
	//reprise
	await getNatACN(0);//342

}
catch (e)
{
	console.error(e);
}

async function QALD()
{
	console.log("test");
	
	await SparklisAPI._waitForSparklis();
	console.log(sparklis);
	console.log(sparklis.currentPlace());

	getSimpleQALD();

}

async function evalQuery(query)
{
	console.log("eval query",query)
	const res = await sparklis.evalSparql(query+"LIMIT 200");
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
	const wikidataIDs = wikidataLabelExtracted.map((e) => e.replace(regexPrefix,"wd:"));
	
	console.log(wikidataIDs);
	
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
	console.log("post");
	console.log(data);
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
			console.log(Http.responseText);
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
	console.log(data);
	Http.send(data);
	
}

function getNatACN(id)
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
			console.log(JSON.parse(Http.responseText));
			
			const qald = JSON.parse(Http.responseText);
			const query = qald.query.sparql
				//WIKIDATA
				.replace('PREFIX bd: <http://www.bigdata.com/rdf#> PREFIX dct: <http://purl.org/dc/terms/> PREFIX geo: <http://www.opengis.net/ont/geosparql#> PREFIX p: <http://www.wikidata.org/prop/> PREFIX pq: <http://www.wikidata.org/prop/qualifier/> PREFIX ps: <http://www.wikidata.org/prop/statement/> PREFIX psn: <http://www.wikidata.org/prop/statement/value-normalized/> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX wd: <http://www.wikidata.org/entity/> PREFIX wds: <http://www.wikidata.org/entity/statement/> PREFIX wdt: <http://www.wikidata.org/prop/direct/> PREFIX wdv: <http://www.wikidata.org/value/> PREFIX wikibase: <http://wikiba.se/ontology#> PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> ','')
				//MONDIAL
				.replace("PREFIX n1: <http://www.semwebtech.org/mondial/10/meta#>", '');
			const question = qald.question[0].string;
			
			const answer = (await evalQuery(query)).rows;
			//console.log(answer);
			
			let resultsQALD = [];
			let lQTRes;
			
			const navState = await natACN.natNavigate(question, resultsQALD);
			
			lQTRes = navState._longestQTPath.Res;
			console.log(lQTRes);
			await sparklisAPI.home();

			
			const score = scoring(sparklisRestoRes(answer),sparklisRestoRes(lQTRes));
			
			const data = {  "id": qald.id,
				"question": qald.question[0].string,
				"query": query,
				"answer":
					{   "our_ref": answer,
						"qald": qald.answers.results,
						"longestQTList_res" : lQTRes,
						"NatACN_qald": resultsQALD[0].answer
					},
				"score" : score,
				
				"NatACN_info" :
					{
						"qald" : resultsQALD
					}
			}
			console.log(data);
			postNatACN(data);
			
		}
	};
	
	console.log("get");
	Http.send();
	
}

function sparklisRestoRes(sparklisRes,i)
{
	//console.log(sparklisRes);
	let res = [];
	if(sparklisRes.hasOwnProperty('columns'))
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