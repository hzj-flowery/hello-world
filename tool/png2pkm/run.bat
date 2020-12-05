
@echo off



set /p searchDir=please input png dictionary: 
set /p outputDir=please out pkm dictionary: 

set workPath=D:\softwareDir\mailTextureCompressTools\bin
cd /d %workPath%

set pkmFolerExtName=__pkm

::清空输出文件夹内容
for /d /r %outputDir% %%t in (*) do (
	::删除掉文件夹里的所有内容包括文件夹本身
	rd /s /q %%t
	)
for /d /r %searchDir% %%t in (*%pkmFolerExtName%) do (
	::删除掉文件夹里的所有内容包括文件夹本身
	rd /s /q %%t
	)


setlocal enabledelayedexpansion

call:myGetFunc %searchDir%

for /d /r %searchDir% %%j in (*) do ( 
	@echo %%j 
	call:myGetFunc %%j
	)

::移动刚刚生成的pkm到指定的文件夹中
@echo start banyun
for /d /r %searchDir% %%t in (*%pkmFolerExtName%) do (
	set str=%%t
	set "target=!str:%searchDir%=%outputDir%!"
	set "target=!target:%pkmFolerExtName%=!"
	::加上一个文件夹后缀 表示这是文件夹，不然dos会在界面询问你
	set ext=\
	set target=!target!!ext!
	xcopy !str! !target! /s /e
	)
@echo start delete all pkm
for /d /r %searchDir% %%t in (*%pkmFolerExtName%) do (
	::删除掉文件夹里的所有内容包括文件夹本身
	rd /s /q %%t
	)

set lastFolder=%searchDir%%pkmFolerExtName%
if exist !lastFolder! (
	xcopy %lastFolder% %outputDir% /s /e /y
    rd %lastFolder% /s /q
    echo exit folder
	) ELSE echo not exist folder


echo.&pause&goto:eof



::--------------------------------------------------------
::-- Function section starts below here
::--------------------------------------------------------
:myGetFunc    - passing a variable by reference
SETLOCAL
@echo start getList
@echo %~1
set  a=%~1
@echo %a%

@echo %a:~-1,1%
@echo %a:~nI%

DIR %a% /B >list.txt

for /f "delims=[" %%i in (list.txt) do (
echo chuli  %%i
set readFileFolder=%a%/%%i
set writeFileFolder=%a%%pkmFolerExtName%
set res=%a%/%%i
set extName=!res:~-4!
set targetExtName=.png
set targetExtName1=.jpg
echo compare !extName! !targetExtName! !targetExtName1!
if !targetExtName! == !extName! (etcpack.exe !readFileFolder! !writeFileFolder! -c etc1 -s fast -as -ext PNG) ELSE echo not compare png
) 
if !targetExtName1! == !extName! (etcpack.exe !readFileFolder! !writeFileFolder! -c etc1 -s fast -as -ext JPG) ELSE echo not compare jpg
)

@echo pkm successful make

del list.txt
ENDLOCAL
goto:eof