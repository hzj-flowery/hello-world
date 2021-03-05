-- Author: conley
local ListViewCellBase = require("app.ui.ListViewCellBase")
local LuxuryGiftPkgItemCell = class("LuxuryGiftPkgItemCell", ListViewCellBase)
local UserDataHelper = require("app.utils.UserDataHelper")
local ActivityConst = require("app.const.ActivityConst")
local GIFT_PKG_TITLE_IMG = {"img_onechaozhilibao", "img_sanchaozhilibao", "img_liuchaozhilibao"}

LuxuryGiftPkgItemCell.REWARD_RMB_SCALE = 10 --奖励缩放

function LuxuryGiftPkgItemCell:ctor()
	self._resourceNode = nil --根节点
	self._commonIconTemplate1 = nil --道具Item
	self._commonIconTemplate2 = nil --道具Item
	self._commonButtonMediumNormal = nil --购买按钮
	self._textItemName = nil --礼包名称
	self._nodeCondition1 = nil
	--富文本的父节点
	self._nodeCondition2 = nil
	--富文本的父节点
	self._imageReceive = nil
	--已领取图片
	self._conditionRichTextArr = {}
	--富文本
	self._nodeIcon = nil
	local resource = {
		file = Path.getCSB("LuxuryGiftPkgItemCell", "activity/luxurygiftpkg"),
		binding = {
			_commonButtonMediumNormal = {
				events = {{event = "touch", method = "_onClickBuyBtn"}}
			}
		}
	}
	LuxuryGiftPkgItemCell.super.ctor(self, resource)
end

function LuxuryGiftPkgItemCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

	self._imageReceive:setVisible(false)

	-- self._commonButtonMediumNormal:setString(Lang.get("lang_activity_luxurygiftpkg_buy"))
end

function LuxuryGiftPkgItemCell:_onClickBuyBtn()
	local curSelectedPos = self:getTag()
	logWarn("LuxuryGiftPkgItemCell:_onIconClicked  " .. curSelectedPos)
	self:dispatchCustomCallback(curSelectedPos)
end

--创建领取条件富文本
function LuxuryGiftPkgItemCell:_createConditionRichText(richText, index)
	if self._conditionRichTextArr[index] then
		self._conditionRichTextArr[index]:removeFromParent()
	end
	local widget = ccui.RichText:createWithContent(richText)
	widget:setAnchorPoint(cc.p(0.5, 0.5))
	self["_nodeCondition" .. index]:addChild(widget)
	self._conditionRichTextArr[index] = widget
end

function LuxuryGiftPkgItemCell:updateUI(vipPayCfg, index)
	logWarn(" HHH---------  " .. index)
	local unitDataList = G_UserData:getActivityLuxuryGiftPkg():getUnitDatasByPayType(index)
	local actLuxuryGiftPkgUnitData = unitDataList[1]
	local cfg = actLuxuryGiftPkgUnitData:getConfig()
	local vipConfig = actLuxuryGiftPkgUnitData:getVipConfig()
	local remainBuyTime = actLuxuryGiftPkgUnitData:getRemainBuyTime()
	local enabled = remainBuyTime > 0
	local rewards = UserDataHelper.makeRewards(cfg, 3)
	--最多3个奖励
	local showRewards = UserDataHelper.makeRewards(cfg, 3, "show_")
	--最多2个奖励
	local canReceive = G_UserData:getActivityLuxuryGiftPkg():isCanReceiveGiftPkg()

	local commonIconTemplateList = self._nodeIcon:getChildren()
	for k, v in ipairs(commonIconTemplateList) do
		if rewards[k] then
			--v:showCount(false)
			v:setVisible(true)
			v:unInitUI()
			v:initUI(rewards[k].type, rewards[k].value, rewards[k].size)
			v:setTouchEnabled(true)
		else
			v:setVisible(false)
		end
	end
	self._commonListViewItem:setItemSpacing(4)
	self._commonListViewItem:updateUI(showRewards, nil, true)
	self._commonListViewItem:alignCenter()

	self._textItemName:setString(vipConfig.name)
	self._imageItemName:loadTexture(Path.getActivityTextRes(GIFT_PKG_TITLE_IMG[index]))

	self._commonButtonMediumNormal:setVisible(true)

	local richText =
		Lang.get(
		"lang_activity_luxurygiftpkg_intro_01",
		{
			value = vipConfig.gold
		}
	)
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	if LogicCheckHelper.enoughOpenDay(ActivityConst.ACT_DAILY_LIMIT_OPEN_DAY) == false then -- 是否开服天数大于24
		self:_createConditionRichText(richText, 1)
		local richText2 =
			Lang.get(
			"lang_activity_luxurygiftpkg_intro_02",
			{
				value = vipConfig.rmb * LuxuryGiftPkgItemCell.REWARD_RMB_SCALE
			}
		)
		self:_createConditionRichText(richText2, 2)
		-- logWarn("open day less 24")
	else
		self:_createRichItems(index)
		-- logWarn("open day more 24")
	end

	if not enabled then
		self._commonButtonMediumNormal:setString(Lang.get("common_already_buy"))
		self._commonButtonMediumNormal:switchToHightLight()
	elseif canReceive then
		self._commonButtonMediumNormal:setString(Lang.get("common_receive"))
		self._commonButtonMediumNormal:switchToHightLight()
	else
		self._commonButtonMediumNormal:setString(Lang.get("lang_activity_luxurygiftpkg_buy", {value = vipConfig.rmb}))
		self._commonButtonMediumNormal:switchToNormal()
	end
	self._commonButtonMediumNormal:setEnabled(enabled)
end

function LuxuryGiftPkgItemCell:_createRichItems(index)
	local unitDataList = G_UserData:getActivityLuxuryGiftPkg():getUnitDatasByPayType(index)
	local actLuxuryGiftPkgUnitData = unitDataList[1]
	local cfg = actLuxuryGiftPkgUnitData:getConfig()
	local paramList = {
		[1] = {
			type = "label",
			text = Lang.get("lang_activity_luxurygiftpkg_intro_02_1"),
			fontSize = 18,
			color = Colors.NORMAL_BG_ONE,
			anchorPoint = cc.p(0, 0.5)
		},
		[2] = {
			type = "image",
			name = "gold",
			texture = Path.getResourceMiniIcon(cfg.value_4)
		},
		[3] = {
			type = "label",
			name = "value",
			text = cfg.size_4,
			fontSize = 18,
			color = Colors.BRIGHT_BG_GREEN
		}
	}
	if self._conditionRichTextArr[index] then
		self._conditionRichTextArr[index]:removeFromParent()
	end
	local UIHelper = require("yoka.utils.UIHelper")
	local node = UIHelper.createRichItems(paramList, false)
	node:setPosition(cc.p(-60, -2))
	local gold = node:getChildByName("gold")
	gold:ignoreContentAdaptWithSize(false)
	gold:setContentSize(cc.size(25, 25))
	gold:setPositionY(gold:getPositionY() - 3)
	local value = node:getChildByName("value")
	value:setPositionX(value:getPositionX() - 8)
	self._nodeCondition2:addChild(node)
	self._conditionRichTextArr[index] = node
end

return LuxuryGiftPkgItemCell
