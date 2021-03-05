local SingleRaceRankNode = class("SingleRaceRankNode")
local SingleRaceRankCell = require("app.scene.view.singleRace.SingleRaceRankCell")
local TabScrollView = require("app.utils.TabScrollView")
local SingleRaceConst = require("app.const.SingleRaceConst")

function SingleRaceRankNode:ctor(target)
	self._target = target
	self._rankList = {}
	self._selectTabIndex = 1

	self._imageBg = ccui.Helper:seekNodeByName(self._target, "ImageBg")
	self._nodeTabRoot = ccui.Helper:seekNodeByName(self._target, "NodeTabRoot")
	cc.bind(self._nodeTabRoot, "CommonTabGroupHorizon3")
	self._listView = ccui.Helper:seekNodeByName(self._target, "ListView")
	cc.bind(self._listView, "ScrollView")

	local scrollViewParam = {
		template = SingleRaceRankCell,
		updateFunc = handler(self, self._onItemUpdate),
		selectFunc = handler(self, self._onItemSelected),
		touchFunc = handler(self, self._onItemTouch),
	}
	self._tabListView = TabScrollView.new(self._listView, scrollViewParam, self._selectTabIndex)

	local tabNameList = {}
	table.insert(tabNameList, Lang.get("single_race_rank_title1"))
	table.insert(tabNameList, Lang.get("single_race_rank_title2"))
	table.insert(tabNameList, Lang.get("single_race_rank_title3"))

	self._nodeTabRoot:setCustomColor({
		{cc.c3b(0xa9, 0x6a, 0x2a)},
		{cc.c3b(0xff, 0xb4, 0x6a)},
		{cc.c3b(0xa9, 0x6a, 0x2a)},
	})
	local param = {
		callback = handler(self, self._onTabSelect),
		isVertical = 2,
		textList = tabNameList,
	}
	self._nodeTabRoot:recreateTabs(param)

	self._nodeTabRoot:setTabIndex(self._selectTabIndex)
end

function SingleRaceRankNode:_onTabSelect(index, sender)
	if index == self._selectTabIndex then
		return
	end

	self._selectTabIndex = index
	self:updateUI()
end

function SingleRaceRankNode:updateUI()
	local status = G_UserData:getSingleRace():getStatus()
	if status == SingleRaceConst.RACE_STATE_NONE or status == SingleRaceConst.RACE_STATE_PRE then
		self._imageBg:setVisible(false)
		return
	end

	self._imageBg:setVisible(true)
	if self._selectTabIndex == 1 then
		self._rankList = G_UserData:getSingleRace():getServerRankList()
	elseif self._selectTabIndex == 2 then
		self._rankList = G_UserData:getSingleRace():getPlayerRankList()
	else
		self._rankList = G_UserData:getSingleRace():getSameServerRankList()
	end
	
    self._tabListView:updateListView(self._selectTabIndex, #self._rankList)
end

function SingleRaceRankNode:_onItemUpdate(item, index)
    local index = index + 1
    local data = self._rankList[index]
    if data then
    	item:update(index, data)
    end
end

function SingleRaceRankNode:_onItemSelected(item, index)
	
end

function SingleRaceRankNode:_onItemTouch(index, t)

end

return SingleRaceRankNode