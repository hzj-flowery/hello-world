--
-- Author: Liangxu
-- Date: 2017-9-16 15:49:24
--
local ListViewCellBase = require("app.ui.ListViewCellBase")
local InstrumentDetailFeatureNode = class("InstrumentDetailFeatureNode", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TextHelper = require("app.utils.TextHelper")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local CSHelper = require("yoka.utils.CSHelper")

function InstrumentDetailFeatureNode:ctor(instrumentData)
	self._instrumentData = instrumentData

	local resource = {
		file = Path.getCSB("InstrumentDetailDynamicModule", "instrument"),
		binding = {
			
		},
	}
	InstrumentDetailFeatureNode.super.ctor(self, resource)
end

function InstrumentDetailFeatureNode:onCreate()
	local title = self:_createTitle()
	self._listView:pushBackCustomItem(title)

	self:_buildDes(1)
	self:_buildDes(2)
	self:_buildDes(3)
	self:_buildDes(4)
	
	self._listView:doLayout()
	local contentSize = self._listView:getInnerContainerSize()
	self._listView:setContentSize(contentSize)
	self:setContentSize(contentSize)
end

function InstrumentDetailFeatureNode:_createTitle()
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

function InstrumentDetailFeatureNode:_buildDes(type)
	local baseId = self._instrumentData:getBase_id()
	local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, baseId)
	local unlockLevel = 0
	if type == 1 then
		unlockLevel = param.unlock
	elseif type == 2 then
		unlockLevel = param.cfg.unlock_1
	elseif type == 3 then
		unlockLevel = param.cfg.unlock_2
	elseif type == 4 then
		unlockLevel = param.cfg.unlock_3
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
	if G_UserData:getBase():isEquipAvatar() and self._instrumentData:getPos() == 1 then --有穿变身卡，且主角穿戴了此神兵
		local avatarId = G_UserData:getBase():getAvatar_base_id()
		local heroId = AvatarDataHelper.getAvatarConfig(avatarId).hero_id
		if type == 1 then
			description = AvatarDataHelper.getAvatarMappingConfig(heroId).description
		elseif type == 2 then
			description = AvatarDataHelper.getAvatarMappingConfig(heroId).description_1
		elseif type == 3 then
			description = AvatarDataHelper.getAvatarMappingConfig(heroId).description_2
		elseif type == 4 then
			description = AvatarDataHelper.getAvatarMappingConfig(heroId).description_3
		end
	else
		if type == 1 then
			description = param.description
		elseif type == 2 then
			description = param.cfg.description_1
		elseif type == 3 then
			description = param.cfg.description_2
		elseif type == 4 then
			description = param.cfg.description_3
		end
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

return InstrumentDetailFeatureNode