-- Author: conley
local ListViewCellBase = require("app.ui.ListViewCellBase")
local ActivityOpenServerFundConst = require("app.const.ActivityOpenServerFundConst")
local OpenServerFundItemCell = class("OpenServerFundItemCell", ListViewCellBase)

function OpenServerFundItemCell:ctor()
	self._resourceNode = nil --根节点
	self._commonIconTemplate = nil --道具Item
	self._commonButtonMediumNormal = nil--领取按钮
	self._textItemName = nil--道具名称
	self._nodeCondition = nil--富文本节点
	self._imageReceive = nil--已领取图片
    self._conditionRichText = nil--富文本
    self._imageConditionBg = nil 
	local resource = {
		file = Path.getCSB("OpenServerFundItemCell", "activity/openserverfund"),
		binding = {
			_commonButtonMediumNormal = {
				events = {{event = "touch", method = "_onItemClick"}}
			}
		},
	}
	OpenServerFundItemCell.super.ctor(self, resource)
end

function OpenServerFundItemCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

    self._commonButtonMediumNormal:setString(Lang.get("lang_activity_fund_receive"))
    self._commonButtonMediumNormal:setSwallowTouches(false)
end

function OpenServerFundItemCell:_onItemClick(sender,state)

    if state == ccui.TouchEventType.ended or not state then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
        	local curSelectedPos = self:getTag()
            logWarn("OpenServerFundItemCell:_onIconClicked  "..curSelectedPos)
            self:dispatchCustomCallback(curSelectedPos)
		end
	end


end


--创建领取条件富文本
function OpenServerFundItemCell:_createConditionRichText(richText)
    if self._conditionRichText then
		self._conditionRichText:removeFromParent()
	end
    local widget = ccui.RichText:createWithContent(richText)
    widget:setAnchorPoint(cc.p(0,0.5))
    self._nodeCondition:addChild(widget)
    self._conditionRichText =  widget
    
    widget:formatText()
    local labelSize = widget:getContentSize()
    local size = self._imageConditionBg:getContentSize()
    self._imageConditionBg:setContentSize(cc.size(labelSize.width+11,size.height))
end

function OpenServerFundItemCell:updateUI(actOpenServerFundUnitData)
	local cfg = actOpenServerFundUnitData:getConfig()
    local vipLevel = G_UserData:getActivityOpenServerFund():getGrowFundNeedVipLevel()
	self._commonIconTemplate:unInitUI()
	self._commonIconTemplate:initUI( cfg.reward_type, cfg.reward_value, cfg.reward_size)
	self._commonIconTemplate:setTouchEnabled(true)
    -- self._commonIconTemplate:showCount(false)

    local itemParams = self._commonIconTemplate:getItemParams()
	self._textItemName:setString(tostring(cfg.reward_size)..itemParams.name)
	--self._textItemName:setColor(itemParams.icon_color)
	--self._textItemName:enableOutline(itemParams.icon_color_outline, 2)

    local isCanReceive = actOpenServerFundUnitData:canReceive()
    local isReceive = actOpenServerFundUnitData:isHasReceive()
    if isReceive then
        self._commonButtonMediumNormal:setVisible(false)
        self._imageReceive:setVisible(true)
    else
        self._commonButtonMediumNormal:setVisible(true)
        self._imageReceive:setVisible(false)

        self._commonButtonMediumNormal:setEnabled(isCanReceive)

    end
    if cfg.fund_type == ActivityOpenServerFundConst.FUND_TYPE_GROW then
        local richText = nil
        if cfg.fund_value ~= 0  then
             richText = Lang.get("lang_activity_fund_condition_01",
            {
                level = cfg.fund_value,
            })
        else
            richText = Lang.get("lang_activity_fund_condition_03")
        end

        self:_createConditionRichText(richText)
    elseif cfg.fund_type == ActivityOpenServerFundConst.FUND_TYPE_SERVER_REWARD then
        local richText = Lang.get("lang_activity_fund_condition_02",
        {
            people = cfg.fund_value,
        })
        self:_createConditionRichText(richText)
    end
end


return OpenServerFundItemCell
