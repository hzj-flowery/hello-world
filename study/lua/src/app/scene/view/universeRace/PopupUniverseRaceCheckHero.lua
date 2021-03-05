
local PopupBase = require("app.ui.PopupBase")
local PopupUniverseRaceCheckHero = class("PopupUniverseRaceCheckHero", PopupBase)
local UniverseRaceCheckHeroCell = require("app.scene.view.universeRace.UniverseRaceCheckHeroCell")
local UniverseRaceDataHelper = require("app.utils.data.UniverseRaceDataHelper")
local PopupAlert = require("app.ui.PopupAlert")

function PopupUniverseRaceCheckHero:ctor(costCount, callback)
    self._costCount = costCount --需要消耗的武将数量
    self._callback = callback
	local resource = {
		file = Path.getCSB("PopupUniverseRaceCheckHero", "universeRace"),
		binding = {
			_buttonSupport = {
				events = {{event = "touch", method = "_onButtonSupport"}}
			},
		}
	}
	self:setName("PopupUniverseRaceCheckHero")
	PopupUniverseRaceCheckHero.super.ctor(self, resource)
end

function PopupUniverseRaceCheckHero:onCreate()
    self._listData = {}
    self._selectedList = {}
    self._curRound = G_UserData:getUniverseRace():getNow_round() --记录打开弹框时，要竞猜的轮次

	self._commonNodeBk:addCloseEventListener(handler(self, self._onButtonClose))
    self._commonNodeBk:setTitle(Lang.get("universe_race_select_hero_title"))
    
    self._listView:setTemplate(UniverseRaceCheckHeroCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
end

function PopupUniverseRaceCheckHero:onEnter()
    self:_updateList()
    self:_updateCount()
    self:_updateBtn()
end

function PopupUniverseRaceCheckHero:onExit()

end

function PopupUniverseRaceCheckHero:close()
    if self:_checkIsFull() == false then
        local popup = PopupAlert.new(nil, Lang.get("universe_race_guess_cost_not_enough_tip"), function()
            PopupUniverseRaceCheckHero.super.close(self)
        end)
        popup:openWithAction()
	end
end

function PopupUniverseRaceCheckHero:_updateList()
    self._listData = UniverseRaceDataHelper.getGuessCostHeroList()
    local count = math.ceil(#self._listData / 3)
	self._listView:clearAll()
    self._listView:resize(count)
end

function PopupUniverseRaceCheckHero:_updateCount()
    self._textCountMax:setString(self._costCount)
    local selectedCount = self:_getSelectedCount()
    self._textCount:setString(selectedCount)
    local color = selectedCount < self._costCount and Colors.BRIGHT_BG_ONE or Colors.BRIGHT_BG_GREEN
    self._textCount:setColor(color)
end

function PopupUniverseRaceCheckHero:_updateBtn()
    local isFull = self:_checkIsFull()
    self._buttonSupport:setEnabled(isFull)
end

function PopupUniverseRaceCheckHero:_onItemUpdate(item, index)
	local index = index * 3
    local data1 = self._listData[index + 1]
    local data2 = self._listData[index + 2]
    local data3 = self._listData[index + 3]
	item:update(data1, data2, data3)
end

function PopupUniverseRaceCheckHero:_onItemSelected(item, index)
	
end

function PopupUniverseRaceCheckHero:_onItemTouch(index, t, selected)
	local index = index * 3 + t
    local data = self._listData[index]
    local ret = false
    if selected then
        if self:_checkIsFull() then
            G_Prompt:showTip(Lang.get("universe_race_cost_hero_is_full"))
            ret = false
        else
            data.isSelected = true
            self._selectedList[data:getId()] = true
            ret = true
        end
    else
        data.isSelected = false
        self._selectedList[data:getId()] = nil
        ret = true
    end
    self:_updateBtn()
    return ret
end

function PopupUniverseRaceCheckHero:_onButtonSupport()
    if UniverseRaceDataHelper.checkCanGuess() == false then
		G_Prompt:showTip(Lang.get("universe_race_guess_can_not_tip"))
		return
    end
    local nowRound = G_UserData:getUniverseRace():getNow_round()
    if self._curRound ~= nowRound then --如果现在的轮次已经不是打开弹框时的轮次
        G_Prompt:showTip(Lang.get("universe_race_guess_round_is_wrong"))
        return
    end
    if self._callback then
        local heroIds = self:_getSelectedHeroIds()
        self._callback(heroIds)
    end
end

function PopupUniverseRaceCheckHero:_onButtonClose()
	self:close()
end

function PopupUniverseRaceCheckHero:_getSelectedCount()
    local selectedCount = 0
    for id, value in pairs(self._selectedList) do
        selectedCount = selectedCount + 1
    end
    return selectedCount
end

function PopupUniverseRaceCheckHero:_getSelectedHeroIds()
    local heroIds = {}
    for id, value in pairs(self._selectedList) do
        table.insert(heroIds, id)
    end
    return heroIds
end

function PopupUniverseRaceCheckHero:_checkIsFull()
    local selectedCount = self:_getSelectedCount()
    return selectedCount >= self._costCount
end

return PopupUniverseRaceCheckHero