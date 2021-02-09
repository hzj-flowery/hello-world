--
-- Author: hedl
-- Date: 2017-4-20 15:09:42
-- 玉石详情
--local ViewBase = require("app.ui.ViewBase")
local PopupBase = require("app.ui.PopupBase")
local PopupJadeDetail = class("PopupJadeDetail", PopupBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

function PopupJadeDetail:ctor(type, value)
	self._type = type
	self._value = value
	self:_updateUnitData(type, value)

	local resource = {
		file = Path.getCSB("PopupJadeDetail", "equipment"),
		binding = {
			_btnWayGet = {
				events = {{event = "touch", method = "_onBtnWayGetClicked"}}
			},
			_buttonClose = {
				events = {{event = "touch", method = "_onBtnClose"}}
			}
		}
	}

	PopupJadeDetail.super.ctor(self, resource)
end

function PopupJadeDetail:onCreate()
	self:_updateJadeInfo(self._value)
	self._fileNodeJade:setVisible(true)
	self._scrollPage:setVisible(false)
end

function PopupJadeDetail:onEnter()
end

function PopupJadeDetail:onExit()
end

-- function PopupJadeDetail:_updateJadeQuilityName(baseId)
-- 	local jadeParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_JADE_STONE, baseId)
-- 	self._textPotential:setString(Lang.get("equipment_detail_txt_potential2", {value = jadeParam.potential}))
-- 	self._textPotential:setColor(jadeParam.icon_color)
-- 	self._textPotential:enableOutline(jadeParam.icon_color_outline, 2)
-- end

function PopupJadeDetail:_onBtnWayGetClicked()
	local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
	PopupItemGuider:updateUI(self._type, self._value)
	PopupItemGuider:openWithAction()
end

function PopupJadeDetail:_onBtnClose()
	self:close()
end

function PopupJadeDetail:_updateUnitData(type, value)
	local convertData = TypeConvertHelper.convert(type, value)
	if convertData == nil then
		return
	end

	self._equipUnitData = unitData
	self._jadeConfig = require("app.config.jade").get(value)
end

function PopupJadeDetail:_updateJadeInfo(baseId)
	self._value = baseId
	self._jadeConfig = require("app.config.jade").get(baseId)
	self:_updateUnitData(self._type, self._value)
	self._detailWindow:updateUI(self._jadeConfig)
	self._btnWayGet:setString(Lang.get("way_type_goto_get"))
	self._fileNodeCountryFlag:updateUI(TypeConvertHelper.TYPE_JADE_STONE, baseId)
	self._fileNodeJade:updateUI(baseId)
	local strPower = "+" .. self._jadeConfig.fake
	self._textPower:setString(strPower)
	-- self:_updateJadeQuilityName(baseId)
end

--使用了翻页功能
function PopupJadeDetail:setPageData(dataList, params)
	self._dataList = dataList
	self._scrollPage:setCallBack(handler(self, self._updateJadeItem))
	self._scrollPage:setVisible(true)
	self._fileNodeJade:setVisible(false)
	local selectPos = 0
	for i, data in ipairs(self._dataList) do
		if data.cfg.id == self._value then
			selectPos = i
		end
	end
	self._scrollPage:setUserData(dataList, selectPos)
end

function PopupJadeDetail:_updateJadeItem(sender, widget, index, selectPos)
	local data = self._dataList[index]
	if data == nil then
		return
	end

	local baseId = data.cfg.id

	local count = widget:getChildrenCount()
	if count == 0 then
		local CSHelper = require("yoka.utils.CSHelper")
		local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonJadeAvatar", "common"))
		avatar:updateUI(baseId)
		avatar:setPosition(cc.p(self._scrollPage:getPageSize().width / 2, self._scrollPage:getPageSize().height / 2))
		widget:addChild(avatar)
	end

	if selectPos == index then
		self:_updateJadeInfo(baseId)
	end
end
return PopupJadeDetail
