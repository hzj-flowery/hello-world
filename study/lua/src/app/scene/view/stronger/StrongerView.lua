
-- Author: hedili
-- Date:2018-01-09 16:11:00
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local StrongerView = class("StrongerView", ViewBase)
local StrongerItemCell = import(".StrongerItemCell")
local TabScrollView = require("app.utils.TabScrollView")
local StrongerHelper = import(".StrongerHelper")



function StrongerView:ctor(selectTab)
	self._selectTabIndex = 0
	self._initTabIndex = selectTab or 1
	--csb bind var name
	self._commonAvatar = nil  --
	self._commonFullScreen = nil  --CommonFullScreen
	self._commonPower = nil  --CommonHeroPower
	self._listViewTab1 = nil  --ScrollView
	self._nodeTabRoot = nil  --CommonTabGroup
	self._topbarBase = nil  --CommonTopbarBase
	self._commonTalk = nil

	local resource = {
		file = Path.getCSB("StrongerView", "stronger"),
 		size =  G_ResolutionManager:getDesignSize(),
	}
	StrongerView.super.ctor(self, resource)
end

-- Describle：
function StrongerView:onCreate()
	local scrollViewParam = {
		template = StrongerItemCell,
		updateFunc = handler(self, self._onItemUpdate),
		selectFunc = handler(self, self._onItemSelected),
		touchFunc = handler(self, self._onItemTouch),
	}
	self._tabListView = TabScrollView.new(self._listViewTab1,scrollViewParam)

	self._fullScreenTitles = {
	  Lang.get("lang_stronger_tab1"),
	  Lang.get("lang_stronger_tab2"),
	}

	local param = {
		containerStyle = 1,
		callback = handler(self, self._onTabSelect),
		textList = self._fullScreenTitles
	}
	self._topbarBase:setImageTitle("txt_sys_com_bianqiang")
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)

	self._nodeTabRoot:recreateTabs(param)
end

function StrongerView:_onTabSelect(index, sender)
	if self._selectTabIndex == index then
		return
	end

	self._commonFullScreen:setTitle(self._fullScreenTitles[index])
	self._selectTabIndex = index
	self:_updateListView(self._selectTabIndex)
end


function StrongerView:_updateListView(tabIndex)
	tabIndex = tabIndex or 1

	self._commonPower:updateUI( G_UserData:getBase():getPower() )

	if tabIndex == 1 then
		self._dataList = StrongerHelper.getRecommendUpgradeList()
	else
		self._dataList = StrongerHelper.getFuncLevelList()
	end

	self._tabListView:updateListView(tabIndex,#self._dataList)
end

-- Describle：
function StrongerView:onEnter()

	if self._selectTabIndex > 0 then
		self._nodeTabRoot:setTabIndex(self._selectTabIndex)
		self:_updateListView(self._selectTabIndex)
	else
		self._nodeTabRoot:setTabIndex(self._initTabIndex)
	end


	self._nodeAvatar:removeAllChildren()
	local avatarNode = require("app.scene.view.worldBoss.WorldBossAvatar").new()
	-- local PopupHonorTitleHelper = require("app.scene.view.playerDetail.PopupHonorTitleHelper")
	-- local titleItem=PopupHonorTitleHelper.getEquipedTitle()
	local avatarData = {
		titleId = 0,
		baseId = G_UserData:getBase():getPlayerBaseId(),
		name = G_UserData:getBase():getName(),
		officialLevel = G_UserData:getBase():getOfficer_level(),
		userId = G_UserData:getBase():getId(),
		playerInfo  = G_UserData:getBase():getPlayerShowInfo()
	}
	avatarNode:setName("avatar")
	avatarNode:updatePlayerInfo(avatarData)
	avatarNode:setScale(1.2)
	self._nodeAvatar:addChild(avatarNode)
	local talkList = StrongerHelper.getBubbleList()
	self._commonTalk:showLoopBubbleList(talkList)
	self._commonTalk:setMaxWidth(224)
	
end

-- Describle：
function StrongerView:onExit()

end

-- Describle：
function StrongerView:_onItemUpdate(item, index)

	local data = self._dataList[index+1]
	if data then
		item:updateUI(index, data, self._selectTabIndex)
	end
end

-- Describle：
function StrongerView:_onItemSelected(item, index)

end

-- Describle：
function StrongerView:_onItemTouch(index, params)

end


return StrongerView