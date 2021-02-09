local PopupBase = require("app.ui.PopupBase")
local PopupHistoryHeroWeaponDetail = class("PopupHistoryHeroWeaponDetail", PopupBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local HeroDataHelper = require("app.utils.data.HeroDataHelper")
local HistoryHeroAttrLayer = require("app.scene.view.historyhero.HistoryHeroAttrLayer")

--[[
   name: ctor
   param heroList 历代名将配置id list
   return: nil
]]
function PopupHistoryHeroWeaponDetail:ctor(weaponId)
	self._weaponId = weaponId
	self._weaponIdList = {}
		
	local resource = {
		file = Path.getCSB("PopupHistoryHeroWeaponDetail", "historyhero"),
		binding = {
			_btnWayGet = {
				events = {{event = "touch", method = "_onBtnWayGetClicked"}}
			},
		}
	}

	PopupHistoryHeroWeaponDetail.super.ctor(self, resource)
end

function PopupHistoryHeroWeaponDetail:onCreate()
	self._commonBg:addCloseEventListener(handler(self,self._onBtnClose))
	self._commonBg:setTitle(Lang.get("historyhero_book_title_weapon"))
	self._btnWayGet:setString(Lang.get("way_type_goto_get"))
	self._isShowDrawing = false
	self._avatarPageItems = nil
	self._curSelectedPos = 1
	-- self["historicalDetailView"] = HistoryHeroAttrLayer.new()
	-- self["historicalDetailView"]:updateScrollHeight()
	-- self._nodeLayer:addChild(self["historicalDetailView"])
	-- self:_updateDetailLayer()
end

function PopupHistoryHeroWeaponDetail:onEnter()
	self:_initData()
	self:setPageData(self._weaponIdList)
	-- if not self._isPage then
	-- 	local dataList = {}
	-- 	for i = 1, #self._heroList do
	-- 		table.insert(dataList, {cfg = 
	-- 								{id = self._heroList[i]},
	-- 								limitLevel = self._limitLevel
	-- 								})
	-- 	end
	-- 	-- local dataList = {
	-- 	-- 	{cfg = {id = self._value}, limitLevel = self._limitLevel}
	-- 	-- }
	-- 	self:setPageData(dataList)
	-- end

	-- self._value = self._heroList[1]
end

function PopupHistoryHeroWeaponDetail:onExit()
end

function PopupHistoryHeroWeaponDetail:_initData()
	table.insert(self._weaponIdList, self._weaponId)
end

function PopupHistoryHeroWeaponDetail:_updateWeaponInfo(weaponData)

	self._detailWindow:updateUI(weaponData)
	-- self._heroBaseId = heroBaseId

	local haveHero = G_UserData:getHistoryHero():haveWeapon(self._weaponId)
	local color = haveHero and Colors.DARK_BG_THREE or Colors.BRIGHT_BG_RED
	self._hasText:setColor(color)
	self._hasText:setString(haveHero and Lang.get("common_have") or  Lang.get("common_not_have")) 
	
	-- local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HISTORY_HERO, heroBaseId)
	-- self._textHeroName:setString(heroParam.name)
	-- self._textHeroName:setColor(heroParam.icon_color)

	-- self:_updateWeaponState(weaponId)

	-- if self._uniqueId == nil then
	-- 	self["historicalDetailView"]:updateUIForNoraml(self._value)
	-- else
	-- 	local heroData = G_UserData:getHistoryHero():getHisoricalHeroValueById(self._uniqueId)
	-- 	self["historicalDetailView"]:updateUI(heroData)
	-- end
	-- self:_playCurHeroVoice()
end

function PopupHistoryHeroWeaponDetail:_updateDetailLayer()
	-- if self._type == TypeConvertHelper.TYPE_HISTORY_HERO then
	-- 	if self._uniqueId == nil then
	-- 		self["historicalDetailView"]:updateUIForNoraml(self._value)
	-- 	else
	-- 		local heroData = G_UserData:getHistoryHero():getHisoricalHeroValueById(self._uniqueId)
	-- 		self["historicalDetailView"]:updateUI(heroData)
	-- 	end
	-- end
end

--如果没有立绘，显示普通状态
function PopupHistoryHeroWeaponDetail:_updateWeaponState(weaponId)
	-- local isHave = self:_isHaveStory(heroBaseId)
	-- local show = self._isShowDrawing and isHave
	
	self._scrollPage:setCurPage(self._curSelectedPos)
end

function PopupHistoryHeroWeaponDetail:_onBtnClose()
	self:close()
end

function PopupHistoryHeroWeaponDetail:_onBtnWayGetClicked()
	--self:close()
	local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
	PopupItemGuider:updateUI(TypeConvertHelper.TYPE_HISTORY_HERO_WEAPON, self._weaponId)
	PopupItemGuider:openWithAction()
end

--使用了翻页功能
function PopupHistoryHeroWeaponDetail:setPageData(dataList)
	local selectPos = 0
	for i, data in pairs(dataList) do
		if data == self._weaponId then
			selectPos = i
		end
	end
	self:_setScrollPage(dataList, selectPos)
end

function PopupHistoryHeroWeaponDetail:_setScrollPage(dataList, selectPos)
	self._scrollPage:setCallBack(handler(self, self._updateWeaponItem))
	self._scrollPage:setUserData(dataList, selectPos)
end

function PopupHistoryHeroWeaponDetail:_updateWeaponItem(sender, widget, index, selectPos)
	local data = self._weaponIdList[index]
	if data == nil then
		return
	end

	local baseId = data

	local count = widget:getChildrenCount()
	if count == 0 then
		local CSHelper = require("yoka.utils.CSHelper")
		local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonHistoryWeaponAvatar", "common"))
		avatar:updateUI(baseId)
		avatar:showShadow(false)
		avatar:setPosition(cc.p(self._scrollPage:getPageSize().width / 2, self._scrollPage:getPageSize().height / 2))
		widget:addChild(avatar)
	end
	
	if selectPos == index then
		local HistoryHeroWeaponUnit = require("app.data.HistoryHeroWeaponUnit")
		local config = require("app.config.historical_hero_equipment").get(baseId)
		local unit = HistoryHeroWeaponUnit.new()
		unit:setId(baseId)
		unit:setNum(1)
		unit:setConfig(config)
		self:_updateWeaponInfo(unit)
	end
end

--是否有立绘
function PopupHistoryHeroWeaponDetail:_isHaveStory(heroBaseId)
	local info = HeroDataHelper.getHeroConfig(heroBaseId)
	local resId = info.res_id
    local resData = HeroDataHelper.getHeroResConfig(resId)
    local isHaveSpine = resData.story_res_spine ~= 0
    local isHaveRes = resData.story_res ~= 0 and resData.story_res ~= 777 --777是阴影图
    return isHaveSpine or isHaveRes
end



return PopupHistoryHeroWeaponDetail