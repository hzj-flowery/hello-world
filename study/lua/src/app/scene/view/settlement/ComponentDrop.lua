--掉落
local ComponentBase = require("app.scene.view.settlement.ComponentBase")
local ComponentDrop = class("ComponentDrop", ComponentBase)

local CSHelper  = require("yoka.utils.CSHelper")
local ComponentIconHelper = require("app.ui.component.ComponentIconHelper")
local DropHelper = require("app.utils.DropHelper")

ComponentDrop.ITEM_POS_5 = 
{
	-200, -100, 0, 100, 200,
}
ComponentDrop.ITEM_POS_4 = 
{
	-150, -50, 50, 150,
}
ComponentDrop.ITEM_POS_3 = 
{
	-100, 0, 100,
}
ComponentDrop.ITEM_POS_2 = 
{
	-50, 50,
}
ComponentDrop.ITEM_POS_1 = 
{
	0,
}

function ComponentDrop:ctor(drops, position, isDouble)
    self:setPosition(position)
    self._drops = DropHelper.sortDropList(drops) 
    self._isDouble = isDouble
    ComponentDrop.super.ctor(self)
end

function ComponentDrop:start()
    ComponentDrop.super.start(self)
    self:play()
end

function ComponentDrop:play()
    local delay = cc.DelayTime:create(0.1)
    local callFunc = {}
    for i = 1, #self._drops do
        local func = cc.CallFunc:create(function()
            self:_createSingleItem(self._drops[i].type, self._drops[i].value, self._drops[i].size, i)
        end )
        table.insert(callFunc, func)
    end
    local endFunc = cc.CallFunc:create(function() self:onFinish() end)
    local sequence = cc.Sequence:create(callFunc[1], delay, callFunc[2], delay, callFunc[3], delay, callFunc[4], endFunc)
    self:runAction(sequence)
end

function ComponentDrop:_createSingleItem(type, value, size, index)
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        if effect == "effect_iconflash" then
            local subEffect = EffectGfxNode.new("effect_iconflash")
            subEffect:play()
            return subEffect
        elseif effect == "win_equip_icon" then
            local icon = CSHelper.loadResourceNode(Path.getCSB("CommonIconTemplate", "common"))
            icon:initUI(type, value, size)
            icon:setScale(0.8)	
            icon:showDoubleTips(self._isDouble)
            icon:setTouchEnabled(false)
            return icon
        end
    end
    local effect = G_EffectGfxMgr:createPlayMovingGfx( self, "moving_win_icon", effectFunction, nil, false )
    local dropCount = #self._drops
    effect:setPositionX(ComponentDrop["ITEM_POS_"..dropCount][index])
end

return ComponentDrop