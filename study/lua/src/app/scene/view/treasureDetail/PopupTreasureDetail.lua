
local PopupBase = require("app.ui.PopupBase")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local PopupTreasureDetail = class("PopupTreasureDetail", PopupBase)

function PopupTreasureDetail:ctor(type,value,isSelf)

	self._isSelf = isSelf
	self._type = type
	self._value = value
	self:_updateUnitData(self._type,self._value)
	local resource = {
		file = Path.getCSB("PopupTreasureDetail", "treasure"),
		binding = {
			_btnWayGet = {
				events = {{event = "touch", method = "_onBtnWayGetClicked"}}
			},
			_buttonClose = {
				events = {{event = "touch", method = "_onBtnClose"}}
			},
		}
	}

	PopupTreasureDetail.super.ctor(self, resource)
end

function PopupTreasureDetail:onCreate()
	self:_updateInfo(self._value)
	self._fileNodeEquip:setVisible(true)
	self._fileNodeEquip:showShadow(false)
	self._scrollPage:setVisible(false)
end

function PopupTreasureDetail:onEnter()

end

function PopupTreasureDetail:onExit()

end

function PopupTreasureDetail:_updateEquipQuilityName(treasureBaseId)
	local treasureParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_TREASURE, treasureBaseId)
	self._textPotential:setString(Lang.get("treasure_detail_txt_potential", {value = treasureParam.potential}))
	self._textPotential:setColor(treasureParam.icon_color)
	self._textPotential:enableOutline(treasureParam.icon_color_outline, 2)
end


function PopupTreasureDetail:_onBtnWayGetClicked()
	local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
	PopupItemGuider:updateUI(self._type,self._value)
	PopupItemGuider:openWithAction()
end

function PopupTreasureDetail:_onBtnClose()
	self:close()
end

function PopupTreasureDetail:_updateUnitData(type,value)
	local convertData = TypeConvertHelper.convert(type,value)
	if convertData == nil then
		return
	end

	if type == TypeConvertHelper.TYPE_TREASURE and self._isSelf then
		local unitData = G_UserData:getTreasure():getTreasureDataWithId(value)
		self._treasureUnitData = unitData
	elseif type == TypeConvertHelper.TYPE_TREASURE then
		local unitData = G_UserData:getTreasure():createTempTreasureUnitData(value)
		self._treasureUnitData = unitData	
	elseif type == TypeConvertHelper.TYPE_FRAGMENT then
		local baseId = convertData.cfg.comp_value
		local unitData = G_UserData:getTreasure():createTempTreasureUnitData(baseId)
		self._treasureUnitData = unitData
	end
	if self._treasureUnitData == nil then
		assert(false, "can't find treasure by id : "..value)
	end
end


function PopupTreasureDetail:_updateInfo(baseId)
	self._value = baseId
	self:_updateUnitData(self._type,self._value)

	self._detailWindow:updateUI(self._treasureUnitData)
	self._btnWayGet:setString(Lang.get("way_type_goto_get"))
	self._fileNodeCountryFlag:updateUI(TypeConvertHelper.TYPE_TREASURE, self._treasureUnitData:getBase_id())

	self._fileNodeEquip:updateUI(self._treasureUnitData:getBase_id())

	self:_updateEquipQuilityName(self._treasureUnitData:getBase_id())
end



--使用了翻页功能
function PopupTreasureDetail:setPageData(dataList, params)
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

function PopupTreasureDetail:_updateItemAvatar(sender, widget, index, selectPos)

	local data = self._dataList[index]
	if data == nil then
		return
	end

	local baseId = data.cfg.id

	local count = widget:getChildrenCount()
	if count == 0 then
		local CSHelper = require("yoka.utils.CSHelper")
		local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonTreasureAvatar", "common"))
		avatar:updateUI(baseId)
		avatar:showShadow(false)
		-- avatar:setScale(1.4)
		avatar:setPosition(cc.p(self._scrollPage:getPageSize().width / 2, self._scrollPage:getPageSize().height / 2))
		widget:addChild(avatar)
	end

	if selectPos == index then
		self:_updateInfo(baseId)
	end

end
return PopupTreasureDetail