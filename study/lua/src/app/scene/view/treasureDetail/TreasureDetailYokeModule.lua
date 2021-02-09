--
-- Author: Liangxu
-- Date: 2017-07-21 15:58:20
--
local ListViewCellBase = require("app.ui.ListViewCellBase")
local TreasureDetailYokeModule = class("TreasureDetailYokeModule", ListViewCellBase)
local UserDataHelper = require("app.utils.UserDataHelper")
local TreasureDetailYokeNode = require("app.scene.view.treasureDetail.TreasureDetailYokeNode")
local CSHelper = require("yoka.utils.CSHelper")
local TeamViewHelper = require("app.scene.view.team.TeamViewHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local HeroDataHelper = require("app.utils.data.HeroDataHelper")

function TreasureDetailYokeModule:ctor(yokeInfo, treasureId, width)
	self._yokeInfo = yokeInfo
	self._treasureId = treasureId
	self._width = width

	local resource = {
		file = Path.getCSB("TreasureDetailDynamicModule", "treasure"),
		binding = {

		}
	}
	TreasureDetailYokeModule.super.ctor(self, resource)
end

function TreasureDetailYokeModule:onCreate()
	local title = self:_createTitle()
	self._listView:pushBackCustomItem(title)

	for i, one in ipairs(self._yokeInfo) do
		local heroIds = one.heroIds
		for j, heroId in ipairs(heroIds) do
			local treasureDetailYokeNode =  TreasureDetailYokeNode.new()
			local isActivated = UserDataHelper.checkIsEquipInHero(self._treasureId, heroId)
			treasureDetailYokeNode:updateView(one, heroId, isActivated)

			if self._width then
				treasureDetailYokeNode:setImageBgLength(self._width)
			end

			self._listView:pushBackCustomItem(treasureDetailYokeNode)

			local widgetCondition = self:_createWidgetCondition(one, heroId, isActivated)
			self._listView:pushBackCustomItem(widgetCondition)

			local widgetLine = self:_createWidgetLine()
			self._listView:pushBackCustomItem(widgetLine)
			if i ~= #self._yokeInfo or j ~= #heroIds then
				
			end
		end
	end

	self._listView:doLayout()
	local contentSize = self._listView:getInnerContainerSize()
	self._listView:setContentSize(contentSize)
	self:setContentSize(contentSize)
end

function TreasureDetailYokeModule:_createTitle()
	local title = CSHelper.loadResourceNode(Path.getCSB("CommonDetailTitleWithBg", "common"))
	title:setFontSize(24)
	title:setTitle(Lang.get("treasure_detail_title_yoke"))
	local widget = ccui.Widget:create()
	local titleSize = cc.size(402, 50)
	widget:setContentSize(titleSize)
	title:setPosition(titleSize.width / 2, 30)
	widget:addChild(title)

	return widget
end

function TreasureDetailYokeModule:_createWidgetCondition(data, heroId, isActivated)
	local widget = ccui.Widget:create()
	local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroId)
	local name = param.name
	if param.cfg.type == 1 then --主角
		local gender = param.cfg.gender
		local myGender = G_UserData:getBase():isMale() and 1 or 2
		local isSelf = gender == myGender
		if not isSelf then
			name = Lang.get("common_gender_role_"..gender)
		end
	end
	
	local attrDes = ""
	local attrInfo = data.attrInfo
	for i = 1, #attrInfo do
		local attr = attrInfo[i]
		local text = Lang.get("hero_detail_yoke_attr_value", {
			attr = require("app.config.attribute").get(attr.attrId).cn_name,
			value = tonumber(attr.attrValue / 10),
		})
		attrDes = attrDes..text
	end

	local yokeDes = Lang.get("treasure_detail_yoke_des", {name = name, attrDes = attrDes})
	local totalDes = yokeDes
	if not isActivated and param.cfg.type == 1 then --主角没激活，要说明官衔升至哪级
		local officialName = HeroDataHelper.getOfficialNameWithHeroId(heroId)
		local tipDes = Lang.get("treasure_detail_yoke_role_tip", {official = officialName})
		totalDes = yokeDes..tipDes
	end
	local label = cc.Label:createWithTTF(totalDes, Path.getCommonFont(), 20)
	label:setMaxLineWidth(354)
	label:setAnchorPoint(cc.p(0, 0))
	label:setPosition(cc.p(24, 0))
	local color = isActivated and Colors.BRIGHT_BG_GREEN or Colors.BRIGHT_BG_TWO
	label:setColor(color)

	widget:addChild(label)
	local sizeTemp = label:getContentSize()
	widget:setContentSize(cc.size(sizeTemp.width, sizeTemp.height + 10)) --没行字上面空隙10

	return widget
end

function TreasureDetailYokeModule:_createWidgetLine()
	local widget = ccui.Widget:create()
	local line = TeamViewHelper.createLine(402)
	widget:addChild(line)
	widget:setContentSize(line:getContentSize())

	return widget
end

return TreasureDetailYokeModule