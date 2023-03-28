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

	async getFilteredQT(navState)
	{
		throw new Error("Method 'getFilteredQT' must be implemented.");
	}

	async navigate(qt)
	{
		throw new Error("Method 'navigate' must be implemented.");
	}

	async back()
	{
		throw new Error("Method 'back' must be implemented.");
	}

	async getResults()
	{
		throw new Error("Method 'back' must be implemented.");
	}
}
 
  
export { ACN };
export default { ACN };