class SpaCySimilarity {
	static async _fetch(post_data) {
		const response = await fetch('http://127.0.0.1:5001', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(post_data),
		});
		const data = await response.json();
		console.log('SpaCySim Success:', data);
		return data;
	}

	static async getSimilarities(word, wordList) {
		const post_data = { word, wordList };
		await SpaCySimilarity._fetch(post_data);
		console.log(SpaCySimilarity.fetch);
		return SpaCySimilarity.fetch;
	}





static async main()
	{
		try
		{
			const word = "lune";
			const wordList = ["lune","soleil","loup"];
			console.log(await SpaCySimilarity.getSimilarity(word, wordList));
			//SpaCy.NEFirst();
		}
		catch (e)
		{
			console.error(e)
		}
		
	}
}

//SpaCySimilarity.main()

export { SpaCySimilarity }
export default { SpaCySimilarity }