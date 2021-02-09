-- Author: conley
local ListViewCellBase = require("app.ui.ListViewCellBase")
local CSHelper = require("yoka.utils.CSHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local CustomActivityConst = require("app.const.CustomActivityConst")
local CommonConst = require("app.const.CommonConst")
local CustomActivityExchangeItemCell = class("CustomActivityExchangeItemCell", ListViewCellBase)
local TextHelper = require("app.utils.TextHelper")
 CustomActivityExchangeItemCell.LINE_ITEM_NUM = 1

 CustomActivityExchangeItemCell.ITEM_GAP = 106--奖励道具之间的间隔
 CustomActivityExchangeItemCell.ITEM_MID_GAP = 160--消耗和兑换道具之间间隔
 CustomActivityExchangeItemCell.ITEM_ADD_GAP = 132--+道具之间的间隔
 CustomActivityExchangeItemCell.ITEM_OR_GAP = 132--可选奖励道具之间间隔

 CustomActivityExchangeItemCell.POS_OFFSET_DISCOUNT = 10--折扣相对描述的位子偏移

function CustomActivityExchangeItemCell:ctor()
	self._commonItemListExchangeNode  = nil
	self._commonButtonLargeNormal  = nil
    self._textTaskDes = nil--任务描述
	self._nodeProgress = nil--进度富文本的父节点
    self._imageDiscount = nil--折扣背景图
    self._textDiscount = nil--折扣
	self._callback = nil

	local resource = {
		file = Path.getCSB("CustomActivityExchangeItemCell", "customactivity"),
		binding = {
			_commonButtonLargeNormal = {
				events = {{event = "touch", method = "_onTouchCallBack"}}
			}
		},
	}
	CSHelper.createResourceNode(self, resource)
	self:_onCreate()
end

function CustomActivityExchangeItemCell:_onCreate()
    local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
    self._commonButtonLargeNormal:setSwallowTouches(false)
    --self._commonButtonLargeNormal:addTouchEventListenerEx(handler(self, self._onTouchCallBack),false)
end

function CustomActivityExchangeItemCell:onClickBtn()
    if self._callback then
        self._callback(self)
    end

    self:_onItemClick(self)
end

function CustomActivityExchangeItemCell:_onItemClick(sender)
	local curSelectedPos = sender:getTag()
	logWarn("CustomActivityExchangeItemCell:_onIconClicked  "..curSelectedPos)
	self:dispatchCustomCallback(curSelectedPos)
end


function CustomActivityExchangeItemCell:_onTouchCallBack(sender,state)
	-----------防止拖动的时候触发点击
	if(state == ccui.TouchEventType.ended) or not state then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
			self:onClickBtn()
		end
	end

end

function CustomActivityExchangeItemCell:onClickItem(sender)
	local tag = self:getTag()
end

function CustomActivityExchangeItemCell:_updateRewards(actTaskUnitData)
    local CustomActivityUIHelper = require("app.scene.view.customactivity.CustomActivityUIHelper")
    local consumeItems,consumeItemTypes,rewards,rewardTypes = CustomActivityUIHelper.makeCustomActItemData(actTaskUnitData)

    self._commonItemListExchangeNode:setGaps(CustomActivityExchangeItemCell.ITEM_GAP,
    CustomActivityExchangeItemCell.ITEM_ADD_GAP,
    CustomActivityExchangeItemCell.ITEM_OR_GAP,
    CustomActivityExchangeItemCell.ITEM_MID_GAP,629)
    self._commonItemListExchangeNode:updateInfo(consumeItems,consumeItemTypes,rewards,rewardTypes)
end





--创建富文本
function CustomActivityExchangeItemCell:_createProgressRichText(richText)
    self._nodeProgress:removeAllChildren()
    local widget = ccui.RichText:createWithContent(richText)
    widget:setAnchorPoint(cc.p(0.5,0.5))
    self._nodeProgress:addChild(widget)
end



function CustomActivityExchangeItemCell:updateInfo(data)
    local customActTaskUnitData = data.actTaskUnitData
    local activityUnitData =  data.actUnitData--G_UserData:getCustomActivity():getActUnitDataById(customActTaskUnitData:getAct_id())
    local reachReceiveCondition = data.reachReceiveCondition--G_UserData:getCustomActivity():isTaskReachReceiveCondition(customActTaskUnitData:getAct_id(),customActTaskUnitData:getId())
    local canReceive = data.canReceive--G_UserData:getCustomActivity():isTaskCanReceived(customActTaskUnitData:getAct_id(),customActTaskUnitData:getId())
    local buttonTxt = activityUnitData:getButtonTxt()
	local taskDes = customActTaskUnitData:getDescription()
	local progressTitle = customActTaskUnitData:getProgressTitle()
	local value01,value02,onlyShowMax = customActTaskUnitData:getProgressValue()
    local functionId = activityUnitData:getFunctionId()
    local notShowProgress = false
    local discount = customActTaskUnitData:getDiscountNum()
    local showDiscount = customActTaskUnitData:isDiscountNeedShow(discount)

    --奖励
    self:_updateRewards(customActTaskUnitData)
    --任务条件
	self._textTaskDes:setString(taskDes)


    self._nodeProgress:setVisible(not notShowProgress)
    if not notShowProgress then
		if onlyShowMax then
			local richText = Lang.get("customactivity_task_progress_04",
			{title = progressTitle,max = TextHelper.getAmountText2(value02),titleColor = Colors.colorToNumber(Colors.BRIGHT_BG_TWO), 
                maxColor = Colors.colorToNumber(value02 <= 0 and Colors.BRIGHT_BG_RED or Colors.BRIGHT_BG_ONE ) })
			self:_createProgressRichText(richText)
		elseif value01 > 0 then
			local richText = Lang.get("customactivity_task_progress_02",
				{title = progressTitle,curr = TextHelper.getAmountText2(value01),max = TextHelper.getAmountText2(value02)})
			self:_createProgressRichText(richText)
		else
			--不满条件
			local richText = Lang.get("customactivity_task_progress_01",
			{title = progressTitle,curr = TextHelper.getAmountText2(value01),max = TextHelper.getAmountText2(value02)})
			self:_createProgressRichText(richText)
		end
	end

    --折扣刷新
   
    self._imageDiscount:setVisible(showDiscount)
  
    if showDiscount and discount >=1 and discount <= 9 then
          --[[
            self._imageDiscount:setPositionX(self._textTaskDes:getPositionX() +
                self._textTaskDes:getContentSize().width + CustomActivityExchangeItemCell.POS_OFFSET_DISCOUNT)
         ]]

        self._imageDiscount:loadTexture(Path.getDiscountImg(math.floor(discount)))
       -- self._textDiscount:setString( Lang.get("customactivity_discount_num",{discount = discount}))
    end

    --按钮和领取标记
    self._commonButtonLargeNormal:setVisible(true)
    self._commonButtonLargeNormal:setEnabled(true)
    self._imageUnReceive:setVisible(false)
    self._commonButtonLargeNormal:setString(buttonTxt)
    self._imageReceive:setVisible(false)

    if activityUnitData:isActInPreviewTime() then
        self._commonButtonLargeNormal:setVisible(false)
        self._imageUnReceive:setVisible(true)
    else
        if reachReceiveCondition then
            if canReceive then
                --可兑换
            else--已经兑换了
                -- self._commonButtonLargeNormal:setString(Lang.get("days7activity_btn_already_exchange"))
                -- self._commonButtonLargeNormal:setEnabled(false)
                self._commonButtonLargeNormal:setVisible(false)
                self._imageReceive:setVisible(true)
            end
        else
            if functionId ~= 0 then
                --要跳转
            else
                self._commonButtonLargeNormal:setEnabled(false)
            end
        end
    end
end


function CustomActivityExchangeItemCell:setCallBack(callback)
	if callback then
		self._callback = callback
	end
end

return CustomActivityExchangeItemCell
