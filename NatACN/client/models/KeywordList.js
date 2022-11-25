import { CoreNLP } from '../services/NLP/CoreNLP.js';
import { Keyword } from './Keyword.js'

class KeywordList
{

	constructor(list)
	{
		this._list = [];
		this.length = 0;

		for(let i = 0; i < list.length; i++) 
		{
			let e = list[i];
			if(typeof e === 'string' || e instanceof Keyword)
			{
				this.add(e);
			}
			else
			{
				throw new Error('Erreur lors de la creation de ' + list.toString() + ' en KeywordList.');
			}
		};
	}
	
	add(keyword)
	{
		this.length++;
		if(typeof keyword === 'string')
		{
			let kw = new Keyword(keyword);
			this._list.push(kw);
			
		}
		else if(keyword instanceof Keyword)
		{
			
			this._list.push(keyword);
			
		}
		else
		{
			throw new Error("Erreur lors de l'ajout de " + keyword + " dans une KeywordList.");
		}
	}

	static copy(kwList)
	{
		return KeywordList.toKeywordList(kwList);
	}

	head()
	{
		return this._list[0];
	}

	tail()
	{
		this._list = this._list.slice(1);
		this.length--;
		return this;
	}

	get(i)
	{
		return this._list[i];
	}

	isEmpty()
	{
		if(this.length === 1)
		{
			return this.get(0) === "";
		}
		return this._list.length === 0;
	}

	toString()
	{
		return this._list.toString();
	}

	/**
	 * Les kw ne sont pas clonés, parce qu'ils ne sont qu'en lecture.
	 * @param {*} stringList 
	 */
	static toKeywordList(stringList)
	{
		let kwList = new KeywordList([]);
		for(let i = 0; i < stringList.length; i++) 
		{	
			let string = stringList[i]; // cas list de string
			
			if (string === undefined) // cas list de keyword
			{
				string = stringList.get(i);
			}
			
			kwList.add(string);
			
		};

		return kwList;
	}
}

export { KeywordList };
export default { KeywordList };