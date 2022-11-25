import { QT } from './QT.js'

class QTList
{

	constructor(list)
	{
		this._list = [];
        this.length = 0;
		for(let i = 0; i < list.length; i++) 
		{
			let e = list[i];
			
			this.add(e);
		};
	}
	
	add(qt)
	{
		if(typeof qt === 'string')
		{
			let sqt = new QT(qt);
			this._list.push(sqt);
		}
		else if( qt instanceof QT )
		{
			this._list.push(qt);
		}
		else if (typeof qt === 'object')
		{
			this._list.push(qt);
		}
		else
		{
			throw new Error("Erreur lors de l'ajout de " + qt + " dans une QTList.");
		}
		this.length++;
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
			for(let i = 0; i < stringList.length; i++) 
			{
				console.log(stringList);
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
				
			};
		}
		return qtList;
		
	}
}

export { QTList };
export default { QTList };