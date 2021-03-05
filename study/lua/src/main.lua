function __G__TRACKBACK__(message)
    --
    local traceback = debug.traceback()
    local errors = "\nERROR: " .. message .. "\n"
    errors = errors .. ">>>>>>>>>>>>>>>>>>>>>>>>>>>\n"
    errors = errors .. traceback .. "\n"
    errors = errors .. "<<<<<<<<<<<<<<<<<<<<<<<<<<<\n"

    --
    local report = true
    if md5 then
        local key = md5.sum(errors)
        if g_report_key[key] == 1 then
            report = false
        else
            g_report_key[key] = 1
        end
    end

    --
    if report then
        -- print
        print(errors)
        
        --
        if G_GameAgent ~= nil then
            G_GameAgent:reportCrash(message, traceback)
        end

        -- show message box
        if APP_DEVELOP_MODE or (G_ConfigManager ~= nil and G_ConfigManager:isError()) then
            -- 
            local errorTip = "请将截图发送至相关人员！\n"
            if G_ConfigManager ~= nil then
                local tip = G_ConfigManager:getErrorTip()
                if tip ~= nil and tip ~= "" then
                    errorTip = tip .. "\n"
                end
            end
            MessageBox(errorTip .. errors)
        end
    end
end

function crashPrint(log, level, tag)
    print(log)
    if G_NativeAgent ~= nil then
        G_NativeAgent:crashLog(log, level, tag)
    end
end


g_report_key = {}
-- reload
g_package_loaded = {}
print("package.loaded-----------------------------")
for k, _ in pairs(package.loaded) do
    print(k)
    if k ~= "main.lua" then
        table.insert(g_package_loaded, k)
    end
end
print("package.loaded-----------------------------")
print("package.preload----------------------------")
for k, _ in pairs(package.preload) do
    print(k)
end
print("package.preload----------------------------")
g_G = {}
print("_G-----------------------------------------")
for k, _ in pairs(_G) do
    print(k)
    table.insert(g_G, k)
end
print("_G-----------------------------------------")


local fileUtils = cc.FileUtils:getInstance()
fileUtils:setPopupNotify(false)

require "config"

-- require developer
local status, ret = pcall(function ()
    require("app.develop.config")
end)
if not status then print(ret) end

require "cocos.init"
require "yoka.init"

cc.disable_global()

local function main()
    require("app.App"):create():run()
end

local status, msg = xpcall(main, __G__TRACKBACK__)
if not status then
    print(msg)
end