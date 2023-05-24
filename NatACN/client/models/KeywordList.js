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
		}
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
		return i?this._list[i]:this._list;
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
	 * @param {*} anyList
	 */
	static toKeywordList(anyList)
	{
		if (anyList instanceof KeywordList)
		{
			anyList=anyList._list
		}
		let kwList = new KeywordList([]);
		anyList.map(
			(it) => {
				try{
					let kw;
					if (typeof it === "string")
					{
						kw = new Keyword(it)
					}
					else if(it instanceof Keyword)
					{
						kw = it;
					}
					else if(it instanceof Object)
					{
						kw = new Keyword(it);
					}
					kwList.add(kw);
					return
				} catch (e)
				{
					console.error(e)
				}
			}
		)
		return kwList;
	}
}

export { KeywordList };
export default { KeywordList };