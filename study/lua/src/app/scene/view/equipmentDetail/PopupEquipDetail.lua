--
-- Author: hedl
-- Date: 2017-4-20 15:09:42
-- 装备详情
--local ViewBase = require("app.ui.ViewBase")
local PopupBase = require("app.ui.PopupBase")
local PopupEquipDetail = class("PopupEquipDetail", PopupBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

function PopupEquipDetail:ctor(type,value)

	
	self._type = type
	self._value = value
	self:_updateUnitData(type,value)
	
	local resource = {
		file = Path.getCSB("PopupEquipDetail", "equipment"),
		binding = {
			_btnWayGet = {
				events = {{event = "touch", method = "_onBtnWayGetClicked"}}
			},
			_buttonClose = {
				events = {{event = "touch", method = "_onBtnClose"}}
			},
		}
	}

	PopupEquipDetail.super.ctor(self, resource)
end

function PopupEquipDetail:onCreate()
	self:_updateEquipInfo(self._value)
	self._fileNodeEquip:setVisible(true)
	self._fileNodeEquip:showShadow(false)
	self._scrollPage:setVisible(false)
end

function PopupEquipDetail:onEnter()

end

function PopupEquipDetail:onExit()

end

function PopupEquipDetail:_updateEquipQuilityName(equipBaseId)
	local equipParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_EQUIPMENT, equipBaseId)
	self._textPotential:setString(Lang.get("equipment_detail_txt_potential2", {value = equipParam.potential}))
	self._textPotential:setColor(equipParam.icon_color)
	self._textPotential:enableOutline(equipParam.icon_color_outline, 2)
end


function PopupEquipDetail:_onBtnWayGetClicked()
	local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
	PopupItemGuider:updateUI(self._type,self._value)
	PopupItemGuider:openWithAction()
end

function PopupEquipDetail:_onBtnClose()
	self:close()
end

function PopupEquipDetail:_updateUnitData(type,value)
	local convertData = TypeConvertHelper.convert(type,value)
	if convertData == nil then
		return
	end

	if type == TypeConvertHelper.TYPE_EQUIPMENT then
		local unitData = G_UserData:getEquipment():createTempEquipUnitData(value)
		self._equipUnitData = unitData
	elseif type == TypeConvertHelper.TYPE_FRAGMENT then
		local heroId = convertData.cfg.comp_value
		local unitData = G_UserData:getEquipment():createTempEquipUnitData(heroId)
		self._equipUnitData = unitData
	end
	if self._equipUnitData == nil then
		assert(false, "can't find equipment by id : "..value)
	end
end

function PopupEquipDetail:_updateEquipInfo(baseId)
	self._value = baseId
	self:_updateUnitData(self._type,self._value)
	self._detailWindow:updateUI(self._equipUnitData)
	self._btnWayGet:setString(Lang.get("way_type_goto_get"))
	self._fileNodeCountryFlag:updateUI(TypeConvertHelper.TYPE_EQUIPMENT, self._equipUnitData:getBase_id())
	self._fileNodeEquip:updateUI(self._equipUnitData:getBase_id())

	self:_updateEquipQuilityName(self._equipUnitData:getBase_id())
end

--使用了翻页功能
function PopupEquipDetail:setPageData(dataList, params)
	self._dataList = dataList
	self._scrollPage:setCallBack(handler(self, self._updateItemAvatar))
	self._scrollPage:setVisible(true)
	self._fileNodeEquip:setVisible(false)
	local selectPos = 0
	for i, data in ipairs(self._dataList) do
		if  data.cfg.id == self._value then
			selectPos = i
		end
	end
	self._scrollPage:setUserData(dataList,selectPos)
end

function PopupEquipDetail:_updateItemAvatar(sender, widget, index, selectPos)

	local data = self._dataList[index]
	if data == nil then
		return
	end

	local baseId = data.cfg.id

	local count = widget:getChildrenCount()
	if count == 0 then
		local CSHelper = require("yoka.utils.CSHelper")
		local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonEquipAvatar", "common"))
		avatar:updateUI(baseId)
		avatar:showShadow(false)
		-- avatar:setScale(1.4)
		avatar:setPosition(cc.p(self._scrollPage:getPageSize().width / 2, self._scrollPage:getPageSize().height / 2))
		widget:addChild(avatar)
	end

	if selectPos == index then
		self:_updateEquipInfo(baseId)
	end

end
return PopupEquipDetail