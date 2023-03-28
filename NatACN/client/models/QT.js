class QT
{
	constructor(qt)
	{
		if(qt instanceof QT)
		{
			this._incr = qt._incr;
		}
		else if(typeof qt === 'string')
		{
			this._incr = qt;
		}
		else if(typeof qt === 'object')
		{
			this._incr = qt;
		}
	}

	copy()
	{
		return Object.assign(Object.create(Object.getPrototypeOf(this)), JSON.parse(JSON.stringify(this)));
	}

	setIncr(qt)
	{
		this._incr = qt;
	}
	
	getIncr()
	{
		return this._incr;
	}
	
	
	getScore()
	{
		return this._score;
	}
	setScore(score)
	{
		this._score = score;
	}

	toString()
	{
		return this._incr.toString();
	}
	
	compareScore(qt)
	{
		if(this._score<qt._score)
		{
			return -1
		}
		else if(this._score>qt._score)
		{
			return 1
		}
		else if (this._score===qt._score)
		{
			return 0
		}
		else
		{
			console.error("Error", this, qt)
		}
	}
	
	setLabel(label)
	{
		this._label = label;
	}
	
	getLabel()
	{
		return this._label;
	}
	
	
}

export { QT };
export default { QT };