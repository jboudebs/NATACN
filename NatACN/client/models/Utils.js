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

function isEqual(obj1, obj2) {
    var props1 = Object.getOwnPropertyNames(obj1);
    var props2 = Object.getOwnPropertyNames(obj2);
    if (props1.length != props2.length) {
        return false;
    }
    for (var i = 0; i < props1.length; i++) {
        let val1 = obj1[props1[i]];
        let val2 = obj2[props1[i]];
        let isObjects = isObject(val1) && isObject(val2);
        if (isObjects && !isEqual(val1, val2) || !isObjects && val1 !== val2) {
            return false;
        }
    }
    return true;
}

function isObject(object) {
    return object != null && typeof object === 'object';
}


export {isEmpty, sleep, camelize, uncamelize, snakize, isEqual, isObject}
export default {isEmpty, sleep, camelize, uncamelize, snakize, isEqual, isObject}