-- Author: conley
local ListViewCellBase = require("app.ui.ListViewCellBase")
local CSHelper = require("yoka.utils.CSHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local CommonConst = require("app.const.CommonConst")
local CustomActivityConst = require("app.const.CustomActivityConst")
local CustomActivityRechargeTaskItemCell = class("CustomActivityRechargeTaskItemCell", ListViewCellBase)
local TextHelper = require("app.utils.TextHelper")

 CustomActivityRechargeTaskItemCell.LINE_ITEM_NUM = 1


 CustomActivityRechargeTaskItemCell.ITEM_GAP = 106--奖励道具之间的间隔
 CustomActivityRechargeTaskItemCell.ITEM_ADD_GAP = 132--+道具之间的间隔
 CustomActivityRechargeTaskItemCell.ITEM_OR_GAP = 132--可选奖励道具之间间隔

function CustomActivityRechargeTaskItemCell:ctor()
	self._commonRewardListNode  = nil --奖励列表
	self._commonButtonLargeNormal  = nil--领取按钮
    self._textTaskDes = nil--任务描述
	self._nodeProgress = nil--进度富文本的父节点

	self._callback = nil


	local resource = {
		file = Path.getCSB("CustomActivityRechargeTaskItemCell", "customactivity"),
		binding = {
			_commonButtonLargeNormal = {
				events = {{event = "touch", method = "_onTouchCallBack"}}
			}
		},
	}
	CSHelper.createResourceNode(self, resource)
	self:_onCreate()
end

function CustomActivityRechargeTaskItemCell:_onCreate()
    local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	self._commonButtonLargeNormal:setSwallowTouches(false)
   -- self._commonButtonLargeNormal:addTouchEventListenerEx(handler(self, self._onTouchCallBack),false)
end

function CustomActivityRechargeTaskItemCell:onClickBtn()
    if self._callback then
        self._callback(self)
    end

    self:_onItemClick(self)
end

function CustomActivityRechargeTaskItemCell:_onItemClick(sender)
	local curSelectedPos = sender:getTag()
	logWarn("CustomActivityRechargeTaskItemCell:_onIconClicked  "..curSelectedPos)
	self:dispatchCustomCallback(curSelectedPos)
end


function CustomActivityRechargeTaskItemCell:_onTouchCallBack(sender,state)
	-----------防止拖动的时候触发点击
	if(state == ccui.TouchEventType.ended) or not state then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
			self:onClickBtn()
		end
	end

end

function CustomActivityRechargeTaskItemCell:onClickItem(sender)
	local tag = self:getTag()
end

function CustomActivityRechargeTaskItemCell:_updateRewards(actTaskUnitData)
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
    self._commonRewardListNode:setGaps(CustomActivityRechargeTaskItemCell.ITEM_GAP,CustomActivityRechargeTaskItemCell.ITEM_ADD_GAP ,
        CustomActivityRechargeTaskItemCell.ITEM_OR_GAP)
    self._commonRewardListNode:updateInfo(rewards,rewardTypes)
end

--创建富文本
function CustomActivityRechargeTaskItemCell:_createProgressRichText(richText)
	self._nodeProgress:removeAllChildren()
    local widget = ccui.RichText:createWithContent(richText)
    widget:setAnchorPoint(cc.p(1,0.5))
    self._nodeProgress:addChild(widget)
end




function CustomActivityRechargeTaskItemCell:updateInfo(data)
	local customActTaskUnitData = data.actTaskUnitData
    local activityUnitData = data.actUnitData--G_UserData:getCustomActivity():getActUnitDataById(customActTaskUnitData:getAct_id())
    local reachReceiveCondition = data.reachReceiveCondition -- G_UserData:getCustomActivity():isTaskReachReceiveCondition(customActTaskUnitData:getAct_id(),customActTaskUnitData:getId())
    local canReceive = data.canReceive --G_UserData:getCustomActivity():isTaskCanReceived(customActTaskUnitData:getAct_id(),customActTaskUnitData:getId())
    local buttonTxt = activityUnitData:getButtonTxt()
	local taskDes = customActTaskUnitData:getDescription()
	local progressTitle = customActTaskUnitData:getProgressTitle()
	local value01,value02,onlyShowMax = customActTaskUnitData:getProgressValue()
    local functionId = activityUnitData:getFunctionId()
    local notShowProgress =  activityUnitData:getShow_schedule() ~= CommonConst.TRUE_VALUE

	--logWarn(tostring(reachReceiveCondition).." CustomActivityRechargeTaskItemCell "..tostring(canReceive))

	--奖励
    self:_updateRewards(customActTaskUnitData)
    --任务条件
	self._textTaskDes:setString(taskDes)

	--刷新进度
    self._nodeProgress:setVisible(not notShowProgress)
	if not notShowProgress then
		if onlyShowMax then
			local richText = Lang.get("customactivity_task_progress_03",
			{title = progressTitle,max = TextHelper.getAmountText2(value02)})
			self:_createProgressRichText(richText)
		elseif reachReceiveCondition then
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


    --按钮和领取标记
    self._commonButtonLargeNormal:setVisible(true)
    self._commonButtonLargeNormal:setEnabled(true)
    self._commonButtonLargeNormal:setString(buttonTxt)
	--self._commonButtonLargeNormal:switchToNormal()
    self._imageReceive:setVisible(false)
    if reachReceiveCondition then
		if canReceive then
            --可领取
            self._commonButtonLargeNormal:setString(Lang.get("days7activity_btn_receive"))
		else--已经领取了
			 self._commonButtonLargeNormal:setString(Lang.get("days7activity_btn_already_receive"))
			 -- self._commonButtonLargeNormal:setEnabled(false)
             self._commonButtonLargeNormal:setVisible(false)
             self._imageReceive:setVisible(true)
		end
	else
        if functionId ~= 0 then
            --要跳转
			self._commonButtonLargeNormal:switchToHightLight()
        else
            self._commonButtonLargeNormal:setEnabled(false)
        end
    end
end


function CustomActivityRechargeTaskItemCell:setCallBack(callback)
	if callback then
		self._callback = callback
	end
end

return CustomActivityRechargeTaskItemCell
