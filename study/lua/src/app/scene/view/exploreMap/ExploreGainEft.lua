--游历每走一步的经验，银两飘字
local ViewBase = require("app.ui.ViewBase")
local ExploreGainEft = class("ExploreGainEft", ViewBase)

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local CSHelper = require("yoka.utils.CSHelper")
local TextHelper = require("app.utils.TextHelper")
local UTF8 = require("app.utils.UTF8")
--奖励，暴击，回调
function ExploreGainEft:ctor()
    self._callback = nil
    self._awards = nil
    self._crit = nil
    self._isDouble = false

	ExploreGainEft.super.ctor(self)
end

function ExploreGainEft:onCreate()
end

function ExploreGainEft:onEnter()

end

function ExploreGainEft:onExit()
end

function ExploreGainEft:startEffect(awards, crit, callback, isDouble)
    -- 节日掉落

    local holidayAwards = {}
    for k, v in pairs(awards) do
        if v.type == 6 and v.value == 87 then
            table.insert(holidayAwards, v)
            table.remove(awards, k)
        end
    end
    self._holidayAwards = holidayAwards

    self._isDouble = isDouble

    self:_reset()
    self._callback = callback
    -- assert(self._callback, "call back must be non nil!!")
    self._awards = awards
    self._crit = crit
    self:_playAction()
end

function ExploreGainEft:_reset()
    self._callback = nil
    self._awards = nil
    self._crit = nil
    self:removeAllChildren()
end

--创建
function ExploreGainEft:_createResNode(reward)
    local gainNode = CSHelper.loadResourceNode(Path.getCSB("ExploreGainNode", "exploreMap"))
    local textValue = ccui.Helper:seekNodeByName(gainNode, "TextValue")
    local imageRes = ccui.Helper:seekNodeByName(gainNode, "ImageRes")
    local textRes = ccui.Helper:seekNodeByName(gainNode, "TextRes")
    local itemParams = TypeConvertHelper.convert(reward.type, reward.value)
    imageRes:loadTexture(itemParams.icon)
    local name = TextHelper.expandTextByLen(itemParams.name, 3)
    
    local imageDouble = ccui.Helper:seekNodeByName(gainNode, "Image_double")
    imageDouble:setVisible(self._isDouble)
    -- if UTF8.utf8len(itemParams.name) == 2 then
    --     --对齐 特殊处理
    --     local name = itemParams.name
    --     local name1 = UTF8.utf8sub(name, 1, 1) or ""
    --     local name2 = UTF8.utf8sub(name, 2, 2) or ""
    --     local realName = string.format("%s   %s", name1, name2)
    --     textRes:setString(realName)
    -- else
    --     textRes:setString(itemParams.name)
    -- end
	textRes:setString(name)
	textRes:setColor(Colors.getColorLight(itemParams.color))
	textRes:enableOutline(itemParams.icon_color_outline, 2)
    textValue:setString("+"..reward.size)
    return gainNode
end

--事件函数
function ExploreGainEft:_eftEventFunc(event)
    if event == "finish" and self._callback then
        if self._holidayAwards and #self._holidayAwards > 0 then
            G_Prompt:showAwards(self._holidayAwards)
        end
        self._callback()
    end
end

--获得暴击图案
function ExploreGainEft:_getImageCrit()
    local strImage = "img_txt_erbei"
    if self._crit == 4 then
        strImage = "img_txt_sibei"
    elseif self._crit == 8 then
        strImage = "img_txt_babei"
    end
    local image = Path.getExploreImage(strImage)
    return image
end

function ExploreGainEft:_createCritEft()
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        if string.find(effect, "baoji_") then
            local img = self:_getImageCrit()
            return display.newSprite(img)
        elseif effect == "exp" then
            return self:_createResNode(self._awards[2])
        elseif effect == "money" then
            return self:_createResNode(self._awards[3])
        elseif effect == "item" then
            return self:_createResNode(self._awards[1])
        end
    end
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_youli_baoji", effectFunction, handler(self, self._eftEventFunc), true )
end

function ExploreGainEft:_createNormalEft()
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        if effect == "exp" then
            return self:_createResNode(self._awards[2])
        elseif effect == "money" then
            return self:_createResNode(self._awards[3])
        elseif effect == "item" then
            return self:_createResNode(self._awards[1])
        end
    end
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_youli_txt", effectFunction, handler(self, self._eftEventFunc), true )
end

--播放动画
function ExploreGainEft:_playAction()
    if self._crit == 1 then   --没有暴击
        self:_createNormalEft()
    else                --有暴击
        self:_createCritEft()
    end
end

return ExploreGainEft
