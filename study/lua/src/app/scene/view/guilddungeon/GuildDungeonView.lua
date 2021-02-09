

local ViewBase = require("app.ui.ViewBase")
local GuildDungeonView = class("GuildDungeonView", ViewBase)
local UserDataHelper = require("app.utils.UserDataHelper")
local RedPointHelper = require("app.data.RedPointHelper")
local WorldBossRewardPreviewNode = require("app.scene.view.worldBoss.WorldBossRewardPreviewNode")
local GuildDungeonMonsterNode = require("app.scene.view.guilddungeon.GuildDungeonMonsterNode")
local GuildDungeonRankNode = require("app.scene.view.guilddungeon.GuildDungeonRankNode")


 GuildDungeonRankNode.Z_ORDER_SEA = 1
 GuildDungeonRankNode.Z_ORDER_SKY = 2
 GuildDungeonRankNode.Z_ORDER_DOCK = 3

 GuildDungeonRankNode.Z_ORDER_BOAT = 10
 GuildDungeonRankNode.Z_ORDER_PRE_SCENE = 100


 GuildDungeonRankNode.DST_SCALE = 1 --最终放大值
 
 GuildDungeonRankNode.SKY_AND_DOCK_HEIGHR_SCALE = 1.133121--天空和码头缩放值   1.433121
 GuildDungeonRankNode.SCALE_VALUE_PER_PIXEL =  0.1 / 250--船大小每像素缩放值
 GuildDungeonRankNode.X_POS_SCALE_VALUE_PER_PIXEL = 0.1 / 250--船X间距每像素缩放值
 GuildDungeonRankNode.Y_POS_SCALE_VALUE_PER_PIXEL =  0.1 / 300--船Y间距每像素缩放值
 GuildDungeonRankNode.DISTANCE_BOAT_TO_SKY =  400--最上面的船距离天空的距离
 GuildDungeonRankNode.DISTANCE_SKY_AND_DOCK_HEIGHR =  438 * GuildDungeonRankNode.SKY_AND_DOCK_HEIGHR_SCALE  --最上层的天空和码头总高度
 GuildDungeonRankNode.FIRST_ENTER_BOTTOM_BOAT_TO_SCREEN_DISTANCE = 200--第一次进来最底部船到屏幕距离

 GuildDungeonRankNode.IMG_SEA_HEIGHT = 1280
 GuildDungeonRankNode.MAP_WIDTH = 1800
 GuildDungeonRankNode.MAP_MIN_HEIGHT = 840

--等服务器回包后，创建对话框并弹出UI
function GuildDungeonView:waitEnterMsg(callBack)
	local function onMsgCallBack()
		callBack()
	end
	local msgReg = G_SignalManager:add(SignalConst.EVENT_GUILD_DUNGEON_RECORD_SYN, onMsgCallBack)
	G_UserData:getGuildDungeon():c2sGetGuildDungeonRecord()
	return msgReg
end

function GuildDungeonView:ctor()
    self._commonMenu = nil
    self._textRemainCount = nil
    self._cityNodes = {}
    self._worldBossRewardNode = nil
    self._guildDungeonRankNode = {}
	self._maxY = 0
	self._isCreate = true
	local resource = {
		file = Path.getCSB("GuildDungeonView", "guildDungeon"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
		}
	}
	GuildDungeonView.super.ctor(self, resource)
end

function GuildDungeonView:onCreate()
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_GUILD)
    self._topbarBase:setImageTitle("txt_sys_com_juntuanfuben") 
    cc.bind(self._commonChat,"CommonMiniChat")

    self._commonMenu:updateUI(FunctionConst.FUNC_GUILD_DUNGEON_RECORD )
    self._commonMenu:addClickEventListenerEx(handler(self,self._onClickRecord))

    self._commonHelp:updateLangName("HELP_GUILD_DUNGEON")

	self._scrollBG:setScrollBarEnabled(false)
	self._scrollBG:addEventListener(handler(self,self._scrollEventCallback))

    self._worldBossRewardNode = WorldBossRewardPreviewNode.new(self._nodeReward)
    self._guildDungeonRankNode = GuildDungeonRankNode.new()
    self:addChild(self._guildDungeonRankNode)
end

function GuildDungeonView:onEnter()
    self._signalCommonZeroNotice = G_SignalManager:add(SignalConst.EVENT_COMMON_ZERO_NOTICE, handler(self, self._onEventCommonZeroNotice))
	self._signalGetAuctionInfo = G_SignalManager:add(SignalConst.EVENT_GET_ALL_AUCTION_INFO, handler(self, self._onEventGetAuctionInfo))
    self._signalGuildDungeonRecordSyn = G_SignalManager:add(SignalConst.EVENT_GUILD_DUNGEON_RECORD_SYN, handler(self, self._onEventGuildDungeonRecordSyn))
	self._signalGuildDungeonMonsterGet = G_SignalManager:add(SignalConst.EVENT_GUILD_DUNGEON_MONSTER_GET, handler(self, self._onEventGuildDungeonMonsterGet))
    self._signalGuildGetUserGuild = G_SignalManager:add(SignalConst.EVENT_GUILD_GET_USER_GUILD, handler(self, self._onEventGuildGetUserGuild))
    self._signalGuildKickNotice = G_SignalManager:add(SignalConst.EVENT_GUILD_KICK_NOTICE, handler(self, self._onEventGuildKickNotice))

	G_UserData:getGuildDungeon():setSynRecordData(true)

	if not G_UserData:getGuild():isInGuild() then
		G_SceneManager:popScene()
		return
	end

    if G_UserData:getGuildDungeon():isExpired() == true then
        G_UserData:getGuildDungeon():pullData()
    end

    self:_updateView()
	self:_updateMapView()

    --拍卖开始倒计时,开始时重新请求下数据以便统计
    local isCurrOpen,startTimeToday,endTimeToday = UserDataHelper.isGuildDungenoInAttackTime()
    local endTime = endTimeToday + G_ServerTime:secondsFromZero()
    if endTime > G_ServerTime:getTime() then
        G_ServiceManager:registerOneAlarmClock("GuildDungeonView_Aution", endTime, function()
            G_UserData:getGuildDungeon():c2sGetGuildDungeonRecord()
			G_UserData:getAuction():c2sGetAllAuctionInfo()
        end)
    end
  
	--检查是否需要弹出拍卖对话框
    self:_checkShowDlg()

	self:_startTimer()

	G_UserData:getAuction():c2sGetAllAuctionInfo()

	
	if self._isCreate then
		self._isCreate = false
	else
		G_UserData:getGuildDungeon():c2sGetGuildDungeonRecord()	
	end

		
end	

function GuildDungeonView:onExit()
	self._signalCommonZeroNotice:remove()
	self._signalCommonZeroNotice = nil

    self._signalGetAuctionInfo:remove()
	self._signalGetAuctionInfo = nil

    self._signalGuildDungeonRecordSyn:remove()
	self._signalGuildDungeonRecordSyn = nil

	self._signalGuildDungeonMonsterGet:remove()
	self._signalGuildDungeonMonsterGet = nil

    self._signalGuildGetUserGuild:remove()
    self._signalGuildGetUserGuild = nil

	self._signalGuildKickNotice:remove()
	self._signalGuildKickNotice = nil

	G_UserData:getGuildDungeon():setSynRecordData(false)

    G_ServiceManager:DeleteOneAlarmClock("GuildDungeonView_Aution")

	self:_endTimer()


end

--踢出事件
function GuildDungeonView:_onEventGuildKickNotice(event,uid)
	if uid == G_UserData:getBase():getId() then--被踢玩家是自己
		local GuildUIHelper = require("app.scene.view.guild.GuildUIHelper")
		GuildUIHelper.noticeBeKickGuild()
	end
end


function GuildDungeonView:_onEventCommonZeroNotice(eventName,hour)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
    G_UserData:getGuildDungeon():pullData()
end

function GuildDungeonView:_onEventGetAuctionInfo(id, message)
	self:_checkShowDlg()
end

function GuildDungeonView:_onEventGuildDungeonRecordSyn(event)
	self:_updateView()
	self:_updateMapView()

    self:_checkShowDlg()
end

function GuildDungeonView:_onEventGuildDungeonMonsterGet(event)
    self:_updateView()
	self:_updateMapView(true)
end

function GuildDungeonView:_onEventGuildGetUserGuild(event)
     self:_refreshRemainCount()
end

function GuildDungeonView:_startTimer()
	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
        return
	end
	self._refreshHandler = SchedulerHelper.newSchedule(handler(self,self._onRefreshTick),1)
end

function GuildDungeonView:_endTimer()
	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._refreshHandler)
		self._refreshHandler = nil
	end
end

function GuildDungeonView:_onRefreshTick(dt)
	self:_refreshRemainCount()
end

function GuildDungeonView:_onClickRecord()    
    local PopupGuildDungeonRecord = require("app.scene.view.guilddungeon.PopupGuildDungeonRecord")
    local popup = PopupGuildDungeonRecord.new()
    popup:openWithAction()
end

function GuildDungeonView:_refreshRemainCount() 
	local inAttackTime,startTime,endTime = UserDataHelper.isGuildDungenoInAttackTime()
    if not inAttackTime then
		local time = G_ServerTime:secondsFromZero() + startTime
		if time < G_ServerTime:getTime() then
			local TimeConst = require("app.const.TimeConst")
			time = time + TimeConst.SECONDS_ONE_DAY
		end
		local txt = G_ServerTime:getLeftSecondsString(time, "00:00:00")
		self._textTimeTitle:setString(Lang.get("guilddungeon_open_downtime"))
		self._textTime:setString(txt)
	else
		local txt = G_ServerTime:getLeftSecondsString(G_ServerTime:secondsFromZero() + endTime , "00:00:00")
		self._textTimeTitle:setString(Lang.get("guilddungeon_close_downtime"))	
		self._textTime:setString(txt)
    end
 
    self._textRemainCount:setVisible(true)
    self._textCountTitle:setVisible(true)
    

    local count = UserDataHelper.getGuildDungenoFightCount()
    self._textRemainCount:setString(count)
end

function GuildDungeonView:_createMapView()
	local innerContainer = self._scrollBG:getInnerContainer()
	local oldContainerPosY = innerContainer:getPositionY()
    innerContainer:removeAllChildren()
	self._cityNodes = {}

    local GuildStageAtkReward = require("app.config.guild_stage_atk_reward")
    local maxY = 0
	local minY = 0
    local monsterList = UserDataHelper.getGuildDungeonMonsterList()
	for k,v in ipairs(monsterList) do
		local config = GuildStageAtkReward.get(v.rank)
        assert(config,"guild_stage_atk_reward cannot find id "..tostring(v.rank) )
		local icon = GuildDungeonMonsterNode.new()
        icon:updateUI(v)
       
    	innerContainer:addChild(icon, GuildDungeonRankNode.Z_ORDER_BOAT )
		table.insert(self._cityNodes,icon)

        maxY = math.max(maxY,config.y_position)
		minY = minY == 0 and config.y_position or math.min(minY,config.y_position)
	end

	
	local nodeSea = cc.Node:create()
	nodeSea:setPosition(cc.p(GuildDungeonRankNode.MAP_WIDTH/2,0))
	self._maxY = maxY

	local scrollHeight  = maxY-minY + GuildDungeonRankNode.FIRST_ENTER_BOTTOM_BOAT_TO_SCREEN_DISTANCE + GuildDungeonRankNode.DISTANCE_BOAT_TO_SKY--最上面的船距离天空的距离
	logWarn(" ----------------  "..maxY)
	scrollHeight = math.max(scrollHeight,math.max(GuildDungeonRankNode.MAP_MIN_HEIGHT,G_ResolutionManager:getDesignHeight()))
	logWarn(" ----------------  "..scrollHeight)
	self._scrollHeight = scrollHeight
	
	for k,icon in ipairs(self._cityNodes) do
		 local config = icon:getConfig()
		 icon:setPosition(config.x_position,scrollHeight - GuildDungeonRankNode.DISTANCE_BOAT_TO_SKY + config.y_position - self._maxY  ) 
	end



	local seaY = scrollHeight - GuildDungeonRankNode.DISTANCE_SKY_AND_DOCK_HEIGHR--减去最上层的天空和码头
	local seaImageNum = math.ceil(seaY /  GuildDungeonRankNode.IMG_SEA_HEIGHT)

	--大海
	for i = 1,seaImageNum,1 do
		local newMap = cc.Sprite:create(Path.getGuildDungeonJPG("sea"))
		newMap:setAnchorPoint(cc.p(0.5, 1))
		newMap:setPosition(cc.p(0,seaY - (i -1) *  GuildDungeonRankNode.IMG_SEA_HEIGHT))
		nodeSea:addChild(newMap,GuildDungeonRankNode.Z_ORDER_SEA)
	end

	--天空
	local newMap = cc.Sprite:create(Path.getGuildDungeonJPG("sea_bg_2"))
	newMap:setAnchorPoint(cc.p(0.5, 1))
	newMap:setPosition(cc.p(0,scrollHeight))
	newMap:setScale(GuildDungeonRankNode.SKY_AND_DOCK_HEIGHR_SCALE )
	nodeSea:addChild(newMap,GuildDungeonRankNode.Z_ORDER_SKY)
	

	--码头
	local newMap = cc.Sprite:create(Path.getGuildDungeonUI("sea_bg"))
	newMap:setAnchorPoint(cc.p(0.5, 0))
	newMap:setPosition(cc.p(0,seaY))
	newMap:setScale(GuildDungeonRankNode.SKY_AND_DOCK_HEIGHR_SCALE )
	nodeSea:addChild(newMap, GuildDungeonRankNode.Z_ORDER_DOCK )
	
	innerContainer:addChild(nodeSea,GuildDungeonRankNode.Z_ORDER_SEA)
	self._nodeSea = nodeSea

	--前景
	local newMap = cc.Sprite:create(Path.getGuildDungeonUI("sea_pre"))
	newMap:setAnchorPoint(cc.p(0.5, 0))
	newMap:setPosition(cc.p(GuildDungeonRankNode.MAP_WIDTH/2,0))
	innerContainer:addChild(newMap,GuildDungeonRankNode.Z_ORDER_PRE_SCENE)

	local size = cc.size(GuildDungeonRankNode.MAP_WIDTH,scrollHeight * GuildDungeonRankNode.DST_SCALE)
	self._scrollBG:setInnerContainerSize(size)

	local currContainerPosY = 0
	if oldContainerPosY ~= 0 then
		local maxScrollDis = size.height - G_ResolutionManager:getDesignHeight()
		currContainerPosY = math.max(oldContainerPosY,-maxScrollDis)
		currContainerPosY = math.min(currContainerPosY,0)
	else
	--	currContainerPosY = math.min(0,-minY + 
	--		GuildDungeonRankNode.FIRST_ENTER_BOTTOM_BOAT_TO_SCREEN_DISTANCE)
	end
	self._scrollBG:getInnerContainer():setPositionY(currContainerPosY)

	

	self:_updatePerspective()
	self:_updatePerspective()
end

function GuildDungeonView:_refreshMapView()
	for k,v in ipairs(self._cityNodes) do
		v:refreshUI()
	end
end


function GuildDungeonView:_scrollEventCallback(sender, eventType)
    if eventType == ccui.ScrollviewEventType.containerMoved then
		self:_updatePerspective()
    end
end

function GuildDungeonView:_updatePerspective()
		local innerSize = self._scrollBG:getInnerContainerSize()
		local currScrollDis = -self._scrollBG:getInnerContainer():getPositionY()
		local maxScrollDis = innerSize.height - G_ResolutionManager:getDesignHeight()
		local mapScale = 1 + (GuildDungeonRankNode.DST_SCALE - 1) * currScrollDis / maxScrollDis

		self._nodeSea:setScale(mapScale)
		
		for k,v in ipairs(self._cityNodes) do
			local config = v:getConfig()
			local posY = v:getPositionY()
			local distance = (self._scrollHeight - GuildDungeonRankNode.DISTANCE_BOAT_TO_SKY + config.y_position - self._maxY )* mapScale -- config.y_position * mapScale
			--(posY - currScrollDis < 820 and posY- currScrollDis > -170 )
			if (distance - currScrollDis < 1200 and distance- currScrollDis > -170 ) then
				local scaleValue =  1- (distance - currScrollDis) *  GuildDungeonRankNode.SCALE_VALUE_PER_PIXEL
				local xPosScaleValue = 1- (distance - currScrollDis) *  GuildDungeonRankNode.X_POS_SCALE_VALUE_PER_PIXEL --0.15/300
				local yPosScaleValue = 1- (distance - currScrollDis) *  GuildDungeonRankNode.Y_POS_SCALE_VALUE_PER_PIXEL -- 0.12/300

				local newW = xPosScaleValue  * GuildDungeonRankNode.MAP_WIDTH
				local x = config.x_position /GuildDungeonRankNode.MAP_WIDTH   * newW +  (GuildDungeonRankNode.MAP_WIDTH-newW)/2
				local y = currScrollDis + (distance - currScrollDis) * yPosScaleValue

				if (y - currScrollDis < 820 and y- currScrollDis > -170 ) 
				then
					v:setScale( scaleValue)
					v:setPositionX(x)
					v:setPositionY(y)
					v:setVisible(true)
				else
					logWarn("___"..tostring(distance))
					v:setVisible(false)
				end
			else
				v:setVisible(false)	
			end
		end

		logWarn("GuildDungeonView "..currScrollDis.."  "..maxScrollDis.."  "..mapScale)
end

--进入时，检查是否需要弹出跳转提示框
function GuildDungeonView:_checkShowDlg()
	--是否显示弹框
	logWarn("GuildDungeonView:_showGuildDlg show !!!!!!!!!!! start")
	--军团拍卖活动是否结束
    
	local AuctionConst = require("app.const.AuctionConst")
	local isAuctionWorldEnd = G_UserData:getAuction():isAuctionShow(AuctionConst.AC_TYPE_GUILD_DUNGEON_ID)
	if isAuctionWorldEnd == false then
		logWarn("GuildDungeonView:_showGuildDlg  isAuctionShow = false ")
		return
	end

	if UserDataHelper.guildDungeonNeedShopAutionDlg() == true then
		local isInGuild = G_UserData:getGuild():isInGuild()
		if isInGuild then
			self:_showGuildDlg()
		end
	else
		logWarn("GuildDungeonView:_showGuildDlg guildDungeonNeedShopAutionDlg false")	
	end	
end

function GuildDungeonView:_showGuildDlg()
    local rankData = G_UserData:getGuildDungeon():getMyGuildRankData()
	local atkCount =  rankData:getNum()
	local guildRank = rankData:getRank()
	local point = rankData:getPoint()
	
	if atkCount == nil or atkCount <= 0 then--出手次数
		logWarn("GuildDungeonView:_showGuildDlg atkCount is nil")
		return
	end
	
	local guildPrestige = UserDataHelper.getGuildDungenoGetPrestige()

	local personDlg = Lang.get("guilddungeon_reward_finish_show2", {
		point = point,
		guildRank = guildRank,
		guildExp = guildPrestige,
	})

	--跳转到拍卖界面
	local function onBtnGo()
        local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_AUCTION)
	end	



	local PopupSystemAlert = require("app.ui.PopupSystemAlert").new(Lang.get("worldboss_popup_title1"), personDlg,onBtnGo)
	PopupSystemAlert:setCheckBoxVisible(false)
	PopupSystemAlert:showGoButton(Lang.get("worldboss_go_btn2"))
	PopupSystemAlert:setCloseVisible(true)
	PopupSystemAlert:openWithAction()
end

function GuildDungeonView:_updateView()
    self._worldBossRewardNode:updateInfo(UserDataHelper.getGuildDungeonPreviewRewards())
    self:_refreshRemainCount()
end

function GuildDungeonView:_updateMapView(isCreate)
	if isCreate or #self._cityNodes <= 0 then
		self:_createMapView()
	else
		self:_refreshMapView()	
	end
end



return GuildDungeonView