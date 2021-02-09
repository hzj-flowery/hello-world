--
-- Author: Liangxu
-- Date: 2017-04-24 14:12:15
-- 强化大师
local PopupBase = require("app.ui.PopupBase")
local PopupEquipMaster = class("PopupEquipMaster", PopupBase)
local TabButtonGroup = require("app.utils.TabButtonGroup")
local EquipMasterHelper = require("app.scene.view.equipTrain.EquipMasterHelper")
local EquipMasterProgressNode = require("app.scene.view.equipTrain.EquipMasterProgressNode")
local UserDataHelper = require("app.utils.UserDataHelper")
local DataConst = require("app.const.DataConst")
local MasterConst = require("app.const.MasterConst")
local TextHelper = require("app.utils.TextHelper")

function PopupEquipMaster:ctor(pos, index)
	self._nodeTabRoot = nil --tab根节点
	self._nodeTextProgress = nil --xx进度文字
	self._fileNode1 = nil --第一个位置的进度单元
	self._fileNode2 = nil --第二个位置的进度单元
	self._fileNode3 = nil --第三个位置的进度单元
	self._fileNode4 = nil --第四个位置的进度单元
	self._nodeTextLevel = nil --xx等级文字
	self._nodeCurLevelPos = nil --当前等级富文本位置
	self._fileNodeCurAttr1 = nil --当前属性1
	self._fileNodeCurAttr2 = nil --当前属性2
	self._fileNodeCurAttr3 = nil --当前属性3
	self._fileNodeCurAttr4 = nil --当前属性4
	self._nodeNextLevelPos = nil --下一等级富文本位置
	self._fileNodeNextAttr1 = nil --下一等级属性1
	self._fileNodeNextAttr2 = nil --下一等级属性2
	self._fileNodeNextAttr3 = nil --下一等级属性3
	self._fileNodeNextAttr4 = nil --下一等级属性4

	self._pos = pos
	self._selectTabIndex = index or MasterConst.MASTER_TYPE_1

	local resource = {
		file = Path.getCSB("PopupEquipMaster", "equipment"),
		binding = {
			
		}
	}
	PopupEquipMaster.super.ctor(self, resource)
end

function PopupEquipMaster:onCreate()
	self._panelBg:setTitle(Lang.get("equipment_master_title"))
	self._panelBg:addCloseEventListener(handler(self, self._onClickClose))
	self._nodeTextProgress:setFontSize(24)
	self._nodeTextProgress:showTextBg(false)
	self._nodeTextProgress:setFontImageBgSize(cc.size(226, 34))
	self._nodeTextLevel:setFontSize(24)
	self._nodeTextLevel:setFontImageBgSize(cc.size(226, 34))
	self._nodeTextLevel:showTextBg(false)
	for i = 1, 4 do
		self["_fileNodeCurAttr"..i]:setFontSize(20)
		self["_fileNodeNextAttr"..i]:setFontSize(20)
	end
	for i = 1, 4 do
		self["_node"..i] = EquipMasterProgressNode.new(self, self["_fileNode"..i])
	end

	self:_initTab()
end

function PopupEquipMaster:onEnter()
	self:_updateInfo()
end

function PopupEquipMaster:onExit()
	
end

function PopupEquipMaster:_initTab()
	local param = {
		callback = handler(self, self._onTabSelect),
		isVertical = 2,
		offset = -2,
		textList = EquipMasterHelper.getMasterTabNameList()
	}

	self._nodeTabRoot:recreateTabs(param)
	self:_updateInfo()
end

function PopupEquipMaster:_onTabSelect(index, sender)
	if self._selectTabIndex == index then
		return
	end
	self._selectTabIndex = index
	self:_updateInfo()
end

function PopupEquipMaster:_updateInfo()
	self._nodeTextProgress:setTitle(Lang.get("equipment_master_text_progress_"..self._selectTabIndex))
	self._nodeTextLevel:setTitle(Lang.get("equipment_master_text_level_"..self._selectTabIndex))

	local progressInfo = EquipMasterHelper.getCurMasterInfo(self._pos, self._selectTabIndex)
	for i = 1, 4 do
		local info = progressInfo.info[i]
		self["_node"..i]:updateView(info, progressInfo.masterInfo.needLevel, progressInfo.type)
	end


	--等级显示富文本
	local masterType = self._selectTabIndex
	local curLevel = progressInfo.masterInfo.curMasterLevel
	local nextLevel = progressInfo.masterInfo.nextMasterLevel

	local curContent = Lang.get("equipment_master_cur_level_"..masterType, {
		level = curLevel
	})
	local curRichText = ccui.RichText:createWithContent(curContent)
	curRichText:setAnchorPoint(cc.p(0, 0.5))
	self._nodeCurLevelPos:removeAllChildren()
	self._nodeCurLevelPos:addChild(curRichText)

	local nextContent = Lang.get("equipment_master_next_level_"..masterType, {
		masterLevel = nextLevel,
	})
	local nextContent2 = Lang.get("equipment_master_next_all_level_"..masterType, {
		level = progressInfo.masterInfo.needLevel,
	})
	local nextRichText = ccui.RichText:createWithContent(nextContent)
	nextRichText:setAnchorPoint(cc.p(0, 0.5))
	local nextRichText2 = ccui.RichText:createWithContent(nextContent2)
	nextRichText2:setAnchorPoint(cc.p(0, 0.5))
	self._nodeNextLevelPos:removeAllChildren()
	self._nodeNextLevelPos:addChild(nextRichText)
	self._nodeNextLevelPos2:removeAllChildren()
	self._nodeNextLevelPos2:addChild(nextRichText2)

	--属性显示
	for i = 1, 4 do
		self["_fileNodeCurAttr"..i]:setVisible(false)
		self["_fileNodeNextAttr"..i]:setVisible(false)
	end
	local curAttrInfo = progressInfo.masterInfo.curAttr
	local nextAttrInfo = progressInfo.masterInfo.nextAttr
	local curIndex = 1
	for attrType, attrValue in pairs(curAttrInfo) do
		local name, value = TextHelper.getAttrBasicText(attrType, attrValue)
		self["_fileNodeCurAttr"..curIndex]:updateUI(name.."：", value)
		self["_fileNodeCurAttr"..curIndex]:setVisible(true)
		curIndex = curIndex + 1
	end
	local nextIndex = 1
	for attrType, attrValue in pairs(nextAttrInfo) do
		local name, value = TextHelper.getAttrBasicText(attrType, attrValue)
		self["_fileNodeNextAttr"..nextIndex]:updateUI(name.."：", value)
		self["_fileNodeNextAttr"..nextIndex]:setVisible(true)
		nextIndex = nextIndex + 1
	end
end

function PopupEquipMaster:getSelectTabIndex()
	return self._selectTabIndex
end

function PopupEquipMaster:_onClickClose()
	self:close()
end

return PopupEquipMaster