-- Author: conley
local ListViewCellBase = require("app.ui.ListViewCellBase")
local CSHelper = require("yoka.utils.CSHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local CommonConst = require("app.const.CommonConst")
local CustomActivityConst = require("app.const.CustomActivityConst")
local CustomActivityReturnGiftCell = class("CustomActivityReturnGiftCell", ListViewCellBase)
local TextHelper = require("app.utils.TextHelper")
local VipPay = require("app.config.vip_pay")

local return_charge_award = require("app.config.return_charge_award")
local return_charge_active = require("app.config.return_charge_active")

 CustomActivityReturnGiftCell.LINE_ITEM_NUM = 1


 CustomActivityReturnGiftCell.ITEM_GAP = 106--奖励道具之间的间隔
 CustomActivityReturnGiftCell.ITEM_ADD_GAP = 132--+道具之间的间隔
 CustomActivityReturnGiftCell.ITEM_OR_GAP = 132--可选奖励道具之间间隔

function CustomActivityReturnGiftCell:ctor()
	self._commonRewardListNode  = nil --奖励列表
	self._commonButtonLargeNormal  = nil--领取按钮
    self._textTaskDes = nil--任务描述
	self._nodeProgress = nil--进度富文本的父节点

	self._callback = nil


	local resource = {
		file = Path.getCSB("CustomActivityTaskItemCell", "customactivity"),
		binding = {
			_commonButtonLargeNormal = {
				events = {{event = "touch", method = "_onTouchCallBack"}}
			}
		},
	}
	CSHelper.createResourceNode(self, resource)
	self:_onCreate()
end

function CustomActivityReturnGiftCell:_onCreate()
    local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	self._commonButtonLargeNormal:setSwallowTouches(false)
   -- self._commonButtonLargeNormal:addTouchEventListenerEx(handler(self, self._onTouchCallBack),false)
end

function CustomActivityReturnGiftCell:onClickBtn()
    if self._callback then
        self._callback(self)
    end

    self:_onItemClick(self)
end

function CustomActivityReturnGiftCell:_onItemClick(sender)
	local curSelectedPos = sender:getTag()
	logWarn("CustomActivityReturnGiftCell:_onIconClicked  "..curSelectedPos)
	self:dispatchCustomCallback(curSelectedPos)
end


function CustomActivityReturnGiftCell:_onTouchCallBack(sender,state)
	-----------防止拖动的时候触发点击
	if(state == ccui.TouchEventType.ended) or not state then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
			self:onClickBtn()
		end
	end

end

function CustomActivityReturnGiftCell:onClickItem(sender)
	local tag = self:getTag()
end

function CustomActivityReturnGiftCell:_updateRewards(giftInfo, vipPayInfo)
    local award1 = giftInfo.award1
    local award2 = giftInfo.award2

	local rewards = {}
    local rewardTypes = {}

    if award1 and award1 > 0 then
        local rewardInfo = return_charge_award.get(award1)
        local reward = {type = rewardInfo.type, value = rewardInfo.value, size = rewardInfo.size}
        table.insert( rewards, reward )
        table.insert( rewardTypes, CustomActivityConst.REWARD_TYPE_ALL )
    end

    if award2 and award2 > 0 then
        local rewardInfo = return_charge_award.get(award2)
        local reward = {type = rewardInfo.type, value = rewardInfo.value, size = rewardInfo.size}
        table.insert( rewards, reward )
        table.insert( rewardTypes, CustomActivityConst.REWARD_TYPE_ALL )
    end

    if vipPayInfo then
        local goldNum = vipPayInfo.gold
        local reward = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_DIAMOND, size = goldNum}
        table.insert( rewards, reward )
        table.insert( rewardTypes, CustomActivityConst.REWARD_TYPE_ALL )
    end

    self._commonRewardListNode:setGaps(CustomActivityReturnGiftCell.ITEM_GAP,CustomActivityReturnGiftCell.ITEM_ADD_GAP ,
        CustomActivityReturnGiftCell.ITEM_OR_GAP)
    self._commonRewardListNode:updateInfo(rewards,rewardTypes)
end

--创建富文本
function CustomActivityReturnGiftCell:_createProgressRichText(richText)
	self._nodeProgress:removeAllChildren()
    local widget = ccui.RichText:createWithContent(richText)
    widget:setAnchorPoint(cc.p(1,0.5))
    self._nodeProgress:addChild(widget)
end

function CustomActivityReturnGiftCell:updateInfo(data)
    --名称
    local giftId = data.giftId
    local giftInfo = return_charge_active.get(giftId)
    local vipPayInfo = VipPay.get(giftInfo.vip_pay_id)
    self._textTaskDes:setString(vipPayInfo.rmb .. Lang.get("lang_recharge_return_gift"))
    
    --奖励
    self:_updateRewards(giftInfo, vipPayInfo)

    self._nodeProgress:setVisible(false)

    self._commonButtonLargeNormal:setString(Lang.get("customactivity_btn_name_pay", {value = vipPayInfo.rmb}))

    --按钮和领取标记
    if data.isGot == 1 then
        self._commonButtonLargeNormal:setVisible(false)
        self._commonButtonLargeNormal:setEnabled(false)
		self._imageGot:setVisible(true)
    else
        self._imageGot:setVisible(false)
        self._commonButtonLargeNormal:setVisible(true)
        self._commonButtonLargeNormal:setEnabled(true)
    end
end


function CustomActivityReturnGiftCell:setCallBack(callback)
	if callback then
		self._callback = callback
	end
end

return CustomActivityReturnGiftCell
