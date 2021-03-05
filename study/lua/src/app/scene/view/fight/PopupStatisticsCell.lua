local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupStatisticsCell = class("PopupStatisticsCell", ListViewCellBase)

local TypeConvertHelper = require("app.utils.TypeConvertHelper")

PopupStatisticsCell.TYPE_DAMAGE = 1     --伤害
PopupStatisticsCell.TYPE_FEATURE = 2    --特性

function PopupStatisticsCell:ctor(data1, data2, maxDamage1, maxDamage2)
    self._data1 = data1
    self._data2 = data2
    self._maxDamage1 = maxDamage1
    self._maxDamage2 = maxDamage2

    self._panelBase = nil       --底板
    self._panel1 = nil          --左面板
    self._panel2 = nil          --右面板

	local resource = {
		file = Path.getCSB("PopupStatisticsCell", "fight"),
		binding = {
		}
	}
	PopupStatisticsCell.super.ctor(self, resource)    
end

function PopupStatisticsCell:onCreate()
    local size = self._panelBase:getContentSize()
    self:setContentSize(size)

    if not self._data1 then
        self._panel1:setVisible(false)
    else
        self:_initHeroData(1)
    end

    if not self._data2 then
        self._panel2:setVisible(false)
    else
        self:_initHeroData(2)
    end

    self:refreshData(PopupStatisticsCell.TYPE_DAMAGE)
end

function PopupStatisticsCell:_initHeroData(index)
    local panel = self["_panel"..index]
    local data = self["_data"..index]
    local icon = self["_icon"..index]

    local heroConfig = data:getConfigData()
    local name = panel:getSubNodeByName("name")
    name:setString(data:getName())
    local officerLevel = data:getOfficerLevel()
    if data:isPlayer() then
        name:setColor(Colors.getOfficialColor(officerLevel))
        require("yoka.utils.UIHelper").updateTextOfficialOutline(name, officerLevel)
    else
        name:setColor(Colors.getColor(data:getColor()))
    end

    local qualityColor = data:getConfigData().color
    if qualityColor == 7 or data:getColor()==7 then    -- 金色物品加描边
		name:enableOutline(Colors.getColorOutline(7), 2)
	end

    icon:initUI(TypeConvertHelper.TYPE_HERO, heroConfig.id)
    local heroIcon = icon:getIconTemplate()
    heroIcon:updateUI(heroConfig.id, 1, data:getLimit(), data:getLimitRed())

    if data:isAlive() then
        local alive = panel:getSubNodeByName("alive")
        alive:setVisible(true)
    else
        local die = panel:getSubNodeByName("die")
        die:setVisible(true)
    end

end

function PopupStatisticsCell:refreshData(type)
    if type == PopupStatisticsCell.TYPE_DAMAGE then
        self:_refreshDamage()
    elseif type == PopupStatisticsCell.TYPE_FEATURE then
        self:_refreshFeature()
    end
end

function PopupStatisticsCell:_refreshDamage()
    for i = 1, 2 do
        local data = self["_data"..i]
        if data then
            local panel = self["_panel"..i]
            local barBG = panel:getSubNodeByName("ImageBarBG")
            barBG:setVisible(true)

            local panelFeature = panel:getSubNodeByName("PanelFeature")
            panelFeature:setVisible(false)

            local damage = data:getStatisticsDamage()
            local text = barBG:getSubNodeByName("textDamage")
            text:setString(damage)
            text:setVisible(true)

            local bar = barBG:getSubNodeByName("bar")
            local camp = math.floor(data:getStageId()/100)
            local maxDamage = self["_maxDamage"..camp]
            
            local percent = damage/maxDamage * 100
            bar:setPercent(percent)

        end
    end
end

function PopupStatisticsCell:_refreshFeature()
    for i = 1, 2 do
        local data = self["_data"..i]
        if data then
            local panel = self["_panel"..i]
            local barBG = panel:getSubNodeByName("ImageBarBG")
            barBG:setVisible(false)

            local panelFeature = panel:getSubNodeByName("PanelFeature")
            panelFeature:setVisible(true)

            local statistics = data:getStatistics()
            table.sort(statistics, function(a, b) return a:getType() < b:getType() end)
            for i = 1, 3 do
                local basePanel = panelFeature:getSubNodeByName("FeatureBG"..i)
                if statistics[i] then
                    self:_createSingleFeatuer(basePanel, statistics[i])
                end
            end
        end
    end
end

function PopupStatisticsCell:_createSingleFeatuer(panel, data)
    panel:setVisible(true)
    local description = data:getDescription()
    local strArry = string.split(description, "|")
    panel:getSubNodeByName("TextFeature"):setString(strArry[1])
    panel:getSubNodeByName("TextCount"):setString(strArry[2])
    panel:getSubNodeByName("TextNum"):setString(data:getCount())
end

return PopupStatisticsCell