-- Author: conley
local ListViewCellBase = require("app.ui.ListViewCellBase")
local CSHelper = require("yoka.utils.CSHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local CustomActivityConst = require("app.const.CustomActivityConst")
local CommonConst = require("app.const.CommonConst")
local CustomActivityYuBiExchangeCell = class("CustomActivityYuBiExchangeCell", ListViewCellBase)
local TextHelper = require("app.utils.TextHelper")
 CustomActivityYuBiExchangeCell.LINE_ITEM_NUM = 1

 CustomActivityYuBiExchangeCell.ITEM_GAP = 106--奖励道具之间的间隔
 CustomActivityYuBiExchangeCell.ITEM_MID_GAP = 160--消耗和兑换道具之间间隔
 CustomActivityYuBiExchangeCell.ITEM_ADD_GAP = 132--+道具之间的间隔
 CustomActivityYuBiExchangeCell.ITEM_OR_GAP = 132--可选奖励道具之间间隔

 CustomActivityYuBiExchangeCell.POS_OFFSET_DISCOUNT = 10--折扣相对描述的位子偏移

function CustomActivityYuBiExchangeCell:ctor()
	self._commonItemListExchangeNode  = nil
	self._commonButtonLargeNormal  = nil
    self._textTaskDes = nil--任务描述
	self._nodeProgress = nil--进度富文本的父节点
    self._imageDiscount = nil--折扣背景图
    self._textDiscount = nil--折扣
	self._callback = nil
    self._data = nil

	local resource = {
		file = Path.getCSB("CustomActivityRechargeTaskItemCell", "customactivity"),
		binding = {
			_commonButtonLargeNormal = {
				events = {{event = "touch", method = "_onTouchCallBack"}}
			}
		},
	}
	CustomActivityYuBiExchangeCell.super.ctor(self, resource)
end

function CustomActivityYuBiExchangeCell:onCreate()
    local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
    self._commonButtonLargeNormal:setSwallowTouches(false)
end

function CustomActivityYuBiExchangeCell:onClickBtn()
    if self._callback then
        self._callback(self)
    end

    self:_onItemClick(self)
end

function CustomActivityYuBiExchangeCell:_onItemClick(sender)
	local curSelectedPos = sender:getTag()
	logWarn("CustomActivityYuBiExchangeCell:_onIconClicked  "..curSelectedPos)
	self:dispatchCustomCallback(curSelectedPos,self._data)
end


function CustomActivityYuBiExchangeCell:_onTouchCallBack(sender,state)
	-----------防止拖动的时候触发点击
	if(state == ccui.TouchEventType.ended) or not state then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
			self:onClickBtn()
		end
	end

end

function CustomActivityYuBiExchangeCell:onClickItem(sender)
	local tag = self:getTag()
end

function CustomActivityYuBiExchangeCell:_updateRewards(actTaskUnitData)
    local fixRewards = actTaskUnitData:getRewardItems()
	local selectRewards = actTaskUnitData:getSelectRewardItems()
	local rewardNum = #fixRewards + #selectRewards
	local rewards = {}
    local rewardTypes = {}
    for i = 1,rewardNum,1 do
         if i <= #fixRewards then
		 	rewards[i] = fixRewards[i]
		 	rewardTypes[i] = CustomActivityConst.REWARD_TYPE_ALL
         else
		 	rewards[i] = selectRewards[i-#fixRewards]
            rewardTypes[i] = CustomActivityConst.REWARD_TYPE_SELECT
         end
    end
    self._commonRewardListNode:setGaps(CustomActivityYuBiExchangeCell.ITEM_GAP,CustomActivityYuBiExchangeCell.ITEM_ADD_GAP ,
        CustomActivityYuBiExchangeCell.ITEM_OR_GAP, CustomActivityYuBiExchangeCell.SCROLL_WIDTH)
    self._commonRewardListNode:updateInfo(rewards,rewardTypes)
end


--创建富文本
function CustomActivityYuBiExchangeCell:_createProgressRichText(richText)
    self._nodeProgress:removeAllChildren()
    local widget = ccui.RichText:createWithContent(richText)
    widget:setAnchorPoint(cc.p(1,0.5))
    self._nodeProgress:addChild(widget)
end

function CustomActivityYuBiExchangeCell:updateInfo(data)
    self._data = data
    local customActTaskUnitData = data.actTaskUnitData
    local activityUnitData =  data.actUnitData
    local reachReceiveCondition = data.reachReceiveCondition
    local hasReceive = data.hasReceive
    local canReceive = data.canReceive
    local hasLimit = data.hasLimit
    local timeLimit = data.timeLimit
    local buttonTxt = customActTaskUnitData:getButtonTxt()
	local taskDes = customActTaskUnitData:getDescription()
	local progressTitle = customActTaskUnitData:getProgressTitle()
	local value01,value02,onlyShowMax = customActTaskUnitData:getProgressValue()
    --local functionId = customActTaskUnitData:getQuestNotFinishJumpFunctionID()
    local notShowProgress = false
    local discount = customActTaskUnitData:getDiscountNum()
    local showDiscount = customActTaskUnitData:isDiscountNeedShow(discount)
    


    logWarn(string.format(" %d ******************** %d",value01,value02))
    logWarn(string.format(" %s ********** %s ********** %s ********** %s",tostring(canReceive),tostring(reachReceiveCondition),tostring(hasLimit),
        tostring(hasReceive)
    ))


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
        self._imageDiscount:loadTexture(Path.getDiscountImg(math.floor(discount)))
    end

    --按钮和领取标记
    self._commonButtonLargeNormal:setVisible(true)
    self._commonButtonLargeNormal:setEnabled(true)
    self._commonButtonLargeNormal:setString("")

    self._textPrice:setString(buttonTxt)

    self._imageBuy:setVisible(false)

    self._imgCost:setVisible(true)
    self._textPrice:setVisible(true)

    if canReceive then --可兑换
        
    elseif hasReceive then--已经兑换了
        self._commonButtonLargeNormal:setVisible(false)
        self._imageBuy:setVisible(true)
        self._imgCost:setVisible(false)
        self._textPrice:setVisible(false)
    elseif hasLimit or timeLimit then--次数限制，活动当前只是预览     
        self._commonButtonLargeNormal:setEnabled(false)
    else--条件不满足
        -- if functionId ~= 0 then --要跳转
        -- else
        --     self._commonButtonLargeNormal:setEnabled(false)
        -- end  
        self._commonButtonLargeNormal:setEnabled(false)          
    end

end


function CustomActivityYuBiExchangeCell:setCallBack(callback)
	if callback then
		self._callback = callback
	end
end

return CustomActivityYuBiExchangeCell
