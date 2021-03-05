local BaseService = require("app.service.BaseService")
local ChapterDataService = class("ChapterDataService",BaseService)
local FunctionConst = require("app.const.FunctionConst")

function ChapterDataService:ctor()
    ChapterDataService.super.ctor(self)
    self:start()
end

function ChapterDataService:initData()

    self._signalCommonZeroNotice = G_SignalManager:add(SignalConst.EVENT_COMMON_ZERO_NOTICE, handler(self, self._onEventCommonZeroNotice))

    local UserDataHelper = require("app.utils.UserDataHelper")   
    local bossTime = G_ServerTime:secondsFromZero() +  UserDataHelper.getParameter(G_ParameterIDConst.DAILY_BOSS_TIME )
    G_ServiceManager:registerOneAlarmClock("DAILY_BOSS_TIME", bossTime, function()
        self:_requestBossInvadeData()
        G_SignalManager:dispatch(SignalConst.EVENT_CHAPTER_BOSS_INVADE_NOTICE)
    end)
end

function ChapterDataService:tick()
end

function ChapterDataService:clear()
     G_ServiceManager:DeleteOneAlarmClock("DAILY_BOSS_TIME")

    if self._signalCommonZeroNotice then
        self._signalCommonZeroNotice:remove()
	    self._signalCommonZeroNotice = nil
    end

end

function ChapterDataService:_requestBossInvadeData()
    logWarn("ChapterDataService DAILY_BOSS_TIME ")    
    local runningSceneName = display.getRunningScene():getName() 
    if  runningSceneName ~= "main" and runningSceneName ~= "chapter" and runningSceneName ~= "stage" then
        return
    end
    logWarn("ChapterDataService requestBossInvadeData "..runningSceneName)    
    --判断是否开启功能
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_ELITE_CHAPTER)
    if not isOpen then
        return
    end

    G_UserData:getChapter():c2sGetActDailyBoss()
end

--强敌来袭的消失刷新
function ChapterDataService:_onEventCommonZeroNotice(event,hour)
    self:_requestBossInvadeData()
    G_SignalManager:dispatch(SignalConst.EVENT_CHAPTER_BOSS_INVADE_NOTICE)
end

return ChapterDataService

