-- Description: 粮车avatar
-- Company: yoka
-- Author: chenzhongjie
-- Date: 2019-09-06

local CommonGrainCarAvatar = class("CommonGrainCarAvatar")
local HeroSpineNode = require("yoka.node.HeroSpineNode")

local SPINE_RES_NAME = {
	"kuangzhanliangche",
	"kuangzhanniuche",
	"kuangzhanmache",
	"kuangzhanxiniuche",
	"kuangzhandaxiangche",
}

local EFFECT_RES_NAME_PREFIX = {
	"moving_kuangzhan_liangche",
	"moving_kuangzhan_niuche",
	"moving_kuangzhan_mache",
	"moving_biaochesunhuai",
}


local EXPORTED_METHODS = {
    "updateUI",
    "turnBack",
    "playIdle",
    "playRun",
    "playDead",
    "setScale",
}

local ACTION_IDLE = 1
local ACTION_RUN = 2
local ACTION_DEAD = 3

function CommonGrainCarAvatar:ctor()
	self._target = nil
	self._scaleEx = 1.5
	self._curAction = nil
	self._id = nil
	self._turnBack = false
end

function CommonGrainCarAvatar:_init()
	self._image = ccui.Helper:seekNodeByName(self._target, "imageCar")
	self._image:ignoreContentAdaptWithSize(true)
	self._nodeHero = ccui.Helper:seekNodeByName(self._target, "Node_car")
	self._nodeAvatarEffect = ccui.Helper:seekNodeByName(self._target, "NodeAvatarEffect")
	self._spineHero = require("yoka.node.HeroSpineNode").new()
	self._nodeHero:addChild(self._spineHero)
	self:_createDeadEffect()
end

function CommonGrainCarAvatar:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonGrainCarAvatar:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

--param id:粮车id
function CommonGrainCarAvatar:updateUI(id)
    assert(id, "CommonGrainCarAvatar's id can't be nil ")
	-- self._image:loadTexture(Path.getGrainCar("car" .. id))
	if self._id == id then
		return
	end

	self._curAction = nil
	self._id = id
	self:_initSpine(id)
end

function CommonGrainCarAvatar:turnBack(needBack)
	if self._spineHero then
		if needBack == nil or needBack == true then
			self._turnBack = true
			self._image:setScaleX(-self._scaleEx * HeroSpineNode.SCALE)
			self._spineHero:setScaleX(-self._scaleEx)
		elseif needBack == false then
			self._turnBack = false
			self._image:setScaleX(self._scaleEx * HeroSpineNode.SCALE)
			self._spineHero:setScaleX(self._scaleEx)
		end
	end
end

function CommonGrainCarAvatar:playIdle()
	if self._curAction == ACTION_IDLE then
		return
	end
	self._curAction = ACTION_IDLE
	self._spineHero:setAnimation("idle", true)
	self._spineHero:setVisible(true)
	self._image:setVisible(false)
	self._nodeAvatarEffect:setVisible(false)
end

function CommonGrainCarAvatar:playRun()
	if self._curAction == ACTION_RUN then
		return
	end
	self._curAction = ACTION_RUN
	self._spineHero:setAnimation("run", true)
	self._spineHero:setVisible(true)
	self._image:setVisible(false)
	self._nodeAvatarEffect:setVisible(false)
end

function CommonGrainCarAvatar:playDead()
	if self._curAction == ACTION_DEAD then
		return
	end
	self._curAction = ACTION_DEAD
	
	self._image:loadTexture(Path.getGrainCar("car_dead_" .. self._id))
	self._spineHero:setVisible(false)
	self._image:setVisible(true)
	self._nodeAvatarEffect:setVisible(true)
end

function CommonGrainCarAvatar:_createDeadEffect()
	local EffectGfxNode = require("app.effect.EffectGfxNode")
	local function effectFunction(effect)
		if effect == "effect_scene01_fire_copy2" or 
			effect == "effect_scene01_fire_copy1" then
			local subEffect = EffectGfxNode.new("effect_scene01_fire")
            subEffect:play()
            return subEffect
		elseif effect == "effect_scene01_nongyan01_copy5" or 
			effect == "effect_scene01_nongyan01_copy4" or
			effect == "effect_scene01_nongyan01_copy3" or
			effect == "effect_scene01_nongyan01_copy2" or
			effect == "effect_scene01_nongyan01_copy1" then
			local subEffect = EffectGfxNode.new("effect_scene01_nongyan01")
            subEffect:play()
			return subEffect
		elseif effect == "effect_scene01_huoguang_copy2" or 
			effect == "effect_scene01_huoguang_copy1" then
			local subEffect = EffectGfxNode.new("effect_scene01_huoguang")
			subEffect:play()
			return subEffect
		end
		return cc.Node:create()
    end
    local function eventFunction(event)
		if event == "finish" then
        end
    end
	local effect = G_EffectGfxMgr:createPlayMovingGfx(self._nodeAvatarEffect, "moving_biaochesunhuai", effectFunction, eventFunction , false)
end

function CommonGrainCarAvatar:setScale(scale)
	scale = scale or 0.5
	self._scaleEx = scale
	if self._spineHero then
		self._spineHero:setScale(scale)
		self._image:setScale(scale * HeroSpineNode.SCALE)
		if self._turnBack then
			self._spineHero:setScaleX(-scale)
			self._image:setScaleX(-scale * HeroSpineNode.SCALE)
		end
	end
end

function CommonGrainCarAvatar:_initSpine(id)
	local resJson = self:_getSpineData(id)
	self._spineHero:setAsset(resJson)
	self._spineHero:setScale(self._scaleEx)
	self._image:setScale(self._scaleEx * HeroSpineNode.SCALE)
end

function CommonGrainCarAvatar:_getSpineData(id)
	return Path.getSpine(SPINE_RES_NAME[id])
end


return CommonGrainCarAvatar