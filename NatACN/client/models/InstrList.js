import { CoreNLP } from '../services/NLP/CoreNLP.js';
import { Instruction } from './Instruction.js'
import { isEqual } from "./Utils.js";

class InstrList
{
	
	constructor(list = [])
	{
		this._list = [];
		this.length = 0;
		
		for (let i = 0; i < list.length; i++)
		{
			let e = list[i];
			if (typeof e === 'string' || e instanceof Instruction)
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
		if (typeof keyword === 'string')
		{
			if (!this.includes(keyword))
			{
				let kw = new Instruction(keyword);
				this._list.push(kw);
			}
			
		}
		else if (keyword instanceof Instruction)
		{
			if (!this.includes(keyword))
			{
				this._list.push(keyword);
			}
			
		}
		else if(keyword === undefined)
		{
		}
		else
		{
			throw new Error("Erreur lors de l'ajout de " + keyword + " dans une KeywordList.");
		}
		return this;
	}
	
	static copy(kwList)
	{
		return InstrList.toInstrList(kwList);
	}

	filterFromType(type)
	{
		return this._list.filter(kw=>kw._type===type);
	}

	removeInstr(instr) {
		const index = this._list.indexOf(instr);
		console.log(index);
		if (index !== -1) {
			this._list.splice(index, 1);
			this.length--;
		}
		else
		{
			console.log(instr, this._list)
			const list = this._list.filter(val => isEqual(instr, val))
			console.log(list)
		}
	}
	
	includes(a)
	{
		if (this._list.includes(a))
		{
			return true;
		}
		else if (a.toString())
		{
			return this._list.map(instr => instr.toString() === a.toString()).find(e => e)
		}
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
		return i ? this._list[i] : this._list;
	}
	
	isEmpty()
	{
		if (this.length === 1)
		{
			return this.get(0) === "";
		}
		return this._list.length === 0;
	}
	
	toString()
	{
		function s(w)
		{
			w._type ? w.toString() + "(" + w._type + ")" : w.toString()
		}
		
		return this._list.map(w => w.toString() + "(" + w._type + ")").toString();
	}
	
	/**
	 * Les kw ne sont pas clonés, parce qu'ils ne sont qu'en lecture.
	 * @param {*} anyList
	 */
	static toInstrList(anyList)
	{
		let kwList = new InstrList([]);
		// if (anyList instanceof Object && anyList._list!=undefined && anyList.length!=undefined && !(anyList instanceof InstrList))
		// {
		// 	kwList = new InstrList([]);
		// 	kwList._list = anyList._list;
		// 	kwList.length = anyList.length;
		// }
		// else{
		if (anyList instanceof InstrList)
		{
			anyList = anyList._list
		}
		
		anyList.map((it) =>
		{
			try
			{
				let kw;
				if (typeof it === "string")
				{
					kw = new Instruction(it)
				}
				else if (it instanceof Instruction)
				{
					kw = it;
				}
				else if (it instanceof Object)
				{
					kw = new Instruction(it);
				}
				
				kwList.add(kw);
				return
			}
			catch (e)
			{
				console.error(e)
			}
		})
		
		return kwList;
		//}
	}
	_getScoreOrder(prop)
	{
		return function (qt1,qt2)
		{
			if (qt1[prop] > qt2[prop])
			{
				return -1
			}
			else if(qt1[prop] < qt2[prop])
			{
				return 1
			}
			return 0;
		}
	}
	rankByScore()
	{
		this._list = this._list.sort(this._getScoreOrder("_score"))
		return this;
		//console.warn(this._list);//ajouter un map pour borne inf
	}

	slice(start,end)
	{
		this._list = this._list.slice(start,end);
		this.length = this._list.length;
	}
}
export { InstrList };
export default { KeywordList: InstrList };