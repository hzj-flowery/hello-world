local ListViewCellBase = require("app.ui.ListViewCellBase")
local AchievementItemCell = class("AchievementItemCell", ListViewCellBase)
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UIHelper = require("yoka.utils.UIHelper")
local TextHelper = require("app.utils.TextHelper")
local AchievementData = require("app.data.AchievementData")

function AchievementItemCell:ctor()
	self._target = nil
	self._buttonOK = nil   -- ok按钮

	self._resourceNode = nil

	self._achInfo = nil
	local resource = {
		file = Path.getCSB("AchievementItemCell", "achievement"),
	}

	AchievementItemCell.super.ctor(self, resource)

end


function AchievementItemCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	self._imageIcon = self:getSubNodeByName("Image_icon")
	if self._imageIcon then
		self._imageIcon:setTouchEnabled(true)
		self._imageIcon:addClickEventListenerEx(handler(self,self._onClickIcon))
	end

	for i = 1 , 2 do
		self["_commonResInfo"..i]:setVisible(false)
	end


	self._commonButton:addClickEventListenerExDelay(handler(self,self._onButtonClick), 100)
	self._commonGo:addClickEventListenerExDelay(handler(self,self._onButtonGo),1000)

	self._commonButton:switchToNormal()
end

--
function AchievementItemCell:updateUI(index, achInfo )

	self:_updateAchievementNode(achInfo)

	self._achInfo = achInfo

end


--创建领取条件富文本
function AchievementItemCell:_createConditionRichText(richText)
    local widget = ccui.RichText:createWithContent(richText)
    widget:setAnchorPoint(cc.p(0.5,0.5))
	widget:formatText()
    self._nodeCondition:addChild(widget)
	--self._textCondition:setVisible(true)
	--self._textCondition:setPositionX(self._nodeCondition:getPositionX() - widget:getContentSize().width - 4)
end


function AchievementItemCell:_updateAchievementNode(achInfo)
	local cfg = achInfo.cfgData
	self:getSubNodeByName("Node_daily"):setVisible(false)
	self:getSubNodeByName("Node_reward"):setPositionX(0)
	self._nodeCondition:removeAllChildren()
	--self._textCondition:setVisible(false)
	--self:updateImageView("Image_icon_frame",{texture = Path.getUICommon("img_com_icon_bg02")})
	if cfg['tab'] == AchievementData.FIRST_MEET_TYPE then
		self:updateImageView("Image_icon_frame",{texture = Path.getUICommonFrame("img_frame_07")})
		self:updateImageView("Image_icon",{texture = Path.getCommonIcon("hero",cfg.icon)})
		self._imageIcon:setScale(0.9)
	else
		self:updateImageView("Image_icon_frame",{texture = Path.getUICommon("img_com_icon_bg02")})
		self:updateImageView("Image_icon",{texture = Path.getCommonIcon("achievement",cfg.icon)})
		self._imageIcon:setScale(0.8)
	end

    --价格
	local textResName = self:getSubNodeByName("Text_ResName")

	for i = 1 , 2 do
		if cfg["reward_type"..i] > 0 then
			self["_commonResInfo"..i]:updateUI(cfg["reward_type"..i],cfg["reward_value"..i],cfg["reward_size"..i])
			self["_commonResInfo"..i]:setVisible(true)
			if cfg['tab'] == AchievementData.FIRST_MEET_TYPE then
				self["_commonResInfo"..i]:setPlusNum(25)
			end
		else
			self["_commonResInfo"..i]:setVisible(false)
		end
	end

	if self._commonResInfo2:isVisible() then
		local contentSize = self._commonResInfo1:getResSize()
		local res1PosX = self._commonResInfo1:getPositionX()
		self._commonResInfo2:setPositionX(res1PosX + contentSize.width + 15)

		local contentSize1 = self._commonResInfo2:getResSize()

		self._nodeRewardDi:setContentSize(cc.size(contentSize1.width + contentSize.width + 97, 32))
	else
		self._nodeRewardDi:setContentSize(cc.size(200, 32))
	end
    
    self._nodeRewardDi:setVisible(true)

	self._textItemName:setString(achInfo.cfgData.theme)
	self._textDesc:setString(achInfo.desc)
	self._textDesc:setPositionX(self._textItemName:getPositionX() + self._textItemName:getContentSize().width + 30)

	self:_updateBtnState(achInfo)


end

--未达成按钮显示
function AchievementItemCell:_notReachBtn(isGotoBtn)

end

--前往按钮
function AchievementItemCell:_gotoBtn(isReceive)

end

--领取按钮
function AchievementItemCell:_updateRichText()

end

function AchievementItemCell:_updateBtnState(achInfo)
	local cfg = achInfo.cfgData
	local isGotoBtn = cfg.function_id > 0
	local isReceive = achInfo.serverData.getAward
	local canGetAward = achInfo.serverData.now_value >= achInfo.serverData.max_value and not isReceive

	self._imageReceive:setVisible(false)
	self._commonButton:setEnabled(false)
	self._commonGo:setVisible(false)

	if canGetAward then --领取
		self._commonButton:setVisible(true)
		self._commonButton:setEnabled(true)
		self._commonButton:setString(Lang.get("common_btn_get_award"))
		
	else
		if isReceive then --已领取
			self._imageReceive:setVisible(true)
			self._commonButton:setVisible(false)
			self._commonGo:setVisible(false)
			self._nodeCondition:removeAllChildren()
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

	--更新富文本
	if cfg.if_display ~= 2 then
		local isGreen = achInfo.serverData.now_value >= achInfo.serverData.max_value
		local currColor = Colors.colorToNumber(Colors.uiColors.GREEN)
		local totalColor = Colors.colorToNumber(Colors.uiColors.GREEN)
		if not isGreen then
			currColor = Colors.colorToNumber(Colors.uiColors.RED)
			totalColor =  Colors.colorToNumber(Colors.BRIGHT_BG_TWO)
		end
		--领取状态下 或 已领取，条件不显示
		if not canGetAward and not isReceive then
			local curValue = tonumber(achInfo.serverData.now_value)
			local maxValue = tonumber(achInfo.serverData.max_value)
			if curValue and maxValue then
				curValue = TextHelper.getAmountText(achInfo.serverData.now_value)
				maxValue = TextHelper.getAmountText(achInfo.serverData.max_value)
			else
				curValue = achInfo.serverData.now_value
				maxValue = achInfo.serverData.now_value
			end

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

end


function AchievementItemCell:_onButtonGo(sender)
	local index = sender:getTag()

	local serverData = self._achInfo.serverData
	local cfgData = self._achInfo.cfgData

	if serverData.getAward == false then
		if cfgData.function_id > 0 then
			local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
			WayFuncDataHelper.gotoModuleByFuncId(cfgData.function_id)
		end
	end

end

function AchievementItemCell:_onButtonClick(sender)
	local index = sender:getTag()

	local serverData = self._achInfo.serverData
	local cfgData = self._achInfo.cfgData

	if serverData.getAward == false then
		if serverData.now_value >= serverData.max_value then
			self:dispatchCustomCallback(cfgData.id)
		else
			if cfgData.function_id > 0 then
				local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
				WayFuncDataHelper.gotoModuleByFuncId(cfgData.function_id)
			end
		end
	end

end

function AchievementItemCell:_onClickIcon()
	local cfgData = self._achInfo.cfgData
	local awardList = {}

	for i = 1 , 2 do
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

function AchievementItemCell:setCallBack(callback)
	if callback then
		self._callback = callback
	end
end


return AchievementItemCell
