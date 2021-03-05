-- @Author panhoa
-- @Date 6.24.2019
-- @Role 

local PopupBase = require("app.ui.PopupBase")
local PopupJoyAwards = class("PopupJoyAwards", PopupBase)
local JoyAwardsCell = import(".JoyAwardsCell")
local TabScrollView = require("app.utils.TabScrollView")
local GachaGoldenHeroHelper = import(".GachaGoldenHeroHelper")


function PopupJoyAwards:ctor()
    self._curTabIndex= 1
    self._scrollView = nil
    self._listView   = nil
    self._commonTab  = nil
    self._commonBack = nil
    self._awardsData = {}

    local resource = {
        file = Path.getCSB("PopupJoyAwards", "gachaGoldHero"),
        size = G_ResolutionManager:getDesignSize(),
    }
    PopupJoyAwards.super.ctor(self, resource)
end

function PopupJoyAwards:onCreate()
    self:_initCommonTab()
    self:_initCommonBack()
    self:_initScrollView()
end

function PopupJoyAwards:onEnter()
    self:_updateTab()
end

function PopupJoyAwards:onExit()
end

function PopupJoyAwards:_initCommonBack()
    self._commonBack:setTitle(Lang.get("gacha_goldenjoy_daily"))
    self._commonBack:addCloseEventListener(function()
        self:close()
    end)
end

function PopupJoyAwards:_initCommonTab()
    local tabNameList = {
		Lang.get("gacha_goldenjoy_firstday"),
		Lang.get("gacha_goldenjoy_secondtday"),
    }

    self._commonTab:setCustomColor({
        {Colors.GOLDENHERO_TAB_COLOR_NML, nil},
        {Colors.GOLDENHERO_TAB_COLOR_IMP, nil},
    })
    local param = {
        isVertical = 2,
        callback = handler(self, self._onTabSelect),
        textList = tabNameList
    }
    self._commonTab:recreateTabs(param)
end

function PopupJoyAwards:_onTabSelect(index)
    if self._curTabIndex == index then
        return
    end
    self._curTabIndex = index
    self:_updateScrollView()
end

function PopupJoyAwards:_initScrollView()
    local scrollViewParam = {
		template = JoyAwardsCell,
		updateFunc = handler(self, self._onCellUpdate),
		selectFunc = handler(self, self._onCellSelected),
		touchFunc = handler(self, self._onCellTouch),
	}
	self._listView = TabScrollView.new(self._scrollView, scrollViewParam)
end

function PopupJoyAwards:_updateTab()
    local awardData = G_UserData:getGachaGoldenHero():getGoldenJoyDraw()[1] or {}
    local dropId = table.nums(awardData) > 0 and awardData[#awardData].drop_id or 0
    if dropId > 0 and G_UserData:getGachaGoldenHero():getDrop_id() > dropId then
        self._commonTab:setTabIndex(2)
        self:_onTabSelect(2)
    else
        self:_updateScrollView()
    end
end

function PopupJoyAwards:_updateScrollView()
    self._awardsData = G_UserData:getGachaGoldenHero():getGoldenJoyDraw()[self._curTabIndex] or {}
	local awards = #self._awardsData
    local lineCount = math.ceil(awards / 7)
	self._listView:updateListView(self._scrollView, lineCount)
end

function PopupJoyAwards:_onCellUpdate(cell, cellIdx)
    if not self._awardsData then
        return
    end
    local cellData = {}
    local firstIdx = (cellIdx * 7 + 1)
    local lastIdx = (cellIdx * 7 + 7)
    local poolData = GachaGoldenHeroHelper.getGachaState()
    local dropId = G_UserData:getGachaGoldenHero():getDrop_id()
    for i=firstIdx, lastIdx do
        if self._awardsData[i] then
            table.insert(cellData, {index = i, cfg = self._awardsData[i], dropId = dropId})
        end
    end
    cell:updateUI(cellData)
end

function PopupJoyAwards:_onCellSelected(cell, cellIdx)
end

function PopupJoyAwards:_onCellTouch(cellIdx, callBackData)
end


return PopupJoyAwards