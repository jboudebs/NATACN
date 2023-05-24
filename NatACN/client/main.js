import { NatACN } from './models/NatACN.js';
import { NavState } from './models/NavState.js';
import { SparklisAPI } from './services/ACN/SparklisAPI.js';
import { CoreNLP } from './services/NLP/CoreNLP.js';
import { SpaCy } from './services/NLP/SpaCy.js';
import { NLPToolsParameters } from "/Users/jboudebs/WebstormProjects/NatACN_API/NatACN/client/models/NLToolsParameters.js";
//import { sparklis } from '/Users/jboudebs/Documents/NatACN/NatACN/client/services/ACN/SparklisAPI/sparklis/webapp/osparklis.js';
import { ConceptNet } from './services/NLP/ConceptNet.js';
/**
 * ACN Choosing
 */
try
{
	
	const NLQuestion = 'Animal';
	await SparklisAPI._waitForSparklis();
	console.log(sparklis);
	console.log(sparklis.currentPlace());
	let sparklisAPI = new SparklisAPI();
	await sparklisAPI.init();
	let natACN = new NatACN(sparklisAPI);
	
	
	
	
	//natACN.navState = new NavState(NLQuestion);
	// //await this.navstate.init();
	// await natACN.NLpreprocessing();
	// await natACN.navState.updateNextKeyword();
	
	/*
	let file = document.getElementById("readfile");
	file.addEventListener("change", async function () {
	    var reader = new FileReader();
	    reader.onload = async function (progressEvent) {
	        let questions = this.result.split('\n');
	        let resultsAll = [];
	        const start = Date.now();
	        for(let q of questions)
	        {
	            sparklisAPI.home();
	            let results = [];
	            await natACN.natNavigate(q, results);
	            resultsAll.push(results);
	        }
	        const millis = Date.now() - start;
	        saveJsonObjToFile({"results" : resultsAll, "millis" : millis});
	    };
	    reader.readAsText(this.files[0]);
	});
	
	
	
	function saveJsonObjToFile(saveObj) {
	
	    // file setting
	    const text = JSON.stringify(saveObj);
	    const name = "test-"+Date.now()+".json";
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
	*/
	
	/**
	 * NLP preprocessing
	 */
	//console.log(ConceptNet);
	//await ConceptNet.main();
	//await CoreNLP.main();
	//await SpaCy.main();
	//await NLPToolsParameters.keywordExtractionAndSorting("What is the birthdate of Isabelle Huppert?")
	
	/**
	 * Test SparklisAPI
	 */
	//natACN.navState = new NavState(NLQuestion);
	// // //await this.navstate.init();
	// await natACN.NLpreprocessing();
	// await natACN.navState.updateNextKeyword();
	// console.log("this");
	// console.log(natACN);
	// //await sparklisAPI.main(natACN.navState);
	
	/**
	 * Test NatACN processing
	 */
	// //await NavState.main();
	// //var results = [];
	natACN.natNavigate('Give me a taxon that has name.', results).then(e=>console.log(e, results));
	// await sparklisAPI.main(natACN.navState);

}
catch (e)
{
	console.error(e)
}
