import { SparklisAPI } from "/Users/jboudebs/WebstormProjects/NatACN_API/NatACN/client/services/ACN/SparklisAPI.js";
import { NatACN } from '/Users/jboudebs/WebstormProjects/NatACN_API/NatACN/client/models/NatACN.js';

var sparklisAPI;
var natACN;

try
{
	
	console.log("natACN calcul")
	sparklisAPI = new SparklisAPI();
	await SparklisAPI._waitForSparklis();
	console.log(sparklis);
	console.log(sparklis.currentPlace());
	
	await sparklisAPI.init();
	natACN = new NatACN(sparklisAPI);
	
	let question = "Give me battles";
	let resultsQALD = [];
	await natACN.natNavigate(question, resultsQALD);
	//await calculNatACN();
	//await QALD();
	// let q = {"id":5,"question":"On which stock exchanges are Siemens AG shares traded?","query":"SELECT DISTINCT ?result WHERE {wd:Q81230 wdt:P414 ?result}","answer":{"our":[[{"type":"uri","uri":"http://www.wikidata.org/entity/Q151139"}],[{"type":"uri","uri":"http://www.wikidata.org/entity/Q661834"}],[{"type":"uri","uri":"http://www.wikidata.org/entity/Q819468"}],[{"type":"uri","uri":"http://www.wikidata.org/entity/Q13677"}]],"qald":[{"type":"uri","value":"http://www.wikidata.org/entity/Q13677"},{"type":"uri","value":"http://www.wikidata.org/entity/Q151139"},{"type":"uri","value":"http://www.wikidata.org/entity/Q661834"},{"type":"uri","value":"http://www.wikidata.org/entity/Q819468"}]},"squall":{"question":"","labels":["{\"uri\": \"Q81230\",\"label\" :\"Siemens\"}","{\"uri\": \"P414\",\"label\" :\"stock exchange\"}"]}};
	// await calcul(q);

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
	const res = await sparklis.evalSparql(query);
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
			
			let qald = JSON.parse(Http.responseText);
			let query = qald.query;
			
			const labels = await extractLabels(query);
			console.log("extractLabels",labels);
			const answer = (await evalQuery(query)).rows;
			console.log(answer);
			const data = {
				"id": qald.id,
				"question": qald.question,
				"query": query,
				"answer": {
					"our": answer,
					"qald": qald.answers},
				"labeled_question" : {
					"question": "",
					"labels" : labels} };//manque label
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
			let qald = JSON.parse(Http.responseText)
			let query = qald.query;
			const labels = await extractLabels(query);
			console.log("extractLabels",labels)
			const answer = await evalQuery(query);
			console.log(answer.rows);
			const data = {
				"id": qald.id,
				"question": qald.question,
				"query": query,
				"answer": {
					"our": answer,
					"qald": qald.answers},
				"labeled_question" : {
					"question": "",
					"labels" : labels} }
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
			const labeled_question = qald.labeled_question.question;

			const answer = (await evalQuery(query)).rows;
			
			let resultsQALD = [];
			await natACN.natNavigate(question, resultsQALD);
			await sparklisAPI.home();
			let resultsLQ = [];
			await natACN.natNavigate(labeled_question, resultsLQ);
			await sparklisAPI.home();
			
			console.log(answer);
			const data = {  "id": qald.id,
							"question": qald.question,
							"query": query,
							"answer":
								{   "our_ref": answer,
									"qald": qald.answers,
									"NatACN_qald": resultsQALD.answers,//à changer
									"NatACN_labeled_question": resultsLQ.answers//à changer
								},
							"labeled_question" :
								{   "question": qald.labeled_question.question,
									"labels" : qald.labeled_question.labels
								},
							"NatACN_info" :
								{
									"qald" : resultsQALD,
									"labeled_question": resultsLQ
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
			
			const qald = JSON.parse(Http.responseText)
			const query = qald.query;
			const question = qald.question;
			const labeled_question = qald.labeled_question.question;
			
			const answer = (await evalQuery(query)).rows;
			
			let resultsQALD = [];
			await natACN.natNavigate(question, resultsQALD);
			await sparklisAPI.home();
			let resultsLQ = [];
			await natACN.natNavigate(labeled_question, resultsLQ);
			await sparklisAPI.home();
			
			console.log(answer);
			const data = {  "id": qald.id,
				"question": qald.question,
				"query": query,
				"answer":
					{   "our_ref": answer,
						"qald": qald.answers,
						"NatACN_qald": resultsQALD.answers,//à changer
						"NatACN_labeled_question": resultsLQ.answers//à changer
					},
				"labeled_question" :
					{   "question": qald.labeled_question.question,
						"labels" : qald.labeled_question.labels
					},
				"NatACN_info" :
					{
						"qald" : resultsQALD,
						"labeled_question": resultsLQ
					}
			}
			postNatACN(data);
			
		}
	};
	
	console.log("get");
	Http.send();
	
}
