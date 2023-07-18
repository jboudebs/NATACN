const fs = require("fs");
const editJsonFile = require("edit-json-file");
const {deepParseJson} = require("deep-parse-json");
const path = require('path');
//const StanfordCoreNLPClient=require('corenlp-client');

//const client=new StanfordCoreNLPClient("http://localhost:9000","tokenize,ssplit,pos,parse,lemma");


//const resultsLib = require("NatACN/results_app/lib/old/results");
//import {isEqual} from "/Users/jboudebs/WebstormProjects/NatACN_API/NatACN/client/models/Utils.js";


let i = 0;
module.exports.i = i;
let length = 0;
const currentDir = path.resolve();
console.log(currentDir)

const test_name = "new-Constraint-123-ordered-tree-path-cutted-question-17_07";
console.log(test_name);
const inputQALD = './data/qald_10-path-questions.json';
const outputNatACN = './results/juillet/'+test_name+'-res.json';
const scoreFile ='./results/juillet/'+test_name+'-score.json';
const summaryRes = './results/juillet/'+test_name+'-summary.csv';

module.exports.getSimple =  async function getSimple(req, res)
{
	console.log("GET simple");
	i = 0;
	fs.unlinkSync(outputNatACN);
	fs.appendFileSync(outputNatACN, '{"date" : \"'+ new Date().toGMTString() +'\",\n' +
		'"res": [');


	const qald10 = deepParseJson(fs.readFileSync(inputQALD).toString());
	length = qald10.qald10.length;
	const coreNLP = await client.annotate(qald10.qald10[0])
	//.then(result => console.log(JSON.stringify(result,null,2)));
	console.log("JSON length", length);
	console.log("coreNLP", coreNLP);
	console.log("Query to client", qald10.qald10[0]);
	res.status(200).json({"question" : qald10.qald10[0]});

	console.log("GET Simple - server");
}

module.exports.post = async function post (req,res)
{
	const next = true
	console.log("Writing in a file", req.body);
	console.log('post', i)
	if(i<length)
	{
		fs.appendFileSync(outputNatACN, JSON.stringify(req.body)+',\n');
		res.status(200).json(next?i:undefined);
	}
	else
	{
		res.status(200).json();
		fs.appendFileSync(outputNatACN, JSON.stringify(req.body)+'\n' + ']}');
		//await score();
		//await verif();
	}
}

module.exports.verif = async function verif()
{
	const results = deepParseJson(fs.readFileSync(outputNatACN).toString());
	console.log('test', typeof results);
	//console.log(results);
	const nb = results.res.length;
	console.log("nb",nb);

	const array = Array(nb).fill(0).map((n, i) => n + i);
	const ids = results.res.map(q => q.id);
	const missing = array.filter(value => !ids.includes(value));
	console.log("missing",missing);
	const toFindDuplicates = arry => arry.filter((item, index) => arry.indexOf(item) !== index)
	const duplicateElements = toFindDuplicates(ids);
	console.log("duplicate items",duplicateElements);

}

module.exports.removeDuplicates = function removeDuplicates()
{
	let duplicateElements = [];

	const file = editJsonFile(outputNatACN);
	let res = file.get("res");
	do
	{
		const ids = res.map(q => q.id);
		const toFindDuplicates = arry => arry.filter((item, index) => arry.indexOf(item) !== index)
		duplicateElements = toFindDuplicates(ids);
		console.log("duplicate items",duplicateElements);
		res = res.filter((e,i)=>i!==duplicateElements[0])
	}
	while (duplicateElements.length>1)
	file.set("res",res)
	file.save();

}

module.exports.get = async function get(req,res)
{
	//if(parseInt(req.params.ln))
	//{
	console.log(i);
	i = parseInt(req.params.ln) ? parseInt(req.params.ln) : i;
	if (i === 0)
	{
		console.log('Starting...')
		fs.writeFileSync(outputNatACN, '{"date" : \"' + new Date().toGMTString() + '\",\n' + '"res": [', {flag: "w+"});
	}

	const qald10 = deepParseJson(fs.readFileSync(inputQALD).toString());
	length = qald10.questions.length;
	const qald = qald10.questions[i];
	console.log(i, qald10.questions[i])
	//const coreNLP = await client.annotate(qald.question[0].string)
	//console.log('get',length,i, qald);

	i++;//À laisser quoi qu'il arrive
	res.status(200).json({"qald" : qald});
	//}
}

module.exports.score = async function score()
{
	console.log("Calculating score ...")
	const output = deepParseJson(fs.readFileSync(outputNatACN).toString());

	if(typeof output !== "object")
	{
		console.log(typeof output);
	}

	let precision = 0;
	let recall = 0;
	let F1score = 0;
	console.log(Object.keys(output));
	let nb = output.res.length;

	for (const i in output.res)
	{
		precision+=output.res[i].score.precision;
		recall+=output.res[i].score.recall;
		F1score+=output.res[i].score.F1score;
	}

	const score_json = {
		"recall" : recall/nb,
		"precision": precision/nb,
		"F1score": F1score/nb,
	}
	console.log("Writing in score file", score_json)
	fs.writeFileSync(scoreFile, JSON.stringify(score_json), {flag: "w+"});
}


module.exports.resJSON2resCSV = async function resJSON2resCSV()
{
	const output = deepParseJson(fs.readFileSync(outputNatACN).toString());
	fs.writeFileSync(summaryRes, 'ID;QALD;IDS SPARQL;Keywords Extracted;instrTree.txt;instrPath;Longest QT-Path;Precision;Recall;F1-Score;Runtime;Nb Call\n', {flag: "w+"});

	for (const i in output.res)
	{
		const id = output.res[i].id
		const ids = output.res[i].ids
		const question = output.res[i].question;
		const kwExtracted = output.res[i].NatACN_info?output.res[i].NatACN_info.extracted_kw?output.res[i].NatACN_info.extracted_kw:null:undefined;
		const instrPath = output.res[i].NatACN_info?output.res[i].NatACN_info.instrPath?output.res[i].NatACN_info.instrPath instanceof Array?null:output.res[i].NatACN_info.instrPath._list.map(e=>e._type?e._string+' ('+e._type+')':e._string).toString():null:undefined;
		const longestQTpath = output.res[i].NatACN_info?output.res[i].NatACN_info.QTpath?output.res[i].NatACN_info.QTpath instanceof Array?null:output.res[i].NatACN_info.QTpath._list.map(e=>e._incr.type==='IncrConstr'?
			(e._incr.constr.searchQuery?
				e._incr.constr.searchQuery.kwds.toString()+' (match)'.toString()
				:e._incr.constr.kwds.toString()+' (match)'.toString())
			:e._label):null:undefined;

		//console.log(output.res[i].NatACN_info.instrTree.txt.replaceAll("\n","").replaceAll(",",":"))

		console.log(output.res[i].NatACN_info.instrTree,";");
		const instrTree = "";//output.res[i].NatACN_info?output.res[i].NatACN_info.instrTree.txt.toString().replaceAll("\n","").replaceAll(",",":"):undefined;
		const precision = output.res[i].score.precision === null?0:output.res[i].score.precision;
		const recall = output.res[i].score.recall === null?0:output.res[i].score.recall;
		const F1score = output.res[i].score.F1score === null?0:output.res[i].score.F1score;
		const nb_call = output.res[i].nb_call;
		const runtime = output.res[i].runtime;

		const csvLine = id +';' + question + ';' + ids + ';' + kwExtracted + ';'+ instrTree + ';'+ instrPath + ';' + longestQTpath + ';' + precision + ';' + recall + ';' + F1score + ';' + nb_call + ';' + runtime + '\n';

		fs.appendFileSync(summaryRes, csvLine);
	}
	console.log("resJSON2resCSV Done")
}


// //Rectification des scores
// function sparklisRestoRes(sparklisRes,i)
// {
// 	//console.log(sparklisRes);
// 	let res = [];
// 	if(sparklisRes.hasOwnProperty('columns'))
// 	{
// 		const nb = sparklisRes.columns.length-1;
// 		for (const r in sparklisRes.rows)
// 		{
//
// 			//vérifier s'il existe déjà pour éviter les doublons
// 			const uri = sparklisRes.rows[r][nb].uri;
//
// 			res = res.filter(e=>e.uri!==uri);
//
// 			res.push(sparklisRes.rows[r][nb]);
//
// 		}
// 	}
// 	else
// 	{
// 		for (const r in sparklisRes)
// 		{
// 			res.push(sparklisRes[r][sparklisRes[r].length-1]);
// 		}
// 	}
// 	//pb format
// 	res = res.filter( (ele,pos)=>res.indexOf(ele) === pos);
// 	res = res[0]?res:[];
//
// 	return res//TODO : enlever les doublons.
// }
//
//
// function scoring(Ad, Aqa)
// {
// 	console.log("Calculating scores...",Ad, Aqa)
// 	let inter = [];
// 	for (const a1 in Ad)
// 	{
// 		for (const a2 in Aqa)
// 		{
//
// 			if(isEqual(Ad[a1],Aqa[a2]))
// 			{
// 				inter.push(Aqa[a2])
// 			}
// 		}
// 	}
// 	console.log("inter", inter);
// 	const recall = inter.length/Ad.length;
// 	const precision = inter.length/Aqa.length;
//
// 	const score = {
// 		"recall" : recall,
// 		"precision": precision,
// 		"F1score": 2*recall*precision/(recall+precision)
// 	}
// 	return score;
// }
//
//
//
// module.exports.majscore = function majscore()
// {
// 	//outputNatACN
// 	let file = editJsonFile(outputNatACN);
// 	let res = [];
// 	file.get("res").map((r,i)=>
// 		{
// 			console.log(r.id);
// 			//if(i===0){console.log("Convertir Ad", r.answer.our_ref)};
// 			const Ad = sparklisRestoRes(r.answer.our_ref, i);
// 			//if(i===0){console.dir("Convertir Aqa", r.answer.longestQTList_res);}
// 			const Aqa = sparklisRestoRes(r.answer.longestQTList_res, i);
// 			console.log("Ad",Ad.length);
// 			console.log("Aqa",Aqa.length);
// 			r.score = scoring(Ad,Aqa);
// 			console.log(r.score);
// 			//const id = r.id;
// 			//res = res.filter(e=>e.id !== id);
// 			res.push(r);
//
// 		}
//
// 	);
//
// 	file.set("res",res);
// 	// for (let j = 0; j < 422; j++)
// 	// {
// 	// 	console.log(j);
// 	// 	console.log(file.get("res"));
// 	// 	const Ad = sparklisRestoRes(file.get("res["+j+"].answer.our_ref"));
// 	// 	const Aqa = sparklisRestoRes(file.get("res["+j+"].answer.longestQTList_res"));
// 	//
// 	// 	const score = scoring(Ad,Aqa);
// 	//
// 	// 	file.set("res["+j+"].score", score);
// 	// }
// 	file.save();
// 	//fs.writeFileSync(outputNatACN,{"date" : file.get("date") ,"res" : res}, {flag: "w+"});
//
// 	console.log('upd score done')
//
//
// }
//
//
// //UTILS
// function isEqual(obj1, obj2) {
// 	var props1 = Object.getOwnPropertyNames(obj1);
// 	var props2 = Object.getOwnPropertyNames(obj2);
// 	if (props1.length !== props2.length) {
// 		return false;
// 	}
// 	for (var i = 0; i < props1.length; i++) {
// 		let val1 = obj1[props1[i]];
// 		let val2 = obj2[props1[i]];
// 		let isObjects = isObject(val1) && isObject(val2);
// 		if (isObjects && !isEqual(val1, val2) || !isObjects && val1 !== val2) {
// 			return false;
// 		}
// 	}
// 	return true;
// }
//
// function isObject(object) {
// 	return object != null && typeof object === 'object';
// }
