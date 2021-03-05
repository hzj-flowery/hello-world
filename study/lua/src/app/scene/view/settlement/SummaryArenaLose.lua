local SummaryLoseBase = require("app.scene.view.settlement.SummaryLoseBase")
local SummaryArenaLose = class("SummaryArenaLose", SummaryLoseBase)

local CSHelper  = require("yoka.utils.CSHelper")
local Path = require("app.utils.Path")

--竞技场失败结算
function SummaryArenaLose:ctor(battleData, callback)
    self._battleData = battleData
    SummaryArenaLose.super.ctor(self,battleData,callback)
end

function SummaryArenaLose:onEnter()
    SummaryArenaLose.super.onEnter(self)
    self:_createAnimation()
end

function SummaryArenaLose:onExit()
    SummaryArenaLose.super.onExit(self)
end


function SummaryArenaLose:_createItemInfo(index)
    local reward = self._battleData.awards[index]
    assert(reward, "reward count is wrong")
    local resInfo = CSHelper.loadResourceNode(Path.getCSB("CommonResourceInfo", "common")) 
    resInfo:updateUI(reward.type, reward.value, reward.size)
    resInfo:setTextColorToDTypeColor()
    resInfo:showResName(true)
    for _, v in pairs(self._battleData.addAwards) do
        if v.award.type == reward.type and v.award.value == reward.value then
            resInfo:updateCrit(v.index, v.award.size)
            break
        end   
    end 
    return resInfo
end

function SummaryArenaLose:_createActionNode(effect)
    if effect == "fail_txt_tishengzhanli" then
        return self:_createText()
    elseif effect == "fail_icon1" then
        return self:_createLoseNode(1)
    elseif effect == "fail_icon2" then
        return self:_createLoseNode(2)
    elseif effect == "fail_icon3" then
        return self:_createLoseNode(3)
    elseif effect == "fail_icon4" then
        return self:_createLoseNode(4)
    elseif effect == "fail_txt_huode" then
        -- local txtSp = display.newSprite(Path.getSystemImage("txt_sys_reward02"))
        -- return txtSp
        return self:_createText("txt_sys_reward02")
    elseif effect == "moving_jwin_huode_1" then
        return self:_createItemInfo(1)
    elseif effect == "moving_jwin_huode_2" then
        return self:_createItemInfo(2)
    elseif effect == "shibai" then
        return self:_createLosePic()    
    end
end

function SummaryArenaLose:_createAnimation(rootNode)
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
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_jfail", effectFunction, eventFunction , false )
end

return SummaryArenaLose