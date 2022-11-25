

let file = document.getElementById("readfile");
let fileQALD = document.getElementById("readfileQALD");
let fileQALD1 = document.getElementById("readfileQALD1");
let fileQALD2 = document.getElementById("readfileQALD2");
let fileQALD3 = document.getElementById("readfileQALD3");

var QALD3;
var NatACN_results;

file.addEventListener("change", load);

fileQALD.addEventListener("change", toResFormat);
fileQALD1.addEventListener("change", loadSQUALL);
fileQALD2.addEventListener("change", load);
fileQALD3.addEventListener("change", res);

function inter_strict(a,b)
{
    let i = 0;
    for (let ea of a)
    {
        if(b.includes(ea))
        {
            i++;
        }
    }
    return i;
}

function inter_relax(a,b)
{
    let i = 0;
    while(a.length!==0)
    {
        let j = 0;
        const ea = a.pop();
        while(j<b.length)
        {
            const eb = b[j];
            if(eb.includes(ea)||ea.includes(eb))
            {
                i++;//& delete b
            }
            j++;
        }
        
    }
    return i;
}



//find non empty answers
async function keywordComp() {
    var reader = new FileReader();
    reader.onload = async function (progressEvent) {
        var resultsAll = [];
        let questions = JSON.parse(this.result);
        for(let q of questions.results)
        {
            resultsAll.push({   "question" : q.question,
                                "keywords" : {  "ref" : q.keywords.ref.slice(0,-1).split(",").map(x=>x.slice(1)),
                                                "test": q.keywords.test._list.map(x=>x._string)},
                                "NE" : q.NE

            });
        }
        saveJsonObjToFile("keywordComp.json",{"nonEmptyAnswers" : resultsAll});
    };
    reader.readAsText(this.files[0]);
};


async function nonEmptyAnswers() {
    var reader = new FileReader();
    reader.onload = async function (progressEvent) {
        var resultsAll = [];
        let questions = JSON.parse(this.result);
        for(let q of questions.results)
        {
            if(q.answers.test.columns.length!==0)
            {
                resultsAll.push(q)
            }
        }
        saveJsonObjToFile("nonEmptyAnswers.json",{"nonEmptyAnswers" : resultsAll});
    };
    reader.readAsText(this.files[0]);
};

async function nonEmptyQTPath() {
    var reader = new FileReader();
    reader.onload = async function (progressEvent) {
        var resultsAll = [];
        let questions = JSON.parse(this.result);
        for(let q of questions.results)
        {
            if(q.query.QTPath.length!==0)
            {
                resultsAll.push(q)
            }
        }
        saveJsonObjToFile("nonEmptyQTPath.json",{"nonEmptyQTPath" : resultsAll});
    };
    reader.readAsText(this.files[0]);
};



//Change files format
    async function load() {
        var reader = new FileReader();
        reader.onload = async function (progressEvent) {
            NatACN_results = JSON.parse(this.result);
            console.log(NatACN_results);
        };
        reader.readAsText(this.files[0]);
    }

    async function concat(){
        let reader = new FileReader();
        reader.onload = async function (progressEvent) {
            let questions = JSON.parse(this.result);
            NatACN_results.results = JSON.parse(JSON.stringify(questions.results.concat(NatACN_results.results)));
            console.log(NatACN_results);
            //saveJsonObjToFile("concat.json", questions);
        };
        reader.readAsText(this.files[0]);
    }
    async function concatfinal(){
        var reader = new FileReader();
        reader.onload = async function (progressEvent) {
            let questions = JSON.parse(this.result);
            NatACN_results.results = questions.results.concat(NatACN_results.results);
            saveJsonObjToFile("concat-fin.json", NatACN_results);
        };
        reader.readAsText(this.files[0]);
    }

    function toQALDQuestion(string)
    {
        for(let q of squallQALD)
        {
            if(string === q.question_SQUALL)
            {
                return q.question_QALD;
            }
        }
    }

    async function res() {
        var reader = new FileReader();
        reader.onload = async function (progressEvent) {
            let questions = JSON.parse(this.result);
            let resultsAll = [];
            console.log(questions);
            for(let qNat of NatACN_results.results)
            {
                //console.log(qNat);
                for(let q of questions.results)
                {
                    //console.log(q);
                    if(q.question === " "+qNat.question.ref+" ")
                    {
                        
                        //console.log(q.answers);
                        const res = {  
                            "question" : {
                                "ref" : q.question, 
                                "test" : qNat.question.test}, 
                            "answers" : {
                                "ref" : q.answers, 
                                "test" : qNat.answers}, 
                            "query" :{
                                "sparql" : q.query, 
                                "QTPath" : qNat.QTPath}, 
                            "keywords" :{
                                "ref" : q.keywords, 
                                "test" : qNat.keywords},
                            "NE" : qNat.NE,
                            "stats" :{
                                "A_ref" : q.answers === undefined?0:(q.answers.length === undefined?0:q.answers.length), 
                                "A_test" : qNat.answers.length === undefined?0:qNat.answers.length},
                            };
                        console.log(res);
                        resultsAll.push(res);
                            
                    }
                }
                //console.log(resultsAll);
            }

            const name = "res.json";
            saveJsonObjToFile(name, {"results" : resultsAll});
        };
        reader.readAsText(this.files[0]);
    }
    
    async function resQALD() {
        var reader = new FileReader();
        reader.onload = async function (progressEvent) {
            let questions = JSON.parse(this.result);
            let resultsAll = [];
            console.log(question);
            for(let qNat of NatACN_results.results)
            {
                //console.log(qNat);
                for(let q of questions.results)
                {
                    //console.log(q);
                    if(q.question === " "+qNat.question+" ")
                    {
                        
                        //console.log(q.answers);
                        const res = {  
                            "question" : q.question, 
                            "answers" : {
                                "ref" : q.answers, 
                                "test" : qNat.answers}, 
                            "query" :{
                                "sparql" : q.query, 
                                "QTPath" : qNat.QTPath}, 
                            "keywords" :{
                                "ref" : q.keywords, 
                                "test" : qNat.keywords},
                            "NE" : qNat.NE,
                            "stats" :{
                                "A_ref" : q.answers === undefined?0:(q.answers.length === undefined?0:q.answers.length), 
                                "A_test" : qNat.answers.length === undefined?0:qNat.answers.length},
                            };
                        console.log(res);
                        resultsAll.push(res);
                            
                    }
                }
                //console.log(resultsAll);
            }

            const name = "res.json";
            saveJsonObjToFile(name, {"results" : resultsAll});
        };
        reader.readAsText(this.files[0]);
    }
//TO JSON results format
async function toResFormat() {
    var reader = new FileReader();
    reader.onload = async function (progressEvent) {
        var resultsAll = [];
        let questions = JSON.parse(this.result);
        for(let q of questions.results)
        {
            let results = [];
            console.log(q[0]);
            resultsAll.push({"question" : {
                                    "test" :q[0].NLQuestion, 
                                    "ref" : toQALDQuestion(q[0].NLQuestion)},
                                "answers" : q[0].answer, 
                                "QTPath" : q[0].navStateRes._QTPath, 
                                "keywords" : q[0].navStateRes._keywordList, 
                                "NE" : q[0].NE});
        }
        NatACN_results = resultsAll;
        saveJsonObjToFile("res_test.json",{"results" : resultsAll});
    };
    reader.readAsText(this.files[0]);
};

async function toQALD() {
    var reader = new FileReader();
    reader.onload = async function (progressEvent) {
        let questions = JSON.parse(this.result);
        let resultsAll = [];
        console.log(NatACN_results);
        for(let q of questions.dataset.question)
        {
            let results = [];
            console.log(q.query.cdataSection);
            resultsAll.push({   "question" : q.string[0].cdataSection, 
                                "answers" : q.answers.answer, 
                                "query" : q.query.cdataSection===" OUT OF SCOPE "?" OUT OF SCOPE ":/(SELECT|ASK)(.+)/.exec(q.query.cdataSection)[0], 
                                "keywords" : q.keywords[0].cdataSection});
        }
        saveJsonObjToFile("QALD3.json", {"results" : resultsAll});
    };
    reader.readAsText(this.files[0]);
}

var squallQALD = [];
async function loadSQUALL() {
    var reader = new FileReader();
    reader.onload = async function (progressEvent) {
        let questions = this.result.split('\n');
        let resultsAll = [];
        console.log(questions);
        let i = 0;
        for(let q of questions)
        {
            let results = [];
            squallQALD.push({   "question_SQUALL" : q, 
                            "index" : i,
                            "question_QALD" : qald[i]});
            i++;
        }
        console.log(squallQALD);
        // saveJsonObjToFile("QALD3.json", {"results" : resultsAll});
    };
    reader.readAsText(this.files[0]);
}
var qald;
async function loadQALD() {
    var reader = new FileReader();
    reader.onload = async function (progressEvent) {
        qald = this.result.split('\n');
    };
    reader.readAsText(this.files[0]);
}

async function getQALDQuestion() {
    var reader = new FileReader();
    reader.onload = async function (progressEvent) {
        let questions = JSON.parse(this.result);
        let resultsAll = [];
        console.log(NatACN_results);
        for(let q of questions.dataset.question)
        {
            let results = [];
            console.log(q.query.cdataSection);
            resultsAll.push({   "question" : q.string[0].cdataSection, 
                                "answers" : q.answers.answer, 
                                "query" : q.query.cdataSection===" OUT OF SCOPE "?" OUT OF SCOPE ":/(SELECT|ASK)(.+)/.exec(q.query.cdataSection)[0], 
                                "keywords" : q.keywords[0].cdataSection});
        }
        saveJsonObjToFile("QALD3.json", {"results" : resultsAll});
    };
    reader.readAsText(this.files[0]);
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