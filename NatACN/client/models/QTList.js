import { QT } from './QT.js'

class QTList
{

	constructor(list=[])
	{
		this._list = [];
        this.length = 0;
		
		for(let i = 0; i < list.length; i++)
		{
			let e = list[i];
			
			this.add(e);
		}
	}
	
	add(qt)
	{
		if (typeof qt === 'String')
		{
			let sqt = new QT(qt);
			
			
			this._list.push(sqt);
			this.length++;
		}
		else if( qt instanceof QT )
		{
			if(!this.includes(qt))
			{
				this._list.push(qt);
				this.length++;
			}
		}
		else if ( qt instanceof Array)
		{
			//console.warn("here", qt)
			for (let qtElement of qt)
			{
				//console.warn(qtElement)
				this.add(qtElement);
			}
		}
		else if ( qt instanceof QTList)
		{
			//console.warn("here", qt)
			for (let qtElement of qt._list)
			{
				//console.warn(qtElement)
				this.add(new QT(qtElement));
			}
		}
		else if (typeof qt === 'object')
		{
			
			let qttyped = new QT(qt)
			qttyped._ori = qt._ori
			qttyped._label = qt._label
			if(!this.includes(qttyped))
			{
				this._list.push(qttyped);
				this.length++;
			}
		}
		else
		{
			throw new Error("Erreur lors de l'ajout de " + qt + " dans une QTList.");
		}
		return this;
	}
	
	removeQT( qt) {
		const index = this._list.indexOf(qt);
		if (index !== -1) {
			this._list.splice(index, 1);
			this.length--;
		}
	}

	filter(f)
	{
		return QTList.toQTList(this._list.filter(f));
	}

	filterConcept()
	{
		
		const qtList = QTList.toQTList(this._list.filter(qt=>qt._incr.type === "IncrType"));
		
		return qtList;
	}

	filterRelation()
	{
		return QTList.toQTList(this._list.filter(qt=>qt._ori));
	}

	map(f)
	{
		return this._list.map(f);
	}

	static copy(qtList)
	{

		let nqtList = QTList.toQTList(qtList);

		return nqtList;
	}

	head()
	{
		return this._list[0];
	}

	tail()
	{
        this.length--;
		this._list = this._list.slice(1);
		return this;
	}

    get(i)
	{
		return this._list[i];
	}
	getList()
	{
		return this._list;
	}

	isEmpty()
	{
		return this._list.length === 0;
	}

	toString()
	{
		return this._list.toString();
	}
	
	

	includes(qt)
	{
		let a;
		if(qt instanceof QT)
		{
			a = qt.getIncr();
		}

		if(this._list.includes(a))
		{
			return true;
		}
		else if(a.uri&&a.orientation)
		{
			return this._list.filter(qt=>(qt.getIncr().uri === a.uri&& qt.getIncr().type===a.type && qt._ori && qt._ori===a.orientation)).length
		}
		else if(a.uri)
		{
			return this._list.filter(qt=>(qt.getIncr().uri === a.uri&& qt.getIncr().type===a.type)).length
		}
		// else if(a.uriE)
		// {
		// 	return this._list.map(qt=>qt.getIncr().uriE === a.uriE).find(e=>e)
		// }
		// else if(a.uriO)
		// {
		// 	return this._list.map(qt=>qt.getIncr().uriO === a.uriO).find(e=>e)
		// }
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
	
	filterByScore(mu)
	{
		this._list = this._list.filter(qt=>qt._score>=mu);
		this.length = this._list.length;
	}
	slice(start,end)
	{
		this._list = this._list.slice(start,end);
		this.length = this._list.length;
		return this;
	}
	rankByScore()
	{
		this._list = this._list.sort(this._getScoreOrder("_score"))
		return this;
		//console.warn(this._list);//ajouter un map pour borne inf
	}

	averageScore()
	{
		if(this.length===0){return 0}
		let totalScores = this._list.reduce((total, objet) => total + objet._score, 0);
		let moyenneScores = totalScores / this.length;
		return moyenneScores;
	}

	static toQTList(anyList)
	{
		let kwList = new QTList([]);
		// if (anyList instanceof Object && anyList._list!=undefined && anyList.length!=undefined && !(anyList instanceof InstrList))
		// {
		// 	kwList = new InstrList([]);
		// 	kwList._list = anyList._list;
		// 	kwList.length = anyList.length;
		// }
		// else{
		if (anyList instanceof QTList)
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
					kw = new QT(it)
				}
				else if (it instanceof QT)
				{
					kw = it;
				}
				else if (it instanceof Object)
				{
					kw = new QT(it);
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
	
	
}

export { QTList };
export default { QTList };