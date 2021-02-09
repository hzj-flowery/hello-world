-- @Author panhoa
-- @Date 7.15.2019
-- @Role 

local ListViewCellBase = require("app.ui.ListViewCellBase")
local EnemyListCell = class("EnemyListCell", ListViewCellBase)
local GuildCrossWarHelper = import(".GuildCrossWarHelper")
local TextHelper = require("app.utils.TextHelper")


function EnemyListCell:ctor()
    self._resourceNode = nil
    self._swordEffect  = nil
    self._nodeSword    = nil

    local resource = {
        file = Path.getCSB("EnemyListCell", "guildCrossWar"),
        binding = {
			_panelTouch = {
				events = {{event = "touch", method = "_onTouchCallBack"}}
            }
        }
    }
    EnemyListCell.super.ctor(self, resource)
end

function EnemyListCell:onCreate()
    local size = self._resourceNode:getContentSize()
    self:setContentSize(size)
    self._resourceNode:setVisible(false)
    self:_createSwordEft()
end

function EnemyListCell:_onTouchCallBack(sender,state)
	if(state == ccui.TouchEventType.ended) or not state then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
            self:dispatchCustomCallback(self._targetData)
		end
	end
end

function EnemyListCell:clearAnimation( ... )
    local node = self._resourceNode:getChildByName("_nodeSword")
    if node then
        local effect = node:getChildByName("shuangjian")
        if effect then
            effect:runAction(cc.RemoveSelf:create())
        end
        node:cleanup()
    end
end

function EnemyListCell:updateUI(data)
    self._targetData = {}
    self._resourceNode:setVisible(true)
    self:_humanVisible(data.objectType == 1)
    self:_updateName(data)
    self:_updateGuildFlag(data)
    self:_updateHP(data)
    if data.objectType == 1 then
        self._targetData = {type = data.type, id = data.cfg:getUid(), gridId = data.cfg:getCurGrid()}
    elseif data.objectType == 2 then
        self._targetData = {type = data.type, id = data.cfg:getKey_point_id()}
    elseif data.objectType == 3 then
        self._targetData = {type = data.type, id = data.cfg:getId()}
    end
end

function EnemyListCell:_humanVisible(bVisible)
    self["_textName"]:setVisible(bVisible)
    self["_textPower"]:setVisible(bVisible)
    self["_commonGuildFlag"]:setVisible(bVisible)
    self["_textCityName"]:setVisible(not bVisible)
    self["_textCityHpTitle"]:setVisible(not bVisible)
    self["_textBuildingHp"]:setVisible(not bVisible)
end

function EnemyListCell:_updateName(data)
    if data.objectType == 1 then 
        local offLevel = data.cfg:getOfficer_level() > 0 and 
                         data.cfg:getOfficer_level() or 1
        offLevel = offLevel > 10 and 10 or offLevel
        
        self["_textName"]:setString(data.cfg:getName())
        self["_textName"]:setColor(Colors.getGuildFlagColor(offLevel))
        self["_textPower"]:setString(TextHelper.getAmountText(data.cfg:getPower()))
    elseif data.objectType == 2 then
        local pointData = GuildCrossWarHelper.getWarCfg(data.cfg:getKey_point_id())
        local name = pointData.point_name or ""
        self["_textCityName"]:setString(name)
        self["_textCityHpTitle"]:setString(Lang.get("guild_cross_war_enemycell_hp2"))
    elseif data.objectType == 3 then
        self["_textCityHpTitle"]:setString(Lang.get("guild_cross_war_enemycell_hp3"))
        self["_textCityName"]:setString(data.cfg:getConfig().name)
    end
end

function EnemyListCell:_updateGuildFlag(data)
    if data.objectType == 1 then
        local guildLevel = data.cfg:getGuild_level() > 0 and data.cfg:getGuild_level() or 1
        self["_commonGuildFlag"]:updateUI(guildLevel, data.cfg:getGuild_name())
    end
end

function EnemyListCell:_createSwordEft()
	local EffectGfxNode = require("app.effect.EffectGfxNode")
	local function effectFunction(effect)
        if effect == "effect_shuangjian"then
            local subEffect = EffectGfxNode.new("effect_shuangjian")
            subEffect:play()
            return subEffect 
        end
    end
    self._nodeSword:removeAllChildren()
    local swordEffect = G_EffectGfxMgr:createPlayMovingGfx(self._nodeSword, "moving_shuangjian", effectFunction, nil, false)
	swordEffect:setPosition(0,0)
    swordEffect:setAnchorPoint(cc.p(0.5,0.5))
    swordEffect:setVisible(true)
    swordEffect:setName("shuangjian")
end

function EnemyListCell:_updateHP(data)
    if data.cfg:getMax_hp() == 0 or data.cfg:getHp() == 0 then
        return
    end 
    
    local curHp = TextHelper.getAmountText(data.cfg:getHp())
    if self["_colorProgress"]:getCurHp() == curHp then
        return
    end

    local percent =  math.floor(data.cfg:getHp() * 100/data.cfg:getMax_hp())
    self["_textBuildingHp"]:setString(percent .."%")
    self["_colorProgress"]:setPercent(percent, true, nil, {yellowPercent = 60, redPercent = 30, curHp = curHp})
    self["_colorProgress"]:setPositionX(data.objectType == 1 and 121 or 77)
end



return EnemyListCell