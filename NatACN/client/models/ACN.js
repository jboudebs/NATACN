/**
 * Abstract Class ACN.
 *
 * @class ACN
 */
class ACN
{
	constructor()
	{
		if (this.constructor === ACN)
		{
			throw new Error("Abstract classes can't be instantiated.");
		}
	}

	async getFilteredQT(instr, Pi, QTpath_i)
	{
		throw new Error("Method 'getFilteredQT' must be implemented.");
	}

	async navigate(Pi, qt)
	{
		throw new Error("Method 'navigate' must be implemented.");
	}

	async back()
	{
		throw new Error("Method 'back' must be implemented.");
	}

	async getResults(place)
	{
		throw new Error("Method 'getResults' must be implemented.");
	}
	
	hasEmptyQuery(place)
	{
		throw new Error("Method 'emptyQuery' must be implemented.");
	}
}
 
  
export { ACN };
export default { ACN };