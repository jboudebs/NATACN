const StanfordCoreNLPClient=require('corenlp-client');

const client=new StanfordCoreNLPClient("http://localhost:9000","tokenize,ssplit,pos,parse");

client.annotate("the quick brown fox jumped over the lazy dog")
	.then(result => console.log(JSON.stringify(result,null,2)));