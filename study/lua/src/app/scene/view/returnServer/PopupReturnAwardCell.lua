---------------------------------------------------------------------
-- Created by: liangxu
-- Date: 2020-02-18 14:58:54
---------------------------------------------------------------------
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupReturnAwardCell = class("PopupReturnAwardCell", ListViewCellBase)
local DataConst = require("app.const.DataConst")

function PopupReturnAwardCell:ctor()
	local resource = {
		file = Path.getCSB("PopupReturnAwardCell", "returnServer"),
		binding = {
			_buttonReceive = {
				events = {{event = "touch", method = "_onClickReceive"}}
			}
		},
	}
	PopupReturnAwardCell.super.ctor(self, resource)
end

function PopupReturnAwardCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

function PopupReturnAwardCell:update(data)
	self._nodeIcon1:updateUI(DataConst.RES_DIAMOND, data.value)
	self._nodeIcon2:updateUI(DataConst.RES_VIP, data.value)
	
	local tempLevel = data.level
	local curLevel = G_UserData:getBase():getLevel()
	self._textLevel:setString(Lang.get("return_server_award_receive_condition", {level = tempLevel}))
	local content = ""
	if curLevel >= tempLevel then
		content = Lang.get("return_server_award_condition_process_1")
	else
		content = Lang.get("return_server_award_condition_process_2", {num1 = curLevel, num2 = tempLevel})
	end
	local richText = ccui.RichText:createWithContent(content)
	self._nodeProcess:removeAllChildren()
	self._nodeProcess:addChild(richText)
	
	if data.isReceived then
		self._buttonReceive:setVisible(false)
		self._imageReceive:setVisible(true)
	else
		self._buttonReceive:setVisible(true)
		self._imageReceive:setVisible(false)
		if data.isCanReceive then
			self._buttonReceive:setString(Lang.get("common_btn_get_award"))
			self._buttonReceive:setEnabled(true)
		else
			self._buttonReceive:setString(Lang.get("common_btn_no_finish"))
			self._buttonReceive:setEnabled(false)
		end
	end
end

function PopupReturnAwardCell:_onClickReceive()
	self:dispatchCustomCallback()
end

return PopupReturnAwardCell