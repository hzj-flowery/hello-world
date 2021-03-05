-- @Author panhoa
-- @Date 8.16.2018
-- @Role

local ViewBase = require("app.ui.ViewBase")
local OtherHeroPickNode = class("OtherHeroPickNode", ViewBase)
local SeasonSportConst = require("app.const.SeasonSportConst")
local SquadAvatar = require("app.scene.view.seasonCompetitive.SquadAvatar")
local SeasonSportHelper = require("app.scene.view.seasonSport.SeasonSportHelper")


function OtherHeroPickNode:ctor()
	-- body
	self._resourceNode	= nil

    local resource = {
		file = Path.getCSB("OtherHeroPickNode", "seasonCompetitive"),
	}
	OtherHeroPickNode.super.ctor(self, resource)
end

function OtherHeroPickNode:onCreate()
	self:_initInfo()
end

function OtherHeroPickNode:onEnter()
end

function OtherHeroPickNode:onExit()
end

function OtherHeroPickNode:_initInfo()
	for index = 1, SeasonSportConst.HERO_SQUAD_USEABLECOUNT do
		self["_heroPedespal"..index]:setVisible(true)
		self["_heroPedespal"..index]:loadTexture(Path.getEmbattle("img_embattleherbg_nml"))
	end
end

-- @Role 	武将上阵动画特效（Boom）
function OtherHeroPickNode:_playWujiangPickAnimation(rootNode, key, value)
	local function effectFunction(effect)
		local EffectGfxNode = require("app.effect.EffectGfxNode")
		if effect == "effect_zm_boom" then
			local subEffect = EffectGfxNode.new("effect_zm_boom")
            subEffect:play()
			return subEffect
		end
    end
    local function eventFunction(event)
		if event == "finish" then
			--
		elseif event == "hero" then
			local avatar = self:_createHeroAvatar(value, key)
			avatar:setName("avatar"..key)
			avatar:turnBack(true)
			self._resourceNode:addChild(avatar, key * 10)
        end
	end
	
    G_EffectGfxMgr:createPlayMovingGfx(rootNode, "moving_wuchabiebuzhen_wujiang", effectFunction, eventFunction , false)
end

-- @Role 	Create Avatar
function OtherHeroPickNode:_createHeroAvatar(heroId, index)
	local avatar = SquadAvatar.new()
	local posX = self["_heroPedespal"..index]:getPositionX()
	local posY = self["_heroPedespal"..index]:getPositionY()
	avatar:setPositionX(posX)
	avatar:setPositionY(posY)
	avatar:setScale(0.65)
	
	local limitLevel = SeasonSportHelper.getORedHeroLimitLevelById(heroId)
	avatar:updateUI(heroId, limitLevel)
	return avatar
end

-- @Role	Update Avatar
-- @Param	data
function OtherHeroPickNode:updateUI(data)
	if not data then
		return
	end

	for key, value in pairs(data) do
		if value > 0 then
			if SeasonSportHelper.isHero(value) == false then
				value = SeasonSportHelper.getTransformCardsHeroId(value)
			end

			local avatar = self._resourceNode:getChildByName("avatar"..key)
			if avatar == nil then
				self["_nodeEffect"..key]:removeAllChildren()
				self:_playWujiangPickAnimation(self["_nodeEffect"..key], key, value)
			end
		end
	end
end


return OtherHeroPickNode