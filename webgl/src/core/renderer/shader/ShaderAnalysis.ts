export namespace ShaderAnalysis{
    export function fragment(targetStr:string){
            /**
             * 根据语法规则 每一个;都是一句代码，以此来拆分
             */
            let frgArr = targetStr.split(";");
            //删除所有注释
            frgArr.forEach((value, index) => {
              value = value.replace(/\/\/(.*.)\n/, "\n");
              value = value.replace(/\r\n/g,"");
              value = value.replace(/\n/g,"");
              if(index!=frgArr.length-1)
              frgArr[index] = value + ";";
            })
            let newFrag = "";
            frgArr.forEach((value) => {
              newFrag = newFrag + value;
            })
            targetStr = newFrag;
    }
}