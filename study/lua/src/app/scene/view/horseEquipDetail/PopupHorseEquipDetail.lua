--
-- Author: JerryHe
-- Date: 2019-01-29
-- 战马装备详情
--local ViewBase = require("app.ui.ViewBase")
local PopupBase = require("app.ui.PopupBase")
local PopupHorseEquipDetail = class("PopupHorseEquipDetail", PopupBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

function PopupHorseEquipDetail:ctor(type,value)
	self._type = type
	self._value = value
	self:_updateUnitData(type,value)
	
	local resource = {
		file = Path.getCSB("PopupHorseEquipDetail", "horse"),
		binding = {
			_btnWayGet = {
				events = {{event = "touch", method = "_onBtnWayGetClicked"}}
			},
			_buttonClose = {
				events = {{event = "touch", method = "_onBtnClose"}}
			},
		}
	}

	PopupHorseEquipDetail.super.ctor(self, resource)
end

function PopupHorseEquipDetail:onCreate()
	self:_updateEquipInfo(self._value)
	self._fileNodeEquip:setVisible(true)
	self._fileNodeEquip:showShadow(false)
    self._scrollPage:setVisible(false)
    self._textPotential:setVisible(false)           --战马装备品质，暂时不需要显示，隐藏
end

function PopupHorseEquipDetail:onEnter()

end

function PopupHorseEquipDetail:onExit()

end

function PopupHorseEquipDetail:_updateEquipQuilityName(equipBaseId)
	self._textPotential:setString(Lang.get("equipment_detail_txt_potential2", {value = equipParam.potential}))
	self._textPotential:setColor(equipParam.icon_color)
	self._textPotential:enableOutline(equipParam.icon_color_outline, 2)
end


function PopupHorseEquipDetail:_onBtnWayGetClicked()
	local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"),nil,true)
	PopupItemGuider:updateUI(self._type,self._value)
	PopupItemGuider:openWithAction()
end

function PopupHorseEquipDetail:_onBtnClose()
	self:close()
end

function PopupHorseEquipDetail:_updateUnitData(type,value)
	local convertData = TypeConvertHelper.convert(type,value)
	if convertData == nil then
		return
	end

	if type == TypeConvertHelper.TYPE_HORSE_EQUIP then
        local unitData = G_UserData:getHorseEquipment():createTempHorseEquipUnitData(value)
		self._equipUnitData = unitData
	elseif type == TypeConvertHelper.TYPE_FRAGMENT then
		local baseId = convertData.cfg.comp_value
		local unitData = G_UserData:getHorseEquipment():createTempEquipUnitData(baseId)
		self._equipUnitData = unitData
	end
	if self._equipUnitData == nil then
		assert(false, "can't find equipment by id : "..value)
    end
end

function PopupHorseEquipDetail:_updateEquipInfo(baseId)
	self._value = baseId
	self:_updateUnitData(self._type,self._value)
	self._detailWindow:updateUI(self._equipUnitData)
	self._btnWayGet:setString(Lang.get("way_type_goto_get"))
	self._fileNodeCountryFlag:updateUI(TypeConvertHelper.TYPE_HORSE_EQUIP, self._equipUnitData:getBase_id())
	self._fileNodeEquip:updateUI(self._equipUnitData:getBase_id())
    
	-- self:_updateEquipQuilityName(self._equipUnitData:getBase_id())
end



--使用了翻页功能
function PopupHorseEquipDetail:setPageData(dataList, params)
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

function PopupHorseEquipDetail:_updateItemAvatar(sender, widget, index, selectPos)

	local data = self._dataList[index]
	if data == nil then
		return
	end

	local baseId = data.cfg.id

	local count = widget:getChildrenCount()
	if count == 0 then
		local CSHelper = require("yoka.utils.CSHelper")
		local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonHorseEquipAvatar", "common"))
		avatar:updateUI(baseId)
		avatar:showShadow(false)
		avatar:setPosition(cc.p(self._scrollPage:getPageSize().width / 2, self._scrollPage:getPageSize().height / 2))
		widget:addChild(avatar)
	end

	if selectPos == index then
		self:_updateEquipInfo(baseId)
	end

end

return PopupHorseEquipDetail