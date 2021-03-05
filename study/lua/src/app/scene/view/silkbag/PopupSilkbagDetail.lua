-- 锦囊详情弹框
-- Author: Liangxu
-- 
local PopupBase = require("app.ui.PopupBase")
local PopupSilkbagDetail = class("PopupSilkbagDetail", PopupBase)
local SilkbagDataHelper = require("app.utils.data.SilkbagDataHelper")
local SilkbagDetailCell = require("app.scene.view.silkbag.SilkbagDetailCell")

function PopupSilkbagDetail:ctor()
	self._isSeasonSilk	= true
	local resource = {
		file = Path.getCSB("PopupSilkbagDetail", "silkbag"),
		binding = {

		}
	}
	PopupSilkbagDetail.super.ctor(self, resource)
end

function PopupSilkbagDetail:onCreate()
	self._datas = {}

	self._nodeBg:setTitle(Lang.get("silkbag_detail_title"))
	self._nodeBg:addCloseEventListener(handler(self, self._onButtonClose))

	self._listView:setTemplate(SilkbagDetailCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
end

function PopupSilkbagDetail:onEnter()
	
end

function PopupSilkbagDetail:onExit()
	if self._callBack then
		self._callBack()
	end
end

function PopupSilkbagDetail:setCloseCallBack(callback)
	self._callBack = callback
end

function PopupSilkbagDetail:updateUI(silkbagIds, pos)
	self._isSeasonSilk	= false
	self._pos = pos
	self._datas = self:_getDatas(silkbagIds)

	self._listView:clearAll()
    self._listView:resize(#self._datas)
end

function PopupSilkbagDetail:_getDatas(silkbagIds)
	local function sortFunc(a, b)
		local effectiveA = a.isEffective and 1 or 0
		local effectiveB = b.isEffective and 1 or 0
		if effectiveA ~= effectiveB then
			return effectiveA > effectiveB
		elseif a.color ~= b.color then
			return a.color > b.color
		else
			return a.baseId < b.baseId
		end
	end

	local heroId = G_UserData:getTeam():getHeroIdWithPos(self._pos)
	local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
	local heroBaseId = heroUnitData:getAvatarToHeroBaseId()
	local heroRank = heroUnitData:getRank_lv()
	local isInstrumentMaxLevel = G_UserData:getInstrument():isInstrumentLevelMaxWithPos(self._pos)
	local heroLimit = heroUnitData:getLeaderLimitLevel()
	local heroRedLimit = heroUnitData:getLeaderLimitRedLevel()
	local result = {}
	for i, silkbagId in ipairs(silkbagIds) do
		local unitData = G_UserData:getSilkbag():getUnitDataWithId(silkbagId)
		local baseId = unitData:getBase_id()
		local isEffective = SilkbagDataHelper.isEffectiveSilkBagToHero(baseId, heroBaseId, heroRank,
			isInstrumentMaxLevel, heroLimit, heroRedLimit)
		local color = SilkbagDataHelper.getSilkbagConfig(baseId).color
		local unit = {
			silkbagId = silkbagId,
			baseId = baseId,
			isEffective = isEffective,
			color = color,
		}
		table.insert(result, unit)
	end
	table.sort(result, sortFunc)

	return result
end

function PopupSilkbagDetail:updateUI2(silkbagIds)
	self._datas = self:_getDatas2(silkbagIds)

	self._listView:clearAll()
    self._listView:resize(#self._datas)
end

function PopupSilkbagDetail:_getDatas2(silkbagIds)
	local function sortFunc(a, b)
		if a.color ~= b.color then
			return a.color > b.color
		else
			return a.baseId < b.baseId
		end
	end

	local result = {}
	for i, silkbagId in ipairs(silkbagIds) do
		local TypeConvertHelper = require("app.utils.TypeConvertHelper")
		local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_SILKBAG, silkbagId)
		local unit = {
			baseId = silkbagId,
			isEffective = true,
			color = param.color,
		}
		table.insert(result, unit)
	end
	table.sort(result, sortFunc)

	return result
end

function PopupSilkbagDetail:_onItemUpdate(item, index)
	local index = index + 1
	local data = self._datas[index]
	if data then
		if self._isSeasonSilk then
			item:update2(data)
		else
			item:update(data)
		end
	end
end

function PopupSilkbagDetail:_onItemSelected(item, index)
	
end

function PopupSilkbagDetail:_onItemTouch(index, t)
    
end

function PopupSilkbagDetail:_onButtonClose()
	self:close()
end

return PopupSilkbagDetail