local BaseService = require("app.service.BaseService")
local CustomActivityService = class("CustomActivityService",BaseService)
local UserDataHelper = require("app.utils.UserDataHelper")

function CustomActivityService:ctor()
    CustomActivityService.super.ctor(self)
    self:start()

    self._actShow = false
end

function CustomActivityService:tick()
    --场景检测
    local runningSceneName = display.getRunningScene():getName() 
    if  runningSceneName ~= "main" then
        return
    end

    --判断是否开启功能
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_ACTIVITY)
    if not isOpen then
        return
    end

   -- logWarn("------------CustomActivityService.tick")

    G_UserData:getTimeLimitActivity():checkTimeLimitActivityChange()
    
    local actShow =  G_UserData:getTimeLimitActivity():hasTimeLimitActivityCanVisible()
    if self._actShow ~= actShow then
        self._actShow = actShow 
        G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_ACTIVITY)
        print("------------------------------------------CustomActivityService:EVENT_MAIN_CITY_CHECK_BTNS")
    end
    --[[
    if actShow and self:isInModule() then
        if G_UserData:getCustomActivity():isExpired() then
            print("------------------------------------------CustomActivityService:expired")
            G_UserData:getCustomActivity():resetData() 
        end
    end
    ]]

     if self:isInModule() then
        if G_UserData:getCustomActivity():isExpired() then
            print("------------------------------------------CustomActivityService:expired")
            G_UserData:getCustomActivity():resetData() 
        end
    end
end



return CustomActivityService

