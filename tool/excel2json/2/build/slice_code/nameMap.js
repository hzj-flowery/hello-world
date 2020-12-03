let map = {};

function scanScripts(properties) {
    for (let i = 0; i < properties.length; i++) {
        let property = properties[i];
        let key = property.key;
        let name
        if (key.type == "Literal") {
            name = key.value
            property.key = {
                type: 'Identifier',
                name: name
            }
        } else if (key.type == "Identifier") {
            name = key.name;
        }

        if (!name || map[name]) {
            throw new Error('script name is duplicated:' + key);
        }

        map[name] = next();
    }
}

function getShortName(key) {
    return map[key];
}

let letters = 'abcdefghijklmnopqrstuvwxyz'
let numbers = '0123456789'
let lettersLen = letters.length;
let numbersLen = numbers.length;

let nameIndex = 0;
function next() {
    let index = nameIndex;
    let name = letters.charAt(index % lettersLen);
    index = Math.floor(index / lettersLen);
    while (index > 0) {
        name += getCharAt(index % (lettersLen + numbersLen));
        index = Math.floor(index / (lettersLen + numbersLen))
    }

    nameIndex++;
    return name;
}

function getCharAt(i) {
    if (i < lettersLen) {
        return letters.charAt(i)
    } else {
        return numbers.charAt(i - lettersLen)
    }
}

module.exports = {
    getShortName: getShortName,
    scanScripts: scanScripts
}