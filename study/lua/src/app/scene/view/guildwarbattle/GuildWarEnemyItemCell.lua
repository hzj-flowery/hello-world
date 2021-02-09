
local ListViewCellBase = require("app.ui.ListViewCellBase")
local GuildWarEnemyItemCell = class("GuildWarEnemyItemCell", ListViewCellBase)
local GuildWarUserBuffNode = require("app.scene.view.guildwarbattle.GuildWarUserBuffNode")

local HP_IMGS = {
	"img_war_member03e",
	"img_war_member03e",
	"img_war_member03e",
	"img_war_member03e",
	"img_war_member03e",
    "img_war_member03e",
    "img_war_member03d",
    "img_war_member03c",
    "img_war_member03b",
    "img_war_member03a",
}

function GuildWarEnemyItemCell:ctor()

	self._textName = nil
	self._textGuildName = nil
	self._textPower = nil
	--self._barGreen = nil
	self._panelTouch = nil
	self._nodeSword = nil

	self._warUserData = nil 
	self._colorProgress = nil

	self._textBuildingName = nil
	self._textBuildingHpTitle = nil
	self._textBuildingHp = nil

	self._cityId = nil
	self._config = nil


	local resource = {
		file = Path.getCSB("GuildWarEnemyItemCell", "guildwarbattle"),
		binding = {
			_panelTouch = {
				events = {{event = "touch", method = "_onTouchCallBack"}}
			}
		},
	}

	GuildWarEnemyItemCell.super.ctor(self, resource)
end

function GuildWarEnemyItemCell:onCreate()
    local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height + 3)
	self._panelTouch:setSwallowTouches(false)
	
	self._buffNode = GuildWarUserBuffNode.new()
	self._nodeBuff:addChild(self._buffNode)
	--self._barGreen:ignoreContentAdaptWithSize(true)
	self:showSword(true)
end

function GuildWarEnemyItemCell:_onItemClick(sender)
	local curSelectedPos = sender:getTag()
	--logWarn("GuildWarEnemyItemCell:_onIconClicked  "..curSelectedPos)
	self:dispatchCustomCallback(self._warUserData,self._config)
end


function GuildWarEnemyItemCell:_onTouchCallBack(sender,state)
	-----------防止拖动的时候触发点击
	if(state == ccui.TouchEventType.ended) or not state then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
			self:_onItemClick(sender)
		end
	end

end


function GuildWarEnemyItemCell:updateUI(warUserData)
	self._warUserData = warUserData 
	self._config = nil

	self:_updateHeroPower()
	self:_updateHeroName()
	self:_updateGuildFlag()
	self:_updateHp()
	self:_updateBuff()
	self:_visibleBuilding(false)
end


function GuildWarEnemyItemCell:_updateHeroPower()
	local TextHelper = require("app.utils.TextHelper")
	local sizeText = TextHelper.getAmountText(self._warUserData:getPower())
	self._textPower:setString(sizeText)
end

function GuildWarEnemyItemCell:_updateHeroName()
	self._textName:setString(self._warUserData:getUser_name())
	--local officerLevel = self._warUserData:getOfficer_level()
	--self._textName:setColor(Colors.getOfficialColor(officerLevel))
end

function GuildWarEnemyItemCell:_updateGuildName()
	local name = self._warUserData:getGuild_name()
	self._textGuildName:setString(name)
end

function GuildWarEnemyItemCell:_updateGuildFlag()
	local name = self._warUserData:getGuild_name()
	local index = self._warUserData:getGuild_icon()
	if index == 0 then
		index = 1
	end
	self._commonGuildFlag:updateUI(index,name)
end


function GuildWarEnemyItemCell:_updateHp()

	local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")
	local maxHp = GuildWarDataHelper.getGuildWarHp(self._warUserData)
	local hp = self._warUserData:getWar_value()

	--[[
	if hp <= 0 then
        self._barGreen:setVisible(false)
    else
        self._barGreen:setVisible(true)
        self._barGreen:loadTexture(Path.getGuildWar(HP_IMGS[hp]))
    end

]]
	self._colorProgress:setPercent( math.floor(hp * 100/maxHp),false)
end

function GuildWarEnemyItemCell:_updateBuff()
	local buffBaseIds = self._warUserData:getTree_buff()
	self._buffNode:updateUI(buffBaseIds)
end

function GuildWarEnemyItemCell:playAttackEffect()
	 G_EffectGfxMgr:createPlayGfx(self._panelTouch, "effect_zhandou_duijue", nil, true)
end

function GuildWarEnemyItemCell:_createSwordEft()
	local EffectGfxNode = require("app.effect.EffectGfxNode")
	local function effectFunction(effect)
        if effect == "effect_shuangjian"then
            local subEffect = EffectGfxNode.new("effect_shuangjian")
            subEffect:play()
            return subEffect 
        end
    end
    self._swordEffect = G_EffectGfxMgr:createPlayMovingGfx( self._nodeSword, "moving_shuangjian", effectFunction, nil, false )
	self._swordEffect:setPosition(0,0)
	self._swordEffect:setAnchorPoint(cc.p(0.5,0.5))
end

function GuildWarEnemyItemCell:showSword(s)
	if not self._swordEffect then 
		self:_createSwordEft()
	end
	self._swordEffect:setVisible(s)
end


function GuildWarEnemyItemCell:_visibleBuilding(show)
	self._commonGuildFlag:setVisible(not show)
	self._textPower:setVisible(not show)
	self._textName:setVisible(not show)
	self._nodeBuff:setVisible(not show)

	self._textBuildingName:setVisible(show)
	self._textBuildingHpTitle:setVisible(show)
	self._textBuildingHp:setVisible(show)

	self._imageBg:loadTexture(Path.getGuildWar(show and "img_ranking_war01a" or  "img_ranking_war01"))
	self._colorProgress:setScaleX(show and 1 or 0.8)
	self._colorProgress:setPositionX(show and 90 or 122 )
end


function GuildWarEnemyItemCell:updateBuildingUI(cityId,config)
	self:_visibleBuilding(true)
	self._cityId = cityId
	self._config = config
	self._warUserData = nil
	self._textBuildingName:setString(config.name)
	self:_updateBuildingHp()
end

function GuildWarEnemyItemCell:_updateBuildingHp()
	local nowWarWatch = G_UserData:getGuildWar():getWarWatchById(self._cityId,self._config.point_id)
	local maxHp = self._config.build_hp
	local hp = maxHp
	if  nowWarWatch then
		 hp = nowWarWatch:getWatch_value() 
	end
	local percent =  math.floor(hp * 100/maxHp)
	self._textBuildingHp:setString(Lang.get("guildwar_rank_list_hurt_percent",{value = percent} ))
	self._colorProgress:setPercent(percent,false)
end



return GuildWarEnemyItemCell

