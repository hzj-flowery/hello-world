-- Author: chenzhongjie
-- Date:2019-8-22
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local PackageHistoryHeroWeaponCell = class("PackageHistoryHeroWeaponCell", ListViewCellBase)
local SilkbagDataHelper = require("app.utils.data.SilkbagDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UIHelper  = require("yoka.utils.UIHelper")

local TOPIMAGERES = {
	"img_iconsign_shangzhen", --上阵
}

function PackageHistoryHeroWeaponCell:ctor()
    local resource = {
        file = Path.getCSB("PackageHistoryHeroWeaponCell", "package"),
        binding = {
            _buttonGo1 = {
                events = {{event = "touch", method = "_onClickButton1"}}
            },
            _buttonGo2 = {
                events = {{event = "touch", method = "_onClickButton2"}}
            }
        }
    }
    PackageHistoryHeroWeaponCell.super.ctor(self, resource)
end

function PackageHistoryHeroWeaponCell:onCreate()
    local size = self._resourceNode:getContentSize()
    self:setContentSize(size.width, size.height)
    self._buttonGo1:setString(Lang.get("hero_awake_equip_btn"))
    self._buttonGo2:setString(Lang.get("hero_awake_equip_btn"))
end

function PackageHistoryHeroWeaponCell:updateUI(index, itemLine)
    for i = 1, 2 do
        local item = self["_item" .. i]
        item:setVisible(false)
    end
	local function updateCell(index, data)
		if data and next(data) ~= nil then
			if type(data) ~= "table" or data:getId() == 0 then
				self["_item"..index]:setVisible(false)
				return
			end

			local type = TypeConvertHelper.TYPE_HISTORY_HERO_WEAPON
            local baseId = data:getId()
            local size = data:getNum()
			self["_item"..index]:setVisible(true)
			self["_item"..index]:updateUI(type, baseId, size)
			self["_buttonGo"..index]:setVisible(true)
			
			-- Show Desc
			self["_desc"..index]:setString(data:getConfig().short_description)
			
			-- Listener
			self["_buttonGo"..index]:addClickEventListenerEx(function()
				self:dispatchCustomCallback(index)
			end)
		else
			self["_item"..index]:setVisible(false)
		end
	end

	for i, data in ipairs(itemLine) do
        updateCell(i, data)
    end
end

function PackageHistoryHeroWeaponCell:_onClickButton1()
    self:dispatchCustomCallback(1)
end

function PackageHistoryHeroWeaponCell:_onClickButton2()
    self:dispatchCustomCallback(2)
end

function PackageHistoryHeroWeaponCell:_updateDesc(breakthrougth)
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

return PackageHistoryHeroWeaponCell
