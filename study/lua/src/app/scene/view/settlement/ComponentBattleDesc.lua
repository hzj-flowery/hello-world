--竞技场战胜对手
local ComponentBase = require("app.scene.view.settlement.ComponentBase")
local ComponentBattleDesc = class("ComponentBattleDesc", ComponentBase)

local CSHelper  = require("yoka.utils.CSHelper")

ComponentBattleDesc.TYPE_NORMAL = 1 --普通战斗
ComponentBattleDesc.TYPE_REPORT = 2 --巅峰录像

function ComponentBattleDesc:ctor(battleData, position, type) 
    self._type = type or ComponentBattleDesc.TYPE_NORMAL
    self._battleData = battleData
    self:setPosition(position)
    ComponentBattleDesc.super.ctor(self)
end

function ComponentBattleDesc:start()
    ComponentBattleDesc.super.start(self)
    self:_createAnim()
end

function ComponentBattleDesc:_createCsbNode()
    local panel = CSHelper.loadResourceNode(Path.getCSB("PanelBattleDesc", "settlement"))
    self._playerName = ccui.Helper:seekNodeByName(panel, "PlayerName")
    self._textDesc = ccui.Helper:seekNodeByName(panel, "TextDesc")
    self._nodeDesc = ccui.Helper:seekNodeByName(panel, "NodeDesc")
    if self._type == ComponentBattleDesc.TYPE_NORMAL then
        self._playerName:setString(self._battleData.defenseName)
        if self._battleData.defenseOffLevel then
            self._playerName:setColor( Colors.getOfficialColor(self._battleData.defenseOffLevel) )
            require("yoka.utils.UIHelper").updateTextOfficialOutline(self._playerName, self._battleData.defenseOffLevel)
        end
        self._playerName:setVisible(true)
        self._textDesc:setVisible(true)
        self._nodeDesc:setVisible(false)
    elseif self._type == ComponentBattleDesc.TYPE_REPORT then
        self._playerName:setVisible(false)
        self._textDesc:setVisible(false)
        self:_setRichText(self._battleData)
    end
    
    return panel
end

function ComponentBattleDesc:_createAnim()
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        if effect == "pingjia" then
            local node = self:_createCsbNode()
            return node
        end
    end
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_win_pingjia", effectFunction, handler(self, self.checkEnd) , false )
end

function ComponentBattleDesc:_setRichText(battleData)
	self._nodeDesc:setVisible(true)

	local richText = Lang.get("lang_arena_battle_desc", 
    {
        player1 = battleData.attackName, 
        playerColor1 =  Colors.colorToNumber( Colors.getOfficialColor(battleData.attackLevel) ),
        playerOutColor1 = Colors.colorToNumber( Colors.getOfficialColorOutline(battleData.attackLevel) ),
        player2 =  battleData.defenseName, 
        playerColor2 =  Colors.colorToNumber( Colors.getOfficialColor(battleData.defenseLevel) ),
        playerOutColor2 =Colors.colorToNumber( Colors.getOfficialColorOutline(battleData.defenseLevel) ),
    })
    if self._battleData.isWin == false then
        richText = Lang.get("lang_arena_battle_desc",
        {
            player2 = battleData.attackName,
            playerColor2 = Colors.colorToNumber(Colors.getOfficialColor(battleData.attackLevel)),
            playerOutColor2 = Colors.colorToNumber(Colors.getOfficialColorOutline(battleData.attackLevel)),
            player1 = battleData.defenseName,
            playerColor1 = Colors.colorToNumber(Colors.getOfficialColor(battleData.defenseLevel)),
            playerOutColor1 = Colors.colorToNumber(Colors.getOfficialColorOutline(battleData.defenseLevel)),
        })
    end
    local widget = ccui.RichText:createWithContent(richText)
    self._nodeDesc:addChild(widget)
end

return ComponentBattleDesc
