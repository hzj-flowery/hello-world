const fs = require('fs')
const path = require('path');
const atlasParser = require('./atlasParser');

let srcDir = '/Users/fengqiang/Work/mingjiangzhuan/resources/spine075'

let jsons = fs.readdirSync(srcDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.substring(0, f.length - 5))

let output = 'dist';

var deleteFolderRecursive = function(path) {
    if( fs.existsSync(path) ) {
      fs.readdirSync(path).forEach(function(file,index){
        var curPath = path + "/" + file;
        if(fs.lstatSync(curPath).isDirectory()) { // recurse
          deleteFolderRecursive(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  };

if (fs.existsSync(output)) {
    deleteFolderRecursive(output);
}
fs.mkdirSync(output, {recursive: true});

function diff(p) {
    let resDir = '/assets/resources/';

    let relative = p.substring(p.indexOf(resDir) + resDir.length);

    let dist = path.join(output, relative);

    let spines = fs.readdirSync(p)
        .filter((f) => f.endsWith('.bin'))
        .map((f) => f.substring(0, f.length - 4))

    let spineSame = [];

    for (let i = spines.length - 1; i >=0; i--) {
        let s = spines[i];
        let index = jsons.indexOf(s);
        if (index > -1) {
            spines.splice(i, 1);
            jsons.splice(index, 1)
            spineSame.push(s);

            copyFile(s, dist);
        }
    }

    return {
        diff: spines,
        same: spineSame
    }
}

function copyFile(name, output) {
    let atlas = path.join(srcDir, name + '.atlas');
    let images = atlasParser(atlas);

    if (!fs.existsSync(output)) {
        fs.mkdirSync(output, {recursive: true});
    }

    for (let i = 0; i < images.length; i++) {
        let src = path.join(srcDir, images[i]);
        if (!fs.existsSync(src)) {
            return;
        }
    }

    images.forEach((f) => {
        let src = path.join(srcDir, f);
        fs.copyFile(src, path.join(output, f), (err) => {
            if (err) {
                throw err;
            }
        })
    })

    fs.copyFile(atlas, path.join(output, name + '.atlas'), (err) => {
        if (err) {
            throw err;
        }
    })

    fs.copyFile(path.join(srcDir, name + '.json'), path.join(output, name + '.json'), (err) => {
        if (err) {
            throw err;
        }
    })
}

let result = {};
result.spine = diff('/Users/fengqiang/Work/mingjiangzhuan/gitlab/main/assets/resources/spine')
result.fight = diff('/Users/fengqiang/Work/mingjiangzhuan/gitlab/main/assets/resources/fight/effect')
result.effect = diff('/Users/fengqiang/Work/mingjiangzhuan/gitlab/main/assets/resources/effect/spine')
result.jsons = jsons;

fs.writeFileSync(path.join(output, 'spine.json'), JSON.stringify(result, null, 4));