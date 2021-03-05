-- @Author panhoa
-- @Date 12.28.2018
-- @Role

local ListViewCellBase = require("app.ui.ListViewCellBase")
local HistoricalItemCell = class("HistoricalItemCell", ListViewCellBase)
local HistoryHeroConst = require("app.const.HistoryHeroConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UIHelper  = require("yoka.utils.UIHelper")

HistoricalItemCell.BTN_TYPE_ADD_FORMATION       = 1       --上阵
HistoricalItemCell.BTN_TYPE_REPLACE_FORMATION   = 2       --替换
HistoricalItemCell.BTN_TYPE_REBORN              = 3       --重生

function HistoricalItemCell:ctor()
    self._btnType = HistoricalItemCell.BTN_TYPE_ADD_FORMATION
    local resource = {
        file = Path.getCSB("HistoricalItemCell", "historyhero"),
    }

    HistoricalItemCell.super.ctor(self, resource)
end

function HistoricalItemCell:onCreate()
    self:_updateSize()
end

function HistoricalItemCell:_updateSize()
    local size = self._resourceNode:getContentSize()
    self:setContentSize(size.width, size.height)
    self["_buttonChoose1"]:switchToNormal()
    self["_buttonChoose2"]:switchToNormal()
    self["_buttonChoose1"]:setString(Lang.get("historyhero_awake_popstate1"))
    self["_buttonChoose2"]:setString(Lang.get("historyhero_awake_popstate1"))
end

function HistoricalItemCell:synchroType(type)
    self._type = type
end

-- btnType： 1 上阵，2 替换/下阵
function HistoricalItemCell:setBtnType(btnType)
    self._btnType = btnType
    if self._btnType == HistoricalItemCell.BTN_TYPE_REPLACE_FORMATION then
        self["_buttonChoose1"]:setString(Lang.get("historyhero_replace"))
        self["_buttonChoose2"]:setString(Lang.get("historyhero_replace"))
    elseif self._btnType == HistoricalItemCell.BTN_TYPE_REBORN then
        self["_buttonChoose1"]:setString(Lang.get("historyhero_btn_type_reborn"))
        self["_buttonChoose2"]:setString(Lang.get("historyhero_btn_type_reborn"))
    end
end

function HistoricalItemCell:updateUI(data)
    if data == nil or next(data) == nil then
        return
    end

    local function updateItem(index, itemData)
        -- body
        if type(itemData) ~= "table" or itemData.cfg == nil then
            self["_item"..index]:setVisible(false)
        else
            if self._type == nil then
                self["_item"..index]:setVisible(false)
                return
            end
            self["_item"..index]:setVisible(true)


            local type =  HistoryHeroConst.TAB_TYPE_BREAK
            local baseId = 0
            if self._type == HistoryHeroConst.TAB_TYPE_HERO then
                type = TypeConvertHelper.TYPE_HISTORY_HERO
                baseId = itemData.cfg:getSystem_id()
            elseif self._type == HistoryHeroConst.TAB_TYPE_BREAK  then 
				type = TypeConvertHelper.TYPE_HISTORY_HERO
                baseId = itemData.cfg:getSystem_id()
            elseif self._type == HistoryHeroConst.TAB_TYPE_AWAKE then
              	type = TypeConvertHelper.TYPE_HISTORY_HERO_WEAPON
                baseId = itemData.cfg:getId()
            elseif self._type == HistoryHeroConst.TAB_TYPE_REBORN then
                type = TypeConvertHelper.TYPE_HISTORY_HERO
                baseId = itemData.cfg:getSystem_id()
            end

            self:_updateDesc(index, itemData)
            local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HISTORY_HERO, baseId)
            self["_item"..index]:updateUI(type, baseId, 1, heroParam)
            self["_historyHeroIcon"..index]:updateUIWithUnitData(itemData.cfg, 1)
            self["_historyHeroIcon"..index]:setRoundType(false)
            
            local isOnFormation, pos = G_UserData:getHistoryHero():isStarEquiped(itemData.cfg:getId())
            if itemData.isDown then
                self["_buttonChoose"..index]:setString(Lang.get("historyhero_replace_down_formation"))
                self["_buttonChoose"..index]:switchToHightLight()
            else
                if isOnFormation then
                    self["_buttonChoose"..index]:setString(Lang.get("historyhero_replace_rob"))
                    self["_buttonChoose"..index]:switchToHightLight()
                else
                    self["_buttonChoose"..index]:switchToNormal()
                end
            end

            self["_buttonChoose"..index]:addClickEventListenerEx(function()
                self:dispatchCustomCallback(itemData)
            end)

            --装备的武将名
			local heroParam = self:_getEquipedHeroParam(pos)
			if heroParam then
				self["_equipedName"..index]:setString(heroParam.name)
                self["_equipedName"..index]:setColor(heroParam.icon_color)
				UIHelper.updateTextOutline(self["_equipedName"..index], heroParam)
			else
				self["_equipedName"..index]:setString("")
			end
        end
    end

    local idx = 0
    for key, value in pairs(data) do
        idx = (idx + 1)
        updateItem(idx, value)
    end
end

function HistoricalItemCell:_updateDesc(index, itemData)
    -- local color = itemData.cfg:getConfig().color
    -- self["_equipSlot" .. index]:loadTexture(Path.getHistoryHeroImg("img_historical_hero_equip_fram0" .. color))
    -- self["_equipIcon" .. index]:loadTexture(Path.getHistoryHeroImg("img_historical_hero_frame_equip_icon0" .. color))
    self["_desc" .. index]:setString(itemData.cfg:getConfig().short_description)

    -- if itemData.cfg:getBreak_through() == 1 then
    --     self["_equipIcon" .. index]:setVisible(false)
    --     self["_iconWaken" .. index]:setVisible(false)
    -- elseif itemData.cfg:getBreak_through() == 2 then
    --     self["_equipIcon" .. index]:setVisible(true)
    --     self["_iconWaken" .. index]:setVisible(false)
    -- elseif itemData.cfg:getBreak_through() == 3 then
    --     self["_equipIcon" .. index]:setVisible(true)
    --     self["_iconWaken" .. index]:setVisible(true)
    -- end
end

--获取装备的武将名字
function HistoricalItemCell:_getEquipedHeroParam(pos)
	if pos then
		local TypeConvertHelper = require("app.utils.TypeConvertHelper")
		local curHeroId = G_UserData:getTeam():getHeroIdWithPos(pos)
		local curHeroData = G_UserData:getHero():getUnitDataWithId(curHeroId)
		local baseId = curHeroData:getBase_id()
		local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO,
			baseId, nil, nil, curHeroData:getLimit_level(), curHeroData:getLimit_rtg())
		return heroParam
	end
	return nil
end



return HistoricalItemCell