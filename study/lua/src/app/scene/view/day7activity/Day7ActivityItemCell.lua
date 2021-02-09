-- Author: conley
local ListViewCellBase = require("app.ui.ListViewCellBase")
local CSHelper = require("yoka.utils.CSHelper")
local Day7ActivityConst = require("app.const.Day7ActivityConst")
local Day7ActivityItemCell = class("Day7ActivityItemCell", ListViewCellBase)
local TextHelper = require("app.utils.TextHelper")

 Day7ActivityItemCell.LINE_ITEM_NUM = 1

 Day7ActivityItemCell.IMG_RECEIVE =  "img_receive"

 Day7ActivityItemCell.ITEM_GAP = 106--奖励道具之间的间隔
 Day7ActivityItemCell.ITEM_ADD_GAP = 145--+道具之间的间隔
 Day7ActivityItemCell.ITEM_OR_GAP = 134--可选奖励道具之间间隔
 Day7ActivityItemCell.SCROLL_WIDTH = 576--滚动距离

function Day7ActivityItemCell:ctor()
	self._commonIconTemplate1  = nil
	self._commonButtonLevel1Normal  = nil
    self._textItemName = nil
    self._imageReceive = nil
	self._nodeProgressRichText = nil

    self._commonRewardListNode = nil--奖励列表
	self._callback = nil

    self._richTextProgress = nil
	local resource = {
		file = Path.getCSB("Day7ActivityItemCell", "day7activity"),
		binding = {
			_commonButtonLevel1Normal = {
				events = {{event = "touch", method = "_onTouchCallBack"}}
			},
		},
	}
	Day7ActivityItemCell.super.ctor(self,resource)
end

function Day7ActivityItemCell:onCreate()
    local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
    self._commonButtonLevel1Normal:setSwallowTouches(false)
end

function Day7ActivityItemCell:_onTouchCallBack(sender,state)
    if(state == ccui.TouchEventType.ended) or not state then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
            if self._callback then
                self._callback(self)
            end
            self:_onItemClick(self)
		end
	end
end

function Day7ActivityItemCell:_onItemClick(sender)
	local curSelectedPos = sender:getTag()
	logWarn("Day7ActivityItemCell:_onIconClicked  "..curSelectedPos)
	self:dispatchCustomCallback(curSelectedPos)
end


function Day7ActivityItemCell:_updateRewards(actTaskUnitData)
    local cfg = actTaskUnitData:getConfig()
    local rewards = actTaskUnitData:getRewards()
    local CustomActivityConst = require("app.const.CustomActivityConst")
    local rewardTypes = {}
    for k,v in ipairs(rewards) do
        if cfg.reward_type == Day7ActivityConst.REWARD_TYPE_SELECT then
            rewardTypes[k] = CustomActivityConst.REWARD_TYPE_SELECT
        else
            rewardTypes[k] = CustomActivityConst.REWARD_TYPE_ALL
        end
    end
    self._commonRewardListNode:setGaps(Day7ActivityItemCell.ITEM_GAP,Day7ActivityItemCell.ITEM_ADD_GAP ,
        Day7ActivityItemCell.ITEM_OR_GAP,Day7ActivityItemCell.SCROLL_WIDTH )
    self._commonRewardListNode:updateInfo(rewards,rewardTypes)
end

--创建富文本
function Day7ActivityItemCell:_createProgressRichText(richText)
    if self._richTextProgress then
		self._richTextProgress:removeFromParent()
	end
    local widget = ccui.RichText:createWithContent(richText)
    widget:setAnchorPoint(cc.p(1,0.5))
    self._nodeProgressRichText:addChild(widget)
	self._richTextProgress =  widget

end

function Day7ActivityItemCell:updateInfo(actTaskUnitData)
	local cfg = actTaskUnitData:getConfig()
    self:_updateRewards(actTaskUnitData)
    --任务条件
	self._textItemName:setString(actTaskUnitData:getDescription())


    local value = actTaskUnitData:getTaskValue()
    local hasReceived =  G_UserData:getDay7Activity():isTaskReceivedReward(actTaskUnitData:getId())
    local reachReceiveCondition = actTaskUnitData:isHasReach()
    local canReceive = actTaskUnitData:isCanTaken()

    local showProgress = cfg.show_rate == 1 --cfg.task_value_1 == 0 and value == 0
    self._nodeProgressRichText:setVisible( showProgress)


    if reachReceiveCondition then
		local richText = Lang.get("days7activity_task_progress_02",
            {curr = TextHelper.getAmountText2(value),max = TextHelper.getAmountText2(cfg.task_value_1) })
        self:_createProgressRichText(richText)
	else
        --不满条件
        local richText = Lang.get("days7activity_task_progress_01",
            {curr = TextHelper.getAmountText2(value),max = TextHelper.getAmountText2(cfg.task_value_1)})
        self:_createProgressRichText(richText)
    end

    --按钮和领取标记
    self._commonButtonLevel1Normal:setVisible(true)
    self._commonButtonLevel1Normal:setEnabled(true)
    self._commonButtonLevel1Normal:setString(cfg.button_txt)
    self._imageReceive:setVisible(false)
    if hasReceived then--已经购买了
        self._commonButtonLevel1Normal:setVisible(false)
        self._imageReceive:setVisible(true)
        --self._imageReceive:loadTexture(Path.getTextSign( Day7ActivityItemCell.IMG_RECEIVE))
    elseif reachReceiveCondition then
		--if canReceive then
            --可领取
            if cfg.function_id ~= 0 then
                self._commonButtonLevel1Normal:setString(Lang.get("days7activity_btn_receive"))
            end
		--end
	else
        if cfg.function_id ~= 0 then
            --要跳转
        else
            self._commonButtonLevel1Normal:setEnabled(false)
        end
    end
end


function Day7ActivityItemCell:setCallBack(callback)
	if callback then
		self._callback = callback
	end
end

return Day7ActivityItemCell
