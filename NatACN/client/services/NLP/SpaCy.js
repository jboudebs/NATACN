import { CoreNLP } from "./CoreNLP.js";

class SpaCy
{
	static async _fetch(NLQuestion)
	{
		let fetcH = new Promise(resolve =>
		{
			fetch('https://00cc-34-127-101-46.ngrok-free.app/', {
				method : 'POST', headers: {
					'Content-Type': 'text/plain;charset=UTF-8',
				}, body: NLQuestion,
			})
				.then((response) => response.json())
				//Then with the data from the response in JSON...
				.then((data) =>
				{
					console.log('SpaCy Success:', data);
					resolve(data);
				})
				//Then with the error genereted...
				.catch((error) =>
				{
					console.error('Error:', error);
				});
		});
		SpaCy.fetch = await fetcH;
	}
	
	static async getNE(NLQuestion)
	{
		//Changer les classes pour plus de flex
		await SpaCy._fetch(NLQuestion)
		SpaCy.NE = SpaCy.fetch.filter(w=>
			(w.label!=="CARDINAL")).filter((w=>w.label!=="DATE")).filter((w=>w.label!=="ORDINAL"))//enlever les entitées nommées qui sont des nombres ou des dates
			.map(w=>
			{w.word = w.word.replaceAll("\"","").replace(/^the\s/g, "").replace(/'s\b/g, "");return w}); //pourquoi il reste John Lennon's ??
		console.log("Named Entity",SpaCy.NE);
		console.dir(SpaCy.NE)
		return SpaCy.NE
	}


	static async main()
	{
		try
		{
			let NLQuestion = "In which city did John F. Kennedy die?";
			console.log(await SpaCy.fetch(NLQuestion));
			//SpaCy.NEFirst();
		}
		catch (e)
		{
			console.error(e)
		}
		
	}
}

//SpaCy.main()

export { SpaCy }
export default { SpaCy }