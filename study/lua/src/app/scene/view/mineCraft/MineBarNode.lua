local MineBarNode = class("MineBarNode")

function MineBarNode:ctor(target)
    self._target = target
    self._barGreen = nil
    self._barYellow = nil
    self._barRed = nil
    self._imageArmyIcon = nil
    self._textPercent = nil
    
    self:_init()
end

function MineBarNode:_init()
    self._barGreen = ccui.Helper:seekNodeByName(self._target, "BarGreen")
    self._barYellow = ccui.Helper:seekNodeByName(self._target, "BarYellow")
    self._barRed = ccui.Helper:seekNodeByName(self._target, "BarRed")
    self._imageArmyIcon = ccui.Helper:seekNodeByName(self._target, "ImageArmyIcon")
    self._textPercent = ccui.Helper:seekNodeByName(self._target, "TextPercent")

    self._barGreen:setVisible(false)
    self._barYellow:setVisible(false)
    self._barRed:setVisible(false)
    self._imageArmyIcon:setVisible(false)
end

function MineBarNode:showIcon(s)
    self._imageArmyIcon:setVisible(s)
end

function MineBarNode:setPercent(percent, needTotal, isPrivilege)
    isPrivilege = isPrivilege or false
    self._barGreen:setVisible(false)
    self._barYellow:setVisible(false)
    self._barRed:setVisible(false)
    local bar = self._barGreen

    local maxValue = tonumber(require("app.config.parameter").get(G_ParameterIDConst.TROOP_MAX).content)
    if isPrivilege then
        local MineCraftHelper = require("app.scene.view.mineCraft.MineCraftHelper")
        local soilderAdd  = MineCraftHelper.getParameterContent(G_ParameterIDConst.MINE_CRAFT_SOILDERADD)
        maxValue = (maxValue + soilderAdd)
    end
    if percent > (maxValue * 0.25) and percent <= (0.75 * maxValue) then 
        bar = self._barYellow
    elseif percent <= (0.25 * maxValue) then 
        bar = self._barRed
    end
    bar:setVisible(true)
    bar:setPercent(percent/maxValue * 100)

    local strPercent = tostring(percent)
    if needTotal then 
        strPercent = strPercent.." / " ..tostring(maxValue)
    end
    
    self._textPercent:setString(strPercent)
    local fontColor = Colors.getMinePercentColor(math.ceil(percent / maxValue * 100))
    self._textPercent:setColor(fontColor.color)
    self._textPercent:enableOutline(fontColor.outlineColor, 2)
end

return MineBarNode