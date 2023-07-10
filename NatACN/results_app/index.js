const express = require('express')
const bodyParser = require("express");
//const QALDLib = require("NatACN/results_app/lib/old/QALDLib");
const NatACNLib = require("./lib/testServer_lib.js");

const app = express();
const port = 3000;

NatACNLib.i = 0;

//get settings
app.use(bodyParser.urlencoded({ limit: '200mb', extended: false }));
app.use(bodyParser.json({limit: '200mb'}));

//app.get('/score', (req, res)=>NatACNLib.score(req,res))

app.get('/score', (req, res)=>{
	try
	{
		//Recalcul du score sans les doublons
		//NatACNLib.majscore();
		
		//NatACNLib.verif();
		NatACNLib.removeDuplicates();
		NatACNLib.score();
		NatACNLib.resJSON2resCSV();
		
	}
	catch (e)
	{
		console.error(e);
	}

})

app.post('/', (req, res)=>NatACNLib.post(req, res))

//'SELECT DISTINCT ?result WHERE {?result wdt:P31 wd:Q16521. ?mop wdt:P31 wd:Q645883; wdt:P710 ?result, wd:Q625657.}'
//app.get('/:i',()=>{let query = resultsLib.getQuery(i); console.log(query);});

app.get('/:ln', (req, res)=>NatACNLib.get(req,res))

app.listen(port, () => {
	console.log(`Results app listening on port ${port}`);
})
