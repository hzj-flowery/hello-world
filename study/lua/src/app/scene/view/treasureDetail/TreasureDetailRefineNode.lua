--
-- Author: Liangxu
-- Date: 2017-05-09 11:15:09
--
local ListViewCellBase = require("app.ui.ListViewCellBase")
local TreasureDetailRefineNode = class("TreasureDetailRefineNode", ListViewCellBase)
local CSHelper = require("yoka.utils.CSHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TextHelper = require("app.utils.TextHelper")
local UIHelper = require("yoka.utils.UIHelper")
local TreasureTrainHelper = require("app.scene.view.treasureTrain.TreasureTrainHelper")
local TreasureConst = require("app.const.TreasureConst")
local RedPointHelper = require("app.data.RedPointHelper")

function TreasureDetailRefineNode:ctor(treasureData, rangeType)
	self._treasureData = treasureData
	self._rangeType = rangeType

	local resource = {
		file = Path.getCSB("TreasureDetailDynamicModule", "treasure"),
		binding = {

		},
	}
	TreasureDetailRefineNode.super.ctor(self, resource)
end

function TreasureDetailRefineNode:onCreate()
	local title = self:_createTitle()
	self._listView:pushBackCustomItem(title)

	local heightOfBtn = title:getContentSize().height --按钮造成的区域高度，初始值要先加上标题的高度
	local offset = 0
	if self._treasureData:isUserTreasure() then
		local btnWidget1, height1 = self:_createButton1()
		self._listView:pushBackCustomItem(btnWidget1)
		heightOfBtn = heightOfBtn + height1
		if self._treasureData:isCanLimitBreak() and require("app.utils.logic.FunctionCheck").funcIsShow(FunctionConst.FUNC_TREASURE_TRAIN_TYPE4) then
			local btnWidget2, height2 = self:_createButton2()
			self._listView:pushBackCustomItem(btnWidget2)
			heightOfBtn = heightOfBtn + height2
		end
	else	
		offset = 10		
	end

	local level = self:_createLevelDes()
	self._listView:pushBackCustomItem(level)

	self:_addAttrDes()

	local master, line = self:_createMasterInfo()
	if master then
		self._listView:pushBackCustomItem(master)	
	end

	self._listView:doLayout()
	local contentSize = self._listView:getInnerContainerSize()
	local height = math.max(contentSize.height + offset, heightOfBtn)
	contentSize.height = height
	self._listView:setContentSize(contentSize)
	self:setContentSize(contentSize)
end

function TreasureDetailRefineNode:_createTitle()
	local title = CSHelper.loadResourceNode(Path.getCSB("CommonDetailTitleWithBg", "common"))
	title:setFontSize(24)
	title:setTitle(Lang.get("treasure_detail_title_refine"))
	local widget = ccui.Widget:create()
	local titleSize = cc.size(402, 50)
	widget:setContentSize(titleSize)
	title:setPosition(titleSize.width / 2, 30)
	widget:addChild(title)

	return widget
end

function TreasureDetailRefineNode:_createLevelDes()
	local widget = ccui.Widget:create()

	local node = CSHelper.loadResourceNode(Path.getCSB("CommonDesValue", "common"))
	local des = Lang.get("treasure_detail_refine_level")
	local value = self._treasureData:getRefine_level()
	local max = self._treasureData:getMaxRefineLevel()
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

function TreasureDetailRefineNode:_addAttrDes()
	local attrInfo = UserDataHelper.getTreasureRefineAttr(self._treasureData)
	for k, value in pairs(attrInfo) do
		local widget = ccui.Widget:create()
		local name, value = TextHelper.getAttrBasicText(k, value)
		name = TextHelper.expandTextByLen(name, 4)
		local node = CSHelper.loadResourceNode(Path.getCSB("CommonDesValue", "common"))
		node:setFontSize(20)
		node:updateUI(name.."：", value)
		node:setPosition(24, 20)
		widget:addChild(node)
		widget:setContentSize(cc.size(402, 30))
		self._listView:pushBackCustomItem(widget)
	end
end

function TreasureDetailRefineNode:_createMasterInfo()
	local pos = self._treasureData:getPos()
	local info = UserDataHelper.getMasterTreasureRefineInfo(pos)
	local level = info.curMasterLevel
	if level <= 0 then
		return nil
	end

	local widget = ccui.Widget:create()
	local master = CSHelper.loadResourceNode(Path.getCSB("CommonMasterInfoNode", "common"))
	local title = Lang.get("treasure_datail_refine_master", {level = level})
	local attrInfo = info.curAttr
	local line = master:updateUI(title, attrInfo)
	widget:addChild(master)
	local size = master:getContentSize()
	widget:setContentSize(size)

	return widget, line
end

function TreasureDetailRefineNode:_createButton1()
	local widget = ccui.Widget:create()
	local btn = CSHelper.loadResourceNode(Path.getCSB("CommonButtonLevel2Highlight", "common"))
	btn:setString(Lang.get("treasure_detail_btn_refine"))
	btn:addClickEventListenerEx(handler(self, self._onButtonRefineClicked))
	widget:addChild(btn)

	local reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE2, "slotRP", self._treasureData)
	btn:showRedPoint(reach)

	btn:setPosition(324, -27)
	widget:setContentSize(cc.size(402, 1))
	return widget, 75
end

function TreasureDetailRefineNode:_createButton2()
	local FunctionCheck = require("app.utils.logic.FunctionCheck")
	local widget = ccui.Widget:create()
	local btn = CSHelper.loadResourceNode(Path.getCSB("CommonButtonLevel2Highlight", "common"))
	btn:setString(Lang.get("treasure_detail_btn_limit"))
	btn:addClickEventListenerEx(handler(self, self._onButtonLimitClicked))
	widget:addChild(btn)

	btn:setEnabled(FunctionCheck.funcIsOpened(FunctionConst.FUNC_TREASURE_TRAIN_TYPE4))

	local reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE4, "slotRP", self._treasureData)
	btn:showRedPoint(reach)

	btn:setPosition(324, -95)
	widget:setContentSize(cc.size(402, 1))
	return widget, 75
end

function TreasureDetailRefineNode:_onButtonRefineClicked()
	if TreasureTrainHelper.isOpen(FunctionConst.FUNC_TREASURE_TRAIN_TYPE2) == false then
		return
	end
	
	local treasureId = self._treasureData:getId()
	G_SceneManager:showScene("treasureTrain", treasureId, TreasureConst.TREASURE_TRAIN_REFINE, self._rangeType, true)
end

function TreasureDetailRefineNode:_onButtonLimitClicked()
	local treasureId = self._treasureData:getId()
	G_SceneManager:showScene("treasureTrain", treasureId, TreasureConst.TREASURE_TRAIN_LIMIT, self._rangeType, true)
end

return TreasureDetailRefineNode