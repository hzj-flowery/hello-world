
inputDir=./webgl/bin/res
outputDir=./webglServer

echo "拷贝到工作目录"
rm -rf ${outputDir}/res && mkdir -p ${outputDir}/res
cp -rf $inputDir $outputDir 
echo "拷贝结束"

#node ./webglServer/center/server.js

#echo "服务器已经开启"

#read p