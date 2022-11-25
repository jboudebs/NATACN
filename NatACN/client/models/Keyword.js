import { CoreNLP } from '../services/NLP/CoreNLP.js';
class Keyword
{
	constructor(kw)
	{
		
		if(typeof kw === 'string')
		{
			this._string = kw;
			if(CoreNLP._NE_fetch.includes(kw))
			{
				this._type = 'NE';
			}
		}
		
		if(kw instanceof Keyword)
		{
			this._string = kw._string;
		}
			
	}

	static copy(kw)
	{
		return Object.assign(Object.create(Object.getPrototypeOf(kw)), JSON.parse(JSON.stringify(kw)));
	}

	setString(kw)
	{
		this._string = kw;
	}

	toString()
	{
		return this._string;
	}

	getType()
	{
		return this._type;
	}
}

class NEKeyword extends Keyword
{
	constructor(kw)
	{
		super(kw);
	}
}

export { Keyword, NEKeyword };
export default { Keyword, NEKeyword };