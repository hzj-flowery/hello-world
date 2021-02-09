local PopupBase = require("app.ui.PopupBase")
local SummaryBase = class("SummaryBase", PopupBase)
local SchedulerHelper = require ("app.utils.SchedulerHelper")
local UIHelper = require("yoka.utils.UIHelper")
local CSHelper  = require("yoka.utils.CSHelper")

SummaryBase.NORMAL_FIX_X = 290

function SummaryBase:ctor(battleData, callback, componentList, midXPos, notShowBlack)
    self._callback = callback
    self._isStart = false
    self._isFinish = false
    self._componentList = componentList or {} --需要播放的组建，会在一条播完后自动播放下一条
    self._nowComponent = nil
    self._playIndex = 0
    self._scheduleHandler = nil
    self._levelUp = nil
    self._midXPos = midXPos or 0
    self._statisticsData = battleData.statisticsData
    self._winType = battleData.star

    self:setName("SummaryBase")
    SummaryBase.super.ctor(self, nil, nil, notShowBlack)
end

function SummaryBase:onCreate()
    for _, v in pairs(self._componentList) do
        self:addChild(v)
    end
    local size = G_ResolutionManager:getDesignCCSize()
    local params = {
        name = index,
        contentSize = size,
        anchorPoint = cc.p(0.5, 0.5),
        position = cc.p(0, 0)
    }
    self._panelFinish = UIHelper.createPanel(params)
    self._panelFinish:setTouchEnabled(false)
    self._panelFinish:setSwallowTouches(false)
    self._panelFinish:addTouchEventListener(handler(self,self._onTouchHandler))
    self:addChild(self._panelFinish)

end

function SummaryBase:onEnter()
    self._scheduleHandler = SchedulerHelper.newSchedule(handler(self, self.update), 1/30)
end

function SummaryBase:onExit()
    SchedulerHelper.cancelSchedule(self._scheduleHandler)
    self._scheduleHandler = nil
end

function SummaryBase:start()
    --先把list的zorder排个序
    for i = 1, #self._componentList do 
        self._componentList[i]:setLocalZOrder(i)
    end

    self._isStart = true
    self._isFinish = false 
    self._playIndex = 1
    self._nowComponent = nil
end

function SummaryBase:checkStart(event)
    if event == "play_begin" then
        self:start()
    end   
end

function SummaryBase:checkNextComponent()
    if not self._nowComponent then
        self._nowComponent = self._componentList[self._playIndex]
    end
end

function SummaryBase:addComponent(component)
    table.insert(self._componentList, component)
    self:addChild(component)
end

function SummaryBase:onFinish()
    self:_createContinueNode()
    self._isFinish = true
end

function SummaryBase:update(f)
    if not self._isStart or self._isFinish then
        return
    end
    if self._playIndex > #self._componentList then
        self:onFinish()
    else
        self:checkNextComponent()
        if self._nowComponent then
            if not self._nowComponent:isStart() then
                self._nowComponent:start()
            else
                self._nowComponent:update(f)
                if self._nowComponent:isFinish() then
                    self._nowComponent = nil
                    self._playIndex = self._playIndex + 1
                end
            end
        end
    end
end

function SummaryBase:_onTouchHandler(sender, event)
    if event == 2 then
        self:onClickPanel()
    end
end

function SummaryBase:_onStatisticsClick(sender, event)
    if event == 2 then
        local popupStatistics = require("app.scene.view.fight.PopupStatistics").new(self._statisticsData)
        popupStatistics:openWithAction()
    end
end

function SummaryBase:_onReplayClick(sender, event)
    if event == 2 then
        if G_UserData:getSeasonSport() then 
            G_UserData:getSeasonSport():setPlayReport(true)
        end
        G_SignalManager:dispatch(SignalConst.EVENT_BATTLE_REPLAY)
        self:close()
    end
end

function SummaryBase:isAnimEnd()
    return self._isFinish
end
function SummaryBase:doCallBack()
   if self._callback then
        self._callback()
   end
end

function SummaryBase:onClickPanel()
    logWarn("SummaryBase:onClickPanel")
    if not self._isFinish then
        return
    end
    local UserCheck = require("app.utils.logic.UserCheck")  
    self._levelUp = UserCheck.isLevelUp(self._callback)
    self._panelFinish:setTouchEnabled(false)
end

function SummaryBase:onTouchHandler(event, x, y)
    --重载屏蔽一些功能
end

function SummaryBase:_createContinueNode()
    local continueNode = CSHelper.loadResourceNode(Path.getCSB("CommonContinueNode", "common"))
    self:addChild(continueNode, 100)
    local height = math.min(640, display.height)
    continueNode:setPosition(cc.p(self._midXPos, 25 - height*0.5))
    self._panelFinish:setTouchEnabled(true)

    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local FunctionConst = require("app.const.FunctionConst")
    local open = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_FIGHT_STATISTICS)
    if open then
        local params = {
            name = "_imageLevel",
            texture = Path.getBattleRes("bth_tongji01"),
        }
        self._btnStatistics = UIHelper.createImage(params)
        self:addChild(self._btnStatistics)
        self._btnStatistics:setAnchorPoint(cc.p(0, 0))
        local x = G_ResolutionManager:getDesignCCSize().width/2
        self._btnStatistics:setPosition(cc.p(-x, -320))
        self._btnStatistics:setTouchEnabled(true)
        self._btnStatistics:addTouchEventListener(handler(self,self._onStatisticsClick))

        local spriteTongji = cc.Sprite:create(Path.getBattleFont("txt_tongji01"))
        self._btnStatistics:addChild(spriteTongji)
        spriteTongji:setPosition(cc.p(95, 20))
    end

    local open = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_FITHG_REPLAY)
    if open then
        local params = {
            name = "_imageLevel",
            texture = Path.getBattleRes("bth_huifang03"),
        }
        self._btnReplay = UIHelper.createImage(params)
        self:addChild(self._btnReplay)
        self._btnReplay:setAnchorPoint(cc.p(0, 0))
        local x = G_ResolutionManager:getDesignCCSize().width/2 - 150
        self._btnReplay:setPosition(cc.p(-x, -320))
        self._btnReplay:setTouchEnabled(true)
        self._btnReplay:addTouchEventListener(handler(self,self._onReplayClick))

        local spriteTongji = cc.Sprite:create(Path.getBattleFont("txt_huifang02"))
        self._btnReplay:addChild(spriteTongji)
        spriteTongji:setPosition(cc.p(40, 20))
    end
end

SummaryBase.PicLeft = 
{
    Path.getText("battle/txt_com_battle_v04"),
    Path.getText("battle/txt_com_battle_v01"),
    Path.getText("battle/txt_com_battle_v03"),
}
SummaryBase.PicRight =
{
    Path.getText("battle/txt_com_battle_v01"),
    Path.getText("battle/txt_com_battle_v02"),
    Path.getText("battle/txt_com_battle_v01"),
}

--根据胜利情况来显示碾压，胜利，险胜
function SummaryBase:_playWinText(effect)
    if effect == "left" then
        return display.newSprite(SummaryBase.PicLeft[self._winType])
    elseif effect == "right" then
        return display.newSprite(SummaryBase.PicRight[self._winType])
    end
end

return SummaryBase


