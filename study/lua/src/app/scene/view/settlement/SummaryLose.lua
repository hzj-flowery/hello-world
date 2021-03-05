local SummaryLoseBase = require("app.scene.view.settlement.SummaryLoseBase")
local SummaryLose = class("SummaryLose", SummaryLoseBase)

local Path = require("app.utils.Path")

-- --普通副本结算
function SummaryLose:ctor(battleData, callback)
    self._battleData = battleData
    SummaryLose.super.ctor(self,battleData,callback)
end

function SummaryLose:onEnter()
    SummaryLose.super.onEnter(self)
    self:_createAnimation()
end

function SummaryLose:onExit()
    SummaryLose.super.onExit(self)
end

function SummaryLose:_createActionNode(effect)
    if effect == "fail_txt_tishengzhanli" then
        -- local txtSp = display.newSprite(Path.getSystemImage("txt_sys_promote01"))
        -- return txtSp
        local text = Lang.get("txt_sys_promote01")
        local fontColor = Colors.getSummaryLineColor()
        local label = cc.Label:createWithTTF(text, Path.getFontW8(), 24)
        label:setColor(fontColor)
        return label
    elseif effect == "fail_icon1" then
        return self:_createLoseNode(1)
    elseif effect == "fail_icon2" then
        return self:_createLoseNode(2)
    elseif effect == "fail_icon3" then
        return self:_createLoseNode(3)
    elseif effect == "fail_icon4" then
        return self:_createLoseNode(4)
    elseif effect == "shibai" then
        return self:_createLosePic()
    end
end

function SummaryLose:_createAnimation(rootNode)
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        if string.find(effect, "effect_") then
            local subEffect = EffectGfxNode.new(effect)
            subEffect:play()
            return subEffect
        else
            return self:_createActionNode(effect)    
        end
    end
    local function eventFunction(event)
        if event == "finish" then
            self:_createContinueNode()
        end
    end
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_fail_1", effectFunction, eventFunction , false )
end

return SummaryLose