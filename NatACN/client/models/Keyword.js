import { CoreNLP } from '../services/NLP/CoreNLP.js';
class Keyword
{
	constructor(kw)
	{
		
		if(typeof kw === 'string')
		{
			this._string = kw;
			// if(CoreNLP._NE_fetch.includes(kw))
			// {
			// 	this._type = 'NE';
			// }
		}
		
		else if(kw instanceof Keyword)
		{
			this._type = 'NE';
			this._string = kw._string;
		}
		
		else if(kw instanceof Object)//new serialization for json CoreNLP
		{
			this._type = kw.type === 'NE'?"NE":undefined;
			this._string = kw.word;
			this._pos_tag = kw.pos_tag;
			this._start_char = kw.start_char;
			this._end_char = kw.end_char;
			this._lemma = kw.lemma;
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
	
	getStringForConstraint()
	{
		return this._string;
	}

	getType()
	{
		return this._type;
	}
	setType(type)
	{
		this._type = type;
	}
	
	getLemma()
	{
		return this._lemma
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