--
-- Author: Liangxu
-- Date: 2018-1-4 14:12:15
-- 变身卡详情 基础属性
local ListViewCellBase = require("app.ui.ListViewCellBase")
local AvatarDetailBaseAttrModule = class("AvatarDetailBaseAttrModule", ListViewCellBase)
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local TextHelper = require("app.utils.TextHelper")

function AvatarDetailBaseAttrModule:ctor()
	local resource = {
		file = Path.getCSB("AvatarDetailBaseAttrModule", "avatar"),
		binding = {
			
		},
	}
	
	AvatarDetailBaseAttrModule.super.ctor(self, resource)
end

function AvatarDetailBaseAttrModule:onCreate()
	local contentSize = self._panelBg:getContentSize()
	self:setContentSize(contentSize)
	self._panelBg:setSwallowTouches(false)
	self._nodeTitle:setFontSize(24)
	self._nodeTitle:setTitle(Lang.get("avatar_detail_base_attr_title"))
end

function AvatarDetailBaseAttrModule:updateUI(data)
	self._data = data

	local baseAttr = AvatarDataHelper.getAvatarBaseAttr(data:getBase_id())
	local baseAttrDes = TextHelper.getAttrInfoBySort(baseAttr)
	for i = 1, 2 do
		local info = baseAttrDes[i]
		if info then
			self["_nodeBaseAttr"..i]:setVisible(true)
			self["_nodeBaseAttr"..i]:updateView(info.id, info.value, nil ,4)
		else
			self["_nodeBaseAttr"..i]:setVisible(false)
		end
	end
end

return AvatarDetailBaseAttrModule