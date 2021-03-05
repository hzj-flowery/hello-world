-- Author: conley
local ListViewCellBase = require("app.ui.ListViewCellBase")
local CSHelper = require("yoka.utils.CSHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local CommonConst = require("app.const.CommonConst")
local CustomActivityConst = require("app.const.CustomActivityConst")
local CarnivalActivityTaskCell = class("CarnivalActivityTaskCell", ListViewCellBase)
local TextHelper = require("app.utils.TextHelper")

 CarnivalActivityTaskCell.LINE_ITEM_NUM = 1

 CarnivalActivityTaskCell.ITEM_GAP = 106--奖励道具之间的间隔
 CarnivalActivityTaskCell.ITEM_ADD_GAP = 132--+道具之间的间隔
 CarnivalActivityTaskCell.ITEM_OR_GAP = 132--可选奖励道具之间间隔
 CarnivalActivityTaskCell.SCROLL_WIDTH = 582--滚动距离

function CarnivalActivityTaskCell:ctor()
	self._commonRewardListNode  = nil --奖励列表
	self._commonButtonLargeNormal  = nil--领取按钮
    self._textTaskDes = nil--任务描述
	self._nodeProgress = nil--进度富文本的父节点
	self._callback = nil
    self._data = nil

	local resource = {
		file = Path.getCSB("CarnivalActivityTaskCell", "carnivalActivity"),
		binding = {
			_commonButtonLargeNormal = {
				events = {{event = "touch", method = "_onTouchCallBack"}}
			}
		},
	}
	CarnivalActivityTaskCell.super.ctor(self, resource)
end

function CarnivalActivityTaskCell:onCreate()
    local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	self._commonButtonLargeNormal:setSwallowTouches(false)
end



function CarnivalActivityTaskCell:onClickBtn()
    if self._callback then
        self._callback(self)
    end

    self:_onItemClick(self)
end

function CarnivalActivityTaskCell:_onItemClick(sender)
	local curSelectedPos = sender:getTag()
	logWarn("CarnivalActivityTaskCell:_onIconClicked  "..curSelectedPos)
	self:dispatchCustomCallback(curSelectedPos,self._data)
end


function CarnivalActivityTaskCell:_onTouchCallBack(sender,state)
	-----------防止拖动的时候触发点击
	if(state == ccui.TouchEventType.ended) or not state then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
			self:onClickBtn()
		end
	end

end

function CarnivalActivityTaskCell:onClickItem(sender)
	local tag = self:getTag()
end

function CarnivalActivityTaskCell:_updateRewards(actTaskUnitData)
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
    self._commonRewardListNode:setGaps(CarnivalActivityTaskCell.ITEM_GAP,CarnivalActivityTaskCell.ITEM_ADD_GAP ,
        CarnivalActivityTaskCell.ITEM_OR_GAP, CarnivalActivityTaskCell.SCROLL_WIDTH)
    self._commonRewardListNode:updateInfo(rewards,rewardTypes)
end

--创建富文本
function CarnivalActivityTaskCell:_createProgressRichText(richText)
	self._nodeProgress:removeAllChildren()
    local widget = ccui.RichText:createWithContent(richText)
    widget:setAnchorPoint(cc.p(1,0.5))
    self._nodeProgress:addChild(widget)
end

--[[
    actUnitData = actUnitData,
	actTaskUnitData = v,
	canReceive = canReceive,
	hasReceive = hasReceive,
	reachReceiveCondition = reachReceiveCondition,
	hasLimit = hasLimit,
]]
function CarnivalActivityTaskCell:updateInfo(data)
    self._data = data
	local customActTaskUnitData = data.actTaskUnitData
    local activityUnitData =  data.actUnitData
    local reachReceiveCondition = data.reachReceiveCondition
    local canReceive = data.canReceive
    local buttonTxt = customActTaskUnitData:getButtonTxt()
	local taskDes = customActTaskUnitData:getDescription()
	local progressTitle = customActTaskUnitData:getProgressTitle()
	local value01,value02,onlyShowMax = customActTaskUnitData:getProgressValue()
    local functionId = activityUnitData:getFunctionId()
    local notShowProgress =  activityUnitData:getShow_schedule() ~= CommonConst.TRUE_VALUE

	--logWarn(tostring(reachReceiveCondition).."---------"..tostring(canReceive))

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
    self._imageReceive:setVisible(false)
    if reachReceiveCondition then
		if canReceive then
            --可领取
            self._commonButtonLargeNormal:setString(Lang.get("days7activity_btn_receive"))
		else--已经领取了
			 self._commonButtonLargeNormal:setString(Lang.get("days7activity_btn_already_receive"))
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


function CarnivalActivityTaskCell:setCallBack(callback)
	if callback then
		self._callback = callback
	end
end

return CarnivalActivityTaskCell
