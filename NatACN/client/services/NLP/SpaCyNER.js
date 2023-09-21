class SpaCyNER
{
	static async _fetch(NLQuestion)
	{
		let fetcH = new Promise(resolve =>
		{
			fetch(' http://127.0.0.1:5000', {
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
		SpaCyNER.fetch = await fetcH;
		//SpaCyNER.fetch.map(ne=>{ne.word=ne.endWord})//fix bizarre
	}
	
	static async getNE(NLQuestion)
	{
		//Changer les classes pour plus de flex
		await SpaCyNER._fetch(NLQuestion)
		console.log(SpaCyNER.NE)
		SpaCyNER.NE = SpaCyNER.fetch.filter(w => (w.label !== "CARDINAL" && w.label !== "DATE" && w.label !== "ORDINAL")) // enlever les entités nommées qui sont des nombres ou des dates
			.map(w => {
				console.log(w);
				w.word = w.word.replaceAll("\"", "").replace(/^the\s/g, "").replace(/'s\b/gi, "").trim().replaceAll('\'s','').replaceAll('\'','').replaceAll('"','').replaceAll("’s","");
				return w;
			});
		
		console.log("Named Entity", SpaCyNER.NE);
		//console.dir(SpaCyNER.NE)
		return SpaCyNER.NE
	}




	static async main()
	{
		try
		{
			let NLQuestion = "In which city did John F. Kennedy die?";
			console.log(await SpaCyNER.fetch(NLQuestion));
			//SpaCy.NEFirst();
		}
		catch (e)
		{
			console.error(e)
		}
		
	}
}

//SpaCy.main()

export { SpaCyNER }
export default { SpaCyNER }