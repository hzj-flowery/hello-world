local BaseService = require("app.service.BaseService")
local ActivityConst = require("app.const.ActivityConst")
local ActivityService = class("ActivityService",BaseService)

function ActivityService:ctor()
    ActivityService.super.ctor(self)
    self:start()
end

function ActivityService:tick()
     --场景检测
    local runningSceneName = display.getRunningScene():getName() 
    if  runningSceneName ~= "activity" then
        return
    end

    --判断是否开启功能
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_WELFARE)
    if not isOpen then
        return
    end

    --logWarn("------------ActivityService.tick")
    self:_dailySignTick()
    self:_eatVitTick()
    self:_monthCardTick()
    self:_luxuryGiftPackageTick()
    self:_moneyTreeTick()
    self:_weekGiftPackageTick()
end

--每日签到
function ActivityService:_dailySignTick()
    if G_UserData:getActivityDailySignin():isExpired() then
         print("------------------------------------------_dailySignTick:expired")
        G_UserData:getActivityDailySignin():resetData()
    end
end

--吃体力
function ActivityService:_eatVitTick()   
    if G_UserData:getActivityDinner():isExpired() then
       print("------------------------------------------_eatVitTick:expired")
       G_UserData:getActivityDinner():resetData()
    end

    if G_UserData:getActivityDinner():getCanEat() then
        print("------------------------------------------ActivityService:_eatVitTick can eat vit")
        G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_WELFARE,{actId = ActivityConst.ACT_ID_DINNER})
    end

end

--月卡
function ActivityService:_monthCardTick()
    if G_UserData:getActivityMonthCard():isExpired() then
        print("------------------------------------------_monthCardTick:expired")
        G_UserData:getActivityMonthCard():resetData()
    end
end


--豪华礼包
function ActivityService:_luxuryGiftPackageTick()
    if G_UserData:getActivityLuxuryGiftPkg():isExpired() then
       print("------------------------------------------_luxuryGiftPackageTick:expired")
        G_UserData:getActivityLuxuryGiftPkg():resetData()
    end
end

--摇钱树
function ActivityService:_moneyTreeTick()
    if G_UserData:getActivityMoneyTree():isExpired() then
         print("------------------------------------------_moneyTreeTick:expired")
        G_UserData:getActivityMoneyTree():resetData()
    end
end

--周礼包
function ActivityService:_weekGiftPackageTick()
    if G_UserData:getActivityWeeklyGiftPkg():isExpired() then
       print("------------------------------------------_weekGiftPackageTick:expired")
       G_UserData:getActivityWeeklyGiftPkg():resetData()
    end
end

return ActivityService

