let XLSX = require('./xlsx.core.min');

const fs = require('fs');
//操作路径
const path = require('path');

function doExport(file) {
    let fileData = fs.readFileSync(file);
    let wb = XLSX.read(fileData, { type: "buffer" });
    let sheetName = wb.SheetNames[0]
    let sheet = wb.Sheets[sheetName]
    let jsonArray = XLSX.utils.sheet_to_json(sheet);
    let str = JSON.stringify(jsonArray);

    let dest = file;
    dest = dest.replace('res_config', 'res_config_export');
    console.log(dest);
    let fileFloder = dest.split('\\');
    let targetFloder = "./"
    for(let i = 0;i<fileFloder.length-1;i++)
    {
        targetFloder = targetFloder + fileFloder[i];
        fs.exists(targetFloder, function(exists) {
              if(!exists)
              {
                   //创建文件夹
                    fs.mkdir(targetFloder, function (err) {
                      if(i==fileFloder.length-2)
                      {
                        fs.writeFileSync(dest + '.json', str, { encoding: 'utf8', mode: 438 /*=0666*/, flag: 'w' });
                         console.log("export config: " + dest);
                      }
                    });
              }
              else
             {
                if(i==fileFloder.length-2)
                {
                    fs.writeFileSync(dest + '.json', str, { encoding: 'utf8', mode: 438 /*=0666*/, flag: 'w' });
                    console.log("export config: " + dest);
                }
             }
          });

    }
}

function testReadFiles(filePath) {
    let state = fs.statSync(filePath);
    if (state.isFile()) {
        //是文件
        doExport(filePath);
    } else if (state.isDirectory()) {
        //是文件夹
        //先读取
        let files = fs.readdirSync(filePath);
        files.forEach(file => {
            console.log(path.join(filePath, file) + '，file')
            testReadFiles(path.join(filePath, file));
        });
    }
}


testReadFiles("./res_config");