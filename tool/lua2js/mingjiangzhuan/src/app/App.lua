local App = class("App")

function App:ctor()
    --
    math.randomseed(os.time())
	--
    require("app.ui.component.init")
	require("app.init")

    -- require developer
    local status, ret = pcall(function ()
        require("app.develop.init")
    end)
    if not status then print(ret) end

    -- import proto
    pbc.readFile("proto/cs.proto", "cs.proto")
end
    
--
function App:run()
    --cc.Director:getInstance():setDisplayStats(true)
    cc.Director:getInstance():setAnimationInterval(1/MAIN_FRAME_MAX)
    cc.Device:setKeepScreenOn(true)

    local CGHelper = require("app.scene.view.cg.CGHelper")
    if CGHelper.checkCG() then
        G_SceneManager:showScene("cg", "start.mp4")
    else
        local currentAppVersion = G_NativeAgent:getAppVersion()
        local Version = require("yoka.utils.Version")
        local r = Version.compare("2.1.5", currentAppVersion)
        if r ~= Version.CURRENT then 
            G_SceneManager:showScene("logo")
        else 
            G_SceneManager:showScene("login")
        end
    end
end

return App
