
local ViewBase = require("app.ui.ViewBase")
local GuildWarCityNode = class("GuildWarCityNode", ViewBase)
local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")
local GuildWarConst = require("app.const.GuildWarConst")

function GuildWarCityNode:ctor(cfg)

	--csb bind var name
	self._panelTouch = nil  --Button
	self._imageName = nil  
    self._imageProclaim = nil
    self._nodeFlag = nil  
	self._imageMyPos = nil
	self._nodeSword = nil

	self._cfg = cfg
	local resource = {
		file = Path.getCSB("GuildWarCityNode", "guildwar"),
		binding = {
			_panelTouch = {
				events = {{event = "touch", method = "_onBtnGo"}}
			},
		},
	}
	GuildWarCityNode.super.ctor(self, resource)
end

-- Describle：
function GuildWarCityNode:onCreate()
	self._imageName:loadTexture(Path.getCountryBossText(self._cfg.name_pic))
	self._imageName:ignoreContentAdaptWithSize(true)

	--self._panelTouch:ignoreContentAdaptWithSize(true)
	--self._panelTouch:loadTextures(Path.getCountryBossImage(self._cfg.city_pic), nil, nil, 0)
	self._panelTouch:setContentSize(cc.size(self._cfg.range *2,self._cfg.range *2))

    self._imageProclaim:setVisible(false)

    self:setPosition(self._cfg.x,self._cfg.y)

	
end

function GuildWarCityNode:updateUI()
    local cityData = G_UserData:getGuildWar():getCityById(self._cfg.id)
	if not cityData then
		return
	end
    local hasOwnGuild = cityData:getOwn_guild_id() ~= 0
    self._nodeFlag:setVisible(hasOwnGuild)
    if hasOwnGuild then
        self._nodeFlag:updateUI( cityData:getOwn_guild_icon(),  cityData:getOwn_guild_name())
    end

	local status = GuildWarDataHelper.getGuildWarStatus()
	if status == GuildWarConst.STATUS_CLOSE then
   		 self._imageProclaim:setVisible(cityData:isIs_declare())
	else
    	self._imageProclaim:setVisible(false)
	end
	logWarn(Path.getGuildWar("img_war_com02c"))
	local ownCityId = GuildWarDataHelper.getOwnCityId()
	--开战期间，显示我方是防御（占有城）还是攻击（宣战城）
	local guildId = G_UserData:getGuild():getMyGuildId()
	local occupy = cityData:getOwn_guild_id() == guildId and guildId ~= 0 
	local inCityId = G_UserData:getGuildWar():getIn_city_id()
	if status == GuildWarConst.STATUS_CLOSE then
		self:_visibleMyPos(false)
	elseif inCityId ~= 0 and inCityId == self._cfg.id then	
		self:_visibleMyPos(true)
	elseif inCityId == 0 and occupy then
		self:_visibleMyPos(true)
	elseif inCityId == 0 and  ownCityId == nil and cityData:isIs_declare() then	
		self:_visibleMyPos(true)
	else
		self:_visibleMyPos(false)
	end
	--[[
	if status == GuildWarConst.STATUS_CLOSE then
		self:_visibleSign(false)
	elseif occupy then
		self:_visibleSign(true)
		self._imageSign:loadTexture(Path.getTextSignet("img_guild_war02"))
	elseif cityData:isIs_declare() then
		self:_visibleSign(true)
		self._imageSign:loadTexture(Path.getTextSignet("img_guild_war01"))
	else
		self:_visibleSign(false)
	end
	]]
end

function GuildWarCityNode:onEnter()
end
-- Describle：
function GuildWarCityNode:onExit()
end

function GuildWarCityNode:_visibleSign(show)
	self._imageSign:setVisible(show)	
	if show then
		local UIActionHelper = require("app.utils.UIActionHelper")
		UIActionHelper.playSkewFloatEffect2(self._imageSign)
	else
		self._imageSign:stopAllActions()
	end
end

function GuildWarCityNode:_visibleMyPos(show)
	self:showSword(show)
	--[[
	self._imageMyPos:setVisible(show)	
	if show then
		local UIActionHelper = require("app.utils.UIActionHelper")
		UIActionHelper.playFloatEffect(self._imageMyPos)
	else
		self._imageMyPos:stopAllActions()
	end
	]]
end

-- Describle：
function GuildWarCityNode:_onBtnGo()
	local cityData = G_UserData:getGuildWar():getCityById(self._cfg.id)
	if not cityData then--断线重连，可能没有此数据
		return
	end
	--战斗期间
	
	local status = GuildWarDataHelper.getGuildWarStatus()
	if status == GuildWarConst.STATUS_CLOSE then
		local PopupGuildWarCityInfo = require("app.scene.view.guildwar.PopupGuildWarCityInfo")
		local popup = PopupGuildWarCityInfo.new(cityData:getCity_id())
		popup:openWithAction()
	else
		local ownCityId = GuildWarDataHelper.getOwnCityId()
		local currBattleCityId = GuildWarDataHelper.getCurrBattleCityId()
		local inCityId = G_UserData:getGuildWar():getIn_city_id()
	
	
		local guildId = G_UserData:getGuild():getMyGuildId()
		local occupy = cityData:getOwn_guild_id() == guildId and guildId ~= 0 

		local bool1 = inCityId ~= 0 and inCityId == self._cfg.id
		local bool2 = inCityId == 0 and occupy
		local bool3 = inCityId == 0 and ownCityId == nil and cityData:isIs_declare() 

		--判断是否是可进攻的城or可防御的城	
		if not cityData:isIs_declare() and ownCityId ~= cityData:getCity_id() then
			--没有宣战无法攻击此城池
			G_Prompt:showTip(Lang.get("guildwar_enter_city_forbid_tip"))
		elseif not bool1 and not bool2 and not bool3 then
			G_Prompt:showTip(Lang.get("guildwar_tips_not_in_city"))	
		elseif not currBattleCityId then--没有battle数据
			G_UserData:getGuildWar():c2sEnterGuildWar(self._cfg.id) 
		elseif currBattleCityId == self._cfg.id then
			G_SceneManager:showScene("guildwarbattle",self._cfg.id)	
		else
	 		G_UserData:getGuildWar():c2sEnterGuildWar(self._cfg.id) 
		end
	end

end


function GuildWarCityNode:_createSwordEft()
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

function GuildWarCityNode:showSword(s)
	if not self._swordEffect then 
		self:_createSwordEft()
	end
	self._swordEffect:setVisible(s)
end

return GuildWarCityNode

