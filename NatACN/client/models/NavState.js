import { Instruction } from "./Instruction.js"
import { InstrList } from "./InstrList.js"
import { QT } from "./QT.js"
import { QTList } from "./QTList.js"
import { NLPToolsParameters } from "./NLToolsParameters.js"

class NavState
{
	constructor(instr, QTList, place)
	{
		this.instr = instr;
		this.QTList = QTList;
		this.place = place;
	}
	toString()
	{
		return JSON.parse(JSON.stringify(this));
	}
	
	NEInstr()
	{
		return this.instr.isNE();
	}
	
	setConstraint(constr)
	{
		this._constraint = constr;
	}
	setEnd()
	{
		this._end = true;
	}

	isEnd()
	{
		return this._end;
	}
	
	getResults()
	{
		return this._results
	}
	
	setResults(results)
	{
		this._results = results;
	}
	
	getInstr()
	{
		return this._results
	}
	
	setInstr(results)
	{
		this._results = results;
	}
	
	setPlace(place)
	{
		this.place = place;
	}
	
	
	getPlace()
	{
		return this.place
	}
	
	setQTList(QTList)
	{
		this.QTList = QTList;
	}
	
	getQTList()
	{
		return this.QTList
	}
	
	static async main()
	{
	
	}

}

export { NavState };
export default { NavState };
