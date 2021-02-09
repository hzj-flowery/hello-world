local GrainCarBar = class("GrainCarBar")
local GrainCarConfigHelper = require("app.scene.view.grainCar.GrainCarConfigHelper")

function GrainCarBar:ctor(target)
    self._target = target
    self._barGreen = nil
    self._barYellow = nil
    self._barRed = nil
    self._textPercent = nil
    
    self:_init()
end

function GrainCarBar:_init()
    self._barBg = ccui.Helper:seekNodeByName(self._target, "ImageBarBG")
    self._barGreen = ccui.Helper:seekNodeByName(self._target, "BarGreen")
    self._barYellow = ccui.Helper:seekNodeByName(self._target, "BarYellow")
    self._barRed = ccui.Helper:seekNodeByName(self._target, "BarRed")
    self._textPercent = ccui.Helper:seekNodeByName(self._target, "TextPercent")

    self._barGreen:setVisible(false)
    self._barYellow:setVisible(false)
    self._barRed:setVisible(false)
end

function GrainCarBar:updateBarWithCarUnit(carUnit)
    self._barGreen:setVisible(false)
    self._barYellow:setVisible(false)
    self._barRed:setVisible(false)
    local bar = self._barGreen

    local curStamina = carUnit:getStamina()
    local grainCarConfig = carUnit:getConfig()
    local maxValue = grainCarConfig.stamina
    
    if curStamina > (maxValue * 0.25) and curStamina <= (0.75 * maxValue) then 
        bar = self._barYellow
    elseif curStamina <= (0.25 * maxValue) then 
        bar = self._barRed
    end
    bar:setVisible(true)
    bar:setPercent(curStamina/maxValue * 100)

    local strPercent = tostring(curStamina)
    strPercent = strPercent.." / " ..tostring(maxValue)
    
    self._textPercent:setString(strPercent)
    local fontColor = Colors.getMinePercentColor(math.ceil(curStamina / maxValue * 100))
    self._textPercent:setColor(fontColor.color)
    self._textPercent:enableOutline(fontColor.outlineColor, 2)
end

function GrainCarBar:updateBarWithValue(curValue, maxValue)
    self._barGreen:setVisible(false)
    self._barYellow:setVisible(false)
    self._barRed:setVisible(false)
    local bar = self._barGreen
       
    if curValue > (maxValue * 0.25) and curValue <= (0.75 * maxValue) then 
        bar = self._barYellow
    elseif curValue <= (0.25 * maxValue) then 
        bar = self._barRed
    end
    bar:setVisible(true)
    bar:setPercent(curValue/maxValue * 100)

    local strPercent = tostring(curValue)
    strPercent = strPercent.." / " ..tostring(maxValue)
    
    self._textPercent:setString(strPercent)
    local fontColor = Colors.getMinePercentColor(math.ceil(curValue / maxValue * 100))
    self._textPercent:setColor(fontColor.color)
    self._textPercent:enableOutline(fontColor.outlineColor, 2)
end

--压扁模式
function GrainCarBar:setSmallMode()
    self._textPercent:setVisible(false)
    self._barBg:setScaleY(0.2)
    self._barGreen:setScaleY(0.2)
    self._barYellow:setScaleY(0.2)
    self._barRed:setScaleY(0.2)
end

function GrainCarBar:showPercentText(bShow)
    self._textPercent:setVisible(bShow)
end

return GrainCarBar