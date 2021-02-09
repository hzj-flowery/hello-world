--
-- Author: Liangxu
-- Date: 2019-4-30
-- 蛋糕活动获取鸡蛋Cell

local ListViewCellBase = require("app.ui.ListViewCellBase")
local CakeGetEggCell = class("CakeGetEggCell", ListViewCellBase)
local CakeActivityDataHelper = require("app.utils.data.CakeActivityDataHelper")
local CakeActivityConst = require("app.const.CakeActivityConst")

function CakeGetEggCell:ctor()
	local resource = {
		file = Path.getCSB("CakeGetEggCell", "cakeActivity"),
		binding = {
			_button = {
				events = {{event = "touch", method = "_onClick"}}
			},
		}
	}
	CakeGetEggCell.super.ctor(self, resource)
end

function CakeGetEggCell:onCreate()
	self._state = 0
	local size = self._panelBg:getContentSize()
	self:setContentSize(size.width, size.height)
end

function CakeGetEggCell:update(data)
	local id = data:getCurShowId()
	local info = CakeActivityDataHelper.getCurCakeTaskConfig(id)
	self._icon:unInitUI()
	self._icon:initUI(info.award_type, info.award_value, info.award_size)

	self._state = 0
	local strProcess = ""
	if data:isFinish() then --已领取
		self._state = CakeActivityConst.TASK_STATE_3
		strProcess = "$c103_"..Lang.get("cake_activity_task_finish").."$"
		self._button:setVisible(false)
		self._imageReceived:setVisible(true)
	elseif data:getValue() >= info.times then --可领取
		self._state = CakeActivityConst.TASK_STATE_2
		strProcess = "$c103_"..Lang.get("cake_activity_task_finish").."$"
		self._button:setVisible(true)
		self._imageReceived:setVisible(false)
		self._button:switchToNormal()
		self._button:setString(Lang.get("cake_activity_task_btn_2"))
	else
		self._state = CakeActivityConst.TASK_STATE_1 --前往
		strProcess = "$c103_"..data:getValue().."$/"..info.times
		self._button:setVisible(true)
		self._imageReceived:setVisible(false)
		self._button:switchToHightLight()
		self._button:setString(Lang.get("cake_activity_task_btn_1"))
	end
	local formatStr = Lang.get("cake_activity_task_des", {des = info.desc, process = strProcess})
	local params = {defaultColor = Colors.BRIGHT_BG_ONE, defaultSize = 20}
	local richText = ccui.RichText:createRichTextByFormatString(formatStr, params)
	richText:setAnchorPoint(cc.p(0, 0.5))
	self._nodeDes:removeAllChildren()
	self._nodeDes:addChild(richText)
end

function CakeGetEggCell:_onClick()
	self:dispatchCustomCallback(1, self._state)
end

return CakeGetEggCell
