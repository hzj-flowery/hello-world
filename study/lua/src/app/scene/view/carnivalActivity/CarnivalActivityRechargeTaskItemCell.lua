-- Author: conley
local ListViewCellBase = require("app.ui.ListViewCellBase")
local CSHelper = require("yoka.utils.CSHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local CommonConst = require("app.const.CommonConst")
local CustomActivityConst = require("app.const.CustomActivityConst")
local CarnivalActivityRechargeTaskItemCell = class("CarnivalActivityRechargeTaskItemCell", ListViewCellBase)
local TextHelper = require("app.utils.TextHelper")

 CarnivalActivityRechargeTaskItemCell.LINE_ITEM_NUM = 1


 CarnivalActivityRechargeTaskItemCell.ITEM_GAP = 106--奖励道具之间的间隔
 CarnivalActivityRechargeTaskItemCell.ITEM_ADD_GAP = 132--+道具之间的间隔
 CarnivalActivityRechargeTaskItemCell.ITEM_OR_GAP = 132--可选奖励道具之间间隔
 CarnivalActivityRechargeTaskItemCell.SCROLL_WIDTH = 550--滚动距离

function CarnivalActivityRechargeTaskItemCell:ctor()
	self._commonRewardListNode  = nil --奖励列表
	self._commonButtonLargeNormal  = nil--领取按钮
    self._textTaskDes = nil--任务描述
	self._nodeProgress = nil--进度富文本的父节点

	self._callback = nil

	local resource = {
		file = Path.getCSB("CarnivalActivityRechargeTaskItemCell", "carnivalActivity"),
		binding = {
			_commonButtonLargeNormal = {
				events = {{event = "touch", method = "_onTouchCallBack"}}
			}
		},
	}
	CarnivalActivityRechargeTaskItemCell.super.ctor(self, resource)
end

function CarnivalActivityRechargeTaskItemCell:onCreate()
    local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	self._commonButtonLargeNormal:setSwallowTouches(false)
end

function CarnivalActivityRechargeTaskItemCell:onClickBtn()
    if self._callback then
        self._callback(self)
    end

    self:_onItemClick(self)
end

function CarnivalActivityRechargeTaskItemCell:_onItemClick(sender)
	local curSelectedPos = sender:getTag()
	logWarn("CarnivalActivityRechargeTaskItemCell:_onIconClicked  "..curSelectedPos)
	self:dispatchCustomCallback(curSelectedPos)
end


function CarnivalActivityRechargeTaskItemCell:_onTouchCallBack(sender,state)
	-----------防止拖动的时候触发点击
	if(state == ccui.TouchEventType.ended) or not state then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
			self:onClickBtn()
		end
	end

end

function CarnivalActivityRechargeTaskItemCell:onClickItem(sender)
	local tag = self:getTag()
end

function CarnivalActivityRechargeTaskItemCell:_updateRewards(actTaskUnitData)
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
    self._commonRewardListNode:setGaps(CarnivalActivityRechargeTaskItemCell.ITEM_GAP,CarnivalActivityRechargeTaskItemCell.ITEM_ADD_GAP ,
        CarnivalActivityRechargeTaskItemCell.ITEM_OR_GAP, CarnivalActivityRechargeTaskItemCell.SCROLL_WIDTH)
    self._commonRewardListNode:updateInfo(rewards,rewardTypes)
end

--创建富文本
function CarnivalActivityRechargeTaskItemCell:_createProgressRichText(richText)
	self._nodeProgress:removeAllChildren()
    local widget = ccui.RichText:createWithContent(richText)
    widget:setAnchorPoint(cc.p(1,0.5))
    self._nodeProgress:addChild(widget)
end


function CarnivalActivityRechargeTaskItemCell:updateInfo(data)
	local customActTaskUnitData = data.actTaskUnitData
    local activityUnitData = data.actUnitData
    local reachReceiveCondition = data.reachReceiveCondition
	local hasReceive = data.hasReceive
    local canReceive = data.canReceive
    local hasLimit = data.hasLimit
    local timeLimit = data.timeLimit

    local buttonTxt = customActTaskUnitData:getButtonTxt()
	local taskDes = customActTaskUnitData:getDescription()
	local progressTitle = customActTaskUnitData:getProgressTitle()
	local value01,value02,onlyShowMax = customActTaskUnitData:getProgressValue()
    local functionId = customActTaskUnitData:getQuestNotFinishJumpFunctionID()
    local notShowProgress =  activityUnitData:getShow_schedule() ~= CommonConst.TRUE_VALUE

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
	self._commonButtonLargeNormal:switchToNormal()
    self._imageReceive:setVisible(false)

  
	if canReceive then --可领取 
        self._commonButtonLargeNormal:setString(Lang.get("days7activity_btn_receive"))
    elseif hasReceive then--已经领取了
        self._commonButtonLargeNormal:setString(Lang.get("days7activity_btn_already_receive"))
		self._commonButtonLargeNormal:setVisible(false)
		self._imageReceive:setVisible(true)
    elseif hasLimit or timeLimit then--次数限制，活动当前只是预览     
        self._commonButtonLargeNormal:setEnabled(false)
    else--条件不满足
        if functionId ~= 0 then
            --要跳转
			self._commonButtonLargeNormal:switchToHightLight()
        else
            self._commonButtonLargeNormal:setEnabled(false)
        end
    end

end


function CarnivalActivityRechargeTaskItemCell:setCallBack(callback)
	if callback then
		self._callback = callback
	end
end

return CarnivalActivityRechargeTaskItemCell
