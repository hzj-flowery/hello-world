-- Author: nieming
-- Date:2018-01-12 18:01:10
-- Describle：

local CommonActivityCell = class("CommonActivityCell")
local TextHelper = require("app.utils.TextHelper")
local ComponentIconHelper = require("app.ui.component.ComponentIconHelper")
local UIHelper = require("yoka.utils.UIHelper")

local EXPORTED_METHODS = {
	"updateUI",
	"getContentSize"
}

function CommonActivityCell:ctor()
	self._target = nil
end

function CommonActivityCell:_init()
	self._cellBg = ccui.Helper:seekNodeByName(self._target, "CellBg")
	self._iconParent = ccui.Helper:seekNodeByName(self._target, "IconParent")
	self._title = ccui.Helper:seekNodeByName(self._target, "Title")
	self._imageReceive = ccui.Helper:seekNodeByName(self._target, "ImageReceive")
	self._btn = ccui.Helper:seekNodeByName(self._target, "CommonButtonSwitchLevel1")
	self._richTextParent = ccui.Helper:seekNodeByName(self._target, "RichTextParent")
	self._imageDiscount = ccui.Helper:seekNodeByName(self._target, "ImageDiscount")
	self._textDiscount =  ccui.Helper:seekNodeByName(self._imageDiscount, "TextDiscount")

	cc.bind(self._btn, "CommonButtonSwitchLevel1")
	self._btn:addClickEventListenerEx(handler(self, self._onClick))
end

function CommonActivityCell:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonActivityCell:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end


function CommonActivityCell:_updateRewards()
	self._iconParent:removeAllChildren()
	local temp = {}
	local isExchageType = self._questData:isExchageType()
	if isExchageType then
		local consumeItems = self._questData:getConsumeItems()
		local rewardItems =  self._questData:getRewardItems()
		for k, v in ipairs(rewardItems) do
			table.insert(temp, {tp = "icon", data = v})
		end
		table.insert(temp, {tp = "image", data = Path.getCommonImage("img_com_arrow09"), scaleX = -1})

		for k, v in ipairs(consumeItems) do
			table.insert(temp, {tp = "icon", data = v})
		end
	else
		local fixRewards = self._questData:getRewardItems()
		local selectRewards = self._questData:getSelectRewardItems()

		for k, v in ipairs(fixRewards) do
			table.insert(temp, {tp = "icon", data = v})
		end

		if #selectRewards > 0 then
			if #fixRewards > 0 then
				table.insert(temp, {tp = "image", data = Path.getTimeActivities("timea_jia")})
			end
			for k, v in ipairs(selectRewards) do
				table.insert(temp, {tp = "icon", data = v})
				if k ~= #selectRewards then
					table.insert(temp, {tp = "image", data = Path.getTimeActivities("timea_huo")})
				end
			end
		end
	end

	local iconWidth = 98
	local gap = 8
	local curWidth = 0
	local iconNum = 0
	for k, v in ipairs(temp) do
		if v.tp == "icon" then
			local icon = ComponentIconHelper.createIcon(v.data.type,v.data.value,v.data.size)
			icon:setTouchEnabled(true)
			self._iconParent:addChild(icon)
			iconNum = iconNum + 1
			icon:setPositionX(curWidth)
			curWidth = curWidth + iconWidth + gap
		elseif v.tp == "image" then
			local img = UIHelper.createImage({texture = v.data})
			self._iconParent:addChild(img)
			local imgWidth = img:getContentSize().width
			img:setPositionX(curWidth + (imgWidth - iconWidth)/2)
			curWidth = curWidth + imgWidth + gap
			if v.scaleX then
				img:setScaleX(v.scaleX)
			end
		end
	end
end


function CommonActivityCell:_createProgressRichText(richText)
	self._richTextParent:removeAllChildren()
    local widget = ccui.RichText:createWithContent(richText)
    widget:setAnchorPoint(cc.p(1,0.5))
    self._richTextParent:addChild(widget)
end
--
function CommonActivityCell:updateUI(questData, clickCallback)
	if not questData then
		return
	end
	self._questData = questData
	self._callback = clickCallback
	self._title:setString(questData:getDescription())
	self:_updateRewards()

	--富文本
	local isReach = questData:isQuestReachReceiveCondition()
	local canReceive = questData:isQuestCanReceive()
	local isAlreadyReceive = questData:isQuestHasReceive()
	local isExchangeType = questData:isExchageType()
	if questData:isNeedShowProgress() and not isAlreadyReceive then
		local progressTitle = questData:getProgressTitle()
		local value01,value02,onlyShowMax = questData:getProgressValue()
		if onlyShowMax then
			local richText
			if isExchageType then
				richText = Lang.get("customactivity_task_progress_04",
				{title = progressTitle,max = TextHelper.getAmountText2(value02),titleColor = Colors.colorToNumber(Colors.BRIGHT_BG_TWO),
					maxColor = Colors.colorToNumber(value02 <= 0 and Colors.BRIGHT_BG_RED or Colors.BRIGHT_BG_ONE ) })
			else
				richText = Lang.get("customactivity_task_progress_03",
				{title = progressTitle,max = TextHelper.getAmountText2(value02)})
			end
			self:_createProgressRichText(richText)
		elseif isReach then
			local richText = Lang.get("customactivity_task_progress_02",
				{title = progressTitle,curr = TextHelper.getAmountText2(value01),max = TextHelper.getAmountText2(value02)})
			self:_createProgressRichText(richText)
		else
			--不满条件
			local richText = Lang.get("customactivity_task_progress_01",
			{title = progressTitle,curr = TextHelper.getAmountText2(value01),max = TextHelper.getAmountText2(value02)})
			self:_createProgressRichText(richText)
		end
	else
		self._richTextParent:removeAllChildren()
	end
	-- 按钮状态
	self._btn:setVisible(true)
	self._btn:setEnabled(true)
    self._imageReceive:setVisible(false)
	local normalBtnStr
	if isExchangeType then
		normalBtnStr = Lang.get("customactivity_btn_name_exchange")
	else
		normalBtnStr = Lang.get("days7activity_btn_receive")
	end

    if isReach then
		if canReceive then
            --可领取
			self._btn:switchToNormal()
			self._btn:setString(normalBtnStr)
		else--已经领取了
			if isExchangeType then
				self._btn:switchToNormal()
				self._btn:setString(Lang.get("days7activity_btn_already_exchange"))
				self._btn:setEnabled(false)
			else
				self._btn:setVisible(false)
				self._imageReceive:setVisible(true)
			end
		end
	else
		if isAlreadyReceive then
			self._imageReceive:setVisible(true)
			self._btn:setVisible(false)
		else
			local functionId = questData:getQuestNotFinishJumpFunctionID()
			if functionId == FunctionConst.FUNC_RECHARGE then
				self._btn:switchToHightLight()
				self._btn:setString(Lang.get("customactivity_btn_name_recharge"))
			else
				self._btn:switchToNormal()
				self._btn:setString(normalBtnStr)
				self._btn:setEnabled(false)
			end
		end
    end

	local discount = questData:getDiscountNum()
    local showDiscount = questData:isDiscountNeedShow(discount)
	--折扣刷新
	self._imageDiscount:setVisible(showDiscount)
	if showDiscount then
		self._imageDiscount:setPositionX(self._title:getPositionX() +
			 self._title:getContentSize().width + 10)
		self._textDiscount:setString( Lang.get("customactivity_discount_num",{discount = discount}))
	end
end

function CommonActivityCell:getContentSize()
	return self._cellBg:getContentSize()
end

function CommonActivityCell:_onClick()
	if self._callback then
		self._callback()
	end
end

return CommonActivityCell
