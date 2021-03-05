--竞技场战胜对手
local ComponentBase = require("app.scene.view.settlement.ComponentBase")
local ComponentCampPlayers = class("ComponentCampPlayers", ComponentBase)

local CSHelper  = require("yoka.utils.CSHelper")

function ComponentCampPlayers:ctor(battleData, position) 
    self._battleData = battleData
    self:setPosition(position)
    ComponentCampPlayers.super.ctor(self)
end

function ComponentCampPlayers:start()
    ComponentCampPlayers.super.start(self)
    self:_createAnim()
end

function ComponentCampPlayers:_createCsbNode()
    local panel = CSHelper.loadResourceNode(Path.getCSB("PanelCampPlayers", "settlement"))
    self._playerLeft = ccui.Helper:seekNodeByName(panel, "PlayerLeft")
    self._playerRight = ccui.Helper:seekNodeByName(panel, "PlayerRight")
    self._imageLeft = ccui.Helper:seekNodeByName(panel, "ImageLeft")
    self._imageRight = ccui.Helper:seekNodeByName(panel, "ImageRight")

    self._playerLeft:setString(self._battleData.leftName)
    self._playerLeft:setColor(Colors.getOfficialColor(self._battleData.leftOfficer))
    self._playerRight:setString(self._battleData.rightName)
    self._playerRight:setColor(Colors.getOfficialColor(self._battleData.rightOfficer))
    if self._battleData.winPos == 1 then --左边赢
        self._imageLeft:loadTexture(Path.getTextSignet("txt_shengli01"))
        self._imageRight:loadTexture(Path.getTextSignet("txt_lose01"))
    else
        self._imageLeft:loadTexture(Path.getTextSignet("txt_lose01"))
        self._imageRight:loadTexture(Path.getTextSignet("txt_shengli01"))
    end
    return panel
end

function ComponentCampPlayers:_createAnim()
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        if effect == "pingjia" then
            local node = self:_createCsbNode()
            return node
        end
    end
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_win_pingjia", effectFunction, handler(self, self.checkEnd) , false )
end

return ComponentCampPlayers
