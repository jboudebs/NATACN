import { CoreNLP } from '../services/NLP/CoreNLP.js';
class Instruction
{
	//object keyword and node for KeywordTree
	constructor(kw, childreen)
	{
		
		if(typeof kw === 'string')
		{
			this._string = kw;
			// if(CoreNLP._NE_fetch.includes(kw))
			// {
			// 	this._type = 'NE';
			// }
		}
		
		else if(kw instanceof Instruction)
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
			this._synset = kw.synset
			
		}
		
		if(childreen)
		{
			this._childreen = childreen
		}
			
	}
	
	isNE()
	{
		return this._type==='NE'
	}
	
	hasNext()
	{
		return this._childreen.length!==0
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
		if(this._childreen)
		{
			return this._string + "     " + this._childreen.map(kw=>"   "+kw.toString()).toString();
		}
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
	
	getSynset()
	{
		return this._synset;
	}
	
	setSynset(synset)
	{
		this._synset = synset;
	}
}

export { Instruction };
export default { Keyword: Instruction };