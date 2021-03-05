-- 属性详情弹框
-- Author: Liangxu
-- 
local PopupBase = require("app.ui.PopupBase")
local PopupAttrDetail = class("PopupAttrDetail", PopupBase)
local AttributeConst = require("app.const.AttributeConst")
local UserDataHelper = require("app.utils.UserDataHelper")
local TextHelper = require("app.utils.TextHelper")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")

local BASE_ATTR = {
	AttributeConst.ATK,
	AttributeConst.HP,
	AttributeConst.PD,
	AttributeConst.MD,
	AttributeConst.ATK_PER,
	AttributeConst.HP_PER,
	AttributeConst.PD_PER,
	AttributeConst.MD_PER,
}

local SENIOR_ATTR = {
	AttributeConst.CRIT,
	AttributeConst.NO_CRIT,
	AttributeConst.CRIT_HURT,
	AttributeConst.CRIT_HURT_RED,
	AttributeConst.HIT,
	AttributeConst.NO_HIT,
	AttributeConst.HURT,
	AttributeConst.HURT_RED,
	AttributeConst.HEAL_PER,
	AttributeConst.BE_HEALED_PER,
	-- AttributeConst.HEAL,
	-- AttributeConst.BE_HEALED,
	AttributeConst.PVP_HURT,
	AttributeConst.PVP_HURT_RED,
}

local CAMP_ATTR = {
	AttributeConst.BREAK_WEI,
	AttributeConst.BREAK_WU,
	AttributeConst.BREAK_SHU,
	AttributeConst.BREAK_QUN,
	AttributeConst.RESIST_WEI,
	AttributeConst.RESIST_WU,
	AttributeConst.RESIST_SHU,
	AttributeConst.RESIST_QUN,
}

function PopupAttrDetail:ctor(heroUnitData)
	self._heroUnitData = heroUnitData

	local resource = {
		file = Path.getCSB("PopupAttrDetail", "team"),
		binding = {
			_btnDebug = {
                events = {{event = "touch", method = "_onClickDebugButton"}}
            },
		}
	}
	PopupAttrDetail.super.ctor(self, resource)
end

function PopupAttrDetail:onCreate()
	self._btnDebug:setVisible(APP_DEVELOP_MODE)
	self._nodeBg:setTitle(Lang.get("team_attr_detail_title"))
	self._nodeBg:addCloseEventListener(handler(self, self._onButtonClose))
	self._nodeTitle1:setTitle(Lang.get("team_attr_detail_title_1"))
	self._nodeTitle2:setTitle(Lang.get("team_attr_detail_title_2"))
	self._nodeTitle3:setTitle(Lang.get("team_attr_detail_title_3"))
	for i = 1, 8 do
		self["_nodeBaseAttr"..i]:setFontSize(20)
	end
	for i = 1, 12 do
		self["_nodeSeniorAttr"..i]:setFontSize(20)
	end
	-- for i = 1, 8 do
	-- 	self["_nodeCampAttr"..i]:setFontSize(20)
	-- end
	self._panel3:setVisible(false)
end

function PopupAttrDetail:onEnter()
	self:_updateView()
end

function PopupAttrDetail:onExit()
	
end

function PopupAttrDetail:_updateView()
	local param = {
		heroUnitData = self._heroUnitData,
		notAddPer = true,
	}
	local attrInfo = UserDataHelper.getTotalBaseAttr(param)
	AttrDataHelper.processDef(attrInfo)
	--基础属性
	for i = 1, 8 do
		local attrId = BASE_ATTR[i]
		local value = attrInfo[attrId] or 0
		local attrName, attrValue = TextHelper.getAttrBasicText(attrId, value)
		attrName = TextHelper.expandTextByLen(attrName, 4)
		self["_nodeBaseAttr"..i]:updateUI(attrName.."：", attrValue)
	end

	--高级属性
	for i = 1, 12 do
		local attrId = SENIOR_ATTR[i]
		local value = attrInfo[attrId] or 0
		local attrName, attrValue = TextHelper.getAttrBasicText(attrId, value)
		attrName = TextHelper.expandTextByLen(attrName, 4)
		self["_nodeSeniorAttr"..i]:updateUI(attrName.."：", attrValue)
	end

	--阵营属性
	-- for i = 1, 8 do
	-- 	local attrId = CAMP_ATTR[i]
	-- 	local value = attrInfo[attrId] or 0
	-- 	local attrName, attrValue = TextHelper.getAttrBasicText(attrId, value)
	-- 	attrName = TextHelper.expandTextByLen(attrName, 4)
	-- 	self["_nodeCampAttr"..i]:updateUI(attrName.."：", attrValue)
	-- end
end

function PopupAttrDetail:_onButtonClose()
	self:close()
end

function PopupAttrDetail:_onClickDebugButton()
	local popup = require("app.scene.view.uicontrol.PopupAttrStatistics").new(self._heroUnitData)
	popup:openWithAction()
end

return PopupAttrDetail