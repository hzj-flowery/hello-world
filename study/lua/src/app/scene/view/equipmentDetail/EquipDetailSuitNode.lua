--
-- Author: Liangxu
-- Date: 2017-04-12 17:24:17
-- 武将详情 套装模块
local ListViewCellBase = require("app.ui.ListViewCellBase")
local EquipDetailSuitNode = class("EquipDetailSuitNode", ListViewCellBase)
local CSHelper = require("yoka.utils.CSHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local EquipDetailSuitIcon = require("app.scene.view.equipmentDetail.EquipDetailSuitIcon")
local TextHelper = require("app.utils.TextHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local FunctionConst = require("app.const.FunctionConst")

function EquipDetailSuitNode:ctor(unitData, isNeedLimit, fromLimit)
	self._suitId = 0
	self._unitData = unitData
	self._isNeedLimit = isNeedLimit or false
	self._fromLimit = fromLimit or false

	self._textName = nil --套装名称
	self._fileNodeIcon1 = nil --Icon1
	self._fileNodeIcon2 = nil --Icon2
	self._fileNodeIcon3 = nil --Icon3
	self._fileNodeIcon4 = nil --Icon4
	self._textTitle1 = nil --装备2件
	self._textTitle2 = nil --装备3件
	self._textTitle3 = nil --装备4件
	self._textValue1_1 = nil --装备2件属性1
	self._textValue1_2 = nil --装备2件属性2
	self._textValue2_1 = nil --装备3件属性1
	self._textValue2_2 = nil --装备3件属性2
	self._textValue3_1 = nil --装备4件属性1
	self._textValue3_2 = nil --装备4件属性2

	local resource = {
		file = Path.getCSB("EquipDetailSuitNode", "equipment"),
		binding = {
			_buttonLimit = {
				events = {{event = "touch", method = "_onLimitButtonClicked"}}
			}
		}
	}

	EquipDetailSuitNode.super.ctor(self, resource)
end

function EquipDetailSuitNode:onCreate()
	local size = self._panelBg:getContentSize()
	self:setContentSize(size.width, size.height)

	self._nodeTitle:setTitle(Lang.get("equipment_detail_title_suit"))

	self._equipIcons = {}
	for i = 1, 4 do
		local icon = EquipDetailSuitIcon.new(self["_fileNodeIcon" .. i])
		table.insert(self._equipIcons, icon)
	end

	self:_updateView()
	self:_initLimitButton()
end

-- 界限突破按钮
function EquipDetailSuitNode:_initLimitButton()
	local FunctionCheck = require("app.utils.logic.FunctionCheck")
	self._buttonLimit:setString(Lang.get("instrument_limit_btn"))
	local EquipConst = require("app.const.EquipConst")
	local isShow = self._isNeedLimit and FunctionCheck.funcIsShow(FunctionConst.FUNC_EQUIP_TRAIN_TYPE4)
	self._buttonLimit:setVisible(isShow)
	self._buttonLimit:setEnabled(FunctionCheck.funcIsOpened(FunctionConst.FUNC_EQUIP_TRAIN_TYPE4))
	if isShow then
		local EquipTrainHelper = require("app.scene.view.equipTrain.EquipTrainHelper")
		local isRed = EquipTrainHelper.isNeedRedPoint()
		self._buttonLimit:showRedPoint(isRed)
	end
end

function EquipDetailSuitNode:_onLimitButtonClicked()
	local EquipConst = require("app.const.EquipConst")
	local equipId = G_UserData:getEquipment():getCurEquipId()
	G_SceneManager:showScene("equipTrain", equipId, EquipConst.EQUIP_TRAIN_LIMIT, EquipConst.EQUIP_RANGE_TYPE_2, true)
end

function EquipDetailSuitNode:_updateView()
	local suitId = self._unitData:getConfig().suit_id
	for i = 1, 3 do
		for j = 1, 2 do
			if self["_textValue" .. i .. "_" .. j] then
				self["_textValue" .. i .. "_" .. j]:setVisible(false)
			end
		end
	end

	local colorParam = nil

	local componentCount = 0
	local componentIds = UserDataHelper.getSuitComponentIds(suitId)
	for i, id in ipairs(componentIds) do
		local icon = self._equipIcons[i]
		local pos = self._unitData:getPos() --G_UserData:getTeam():getCurPos()
		local isHave = UserDataHelper.isHaveEquipInPos(id, pos)
		local needMask = not isHave
		icon:updateView(id, needMask)
		if not needMask and not self._fromLimit then
			componentCount = componentCount + 1
		end

		if colorParam == nil then
			colorParam = {}
			local equipParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_EQUIPMENT, id)
			colorParam.icon_color = equipParam.icon_color
			colorParam.icon_color_outline = equipParam.icon_color_outline
		end
	end

	--名字
	local name = UserDataHelper.getSuitName(suitId)
	self._textName:setString(name)
	self._textName:setColor(colorParam.icon_color)
	self._textName:enableOutline(colorParam.icon_color_outline)

	--属性
	local attrInfo = UserDataHelper.getSuitAttrShowInfo(suitId)
	for i, one in ipairs(attrInfo) do
		local count = one.count
		local colorName = componentCount >= count and Colors.BRIGHT_BG_GREEN or Colors.BRIGHT_BG_TWO
		local colorAttr = componentCount >= count and Colors.BRIGHT_BG_GREEN or Colors.BRIGHT_BG_TWO
		self["_textTitle" .. i]:setString(Lang.get("equipment_detail_suit_count", {count = count}))
		self["_textTitle" .. i]:setColor(colorName)

		local info = one.info
		for j, data in ipairs(info) do
			local name, value = TextHelper.getAttrBasicText(data.type, data.value)
			local text = self["_textValue" .. i .. "_" .. j]
			if text then
				text:setString(Lang.get("equipment_detail_suit_attr", {name = name, value = value}))
				text:setColor(colorAttr)
				text:setVisible(true)
			end
		end
	end
end

function EquipDetailSuitNode:setIconMask(needMask)
	for i, icon in ipairs(self._equipIcons) do
		icon:setIconMask(needMask)
	end
end

return EquipDetailSuitNode
