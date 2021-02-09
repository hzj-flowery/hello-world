--
-- Author: chenzhongjie
-- Date: 2019-08-23
--
local ListViewCellBase = require("app.ui.ListViewCellBase")
local HistoryWeaponDetailHeroNode = class("HistoryWeaponDetailHeroNode", ListViewCellBase)
local CSHelper = require("yoka.utils.CSHelper")
local HistoryHeroDataHelper = require("app.utils.data.HistoryHeroDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")


function HistoryWeaponDetailHeroNode:ctor(weaponData)
	self._weaponData = weaponData

	local resource = {
		file = Path.getCSB("HistoryHeroDynamicModule", "historyhero"),
		binding = {

		}
	}
	HistoryWeaponDetailHeroNode.super.ctor(self, resource)
end

function HistoryWeaponDetailHeroNode:onCreate()
	local title = self:_createTitle()
	self._listView:pushBackCustomItem(title)

	local des = self:_createHeros()
	self._listView:pushBackCustomItem(des)

	self._listView:doLayout()
	local contentSize = self._listView:getInnerContainerSize()
	self._listView:setContentSize(contentSize)
	self:setContentSize(contentSize)
end

function HistoryWeaponDetailHeroNode:_createTitle()
	local title = CSHelper.loadResourceNode(Path.getCSB("CommonDetailTitleWithBg", "common"))
	title:setFontSize(24)
	title:setTitle(Lang.get("historyhero_weapon_detail_title_hero"))
	local widget = ccui.Widget:create()
	local titleSize = cc.size(402, 50)
	widget:setContentSize(titleSize)
	title:setPosition(titleSize.width / 2, 30)
	widget:addChild(title)

	return widget
end

function HistoryWeaponDetailHeroNode:_createHeros()
	local heros = self._weaponData:getConfig().historical_hero
	local herosList = string.split(tostring(heros), "|")
	local HEIGHT_CELL = 110
	local widget = ccui.Widget:create()
	for k, v in pairs(herosList) do
		local heroConfig = HistoryHeroDataHelper.getHistoryHeroInfo(tonumber(v))
		
		local type = TypeConvertHelper.TYPE_HISTORY_HERO
		local baseId = tonumber(v)
		local size = 1
		local param = TypeConvertHelper.convert(type, baseId, size)

		local function updateIcon(heroIcon, heroId)
			local fileNodeEquip = ccui.Helper:seekNodeByName(heroIcon, "FileNodeEquip")
			cc.bind(fileNodeEquip, "CommonHistoryHeroIcon")
			fileNodeEquip:updateUI(heroId, 1)
			fileNodeEquip:setRoundType(false)
			-- 防止界面循环，名将-武器-名将
			fileNodeEquip:setTouchEnabled(false)
			local HistoryHeroConst = require("app.const.HistoryHeroConst")
			if heroConfig.color == HistoryHeroConst.QUALITY_PURPLE then
				fileNodeEquip:updateUIBreakThrough(2)
			elseif heroConfig.color == HistoryHeroConst.QUALITY_ORANGE then
				fileNodeEquip:updateUIBreakThrough(3)
			end

			local textName = ccui.Helper:seekNodeByName(heroIcon, "TextName")
			textName:setString(param.name)
			textName:setColor(param.icon_color)
			require("yoka.utils.UIHelper").updateTextOutline(textName, param)

			local color = Colors.BRIGHT_BG_TWO
			local labelDes = ccui.Helper:seekNodeByName(heroIcon, "Desc")
			labelDes:setString(heroConfig.short_description)
			labelDes:setColor(color)
		end
		
		local CSHelper = require("yoka.utils.CSHelper")
		local heroIcon = CSHelper.loadResourceNode(Path.getCSB("HistoryWeaponDetailHeroIcon", "historyhero"))
		updateIcon(heroIcon, baseId)
	
		heroIcon:setPosition(cc.p(0, ((#herosList - k)  * HEIGHT_CELL)))
		widget:addChild(heroIcon)
	end

	local size = cc.size(402, #herosList * HEIGHT_CELL + 10)
	widget:setContentSize(size)

	return widget
end

return HistoryWeaponDetailHeroNode