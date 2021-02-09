--
-- Author: Liangxu
-- Date: 2018-2-1 15:26:19
--
local ListViewCellBase = require("app.ui.ListViewCellBase")
local AvatarDetailInstrumentFeatureModule = class("AvatarDetailInstrumentFeatureModule", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TextHelper = require("app.utils.TextHelper")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local HeroDataHelper = require("app.utils.data.HeroDataHelper")
local InstrumentConst = require("app.const.InstrumentConst")
local CSHelper = require("yoka.utils.CSHelper")

function AvatarDetailInstrumentFeatureModule:ctor()
	local resource = {
		file = Path.getCSB("InstrumentDetailDynamicModule", "instrument"),
		binding = {
			
		},
	}
	AvatarDetailInstrumentFeatureModule.super.ctor(self, resource)
end

function AvatarDetailInstrumentFeatureModule:onCreate()

end

function AvatarDetailInstrumentFeatureModule:updateUI(data, isLock)
	self._data = data
	local instrumentId = G_UserData:getBattleResource():getResourceId(1, InstrumentConst.FLAG, 1)
	if instrumentId == nil then
		local roleBaseId = G_UserData:getHero():getRoleBaseId()
		local instrumentBaseId = HeroDataHelper.getHeroConfig(roleBaseId).instrument_id
		self._instrumentData = G_UserData:getInstrument():createTempInstrumentUnitData({baseId = instrumentBaseId})
	else
		self._instrumentData = G_UserData:getInstrument():getInstrumentDataWithId(instrumentId)
	end

	local title = self:_createTitle()
	self._listView:pushBackCustomItem(title)

	self:_buildDes(1)
	self:_buildDes(2)

	self._listView:doLayout()
	local contentSize = self._listView:getInnerContainerSize()
	self._listView:setContentSize(contentSize)
	self:setContentSize(contentSize)
end

function AvatarDetailInstrumentFeatureModule:_createTitle()
	local title = CSHelper.loadResourceNode(Path.getCSB("CommonDetailTitleWithBg", "common"))
	title:setFontSize(24)
	title:setTitle(Lang.get("instrument_detail_title_feature"))
	local widget = ccui.Widget:create()
	local titleSize = cc.size(402, 50)
	widget:setContentSize(titleSize)
	title:setPosition(titleSize.width / 2, 30)
	widget:addChild(title)

	return widget
end

function AvatarDetailInstrumentFeatureModule:_buildDes(type)
	local baseId = self._instrumentData:getBase_id()
	local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, baseId)
	local unlockLevel = 0
	if type == 1 then
		unlockLevel = param.unlock
	elseif type == 2 then
		unlockLevel = param.cfg.unlock_1
	end
	if unlockLevel == 0 then
		return nil
	end

	--标题部分
	local node = CSHelper.loadResourceNode(Path.getCSB("InstrumentDetailFeatureNode", "instrument"))
	local panelBg = ccui.Helper:seekNodeByName(node, "PanelBg")
	local textName = ccui.Helper:seekNodeByName(node, "TextName")
	local textUnlock = ccui.Helper:seekNodeByName(node, "TextUnlock")

	local nameDes = Lang.get("instrument_detail_feature_level_title", {level = unlockLevel})
	textName:setString(nameDes)
	textUnlock:setString(Lang.get("instrument_detail_advance_unlock2", {level = unlockLevel}))
	local size = textName:getContentSize()
	local posX = textName:getPositionX() + size.width
	textUnlock:setPositionX(posX)
	local level = self._instrumentData:getLevel()
	local isUnlock = level >= unlockLevel --是否解锁特性
	textUnlock:setVisible(not isUnlock)

	local widget1 = ccui.Widget:create()
	local size = panelBg:getContentSize()
	widget1:setContentSize(size)
	widget1:addChild(node)
	self._listView:pushBackCustomItem(widget1)

	--描述部分
	local description = ""
	local avatarId = self._data:getBase_id()
	local heroId = AvatarDataHelper.getAvatarConfig(avatarId).hero_id
	if type == 1 then
		description = AvatarDataHelper.getAvatarMappingConfig(heroId).description
	elseif type == 2 then
		description = AvatarDataHelper.getAvatarMappingConfig(heroId).description_1
	end

	local textDes = cc.Label:createWithTTF(description, Path.getCommonFont(), 20)
	textDes:setAnchorPoint(cc.p(0, 1))
	textDes:setLineHeight(26)
	textDes:setWidth(354)
	local desColor = isUnlock and Colors.SYSTEM_TARGET_RED or Colors.BRIGHT_BG_TWO
	textDes:setColor(desColor)

	local widget2 = ccui.Widget:create()
	local height = textDes:getContentSize().height
	textDes:setPosition(cc.p(24, height + 15))
	widget2:addChild(textDes)
	local size = cc.size(402, height + 20)
	widget2:setContentSize(size)
	self._listView:pushBackCustomItem(widget2)
end

return AvatarDetailInstrumentFeatureModule