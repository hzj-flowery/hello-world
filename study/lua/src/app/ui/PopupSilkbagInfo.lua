-- 锦囊信息
-- Author: Liangxu
-- 
local PopupBase = require("app.ui.PopupBase")
local PopupSilkbagInfo = class("PopupSilkbagInfo", PopupBase)
local CSHelper = require("yoka.utils.CSHelper")
local SilkbagDataHelper = require("app.utils.data.SilkbagDataHelper")
local HeroDataHelper = require("app.utils.data.HeroDataHelper")
local UIHelper = require("yoka.utils.UIHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local PopupSilkbagInfoCell = require("app.ui.PopupSilkbagInfoCell")
local FunctionCheck = require("app.utils.logic.FunctionCheck")
local TextHelper = require("app.utils.TextHelper")
local SilkbagConst = require("app.const.SilkbagConst")

function PopupSilkbagInfo:ctor(title)
	self._title = title or Lang.get("common_title_silkbag_info")

	local resource = {
		file = Path.getCSB("PopupSilkbagInfo", "common"),
		binding = {
			_btnOk = {
				events = {{event = "touch", method = "_onBtnOk"}}
			}
		}
	}
	PopupSilkbagInfo.super.ctor(self, resource)
end

function PopupSilkbagInfo:onCreate()
	self._btnOk:setString(Lang.get("common_btn_sure"))
	self._commonNodeBk:addCloseEventListener(handler(self, self._onBtnCancel))
	self._commonNodeBk:setTitle(self._title)
	self._commonNodeBk:hideCloseBtn()
	self._nodeDetailTitle:setTitle(Lang.get("silkbag_suit_hero_title"))
	self._nodeDetailTitle:setFontSize(24)

	self._heroIds = {}
	self._listView:setTemplate(PopupSilkbagInfoCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
end

function PopupSilkbagInfo:onEnter()
	
end

function PopupSilkbagInfo:onExit()
	
end

function PopupSilkbagInfo:updateUI(silkbagId)
	self._silkbagId = silkbagId
	self._itemIcon:unInitUI()
	self._itemIcon:initUI(TypeConvertHelper.TYPE_SILKBAG, silkbagId)
	self._itemIcon:setTouchEnabled(false)
	self._itemIcon:setImageTemplateVisible(true)
	local itemParams = self._itemIcon:getItemParams()
	local nameTemp = Lang.get("silkbag_name_title", {name = itemParams.name})
	local nameStr = itemParams.cfg.only == SilkbagConst.ONLY_TYPE_1 and Lang.get("silkbag_only_tip", {name = nameTemp}) or nameTemp
	self._itemName:setString(nameStr)
	self._itemName:setColor(itemParams.icon_color)

	local isOpen, comment, info = FunctionCheck.funcIsOpened(FunctionConst.FUNC_SILKBAG)
	local levelTip = isOpen and "" or Lang.get("silkbag_level_tip", {level = info.level})
	self._levelTip:setString(levelTip)

	self._itemDesc:setString(itemParams.cfg.description)
	self._textPower:setString("+"..itemParams.cfg.fake)

	self:_updateListView(silkbagId)
end

function PopupSilkbagInfo:_updateListView(silkbagId)
	local heroIds = G_UserData:getSilkbag():getHeroIdsWithSilkbagId(silkbagId)
	self._heroIds = self:_filterHeroIds(heroIds)
	self._listView:clearAll()
    self._listView:resize(#self._heroIds)
end

function PopupSilkbagInfo:_onItemUpdate(item, index)
	local index = index + 1
	local heroId = self._heroIds[index]
	if heroId then
		local silkId = SilkbagDataHelper.getSilkbagConfig(self._silkbagId).mapping
		item:update(heroId, silkId)
	end
end

function PopupSilkbagInfo:_onItemSelected(item, index)
	
end

function PopupSilkbagInfo:_onItemTouch(index, t)
    
end

--过滤heroIds，如果有多个男/女主角，只保留一个
function PopupSilkbagInfo:_filterHeroIds(heroIds)
	local isLeaderExist = false
	local temp = {}
	local result = {}

	local function sortFunc(a, b)
		if a.type ~= b.type then
			return a.type < b.type
		elseif a.color ~= b.color then
			return a.color > b.color
		else
			return a.id < b.id
		end
	end

	local gender = G_UserData:getBase():isMale() and 1 or 2
	for i, heroId in ipairs(heroIds) do
		local info = HeroDataHelper.getHeroConfig(heroId)
		if info.type == 1 then --主角
			if info.gender == gender and not isLeaderExist then
				table.insert(temp, info)
				isLeaderExist = true
			end
		else
			table.insert(temp, info)
		end
	end

	table.sort(temp, sortFunc)
	for i, data in ipairs(temp) do
		table.insert(result, data.id)
	end

	return result
end

function PopupSilkbagInfo:_onBtnOk()
	self:close()
end

function PopupSilkbagInfo:_onBtnCancel()
	self:close()
end

return PopupSilkbagInfo