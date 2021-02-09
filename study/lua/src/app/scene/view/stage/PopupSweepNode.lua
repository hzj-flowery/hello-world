local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupSweepNode = class("PopupSweepNode", ListViewCellBase)
local CSHelper  = require("yoka.utils.CSHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local Color = require("app.utils.Color")
local DropHelper = require("app.utils.DropHelper")



PopupSweepNode.ITEM_POS_5 =
{
	cc.p(72, 56), cc.p(177, 56), cc.p(282, 56), cc.p(387, 56), cc.p(492, 56),
}
PopupSweepNode.ITEM_POS_4 =
{
	cc.p(125, 56), cc.p(230, 56), cc.p(335, 56), cc.p(440, 56),
}
PopupSweepNode.ITEM_POS_3 =
{
	cc.p(175, 56), cc.p(280, 56), cc.p(385, 56)
}
PopupSweepNode.ITEM_POS_2 =
{
	cc.p(230, 56), cc.p(335, 56)
}
PopupSweepNode.ITEM_POS_1 =
{
	cc.p(280, 56)
}
PopupSweepNode.HEIGHT_FIX = 5	--高度补充系数

function PopupSweepNode:ctor(result, idx, callback)
	self._nodeBG = nil		--背景
	self._nodeBG2 = nil		--亮色背景
	self._resExp = nil		--经验
	self._resMoney = nil	--游戏币
	self._textTitle = nil	--标题
	self._result = result
	self._index = idx
	self._callback = callback	--完成动画后的回调
	self._itemIcons = {}
	self._itemIdx = 0
	self._isCrit = false
	local resource = {
		file = Path.getCSB("PopupSweepNode", "stage"),
		binding = {}
	}
	PopupSweepNode.super.ctor(self, resource)
end

function PopupSweepNode:onCreate()
	local size = self._nodeBG:getContentSize()
	self:setContentSize(size.width, size.height + PopupSweepNode.HEIGHT_FIX)
	if self._index == 0 then		--总奖励框
		self._nodeBG:setVisible(false)
	else
		self._nodeBG2:setVisible(false)
		self._textTitle:setString(Lang.get("sweep_count", {count = self._index}))
	end
	self._resExp:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_EXP, self._result.exp)
	self._resMoney:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GOLD, self._result.money)
	self._resExp:setVisible(false)
	self._resMoney:setVisible(false)
	table.insert(self._itemIcons, self._resExp)
	table.insert(self._itemIcons, self._resMoney)
	if self._result.addRewards then
		for i, v in pairs(self._result.addRewards) do
			self._resMoney:updateCrit(v.index, v.reward.size)
			self._resMoney:setCritImageVisible(false)
			self._isCrit = true
		end
	end
	local rewards = self._result.rewards
	local rewardCount = #rewards
	rewards = DropHelper.sortDropList(rewards)
	assert(PopupSweepNode["ITEM_POS_"..rewardCount], "sweep reward count overStack count = "..rewardCount)
	for i, v in pairs(rewards) do
		local uiNode = CSHelper.loadResourceNode(Path.getCSB("CommonIconTemplate", "common"))
		uiNode:initUI(v.type, v.value, v.size)
		uiNode:setScale(0.8)
		uiNode:setTouchEnabled(false)
		uiNode:showDoubleTips(self._result.isDouble)
		self:addChild(uiNode)
		uiNode:setPosition(PopupSweepNode["ITEM_POS_"..rewardCount][i])
		table.insert(self._itemIcons, uiNode)
		uiNode:setVisible(false)
	end

	self:setVisible(false)
end

function PopupSweepNode:playEnterAction()
	self:setVisible(true)
	local function effectFunc(effect)
		local node = cc.Node:create()
		return node
	end
	local function eventFunc(event)
		if event == "play" then
			G_EffectGfxMgr:applySingleGfx(self, "smoving_saodang_di", nil, nil, nil)
		elseif event == "exp" then
			self:_startIconActions()
		elseif event == "baoji" then
			if self._isCrit then
				self._resMoney:playCritAction("smoving_saodang_baoji")
			end
		elseif event == "finish" then
			if self._callback then
				self._callback()
			end
		end
	end
	local AudioConst = require("app.const.AudioConst")
    G_AudioManager:playSoundWithId(AudioConst.SOUND_SAODANG)
	G_EffectGfxMgr:createPlayMovingGfx( self, "moving_saodang", effectFunc, eventFunc ,false )
	-- end
end

function PopupSweepNode:_playIconAction(index)
	local icon = self._itemIcons[index]
	icon:setVisible(true)
	G_EffectGfxMgr:applySingleGfx(icon, "smoving_saodang_exp", nil, nil, nil)
end

function PopupSweepNode:_startIconActions()
	local delay = cc.DelayTime:create(1/15)
    local callFunc = {}
    for i = 1, #self._itemIcons do
        local func = cc.CallFunc:create(function()
            self:_playIconAction(i)
        end )
        table.insert(callFunc, func)
    end
    local sequence = cc.Sequence:create(callFunc[1], delay, callFunc[2], delay, callFunc[3], delay, callFunc[4], callFunc[5], delay, callFunc[6], delay, callFunc[7])
    self:runAction(sequence)
end

return PopupSweepNode
