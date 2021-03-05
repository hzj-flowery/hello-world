--掉落的线
local ComponentBase = require("app.scene.view.settlement.ComponentBase")
local ComponentItemInfo = class("ComponentItemInfo", ComponentBase)

local CSHelper  = require("yoka.utils.CSHelper")

function ComponentItemInfo:ctor(item, position, critIndex, critValue)
    self:setPosition(position)
    ComponentItemInfo.super.ctor(self)
    self._item = item
    self._critIndex = critIndex
    self._critValue = critValue
end

function ComponentItemInfo:updateCrit(critIndex, critValue)
    self._critIndex = critIndex
    self._critValue = critValue    
end

function ComponentItemInfo:start()
    ComponentItemInfo.super.start(self)
    self:_playAnim()
end

function ComponentItemInfo:_playAnim()
    local resInfo = CSHelper.loadResourceNode(Path.getCSB("CommonResourceInfo", "common")) 
    resInfo:updateUI(self._item.type, self._item.value, self._item.size)
    resInfo:setTextColorToDTypeColor()
    resInfo:showResName(true)
    if self._critIndex then
        resInfo:updateCrit(self._critIndex, self._critValue)
    end

    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        if effect == "win_exp" then   
            return resInfo
        end
    end
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_win_exp", effectFunction, handler(self, self.checkEnd) , false )
end

return ComponentItemInfo