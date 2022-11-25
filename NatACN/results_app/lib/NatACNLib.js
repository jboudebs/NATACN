const fs = require("fs");
const {deepParseJson} = require("deep-parse-json");
const resultsLib = require("./results");


let i = 0;
module.exports.i = i;
let length = 0;

const inputQALD = '/Users/jboudebs/WebstormProjects/NatACN_API/NatACN/results_app/data/our_ref_short.json';
const outputNatACN = '/Users/jboudebs/WebstormProjects/NatACN_API/NatACN/results_app/data/our_res_short.json';

module.exports.getSimple =  async function getSimple(req, res)
{
	console.log("GET simple");
	
	fs.unlinkSync(outputNatACN);
	fs.appendFileSync(outputNatACN, '{"date" : \"'+ new Date().toGMTString() +'\",\n' +
	                              '"res": [');
	
	
	const qald10 = deepParseJson(fs.readFileSync(inputQALD).toString());
	length = qald10.qald10.length;
	console.log("JSON length", length);
	console.log("Query to client", qald10.qald10[0]);
	res.status(200).json(qald10.qald10[0]);
	
	console.log("GET Simple - server");
}

module.exports.post = async function post (req,res)
{
	console.log("Writing in a file", req.body);
	i++;
	if(i<length-1)
	{
		fs.appendFileSync(outputNatACN, JSON.stringify(req.body)+',\n');
		res.status(200).json(i);
	}
	else
	{
		res.status(200).json();
		fs.appendFileSync(outputNatACN, JSON.stringify(req.body)+'\n' + ']}');
	}
}

module.exports.get = async function get(req,res)
{   const ln = parseInt(req.params.ln) ;
	const qald = resultsLib.getQALD(ln);
	res.status(200).json(qald);
}


