--
-- Author: Liangxu
-- Date: 2017-08-02 19:21:57
-- 强化大师升级弹框
local PopupBase = require("app.ui.PopupBase")
local PopupMasterLevelup = class("PopupMasterLevelup", PopupBase)
local MasterConst = require("app.const.MasterConst")
local AudioConst = require("app.const.AudioConst")

local TYPE_RES = {
	[MasterConst.MASTER_TYPE_1] = "img_btn_qianghuadashi01",
	[MasterConst.MASTER_TYPE_2] = "img_btn_qianghuadashi01",
	[MasterConst.MASTER_TYPE_3] = "img_btn_qianghuadashi01",
	[MasterConst.MASTER_TYPE_4] = "img_btn_qianghuadashi01",
}

function PopupMasterLevelup:ctor(parentView, masterInfo1, masterInfo2, masterType)
	self._parentView = parentView
	self._masterInfo1 = masterInfo1
	self._masterInfo2 = masterInfo2
	self._masterType = masterType

	local resource = {
		file = Path.getCSB("PopupMasterLevelup", "equipment"),
		binding = {
			_panelTouch = {
				events = {{event = "touch", method = "_onClickTouch"}},
			}
		}
	}
	PopupMasterLevelup.super.ctor(self, resource)
end

function PopupMasterLevelup:onCreate()
	
end

function PopupMasterLevelup:onEnter()
	G_AudioManager:playSoundWithId(AudioConst.SOUND_MASTER) --播音效
	self:_updateView()
end

function PopupMasterLevelup:onExit()
	
end

function PopupMasterLevelup:_onClickTouch()
	if self._parentView and self._parentView.onExitPopupMasterLevelup then
		self._parentView:onExitPopupMasterLevelup()
	end
	self:close()
end

function PopupMasterLevelup:_updateView()
	local totalLevel = self._masterInfo1.masterInfo.needLevel
	self._textTotalLevel:setString(Lang.get("equipment_master_total_level", {level = totalLevel}))

	--Icon显示
	local iconRes = Path.getCommonIcon("main", TYPE_RES[self._masterType])
	self._imageIcon1:loadTexture(iconRes)
	self._imageIcon2:loadTexture(iconRes)

	--等级显示
	local name = Lang.get("equipment_master_tab_title_"..self._masterType)
	local level1 = self._masterInfo1.masterInfo.curMasterLevel
	local content1 = Lang.get("equipment_master_level", {
		name = name,
		level = level1,
	})
	local richText1 = ccui.RichText:createWithContent(content1)
	richText1:setAnchorPoint(cc.p(0.5, 1))

	local level2 = self._masterInfo2.masterInfo.curMasterLevel
	local content2 = Lang.get("equipment_master_level", {
		name = name,
		level = level2,
	})
	local richText2 = ccui.RichText:createWithContent(content2)
	richText2:setAnchorPoint(cc.p(0.5, 1))
	self._nodeLevelPos1:addChild(richText1)
	self._nodeLevelPos2:addChild(richText2)

	--属性显示
	for i = 1, 4 do
		self["_nodeAttrDiff"..i]:setVisible(false)
	end

	local attrInfo1 = self._masterInfo1.masterInfo.curAttr
	local attrInfo2 = self._masterInfo2.masterInfo.curAttr
	local index = 1
	for k, value in pairs(attrInfo1) do
		local value2 = attrInfo2[k]
		self["_nodeAttrDiff"..index]:updateInfo(k, value, value2, 3)
		self["_nodeAttrDiff"..index]:setVisible(true)
		index = index + 1
	end
end

return PopupMasterLevelup