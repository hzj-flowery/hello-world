local ListViewCellBase = require("app.ui.ListViewCellBase")
local DailyMissionItemCell = class("DailyMissionItemCell", ListViewCellBase)
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UIHelper = require("yoka.utils.UIHelper")
local TextHelper = require("app.utils.TextHelper")

local MAX_DAILY_AWARD_SIZE = 1
function DailyMissionItemCell:ctor()
	self._target = nil
	self._buttonOK = nil   -- ok按钮

	self._resourceNode = nil

	self._missionInfo = nil
	local resource = {
		file = Path.getCSB("AchievementItemCell", "achievement"),
	}

	DailyMissionItemCell.super.ctor(self, resource)

end


function DailyMissionItemCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	local imageIcon = self:getSubNodeByName("Image_icon")
	if imageIcon then
		imageIcon:setTouchEnabled(true)
		imageIcon:addClickEventListenerEx(handler(self,self._onClickIcon))
	end

	for i = 1 , 2 do
		self["_commonResInfo"..i]:setVisible(false)
	end


	self._commonButton:addClickEventListenerExDelay(handler(self,self._onButtonClick),100)
	self._commonGo:addClickEventListenerExDelay(handler(self,self._onButtonGo),1000)
end

--
function DailyMissionItemCell:updateUI(index, missionInfo )

	self:_updateDailyNode(missionInfo)

	self._missionInfo = missionInfo

end


--创建领取条件富文本
function DailyMissionItemCell:_createConditionRichText(richText)
    local widget = ccui.RichText:createWithContent(richText)
	widget:formatText()
    widget:setAnchorPoint(cc.p(0.5,0.5))
    self._nodeCondition:addChild(widget)
	--self._textCondition:setVisible(true)
	
	--self._textCondition:setPositionX(self._nodeCondition:getPositionX() - widget:getContentSize().width - 4)
end


function DailyMissionItemCell:isAwardExp( award )
	-- body
	local TypeConvertHelper = require("app.utils.TypeConvertHelper")
	local DataConst = require("app.const.DataConst")
	if award.type == TypeConvertHelper.TYPE_RESOURCE and award.value ==DataConst.RES_EXP then
		return true
	end
	return false
end

function DailyMissionItemCell:_updateDailyNode(missionInfo)
	self:getSubNodeByName("Node_daily"):setVisible(true)
	self:getSubNodeByName("Node_reward"):setPositionX(131)
	self._nodeCondition:removeAllChildren()

	local iconPath = Path.getCommonIcon("main",missionInfo.icon)
	self:updateImageView("Image_icon", { texture = iconPath })

	local awardList = {}
	local expAward =  G_UserData:getDailyMission():getDailyAwardExp(missionInfo)
	if expAward.size > 0 then
		table.insert(awardList, expAward )
	end
	

	for i = 1 , MAX_DAILY_AWARD_SIZE do
		if missionInfo["reward_type"..i] > 0 then
			local award = {
				type = missionInfo["reward_type"..i],
				value = missionInfo["reward_value"..i],
				size = missionInfo["reward_size"..i]
			}
			table.insert(awardList, award)
		end
	end

	for i = 1 , 2 do
		self["_commonResInfo"..i]:setVisible(false)
	end

	for i , value in ipairs(awardList) do
		self["_commonResInfo"..i]:updateUI(value.type,value.value,value.size)
		self["_commonResInfo"..i]:setVisible(true)
	end
		
	if self._commonResInfo2:isVisible() then
		local contentSize = self._commonResInfo1:getResSize()
		local res1PosX = self._commonResInfo1:getPositionX()
		self._commonResInfo2:setPositionX(res1PosX + contentSize.width + 15)
	end
	--local textDesc = 
	--self._textDesc:setString(missionInfo.desc)
	self._textDesc:setString(" ")
	self._textDesc:setPositionX(self._textItemName:getPositionX() + self._textItemName:getContentSize().width + 40)
	self._textItemName:setString(missionInfo.name)

	self:_updateBtnState(missionInfo)

	self._dailyActivityValue:setString("+"..missionInfo.reward_active)
end

--未达成按钮显示
function DailyMissionItemCell:_notReachBtn(isGotoBtn)

end

--前往按钮
function DailyMissionItemCell:_gotoBtn(isReceive)

end

--领取按钮
function DailyMissionItemCell:_updateRichText()

end

function DailyMissionItemCell:_updateBtnState(missionInfo)
	
	local isGotoBtn = missionInfo.function_id > 0
	local isReceive = missionInfo.getAward
	local canGetAward = missionInfo.value >= missionInfo.require_value and not isReceive

	self._imageReceive:setVisible(false)
	self._commonButton:setEnabled(false)
	self._commonGo:setVisible(false)
	if canGetAward then --领取
		self._commonButton:setVisible(true)
		self._commonButton:setEnabled(true)
		self._commonButton:setString(Lang.get("common_btn_get_award"))
		self._commonButton:switchToNormal() 
	else
		if isReceive then --已领取
			self._imageReceive:setVisible(true)
			self._commonButton:setVisible(false)
			self._commonGo:setVisible(false)
			self._nodeCondition:removeAllChildren()
			--self._textCondition:setVisible(false)
		else
			if isGotoBtn then -- 点击前往
				self._commonButton:setVisible(false)
				self._commonGo:setVisible(true)
				self._commonGo:setString(Lang.get("common_btn_go_to"))
				self._commonGo:setVisible(true)
				self._commonGo:switchToHightLight()
			else -- 未完成
				self._commonButton:setString(Lang.get("common_btn_no_finish"))
				self._commonButton:setEnabled(false)
				self._commonButton:setVisible(true)
				self._commonGo:setVisible(false)
			end
		end
	end


	local isGreen = missionInfo.value >= missionInfo.require_value
	local currColor = Colors.colorToNumber(Colors.uiColors.GREEN)
	local totalColor = Colors.colorToNumber(Colors.uiColors.GREEN)
	if not isGreen then
		currColor = Colors.colorToNumber(Colors.uiColors.RED)
		totalColor =  Colors.colorToNumber(Colors.BRIGHT_BG_TWO)
	end
	--领取状态下 或 已领取，条件不显示
	if not canGetAward and not isReceive then
		local curValue = tonumber(missionInfo.value)
		local maxValue = tonumber(missionInfo.require_value)

		local richText = Lang.get("achievement_condition",
		{
			curr = curValue,
			currColor = currColor,
			total = maxValue,
			totalColor = totalColor,
		})
		self:_createConditionRichText(richText)
	end
	

end


function DailyMissionItemCell:_onButtonGo(sender)
	local index = sender:getTag()
	local missionInfo = self._missionInfo

	if missionInfo.getAward == false then
		if missionInfo.function_id > 0 then
			local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
			WayFuncDataHelper.gotoModuleByFuncId(missionInfo.function_id)
		end
	end

end


function DailyMissionItemCell:_onButtonClick(sender)
	local index = sender:getTag()

	local missionInfo = self._missionInfo

	if missionInfo.getAward == false then
		if missionInfo.value >= missionInfo.require_value then
			self:dispatchCustomCallback(missionInfo.id)
		else
			if missionInfo.function_id > 0 then
				if missionInfo.function_id == FunctionConst.FUNC_DINNER then
				end
				local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
				WayFuncDataHelper.gotoModuleByFuncId(missionInfo.function_id, "mission")
			end
		end
	end
end





function DailyMissionItemCell:_onClickIcon()
	local cfgData = self._missionInfo
	local awardList = {}

	local expAward =  G_UserData:getDailyMission():getDailyAwardExp(cfgData)
	if expAward.size > 0  then
		table.insert(awardList, expAward )
	end

	for i = 1 , MAX_DAILY_AWARD_SIZE do
		if cfgData["reward_type"..i] > 0 then
			local award = {
				type = cfgData["reward_type"..i],
				value = cfgData["reward_value"..i],
				size = cfgData["reward_size"..i]
			}
			table.insert(awardList, award)
		end
	end

    local PopupBoxReward = require("app.ui.PopupBoxReward").new(Lang.get("achievement_reward_title"))
    PopupBoxReward:updateUI(awardList)
    PopupBoxReward:openWithAction()
	PopupBoxReward:setDetailText(Lang.get("achievement_reward_desc"))
end

function DailyMissionItemCell:setCallBack(callback)
	if callback then
		self._callback = callback
	end
end


return DailyMissionItemCell
