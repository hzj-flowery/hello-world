-- --两个物品的弹出动画，用moving_win_exp * 2
local ComponentBase = require("app.scene.view.settlement.ComponentBase")
local ComponentTwoItems = class("ComponentTwoItems", ComponentBase)

local CSHelper  = require("yoka.utils.CSHelper")

function ComponentTwoItems:ctor(items, addReward, position, showOne)
    self:setPosition(position)
    self._AnimItemList = {}
    self._items = items
    self._addReward = addReward
    self._showOne = showOne
    ComponentTwoItems.super.ctor(self)
end

function ComponentTwoItems:start()
    ComponentTwoItems.super.start(self)
    self:_playAnim()
    if self._showOne then
        self:_showOneItem()
    end
end

function ComponentTwoItems:_playAnim()
    for i = 1, 2 do
        local reward = self._items[i]
        local addInfo = {}
        for _, v in pairs(self._addReward) do
            if v.award.type == reward.type and v.award.value == reward.value then
                addInfo.index = v.index
                addInfo.size = v.award.size
            end                
        end
        local effect = self:_createSingleItem(reward.type, reward.value, reward.size, addInfo.index, addInfo.size)
        table.insert(self._AnimItemList, effect)
    end    
    self._AnimItemList[1]:setPositionX(-145)
    self._AnimItemList[2]:setPositionX(0)
end

--仅显示一个物品
function ComponentTwoItems:_showOneItem()
    self._AnimItemList[1]:setPositionX(0)
    self._AnimItemList[2]:setVisible(false)
end

function ComponentTwoItems:_createSingleItem(type, value, size, critIndex, critValue)
    local resInfo = CSHelper.loadResourceNode(Path.getCSB("CommonResourceInfo", "common")) 
    resInfo:updateUI(type, value, size)
    resInfo:setTextColorToDTypeColor()
    if critIndex then
        resInfo:updateCrit(critIndex, critValue)
    end

    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        if effect == "win_exp" then   
            return resInfo
        end
    end

    local effect = G_EffectGfxMgr:createPlayMovingGfx( self, "moving_win_exp", effectFunction, handler(self, self.checkEnd) , false )
    return effect
end

return ComponentTwoItems
