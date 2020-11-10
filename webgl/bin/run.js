var canvas = document.getElementById('vs');
    var str = vs.text;
    var sp = str.split("\n");

    var searchAllSpace = function(search){
        var count = 0;
        for(var j = 0;j<search.length;j++)
            if(search[j]==" ")count++;
        return count<search.length?true:false

    }
    var result = [];
    for(var j = 0;j<sp.length;j++)
    {
        if(sp[j]!=" "&&sp[j]!="}"&&sp[j].indexOf("//")<0&&searchAllSpace(sp[j]))
        {
            // sp[j] = sp[j]+"+";
             console.log("'"+sp[j]+"'+");
             result.push("'"+sp[j]+"'+")
        }
    }

    var fs = require('fs');
    fs.writeFileSync("test.txt",result);
