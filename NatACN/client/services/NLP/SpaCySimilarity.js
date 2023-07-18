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
		const data = await SpaCySimilarity._fetch(post_data);
		return data;
	}





static async main()
	{
		try
		{
			const word = "educated";
			const wordList = ["made from material","educated at","field of work"];
			console.log(await SpaCySimilarity.getSimilarities(word, wordList));
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