--
local LOG_COLOR = {
    INTESITY_WHITE =1, --加强白色
    RED = 2,
    YELLOW = 3,
    GREEN = 4,
    BLUE = 5,
    PURPLE =6, --紫色
}
--日志记录系统
--cc.exports.G_DebugSystem = require("app.scene.view.uicontrol.UIDebugSystem").new()
--
-- local old_dump_print = dump_print
-- dump_print = function(colorType, ...)
--     old_dump_print(colorType,...)
--     G_DebugSystem:pushLog(colorType, ...)
-- end

logWarn = function(...)
    dump_print(LOG_COLOR.YELLOW,...)
end

--
logDebug = function(...)
    dump_print(LOG_COLOR.PURPLE,...)
end

--
logError = function(...)
    dump_print(LOG_COLOR.RED,...)
end

logNewT = function( str )
    dump_print(LOG_COLOR.BLUE,"[TutorialLog]"..str)
end

-- 打开检查node节点引用计数
if ENABLE_RECORD_REF_COUNT then
    if YouKaRecordRef and YouKaRecordRef.setEnabled then
        YouKaRecordRef:setEnabled(true)
    end
end

if ENABLE_LUA_AUTO_RELOAD then
    -- cc.FileUtils:getInstance():addSearchPath("../../publish/xgame/frameworks/cocos2d-x/external/lua/luasocket/script")
    print("===================sss=========")
    local AutoReload = require("app.develop.autoReload")
    AutoReload.new()
end

-- 原生平台
cc.exports.G_NativeAgent 			= require("app.develop.NativeAgentDevelop").new()

--打开lua文件重加载功能，方便代码编写测试
--[[
local function replaceRequire()
    local OLD_REQUIRE = require
    cc.enable_global( function()
        SAVE_LIST = {}
    end)

    local function saveOldRequire()
        for k, _ in pairs(package.loaded) do
            SAVE_LIST = k
        end
    end
    local function newRequire(key)
        if not SAVE_LIST[key] then
            package.loaded[key] = nil
            return OLD_REQUIRE(key)
        end
        return OLD_REQUIRE(k)
    end
    saveOldRequire()
    require = newRequire
end
replaceRequire()
]]

--
local name = G_NativeAgent.callStaticFunction("getDeviceModel", nil, "string")
local device = require("app.config.device")
local cfg = device.get(name)
if cfg ~= nil then
    local s = cc.Sprite:create("mask/" .. cfg.mask)
    if s then
        G_TopLevelNode:addChild(s,100000)
        s:setPosition(display.center)
    end
end



