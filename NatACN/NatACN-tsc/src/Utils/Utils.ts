function isEmpty(obj: object): boolean {
    return Object.keys(obj).length === 0;
}

async function sleep(ms: number, callback: () => void = () => {}): Promise<void> {
    console.error('Waiting for ' + ms + ' ms...');
    await new Promise((resolve) => setTimeout(() => { resolve(callback) }, ms));
    console.error("Waited.");
}

/**
 * Rendre un string en camel
 * @param {*} str
 * @returns
 */
function camelize(str: string): string {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '').replace("-", '_');
}

function uncamelize(str: string, separator: string): string {
    // Assume default separator is a single space.
    if (typeof (separator) == "undefined") {
        separator = " ";
    }
    // Replace all capital letters by separator followed by lowercase one
    str = str.replace(/[A-Z]/g, function (letter) {
        return separator + letter.toLowerCase();
    });
    // Remove first separator
    return str.replace("/^" + separator + "/", '');
}

function snakize(str: string): string {
    return str[0] === ' ' ? str.slice(1).replaceAll(" ", "_") : str.replaceAll(" ", "_").replace("-", '_');
}

function isEqual(obj1: object, obj2: object): boolean {
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

function isObject(object: any): boolean {
    return object != null && typeof object === 'object';
}

export { isEmpty, sleep, camelize, uncamelize, snakize, isEqual, isObject };
export default { isEmpty, sleep, camelize, uncamelize, snakize, isEqual, isObject };