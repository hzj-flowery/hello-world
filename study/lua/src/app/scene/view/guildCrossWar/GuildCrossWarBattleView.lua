local ViewBase = require("app.ui.ViewBase")
local GuildCrossWarBattleView = class("GuildCrossWarBattleView", ViewBase)
local GuildCrossWarBattleMapNode = import(".GuildCrossWarBattleMapNode")
local GuildCrossWarConst = require("app.const.GuildCrossWarConst")
local GuildCrossWarHelper = import(".GuildCrossWarHelper")
local GuildWarCountdownNode = require("app.scene.view.guildwarbattle.GuildWarCountdownNode")


-- @Role    
function GuildCrossWarBattleView:waitEnterMsg(callBack)
    local function onMsgCallBack(id, message)        
        callBack()
	end
    
    local region = GuildCrossWarHelper.getCurActStage()
    local bAct, bJoin = GuildCrossWarHelper.isGuildCrossWarEntry()

    if region.stage == 3 then
        if bJoin then
            G_UserData:getGuildCrossWar():c2sBrawlGuildsEntry()
        else
            G_UserData:getGuildCrossWar():c2sBrawlGuildsObserve()
        end
    elseif region.stage <= 2 then
        G_UserData:getGuildCrossWar():c2sBrawlGuildsMap()
    elseif region.stage == 4 then
        G_UserData:getGuildCrossWar():c2sBrawlGuildsPushChampion()
    elseif region.stage == 5 then
        G_Prompt:showTip(Lang.get("guild_cross_war_notopen"))
        return
    end

    if region.stage == 3 then
        if bJoin then
            return G_SignalManager:add(SignalConst.EVENT_GUILDCROSS_WAR_ENTRY, onMsgCallBack)
        else
            return G_SignalManager:add(SignalConst.EVENT_GUILDCROSS_WAR_OBSERVE, onMsgCallBack)
        end
    elseif region.stage <= 2 then
        return G_SignalManager:add(SignalConst.EVENT_GUILDCROSS_WAR_INSPIRE, onMsgCallBack)
    elseif region.stage == 4 then
        return G_SignalManager:add(SignalConst.EVENT_GUILDCROSS_WAR_CHAMPTION, onMsgCallBack) 
    end
end

function GuildCrossWarBattleView:ctor()
    self._delayUpdate = 0
    self._nodeReadyCountdown = nil
    self._GuildWarCountdownNode = nil
    
    local resource = {
        file = Path.getCSB("GuildCrossWarBattleView", "guildCrossWar"),
        size = G_ResolutionManager:getDesignSize(),
    }
    self:setName("GuildCrossWarBattleView")
    GuildCrossWarBattleView.super.ctor(self, resource)
end

function GuildCrossWarBattleView:onCreate()
    local mapNode = GuildCrossWarBattleMapNode.new()    
    self._battleMapNode = mapNode
    self._mapNode:addChild(mapNode)
    
    self:_initTopBar()
end

function GuildCrossWarBattleView:_initTopBar()
    self._topbarBase:setImageTitle("img_sys_cross_war_kuangfujuntuanzhan")
    local TopBarStyleConst = require("app.const.TopBarStyleConst")
    self._topbarBase:updateUI(TopBarStyleConst.STYLE_SEASONSPORT)
    self._commonHelp:addClickEventListenerEx(handler(self, self._onClickHelp))
    self._topbarBase:setCallBackOnBack(handler(self, self._onReturnBack))
end

function GuildCrossWarBattleView:_onReturnBack()
    if self._battleMapNode:isPlayingWarring() then
        return
    end
    
    if self._battleMapNode:isPopSmall() then
        --return
    end
    G_SceneManager:popScene()
    G_UserData:getGuildCrossWar():c2sBrawlGuildsExit()
end

function GuildCrossWarBattleView:_onClickHelp(sender)
    local UIPopupHelper = require("app.utils.UIPopupHelper")
	UIPopupHelper.popupHelpInfo(FunctionConst.FUNC_GUILD_CROSS_WAR)
end

function GuildCrossWarBattleView:onEnter()
    self._signalEnter= G_SignalManager:add(SignalConst.EVENT_GUILDCROSS_WAR_ENTRY, handler(self, self._onEventEnter))  
    self._signalExit = G_SignalManager:add(SignalConst.EVENT_GUILDCROSS_WAR_EXIT, handler(self, self._onEventExit))         -- 退出
    
    self:scheduleUpdateWithPriorityLua(handler(self, self._onUpdate), 0)
    self:_checkCountDown()
end

function GuildCrossWarBattleView:onExit()
    self:_removeCountDown()
    self:unscheduleUpdate()

    self._signalEnter:remove()
    self._signalEnter = nil
    self._signalExit:remove()
    self._signalExit = nil
end

function GuildCrossWarBattleView:_onEventEnter( ... )
    self:_checkCountDown()
end

function GuildCrossWarBattleView:_onEventExit( ... )
    self:_onReturnBack()
end

-- @Role    Update
function GuildCrossWarBattleView:_onUpdate(dt)
    self._battleMapNode:update(dt)
    self._delayUpdate = (self._delayUpdate + dt)
    if self._delayUpdate >= 2 then
        self._delayUpdate = 0
        self._battleMapNode:updateInterval2(dt)
    end    
end

-- @Role    Ready CountDown
function GuildCrossWarBattleView:_checkCountDown()
    self._nodeReadyCountdown:removeAllChildren()
    local _, bOpenToday = GuildCrossWarHelper.isTodayOpen()
    if not bOpenToday then
        return
    end

    local timeData = GuildCrossWarHelper.getConfigTimeRegion()
	local curTime = G_ServerTime:getTime()
    if curTime >= timeData.startTime and curTime < timeData.readyEndTime then
        if self._GuildWarCountdownNode == nil then
            local node = GuildWarCountdownNode.new()
            self._GuildWarCountdownNode = node
            self._nodeReadyCountdown:addChild(node)
            self._GuildWarCountdownNode:startCountdown(timeData.readyEndTime, function( ... )
                -- body
                --self._battleMapNode:updateCanMoveGrids()
            end)
        end

        if self._GuildWarCountdownNode:isRunning() == false then
            self._GuildWarCountdownNode:startCountdown(timeData.readyEndTime, function( ... )
                -- body
                --self._battleMapNode:updateCanMoveGrids()
            end)
        end   
    end
end

function GuildCrossWarBattleView:_removeCountDown()
    self._nodeReadyCountdown:removeAllChildren()
end


return GuildCrossWarBattleView
