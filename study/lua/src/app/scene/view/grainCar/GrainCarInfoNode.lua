-- Description: 粮车详情节点
-- Company: yoka
-- Author: chenzhongjie
-- Date: 2019-09-05
local ViewBase = require("app.ui.ViewBase")
local GrainCarInfoNode = class("GrainCarInfoNode", ViewBase)
local GrainCarConfigHelper = require("app.scene.view.grainCar.GrainCarConfigHelper")
local GrainCarConst  = require("app.const.GrainCarConst")

local BG_TRAIN_POS_2ROW = cc.p(0, -61.00)
local BG_TRAIN_POS_3ROW = cc.p(0, -51.00)

function GrainCarInfoNode:ctor()
	local resource = {
		file = Path.getCSB("GrainCarInfoNode", "grainCar"),
		binding = {
        }
	}
	GrainCarInfoNode.super.ctor(self, resource)
end

function GrainCarInfoNode:onCreate()
	self._bIsRightType = false
	self:setCascadeOpacityEnabled(true)
end

function GrainCarInfoNode:onEnter()
end

function GrainCarInfoNode:onExit()
end

--param id:粮车level
--carUnit 只有1级用的到
function GrainCarInfoNode:updateUI(level)
	self._bgTrain:setVisible(true)

	-- if level == 1 then
	-- 	self:_setNodeLevel1(true)
	-- 	return
	-- end
	self:_setNodeLevel1(false)

	self._grainCarAvatar:updateUI(level)
	self._grainCarAvatar:playIdle()
	if level == 3 then
		self._grainCarAvatar:setScale(1.7)
	else
		self._grainCarAvatar:setScale(1.8)
	end

	local config = GrainCarConfigHelper.getGrainCarConfig(level)
	self._labelHp:setString(config.stamina)
	-- self._title:loadTexture(Path.getGrainCarText(GrainCarConst.CAR_TITLE[level]))


	if level == 1 then
		local buff = 100 * (GrainCarConfigHelper.getGrainCarMoveTime() - config.moving)/ GrainCarConfigHelper.getGrainCarMoveTime()
		self._labelAbility:setString(Lang.get("grain_car_ability_speed", {num = buff}))
		self._bgTrain:setPosition(BG_TRAIN_POS_2ROW)
	elseif level == 2 then
		local buff = 100 * (GrainCarConfigHelper.getGrainCarMoveTime() - config.moving)/ GrainCarConfigHelper.getGrainCarMoveTime()
		self._labelAbility:setString(Lang.get("grain_car_ability_speed", {num = buff}))
		self._bgTrain:setPosition(BG_TRAIN_POS_2ROW)
	elseif level == 3 then
		self._labelAbility:setString(Lang.get("grain_car_ability", {num = config.stop_reduce / 10}))
		self._bgTrain:setPosition(BG_TRAIN_POS_2ROW)
	elseif level == 4 then
		if self._bIsRightType then
			self._bgTrain:setPositionX(-50)
		end
		self._bgTrain:setPositionY(BG_TRAIN_POS_3ROW.y)
		local stopTime = 100 * (GrainCarConfigHelper.getGrainCarMoveTime() - config.moving)/ GrainCarConfigHelper.getGrainCarMoveTime()
		local speed = 100 * (GrainCarConfigHelper.getGrainCarMoveTime() - config.moving)/ GrainCarConfigHelper.getGrainCarMoveTime()
		local armyAdd = GrainCarConfigHelper.getGrainCarAttackLose() * (config.attack_lose_rate / 1000)
		self._labelAbility:setString(Lang.get("grain_car_ability_level_4", 
			{num1 = stopTime,
		     num2 =  speed,
			 num3 = armyAdd,}
		))
	elseif level == 5 then
		if self._bIsRightType then
			self._bgTrain:setPositionX(-80)
		else
			self._bgTrain:setPositionX(-40)
		end
		self._bgTrain:setPositionY(BG_TRAIN_POS_3ROW.y)
		local stopTime = 100 * (GrainCarConfigHelper.getGrainCarMoveTime() - config.moving)/ GrainCarConfigHelper.getGrainCarMoveTime()
		local speed = 100 * (GrainCarConfigHelper.getGrainCarMoveTime() - config.moving)/ GrainCarConfigHelper.getGrainCarMoveTime()
		local armyAdd = GrainCarConfigHelper.getGrainCarAttackLose() * (config.attack_lose_rate / 1000)

		local hpAdd = config.recovery_stamina
		self._labelAbility:setString(Lang.get("grain_car_ability_level_5", 
			{num1 = stopTime,
		     num2 = speed,
			 num3 = armyAdd,
			 num4 = hpAdd}
		))
	end
	
end

--捐献时的1级车显示
function GrainCarInfoNode:_setNodeLevel1(bLevel1)
	self._tipRunTime:setVisible(false)
	self._titleLevel1:setVisible(bLevel1)
	self._labelLevel1:setVisible(bLevel1)
	self._tipLevel1:setVisible(bLevel1)
	self._tipLevel1Once:setVisible(bLevel1)
	self._titleHp:setVisible(not bLevel1)
	self._labelHp:setVisible(not bLevel1)
	self._nodeAbility:setVisible(not bLevel1)
	self._grainCarAvatar:setVisible(not bLevel1)
end

--活动开始后1级车显示
function GrainCarInfoNode:setRuntime(bRuntime)
	self._tipRunTime:setVisible(bRuntime)
	self._titleLevel1:setVisible(not bRuntime)
	self._labelLevel1:setVisible(not bRuntime)
	self._tipLevel1:setVisible(not bRuntime)
	self._tipLevel1Once:setVisible(not bRuntime)
	self._titleHp:setVisible(not bRuntime)
	self._labelHp:setVisible(not bRuntime)
	self._nodeAbility:setVisible(not bRuntime)
	self._grainCarAvatar:setVisible(bRuntime)
end

--更新一级时的捐献进度
function GrainCarInfoNode:updateLeve1(carUnit)
	if carUnit:getLevel() > 1 then
		return
	end
	local _, _, cost =  GrainCarConfigHelper.getGrainCarDonateCost()
	local cfgLevel1 = carUnit:getConfig()
	local maxCount = math.ceil(cfgLevel1.exp / cost)
	local uids = carUnit:getUids()
	local curCount = #uids
	self._labelLevel1:setString(curCount .. "/" .. maxCount)
end

--设置文字颜色
--param type 1：白色 2：绿色
function GrainCarInfoNode:setTextType(type)
	if type == 1 then
		self._labelHp:setColor(Colors.NUMBER_WHITE)
		self._labelAbility:setColor(Colors.NUMBER_WHITE)
	elseif type == 2 then
		self._labelHp:setColor(Colors.NUMBER_GREEN)
		self._labelAbility:setColor(Colors.NUMBER_GREEN)
	end
end

--调整描述位置
function GrainCarInfoNode:setRightType()
	self._bIsRightType = true
end



return GrainCarInfoNode