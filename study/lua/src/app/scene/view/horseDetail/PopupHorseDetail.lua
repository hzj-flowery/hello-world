--
-- Author: liangxu
-- Date: 2018-8-27
-- 战马详情
local PopupBase = require("app.ui.PopupBase")
local PopupHorseDetail = class("PopupHorseDetail", PopupBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local PopupItemGuider = require("app.ui.PopupItemGuider")
local HorseDataHelper = require("app.utils.data.HorseDataHelper")

function PopupHorseDetail:ctor(type,value)
	self._type = type
	self._value = value
	self:_updateUnitData(type,value)
	
	local resource = {
		file = Path.getCSB("PopupHorseDetail", "horse"),
		binding = {
			_btnWayGet = {
				events = {{event = "touch", method = "_onBtnWayGetClicked"}}
			},
			_buttonClose = {
				events = {{event = "touch", method = "_onBtnClose"}}
			},
		}
	}

	PopupHorseDetail.super.ctor(self, resource)
end

function PopupHorseDetail:onCreate()
	self._pageAvatars = {}
	self:_updateHorseInfo(self._value)
	self._fileNodeHorse:setVisible(true)
	self._fileNodeHorse:showShadow(false)
	self._scrollPage:setVisible(false)
end

function PopupHorseDetail:onEnter()

end

function PopupHorseDetail:onExit()

end

function PopupHorseDetail:_onBtnWayGetClicked()
	local popup = PopupItemGuider.new(Lang.get("way_type_get"))
	popup:updateUI(self._type,self._value)
	popup:openWithAction()
end

function PopupHorseDetail:_onBtnClose()
	self:close()
end

function PopupHorseDetail:_updateUnitData(type,value)
	local convertData = TypeConvertHelper.convert(type,value)
	if convertData == nil then
		return
	end

	if type == TypeConvertHelper.TYPE_HORSE then
		local unitData = G_UserData:getHorse():createTempHorseUnitData(value)
		self._horseUnitData = unitData
	elseif type == TypeConvertHelper.TYPE_FRAGMENT then
		local heroId = convertData.cfg.comp_value
		local unitData = G_UserData:getHorse():createTempHorseUnitData(heroId)
		self._horseUnitData = unitData
	end
	if self._horseUnitData == nil then
		assert(false, "can't find horse by id : "..value)
	end
end

function PopupHorseDetail:_updateHorseInfo(baseId)
	self._value = baseId
	self:_updateUnitData(self._type,self._value)
	self._detailWindow:updateUI(self._horseUnitData)
	self._btnWayGet:setString(Lang.get("way_type_goto_get"))
	self._fileNodeCountryFlag:updateUI(TypeConvertHelper.TYPE_HORSE, self._horseUnitData:getBase_id())
	self._fileNodeHorse:updateUI(self._horseUnitData:getBase_id())
	self._fileNodeHorse:playAnimationOnce("win")
	HorseDataHelper.playVoiceWithId(baseId)

	local strSuit = HorseDataHelper.getHorseConfig(self._horseUnitData:getBase_id()).type
	self._textSuit:setString(Lang.get("horse_suit_ride_tip2", {type = strSuit}))
end

--使用了翻页功能
function PopupHorseDetail:setPageData(dataList, params)
	self._dataList = dataList
	self._scrollPage:setCallBack(handler(self, self._updateItemAvatar))
	self._scrollPage:setVisible(true)
	self._fileNodeHorse:setVisible(false)
	local selectPos = 0
	for i, data in ipairs(self._dataList) do
		if  data.cfg.id == self._value then
			selectPos = i
		end
	end
	self._scrollPage:setUserData(dataList,selectPos)
end

function PopupHorseDetail:_updateItemAvatar(sender, widget, index, selectPos)
	local data = self._dataList[index]
	if data == nil then
		return
	end

	local baseId = data.cfg.id
	local count = widget:getChildrenCount()
	if count == 0 then
		local CSHelper = require("yoka.utils.CSHelper")
		local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonHorseAvatar", "common"))
		avatar:updateUI(baseId)
		avatar:showShadow(false)
		avatar:showEffect(true)
		avatar:setPosition(cc.p(self._scrollPage:getPageSize().width / 2, self._scrollPage:getPageSize().height / 2 - 150))
		widget:addChild(avatar)
		self._pageAvatars[index] = avatar
	end

	if selectPos == index then
		self:_updateHorseInfo(baseId)
	end

	local avatar = self._pageAvatars[index]
	if avatar then
		avatar:playAnimationOnce("win")
		HorseDataHelper.playVoiceWithId(baseId)
	end
end
return PopupHorseDetail