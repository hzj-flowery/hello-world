
local PopupBase = require("app.ui.PopupBase")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local PopupInstrumentDetail = class("PopupInstrumentDetail", PopupBase)

function PopupInstrumentDetail:ctor(type,value,isSelf, limitLevel)

	local convertData = TypeConvertHelper.convert(type,value)
	if convertData == nil then
		return
	end

	if type == TypeConvertHelper.TYPE_INSTRUMENT and isSelf then
		local unitData = G_UserData:getInstrument():getInstrumentDataWithId(value)
		self._unitData = unitData
	elseif type == TypeConvertHelper.TYPE_INSTRUMENT then
		local unitData = G_UserData:getInstrument():createTempInstrumentUnitData({baseId = value})
		self._unitData = unitData	
	elseif type == TypeConvertHelper.TYPE_FRAGMENT then
		local baseId = convertData.cfg.comp_value
		local unitData = G_UserData:getInstrument():createTempInstrumentUnitData({baseId = baseId})
		self._unitData = unitData
	end
	if self._unitData == nil then
		assert(false, "can't find instrument by id : "..value)
	end
	self._type = type
	self._value = value
	self._limitLevel = limitLevel

	local resource = {
		file = Path.getCSB("PopupInstrumentDetail", "instrument"),
		binding = {
			_btnWayGet = {
				events = {{event = "touch", method = "_onBtnWayGetClicked"}}
			},
			_buttonClose = {
				events = {{event = "touch", method = "_onBtnClose"}}
			},
		}
	}

	PopupInstrumentDetail.super.ctor(self, resource)
end

function PopupInstrumentDetail:onCreate()
	self._detailWindow:updateUI(self._unitData)
	self._btnWayGet:setString(Lang.get("way_type_goto_get"))

	self._fileNodeCountryFlag:updateUI(TypeConvertHelper.TYPE_INSTRUMENT, self._unitData:getBase_id())
	self._fileNodeAvatar:updateUI(self._unitData:getBase_id())

	self:_updateColor()
end

function PopupInstrumentDetail:onEnter()

end

function PopupInstrumentDetail:onExit()

end

function PopupInstrumentDetail:_updateColor()
    self._textPotential:setVisible(false)
	--local param = TypeConvertHelper.convert(self._type,self._value)
	--self._textPotential:setString(Lang.get("treasure_detail_txt_potential", {value = param.potential}))
	--self._textPotential:setColor(param.icon_color)
	--self._textPotential:enableOutline(param.icon_color_outline, 2)
  
end


function PopupInstrumentDetail:_onBtnWayGetClicked()
	local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
	PopupItemGuider:updateUI(self._type,self._value)
	PopupItemGuider:openWithAction()
end

function PopupInstrumentDetail:_onBtnClose()
	self:close()
end


return PopupInstrumentDetail