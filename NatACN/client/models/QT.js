class QT
{
	constructor(qt)
	{
		if(qt instanceof QT)
		{
			this._string = qt._string;	
		}
		else if(typeof qt === 'string')
		{
			this._string = qt;
		}
		else if(typeof qt === 'object')
		{
			this._string = qt;
		}
	}

	copy()
	{
		return Object.assign(Object.create(Object.getPrototypeOf(this)), JSON.parse(JSON.stringify(this)));
	}

	setString(qt)
	{
		this._string = qt;
	}

	toString()
	{
		return this._string;
	}
}

export { QT };
export default { QT };