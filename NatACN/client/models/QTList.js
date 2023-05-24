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
		if(typeof qt === 'string')
		{
			let sqt = new QT(qt);
			
			this._list.push(sqt);
			this.length++;
		}
		else if( qt instanceof QT )
		{
			this._list.push(qt);
			this.length++;
		}
		else if ( qt instanceof Array)
		{
			for (let qtElement of qt)
			{
				this.add(qtElement);
			}
		}
		else if (typeof qt === 'object')
		{
			this._list.push(new QT(qt));
			this.length++;
		}
		else
		{
			throw new Error("Erreur lors de l'ajout de " + qt + " dans une QTList.");
		}
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

	includes(a)
	{
		return this._list.includes(a);
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
		this._list = this._list.filter(qt=>qt._score>=0.2)
	}
	rankByScore()
	{
		return new QTList(this._list.sort(this._getScoreOrder("_score")));
		//console.warn(this._list);//ajouter un map pour borne inf
	}

	static toQTList(stringList)
	{
		let qtList = new QTList([]);
		if(stringList === undefined)
		{
			qtList._list = [];
        	qtList.length = 0;
		}
		else
		{
			try
			{
				for (let i = 0; i < stringList.length; i++)
				{
					let string;
					if (string === undefined) // cas list de qt
					{
						string = stringList.get(i);
					}
					else
					{
						string = stringList[i];
					}
					
					qtList.add(string);
					
				}
			}
			catch (e)
			{
				console.error(e)
			}
		}
		return qtList;
		
	}
	
	
}

export { QTList };
export default { QTList };