
--
-- Author: Liangxu
-- Date: 2019-5-27
-- 蛋糕活动军团Tab索引
local CakeGuildTab = class("CakeGuildTab")
local UTF8 = require("app.utils.UTF8")

function CakeGuildTab:ctor(target, index, onClick)
	self._target = target
	self._index = index
	self._onClick = onClick
	self._enableClick = true

	self._nodeGuildIcon = ccui.Helper:seekNodeByName(self._target, "NodeGuildIcon")
	cc.bind(self._nodeGuildIcon, "CommonGuildFlag")
	self._imageDark = ccui.Helper:seekNodeByName(self._target, "ImageDark")
	self._panelClick = ccui.Helper:seekNodeByName(self._target, "PanelClick")
	self._panelClick:addClickEventListenerEx(handler(self, self._onClickPanel))
end

function CakeGuildTab:updateUI(data)
	local guildIcon = data:getGuild_icon()
	if guildIcon == 0 then
		guildIcon = 1
	end
	local guildName = data:getGuild_name()
	self._nodeGuildIcon:updateUI(guildIcon, guildName)
end

function CakeGuildTab:setSelected(selected)
	self._imageDark:setVisible(not selected)
end

function CakeGuildTab:_onClickPanel()
	if self._enableClick and self._onClick then
		self._onClick(self._index)
	end
end

function CakeGuildTab:setEnabled(enable)
	self._enableClick = enable
end

return CakeGuildTab