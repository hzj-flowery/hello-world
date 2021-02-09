
local CommonColorProgress = class("CommonColorProgress")

local EXPORTED_METHODS = {
    "setPercent",
    "getCurHp"
}

function CommonColorProgress:ctor()
	self._target = nil
    self._barGreen = nil
    self._barYellow = nil
    self._barRed = nil
    --self._imageArmyIcon = nil
    self._textPercent = nil
    self._curHp = 0
end

function CommonColorProgress:_init()
    self._barGreen = ccui.Helper:seekNodeByName(self._target, "BarGreen")
    self._barYellow = ccui.Helper:seekNodeByName(self._target, "BarYellow")
    self._barRed = ccui.Helper:seekNodeByName(self._target, "BarRed")
    --self._imageArmyIcon = ccui.Helper:seekNodeByName(self._target, "ImageArmyIcon")
    self._textPercent = ccui.Helper:seekNodeByName(self._target, "TextPercent")

    self._barGreen:setVisible(false)
    self._barYellow:setVisible(false)
    self._barRed:setVisible(false)
    --self._imageArmyIcon:setVisible(false)
end

function CommonColorProgress:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonColorProgress:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonColorProgress:getCurHp( ... )
   return self._curHp
end

function CommonColorProgress:setPercent(percent,showText,needTotal, percentsCustom)
    local yellowPercent, redPercent = 75, 25
    local curHp = nil
    if percentsCustom then
        yellowPercent = percentsCustom.yellowPercent
        redPercent = percentsCustom.redPercent
        curHp = percentsCustom.curHp
    end
    self._barGreen:setVisible(false)
    self._barYellow:setVisible(false)
    self._barRed:setVisible(false)
    local bar = self._barGreen
    if percent > redPercent and percent <= yellowPercent then 
        bar = self._barYellow
    elseif percent <= redPercent then 
        bar = self._barRed
    end
    bar:setVisible(true)
    bar:setPercent(percent)


    self._textPercent:setVisible(showText)
    if not showText then
        return
    end

    local strPercent = tostring(percent)
    if needTotal then 
        strPercent = strPercent.." / 100"
    end
    if curHp then
        self._curHp = curHp
        self._textPercent:setString(curHp)
    else
        self._textPercent:setString(strPercent)
    end
    local fontColor = Colors.getMinePercentColor(percent)
    self._textPercent:setColor(fontColor.color)
    self._textPercent:enableOutline(fontColor.outlineColor, 2)
end


return CommonColorProgress
