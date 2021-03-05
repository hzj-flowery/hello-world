local AvatarDetailBaseAttrModule = require("app.scene.view.avatar.AvatarDetailBaseAttrModule")
local AvatarDetailSkillModule = require("app.scene.view.avatar.AvatarDetailSkillModule")
local AvatarDetailTalentModule = require("app.scene.view.avatar.AvatarDetailTalentModule")
local AvatarDetailInstrumentFeatureModule = require("app.scene.view.avatar.AvatarDetailInstrumentFeatureModule")
local AvatarDetailCombinationModule = require("app.scene.view.avatar.AvatarDetailCombinationModule")
local AvatarDetailBriefModule = require("app.scene.view.avatar.AvatarDetailBriefModule")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

local CommonAvatarProperty = class("CommonAvatarProperty")

local EXPORTED_METHODS = {
    "updateUI",
}

function CommonAvatarProperty:ctor()
	self._target = nil
    self._name2 = nil
end

function CommonAvatarProperty:_init()
    self._name2 = ccui.Helper:seekNodeByName(self._target, "Name2")
    self._listView = ccui.Helper:seekNodeByName(self._target, "ListView")
    self._listView:setScrollBarEnabled(false)
    cc.bind(self._target, "CommonDetailWindow")
end

function CommonAvatarProperty:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonAvatarProperty:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonAvatarProperty:_updateListView()
	self._listView:removeAllChildren()

	self:_buildBaseAttrModule()
	self:_buildSkillModule()
	self:_buildTalentModule()
	self:_buildInstrumentFeatureModule()
	self:_buildCombinationModule()
	self:_buildBriefModule()
end

function CommonAvatarProperty:updateUI(unitData)
    self._unitData = unitData
    self:_updateListView()
    local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_AVATAR, unitData:getBase_id())
    self._name2:setString(param.name)
    self._name2:setColor(param.icon_color)
	--self._name2:enableOutline(param.icon_color_outline, 2)
end

function CommonAvatarProperty:_buildBaseAttrModule()
	local moduleItem = AvatarDetailBaseAttrModule.new()
	moduleItem:updateUI(self._unitData)
	self._listView:pushBackCustomItem(moduleItem)
end

function CommonAvatarProperty:_buildSkillModule()
	local moduleItem = AvatarDetailSkillModule.new()
	moduleItem:updateUI(self._unitData)
	self._listView:pushBackCustomItem(moduleItem)
end

function CommonAvatarProperty:_buildTalentModule()
	local moduleItem = AvatarDetailTalentModule.new()
	moduleItem:updateUI(self._unitData, true)
	self._listView:pushBackCustomItem(moduleItem)
end

function CommonAvatarProperty:_buildInstrumentFeatureModule()
	local moduleItem = AvatarDetailInstrumentFeatureModule.new()
	moduleItem:updateUI(self._unitData, true)
	self._listView:pushBackCustomItem(moduleItem)
end

function CommonAvatarProperty:_buildCombinationModule()
	local strShowId = self._unitData:getConfig().show_id
	local showIds = string.split(strShowId, "|")
	for i, showId in ipairs(showIds) do
		local moduleItem = AvatarDetailCombinationModule.new()
		moduleItem:setTitle(i)
		moduleItem:updateUI(tonumber(showId), true)
		self._listView:pushBackCustomItem(moduleItem)
	end
end

function CommonAvatarProperty:_buildBriefModule()
	local moduleItem = AvatarDetailBriefModule.new()
	moduleItem:updateUI(self._unitData)
	self._listView:pushBackCustomItem(moduleItem)
end

return CommonAvatarProperty