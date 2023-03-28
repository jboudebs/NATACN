const {deepParseJson} = require("deep-parse-json");
const fs = require("fs");

/**
 * Functions
 */

const refFile = "/Users/jboudebs/WebstormProjects/NatACN_API/NatACN/results_app/data/mondial-testNaryRel.json"
function testWritingOnAServeurFile()
{
	console.log("wrote on a serveur");
}

function extractPureWikidataQuestions()
{
	var reader = new FileReader();
	reader.onload = async function (progressEvent)
	{
		console.log("extractPureWikidataQuestions");
		var resultsAll = [];
		let questions = JSON.parse(this.result);
		console.log(questions.questions);
		for (let q of questions.questions)
		{
			console.log("extract");
			resultsAll.push({
				"id"      : q.id,
				"question": q.question.map(x => x.langage === "en").toString(),
				"answers" : q.answers.bindings.map(x => x.result),
				"query"   : q.query.sparql
				
			});
		}
		saveJsonObjToFile("extractedQALD10.json", {"nonEmptyAnswers": resultsAll});
	};
}

exports.getQuery = function getQuery(i)
{
	const qald10 = deepParseJson(fs.readFileSync(refFile).toString());
	console.log("getQuery",qald10.questions[i].query);
	return qald10.questions[i].query;
}

exports.getQALD = function getQALD(ln)
{
	const qald10 = deepParseJson(fs.readFileSync(refFile).toString());
	console.log("getQALD ",qald10.questions[ln]);
	return qald10.questions[ln];
}

// TODO : find answers and wiki labels
exports.getAnswers = async function getAnswers()
{
	const qald10 = deepParseJson(fs.readFileSync(refFile).toString());
	console.log(qald10);
	// fs.writeFileSync("test-answers.json", '{"qald10" : [', {
	// 	encoding: "utf8", flag: "w+", mode: 0o666
	// });
	// for (let line of qald10.qald10)
	// {
	// 	// const results = (await sparklis.evalSparql(line.query)) //TODO : verifier si les " passent, récupèrer sparklis
	// 	// 				.rows.map(x=>x[0]);
	//
	// 	let labels = extractLabels(line.query);
	//
	//
	// 	// fs.appendFileSync("ref.json",
	// 	// 	'{\n' + '"id" :' + line.id + ',\n' +
	// 	// 				'"question" : "' + line.question + '",\n' +
	// 	// 				'"answers-ref" :' + JSON.stringify(line.answers) + ',\n' +
	// 	// 				'"answers-test" :' + JSON.stringify(answers) + ',\n' +
	// 	// 				'"query" : "' + line.query.replaceAll("\"", "\\\"") + '"},\n')
	// 	// 				'"labels" :' + labels + "}"
	// }
	
}

//SELECT (COUNT (DISTINCT ?lan) AS ?result) WHERE {wd:Q27496 wdt:P527/wdt:P2936 ?lan}


/**
 * extract all we need from qald10.json in a file named ref.json
 */
function extract()
{
	try
	{
		//const qald10 = require('./qald_10_short.json');
		
		const qald10 = deepParseJson(fs.readFileSync('qald_10.json').toString());
		fs.writeFileSync("ref.json", '{"qald10" : [', {
			encoding: "utf8", flag: "w+", mode: 0o666
		});
		//fs.appendFileSync("ref.json", '{"qald10" : [', 'a+');
		for (let line of qald10.questions)
		{
			console.log("answers : ", (Object.keys(line.answers[0].head).length === 0));
			//let r = line.question.map(x =>{ console.log("this",x.string);return ((x.language ===
			// 'en')?x.string:null);})
			if (Object.keys(line.answers[0].head).length !== 0)
			{
				console.log(line.answers[0].head);
				const resType = line.answers[0].head.vars[0];
				fs.appendFileSync("ref.json", '{\n' + '"id" :' + line.id + ',\n' + '"question" : "' + line.question.map(x =>
				{
					console.log("this", x.string);
					return ((x.language === 'en') ? x.string : null);
				})
					.filter(x => x !== null).toString().replaceAll("\"", "\\\"") + '",\n' + '"answers" :' + JSON.stringify(line.answers[0].results.bindings.map(x => x[resType])) + ',\n' + '"query" : "' + line.query.sparql.replaceAll("\"", "\\\"") + '"},\n');
			}
			else
			{
				fs.appendFileSync("ref.json", '{\n' + '"id" :' + line.id + ',\n' + '"question" : "' + line.question.map(x =>
				{
					console.log("this", x.string);
					return ((x.language === 'en') ? x.string : null);
				})
					.filter(x => x !== null).toString().replaceAll("\"", "\\\"") + '",\n' + '"answers" :' + line.answers[0].boolean.toString() + ',\n' + '"query" : "' + line.query.sparql.replaceAll("\"", "\\\"") + '"},\n');
				
			}
		}
		fs.appendFileSync("ref.json", ']}');
		
		
	}
	catch (e)
	{
		console.log(e);
	}
}

function getLength()
{
	const qald10 = deepParseJson(fs.readFileSync('ref.json').toString());
	console.log(qald10.qald10.length);
}


function saveJsonObjToFile(name, saveObj) {
	
	// file setting
	const text = JSON.stringify(saveObj);
	const type = "text/plain";
	
	// create file
	const a = document.createElement("a");
	const file = new Blob([text], { type: type });
	a.href = URL.createObjectURL(file);
	a.download = name;
	document.body.appendChild(a);
	a.click();
	a.remove();
}