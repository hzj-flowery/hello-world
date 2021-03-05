
local ViewBase = require("app.ui.ViewBase")
local DailyMissionActiviyValue = class("DailyMissionActiviyValue", ViewBase)

local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UIHelper = require("yoka.utils.UIHelper")
local UserCheck = require("app.utils.logic.UserCheck")

local LINE_ICON_HEIGHT = 120
local LINE_ICON_WIDTH = 590

DailyMissionActiviyValue.MAX_VALUE = 161
DailyMissionActiviyValue.MAX_ITEM_VALUE = 100 -- 每间隔30活跃领取一个奖励，一共可领取5个
DailyMissionActiviyValue.PERCENT_POS = {
	[1] = {curr = 30, per = 17},
	[2] = {curr = 60, per = 36},
	[3] = {curr = 90, per = 55},
	[4] = {curr = 120, per = 74},
	[5] = {curr = 150, per = 93},
}

DailyMissionActiviyValue.BOX_PNG = {	-- 宝箱的种类纹理
	 {"baoxiangtong_guan", "baoxiangtong_kai", "baoxiangtong_kong"},
	 {"baoxianglv_guan", "baoxianglv_kai", "baoxianglv_kong"},
	 {"baoxiangyin_guan", "baoxiangyin_kai", "baoxiangyin_kong"},
	 {"baoxiang_jubaopeng_guan", "baoxiang_jubaopeng_kai", "baoxiang_jubaopeng_kong"},
	 {"baoxiangjin_guan", "baoxiangjin_kai", "baoxiangjin_kong"}
	}
DailyMissionActiviyValue.NODE_STATUS_DEFAULT = 1
DailyMissionActiviyValue.NODE_STATUS_REACHED = 2
DailyMissionActiviyValue.NODE_STATUS_CURRENT = 3


function DailyMissionActiviyValue:ctor()
	self._target = nil
	self._textCurActivity = nil --进度条数值
	self._activityItemList = {}
	self._boxEffect = {}           --宝箱特效
	self._boxRedpoint = {}         --宝箱红点
	-- self._testPt = 0
	local resource = {
		file = Path.getCSB("DailyMissionActiviyValue", "achievement"),
	}
	DailyMissionActiviyValue.super.ctor(self, resource)
	self._iconList = {}
end

function DailyMissionActiviyValue:onCreate()
	for i=1, 5 do
		self:_updateNodeActivity(i)
	end
end

function DailyMissionActiviyValue:getActivityItemList()
	return self._activityItemList
end

--
function DailyMissionActiviyValue:updateUI()
	self._activityItemList = G_UserData:getDailyMission():getDailyMissionDatas(true)
	self._activityServerData = G_UserData:getDailyMission():getActivityDatas()

	for i, value in ipairs(self._activityItemList) do
		self:_updateNodeActivity(i, value)
	end

	if self._activityServerData then
		self._textCurActivity:setString(self._activityServerData.value)
		self:setPercentValue(	self._activityServerData.value , DailyMissionActiviyValue.MAX_VALUE)
	else
		self._textCurActivity:setString(0)
		self:setPercentValue(	0 , DailyMissionActiviyValue.MAX_VALUE)
	end
end

--更新活跃值Icon
function DailyMissionActiviyValue:_updateNodeActivity(index, cfg)
	local nodeActivity = self:getSubNodeByName("Node_Activity"..index)
	if nodeActivity == nil or cfg == nil then
		return
	end

	-- local imageLine = nodeActivity:getSubNodeByName("Image_line")
	local iconNode = nodeActivity:getSubNodeByName("_boxImage")
	iconNode:setTag(index)
	local currValue = 0
	if self._activityServerData then
		currValue = self._activityServerData.value
	end
	nodeActivity:updateLabel("Text_activity", {text = Lang.get("lang_daily_mission_activity", {num = cfg.require_value})})

	-- Set textture
	if currValue >= cfg.require_value then
		-- nodeActivity:updateImageView("Image_arrow", {texture = Path.getUICommon("img_com_arrow02b")})
		-- imageLine:setVisible(true)
		if cfg.getAward == true then
			iconNode:loadTexture(Path.getChapterBox(DailyMissionActiviyValue.BOX_PNG[index][3]))
			self:_removeBoxFlash(index)
			self:_setNodeType(nodeActivity, DailyMissionActiviyValue.NODE_STATUS_REACHED)
		else
			iconNode:loadTexture(Path.getChapterBox(DailyMissionActiviyValue.BOX_PNG[index][2]))
			self:_createBoxEffect(index)
			self:_setNodeType(nodeActivity, DailyMissionActiviyValue.NODE_STATUS_CURRENT)
		end
	else
		-- nodeActivity:updateImageView("Image_arrow", {texture = Path.getUICommon("img_com_arrow02b")})
		-- imageLine:setVisible(false)
		iconNode:loadTexture(Path.getChapterBox(DailyMissionActiviyValue.BOX_PNG[index][1]))
		self:_setNodeType(nodeActivity, DailyMissionActiviyValue.NODE_STATUS_DEFAULT)
	end

	-- Click
	
	local function onIconClick(sender, iconParams)
		--[[		
			测试代码
			self:setPercentValue(	self._testPt , DailyMissionActiviyValue.MAX_VALUE)
			self._textCurActivity:setString(self._testPt)
			self._testPt = self._testPt + 5
		]]

		local tag = sender:getTag()
		if tag > #G_UserData:getDailyMission():getDailyMissionDatas(true) or tag <= 0 then
			return
		end

		local cfg, rewards = self:_getCurProgressConfig(tag)
		if currValue >= cfg.require_value then
			if cfg.getAward == false then
				G_UserData:getDailyMission():c2sGetDailyTaskAward(cfg.id)
				return
			end
		end

		local popupReward = require("app.ui.PopupReward").new(Lang.get("daily_task_box"), false, true)
		popupReward:updateUI(rewards)
		popupReward:setDetailText(Lang.get("daily_task_rewardstips", {count = cfg.require_value}))
		popupReward:openWithTarget(sender)
	end

	iconNode:setSwallowTouches(false)
	iconNode:setTouchEnabled(true)
	iconNode:addClickEventListenerEx(onIconClick)
end

-- 获取当前进度的配置
function DailyMissionActiviyValue:_getCurProgressConfig(tag)
	local cfg = G_UserData:getDailyMission():getDailyMissionDatas(true)[tag]
	local rewards = {}
	local item =
	{
		type = cfg.reward_type1,
		value = cfg.reward_value1,
		size = cfg.reward_size1,
	}
	table.insert(rewards, item)

	if cfg.open_day and cfg.open_day > 0 then
		local FunctionLevelConfig = require("app.config.function_level")
		local functionConfig = FunctionLevelConfig.get(cfg.open_day)
		if functionConfig and UserCheck.enoughOpenDay(functionConfig.day) then
			local item =
			{
				type = cfg.reward_type2,
				value = cfg.reward_value2,
				size = cfg.reward_size2,
			}
			table.insert(rewards, item)
		end
	end
	return cfg, rewards
end

function DailyMissionActiviyValue:setPercentValue(curr, max)
	local percentList = {{0, 0, 20},--{0-30区段，当前区段下限百分比， 当前区段上限百分比}
						 {30, 29, 35},
						 {60, 45, 51},
						 {90, 60, 66},
						 {120, 76, 82},
						 {150, 91, 100},
						}
	max = max or DailyMissionActiviyValue.MAX_VALUE
	local progress = self:getSubNodeByName("LoadingBar_vip_progress")

	local step = #percentList
	while step > 0 do
		local index = step - 1
		local nodeActivity
		if index > 0 then
			nodeActivity = self:getSubNodeByName("Node_Activity"..index)
		end
		if curr >= percentList[step][1] then
			local offset = curr - percentList[step][1]
			local diff = step < #percentList and 30 or max - percentList[step][1]
			local realPercent = percentList[step][2] + (percentList[step][3] - percentList[step][2]) * offset / diff
			progress:setPercent(realPercent)
			-- self:_setNodeType(nodeActivity, DailyMissionActiviyValue.NODE_STATUS_CURRENT)
			-- step = step - 1
			break
		end
		-- self:_setNodeType(nodeActivity, DailyMissionActiviyValue.NODE_STATUS_DEFAULT)
		step = step - 1
	end
	for i = 1, step - 1 do
		-- local nodeActivity = self:getSubNodeByName("Node_Activity"..i)
		-- self:_setNodeType(nodeActivity, DailyMissionActiviyValue.NODE_STATUS_REACHED)
	end
end

--type 1： 默认状态  2：已经达到 3：当前最新
function DailyMissionActiviyValue:_setNodeType(nodeActivity, type)
	if not nodeActivity then
		return
	end

	local imgReached = nodeActivity:getSubNodeByName("imgReached")
	local imgNotReached = nodeActivity:getSubNodeByName("imgNotReached")
	local imgNotReach = nodeActivity:getSubNodeByName("imgNotReach")
	if type == DailyMissionActiviyValue.NODE_STATUS_DEFAULT then
		imgNotReach:setVisible(true)
		imgReached:setVisible(false)
		imgNotReached:setVisible(false)
	elseif type == DailyMissionActiviyValue.NODE_STATUS_REACHED then
		imgNotReached:setVisible(true)
		imgReached:setVisible(false)
		imgNotReach:setVisible(false)
	elseif type == DailyMissionActiviyValue.NODE_STATUS_CURRENT then
		imgReached:setVisible(true)
		imgNotReached:setVisible(false)
		imgNotReach:setVisible(false)
	end
end


-- @Role Create box effect
function DailyMissionActiviyValue:_createBoxEffect(index)
    if self._boxEffect[index] or self._boxRedpoint[index] then
        return
	end
	local nodeActivity = self:getSubNodeByName("Node_Activity"..index)
    local baseNode = nodeActivity:getSubNodeByName("_boxImage") 
    if not baseNode then
        return
    end
 	local EffectGfxNode = require("app.effect.EffectGfxNode")
	local function effectFunction(effect)
        if effect == "effect_boxflash_xingxing"then
            local subEffect = EffectGfxNode.new("effect_boxflash_xingxing")
            subEffect:play()
            return subEffect
        end
    end
    local effect = G_EffectGfxMgr:createPlayMovingGfx(baseNode, "moving_boxflash", effectFunction, nil, false )
    self._boxEffect[index] = effect
    local redPoint = display.newSprite(Path.getUICommon("img_redpoint"))
    baseNode:addChild(redPoint)
    redPoint:setPosition(cc.p(80, 66))
    self._boxRedpoint[index] = redPoint
end

-- @Role Remove effect
function DailyMissionActiviyValue:_removeBoxFlash(index)
    if self._boxEffect[index] then
        self._boxEffect[index]:removeFromParent()
        self._boxEffect[index] = nil
    end
    if self._boxRedpoint[index] then
        self._boxRedpoint[index]:removeFromParent()
        self._boxRedpoint[index] = nil
    end
end

return DailyMissionActiviyValue
