--邮件奖励单元

local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupMailRewardCell = class("PopupMailRewardCell", ListViewCellBase)
local MailHelper = require("app.scene.view.mail.MailHelper")
local CSHelper = require("yoka.utils.CSHelper")
local UIHelper = require("yoka.utils.UIHelper")

function PopupMailRewardCell:ctor()
	self._target = nil
	self._buttonOK = nil   -- ok按钮

	self._resourceNode = nil  --资源节点
	self._textTitle     = nil  --邮件名称
	self._textContent  = nil  --邮件内容
	self._textTime     = nil  --发送时间
	self._btnTakeReward = nil --获取奖励按钮
	self._listViewReward = nil --奖励列表
	self._callBack = nil
	local resource = {
		file = Path.getCSB("PopupMailRewardCell", "mail"),
	}
	PopupMailRewardCell.super.ctor(self, resource)
	self._iconList = {}
end

function PopupMailRewardCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	self._btnTakeReward:addClickEventListenerEx(handler(self,self._onButtonClick))
end

--
function PopupMailRewardCell:updateUI( index, mailInfo )

	 if mailInfo == nil then
	 	assert(false, "PopupMailRewardCell:updateUI mailInfo can not be nil ")
	 end

	 self._mailInfo = mailInfo
	 self._index = index

	 if mailInfo.awards and 1 <= #mailInfo.awards then
		self:_updateAwardList(mailInfo.awards)
		local timeStr = G_ServerTime:getPassTime(mailInfo.time)
		self._textTime:setString(timeStr)
		MailHelper.updateRewardCell(mailInfo, self._textTitle,self._textContent)
	end
	self._btnTakeReward:setString(Lang.get("mail_get_award"))
end


function PopupMailRewardCell:_updateAwardList(awards)
	self._listViewReward:removeAllChildren()

	--当奖励数量超过4个则可拖动
	self._listViewReward:setTouchEnabled(#awards > 4)

	for i, value in ipairs(awards) do
		local widget = self:_createCellEx(value)
		if widget then
			self._listViewReward:pushBackCustomItem(widget)
		end
	end
end

function PopupMailRewardCell:_createCellEx(award, scale)
	local widget = UIHelper.createIconTemplate(award, 0.8)
	return widget
end



function PopupMailRewardCell:_onButtonClick(sender)
	--local index = sender:getTag()
	logWarn("PopupMailRewardCell:_onButtonClick")

	local index = self._index + 1
	self:dispatchCustomCallback(index)
end

return PopupMailRewardCell
