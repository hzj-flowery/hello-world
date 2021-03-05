

local ListViewCellBase = require("app.ui.ListViewCellBase")
local HorseDetailRideNode = class("HorseDetailRideNode", ListViewCellBase)
local CSHelper = require("yoka.utils.CSHelper")
local HorseDataHelper = require("app.utils.data.HorseDataHelper")

function HorseDetailRideNode:ctor(data)
	self._data = data
	local resource = {
		file = Path.getCSB("HorseDetailDynamicModule", "horse"),
		binding = {

		}
	}
	HorseDetailRideNode.super.ctor(self, resource)
end

function HorseDetailRideNode:onCreate()
	local title = self:_createTitle()
	self._listView:pushBackCustomItem(title)

	local des = self:_createDes()
	self._listView:pushBackCustomItem(des)

	self._listView:doLayout()
	local contentSize = self._listView:getInnerContainerSize()
	self._listView:setContentSize(contentSize)
	self:setContentSize(contentSize)
end

function HorseDetailRideNode:_createTitle()
	local title = CSHelper.loadResourceNode(Path.getCSB("CommonDetailTitleWithBg", "common"))
	title:setFontSize(24)
	title:setTitle(Lang.get("horse_detail_title_ride"))
	local widget = ccui.Widget:create()
	local titleSize = cc.size(402, 50)
	widget:setContentSize(titleSize)
	title:setPosition(titleSize.width / 2, 30)
	widget:addChild(title)

	return widget
end

function HorseDetailRideNode:_createDes()
	local rideDes = ""
	local heroIds, isSuitAll = G_UserData:getHorse():getHeroIdsWithHorseId(self._data:getBase_id())
	if isSuitAll then
		rideDes = Lang.get("horse_suit_ride_all")
	else
		local strNames = ""
		local names = HorseDataHelper.getHeroNameByFilter(heroIds)
		for i, name in ipairs(names) do
			strNames = strNames..name
			if i ~= #names then
				strNames = strNames.."、"
			end
		end
		rideDes = Lang.get("horse_suit_ride_heros", {heroNames = strNames})
	end

	local color = Colors.BRIGHT_BG_TWO

	local widget = ccui.Widget:create()
	local labelDes = cc.Label:createWithTTF(rideDes, Path.getCommonFont(), 20)
	labelDes:setAnchorPoint(cc.p(0, 1))
	labelDes:setLineHeight(26)
	labelDes:setWidth(354)
	labelDes:setColor(color)

	local height = labelDes:getContentSize().height
	labelDes:setPosition(cc.p(24, height + 15))
	widget:addChild(labelDes)

	local size = cc.size(402, height + 20)
	widget:setContentSize(size)

	return widget
end

return HorseDetailRideNode