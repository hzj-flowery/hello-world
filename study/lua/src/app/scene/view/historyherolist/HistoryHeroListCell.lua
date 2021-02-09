
local ListViewCellBase = require("app.ui.ListViewCellBase")
local HistoryHeroListCell = class("HistoryHeroListCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local HistoryHeroConst = require("app.const.HistoryHeroConst")

local TOPIMAGERES = {
	"img_iconsign_shangzhen", --上阵
}

function HistoryHeroListCell:ctor()
	local resource = {
		file = Path.getCSB("HistoryHeroListCell", "historyherolist"),
	}
	HistoryHeroListCell.super.ctor(self, resource)
end

function HistoryHeroListCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	
	self._buttonStrengthen1:setVisible(false)
	self._buttonStrengthen2:setVisible(false)
	self._buttonStrengthen1:setString(Lang.get("historyherolist_strengthen"))
	self._buttonStrengthen2:setString(Lang.get("historyherolist_strengthen"))
end

-- @Role 	Desc of awake/break
function HistoryHeroListCell:_updateDesc(breakthrougth)
	local strDescAwake, strDescBreak = nil, nil
	if breakthrougth == 1 then
		strDescAwake = Lang.get("historyherolist_cell_not_awake")
		strDescBreak = Lang.get("historyherolist_cell_not_break")
	elseif breakthrougth == 2 then
		strDescAwake = Lang.get("historyherolist_cell_awakeup")
		strDescBreak = Lang.get("historyherolist_cell_not_break")
	elseif breakthrougth == 3 then
		strDescAwake = Lang.get("historyherolist_cell_awakeup")
		strDescBreak = Lang.get("historyherolist_cell_broken")
	end
	return strDescAwake, strDescBreak
end

-- @Role 	Update UI
function HistoryHeroListCell:updateUI(index, itemLine)
	--data1, data2
	for i = 1, 2 do
        local item = self["_item" .. i]
        item:setVisible(false)
    end
	local function updateCell(index, data)
		if data and next(data) ~= nil then
			if type(data.cfg) ~= "table" or data.cfg:getId() == 0 then
				self["_item"..index]:setVisible(false)
				return
			end

			local type = TypeConvertHelper.TYPE_HISTORY_HERO
			local baseId = 0
			local size = nil
			if data.tabIndex == HistoryHeroConst.LIST_TYPE1 then
				self["_buttonStrengthen"..index]:setVisible(true)
				type = TypeConvertHelper.TYPE_HISTORY_HERO
				baseId = data.cfg:getSystem_id()
			elseif data.tabIndex == HistoryHeroConst.LIST_TYPE3 then
				self["_buttonStrengthen"..index]:setVisible(false)
				type = TypeConvertHelper.TYPE_HISTORY_HERO_WEAPON
				baseId = data.cfg:getId()
				size = data.cfg:getNum()
				self["_desc" .. index]:setString(data.cfg:getConfig().short_description)
			else
				self["_buttonStrengthen"..index]:setVisible(true)
			end

			self["_item"..index]:setVisible(true)
			self["_item"..index]:updateUI(type, baseId, size)
			self["_item"..index]:setUniqueId(data.cfg:getId())

			-- Show-TopImg
			if data.tabIndex == HistoryHeroConst.LIST_TYPE1 then 
				self:_showTopImage(index, data.cfg:getId())
			elseif data.tabIndex == HistoryHeroConst.LIST_TYPE3 then
				self["_imageTop"..index]:setVisible(false)
			end

			local icon = self["_item"..index]:getCommonIcon()
			local params = icon:getItemParams()
			local name = params.name
			self["_item"..index]:setName(name)
			self["_item"..index]:setTouchEnabled(true)

			-- Listener
			self["_buttonStrengthen"..index]:addClickEventListenerEx(function()
				self:dispatchCustomCallback(index)
			end)

			-- Show Desc
			self["_nodeAwake"..index]:setVisible(data.tabIndex == HistoryHeroConst.LIST_TYPE1)
			self["_nodeBreak"..index]:setVisible(data.tabIndex == HistoryHeroConst.LIST_TYPE1)
			self["_imageBackground"..index]:setVisible(data.tabIndex == HistoryHeroConst.LIST_TYPE1)
			if data.tabIndex == HistoryHeroConst.LIST_TYPE1 then
				local strDescAwake, strDescBreak = self:_updateDesc(data.cfg:getBreak_through())
            	self["_nodeAwake"..index]:updateUI(
					Lang.get("historyherolist_cell_awake_des"),strDescAwake)
				self["_nodeBreak"..index]:updateUI(
					Lang.get("historyherolist_cell_break_des"),strDescBreak)
			end
		else
			self["_item"..index]:setVisible(false)
		end
	end

	for i, data in ipairs(itemLine) do
        updateCell(i, data)
    end
end

function HistoryHeroListCell:_showTopImage(index, id)
	local imageTop = self["_imageTop"..index]
	local isInBattle, _ = G_UserData:getHistoryHero():isStarEquiped(id)
	if isInBattle then
		imageTop:loadTexture(Path.getTextSignet(TOPIMAGERES[1]))
		imageTop:setVisible(true)
	else
		imageTop:setVisible(false)
	end
end


return HistoryHeroListCell