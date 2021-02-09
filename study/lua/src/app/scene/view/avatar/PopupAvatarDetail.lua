local PopupBase = require("app.ui.PopupBase")
local PopupAvatarDetail = class("PopupAvatarDetail", PopupBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

function PopupAvatarDetail:ctor(type,value)
	self._type = type
	self._value = value
	self:_updateUnitData(type,value)
	
	local resource = {
		file = Path.getCSB("PopupAvatarDetail", "avatar"),
		binding = {
			_btnWayGet = {
				events = {{event = "touch", method = "_onBtnWayGetClicked"}}
			},
			_buttonClose = {
				events = {{event = "touch", method = "_onBtnClose"}}
			},
		}
	}

	PopupAvatarDetail.super.ctor(self, resource)
end

function PopupAvatarDetail:onCreate()
	self:_updateAvatarInfo(self._value)
	self._fileNodeAvatar:setVisible(true)
	self._scrollPage:setVisible(false)
end

function PopupAvatarDetail:onEnter()

end

function PopupAvatarDetail:onExit()

end

function PopupAvatarDetail:_onBtnWayGetClicked()
	local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
	PopupItemGuider:updateUI(self._type,self._value)
	PopupItemGuider:openWithAction()
end

function PopupAvatarDetail:_onBtnClose()
	self:close()
end

function PopupAvatarDetail:_updateUnitData(type,value)
	local convertData = TypeConvertHelper.convert(type,value)
	if convertData == nil then
		return
	end

	if type == TypeConvertHelper.TYPE_AVATAR then
		local data = {base_id = value}
		local unitData = G_UserData:getAvatar():createTempAvatarUnitData(data)
		self._unitData = unitData
	end
	if self._unitData == nil then
		assert(false, "can't find avatar by id : "..value)
	end
end

function PopupAvatarDetail:_updateAvatarInfo(baseId)
	self._value = baseId
	self:_updateUnitData(self._type, self._value)
	self._detailWindow:updateUI(self._unitData)
	self._btnWayGet:setString(Lang.get("way_type_goto_get"))
	self._fileNodeCountryFlag:updateUI(TypeConvertHelper.TYPE_AVATAR, self._unitData:getBase_id())
	self._fileNodeAvatar:updateUI(self._unitData:getBase_id())

	local param = TypeConvertHelper.convert(self._type, self._value)
	self._commonVerticalText:setString(param.name)
end

--使用了翻页功能
function PopupAvatarDetail:setPageData(dataList, params)
	self._dataList = dataList
	self._scrollPage:setCallBack(handler(self, self._updateItemAvatar))
	self._scrollPage:setVisible(true)
	self._fileNodeAvatar:setVisible(false)
	local selectPos = 0
	for i, data in ipairs(self._dataList) do
		if  data.cfg.id == self._value then
			selectPos = i
		end
	end
	self._scrollPage:setUserData(dataList,selectPos)
end

function PopupAvatarDetail:_updateItemAvatar(sender, widget, index, selectPos)
	local data = self._dataList[index]
	if data == nil then
		return
	end

	local baseId = data.cfg.id

	local count = widget:getChildrenCount()
	if count == 0 then
		local CSHelper = require("yoka.utils.CSHelper")
		local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonAvatarAvatar", "common"))
		avatar:updateUI(baseId)
		avatar:showShadow(false)
		avatar:setPosition(cc.p(self._scrollPage:getPageSize().width / 2, self._scrollPage:getPageSize().height / 2))
		widget:addChild(avatar)
	end

	if selectPos == index then
		self:_updateAvatarInfo(baseId)
	end
end

return PopupAvatarDetail