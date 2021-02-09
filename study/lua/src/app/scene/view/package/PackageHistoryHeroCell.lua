-- Author: chenzhongjie
-- Date:2019-8-22
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local PackageHistoryHeroCell = class("PackageHistoryHeroCell", ListViewCellBase)
local SilkbagDataHelper = require("app.utils.data.SilkbagDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UIHelper  = require("yoka.utils.UIHelper")

local TOPIMAGERES = {
	"img_iconsign_shangzhen", --上阵
}

function PackageHistoryHeroCell:ctor()
    local resource = {
        file = Path.getCSB("PackageHistoryHeroCell", "package"),
        binding = {
            _buttonGo1 = {
                events = {{event = "touch", method = "_onClickButton1"}}
            },
            _buttonGo2 = {
                events = {{event = "touch", method = "_onClickButton2"}}
            }
        }
    }
    PackageHistoryHeroCell.super.ctor(self, resource)
end

function PackageHistoryHeroCell:onCreate()
    local size = self._resourceNode:getContentSize()
    self:setContentSize(size.width, size.height)
    self._buttonGo1:setString(Lang.get("common_btn_equip"))
    self._buttonGo2:setString(Lang.get("common_btn_equip"))
end

function PackageHistoryHeroCell:updateUI(index, itemLine)
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

			local type = TypeConvertHelper.TYPE_HISTORY_HERO
			local baseId = 0
            local size = nil
            
            self["_buttonGo"..index]:setVisible(true)
            baseId = data:getSystem_id()
            local param = TypeConvertHelper.convert(type,baseId,size)


			self["_item"..index]:setVisible(true)
			self["_item"..index]:updateUI(type, baseId, size, param)
            self["_historyIcon"..index]:updateUIWithUnitData(data, 1)
            self["_historyIcon"..index]:setRoundType(false)
            
            self:_showTopImage(index, data:getId())
			
			-- Listener
			self["_buttonGo"..index]:addClickEventListenerEx(function()
				self:dispatchCustomCallback(index)
			end)

			-- Show Desc
			self["_desc"..index]:setString(data:getConfig().short_description)

            local isOnFormation, pos = G_UserData:getHistoryHero():isStarEquiped(data:getId())
			local heroParam = self:_getEquipedHeroParam(pos)
			if heroParam then
				self["_equipedName"..index]:setString(heroParam.name)
				self["_equipedName"..index]:setColor(heroParam.icon_color)
				UIHelper.updateTextOutline(self["_equipedName"..index], heroParam)
			else
				self["_equipedName"..index]:setString("")
			end
		else
			self["_item"..index]:setVisible(false)
		end
	end

	for i, data in ipairs(itemLine) do
        updateCell(i, data)
    end
end

function PackageHistoryHeroCell:_onClickButton1()
    self:dispatchCustomCallback(1)
end

function PackageHistoryHeroCell:_onClickButton2()
    self:dispatchCustomCallback(2)
end

function PackageHistoryHeroCell:_showTopImage(index, id)
	local imageTop = self["_imageTop"..index]
	local isInBattle, _ = G_UserData:getHistoryHero():isStarEquiped(id)
	if isInBattle then
		imageTop:loadTexture(Path.getTextSignet(TOPIMAGERES[1]))
		imageTop:setVisible(true)
	else
		imageTop:setVisible(false)
	end
end

function PackageHistoryHeroCell:_updateDesc(breakthrougth)
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

--获取装备的武将名字
function PackageHistoryHeroCell:_getEquipedHeroParam(pos)
	if pos then
		local TypeConvertHelper = require("app.utils.TypeConvertHelper")
		local curHeroId = G_UserData:getTeam():getHeroIdWithPos(pos)
		local curHeroData = G_UserData:getHero():getUnitDataWithId(curHeroId)
		local baseId = curHeroData:getBase_id()
		local limitLevel = curHeroData:getLimit_level()
		local limitRedLevel = curHeroData:getLimit_rtg()
		local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId, nil, nil, limitLevel, limitRedLevel)
		return heroParam
	end
	return nil
end

return PackageHistoryHeroCell
