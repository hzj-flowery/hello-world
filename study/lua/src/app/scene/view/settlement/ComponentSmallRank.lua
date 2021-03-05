--掉落的线
local ComponentBase = require("app.scene.view.settlement.ComponentBase")
local ComponentSmallRank = class("ComponentSmallRank", ComponentBase)
local CSHelper  = require("yoka.utils.CSHelper")

function ComponentSmallRank:ctor(position, strRankName, oldRank, newRank, imageRes, defaultString)
    self:setPosition(position)
    ComponentSmallRank.super.ctor(self)
    self._strRankName = strRankName
    self._oldRank = oldRank
    self._newRank = newRank
    self._imageRes = imageRes
    self._defaultString = defaultString
    self._panel = nil
end

function ComponentSmallRank:start()
    ComponentSmallRank.super.start(self)
    self:_playAnim()
end

function ComponentSmallRank:_createRankPanel()
    local panel = CSHelper.loadResourceNode(Path.getCSB("PanelSmallRank", "settlement"))
    self._panel = panel
    local rankTitle = ccui.Helper:seekNodeByName(panel, "TextRankTitle")
    rankTitle:setString(self._strRankName)
    local oldRank = ccui.Helper:seekNodeByName(panel, "TextRankOld")
    if self._defaultString then
        oldRank:setString(self._defaultString) 
    end
    if self._oldRank ~= 0 then
        oldRank:setString(tostring(self._oldRank))
    end

    local newRank = ccui.Helper:seekNodeByName(panel, "TextRankNew")
    newRank:setString(tostring(self._newRank))

    local imageRes = ccui.Helper:seekNodeByName(panel, "ImageRes")
    imageRes:setVisible(false)
    if self._imageRes then 
        imageRes:loadTexture(self._imageRes)
        imageRes:setVisible(true)
        rankTitle:setPositionX(-45)
    end

    return panel
end

function ComponentSmallRank:setRankOldString(string)
    local oldRank = ccui.Helper:seekNodeByName(self._panel, "TextRankOld")
    oldRank:setString(string)
end

function ComponentSmallRank:_playAnim()
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        if effect == "win_exp" then   
            return self:_createRankPanel()
        end
    end 
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_win_exp", effectFunction, handler(self, self.checkEnd) , false )   
end

return ComponentSmallRank