local PopupBase = require("app.ui.PopupBase")
local SummaryBase = require("app.scene.view.settlement.SummaryBase")
local SummaryLoseBase = class("SummaryLoseBase", PopupBase)

local CSHelper  = require("yoka.utils.CSHelper")
local AnimationConst = require("app.const.AnimationConst")

local Path = require("app.utils.Path")
local FunctionStrengthen = require("app.config.function_strengthen")
local FunctionLevel = require("app.config.function_level")
local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
local UIHelper = require("yoka.utils.UIHelper")


--普通副本结算
function SummaryLoseBase:ctor(battleData, callback)
    self._panelFinish = nil
    self._powerUpBtns = {}
    self._functionIds = {}
    self:_getStrengthenFunc()
    -- self._view = view
    self._callback = callback
    self._statisticsData = battleData.statisticsData
    self._loseType = battleData.loseType     --1惜败, 2其他
    SummaryLoseBase.super.ctor(self, nil, nil, true)
end

function SummaryLoseBase:onCreate()
    local params = {
        name = index,
        contentSize = G_ResolutionManager:getDesignCCSize(),
        anchorPoint = cc.p(0.5, 0.5),
        position = cc.p(0, 0)
    }
    self._panelFinish = UIHelper.createPanel(params)
    self._panelFinish:setTouchEnabled(false)
    self._panelFinish:setSwallowTouches(true)
    self._panelFinish:addTouchEventListener(handler(self,self._onTouchHandler))
    self:addChild(self._panelFinish)
end

function SummaryLoseBase:onEnter()
end

function SummaryLoseBase:onExit()
end

function SummaryLoseBase:_getStrengthenFunc()
    local count = FunctionStrengthen.length()
    for i = 1, count do
        local tblFunction = FunctionStrengthen.indexOf(i)
        local myLevel = G_UserData:getBase():getLevel()
        if myLevel >= tblFunction.level_min and myLevel <= tblFunction.level_max then
            for i = 1, 4 do
                local funcId = tblFunction["function_"..i]
                table.insert(self._functionIds, funcId)
            end
            break
        end
    end 
end

function SummaryLoseBase:_createLoseNode(index)
    local node = CSHelper.loadResourceNode(Path.getCSB("CommonPowerUpButton", "common"))
    local functionId = self._functionIds[index]
    local content = FunctionLevel.get(functionId)
    node:setIcon(Path.getCommonIcon("main",content.icon))
    node:setFuncName(content.name)
    node:setTouchFunc(handler(self, self._onBtnClick))
    table.insert(self._powerUpBtns, node)
    return node
end

function SummaryLoseBase:_createText(language)
    local lang = language or "txt_sys_promote01"
    local text = Lang.get(lang)
    local fontColor = Colors.getSummaryLineColor()
    local label = cc.Label:createWithTTF(text, Path.getFontW8(), 24)
    label:setColor(fontColor)
    return label
end

function SummaryLoseBase:_createContinueNode()
    local continueNode = CSHelper.loadResourceNode(Path.getCSB("CommonContinueNode", "common"))
    self:addChild(continueNode)
    local width = math.min(1136, display.width)
    local height = math.min(640, display.height)
    
    local midXPos = SummaryBase.NORMAL_FIX_X
    continueNode:setPosition(cc.p(-midXPos + 30, 25 - height*0.5))
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

function SummaryLoseBase:_onTouchHandler(sender, event )
    if event == 2 and self._callback then
        self._callback()
        self._callback = nil
    end
end

function SummaryLoseBase:_onBtnClick(sender)
    local index = 0
    for i = 1, 4 do
        if self._powerUpBtns[i]:getTouchNode() == sender then
            index = i 
            break
        end
    end
    if index ~= 0 then
        self:_gotoFunc(index)
    end
end

function SummaryLoseBase:_gotoFunc(index)
    local functionId = self._functionIds[index]
    local goToFunc,isLayer,isPop =  WayFuncDataHelper.getGotoFuncByFuncId(functionId,nil)		
    if(goToFunc == false)then return end
    if isLayer == false and type(goToFunc) == "function" then
        if self._callback then
            self._callback()
        end
        goToFunc()
    end   
end

SummaryLoseBase.LosePic = 
{
    Path.getText("battle/txt_com_battle_f02"),  
    Path.getText("battle/txt_com_battle_f01"),
}

function SummaryLoseBase:_createLosePic()
    local picPath = SummaryLoseBase.LosePic[self._loseType]
    return display.newSprite(picPath) 
end

function SummaryLoseBase:_onStatisticsClick(sender, event)
    if event == 2 then
        local popupStatistics = require("app.scene.view.fight.PopupStatistics").new(self._statisticsData)
        popupStatistics:openWithAction()
    end
end

function SummaryLoseBase:_onReplayClick(sender, event)
    if event == 2 then
        G_SignalManager:dispatch(SignalConst.EVENT_BATTLE_REPLAY)
        self:close()
    end
end

return SummaryLoseBase