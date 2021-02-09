--世界boss
local ViewBase = require("app.ui.ViewBase")
local WorldBossView = class("WorldBossView", ViewBase)

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")

local WorldBossConst = require("app.const.WorldBossConst")
local TextHelper = require("app.utils.TextHelper")
local WorldBossRankNode = import(".WorldBossRankNode")
local WorldBossHelper = import(".WorldBossHelper")
local WorldBossRewardPreviewNode = import(".WorldBossRewardPreviewNode")
local WorldBossAvatar = import(".WorldBossAvatar")

local SCENE_ID = 1 --游戏场景ID
local MOVE_TO_BOSS_OFFSET = 60
local MAX_BUBBLE_WIDTH = 200

local START_PRE_AVATAR_INDEX = 200
local MOVE_TIME = 0.5
function WorldBossView:waitEnterMsg(callBack)
	local function onMsgCallBack()
		callBack()
		self._needRequest = false
	end
	G_UserData:getWorldBoss():c2sEnterWorldBoss()

    local signal = G_SignalManager:add(SignalConst.EVENT_WORLDBOSS_GET_INFO, onMsgCallBack)
	return signal
end



function WorldBossView:ctor()
    --
	--左边控件
	self._nodeLeft = nil

	self._imageBarBk = nil
	self._isBossOpen = false
	self._commonHelp =nil
	self._worldBossRewardNode = nil
	self._nodeAvatar = nil
	self._nodeAvatarBoss = nil
    local resource = {
        file = Path.getCSB("WorldBossView", "worldBoss"),
        size =  G_ResolutionManager:getDesignSize(),
        binding = {
			_commonBtnRight = {
				events = {{event = "touch", method = "_onBtnRight"}}
			},
			_commonBtnLeft = {
				events = {{event = "touch", method = "_onBtnLeft"}}
			},

		}
    }

	self:setName("WorldBossView")
    WorldBossView.super.ctor(self, resource)
end

function WorldBossView:_onWolrdBossClickBack()
	--关闭弹幕，弹出场景
	--G_BulletScreenManager:clearBulletLayer()
	G_SceneManager:popScene()
end

function WorldBossView:onCreate()

	self._danmuPanel = self._commonChat:getPanelDanmu()
	self._danmuPanel:addClickEventListenerEx(handler(self,self._onBtnDanmu))
	
	self:_updateBulletScreenBtn(1)

	G_BulletScreenManager:setBulletScreenOpen(1,true)

	self._topbarBase:setImageTitle("txt_sys_com_juntuanboss")
	self._topbarBase:hideBG()
	self._topbarBase:setCallBackOnBack(handler(self,self._onWolrdBossClickBack))

	self._topbarBase:updateUIByResList(
		{
			{type = 0,value = 0  },
			{type = 0,value = 0  },
			{type = 0,value = 0  },
			{type = 0,value = 0  }
		}
	)


	self._commonHelp:updateUI(FunctionConst.FUNC_WORLD_BOSS)
	self._textBossOpenTime:setString(Lang.get("worldboss_open_time"))
	
	self._nodeLeft:removeAllChildren()
	self._nodeLeft:addChild(WorldBossRankNode.new())

	


	self._worldBossRewardNode = WorldBossRewardPreviewNode.new(self._nodeReward)
	
	local sceneView = require("app.fight.scene.SceneView").new()
	sceneView:resetScene(SCENE_ID)
	self._nodebk:setAnchorPoint(0.5,0.5)
	self._nodebk:setIgnoreAnchorPointForPosition(false)
	self._nodebk:addChild(sceneView)
	self._sceneView = sceneView

	self:_updateBossAvatar()

	cc.bind(self._commonChat,"CommonMiniChat")
end

function WorldBossView:_updateButton()
	local isBossOpen = G_UserData:getWorldBoss():isBossStart()

	self._textBossOpenTime:setVisible(false)

	local bossBtnName = WorldBossHelper.getBossFightBtnName()
	self._commonBtnRight:setVisible(false)
	self._commonBtnLeft:setVisible(false)
	if isBossOpen == true then
		self._textBtnRight:setString(bossBtnName)
		self._commonBtnRight:setVisible(true)
	else
		self._textBossOpenTime:setVisible(true)
	end
	
	local userBtnName = WorldBossHelper.getUserFightBtnName()
	if isBossOpen == true then
		self._textBtnLeft:setString(userBtnName)
		self._commonBtnLeft:setVisible(true)
	else
		self._textBossOpenTime:setVisible(true)
	end
	
end


function WorldBossView:_updateWorldBossRankNode()
	local bossRank = self._nodeLeft:getChildByName("WorldBossRankNode")
	if bossRank == nil then
		return
	end
	bossRank:updateUI()
end

--进入时，检查是否需要弹出跳转提示框
function WorldBossView:_checkShowDlg()
	--是否显示弹框
	logWarn("WorldBossView:_checkShowDlg show !!!!!!!!!!! start")


	--军团拍卖活动是否结束
	local AuctionConst = require("app.const.AuctionConst")
	local isAuctionWorldEnd = G_UserData:getAuction():isAuctionShow(AuctionConst.AC_TYPE_GUILD_ID)
	if isAuctionWorldEnd == false then
		logWarn("WorldBossView:_showGuildDlg  isAuctionWorldEnd = false ")
		return
	end

	
	if G_UserData:getWorldBoss():needShopPromptDlg() == true then
		logWarn("WorldBossView:_checkShowDlg show !!!!!!!!!!! enter")
		local isInGuild = G_UserData:getGuild():isInGuild()
		if isInGuild then
			self:_showGuildDlg()
		end
	end	
end
function WorldBossView:onEnter()
	local AudioConst = require("app.const.AudioConst")
	G_AudioManager:playMusicWithId(AudioConst.MUSIC_WORLDBOSS)

	self._signalEnterBossInfo = G_SignalManager:add(SignalConst.EVENT_WORLDBOSS_GET_INFO, handler(self, self._onEventEnterBossInfo))

	self._signalGetAuctionInfo = G_SignalManager:add(SignalConst.EVENT_GET_ALL_AUCTION_INFO, handler(self, self._onEventGetAuctionInfo))

	self._signalAttackWorldBoss = G_SignalManager:add(SignalConst.EVENT_WORLDBOSS_ATTACK_BOSS, handler(self, self._onEventAttackWorldBoss))

	self._signalGetGrabPoint = G_SignalManager:add(SignalConst.EVENT_WORLDBOSS_GET_GRAB_POINT, handler(self, self._onEventGrabWorldBossPoint))

	self._signalBulletNotice   = G_SignalManager:add(SignalConst.EVENT_BULLET_SCREEN_POST, handler(self, self._onEventBulletNotice))

	self._signalBossHit = G_SignalManager:add(SignalConst.EVENT_BULLET_BOSS_HIT, handler(self, self._onEventBossHit))

	self._signalUpdateWorldBossRank = G_SignalManager:add(SignalConst.EVENT_WORLDBOSS_UPDATE_RANK, handler(self, self._onEventUpdateWorldBossRank))

	G_UserData:getAuction():c2sGetAllAuctionInfo()--每次进入世界boss，都会附加拉去一下拍卖数据

	self:_updatePeopleAvatar()
	
	self._isBossOpen = G_UserData:getWorldBoss():isBossStart()
	self:_onRefreshTick()
	self:_updateBossAvatar()
	self:_startRefreshHandler()

	self:_updateWorldBossRankNode()
	self:_checkShowDlg()

	self._worldBossRewardNode:updateInfo()

	self._heroId = 0

	if G_UserData:getCrossWorldBoss():isBossStart() then
		local FunctionCheck = require("app.utils.logic.FunctionCheck")
		local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_CROSS_WORLD_BOSS)
		if isOpen then
			local title = Lang.get("season_silk_recommand_confirm_title")
			local content = Lang.get("crossworldboss_started_tips")
			local popupSystemAlert = require("app.ui.PopupSystemAlert").new(title, content, function (  )
				local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
				WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_CROSS_WORLD_BOSS)
			end)
			popupSystemAlert:showGoButton(Lang.get("crossworldboss_started_go"))
			popupSystemAlert:setCheckBoxVisible(false)
			popupSystemAlert:openWithAction()
		end
	end
end


function WorldBossView:onExit()
	--如果进入战斗界面，则弹幕系统内容不清空
	local runningScene = G_SceneManager:getTopScene()
	if runningScene and runningScene:getName() ~= "fight" then
		--关闭弹幕，弹出场景
		logWarn("G_BulletScreenManager:clearBulletLayer()")
		G_BulletScreenManager:clearBulletLayer()
		--G_UserData:getBulletScreen():setBulletScreenOpen(1, false)
	end

	self:_endRefreshHandler()

	self._signalEnterBossInfo:remove()
	self._signalEnterBossInfo = nil

	self._signalGetGrabPoint:remove()
	self._signalGetGrabPoint = nil

	self._signalAttackWorldBoss:remove()
	self._signalAttackWorldBoss = nil


	self._signalGetAuctionInfo:remove()
	self._signalGetAuctionInfo = nil

	self._signalBulletNotice:remove()
	self._signalBulletNotice =nil

	self._signalBossHit:remove()
	self._signalBossHit =nil


	self._signalUpdateWorldBossRank:remove()
	self._signalUpdateWorldBossRank = nil
end


function WorldBossView:_onBtnDanmu( ... )
	-- body
	logWarn("WorldBossView:_onBtnDanmu")
	local bulletOpen = G_UserData:getBulletScreen():isBulletScreenOpen(1)
	G_UserData:getBulletScreen():setBulletScreenOpen(1, not bulletOpen)
	
	self:_updateBulletScreenBtn(1)
end

function WorldBossView:_updateBulletScreenBtn( bulletType )
	-- body
	self._danmuPanel:getSubNodeByName("Node_1"):setVisible(false)
	self._danmuPanel:getSubNodeByName("Node_2"):setVisible(false)
	local bulletOpen = G_UserData:getBulletScreen():isBulletScreenOpen(bulletType)	
	if bulletOpen == true then
		self._danmuPanel:getSubNodeByName("Node_1"):setVisible(true)
		G_BulletScreenManager:showBulletLayer()
	else
		self._danmuPanel:getSubNodeByName("Node_2"):setVisible(true)
		G_BulletScreenManager:hideBulletLayer()
	end
end

function WorldBossView:_onBtnLeft()
	if WorldBossHelper.checkUserFight() == false then
		return
	end
	local isOpen = G_UserData:getWorldBoss():isBossStart()
	if isOpen == true then
		G_SceneManager:showDialog("app.scene.view.worldBoss.PopupWorldBossRob")
	end
end

function WorldBossView:_onBtnRight()

	local isOpen = G_UserData:getWorldBoss():isBossStart()
	if isOpen == false then
		G_Prompt:showTip(Lang.get("worldboss_no_open"))
		return
	end

	if WorldBossHelper.checkBossFight() == false then
		return
	end

	G_UserData:getWorldBoss():c2sAttackWorldBoss()
end


function WorldBossView:_onRequestTick( ... )
	-- boss开启则请求刷新
	-- 刷新排行榜数据
	local isBossOpen = G_UserData:getWorldBoss():isBossStart()
	if isBossOpen then
		G_UserData:getWorldBoss():c2sUpdateWorldBossRank()
	end
end

--每隔一段时间做一次tick，主要是世界boss攻打，排行榜刷新等
function WorldBossView:_onRefreshTick()
	self:_updateButton()
	local isBossOpen = G_UserData:getWorldBoss():isBossStart()
	if isBossOpen then
		self._danmuPanel:setVisible(true)
		self._textTimeDesc:setString(Lang.get("worldboss_close_time_desc"))
		local endString, percent = WorldBossHelper.getEndTime()
		self._textOverTime:setString(endString)
		self._loadingBarTime:setVisible(true)
		self._loadingBarTime:setPercent(percent)
		self._imageBarBk:setVisible(true)

		--一开始boss关闭，然后开放，则重新拉去数据
		if self._isBossOpen ~= isBossOpen then
			G_SignalManager:dispatch(SignalConst.EVENT_CLEAR_GUILD_INVITE_NOTICE) -- 规避演武场景切换的bug
			G_UserData:getWorldBoss():c2sEnterWorldBoss()
			self._isBossOpen = isBossOpen
		end
	else
		--从boss开始到关闭那一秒，重新拉取
		if self._isBossOpen ~= isBossOpen then
			self._isBossOpen = isBossOpen
			--世界boss结束，清空弹幕
			G_BulletScreenManager:clearBulletLayer()
			G_UserData:getWorldBoss():c2sEnterWorldBoss()
			G_UserData:getAuction():c2sGetAllAuctionInfo()--拉去一下拍卖数据
		end
		self._danmuPanel:setVisible(false)
		self._textTimeDesc:setString(Lang.get("worldboss_open_time_desc"))
		local startString, percent = WorldBossHelper.getOpenTime()
		self._textOverTime:setString(startString)
		--策划要求，还未开启，进度条是为100,樊淼要求又改回来
		self._loadingBarTime:setPercent(100)
	end
end

function WorldBossView:_startRefreshHandler()
	self:_endRefreshHandler()

	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
        return 
	end
	self._refreshHandler = SchedulerHelper.newSchedule(handler(self,self._onRefreshTick),1)
	local interVal =  WorldBossHelper.getParameterValue("boss_update_time")
	self._reqUpdateHandler = SchedulerHelper.newSchedule(handler(self,self._onRequestTick),interVal)
end

function WorldBossView:_endRefreshHandler()
	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._refreshHandler)
		self._refreshHandler = nil
	end
	if self._reqUpdateHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._reqUpdateHandler)
		self._reqUpdateHandler =nil
	end
end


function WorldBossView:_onEventGetAuctionInfo(id, message)
	self:_checkShowDlg()
end

function WorldBossView:_onEventEnterBossInfo(id, message)
	self:_updateBossAvatar()
	self:_updateWorldBossRankNode()
	self._worldBossRewardNode:updateInfo()
	self:_checkShowDlg()
end

--攻击世界boss
function WorldBossView:_onEventAttackWorldBoss(id, message)
	if(message == nil)then return end

	--dump(message)    
    local battleReport = rawget(message, "report") 
    if battleReport == nil then
        return
    end

	local function onFinish()
		local ReportParser = require("app.fight.report.ReportParser")
		local reportData = ReportParser.parse(battleReport)
		local battleData = require("app.utils.BattleDataHelper").parseWorldBossFight(message)
		G_SceneManager:showScene("fight", reportData, battleData)
		--进入战斗后，返回，则重新拉去世界boss信息
		G_UserData:getWorldBoss():c2sEnterWorldBoss()
	end
	
	self:_playMovingEffect(onFinish)
end







--抢夺世界boss
function WorldBossView:_onEventGrabWorldBossPoint(id, message)
	if(message == nil)then return end
    
    local reportId = rawget(message, "report") 

	-- local ReportParser = require("app.fight.report.ReportParser")
    -- local reportData = ReportParser.parse(battleReport)
    -- local battleData = require("app.utils.BattleDataHelper").parseWorldBossPoint(message)
	-- G_SceneManager:showScene("fight", reportData, battleData)

	local function enterFightView(message)
		local ReportParser = require("app.fight.report.ReportParser")
		local battleReport = G_UserData:getFightReport():getReport()
		local reportData = ReportParser.parse(battleReport)
		local battleData = require("app.utils.BattleDataHelper").parseWorldBossPoint(message)
		G_SceneManager:showScene("fight", reportData, battleData)
	end
	G_SceneManager:registerGetReport(reportId, function() enterFightView(message) end)
	

	--进入战斗后，返回，则重新拉去世界boss信息
	G_UserData:getWorldBoss():c2sEnterWorldBoss()
end



function WorldBossView:_showGuildDlg()


	local guildCount =  G_UserData:getWorldBoss():getEndNoticeValue("number")
	if guildCount == nil then
		logWarn("WorldBossView:_showGuildDlg guildCount is nil")
		return
	end
	

	logWarn("WorldBossView:_showGuildDlg !!!!!!!!!!!")
	local guildPoint = G_UserData:getWorldBoss():getEndNoticeValue("integral")
	local guildTimes = G_UserData:getWorldBoss():getEndNoticeValue("times")
	local guildRank = G_UserData:getWorldBoss():getEndNoticeValue("rank")
	local guildPrestige = G_UserData:getWorldBoss():getEndNoticeValue("prestige")


	local personDlg = Lang.get("worldboss_reward_finish_show2", {
		point = guildPoint,
		count = guildCount,
		guildRank = guildRank,
		guildExp = guildPrestige,
	})

	--跳转到拍卖界面
	local function onBtnGo()
        local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_AUCTION)
	end	

	
	--世界boss结束，清空弹幕
	G_BulletScreenManager:clearBulletLayer()
	

	local PopupSystemAlert = require("app.ui.PopupSystemAlert").new(Lang.get("worldboss_popup_title1"), personDlg,onBtnGo)
	PopupSystemAlert:setCheckBoxVisible(false)
	PopupSystemAlert:showGoButton(Lang.get("worldboss_go_btn2"))
	PopupSystemAlert:setCloseVisible(true)
	PopupSystemAlert:openWithAction()
end



function WorldBossView:_updatePeopleAvatar()
	crashPrint("WorldBossView:_updatePeopleAvatar begin")
	local avatarList = G_UserData:getWorldBoss():getUsers()
	if self._nodeAvatar then
		self._nodeAvatar:removeAllChildren()
	else
		self._nodeAvatar = cc.Node:create()
		self._sceneView:addEntityActor(self._nodeAvatar)
	end
	self._avatarList = {}
	--testData()
	local BossPeopleXY = require("app.config.boss_people_xy")
	
	local function createHeroAvatar(avatarData,index)
		local configPos = BossPeopleXY.get(index)
		assert(configPos,"can not find boss_people_xy by id : "..index)

		local avatarNode = WorldBossAvatar.new()
		avatarNode:setName("avatar"..index)
		avatarNode:updatePlayerInfo(avatarData)
		avatarNode:setPosition(cc.p(configPos.x, configPos.y))
		return avatarNode
	end

	for i, value in ipairs(avatarList) do
		local avatar = createHeroAvatar(value,i)
		avatar:setLocalZOrder(10000 - avatar:getPositionY())
		table.insert(self._avatarList, avatar)
		self._nodeAvatar:addChild(avatar)
	end

	self:_createPreAvatar()
	crashPrint("WorldBossView:_updatePeopleAvatar end")
end

function WorldBossView:_createPreAvatar( ... )
	-- body
	local boss_people_xy = require("app.config.boss_people_xy")
	local maxCount = START_PRE_AVATAR_INDEX + 5
	local function createHeroAvatar(index)
		local configPos = boss_people_xy.get(index)
		assert(configPos,"can not find boss_people_xy by id : "..index)
		local avatarNode = WorldBossAvatar.new()
		avatarNode:setName("avatar"..index)
		avatarNode:setPosition(cc.p(configPos.x, configPos.y))
		avatarNode:setVisible(false)
		return avatarNode
	end
	for i = START_PRE_AVATAR_INDEX, maxCount do
		local avatar = createHeroAvatar(i)
		avatar:setLocalZOrder(10000 - avatar:getPositionY())
		self._nodeAvatar:addChild(avatar)
	end
end

function WorldBossView:_playMovingEffect(callBack)
	logWarn("WorldBossView:_playMovingEffect")
	
	local avatarNode = self._sceneView:getSubNodeByName("avatar1")
	if avatarNode == nil then
		return
	end
	
	avatarNode:playMovingEffect(callBack)

end

function WorldBossView:_updateBossAvatar( ... )
	local bossInfo = WorldBossHelper.getBossInfo()
	if self._heroId == bossInfo.id then
		return
	end

	if self._nodeAvatarBoss then
		self._nodeAvatarBoss:removeAllChildren()
	else
		self._nodeAvatarBoss = cc.Node:create()
		self._sceneView:addEntityActor(self._nodeAvatarBoss)
	end


	self._textBossName:setString(bossInfo.name)
	local worldBossPos = WorldBossHelper.getBossPosition()
	--self._sceneView:removeActorByName("boss")
	self._heroId = bossInfo.id
	local avatarNode = WorldBossAvatar.new()
	avatarNode:updateBaseId(bossInfo.hero_id)
	avatarNode:setBossName(bossInfo.name)
	avatarNode:turnBack()
	avatarNode:setCallBack(handler(self,self._onBtnRight))
	avatarNode:setPosition(worldBossPos)
	avatarNode:setName("boss")
	self._nodeAvatarBoss:addChild(avatarNode)
	
end


function WorldBossView:_onEventBulletNotice( id,message  )
	-- body
	--移动worldBossAvatar，攻击boss，攻击完后再跳回来
	--如果在动作状态，则不做处理
	--如果场上没有合适的user id 则使用最后两位进行攻击
	--假设最后两位在攻击状态，则不做任何处理

    local user = rawget(message, "user") or {}
    local userData = {}
    userData.userId = user.user_id or 0
    userData.name = user.name
    userData.officialLevel = user.officer_level
    userData.baseId = user.leader
	userData.titleId = user.title or 0
	--变身卡转换
	local converId, playerInfo = require("app.utils.UserDataHelper").convertAvatarId(user)
	userData.playerInfo = playerInfo
	if userData.userId == 0 then
		return
	end

	if userData.userId == G_UserData:getBase():getId() then
		return
	end

	local function findAvatarById(userId)
		for i, avatar in ipairs(self._avatarList) do 
			if avatar:getUserId() == userId then
				return avatar
			end
		end
		return nil
	end
	--先从场上的avatar匹配播放效果
	local avatar = findAvatarById(userData.userId)
	if avatar then 
		if avatar:isPlaying() == false then
			avatar:playGoAttack()
		end
	else
		local function tryPlayAttack(index,userData)
			local avatarNode = ccui.Helper:seekNodeByName( self._sceneView, "avatar"..index)
			if avatarNode == nil then
				return
			end
			
			if avatarNode:isPlaying() == true then
				logWarn("avatarNode is isPlaying index: "..index)
				return false
			end
			
			dump(userData)
			logWarn("avatarNode is updatePlayerInfo index: "..index)
			avatarNode:updatePlayerInfo(userData)
			avatarNode:playImmAttack()
			return true
		end
		
		for i=START_PRE_AVATAR_INDEX ,START_PRE_AVATAR_INDEX +5, 1 do
			if tryPlayAttack(i, userData) == true then
			 	break
			end
		end
	end


end


function WorldBossView:_onEventBossHit( ... )
	-- body
	local bossNode = self._nodeAvatarBoss:getChildByName("boss")
	if bossNode == nil then
		return
	end
	bossNode:playHitAction()
end


function WorldBossView:_onEventUpdateWorldBossRank( )
	-- body
	self:_updateWorldBossRankNode()
end
return WorldBossView
