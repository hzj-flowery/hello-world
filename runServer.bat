
set inputDir="./webgl/bin/res"
set outputDir="./webglServer/res"
rd /s /q %outputDir%

md %outputDir%

xcopy %inputDir% /s /q /e %outputDir%

node ./webglServer/server.js
pause