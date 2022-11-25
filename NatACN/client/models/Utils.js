function isEmpty(obj) 
{
    return Object.keys(obj).length === 0;
}

async function sleep(ms, callback = ()=>{})
{
	await new Promise((resolve) => setTimeout(() => {resolve(callback)}, ms));
}

/**
 * Rendre un string en camel
 * @param {*} str 
 * @returns 
 */
 function camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  }

function uncamelize(str, separator) {
// Assume default separator is a single space.
    if(typeof(separator) == "undefined") {
        separator = " ";
    }
    // Replace all capital letters by separator followed by lowercase one
    str = str.replace(/[A-Z]/g, function (letter)
    {
        return separator + letter.toLowerCase();
    });
    // Remove first separator
    return str.replace("/^" + separator + "/", '');
}

function snakize(str) {

    return str[0] === ' ' ? str.slice(1).replaceAll(" ", "_") : str.replaceAll(" ", "_");
}


export {isEmpty, sleep, camelize, uncamelize, snakize}
export default {isEmpty, sleep, camelize, uncamelize, snakize}