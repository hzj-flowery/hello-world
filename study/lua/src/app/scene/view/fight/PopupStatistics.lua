local PopupBase = require("app.ui.PopupBase")
local PopupStatistics = class("PopupStatistics", PopupBase)
local PopupStatisticsCell = require("app.scene.view.fight.PopupStatisticsCell")
local PopupStatisticsCellPet = require("app.scene.view.fight.PopupStatisticsCellPet")


function PopupStatistics:ctor(statisticsData)

    self._statisticsData = statisticsData       --统计数据
    self._panelBase = nil           --底板
    self._tabPage = nil             --切页
    self._listView = nil            --统计list
    self._selectTabIndex = nil      --选择的切页
    self._cells = {}
    self._petCells = {}

	local resource = {
		file = Path.getCSB("PopupStatistics", "fight"),
		binding = {
		}
	}
	PopupStatistics.super.ctor(self, resource)
end

function PopupStatistics:onCreate()
    self._panelBase:addCloseEventListener(handler(self, self._onCloseClick))
    self._panelBase:setTitle(Lang.get("fight_statistics_title"))
    self:_initTab()
end

function PopupStatistics:onEnter()
    local list1 = self._statisticsData:getDataListByCamp(1)
    local list2 = self._statisticsData:getDataListByCamp(2)
    local maxDamage1 = self._statisticsData:getMaxDamage(1)
    local maxDamage2 = self._statisticsData:getMaxDamage(2)
    for i = 1, 6 do
        local cell = PopupStatisticsCell.new(list1[i], list2[i], maxDamage1, maxDamage2)
        self._listView:pushBackCustomItem(cell)
        table.insert(self._cells, cell)
    end
end

function PopupStatistics:_initTab()
	local param = {
		callback = handler(self, self._onTabSelect),
		isVertical = 2,
		offset = 3,
		textList = {Lang.get("fight_statistics_damage"), Lang.get("fight_statistics_features"), Lang.get("fight_statistics_pet")}
	}
	self._tabPage:recreateTabs(param)
end

function PopupStatistics:_onCloseClick()
    self:closeWithAction()
end

function PopupStatistics:_onTabSelect(index)
    if self._selectTabIndex == index then
		return
	end
    self._selectTabIndex = index
    local isPetPage = false
	if index == 1 then			--伤害统计
        for i, v in pairs(self._cells) do
            v:refreshData(PopupStatisticsCell.TYPE_DAMAGE)
        end
	elseif index == 2 then		--特性统计
        for i, v in pairs(self._cells) do
            v:refreshData(PopupStatisticsCell.TYPE_FEATURE)
        end
    elseif index == 3 then 
      self:_createPetList()
      isPetPage = true
    end
    self._listView:setVisible(not isPetPage)
    self._listViewPet:setVisible(isPetPage)

end

function PopupStatistics:_createPetList()
    if #self._petCells ~= 0 then        --宠物已经由数据了，只要显示就可以了
        return 
    end 

    local list1 = self._statisticsData:getPetDataListByCamp(1)
    local list2 = self._statisticsData:getPetDataListByCamp(2)

    local listCount = #list1 > #list2 and #list1 or #list2
    for i = 1, listCount do 
        local cell = PopupStatisticsCellPet.new(list1[i], list2[i])
        self._listViewPet:pushBackCustomItem(cell)
        table.insert(self._petCells, cell)        
    end
end


return PopupStatistics