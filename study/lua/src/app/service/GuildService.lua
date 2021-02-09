local BaseService = require("app.service.BaseService")
local GuildService = class("GuildService",BaseService)

function GuildService:ctor()
    GuildService.super.ctor(self)
    self._dungeonOpenState = nil
    self:start()
end

function GuildService:tick()
     --场景检测
    local runningSceneName = display.getRunningScene():getName() 
    if  runningSceneName ~= "guild" and runningSceneName ~= "main" then
        return
    end

    --判断是否开启功能
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_ARMY_GROUP)
    if not isOpen then
        return
    end

    self:_guildDungeonRedPointCheck()
end

function GuildService:_guildDungeonRedPointCheck()
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local openState = LogicCheckHelper.checkGuildDungeonInOpenTime(false) 
    if openState ~= self._dungeonOpenState then
        logWarn("GuildService: _guildDungeonRedPointCheck currstate "..tostring(self._dungeonOpenState).." oldstate "..tostring(openState))
        self._dungeonOpenState = openState
        G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_ARMY_GROUP)
    end
end

return GuildService

