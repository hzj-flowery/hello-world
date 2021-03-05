local ViewBase = require("app.ui.ViewBase")
local SiegeView = class("SeigeView", ViewBase)

local RebelBase = require("app.config.rebel_base")
local SiegeNode = require("app.scene.view.siege.SiegeNode")

local SiegeHelper = require("app.scene.view.siege.SiegeHelper")

SiegeView.PAGE_NUM = 3	--每一页有3个对手

SiegeView.REWARD_TYPE_GUILD = 1		--军团奖励
SiegeView.REWARD_TYPE_PERSON = 2	--玩家奖励

function SiegeView:waitEnterMsg(callBack)
	local function onMsgCallBack()
		callBack()
	end
	G_UserData:getSiegeData():refreshRebelArmy(true)
    local signal = G_SignalManager:add(SignalConst.EVENT_REBEL_ARMY, onMsgCallBack)
	return signal
end

function SiegeView:ctor()
	self._topBar = nil	--顶部条
	self._nodes = {}		--叛军节点


	self._rankReward = nil			--个人排行获得奖励
	self._rankGuildReward = nil 	--工会排行获得奖励

	--signal
	self._signalShare = nil			--叛军分享
	self._signalBoxReward = nil		--叛军奖励
	-- self._signalHurtReward = nil	--领取奖励
	self._signalRedPointUpdate = nil	--红点更新
	self._signalGetRebelArmy = nil 		--获取叛军

	--ui
	self._topBar = nil		--顶部栏
	self._textRankCrop = nil	--工会排名
	self._rewardCrop = nil		--工会排名奖励
	self._rewardPersonal = nil	--个人排名奖励
	self._textRankPersonal = nil	--个人排名
	self._btnPageUp = nil		--上一页
	self._btnPageDown = nil		--下一页
	self._btnShop = nil			--商店
	self._btnReward = nil		--奖励
	self._btnRank = nil			--排行榜
	self._btnRule = nil			--规则

	--scene
	self._scrollScene = nil 		--滚动层
	self._scene = nil 				--场景对象

	-- self._simpleSiegeList = {}			--储存本地叛军的列表，储存简单数据

	local resource = {
		file = Path.getCSB("SiegeView", "siege"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_btnReward = {
				events = {{event = "touch", method = "_onRewardClick"}}
			},
			_btnRank = {
				events = {{event = "touch", method = "_onRankClick"}}
			},
			_btnShop = {
				events = {{event = "touch", method = "_onShopClick"}}
			},
			_btnTakeAll = {
				events = {{event = "touch", method = "_onBtnTakeAll"}}
			},
			_btnShareAll = {
				events = {{event = "touch", method = "_onBtnShareAll"}}
			}
		}
	}
	self:setName("SiegeView")
	SiegeView.super.ctor(self, resource)
end

function SiegeView:onCreate()
    self._topBar:setImageTitle("txt_sys_com_nanmanruqin")
 	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topBar:updateUI(TopBarStyleConst.STYLE_COMMON)

	self._btnReward:updateUI(FunctionConst.FUNC_SIEGE_REWARD)
	self._btnShop:updateUI(FunctionConst.FUNC_SIEGE_SHOP)
	self._btnRank:updateUI(FunctionConst.FUNC_REBEL_RANK)
	self._btnRule:updateUI(FunctionConst.FUNC_PVE_SIEGE)
	self._btnTakeAll:updateUI(FunctionConst.FUNC_SIEGE_GET_ALL)
	self._btnTakeAll:setVisible(false)
	self._btnShareAll:updateUI(FunctionConst.FUNC_SIEGE_SHARE_ALL)
	self._btnShareAll:setVisible(false)

	self._scene = require("app.scene.view.siege.SiegeScene").new()
	local innerContainer = self._scrollScene:getInnerContainer()
	innerContainer:addChild(self._scene)
	self._scrollScene:setInnerContainerSize(cc.size(self._scene:getWidth(), 640))

	-- self:_createEnemies()
	cc.bind(self._commonChat,"CommonMiniChat")
end

function SiegeView:onEnter()
	-- self:_getEnemyList()
	-- self:_refreshPage()

	self._signalShare = G_SignalManager:add(SignalConst.EVENT_SIEGE_SHARE, handler(self, self._onEventSiegeShare))
	self._signalBoxReward = G_SignalManager:add(SignalConst.EVENT_SIEGE_BOX_REWARD, handler(self, self._onEventSiegeBox))
	self._signalRedPointUpdate = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self,self._onEventRedPointUpdate))
	-- self._signalHurtReward = G_SignalManager:add(SignalConst.EVENT_SIEGE_HURT_REWARD, handler(self, self._onEventHurtReward))
	self._signalGetRebelArmy = G_SignalManager:add(SignalConst.EVENT_REBEL_ARMY, handler(self, self._onEventRebelArmy))
	-- self._signalChangeScene = G_SignalManager:add(SignalConst.EVENT_CHANGE_SCENE, handler(self, self._onEventChangeScene))

	local takeVisible = require("app.utils.logic.FunctionCheck").funcIsShow(FunctionConst.FUNC_SIEGE_GET_ALL)
	self._btnTakeAll:setVisible(takeVisible)
	local shareVisible = require("app.utils.logic.FunctionCheck").funcIsShow(FunctionConst.FUNC_SIEGE_SHARE_ALL)
	self._btnShareAll:setVisible(shareVisible)


	self:_refreshTakeAllBtn()
	self:_refreshRankInfo()
	self:_refreshRedPoint()
	self:_refreshEnemy()

	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP,self.__cname)
end

function SiegeView:onExit()
	self._signalShare:remove()
	self._signalShare = nil
	self._signalBoxReward:remove()
	self._signalBoxReward = nil
	self._signalRedPointUpdate:remove()
    self._signalRedPointUpdate = nil
	-- self._signalHurtReward:remove()
	-- self._signalHurtReward = nil
	self._signalGetRebelArmy:remove()
	self._signalGetRebelArmy = nil
end

function SiegeView:_removeNodes()
	for i, v in pairs(self._nodes) do
		v:removeFromParent()
		v = nil
	end
	self._nodes = {}

end

function SiegeView:_onEventRedPointUpdate(event,funcId,param)
	if funcId == FunctionConst.FUNC_PVE_SIEGE then
		self:_refreshRedPoint()
    end
end

function SiegeView:_onEventHurtReward()
	self:_refreshRedPoint()
end

function SiegeView:_refreshRedPoint()
    local showRedPoint = G_UserData:getSiegeData():canGetRewards()
	self._btnReward:showRedPoint(showRedPoint)
end

function SiegeView:_refreshRankInfo()
	self:_refreshMyRankPanel()
	self:_refreshGuildRankPanel()
end

--刷新我的排名面板
function SiegeView:_refreshMyRankPanel()
	local myRank = G_UserData:getSiegeData():getUserRank()
	if myRank == 0 then
		self._textRankPersonal:setString(Lang.get("siege_rank_no_rank"))
		self._textReward:setString(Lang.get("siege_rank_no_reward"))
		self._rewardPersonal:setVisible(false)
	else
		self._textRankPersonal:setString(myRank)
		local reward = SiegeHelper.getRankReward(SiegeView.REWARD_TYPE_PERSON, myRank)
		if reward then
			self._rewardPersonal:updateUI(reward.type,reward.value, reward.size)
			self._rewardPersonal:setTextColorToDTypeColor()
			self._textReward:setString(Lang.get("siege_rank_reward"))
			self._rewardPersonal:setVisible(true)
		end
		self._rankReward = reward
	end
end

--刷新工会排名面板
function SiegeView:_refreshGuildRankPanel()
	local guildRank = G_UserData:getSiegeData():getUserGuildRank()
	if guildRank == 0 then
		self._textRankCrop:setString(Lang.get("siege_rank_no_rank"))
		self._rewardCrop:setVisible(false)
		self._textCropReward:setString(Lang.get("siege_rank_no_reward"))
	else
		self._textRankCrop:setString(guildRank)
		local reward = SiegeHelper.getRankReward(SiegeView.REWARD_TYPE_GUILD, guildRank)
		if reward then
			self._rewardCrop:updateUI(reward.type, reward.value, reward.size)
			self._rewardCrop:setTextColorToDTypeColor()
			self._rewardCrop:setVisible(true)
			self._textCropReward:setString(Lang.get("siege_rank_reward"))
		end
		self._rankGuildReward = reward
	end
end

-- function SiegeView:_createEnemies()
-- 	local enemyList = G_UserData:getSiegeData():getSiegeEnemys()
-- 	for i, v in pairs(enemyList) do
-- 		local siegeNode = SiegeNode.new(v:getUid(), v:getId())
-- 		self._scene:addNode(siegeNode)
-- 		table.insert(self._nodes, siegeNode)
-- 	end
-- 	self._scrollScene:setInnerContainerSize(cc.size(self._scene:getWidth(), 640))
-- end


function SiegeView:_fixScrollViewSize()
	local pos = self._scrollScene:getInnerContainerPosition()
	local width = self._scene:getWidth()
	self._scrollScene:setInnerContainerSize(cc.size(width, 640))
	if pos.x < -1 *width then
		pos.x = -1 *width
	end
	self._scrollScene:setInnerContainerPosition(pos)
end

--刷新敌人
function SiegeView:_refreshEnemy()
	local enemyList = G_UserData:getSiegeData():getSiegeEnemys()
	local curNodeNum = #self._nodes
	local curEnemyNum = #enemyList
	--数目没发生变化
	if curEnemyNum == curNodeNum then
		for i, v in pairs(self._nodes) do
			v:refreshSiege()
		end
	elseif curEnemyNum > curNodeNum then
		--刷新老的数据
		for i, v in pairs(self._nodes) do
			v:refreshSiege()
		end
		--添加新的节点
		for i = curNodeNum + 1, curEnemyNum do
			local d = enemyList[i]
			local siegeNode = SiegeNode.new(d:getUid(), d:getId())
			self._scene:addNode(siegeNode)
			table.insert(self._nodes, siegeNode)
		end
		self:_fixScrollViewSize()
	else
		--少于当前数目的时候
		self._scene:reset()
		self._nodes = {}
		for i, v in pairs(enemyList) do
			local siegeNode = SiegeNode.new(v:getUid(), v:getId())
			self._scene:addNode(siegeNode)
			table.insert(self._nodes, siegeNode)
		end
		self:_fixScrollViewSize()
	end
end

function SiegeView:_onRewardClick()
	if G_UserData:getSiegeData():isExpired() then
	   G_UserData:getSiegeData():refreshRebelArmy()
	   return
    end
	local popupHurtReward = require("app.scene.view.siege.PopupHurtReward").new()
	popupHurtReward:openWithAction()
end

--收到叛军宝箱
function SiegeView:_onEventSiegeBox(eventName, rewards)
	self:_refreshEnemy()
	self:_refreshTakeAllBtn()
	local PopupGetRewards = require("app.ui.PopupGetRewards").new()
	PopupGetRewards:showRewards(rewards)
end

--刷新一键领取按钮
function SiegeView:_refreshTakeAllBtn(  )
	if not G_UserData:getSiegeData():haveNotTakedAward() then
		self._btnTakeAll:loadCustomIcon(Path.getCommonIcon("common","baoxiang_jubaopeng_kong"))
		self._btnTakeAll:stopFuncGfx()
	else
		self._btnTakeAll:loadCustomIcon(Path.getCommonIcon("common","img_mapbox_guan"))
		self._btnTakeAll:playFuncGfx()
	end
end

--点击排行榜发送消息
function SiegeView:_onRankClick()
	if G_UserData:getSiegeData():isExpired() then
		G_UserData:getSiegeData():refreshRebelArmy()
		return
	end
	local popupSiegeRank = require("app.scene.view.siege.PopupSiegeRank").new(self._rankReward, self._rankGuildReward)
	popupSiegeRank:openWithAction()
end

--接收分享消息
function SiegeView:_onEventSiegeShare()
	G_Prompt:showTip(Lang.get("siege_share_success"))
	self:_refreshEnemy()
end

--点击商店按钮
function SiegeView:_onShopClick()
    local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
    WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_SIEGE_SHOP)
end

-- 点击一键分享
function SiegeView:_onBtnShareAll( ... )
    if not G_UserData:getGuild():isInGuild() then     -- 是否加入军团
        G_Prompt:showTip(Lang.get("siege_no_guild"))
        return
    else
		local canShare = G_UserData:getSiegeData():isThereArmyCanShare()
		if canShare then
			G_UserData:getSiegeData():c2sRebArmyPublicMulti()
		else
			G_Prompt:showTip(Lang.get("siege_no_share"))
		end
	end
end

-- 点击一键领取
function SiegeView:_onBtnTakeAll( ... )
	G_UserData:getSiegeData():c2sRebArmyKillRewardMulti()
end


--获得暴乱的怪物Avatar
function SiegeView:getSiegeNodeByIndex( index )
	-- body

	if #self._nodes > 0 and self._nodes[index] then
		return self._nodes[index]
	end

	return nil
end

function SiegeView:_onEventRebelArmy(eventName)
	self:_refreshTakeAllBtn()
	self:_refreshEnemy()
end

-- function SiegeView:_onEventChangeScene()
-- 	G_UserData:getSiegeData():refreshRebelArmy()
-- end

return SiegeView
