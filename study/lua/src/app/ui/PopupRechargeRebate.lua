
-- Author: nieming
-- Date:2018-02-13 14:02:25
-- Describle：

local PopupBase = require("app.ui.PopupBase")
local PopupRechargeRebate = class("PopupRechargeRebate", PopupBase)
local CSHelper = require("yoka.utils.CSHelper")

function PopupRechargeRebate:ctor()
	--csb bind var name
	self._btnOk = nil  --CommonButtonNormal
	self._commonNodeBk = nil  --CommonNormalSmallPop
	self._listViewDrop = nil  --ListView
	self._nodeChapter = nil  --SingleNode
	self._richTextNode = nil  --SingleNode
	self._textDetail = nil  --Text

	local resource = {
		file = Path.getCSB("PopupRechargeRebate", "common"),
		binding = {
			_btnOk = {
				events = {{event = "touch", method = "_onBtnOk"}}
			},
		},
	}
	PopupRechargeRebate.super.ctor(self, resource)
end

-- Describle：
function PopupRechargeRebate:onCreate()
	self._commonNodeBk:setTitle(Lang.get("lang_popup_recharge_rebate_title"))
	self._btnOk:setString(Lang.get("common_receive"))
	self._listViewDrop:setContentSize(cc.size(100,200))
	self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))
	self:refreshContent()
end

function PopupRechargeRebate:refreshContent()
	local startTime , totalMoney, awards = G_UserData:getRechargeRebate():getRebateInfo()
	local timeStr = G_ServerTime:getRefreshTimeStringYMD(startTime)
	self:_createTips(timeStr, totalMoney)
	self:_updateAwards(awards)
end

function PopupRechargeRebate:_createTips(timeStr, money)
	self._richTextNode:removeAllChildren()
	local richtext = ccui.RichText:createRichTextByFormatString2(Lang.get("lang_popup_recharge_rebate_award_tip", { money = money}),
		Colors.BRIGHT_BG_TWO, 20)
	richtext:ignoreContentAdaptWithSize(false)
	richtext:setVerticalSpace(4)
	richtext:setAnchorPoint(cc.p(0.5, 0.5))
	richtext:setContentSize(cc.size(530,0))--高度0则高度自适应
	richtext:formatText()
	self._richTextNode:addChild(richtext)

end

function PopupRechargeRebate:_createCellEx(award)
	local widget = ccui.Widget:create()

    local uiNode = CSHelper.loadResourceNode(Path.getCSB("CommonIconNameNode", "common"))
	uiNode:updateUI(award.type, award.value, award.size)
	uiNode:showItemBg(true)
	uiNode:setTouchEnabled(true)

	local gap = 30
	local panelSize = uiNode:getPanelSize()
	panelSize.width = panelSize.width + gap

	widget:setContentSize(panelSize)

	uiNode:setPosition(gap/2, 0)
	widget:addChild(uiNode)

	return widget
end

--创建左对齐物品列表
function PopupRechargeRebate:_updateAwards(awards)
	self._listViewDrop:removeAllChildren()
    for i = 1, #awards do
        local award = awards[i]
		local widget = self:_createCellEx(award)
		self._listViewDrop:pushBackCustomItem(widget)
    end
	--
	if #awards > 4 then
		self._listViewDrop:setTouchEnabled(true)
		self._listViewDrop:setContentSize(cc.size(480,190))
		self._listViewDrop:doLayout()
	else
		self._listViewDrop:adaptWithContainerSize()
		self._listViewDrop:setTouchEnabled(false)
	end
end

-- Describle：
function PopupRechargeRebate:onEnter()
	self._signalGetReward = G_SignalManager:add(SignalConst.EVENT_GET_RECHARGE_REBATE_AWARD_SUCCESS, handler(self, self._onEventGetAwards))
	local runningScene = G_SceneManager:getRunningScene()
	runningScene:setVipChangeTipDisable(true)
end
-- Describle：
function PopupRechargeRebate:onExit()
	self._signalGetReward:remove()
	self._signalGetReward = nil
	local runningScene = G_SceneManager:getRunningScene()
	runningScene:setVipChangeTipDisable(false)
end

function PopupRechargeRebate:_onEventGetAwards(event, awards)
	if awards then
		local PopupGetRewards = require("app.ui.PopupGetRewards").new()
		PopupGetRewards:showRewards(awards)
		self._btnOk:setString(Lang.get("common_btn_had_get_award"))
		self._btnOk:setEnabled(false)
	end
end
-- Describle：
function PopupRechargeRebate:_onBtnOk()
	-- body
	if G_UserData:getRechargeRebate():isNotTakenRebate() then
		G_UserData:getRechargeRebate():c2sGetRechargeRebateAward()
	end
end

function PopupRechargeRebate:onBtnCancel()
	self:close()
end


return PopupRechargeRebate
