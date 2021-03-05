local BaseService = require("app.service.BaseService")
local Day7ActivityService = class("Day7ActivityService",BaseService)
local FunctionConst = require("app.const.FunctionConst")

function Day7ActivityService:ctor()
    Day7ActivityService.super.ctor(self)
    self:start()

    self._actShow = false
end

function Day7ActivityService:tick()
    --场景检测
    local runningSceneName = display.getRunningScene():getName() 
    if  runningSceneName ~= "main" then
        return
    end

    --判断是否开启功能
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_WEEK_ACTIVITY)
    if not isOpen then
        return
    end

    local actShow = G_UserData:getDay7Activity():isInActRewardTime()
    if self._actShow ~= actShow then
        self._actShow = actShow 
        G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_WEEK_ACTIVITY)
        print("------------------------------------------Day7ActivityService:EVENT_MAIN_CITY_CHECK_BTNS")
    end

    --logWarn("------------Day7ActivityService.tick")

    if G_UserData:getDay7Activity():isExpired() then
        G_UserData:getDay7Activity():resetData()
        print("------------------------------------------Day7ActivityService:expired")
       -- if not G_UserData:getDay7Activity():isInActRewardTime() then
       --     print("------------------------------------------Day7ActivityService:EVENT_MAIN_CITY_CHECK_BTNS")
      --      G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS)
      --  end
    end
   
end



return Day7ActivityService

