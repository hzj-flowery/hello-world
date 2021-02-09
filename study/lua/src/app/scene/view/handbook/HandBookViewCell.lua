local ListViewCellBase = require("app.ui.ListViewCellBase")
local HandBookViewCell = class("HandBookViewCell", ListViewCellBase)

local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UIHelper = require("yoka.utils.UIHelper")

local LINE_ICON_HEIGHT = 162
local LINE_ICON_WIDTH = 920
local LINE_ICON_INTERVAL = 111
local LINE_ICON_NUM = 8

local CHANGE_MODEL = {
	[TypeConvertHelper.TYPE_HERO] = {
		colorTitle = "txt_wujiangyulan0",
		funcPopupDetail = function(params)
			local itemCfg = params.cfg
			local PopupHeroDetail =
				require("app.scene.view.heroDetail.PopupHeroDetail").new(
				TypeConvertHelper.TYPE_HERO,
				itemCfg.id,
				true,
				params.limitLevel,
				params.limitRedLevel
			)
			PopupHeroDetail:openWithAction()
			local heroList = G_UserData:getHandBook():getHeroList()
			local sameCountry = {}
			for i, value in ipairs(heroList) do
				if itemCfg.country == value.cfg.country then
					table.insert(sameCountry, value)
				end
			end
			PopupHeroDetail:setPageData(sameCountry)
			PopupHeroDetail:setDrawing(true)
		end
	},
	[TypeConvertHelper.TYPE_TREASURE] = {
		colorTitle = "txt_baowuyulan0",
		funcPopupDetail = function(params)
			local itemCfg = params.cfg
			local PopupTreasureDetail =
				require("app.scene.view.treasureDetail.PopupTreasureDetail").new(TypeConvertHelper.TYPE_TREASURE, itemCfg.id)
			PopupTreasureDetail:openWithAction()
			local treasureList = G_UserData:getHandBook():getTreasureList()
			PopupTreasureDetail:setPageData(treasureList)
		end
	},
	[TypeConvertHelper.TYPE_EQUIPMENT] = {
		colorTitle = "txt_zhuangbeiyulan0",
		funcPopupDetail = function(params)
			local itemCfg = params.cfg
			local PopupEquipDetail =
				require("app.scene.view.equipmentDetail.PopupEquipDetail").new(TypeConvertHelper.TYPE_EQUIPMENT, itemCfg.id)
			PopupEquipDetail:openWithAction()
			local equipList = G_UserData:getHandBook():getEquipList()
			PopupEquipDetail:setPageData(equipList)
		end
	},
	[TypeConvertHelper.TYPE_SILKBAG] = {
		colorTitle = "txt_chengsejinnang0",
		funcPopupDetail = function(params)
			local itemCfg = params.cfg
			local popup = require("app.scene.view.silkbag.PopupSilkbagDetailEx").new(TypeConvertHelper.TYPE_SILKBAG, itemCfg.id)
			popup:openWithAction()
			local silkbagList = G_UserData:getHandBook():getSilkbagList()
			popup:setPageData(silkbagList)
		end
	},
	[TypeConvertHelper.TYPE_HORSE] = {
		colorTitle = "txt_horse0",
		funcPopupDetail = function(params)
			local itemCfg = params.cfg
			local popup = require("app.scene.view.horseDetail.PopupHorseDetail").new(TypeConvertHelper.TYPE_HORSE, itemCfg.id)
			popup:openWithAction()
			local horseList = G_UserData:getHandBook():getHorseList()
			popup:setPageData(horseList)
		end
	},
	[TypeConvertHelper.TYPE_JADE_STONE] = {
		colorTitle = "txt_jade0",
		funcPopupDetail = function(params)
			local itemCfg = params.cfg
			local popup =
				require("app.scene.view.equipmentJade.PopupJadeDetail").new(TypeConvertHelper.TYPE_JADE_STONE, itemCfg.id)
			popup:openWithAction()
			local jadeStoneList = G_UserData:getHandBook():getJadeStoneList()
			local sameCountry = {}
			for i, value in ipairs(jadeStoneList) do
				if itemCfg.equipment_type > 0 and itemCfg.equipment_type == value.cfg.equipment_type then
					table.insert(sameCountry, value)
				elseif itemCfg.treasure_type > 0 and itemCfg.treasure_type == value.cfg.treasure_type then
					table.insert(sameCountry, value)
				end
			end
			popup:setPageData(sameCountry)
		end
	},
	[TypeConvertHelper.TYPE_HISTORY_HERO] = {
		colorTitle = "txt_historyhero0",
		funcPopupDetail = function(params)
			local historyHeroList = G_UserData:getHandBook():getHistoryHeroList()
			local itemCfg = params.cfg
			local popup =
				require("app.scene.view.historyhero.PopupHistoryHeroDetail").new(TypeConvertHelper.TYPE_HISTORY_HERO, nil, historyHeroList, true, 1, itemCfg.id)
			popup:openWithAction()
			-- popup:setPageData(historyHeroList)
		end
	}
}

function HandBookViewCell:ctor()
	self._target = nil
	self._buttonOK = nil -- ok按钮
	self._nodePos = nil
	--控制位置的节点
	self._itemNode = nil
	--添加Item的节点
	self._panelCon = nil
	self._panelArray = nil --Icon Array, 一行5个icon
	self._textItemType = nil --英雄类型
	self._textItemNum1 = nil --英雄数量1
	self._textItemNum2 = nil --英雄数量2
	self._topImage = nil --顶部图片
	local resource = {
		file = Path.getCSB("HandBookViewCell", "handbook")
	}
	HandBookViewCell.super.ctor(self, resource)
	self._iconList = {}
end

function HandBookViewCell:onCreate()
	local size = self._panelCon:getContentSize()
	self:setContentSize(size.width, size.height)
end

--
function HandBookViewCell:updateUI(itemType, color, itemIdArray, itemOwnerCount)
	if itemIdArray == nil then
		return
	end
	self._itemType = itemType
	self._itemIdArray = itemIdArray

	self:_autoExtend(itemIdArray)
	self:_updateIconArray(itemIdArray)
	self:_updateItemNum(color, itemOwnerCount)
end

function HandBookViewCell:_getColorTitle(color)
	if color >= 2 and color <= 7 then
		local changeTable = CHANGE_MODEL[self._itemType]
		if changeTable then
			return Lang.get(changeTable.colorTitle)[color]
		end
	end
	return ""
end

function HandBookViewCell:_updateItemNum(color, itemOwnerCount)
	local colorTitle = self:_getColorTitle(color)
	self:updateImageView("_topImage", {texture = Path.getUICommon("img_quality_title0" .. color)})

	if itemOwnerCount.ownNum == itemOwnerCount.totalNum then
		self._textItemNum1:setColor(Colors.uiColors.GREEN)
		self._textItemNum2:setColor(Colors.uiColors.GREEN)
	else
		self._textItemNum1:setColor(Colors.uiColors.RED)
		self._textItemNum2:setColor(Colors.COLOR_TITLE_MAIN)
	end

	self._textItemNum1:setString(itemOwnerCount.ownNum)

	local num2Pos = self._textItemNum1:getPositionX() + self._textItemNum1:getContentSize().width

	self._textItemNum2:setString("/" .. itemOwnerCount.totalNum)
	self._textItemNum2:setPositionX(num2Pos + 2)

	if colorTitle then
		--self._textItemType:setTexture(Path.getText(colorTitle))
		local txtColor =  Colors.getColor(color)
		local txtColorOutline = Colors.getColorOutline(color)
		--dump(colorOutline)
		self._textItemType:setString(colorTitle)
		self._textItemType:setColor(cc.c3b(0xff, 0xff, 0xff))

		if color ~= 7 then
			self._textItemType:enableOutline(txtColor,2)
		end
	end
end

--创建一行5个icon
function HandBookViewCell:_createIconArray(node, itemIdArray)
	local ComponentIconHelper = require("app.ui.component.ComponentIconHelper")
	local totalNum = #itemIdArray
	local x, y = 0, 0
	for i = 1, totalNum do
		local row = math.ceil(i / LINE_ICON_NUM)
		local column = i - (row - 1) * LINE_ICON_NUM
		local icon = ComponentIconHelper.createIcon(self._itemType)
		node:addChild(icon)
		icon:setName("item" .. i)
		icon:addBgImageForName(nil, 100)
		icon:setPosition(LINE_ICON_INTERVAL * (column - 1), (row - 1) * -1 * LINE_ICON_HEIGHT)
		icon:setVisible(false)
		icon:setNameFontSize(22)
		table.insert(self._iconList, icon)
	end
end

function HandBookViewCell:onIconCallBack(sender, itemParams, limitLevel, limitRedLevel)
	local changeTable = CHANGE_MODEL[itemParams.type]
	if changeTable then
		changeTable.funcPopupDetail({cfg = itemParams.cfg, limitLevel = limitLevel, limitRedLevel = limitRedLevel})
	end
end

function HandBookViewCell:_updateIconArray(itemIdArray)
	local function updateIcon(icon, heroData)
		icon:updateUI(heroData.cfg.id, nil, heroData.limitLevel, heroData.limitRedLevel)
		icon:setVisible(true)
		icon:setTouchEnabled(true)
		icon:showName(true, 100)
		icon:addBgImageForName(nil, 100)
		icon:setCallBack(handler(self, self.onIconCallBack))
		if heroData.isHave == true then
			icon:setIconMask(false)
		else
			icon:setIconMask(true)
		end
	end

	for i, heroData in ipairs(itemIdArray) do
		local icon = self._iconList[i]
		if icon then
			updateIcon(icon, heroData)
		end
	end
end

--根据行数，自动扩展
function HandBookViewCell:_autoExtend(itemIdArray)
	local lineCount = math.ceil(#itemIdArray / LINE_ICON_NUM)
	local rootContentSize = self._panelCon:getContentSize()
	local extendSize = (lineCount - 1) * LINE_ICON_HEIGHT
	local rootContentHeight = extendSize + rootContentSize.height
	self._panelCon:setContentSize(cc.size(rootContentSize.width, rootContentHeight + 20))
	local size = self._panelCon:getContentSize()
	self:setContentSize(size.width, size.height)

	self._nodePos:setPositionY(extendSize + 20)
	self:_createIconArray(self._itemNode, itemIdArray)
end

return HandBookViewCell
