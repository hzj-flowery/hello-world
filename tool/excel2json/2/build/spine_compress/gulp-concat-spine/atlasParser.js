module.exports = function(buffer) {
    if (!buffer) {
        return;
    }
    let content = buffer.toString('utf8');
    if (!content) {
        return;
    }

    let contents = content.split('\n');

    let c;
    let images = [];
    for (let i = 1; i < contents.length; i++) {
        c = contents[i]
        if (/^size: \d+,\d+$/.test(c)) {
            images.push(contents[i-1]);
        }
    }

    return images.map((s) => {
        return Buffer.from(s, 'utf-8');
    });
}