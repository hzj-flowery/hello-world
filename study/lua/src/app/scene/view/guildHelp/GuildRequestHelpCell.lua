--
-- Author: Liangxu
-- Date: 2017-06-29 17:45:38
-- 军团请求增援Cell
local ListViewCellBase = require("app.ui.ListViewCellBase")
local GuildRequestHelpCell = class("GuildRequestHelpCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

GuildRequestHelpCell.MAX_FRAGMENT = 5

function GuildRequestHelpCell:ctor()
	local resource = {
		file = Path.getCSB("GuildRequestHelpCell", "guild"),
		binding = {
			_buttonAdd = {
				events = {{event = "touch", method = "_onButtonAddClicked"}}
			},
			_buttonReceive = {
				events = {{event = "touch", method = "_onButtonReceiveClicked"}}
			},
		}
	}
	GuildRequestHelpCell.super.ctor(self, resource)
end

function GuildRequestHelpCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

function GuildRequestHelpCell:update(pos, data)
	self._textPos:setString(Lang.get("guild_help_request_pos", {pos = pos}))
	if data then
		self._panel1:setVisible(false)
		self._panel2:setVisible(true)

		local fragmentId = data:getHelp_id()
		local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_FRAGMENT, fragmentId)
		local alreadyHelpCount = data:getAlready_help() --已经捐献
		local limitMax = data:getLimit_max() --最大上限
		local alreadyGet = data:getAlready_get() --已经领取

		self._fileNodeIcon:updateUI(fragmentId)
		self._textFragName:setString(param.name)
		self._textFragName:setColor(param.icon_color)
	--	self._textFragName:enableOutline(param.icon_color_outline,2)

		--self._loadingBarFrag:setPercent(math.ceil(alreadyHelpCount / limitMax * 100))
		--self._textGetFragCount:setString(alreadyHelpCount.."/"..limitMax)

		self["_commonProgressBar"]:setPercent(alreadyHelpCount,limitMax)
		self["_commonProgressBar"]:showDivider(true,GuildRequestHelpCell.MAX_FRAGMENT,alreadyHelpCount,limitMax)--最多5个碎片

		self._buttonReceive:setString(Lang.get("guild_help_btn_receive"))
		self._buttonReceive:setEnabled(true)

		if alreadyGet == limitMax then --已达成
			self._imageReach:setVisible(true)
			self._textHelping:setVisible(false)
			self._buttonReceive:setVisible(false)
			self._textCanReceiveCountTitle:setVisible(false)
			self._textCanReceiveCount:setVisible(false)
		else
			if alreadyGet == alreadyHelpCount then --求助中
				self._textHelping:setVisible(true)
				self._textCanReceiveCountTitle:setVisible(false)
				self._textCanReceiveCount:setVisible(false)
				self._imageReach:setVisible(false)
				self._buttonReceive:setVisible(true)
				self._buttonReceive:setEnabled(false)
				self._buttonReceive:setString(Lang.get("guild_help_btn_helping"))
			else --可领取
				self._buttonReceive:setVisible(true)
				self._textCanReceiveCountTitle:setVisible(true)
				self._textCanReceiveCount:setVisible(true)
				self._textHelping:setVisible(false)
				self._imageReach:setVisible(false)
				self._textCanReceiveCount:setString(Lang.get("guild_help_can_receive_count", {count = alreadyHelpCount - alreadyGet}))
			end
		end
	else
		self._panel1:setVisible(true)
		self._panel2:setVisible(false)
	end
end

function GuildRequestHelpCell:_onButtonAddClicked()
	self:dispatchCustomCallback("add")
end

function GuildRequestHelpCell:_onButtonReceiveClicked()
	self:dispatchCustomCallback("receive")
end

return GuildRequestHelpCell