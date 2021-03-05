--
-- Author: Liangxu
-- Date: 2017-05-09 11:13:39
--
local ListViewCellBase = require("app.ui.ListViewCellBase")
local TreasureDetailStrengthenNode = class("TreasureDetailStrengthenNode", ListViewCellBase)
local CSHelper = require("yoka.utils.CSHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TextHelper = require("app.utils.TextHelper")
local UIHelper = require("yoka.utils.UIHelper")
local TreasureTrainHelper = require("app.scene.view.treasureTrain.TreasureTrainHelper")
local TreasureConst = require("app.const.TreasureConst")
local ParameterIDConst = require("app.const.ParameterIDConst")

function TreasureDetailStrengthenNode:ctor(treasureData, rangeType)
	self._treasureData = treasureData
	self._rangeType = rangeType

	local resource = {
		file = Path.getCSB("TreasureDetailDynamicModule", "treasure"),
		binding = {

		},
	}
	self:setName("TreasureDetailStrengthenNode")
	TreasureDetailStrengthenNode.super.ctor(self, resource)
end

function TreasureDetailStrengthenNode:onCreate()
	local title = self:_createTitle()
	self._listView:pushBackCustomItem(title)

	local offset = 0
	if self._treasureData:isUserTreasure() then
		local btnWidget = self:_createButton()
		self._listView:pushBackCustomItem(btnWidget)
	else	
		offset = 10		
	end

	local level = self:_createLevelDes()
	self._listView:pushBackCustomItem(level)

	local attr = self:_createAttrDes()
	self._listView:pushBackCustomItem(attr)

	local master, line = self:_createMasterDes()
	if master then
		self._listView:pushBackCustomItem(master)
	end

	self._listView:doLayout()
	local contentSize = self._listView:getInnerContainerSize()
	contentSize.height = contentSize.height + offset
	self._listView:setContentSize(contentSize)
	self:setContentSize(contentSize)
end

function TreasureDetailStrengthenNode:_createTitle()
	local title = CSHelper.loadResourceNode(Path.getCSB("CommonDetailTitleWithBg", "common"))
	title:setFontSize(24)
	title:setTitle(Lang.get("treasure_detail_title_strengthen"))
	local widget = ccui.Widget:create()
	local titleSize = cc.size(402, 50)
	widget:setContentSize(titleSize)
	title:setPosition(titleSize.width / 2, 30)
	widget:addChild(title)

	return widget
end

function TreasureDetailStrengthenNode:_createLevelDes()
	local widget = ccui.Widget:create()

	local node = CSHelper.loadResourceNode(Path.getCSB("CommonDesValue", "common"))
	local des = Lang.get("treasure_detail_strengthen_level")
	local value = self._treasureData:getLevel()
	local max = self._treasureData:getMaxStrLevel()
	local color = value < max and Colors.BRIGHT_BG_ONE or Colors.BRIGHT_BG_GREEN

	node:setFontSize(20)
	node:updateUI(des, value, max)
	node:setValueColor(color)
	node:setMaxColor(color)
	node:setPosition(24, 20)
	widget:addChild(node)
	widget:setContentSize(cc.size(402, 30))

	return widget
end

function TreasureDetailStrengthenNode:_createAttrDes()
	local widget = ccui.Widget:create()

	local attrInfo = UserDataHelper.getTreasureStrengthenAttr(self._treasureData) or {}
	for k, value in pairs(attrInfo) do
		local name, value = TextHelper.getAttrBasicText(k, value)
		name = TextHelper.expandTextByLen(name, 4)
		local node = CSHelper.loadResourceNode(Path.getCSB("CommonDesValue", "common"))
		node:setFontSize(20)
		node:updateUI(name.."：", value)
		node:setPosition(24, 20)
		widget:addChild(node)
		break
	end
	widget:setContentSize(cc.size(402, 30))
	return widget
end

function TreasureDetailStrengthenNode:_createMasterDes()
	local pos = self._treasureData:getPos()
	local info = UserDataHelper.getMasterTreasureUpgradeInfo(pos)
	local level = info.curMasterLevel
	if level <= 0 then
		return nil
	end

	local widget = ccui.Widget:create()
	local master = CSHelper.loadResourceNode(Path.getCSB("CommonMasterInfoNode", "common"))
	local title = Lang.get("treasure_datail_strengthen_master", {level = level})
	local attrInfo = info.curAttr
	local line = master:updateUI(title, attrInfo)
	widget:addChild(master)
	local size = master:getContentSize()
	widget:setContentSize(size)

	return widget, line
end

function TreasureDetailStrengthenNode:_createButton()
	local widget = ccui.Widget:create()
	local btn = CSHelper.loadResourceNode(Path.getCSB("CommonButtonLevel2Highlight", "common"))
	btn:setString(Lang.get("treasure_detail_btn_strengthen"))
	btn:setName("ButtonStrengthen")
	btn:addClickEventListenerEx(handler(self, self._onButtonStrengthenClicked))
	widget:addChild(btn)

	local RedPointHelper = require("app.data.RedPointHelper")
	local reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE1, "slotRP", self._treasureData)
	btn:showRedPoint(reach)

	btn:setPosition(324, -27)
	widget:setContentSize(cc.size(402, 1))
	return widget
end

function TreasureDetailStrengthenNode:_onButtonStrengthenClicked()
	if TreasureTrainHelper.isOpen(FunctionConst.FUNC_TREASURE_TRAIN_TYPE1) == false then
		return
	end

	local treasureId = self._treasureData:getId()
	G_SceneManager:showScene("treasureTrain", treasureId, TreasureConst.TREASURE_TRAIN_STRENGTHEN, self._rangeType, true)
end

return TreasureDetailStrengthenNode