local MineReportBarNode = class("MineReportBarNode")

function MineReportBarNode:ctor(target)
    self._target = target
    self._barGreen = nil
    self._barYellow = nil
    self._barRed = nil
    self._textArmy = nil
    self._nodeText = nil
    self._nodeText2 = nil
    
    self:_init()
end

function MineReportBarNode:_init()
    self._barGreen = ccui.Helper:seekNodeByName(self._target, "BarGreen")
    self._barYellow = ccui.Helper:seekNodeByName(self._target, "BarYellow")
    self._barRed = ccui.Helper:seekNodeByName(self._target, "BarRed")
    self._textArmy = ccui.Helper:seekNodeByName(self._target, "TextArmy")
    self._nodeText = ccui.Helper:seekNodeByName(self._target, "NodeText")
    self._nodeText2 = ccui.Helper:seekNodeByName(self._target, "NodeText2")

    self._barGreen:setVisible(false)
    self._barYellow:setVisible(false)
    self._barRed:setVisible(false)
end

function MineReportBarNode:updateUI(army, redArmy, needTurnBack, isPrivilege, infame)
    self:_setArmy(army, isPrivilege)
    self:_setRedArmy(redArmy)
    self:_turnBack(needTurnBack)  
    if infame then
        self:_setInfame(infame)
    end
end

function MineReportBarNode:_setArmy(army, isPrivilege)
    self._barGreen:setVisible(false)
    self._barYellow:setVisible(false)
    self._barRed:setVisible(false)
    self._textArmy:setString(army)
    local bar = self._barGreen

    army = isPrivilege and (army / 200 * 100) or army
    if army > 25 and army <= 75 then 
        bar = self._barYellow
    elseif army <= 25 then 
        bar = self._barRed
    end

    bar:setVisible(true)
    bar:setPercent(army)
    local fontColor = Colors.getMinePercentColor(army)
    self._textArmy:setColor(fontColor.color)
    self._textArmy:enableOutline(fontColor.outlineColor, 2)
end

function MineReportBarNode:_setRedArmy(redArmy)
    self._nodeText:removeAllChildren()
    local text = ccui.RichText:createWithContent(Lang.get("mine_report_red_army", {count = redArmy}))
    text:setAnchorPoint(cc.p(0, 0))
    self._nodeText:addChild(text)
end

function MineReportBarNode:_setInfame(infame)
    self._nodeText2:removeAllChildren()
    if  infame == 0 then
        return
    end

    local langKey = ""
    if infame > 0 then
        langKey = "mine_report_infame_add"
    else
        infame = -infame 
        langKey = "mine_report_infame_reduce"
    end
    local text = ccui.RichText:createWithContent(Lang.get(langKey, {count = infame}))
    text:setAnchorPoint(cc.p(0, 0))
    self._nodeText2:addChild(text)
end

function MineReportBarNode:_turnBack(needTurn)
    local scaleX = 1
    self._nodeText:setPositionX(-76)
    self._nodeText2:setPositionX(-76)
    if needTurn then 
        scaleX = -1
        self._nodeText:setPositionX(-50)
        self._nodeText2:setPositionX(-50)
    end
    self._barGreen:setScale(scaleX)
    self._barYellow:setScale(scaleX)
    self._barRed:setScale(scaleX)
end

return MineReportBarNode