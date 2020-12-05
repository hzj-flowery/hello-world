var fs = require('fs');

//读取配置文件，变量config的类型是Object类型
function toLua(fileName) {
    console.log(fileName);
    var filePreName = fileName.split('.')[0]
    var config = require('./json/'+fileName);
    var fileData = "local data = {}";
    //修改配置文件
    for(var i=0; i<config.length; i++){
        var item = config[i];
        var index= i+1;
        fileData += "\r\n";

        var keyIndex = 0;
        for(var key in item){//遍历json对象的每个key/value对,p为key
            //console.log(key + " " + item[key]);
            var value = item[key];
            if(keyIndex == 0){
                if (parseFloat(value).toString() == "NaN"){
                    fileData += "data[\""+value+"\"] =";
                }else{
                    fileData += "data["+value+"] =";
                }
                fileData += "\r\n";
                fileData += "{";
            }
            fileData += "\r\n";
            fileData += "  "+key+" = ";
            if(value == null){
                fileData += "nil,";
            }else{
                var content = JSON.stringify(value);
                //console.log(key + " " + content);
                content = content.replace(/\[/g, "{");
                content = content.replace(/\]/g, "}");
                fileData += content+",";
            }
            keyIndex++;
        }
        fileData += "\r\n";
        fileData += "}";
    }

    fileData += "\r\n";
    fileData += "return data";

    //将修改后的内容写入文件
    fs.writeFile('./lua/'+filePreName+'.lua', fileData, function(err) {
    if (err) {
        console.error(err);
    }else{
        console.log('----------修改成功-------------');
    }
        
    });
}

var files = fs.readdirSync('./json/');
for(var i=0; i<files.length; i++){
    var fileName = files[i];
    //console.log(files[i]);
    toLua(fileName);
}
