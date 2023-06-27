import { CoreNLP } from 'NatACN/client/services/NLP/CoreNLP.js';
import { Instruction } from 'NatACN/client/models/Instruction.js'

class KeywordTree
{

	constructor(list)
	{
		//console.warn("TO TREE")
		this._childreen = []
		if( list instanceof Array )
		{
			let current_node = this;
			for(const combinaison of list)
			{
				//console.warn("combinaison", combinaison)
				current_node = this
				for (const kw of combinaison)
				{
					//console.warn("combinaison kw", kw)
					let keyword_node;
					if(current_node._childreen.length===0)
					{
						keyword_node = new Instruction(kw, [])
						current_node._childreen.push(keyword_node);
					}
					else
					{
						keyword_node = current_node._childreen.filter(c=>c._start_char===kw.start_char)[0];
						//console.log(keyword_node, current_node._childreen, kw)
						if(keyword_node === undefined)
						{
							keyword_node = new Instruction(kw, [])
							current_node._childreen.push(keyword_node);
						}
					}
					current_node = keyword_node;
				}
				
			}
			//console.log(this.toString())
		}
		else
		{
			throw new Error(list.toString()+" is not an Array")
		}
	}
	
	hasNext()
	{
		return this._childreen.length!==0
	}
	
	// add(keyword)
	// {
	// 	this.length++;
	// 	if(typeof keyword === 'string')
	// 	{
	// 		let kw = new Keyword(keyword);
	// 		this._list.push(kw);
	//
	// 	}
	// 	else if(keyword instanceof Keyword)
	// 	{
	//
	// 		this._list.push(keyword);
	//
	// 	}
	// 	else
	// 	{
	// 		throw new Error("Erreur lors de l'ajout de " + keyword + " dans une KeywordTree.");
	// 	}
	// }
	//
	// static copy(kwList)
	// {
	// 	return KeywordTree.toKeywordTree(kwList);
	// }
	//
	// head()
	// {
	// 	return this._list[0];
	// }
	//
	// tail()
	// {
	// 	this._list = this._list.slice(1);
	// 	this.length--;
	// 	return this;
	// }
	//
	// get(i)
	// {
	// 	return i?this._list[i]:this._list;
	// }

	isEmpty()
	{
		return this._childreen.length === 0;
	}

	toString()
	{
		return this._childreen.map(kw=>"   "+kw.toString()).toString();
	}

	/**
	 * Les kw ne sont pas clonés, parce qu'ils ne sont qu'en lecture.
	 * @param {*} anyList
	 */
	// static toKeywordTree(anyList)
	// {
	// 	if (anyList instanceof KeywordTree)
	// 	{
	// 		anyList=anyList._list
	// 	}
	// 	let kwList = new KeywordTree([]);
	// 	anyList.map(
	// 		(it) => {
	// 			try{
	// 				let kw;
	// 				if (typeof it === "string")
	// 				{
	// 					kw = new Keyword(it)
	// 				}
	// 				else if(it instanceof Keyword)
	// 				{
	// 					kw = it;
	// 				}
	// 				else if(it instanceof Object)
	// 				{
	// 					kw = new Keyword(it);
	// 				}
	// 				kwList.add(kw);
	// 				return
	// 			} catch (e)
	// 			{
	// 				console.error(e)
	// 			}
	// 		}
	// 	)
	// 	return kwList;
	// }
}

export { KeywordTree };
export default { KeywordTree };