--综合排行榜
local ViewBase = require("app.ui.ViewBase")
local ComplexRankView = class("ComplexRankView", ViewBase)

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local ComplexRankHelper = import(".ComplexRankHelper")
local ComplexRankItemCell = import(".ComplexRankItemCell")
local ComplexRankConst = require("app.const.ComplexRankConst")
local TextHelper = require("app.utils.TextHelper")
local TabScrollView = require("app.utils.TabScrollView")
--[[
	//综合排行榜
	ID_C2S_GetUserLevelRank = 30500;
	ID_S2C_GetUserLevelRank = 30501;
	ID_C2S_GetUserPowerRank = 30502;
	ID_S2C_GetUserPowerRank = 30503;
	ID_C2S_GetStageStarRank = 30504;
	ID_S2C_GetStageStarRank = 30505;
	ID_C2S_GetTowerStarRank	= 30506;
	ID_S2C_GetTowerStarRank	= 30507;
	ID_C2S_GetRebelArmyHurtRank= 30508;
	ID_S2C_GetRebelArmyHurtRank= 30509;
	ID_C2S_GetRebelArmyGuildHurtRank= 30510;
	ID_S2C_GetRebelArmyGuildHurtRank= 30511;
]]
function ComplexRankView:ctor(rankType)
	--
	--左边控件
	self._panelRight = nil --右边面板
	self._listViewPanel = nil
	self._listViewTab1 = nil
	self._nodeTabRoot = nil
	self._commonFullScreen = nil
	self._topbarBase = nil
	self._panelbk = nil
	self._myData = {}
	self._tabIndex = 0
	self._dataList = {}
	self._complexRankView = {}
	self._selectTabIndex = 1
	if rankType then
		self._selectTabIndex = ComplexRankHelper.getTabIndexByRankType(rankType)
	end

	local resource = {
		file = Path.getCSB("ComplexRankView", "complexrank"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {}
	}
	ComplexRankView.super.ctor(self, resource)
end

function ComplexRankView:onCreate()
	local scrollViewParam = {
		template = ComplexRankItemCell,
		updateFunc = handler(self, self._onItemUpdate),
		selectFunc = handler(self, self._onItemSelected),
		touchFunc = handler(self, self._onItemTouch)
	}
	self._tabListView = TabScrollView.new(self._listViewTab1, scrollViewParam)

	self._topbarBase:setImageTitle("txt_sys_com_paihangbang")
	self._commonFullScreen:setTitle(Lang.get("complex_rank_title"))

	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)

	local tabNameList = ComplexRankHelper.getComplexTab()

	local param = {
		callback = handler(self, self._onTabSelect1),
		containerStyle = 2,
		textList = tabNameList
	}

	self._nodeTabRoot:recreateTabs(param)
end

function ComplexRankView:onEnter()
	local runningScene = G_SceneManager:getRunningScene()
	runningScene:addGetUserBaseInfoEvent()

	self._signalGetUserLevelRank =
		G_SignalManager:add(SignalConst.EVENT_COMPLEX_LEVEL_RANK, handler(self, self._onEventGetUserLevelRank))
	self._signalGetUserPowerRank =
		G_SignalManager:add(SignalConst.EVENT_COMPLEX_POWER_RANK, handler(self, self._onEventGetUserPowerRank))
	self._signalGetArenaTopInfo =
		G_SignalManager:add(SignalConst.EVENT_COMPLEX_ARENA_RANK, handler(self, self._onEventGetArenaTopInfo))

	self._signalGetStageStarRank =
		G_SignalManager:add(SignalConst.EVENT_COMPLEX_STAGE_STAR_RANK, handler(self, self._onEventGetStageStarRank))
	self._signalGetEliteStarRank =
		G_SignalManager:add(SignalConst.EVENT_COMPLEX_ELITE_STAR_RANK, handler(self, self._onEventGetEliteStarRank))

	self._signalGetTowerStarRank =
		G_SignalManager:add(SignalConst.EVENT_COMPLEX_TOWER_STAR_RANK, handler(self, self._onEventGetTowerStarRank))

	self._signalGetGuildRank =
		G_SignalManager:add(SignalConst.EVENT_COMPLEX_GUILD_RANK, handler(self, self._onEventGetGuildRank))

	self._signalGetActivePhotoRank =
		G_SignalManager:add(SignalConst.EVENT_COMPLEX_ACTIVE_PHOTO_RANK, handler(self, self._onEventGetActivePhotoRank))

	self._signalGetUserAvaterPhotoRank =
		G_SignalManager:add(SignalConst.EVENT_COMPLEX_USER_AVATAR_PHOTO_RANK, handler(self, self._onEventGetUserAvaterPhotoRank))

	self._nodeTabRoot:setTabIndex(self._selectTabIndex)
end

function ComplexRankView:onExit()
	--self._signalBuyShopGoods:remove()
	--self._signalBuyShopGoods = nil
	self._signalGetUserLevelRank:remove()
	self._signalGetUserLevelRank = nil
	self._signalGetUserPowerRank:remove()
	self._signalGetUserPowerRank = nil

	self._signalGetArenaTopInfo:remove()
	self._signalGetArenaTopInfo = nil

	self._signalGetStageStarRank:remove()
	self._signalGetStageStarRank = nil

	self._signalGetEliteStarRank:remove()
	self._signalGetEliteStarRank = nil

	self._signalGetTowerStarRank:remove()
	self._signalGetTowerStarRank = nil

	self._signalGetGuildRank:remove()
	self._signalGetGuildRank = nil

	self._signalGetActivePhotoRank:remove()
	self._signalGetActivePhotoRank = nil

	self._signalGetUserAvaterPhotoRank:remove()
	self._signalGetUserAvaterPhotoRank = nil
end

function ComplexRankView:_updateListView(index)
	local rankType = ComplexRankHelper.getRankTypeByTabIndex(index)
	local dataList = self._dataList[rankType] or {}

	dump(index)
	self._tabListView:hideAllView()
	self._tabListView:updateListView(index, #dataList)

	self:_updateMyData(self._tabIndex)

	self._nodeEmpty:setVisible(#dataList <= 0)
end

function ComplexRankView:_onTabSelect1(index, sender)
	if self._tabIndex == index then
		return
	end

	self._selectTabIndex = index

	self._tabIndex = index

	local rankType = ComplexRankHelper.getRankTypeByTabIndex(self._tabIndex)
	if self._dataList[rankType] == nil then
		--self:_updateListView(self._tabIndex)
		G_UserData:getComplexRank():c2sGetUserRankByType(rankType)
	else
		self:_updateListView(self._tabIndex)
	end
end

function ComplexRankView:_getSelectItemList()
	local rankType = ComplexRankHelper.getRankTypeByTabIndex(self._tabIndex)
	return self._dataList[rankType]
end
function ComplexRankView:_onItemUpdate(item, index)
	local itemList = self:_getSelectItemList()
	if itemList and #itemList > 0 then
		local data = itemList[index + 1]
		local rankType = ComplexRankHelper.getRankTypeByTabIndex(self._tabIndex)
		item:updateUI(index, data, rankType)
	end
end

function ComplexRankView:refreshView()
	--local chooseView = self:getComplexRankView(self._tabIndex)
	--chooseView:refreshView()
end

function ComplexRankView:_onItemSelected(item, index)
end

function ComplexRankView:_onItemTouch(index, touchTag)
	local itemList = self:_getSelectItemList()
	local itemData = itemList[touchTag + 1]

	local rankType = ComplexRankHelper.getRankTypeByTabIndex(self._tabIndex)

	if itemData and rankType ~= ComplexRankConst.USER_GUILD_RANK then
		G_UserData:getBase():c2sGetUserBaseInfo(itemData.userId)
	end
end

function ComplexRankView:_onEventGetUserLevelRank(id, message)
	local rankList, myData = ComplexRankHelper.covertServerData(id, message)

	self._dataList[ComplexRankConst.USER_LEVEL_RANK] = rankList

	self:_updateMyRankData(myData)
end

function ComplexRankView:_onEventGetUserPowerRank(id, message)
	local rankList, myData = ComplexRankHelper.covertServerData(id, message)

	self._dataList[ComplexRankConst.USER_POEWR_RANK] = rankList

	self:_updateMyRankData(myData)
end

function ComplexRankView:_onEventGetArenaTopInfo(id, message)
	local rankList, myData = ComplexRankHelper.covertServerData(id, message)

	self._dataList[ComplexRankConst.USER_ARENA_RANK] = rankList

	self:_updateMyRankData(myData)
end

function ComplexRankView:_onEventGetStageStarRank(id, message)
	local rankList, myData = ComplexRankHelper.covertServerData(id, message)

	self._dataList[ComplexRankConst.STAGE_STAR_RANK] = rankList

	self:_updateMyRankData(myData)
end

function ComplexRankView:_onEventGetEliteStarRank(id, message)
	local rankList, myData = ComplexRankHelper.covertServerData(id, message)
	self._dataList[ComplexRankConst.ELITE_STAR_RANK] = rankList
	self:_updateMyRankData(myData)
end

function ComplexRankView:_onEventGetTowerStarRank(id, message)
	local rankList, myData = ComplexRankHelper.covertServerData(id, message)

	self._dataList[ComplexRankConst.TOWER_STAR_RANK] = rankList

	self:_updateMyRankData(myData)
end

function ComplexRankView:_onEventGetGuildRank(id, message)
	local rankList, myData = ComplexRankHelper.covertServerData(id, message)

	self._dataList[ComplexRankConst.USER_GUILD_RANK] = rankList
	self:_updateMyRankData(myData)
end

function ComplexRankView:_onEventGetActivePhotoRank(id, message)
	local rankList, myData = ComplexRankHelper.covertServerData(id, message)

	self._dataList[ComplexRankConst.ACTIVE_PHOTO_RANK] = rankList
	self:_updateMyRankData(myData)
end

function ComplexRankView:_onEventGetUserAvaterPhotoRank(id, message)
	local rankList, myData = ComplexRankHelper.covertServerData(id, message)

	self._dataList[ComplexRankConst.AVATAR_PHOTO_RANK] = rankList
	self:_updateMyRankData(myData)
end

function ComplexRankView:_updateMyData(tabIndex)
	local rankType = ComplexRankHelper.getRankTypeByTabIndex(tabIndex)
	local myData = self._myData[rankType]
	if myData == nil then
		return
	end
	if rankType == ComplexRankConst.USER_LEVEL_RANK then
		self:_updateMyRank(Lang.get("complex_rank_des1"), myData.myRank, Lang.get("complex_rank_arrage_des2"), myData.myLevel)
	end

	if rankType == ComplexRankConst.USER_POEWR_RANK or rankType == ComplexRankConst.USER_ARENA_RANK then
		self:_updateMyRank(
			Lang.get("complex_rank_des1"),
			myData.myRank,
			Lang.get("complex_rank_arrage_des1"),
			TextHelper.getAmountText(myData.myPower)
		)
	end

	if rankType == ComplexRankConst.USER_GUILD_RANK then
		self:_updateMyRank(
			Lang.get("complex_rank_des2"),
			myData.myRank,
			Lang.get("complex_rank_arrage_des4"),
			myData.myGuildLevel
		)
	end

	if
		rankType == ComplexRankConst.STAGE_STAR_RANK or rankType == ComplexRankConst.ELITE_STAR_RANK or
			rankType == ComplexRankConst.TOWER_STAR_RANK
	 then
		self:_updateMyRank(Lang.get("complex_rank_des1"), myData.myRank, Lang.get("complex_rank_arrage_des3"), myData.myStar)
	end

	if rankType == ComplexRankConst.ACTIVE_PHOTO_RANK then
		self:_updateMyRank(
			Lang.get("complex_rank_des1"),
			myData.myRank,
			Lang.get("complex_rank_arrage_des5"),
			myData.user_photocount
		)
	end

	if rankType == ComplexRankConst.AVATAR_PHOTO_RANK then
		self:_updateMyRank(
			Lang.get("complex_rank_des1"),
			myData.myRank,
			Lang.get("complex_rank_arrage_des5"),
			myData.avaterNum
		)
	end
end
function ComplexRankView:_updateMyRank(rankDes, rank, valuedes, value)
	self:updateLabel("Text_my_rank", rankDes)
	self:updateLabel("Text_my_rank_num", rank)
	local label1 = self:updateLabel("Text_my_des", valuedes)
	local label2 = self:updateLabel("Text_my_des_num", value)
	label2:setPositionX(label1:getPositionX() + label1:getContentSize().width + 3)
end

function ComplexRankView:_updateMyRankData(myData)
	-- body
	local rankType = ComplexRankHelper.getRankTypeByTabIndex(self._tabIndex)
	self._myData[rankType] = myData
	self:_updateListView(self._tabIndex)
end

return ComplexRankView
