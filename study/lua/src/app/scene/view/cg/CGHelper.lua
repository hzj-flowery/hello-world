local CGHelper = {}
local VideoConst = require("app.const.VideoConst")

function CGHelper.checkCG(isLoginUI)
    if not isLoginUI then
        if watchVideo then
            return false
        end
        local v = G_UserData:getUserSetting():getSettingValue("VideoVer")
        if v and v == VideoConst.videoVer then
            return false
        end
    end
    if not ccexp.VideoPlayer then
        return false
    end
    if not cc.FileUtils:getInstance():isFileExist("start.mp4") then
        return false
    end
    -- local targetPlatform = cc.Application:getInstance():getTargetPlatform()
    -- if targetPlatform == cc.PLATFORM_OS_IPHONE or targetPlatform == cc.PLATFORM_OS_IPAD then
    --     local osVersion = G_NativeAgent.callStaticFunction("getOSVersion", nil, "string")
    --     local versionArray = string.split(osVersion, ".")
    --     local osTypeBig = versionArray[1]
    --     if tonumber(osTypeBig) >= 13 then 
    --         return false
    --     end
    -- end
    return true
end

return CGHelper
