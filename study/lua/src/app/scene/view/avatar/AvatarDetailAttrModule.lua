--
-- Author: Liangxu
-- Date: 2018-1-4 14:12:15
-- 变身卡详情 属性模块
local ListViewCellBase = require("app.ui.ListViewCellBase")
local AvatarDetailAttrModule = class("AvatarDetailAttrModule", ListViewCellBase)
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local TextHelper = require("app.utils.TextHelper")

function AvatarDetailAttrModule:ctor()
	local resource = {
		file = Path.getCSB("AvatarDetailAttrModule", "avatar"),
		binding = {
			_buttonStr = {
				events = {{event = "touch", method = "_onButtonStrClicked"}},
			},
		},
	}
	
	AvatarDetailAttrModule.super.ctor(self, resource)
end

function AvatarDetailAttrModule:onCreate()
	local contentSize = self._panelBg:getContentSize()
	self:setContentSize(contentSize)
	self._panelBg:setSwallowTouches(false)
	self._nodeTitle:setFontSize(24)
	self._nodeTitle:setTitle(Lang.get("avatar_detail_attr_title"))
	self._nodeLevel:setFontSize(20)
	self._buttonStr:setString(Lang.get("avatar_detail_btn_str"))
end

function AvatarDetailAttrModule:updateUI(data)
	self._data = data
	local level = data:getLevel()
	local templet = data:getConfig().levelup_cost
	self._nodeLevel:updateUI(Lang.get("avatar_detail_txt_level"), level)

	local levelAttr = AvatarDataHelper.getAvatarLevelAttr(level, templet)
	local levelAttrDes = TextHelper.getAttrInfoBySort(levelAttr)
	for i = 1, 4 do
		local info = levelAttrDes[i]
		if info then
			self["_nodeAttr"..i]:setVisible(true)
			self["_nodeAttr"..i]:updateView(info.id, info.value, nil ,4)
		else
			self["_nodeAttr"..i]:setVisible(false)
		end
	end

	local isHave = G_UserData:getAvatar():isHaveWithBaseId(data:getBase_id())
	self._buttonStr:setEnabled(isHave)
	local redValue = AvatarDataHelper.isPromptTrain()
	self._buttonStr:showRedPoint(isHave and redValue)
end

function AvatarDetailAttrModule:_onButtonStrClicked()
	G_SceneManager:showScene("avatarTrain", self._data:getId(), true)
end

return AvatarDetailAttrModule