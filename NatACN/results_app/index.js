const express = require('express')
const {deepParseJson} = require("deep-parse-json");
const fs = require("fs");
const bodyParser = require("express");
const resultsLib = require("./lib/results");
const QALDLib = require("./lib/QALDLib");
const NatACNLib = require("./lib/NatACNLib");
const app = express();
const port = 3000;

NatACNLib.i = 0;

//get settings
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res)=>NatACNLib.getSimple(req, res))

app.post('/', (req, res)=>NatACNLib.post(req, res))

//'SELECT DISTINCT ?result WHERE {?result wdt:P31 wd:Q16521. ?mop wdt:P31 wd:Q645883; wdt:P710 ?result, wd:Q625657.}'
//app.get('/:i',()=>{let query = resultsLib.getQuery(i); console.log(query);});

app.get('/:ln', (req, res)=>NatACNLib.get(req,res))

app.listen(port, () => {
	console.log(`Results app listening on port ${port}`);
})
