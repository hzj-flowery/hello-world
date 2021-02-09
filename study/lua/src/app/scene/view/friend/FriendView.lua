
-- Author: nieming
-- Date:2017-12-25 17:34:00
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local FriendView = class("FriendView", ViewBase)
local FriendConst = require("app.const.FriendConst")
local TopBarStyleConst = require("app.const.TopBarStyleConst")
local EnemyHelper = require("app.scene.view.friend.EnemyHelper")
function FriendView:ctor(selectIndex, isPopEnemyLog)
	--csb bind var name
	self._fileNodeBg = nil  --CommonFullScreenListView
	self._fileNodeEmpty = nil  --CommonEmptyTipNode
	self._listView = nil  --ScrollView
	self._nodeTabRoot = nil  --CommonTabGroup
	self._topbarBase = nil  --CommonTopbarBase
	self._emptyNode = nil
	self._targetTabIndex = selectIndex
	self._isPopEnemyLog = isPopEnemyLog
	self._curSelectTabIndex = -1
	self._isFirstEnter = true
	local resource = {
		size = G_ResolutionManager:getDesignSize(),
		file = Path.getCSB("FriendView", "friend"),

	}
	FriendView.super.ctor(self, resource)
end

-- Describle：
function FriendView:onCreate()
	self._topbarBase:setImageTitle("txt_sys_com_haoyou")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_PVP)
	self._tabNames =  {Lang.get("lang_friend_tab1_name"), Lang.get("lang_friend_tab2_name"), Lang.get("lang_friend_tab3_name"),Lang.get("lang_friend_tab4_name")}
	local param = {
		callback = handler(self, self._onTabSelect),
		textList = self._tabNames,
	}
	self._commonFullScreen:setPrefixCountColor(Colors.DARK_BG_THREE)
	self._commonFullScreen:setCountColor(Colors.NUMBER_WHITE)
	self._commonFullScreen:setCountSize(18)
	local Parameter = require("app.config.parameter")
	self._maxFriendNum = tonumber(Parameter.get(127).content) or 0
	self._getEnergyNumParameter = tonumber(Parameter.get(129).content) or 0
	self._nodeTabRoot:recreateTabs(param)
	self._nodeTabRoot:setTabIndex(self._targetTabIndex or 1)
	self:_refreshRedPoint()


end
-- Describle：
function FriendView:onEnter()
	self._signalGetFriendList = G_SignalManager:add(SignalConst.EVENT_GET_FRIEND_LIST_SUCCESS, handler(self, self._onGetFriendList))
	self._signalApply = G_SignalManager:add(SignalConst.EVENT_CONFIRM_ADD_FRIEND_SUCCESS, handler(self, self._onApply))
	self._signalDelFriend = G_SignalManager:add(SignalConst.EVENT_DEL_FRIEND_SUCCESS, handler(self, self._onDelFriend))
	self._signalAddFriend = G_SignalManager:add(SignalConst.EVENT_ADD_FRIEND_SUCCESS, handler(self, self._onAddFriend))
	self._signalGivePresent = G_SignalManager:add(SignalConst.EVENT_FRIEND_PRESENT_SUCCESS, handler(self, self._onGivePresent))
	self._signalGetPresent = G_SignalManager:add(SignalConst.EVENT_GET_FRIEND_PRESENT_SUCCESS, handler(self, self._onGetPresent))
	self._signalRedPointUpdate = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self,self._onEventRedPointUpdate))

	self._signalEnemyList = G_SignalManager:add(SignalConst.EVENT_GET_ENEMY_LIST_SUCCESS, handler(self, self._onEventEnemyList))
	self._signalDeleteEnemy = G_SignalManager:add(SignalConst.EVENT_DEL_ENEMY_SUCCESS, handler(self, self._onEventDeleteEnemy))
	self._signalBattleEnemy = G_SignalManager:add(SignalConst.EVENT_ENEMY_BATTLE_SUCCESS, handler(self, self._onEventEnemyBattle))

	local runningScene = G_SceneManager:getRunningScene()
	runningScene:addGetUserBaseInfoEvent()
	self:_updateTabContent()
	if self._isPopEnemyLog then
		G_SceneManager:showDialog("app.scene.view.friend.PopupEnemyLog")
		self._isPopEnemyLog = nil
	end
end

function FriendView:_requestData()
	if self._curSelectTabIndex == FriendConst.ENEMY_LIST then
		G_UserData:getEnemy():requestEnemysData()
	else
		G_UserData:getFriend():requestFriendData()
	end
end

-- Describle：
function FriendView:onExit()
	self._signalGetFriendList:remove()
	self._signalGetFriendList = nil

	self._signalApply:remove()
	self._signalApply = nil

	self._signalDelFriend:remove()
	self._signalDelFriend = nil

	self._signalAddFriend:remove()
	self._signalAddFriend = nil

	self._signalGivePresent:remove()
	self._signalGivePresent = nil

	self._signalGetPresent:remove()
	self._signalGetPresent = nil

	self._signalRedPointUpdate:remove()
	self._signalRedPointUpdate = nil

	self._signalEnemyList:remove()
	self._signalEnemyList = nil

	self._signalDeleteEnemy:remove()
	self._signalDeleteEnemy = nil

	self._signalBattleEnemy:remove()
	self._signalBattleEnemy = nil
end

function FriendView:onCleanup()
	G_UserData:getFriend():cleanDatas()
	G_UserData:getEnemy():cleanDatas()
end

function FriendView:_onTabSelect(index, sender)
	if self._curSelectTabIndex == index then
		return
	end

	self._curSelectTabIndex = index
	self:_requestData()
	self._commonFullScreen:setTitle(self._tabNames[self._curSelectTabIndex])
	self:_updateTabContent()
end

function FriendView:_onGetFriendList(event)
	self:_updateTabContent()
end

function FriendView:_onDelFriend(event, message)
	self:_updateTabContent()
end

function FriendView:_onAddFriend(event, message)
	local friend_type = rawget(message, "friend_type")
	if friend_type then
		if friend_type == FriendConst.FRIEND_ADD_BLACK_TYPE then
			self:_updateTabContent()
		elseif friend_type == FriendConst.FRIEND_ADD_FRIEND_TYPE then
			G_Prompt:showTip(Lang.get("lang_friend_apply_success_tip"))
		end
	end
end

function FriendView:_onGivePresent(event)
	G_Prompt:showTip(Lang.get("lang_friend_give_energy_success"))
	self:_updateTabContent()
end

function FriendView:_onGetPresent(event, getNum)
	G_Prompt:showTip(Lang.get("lang_friend_get_energy_success", {num = getNum * self._getEnergyNumParameter}))
	self:_updateTabContent()
end

function FriendView:_onApply(event, message)
	local accept = rawget(message, "accept")
	if accept then
		G_Prompt:showTip(Lang.get("lang_friend_confirm_accept_success"))
	else
		G_Prompt:showTip(Lang.get("lang_friend_confirm_refuse_success"))
	end
end
--仇人
function FriendView:_onEventEnemyList()
	self:_updateTabContent()
end

function FriendView:_onEventDeleteEnemy()
	self:_updateTabContent()
end

function FriendView:_onEventEnemyBattle(event, message)
	if(message == nil)then return end

	local function enterFightView(message)
		local ReportParser = require("app.fight.report.ReportParser")
		local battleReport = G_UserData:getFightReport():getReport()
		local reportData = ReportParser.parse(battleReport)
		local battleData = require("app.utils.BattleDataHelper").parseEnemyRevenge(message)
		G_SceneManager:showScene("fight", reportData, battleData)
	end
	G_SceneManager:registerGetReport(message.report, function() enterFightView(message) end)
	
	--进入战斗后，返回，则重新拉去世界boss信息
	G_UserData:getEnemy():requestEnemysData()
end

function FriendView:_udpateFriendListView()
	if not self._friendListView  then
		local FriendList = require("app.scene.view.friend.FriendList")
		self._friendListView = FriendList:new()
		self._contentNode:addChild(self._friendListView)
	end
	local friendData = G_UserData:getFriend():getFriendsData()
	local friendNum = #friendData
	if friendNum == 0 then
		self._emptyNode:setVisible(true)
		self._emptyNode:setTipsString(Lang.get("lang_friend_empty_friend"))
	end
	self._commonFullScreen:showCount(true)
	self._commonFullScreen:setPrefixCountText(Lang.get("lang_friend_tab1_name")..":")
	self._commonFullScreen:setCount(friendNum.."/"..self._maxFriendNum)
	self._friendListView:updateView(friendData)
	self._commonHelp:setVisible(false)
end

function FriendView:_updateFriendBlackView()
	if not self._blackListView  then
		local FriendBlackList = require("app.scene.view.friend.FriendBlackList")
		self._blackListView = FriendBlackList:new()
		self._contentNode:addChild(self._blackListView)
	end
	local blackData = G_UserData:getFriend():getBlackData()
	if #blackData == 0 then
		self._emptyNode:setVisible(true)
		self._emptyNode:setTipsString(Lang.get("lang_friend_empty_black"))
	end
	self._commonFullScreen:showCount(false)
	self._blackListView:updateView(blackData)
	self._commonHelp:setVisible(false)
end

function FriendView:_updateFriendEnergyView()
	if not self._energyListView  then
		local FriendEnergyList = require("app.scene.view.friend.FriendEnergyList")
		self._energyListView = FriendEnergyList:new()
		self._contentNode:addChild(self._energyListView)
	end
	local friendData = G_UserData:getFriend():getEnergyData()
	local curGetnum = G_UserData:getFriend():getPresentNum()
	local friendNum = #friendData
	if #friendData == 0 then
		self._emptyNode:setVisible(true)
		self._emptyNode:setTipsString(Lang.get("lang_friend_empty_energy"))
	end
	self._commonFullScreen:showCount(false)
	self._energyListView:updateView(friendData, curGetnum)
	self._commonHelp:setVisible(false)
end

function FriendView:_updateEnemyListView()
	if not self._enemyListView  then
		local FriendEnemyList = require("app.scene.view.friend.FriendEnemyList")
		self._enemyListView = FriendEnemyList:new()
		self._contentNode:addChild(self._enemyListView)
	end
	local enemysData = G_UserData:getEnemy():getEnemysData()
	if #enemysData == 0 then
		self._emptyNode:setVisible(true)
		self._emptyNode:setTipsString(Lang.get("lang_friend_empty_enemy"))
	end
	self._commonFullScreen:showCount(true)
	self._commonFullScreen:setPrefixCountText(Lang.get("lang_friend_tab2_name")..":")
	self._commonFullScreen:setCount(#enemysData.."/"..EnemyHelper.getMaxEnemyNum())
	self._enemyListView:updateView()
	self._commonHelp:setVisible(true)
	self._commonHelp:updateLangName("ENEMY_REVENGE_HELP")
end


function FriendView:_updateTabContent()
	if self._friendListView then
		self._friendListView:setVisible(self._curSelectTabIndex == FriendConst.FRIEND_LIST)
	end
	if self._energyListView then
		self._energyListView:setVisible(self._curSelectTabIndex == FriendConst.FRIEND_ENERGY)
	end
	if self._blackListView then
		self._blackListView:setVisible(self._curSelectTabIndex == FriendConst.FRIEND_BLACK)
	end
	if self._enemyListView then
		self._enemyListView:setVisible(self._curSelectTabIndex == FriendConst.ENEMY_LIST)
	end

	self._emptyNode:setVisible(false)
	if self._curSelectTabIndex == FriendConst.FRIEND_LIST then
		self:_udpateFriendListView()
	elseif self._curSelectTabIndex == FriendConst.FRIEND_ENERGY then
		self:_updateFriendEnergyView()
	elseif self._curSelectTabIndex == FriendConst.FRIEND_BLACK then
		self:_updateFriendBlackView()
	elseif self._curSelectTabIndex == FriendConst.ENEMY_LIST then
		self:_updateEnemyListView()
	end
end

function FriendView:_refreshRedPoint()
	--好友申请红点
	self._nodeTabRoot:setRedPointByTabIndex(FriendConst.FRIEND_LIST, G_UserData:getFriend():hasApplyRedPoint())
	--精力领取红点
	self._nodeTabRoot:setRedPointByTabIndex(FriendConst.FRIEND_ENERGY, G_UserData:getFriend():hasGetEnergyRedPoint())

	if self._friendListView then
		self._friendListView:updateRedPoint()
	end

end

function FriendView:_onEventRedPointUpdate()
	self:_refreshRedPoint()
end




return FriendView
