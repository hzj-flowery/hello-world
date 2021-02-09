
-- Author: nieming
-- Date:2017-12-28 15:17:53
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local TeamSuggestView = class("TeamSuggestView", ViewBase)
local TopBarStyleConst = require("app.const.TopBarStyleConst")

TeamSuggestView.CountryImage = {
	[1] = "img_com_camp04",
	[2] = "img_com_camp01",
	[3] = "img_com_camp03",
	[4] = "img_com_camp02",
}

function TeamSuggestView:ctor()
	--csb bind var name
	self._country = nil  --ImageView
	self._fileNodeBg = nil  --CommonFullScreen
	self._heroProperty = nil  --CommonHeroProperty
	self._leftBtn = nil  --Button
	self._nodeTabRoot = nil  --CommonTabGroup
	self._pageView = nil  --PageView
	self._rightBtn = nil  --Button
	self._title = nil  --Text
	self._title2 = nil
	self._topbarBase = nil  --CommonTopbarBase

	local resource = {
		size = G_ResolutionManager:getDesignSize(),
		file = Path.getCSB("TeamSuggestView", "teamSuggest"),
		binding = {
			_leftBtn = {
				events = {{event = "touch", method = "_onLeftBtn"}}
			},
			_rightBtn = {
				events = {{event = "touch", method = "_onRightBtn"}}
			},
		},
	}
	TeamSuggestView.super.ctor(self, resource)
end

-- Describle：
function TeamSuggestView:onCreate()
	self:_initData()
	self._topbarBase:setImageTitle("txt_sys_com_zhengrongtuijian")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)
	self._tabNames =  {Lang.get("lang_team_suggest_tab1_name"), Lang.get("lang_team_suggest_tab2_name"),
		Lang.get("lang_team_suggest_tab3_name"), Lang.get("lang_team_suggest_tab4_name")}

	self._curSelectTabIndex = 1
	self._fileNodeBg:setTitle(self._tabNames[self._curSelectTabIndex])

	self._pageView:setSwallowTouches(false)
	self._pageView:setScrollDuration(0.3)
	local param = {
		callback = handler(self, self._onTabSelect),
		textList =self._tabNames
	}
	self._nodeTabRoot:recreateTabs(param)
	self:_updateTabContent()

end

-- Describle：
function TeamSuggestView:onEnter()

end

-- Describle：
function TeamSuggestView:onExit()

end
-- Describle：
function TeamSuggestView:_onLeftBtn()
	-- body
	if self._curPageIndex > 1 then
		--pageindex 0开始 所以 要多减一个1
		self._commonPageViewIndicator:setPageViewIndex(self._curPageIndex - 2)
	end
end
-- Describle：
function TeamSuggestView:_onRightBtn()
	-- body
	if self._curPageIndex < #self._curTabData then
		--pageindex 0开始 所以 要多减一个1
		self._commonPageViewIndicator:setPageViewIndex(self._curPageIndex)
	end
end

function TeamSuggestView:_initData()
	local TeamRecommend = require("app.config.team_recommend")
	local indexs = TeamRecommend.index()
	local datas = {}
	for _, v in pairs(indexs) do
		local config = TeamRecommend.indexOf(v)
		if not datas[config.country] then
			datas[config.country] = {}
		end
		table.insert(datas[config.country], config)
	end
	self._allDatas = datas
end

function TeamSuggestView:_onTabSelect(index, sender)
	if self._curSelectTabIndex == index then
		return
	end
	self._curSelectTabIndex = index
	self._fileNodeBg:setTitle(self._tabNames[self._curSelectTabIndex])
	self:_updateTabContent()
end

function TeamSuggestView:_onPageViewEvent(sender,event)
	if event == ccui.PageViewEventType.turning then
		self._curPageIndex = self._pageView:getCurrentPageIndex() + 1
		self._curData = self._curTabData[self._curPageIndex]
		self:_updatePanelInfo()
	end
end

function TeamSuggestView:_updatePanelInfo()
	if not self._curData then
		return
	end
	self._title:setString(self._curData.name)
	self._title2:setString(self._curData.name)

	if self._curPageIndex == 1 then
		self._leftBtn:setVisible(false)
	else
		self._leftBtn:setVisible(true)
	end

	if self._curPageIndex == #self._curTabData then
		self._rightBtn:setVisible(false)
	else
		self._rightBtn:setVisible(true)
	end

	local TeamSuggestContentCell = require("app.scene.view.teamSuggest.TeamSuggestContentCell")

	self._listView:removeAllItems()
	for i = 1, 3 do
		print("======================222===")
		if self._curData["title"..i] and  self._curData["title"..i] ~= "" then
			local cell = TeamSuggestContentCell.new()
			cell:updateUI(self._curData["title"..i], self._curData["description"..i])
			self._listView:pushBackCustomItem(cell)
		end
	end
end

function TeamSuggestView:_updateTabContent()
	self._curTabData = self._allDatas[self._curSelectTabIndex] or {}
	self._curPageIndex = 1
	self._curData = self._curTabData[self._curPageIndex]
	self._pageView:removeAllPages()
	local TeamSuggestPageViewItem = require("app.scene.view.teamSuggest.TeamSuggestPageViewItem")
	for k, v in ipairs(self._curTabData) do
		local page = TeamSuggestPageViewItem.new()
		page:updateUI(v)
		self._pageView:addPage(page)
	end
	self._country:loadTexture(Path.getTextSignet(TeamSuggestView.CountryImage[self._curData.country]))
	self._commonPageViewIndicator:refreshPageData(self._pageView, #self._curTabData, 0, 20 , handler(self,self._onPageViewEvent))
	self:_updatePanelInfo()
end

return TeamSuggestView
