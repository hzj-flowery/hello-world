
local socket = require "socket"

local AutoReloadChangeFile = class("AutoReloadChangeFile")
local scheduler = require("cocos.framework.scheduler")

function AutoReloadChangeFile:ctor(  )
	-- body
    logWarn("-----------start udp----------------")
    local udp, err = socket.udp()
    if udp then
        udp:settimeout(0)
        udp:setsockname("127.0.0.1",2014)
    end
    self.autoCodeConn = udp
    scheduler.scheduleGlobal(handler(self, self._doAutoReLoad),0.5)
end

function AutoReloadChangeFile:_doAutoReLoad(  )
	-- body
	local filePathStr, client_address, client_port = self.autoCodeConn:receivefrom()
	if not filePathStr then
		return
	end
	local filePathArr = string.split(filePathStr, ";")
	for _,filePath in pairs(filePathArr) do
		xpcall(function()
	        if(filePath and #filePath > 0)then
	            --处理.lua后缀的文件
	            logWarn(string.format("--------------- auto reload : %s ---------------",filePath))
	            if(string.sub(filePath, -4) == ".lua") then
	                local luaFile = filePath
	                luaFile = string.gsub(luaFile, "\\", "%/")
	                luaFile = string.gsub(luaFile, ".*/src/", "")
	                luaFile = string.gsub(luaFile, "%/", "%.")
	                luaFile = string.gsub(luaFile, "%.lua$", "")

                    string.gsub(luaFile, "app%.scene%.view%.(%w*)%..*", function(sceneName)
                        local sceneInit = string.format("app.scene.view.%s.init", sceneName)
                		logWarn("doAutoReLoad -> " .. sceneInit)
                        package.loaded[string.format("app.scene.view.%s.init", sceneName)] = nil
                	end)


                    string.gsub(luaFile, "app%.lang%.(%w*)%..*", function(sceneName)
                        local sceneInit = string.format("app.scene.view.%s.init", sceneName)
                		logWarn("doAutoReLoad -> " .. sceneInit)
                        package.loaded[string.format("app.scene.view.%s.init", sceneName)] = nil
                	end)

	                logWarn("doAutoReLoad -> " .. luaFile)
	                package.loaded[luaFile] = nil

                    if luaFile == "app.lang.LangTemplate" then
                        logWarn("doAutoReLoad -> app.lang.Lang")
                        package.loaded["app.lang.Lang"] = nil
                        Lang = require("app.lang.Lang")
                    end
	            end
	        end
    	end, debug.traceback)
	end
	-- self.autoCodeConn:sendto("success", client_address, client_port)
end
return AutoReloadChangeFile
