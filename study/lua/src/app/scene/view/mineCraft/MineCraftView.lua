local ViewBase = require("app.ui.ViewBase")
local MineCraftView = class("MineCraftView", ViewBase)

local MineCraftHelper = require("app.scene.view.mineCraft.MineCraftHelper")
local TextHelper = require("app.utils.TextHelper")
local ParameterIDConst = require("app.const.ParameterIDConst")
local GrainCarConfigHelper = require("app.scene.view.grainCar.GrainCarConfigHelper") 
local GrainCarDataHelper = require("app.scene.view.grainCar.GrainCarDataHelper")
local GrainCarConst = require("app.const.GrainCarConst")
local GrainCarRoute = require("app.scene.view.grainCar.GrainCarRoute")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local Avatar = require("app.config.avatar")
local AudioConst = require("app.const.AudioConst")

MineCraftView.SCALE_AVATAR = 0.5
MineCraftView.AVATAR_POS_FIX = cc.p(60, -40)
MineCraftView.CAR_AVATAR_POS_FIX = cc.p(60, -40) --粮车修正坐标值
MineCraftView.CAR_AVATAR_POS_FIX_110 = cc.p(-60, -140) --粮车修正坐标值
MineCraftView.CAR_AVATAR_POS_FIX_210 = cc.p(-60, -40) --粮车修正坐标值
MineCraftView.CAR_AVATAR_WIDTH = 130 --粮车宽

MineCraftView.ACTOR_SPEED = 5
MineCraftView.GET_ICON_Y_FIX = 50

MineCraftView.DIE_TYPE_ENEMY = 1
MineCraftView.DIE_TYPE_SELF = 2
MineCraftView.DIE_TYPE_DOUBLE = 3

MineCraftView.SCROLL_TIME = 0.5

MineCraftView.SCALE_PERCENT = 0.9
MineCraftView.MOVE_AVATAR_MAX = 50

MineCraftView.MINE_ID_UP_MAX = 110   --最上面的矿id
MineCraftView.MINE_ID_LEFT_MAX = 210 --最左面的矿id

MineCraftView.GRANCAR_COUNTDOWN_TITLE_POSX_AFTER2230 = 232  --暗度陈仓倒计时标题
MineCraftView.GRANCAR_COUNTDOWN_LABEL_POSX_AFTER2230 = 50  --暗度陈仓倒计时
MineCraftView.GRANCAR_COUNTDOWN_TITLE_POSX_NORMAL = 300  --暗度陈仓倒计时标题
MineCraftView.GRANCAR_COUNTDOWN_LABEL_POSX_NORMAL = 314  --暗度陈仓倒计时


MineCraftView.CORPSE_FIX = {
   [1] = cc.p(50, 10),
   [2] = cc.p(120, -80),
   [3] = cc.p(-100, -60),
   [4] = cc.p(80, 10),
   [5] = cc.p(-80, 10)
}

local SchedulerHelper = require ("app.utils.SchedulerHelper")

function MineCraftView:waitEnterMsg(callBack)
	local function onMsgCallBack()
		callBack()
    end
    G_UserData:getMineCraftData():clearAllMineUser()
	G_UserData:getMineCraftData():c2sGetMineWorld()
    local signal = G_SignalManager:add(SignalConst.EVENT_GET_MINE_WORLD, onMsgCallBack)
    return signal
end

function MineCraftView:ctor(focusMine, openGrainCarDonate)

    --ui
    self._scrollMapBG = nil     --地图滚动层
    self._mineBaseNode = nil    --矿坑根节点
    self._topBar = nil 	        --顶部条
    self._heroAvatar = nil      --人物avatar
    self._focusedMineId = focusMine   --镜头聚焦矿
    self._bOpenGrainCarDonate = openGrainCarDonate   --是否打开粮车捐献对话框
    self._curBgm = AudioConst.MUSIC_BGM_NEW_CITY

    self._mapSize = cc.size(0, 0)       --大地图宽高

    --signals
    self._signalGetMineWorld = nil
    self._signalSettleMine = nil
    self._signalMineRespond = nil
    self._signalGetMineMoney = nil
    self._signalBattleMine = nil
    self._signalReConnect = nil
    self._signalFastBattle = nil
    self._signalRedPointUpdate = nil
    self._signalMineNotice = nil

    --是否在移动中
    self._ismoving = false
    self._outputMoney = 0   --产出银币
    self._mineGetMoneyIcon = nil

    self._lastUpdate = 0

    self._lastMineId = 0

    self._moveAvatars = {}          --可移动avatar数组
    self._moveCarsHashTable = {}    --可移动粮车数组 guildId - grainCarUnitData
    self._corpseAvatar = {}         --粮车尸体表
    self._frameGrainCar = 0

    self._lastDoubleActionTime = 0

    --矿区列表
    self._mines = {}

	local resource = {
		file = Path.getCSB("MineCraftView", "mineCraft"),
        size = G_ResolutionManager:getDesignSize(),
		binding = {
			_btnReport = 
			{
				events = {{event = "touch", method = "_onReportClick"}}
            },
            _btnMyPos = 
            {
                events = {{event = "touch", method = "_onMineClick"}}
            },
            _imageArmyBG = 
            {
                events = {{event = "touch", method = "_onAddArmyClick"}}
            },
            _btnPrivilege = 
            {
                events = {{event = "touch", method = "_onPrivilege"}}
            },
            _btnGrainCar = 
            {
                events = {{event = "touch", method = "_onGrainCarClick"}}
            },
		}
	}
    MineCraftView.super.ctor(self, resource)
end

function MineCraftView:onCreate()
    self._topBar:setImageTitle("txt_sys_com_mine")
    local TopBarStyleConst = require("app.const.TopBarStyleConst")
    self._topBar:updateUI(TopBarStyleConst.STYLE_MINE_CRAFT)
    self._btnPrivilege:setVisible(false)
    self._textPrivilegeTime:setVisible(false)
    self:_updatePrivilege()

    self:_createMapBG()
    self:_createMineNode()
    self:_createAvatar()

    self._btnReport:updateUI(FunctionConst.FUNC_MINE_REPORT)
    self._btnMyPos:updateUI(FunctionConst.FUNC_MINE_POS)
    self._btnRule:updateUI(FunctionConst.FUNC_MINE_CRAFT)
    self._btnPrivilege:updateUI(FunctionConst.FUNC_MINE_CRAFT_PRIVILEGE)
    self._btnGrainCar:updateUI(FunctionConst.FUNC_GRAIN_CAR_DONATE)

    if GrainCarConfigHelper.isTodayOpen() and GrainCarConfigHelper.isInActivityTime() then
        G_UserData:getGrainCar():c2sGetAllMoveGrainCar()
    end
end

function MineCraftView:onEnter()
    self._signalGetMineWorld = G_SignalManager:add(SignalConst.EVENT_GET_MINE_WORLD, handler(self, self._onEventGetMineWorld))
    self._signalSettleMine = G_SignalManager:add(SignalConst.EVENT_SETTLE_MINE, handler(self, self._onEventSettleMine))
    self._signalMineRespond = G_SignalManager:add(SignalConst.EVENT_GET_MINE_RESPOND, handler(self, self._onEventMineRespond))
    self._signalGetMineMoney = G_SignalManager:add(SignalConst.EVENT_GET_MINE_MONEY, handler(self, self._onEventGetMineMoney))
    self._signalBattleMine = G_SignalManager:add(SignalConst.EVENT_BATTLE_MINE, handler(self, self._onEventBattleMine))
    self._signalReConnect = G_SignalManager:add(SignalConst.EVENT_LOGIN_SUCCESS, handler(self, self._onEventFinishLogin))
    self._signalFastBattle = G_SignalManager:add(SignalConst.EVENT_FAST_BATTLE, handler(self, self._onEventFastBattle))
    self._signalRedPointUpdate  = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self,self._onEventRedPointUpdate))
    self._signalMineNotice = G_SignalManager:add(SignalConst.EVENT_MINE_NOTICE, handler(self, self._onEventMineNotice))
    self._signalUpdateTitleInfo =
        G_SignalManager:add(SignalConst.EVENT_UPDATE_TITLE_INFO, handler(self, self._onEventTitleChange)) -- 称号更新
    self._signalGetAllMoveCar =
        G_SignalManager:add(SignalConst.EVENT_GRAIN_CAR_GET_ALL_MOVE_CAR, handler(self, self._onEventGetAllGrainCar)) -- 获取全部粮车
    self._signalGrainCarMoveNotify =
        G_SignalManager:add(SignalConst.EVENT_GRAIN_CAR_MOVE_NOTIFY, handler(self, self._onEventMoveCarNotify)) -- 粮车进站变动通知
    self._signalGo2Mine =
        G_SignalManager:add(SignalConst.EVENT_GRAIN_CAR_GO2MINE, handler(self, self._onEventGo2Mine)) -- 镜头聚焦到某个矿
    self._signalChangeMine2Car =
        G_SignalManager:add(SignalConst.EVENT_GRAIN_CAR_CAR_INTO_MINE, handler(self, self._onEventChangeMine2Car)) -- 占矿界面换成粮车界面
    self._signalUpdateArmy =
        G_SignalManager:add(SignalConst.EVENT_GRAIN_CAR_UPDATE_ARMY, handler(self, self._onEventUpdateArmy)) -- 攻击粮车后 更新兵力值
    self._signalGrainCarNotify =
        G_SignalManager:add(SignalConst.EVENT_GRAIN_CAR_NOTIFY, handler(self, self._onEventGrainCarNotify)) -- 粮车信息更新
        
    self._scheduleHandler = SchedulerHelper.newSchedule(handler(self, self._update), 0.03)

    self:_refreshView()
    self:_refreshAvatar()
    if self._focusedMineId then
        self:_focusOnMine(self._focusedMineId)
    else
        self:_refreshViewPos(true)
    end
    if self._bOpenGrainCarDonate then
        G_SceneManager:showDialog("app.scene.view.grainCar.PopupGrainCarDonate")
    end

    self:_updateMyArmy()
    self:_updateInfame()

    self:_checkKillNotice()
    self:_onEventRedPointUpdate()

    local runningScene = G_SceneManager:getRunningScene()
    runningScene:addGetUserBaseInfoEvent()
    
    local time = G_ServerTime:getNextHourCount(12)
    self._textTime:setString(time)
    

    self:_grainCarProc()

    --服务器改成广播了，这边就不用刷了
    -- if not self._isFirstEnter then
    --     G_UserData:getMineCraftData():c2sGetMineWorld()
    -- end
    -- self._isFirstEnter = false
end

function MineCraftView:_updatePrivilege( ... )
    if self._btnPrivilege:isVisible() then
        if G_UserData:getMineCraftData():isSelfPrivilege() then
            self:_updateMyArmy()
            self._btnPrivilege:showRedPoint(G_UserData:getMineCraftData():isPrivilegeRedPoint())
            local leftSec = G_ServerTime:getLeftSeconds(G_UserData:getMineCraftData():getPrivilegeTime())
            self._textPrivilegeTime:setVisible(leftSec > 0)
            self._textPrivilegeTime:setString(G_ServerTime:getLeftDHMSFormatEx(G_UserData:getMineCraftData():getPrivilegeTime()))
        end
        return
    end

    local payCfg = MineCraftHelper.getPrivilegeVipCfg()
    local vipLimit = payCfg.vip_show
    local vipLevel = G_UserData:getVip():getLevel() or 0
    local bVisible = (vipLimit <= vipLevel)
    self._btnPrivilege:setVisible(bVisible)
end

function MineCraftView:onExit()
    self._signalGetMineWorld:remove()
    self._signalGetMineWorld = nil

    self._signalSettleMine:remove()
    self._signalSettleMine = nil

    self._signalMineRespond:remove()
    self._signalMineRespond = nil

    self._signalGetMineMoney:remove()
    self._signalGetMineMoney = nil
    
    self._signalBattleMine:remove()
    self._signalBattleMine = nil

    self._signalReConnect:remove()
    self._signalReConnect = nil

    self._signalFastBattle:remove()
    self._signalFastBattle = nil

    self._signalRedPointUpdate:remove()
    self._signalRedPointUpdate = nil

    self._signalMineNotice:remove()
    self._signalMineNotice = nil

    self._signalUpdateTitleInfo:remove()
    self._signalUpdateTitleInfo=nil
    
    self._signalGetAllMoveCar:remove()
    self._signalGetAllMoveCar=nil

    self._signalGrainCarMoveNotify:remove()
    self._signalGrainCarMoveNotify=nil

    self._signalGo2Mine:remove()
    self._signalGo2Mine=nil

    self._signalChangeMine2Car:remove()
    self._signalChangeMine2Car=nil

    self._signalUpdateArmy:remove()
    self._signalUpdateArmy=nil

    self._signalGrainCarNotify:remove()
    self._signalGrainCarNotify=nil

    if self._scheduleHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._scheduleHandler)
		self._scheduleHandler = nil
    end

    self:_stopGrainCarTimer()
    
    self:_stopUpdateInfame()

    G_BulletScreenManager:clearBulletLayer()
end

function MineCraftView:_checkKillNotice()
    local killType = G_UserData:getMineCraftData():getKillType()
    if killType ~= 0 then 
        local enemyDiePos = G_UserData:getMineCraftData():getTargetPos()
        local enemyMine = G_UserData:getMineCraftData():getMineConfigById(enemyDiePos)
        local enemyCity = ""
        if enemyMine then
            enemyCity= enemyMine.pit_name
        end

        local myData = G_UserData:getMineCraftData():getMyMineData()
        local myCityName = myData:getConfigData().pit_name

        if killType == MineCraftView.DIE_TYPE_ENEMY then 
            MineCraftHelper.openAlertDlg(Lang.get("fight_enemy_kill_title"), Lang.get("mine_enemy_kill_content", {city = enemyCity}))
        elseif killType == MineCraftView.DIE_TYPE_SELF then 
            MineCraftHelper.openAlertDlg(Lang.get("mine_self_kill_title"), Lang.get("mine_self_kill_content", {city = myCityName}))
        elseif killType == MineCraftView.DIE_TYPE_DOUBLE then 
            MineCraftHelper.openAlertDlg(Lang.get("mine_All_kill_title"), Lang.get("mine_All_kill_content", {city1 = enemyCity, city2 = myCityName}))
        end
    end
    G_UserData:getMineCraftData():setKillType(0)
end

--创建地图
function MineCraftView:_createMapBG()
    local innerContainer = self._scrollMapBG:getInnerContainer()
    --加入4副图片
    local pic1 = display.newSprite(Path.getStageBG("minebg3"))     --左下
    pic1:setAnchorPoint(cc.p(0, 0))
    pic1:setPosition(cc.p(0, 0))
    innerContainer:addChild(pic1)
    local size = pic1:getContentSize()

    local pic2 = display.newSprite(Path.getStageBG("minebg4"))     --右下
    pic2:setAnchorPoint(cc.p(0, 0))
    pic2:setPosition(cc.p(size.width, 0))
    innerContainer:addChild(pic2)
    size.width = size.width + pic2:getContentSize().width

    local pic3 = display.newSprite(Path.getStageBG("minebg1"))     --左上
    pic3:setAnchorPoint(cc.p(0, 0))
    pic3:setPosition(cc.p(0, size.height))
    innerContainer:addChild(pic3)
    size.height = size.height + pic3:getContentSize().height

    local pic4 = display.newSprite(Path.getStageBG("minebg2"))      --右上
    pic4:setAnchorPoint(cc.p(0, 0))
    pic4:setPosition(cc.p(pic3:getContentSize().width , pic1:getContentSize().height))
    innerContainer:addChild(pic4)

    --路线层
    self._grainCarRoute = GrainCarRoute.new()
    innerContainer:addChild(self._grainCarRoute)
    self._grainCarRoute:setPosition(cc.p(0, 0))

     --尸体层
     self._grainCarCorpse = cc.Node:create()
     innerContainer:addChild(self._grainCarCorpse)
     self._grainCarCorpse:setPosition(cc.p(0, 0))

    self._mineBaseNode = cc.Node:create()
    innerContainer:addChild(self._mineBaseNode)
    self._mineBaseNode:setPosition(cc.p(0, 0))
    self._mapSize = size
    -- size.width = size.width * MineCraftView.SCALE_PERCENT
    -- size.height = size.height * MineCraftView.SCALE_PERCENT
    local scaleSize = cc.size(size.width * MineCraftView.SCALE_PERCENT, size.height * MineCraftView.SCALE_PERCENT)
    self._scrollMapBG:setInnerContainerSize(scaleSize)
    innerContainer:setPosition(cc.p(0, 0))
    innerContainer:setScale(MineCraftView.SCALE_PERCENT)
    -- self._scrollMapBG:setInertiaScrollEnabled(false)

    
end

--创建地图节点
function MineCraftView:_createMineNode()
    local mineDataList = G_UserData:getMineCraftData():getMines()
    for _, v in pairs(mineDataList) do 
        local mineNode = require("app.scene.view.mineCraft.MineNode").new(v)
        self._mineBaseNode:addChild(mineNode)
        self._mines[v:getId()] = mineNode
        mineNode:updateUI()
    end

    self._mineGetMoneyIcon = require("app.scene.view.mineCraft.MineGetMoneyIcon").new()
    self._mineBaseNode:addChild(self._mineGetMoneyIcon)
    self._mineGetMoneyIcon:setVisible(false)
end

--创建地图人物
function MineCraftView:_createAvatar()
    local CSHelper = require("yoka.utils.CSHelper")
    self._heroAvatar =  CSHelper.loadResourceNode(Path.getCSB("CommonHeroAvatar", "common"))
    self._mineBaseNode:addChild(self._heroAvatar)
    local avatarId = G_UserData:getBase():getAvatar_base_id()
    local config = Avatar.get(avatarId)
    assert(config, "wront avatar id , avatarId")
    local limit = config.limit == 1 and 3
    self._heroAvatar:updateUI(G_UserData:getBase():getPlayerBaseId(), nil, nil, limit)
    self._heroAvatar:setScale(MineCraftView.SCALE_AVATAR)    
    --self._heroAvatar:turnBack()
    self:_showMineTitle()
end

-- 显示自己的称号
function MineCraftView:_showMineTitle()
    local PopupHonorTitleHelper = require("app.scene.view.playerDetail.PopupHonorTitleHelper")
    local titleItem=PopupHonorTitleHelper.getEquipedTitle()
    local titleId=titleItem and titleItem:getId() or 0
    self._heroAvatar:showTitle(titleId,self.__cname)
end

function MineCraftView:_onEventTitleChange()
    self:_showMineTitle()
end

--获得地图信息
function MineCraftView:_onEventGetMineWorld(eventName, message)
    if not self._ismoving then 
        self:_refreshView()
    end
end

--移动
function MineCraftView:_onEventSettleMine()
    self._roads = G_UserData:getMineCraftData():getRoads()
    self:_movebyPath()

    local startMineId = self._roads[1]
    local targetMineId = self._roads[#self._roads]
    self:_refreshCarPosInMineWithMineId(startMineId)
    self:_refreshCarPosInMineWithMineId(targetMineId)
end

--移动
function MineCraftView:_movebyPath()
    self._heroAvatar:setAction("run", true)
    self._ismoving = true
    self._moveIndex = 2
    -- local selfMineId = G_UserData:getMineCraftData():getSelfMineId() 
    self:_setSingleRoadConfig(self._roads[1], self._roads[self._moveIndex])
end

--单条线路移动
function MineCraftView:_setSingleRoadConfig(minPit1, minPit2)
    local midPoints = G_UserData:getMineCraftData():getMidPoints()
    local midPoint = midPoints[minPit1..minPit2]
    if not midPoint then 
        midPoint = midPoints[minPit2..minPit1]
    end
    assert(midPoint, "not midPoint between "..minPit1.."and"..minPit2)
    local startData = G_UserData:getMineCraftData():getMineDataById(minPit1):getConfigData()
    local startPos = cc.p(startData.x, startData.y)
    
    local endData = G_UserData:getMineCraftData():getMineDataById(minPit2):getConfigData()
    local endPos = cc.p(endData.x, endData.y)

    self._heroAvatar:setPosition(startPos)
    self._bezier = {
		cc.p(0, 0),
		cc.pSub(midPoint, startPos),
		cc.pSub(endPos, startPos),
    }
    self._maxdistance = cc.pGetDistance(startPos, endPos)
	self._distance = 0
    self._positionDelta = cc.pSub(endPos, startPos)
    self._startPos = startPos

    if endPos.x < startPos.x then 
		self._heroAvatar:turnBack()
	else 
		self._heroAvatar:turnBack(false)
	end
end

function MineCraftView:_actorMoving(f)
	self._distance = self._distance + MineCraftView.ACTOR_SPEED
	local t = self._distance / self._maxdistance
	t = t > 1 and 1 or t

	local posx, posy, angle = MineCraftHelper.getBezierPosition(self._bezier, t)
	local pos = cc.pAdd(self._startPos, cc.p(posx, posy))
    self._heroAvatar:setPosition(pos)
    self:_refreshViewPos()
	if t == 1 then
        if self._moveIndex == #self._roads then 
            self._ismoving = false
            self:_refreshView()
            self:_refreshAvatar()
            self:_popupSelfMine()
        else 
            self:_setSingleRoadConfig(self._roads[self._moveIndex], self._roads[self._moveIndex + 1])
            self._moveIndex = self._moveIndex + 1
        end
        
		-- self:_openPopupMine(self._targetId)
		-- self:_refreshUI()
		-- self._myAvatar:setAction("idle", true)
		-- self._myAvatar:turnBack()
	end
end

--
function MineCraftView:_update(f)
    if self._ismoving then 
        self:_actorMoving(f)
    end

    self._lastUpdate = self._lastUpdate + f 
	if self._lastUpdate > 1 then
		self:_updateMyMoney()
		-- self:_updateMoneyIcon()
		self._lastUpdate = 0
    end
    
    local curTime = G_ServerTime:getTime()
    if curTime - self._lastDoubleActionTime >= 10 then 
        self:_doDoubleIconsAnim()
        self._lastDoubleActionTime = curTime
    end

    local time = G_ServerTime:getNextHourCount(12)
    self._textTime:setString(time)
    self:_updatePrivilege()


    local bExist, mine = G_UserData:getMineCraftData():isExistPeaceMine()
    if bExist then
        self._textPeaceMine:setString(Lang.get("mine_peace_keep_time"))
        self._textTimePeace:setString(G_ServerTime:getLeftSecondsString(mine:getEndTime()))
    else
        self._textPeaceMine:setString(Lang.get("mine_peace_refresh_time"))
        local nextFreshTime = MineCraftHelper.getNextPeaceStartTime()
        self._textTimePeace:setString(G_ServerTime:getLeftSecondsString(nextFreshTime))
    end

    self:_updateCarPos(f)
end

function MineCraftView:_doDoubleIconsAnim()
    for i, v in pairs(self._mines) do 
        v:doDoubleAnim()
    end
end

--跟新人物坐标
function MineCraftView:_refreshAvatar()
    local selfMine = G_UserData:getMineCraftData():getMyMineData()
    local config = selfMine:getConfigData()
    local position = cc.p(config.x - MineCraftView.AVATAR_POS_FIX.x, config.y + MineCraftView.AVATAR_POS_FIX.y)
    self._heroAvatar:setPosition(position)
    --self._heroAvatar:turnBack()
    self._heroAvatar:setAction("idle", true)
end

--更新地图坐标，把avatar放在界面中央, 参数是否把矿放中心
function MineCraftView:_refreshViewPos(isMinePos, needSlow)

    local size = G_ResolutionManager:getDesignCCSize()
    local width = size.width / 2
    local height = size.height / 2

    local avatarX, avatarY 
    if isMinePos then 
        local selfMine = G_UserData:getMineCraftData():getMyMineData()
        local config = selfMine:getConfigData()
        avatarX = config.x
        avatarY = config.y
    else
        avatarX, avatarY= self._heroAvatar:getPosition()
    end

    local mapY = 0
    if avatarY < height then 
        mapY = 0
    elseif avatarY + height > self._mapSize.height then 
        mapY = -self._mapSize.height + height*2
    else 
        mapY = -avatarY + height
    end

    local mapX = 0
    if avatarX < width then 
        mapX = 0
    elseif avatarX + width > self._mapSize.width then 
        mapX = -self._mapSize.width + width*2
    else 
        mapX = -avatarX + width
    end

    local xxx = (-mapX) / (self._mapSize.width - width*2) * 100
    local yyy = 100 - (-mapY) / (self._mapSize.height - height*2) * 100
    if not needSlow then 
        self._scrollMapBG:jumpToPercentBothDirection(cc.p(xxx, yyy))
    else
        self._scrollMapBG:scrollToPercentBothDirection(cc.p(xxx, yyy), MineCraftView.SCROLL_TIME, true)
    end
end

--刷新世界
function MineCraftView:_onEventMineRespond(eventName)
    if not self._ismoving then 
        self:_refreshView()
    end
end

--刷新世界地图
function MineCraftView:_refreshView()
    self:_refreshMyMoney()
    self:_updateMyMoney()
    -- self:_updateMoneyIcon()
    self:_updateMoneyIconPos()

    local mineDataList = G_UserData:getMineCraftData():getMines()
    for _, v in pairs(mineDataList) do 
        local mineNode = self._mines[v:getId()]
        mineNode:refreshData(v)
        mineNode:updateUI()
    end
    -- for i, v in pairs(self._mines) do 
    --     v:updateUI()
    -- end

    if self._lastMineId ~= G_UserData:getMineCraftData():getSelfMineId() then
        self:_refreshAvatar()
        self:_refreshViewPos(true)
        self._lastMineId = G_UserData:getMineCraftData():getSelfMineId()
    end
    self:_updateMyArmy()
    self:_updateInfame()
    -- self:_refreshAddBtn()
end

--刷新我的信息
function MineCraftView:_refreshMyMoney()
    self._outputMoney = MineCraftHelper.getSelfOutputSec()
end

--更新我的钱
function MineCraftView:_updateMyMoney()

    local moneyCount, moneyText, timePercent = MineCraftHelper.getMoneyDetail(self._outputMoney)
    self._mineGetMoneyIcon:setVisible(moneyCount >= 1)
    self._mineGetMoneyIcon:updateUI(moneyText)
    self._mineGetMoneyIcon:updateTimer(timePercent)
end

function MineCraftView:_updateMoneyIconPos()
    local selfMineData = G_UserData:getMineCraftData():getMyMineData()
    local config = selfMineData:getConfigData()
    self._mineGetMoneyIcon:setPosition(cc.p(config.x, config.y+MineCraftView.GET_ICON_Y_FIX))
end

--更新收获按钮
function MineCraftView:_onEventGetMineMoney(eventName, award)
    G_Prompt:showAwards(award)
    self._mineGetMoneyIcon:setVisible(false)
	-- self:_updateMoneyIcon()
end

--更新我的兵力
function MineCraftView:_updateMyArmy()
    local nowArmy = G_UserData:getMineCraftData():getMyArmyValue()
    local maxArmy = tonumber(require("app.config.parameter").get(ParameterIDConst.TROOP_MAX).content)
    if G_UserData:getMineCraftData():isSelfPrivilege() then
        local soilderAdd  = MineCraftHelper.getParameterContent(G_ParameterIDConst.MINE_CRAFT_SOILDERADD)
        maxArmy = (maxArmy + soilderAdd)
    end
    self._textSeflArmy:setString(nowArmy.." / "..maxArmy)
    
    self._barArmy:setVisible(false)
    self._barArmyY:setVisible(false)
    self._barArmyR:setVisible(false)
    local percent = nowArmy/maxArmy*100
    local armyBar = self._barArmy
    if percent < 25 then 
        armyBar = self._barArmyR
    elseif percent < 75 then 
        armyBar = self._barArmyY
    end

    armyBar:setPercent(nowArmy/maxArmy*100)
    armyBar:setVisible(true)

    self._nodeLessArmyInfo:setVisible(false)
    local myConfig = G_UserData:getMineCraftData():getMyMineConfig()
    if myConfig.pit_type == MineCraftHelper.TYPE_MAIN_CITY and nowArmy < MineCraftHelper.ARMY_TO_LEAVE then 
        self._nodeLessArmyInfo:setVisible(true)
    end
end

-- 更新我的恶名值
function MineCraftView:_updateInfame()
    local infameValue = G_UserData:getMineCraftData():getSelfInfamValue()
    self._curInfameValue = infameValue
    self:_updateInfameLabel()

    if self._curInfameValue > 0 then
        self:_stopUpdateInfame()
        self._scheduleInfameHandler = SchedulerHelper.newSchedule(handler(self, self._updateInfameTimer), 1)
        self:_updateInfameTimer()
    end
end

function MineCraftView:_updateInfameLabel()
    self._nodeInfame:setVisible(self._curInfameValue > 0)
    self._labelInfam:setString(self._curInfameValue)
end

function MineCraftView:_updateInfameTimer()
    local curTime = G_ServerTime:getTime()
    
    local infameValue = G_UserData:getMineCraftData():getSelfInfamValue()
    local bIsVip = G_ServerTime:getLeftSeconds(G_UserData:getMineCraftData():getPrivilegeTime()) > 0
    local REFRESH_TIME, NUM_PERCHANGE = MineCraftHelper.getInfameCfg(bIsVip) --每隔多少秒变化一次,每次变化数量
    local lastFreshTime = G_UserData:getMineCraftData():getSelfRefreshTime()
    local countChange = math.floor((curTime - lastFreshTime) / REFRESH_TIME)
    self._curInfameValue = infameValue - NUM_PERCHANGE * countChange
    self:_updateInfameLabel()
end

function MineCraftView:_stopUpdateInfame()
    if self._scheduleInfameHandler ~= nil then
        SchedulerHelper.cancelSchedule(self._scheduleInfameHandler)
        self._scheduleInfameHandler = nil
    end
end

--弹出个人所在矿区
function MineCraftView:_popupSelfMine()
    local GrainCarDataHelper = require("app.scene.view.grainCar.GrainCarDataHelper")
    local selfMineData = G_UserData:getMineCraftData():getMyMineData()
    local popupMine = G_SceneManager:getRunningScene():getPopupByName("PopupMine")
    local popupGrainCar = G_SceneManager:getRunningScene():getPopupByName("PopupGrainCar")
    if popupMine then
        popupMine:close()
    end
    if popupGrainCar then
        popupGrainCar:close()
    end
    if GrainCarDataHelper.haveCarInMineId(selfMineData:getId()) then
        G_SceneManager:showDialog("app.scene.view.grainCar.PopupGrainCar", nil, selfMineData:getId(), selfMineData)
    else
        G_SceneManager:showDialog("app.scene.view.mineCraft.PopupMine", nil, selfMineData:getId(), selfMineData)
    end
end

--攻击
function MineCraftView:_onEventBattleMine(eventName, message, target)

    local config = G_UserData:getMineCraftData():getMyMineData():getConfigData()
	local fightBG = config.battle_bg
    local mineFightData = 
	{
		star = message.self_star,
        myBeginArmy = message.self_begin_army,
        myEndArmy = message.self_begin_army - message.self_red_army,

        tarBeginArmy = message.tar_begin_army,
        tarEndArmy = message.tar_begin_army - message.tar_red_army,

        myBeginInfame = message.self_begin_infamy,
        myEndInfame = message.self_begin_infamy + message.self_infamy_add,

        tarBeginInfame = message.tar_begin_infamy,
        tarEndInfame = message.tar_begin_infamy - message.tar_infamy_desc,
    }
    
    if mineFightData.tarEndArmy <= 0 and mineFightData.myEndArmy <= 0 then 
        G_UserData:getMineCraftData():setKillType(MineCraftView.DIE_TYPE_DOUBLE)
    elseif mineFightData.tarEndArmy <= 0 then 
        G_UserData:getMineCraftData():setKillType(MineCraftView.DIE_TYPE_ENEMY)
    elseif mineFightData.myEndArmy <= 0 then 
        G_UserData:getMineCraftData():setKillType(MineCraftView.DIE_TYPE_SELF)
    end

    local function enterFightView(message)
        local ReportParser = require("app.fight.report.ReportParser")
        local battleReport = G_UserData:getFightReport():getReport()
        local reportData = ReportParser.parse(battleReport)
        local battleData = require("app.utils.BattleDataHelper").parseMineBattle(target, fightBG, mineFightData )
        G_SceneManager:showScene("fight", reportData, battleData)       
    end

    G_SceneManager:registerGetReport(message.battle_report, function() enterFightView(message, target, fightBG, mineFightData) end)
    
end

function MineCraftView:_onReportClick()
	G_SceneManager:showDialog("app.scene.view.mineCraft.PopupReport")
end

function MineCraftView:_onMineClick()
    self:_refreshViewPos(true, true)
end

function MineCraftView:_onAddArmyClick()
    local myConfig = G_UserData:getMineCraftData():getMyMineConfig()
    if myConfig.pit_type ~= MineCraftHelper.TYPE_MAIN_CITY then 
        G_Prompt:showTip(Lang.get("mine_cannot_buy"))
    elseif MineCraftHelper.getNeedArmy() <= 0 then 
        G_Prompt:showTip(Lang.get("mine_buy_army_full"))
    else
        local popupMineSweep = require("app.scene.view.mineCraft.PopupBuyArmy").new()
        popupMineSweep:openWithAction()
    end
end

function MineCraftView:_onPrivilege()
    G_SceneManager:showDialog("app.scene.view.mineCraft.PopupMineCraftPrivilege")
end

function MineCraftView:_onEventFinishLogin()
    G_UserData:getMineCraftData():clearAllMineUser()
    G_UserData:getMineCraftData():c2sGetMineWorld()
end

function MineCraftView:_onEventFastBattle(eventName, reportList)
    local popupMineSweep = require("app.scene.view.mineCraft.PopupMineSweep").new(reportList)
    popupMineSweep:openWithAction()
end

function MineCraftView:_onEventRedPointUpdate()
    local RedPointHelper = require("app.data.RedPointHelper")
    local newReport, count = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_MINE_CRAFT, "reportRP")
    -- self._btnReport:showRedPoint(newReport)
    self._imageRP:setVisible(newReport)
    self._textRPCount:setString(count)
end

function MineCraftView:_onEventMineNotice(eventName, user, oldMineId, newMineId)
    local avatar = self:_getMoveAvatar()
    if not avatar then 
        return 
    end

    local offLevel = tonumber(user.officer_level)
    local name = user.name
    local avatarId = user.avatar_base_id
    local baseId = user.leader
    -- logWarn("MineCraftView:_onEventMineNotice")
    -- dump(user)
    local limit = nil
    if avatarId ~= 0 then
        local configData = require("app.utils.data.AvatarDataHelper").getAvatarConfig(avatarId)
        baseId = configData.hero_id
        local isRed = configData.limit
        if isRed == 1 then 
            limit = 3
        end
    end
    local titleId = user.title or 0
    avatar:updateUI(baseId, name, offLevel, limit, titleId)
    avatar:setVisible(true)
    local mineData = G_UserData:getMineCraftData():getMineDataById(oldMineId)
    local config = mineData:getConfigData()
    local position = cc.p(config.x, config.y + MineCraftView.AVATAR_POS_FIX.y)
    avatar:setPosition(position)
    local path = MineCraftHelper.getRoad2(oldMineId, newMineId)
    table.insert(path, 1, oldMineId)
    self:_moveByPath(avatar, path)
end

function MineCraftView:_moveByPath(avatar, path)
    avatar:setAction("run", true)
    local actions = {}
    for i = 2, #path do 
        local minPit1 = path[i-1]
        local minPit2 = path[i]
        local midPoints = G_UserData:getMineCraftData():getMidPoints()
        local midPoint = midPoints[minPit1..minPit2]
        if not midPoint then 
            midPoint = midPoints[minPit2..minPit1]
        end
        local startData = G_UserData:getMineCraftData():getMineDataById(minPit1):getConfigData()
        local startPos = cc.p(startData.x, startData.y+MineCraftView.AVATAR_POS_FIX.y)

        local endData = G_UserData:getMineCraftData():getMineDataById(minPit2):getConfigData()
        local endPos = cc.p(endData.x, endData.y+MineCraftView.AVATAR_POS_FIX.y)

        local actionFunc = cc.CallFunc:create(function()     
            if endPos.x < startPos.x then 
                avatar:turnBack()
            else 
                avatar:turnBack(false)
            end
        end)
        local actionBezier = cc.BezierTo:create(1.5, {midPoint, endPos, endPos})
        local action = cc.Spawn:create(actionBezier, actionFunc)
        table.insert(actions, action)
    end
    local callBack = cc.CallFunc:create(function() avatar:setVisible(false) end)
    table.insert(actions, callBack)
    local action = cc.Sequence:create(actions)
    avatar:runAction(action)
end

function MineCraftView:_getMoveAvatar()
    for i, v in pairs(self._moveAvatars) do 
        if not v:isVisible() then 
            return v
        end
    end
    if #self._moveAvatars >= MineCraftView.MOVE_AVATAR_MAX then 
        return nil 
    end
    return self:_createMoveAvatar()
end

function MineCraftView:_createMoveAvatar()
    -- local CSHelper = require("yoka.utils.CSHelper")
    -- local heroAvatar = CSHelper.loadResourceNode(Path.getCSB("CommonHeroAvatar", "common"))
    local heroAvatar = require("app.scene.view.mineCraft.MineMoveAvatar").new()
    heroAvatar:setVisible(false)
    -- heroAvatar:setScale(MineCraftView.SCALE_AVATAR)
    self._mineBaseNode:addChild(heroAvatar)
    table.insert(self._moveAvatars, heroAvatar)
    return heroAvatar
end

------------------------------------------------------------------------------
------------------------------暗度陈仓-----------------------------------------
------------------------------------------------------------------------------
---------------------粮车相关----------------------
function MineCraftView:_getMoveCar(guildId)
    local carInfo = self._moveCarsHashTable["k"..guildId]
    if carInfo then
        -- local carAvatar = carInfo.car
        -- if not carAvatar:isVisible() then
        --     self._moveCarsHashTable["k"..guildId] = nil
        --     if #self._moveCarsHashTable >= MineCraftView.MOVE_AVATAR_MAX then 
        --         return nil 
        --     end
        --     return self:_createMoveCarInfo(guildId)
        -- end
        return carInfo
    end

    if #self._moveCarsHashTable >= MineCraftView.MOVE_AVATAR_MAX then 
        return nil 
    end
    return self:_createMoveCarInfo(guildId)
end

function MineCraftView:_createMoveCarInfo(guildId)
    print("MineCraftView:_createMoveCarInfo   guildId = " .. guildId)
    local carAvatar = require("app.scene.view.mineCraft.MineMoveCar").new()
    carAvatar:setVisible(false)
    self._mineBaseNode:addChild(carAvatar)
    local carInfo = {car = carAvatar, status = GrainCarConst.CAR_STATUS_UNKNOW}
    self._moveCarsHashTable["k"..guildId] = carInfo
    return carInfo
end

--复用
function MineCraftView:_reuseMoveCar(guildId)
    local carInfo = self._moveCarsHashTable["k"..guildId]
    if carInfo then
        -- carInfo.car:setVisible(false)
        carInfo.car:removeFromParent()
        self._moveCarsHashTable["k"..guildId] = nil
    end
end

-- 创建粮车尸体
function MineCraftView:_createCarCorpse()
    local corpseHashTable = G_UserData:getGrainCar():getGrainCarCorpseHashTable()
    for mineId, levels in pairs(corpseHashTable) do
        for level, carUnitList in pairs(levels) do
            local mineData = G_UserData:getMineCraftData():getMineDataById(mineId)
            local config = mineData:getConfigData()
            local carCorpse = require("app.scene.view.mineCraft.MineMoveCarCorpse").new()
            carCorpse:updateUIWithLevel(level)
            local posFix = MineCraftView.CORPSE_FIX[level]
            local position = cc.p(config.x + posFix.x, config.y + posFix.y)
            self._grainCarCorpse:addChild(carCorpse)
            carCorpse:setPosition(position)
            self:_addCorpseAvatar(mineId, level, carCorpse)
            --名字
            for i, carUnit in pairs(carUnitList) do
                carCorpse:addName(carUnit)
            end
        end
    end
end

-- function MineCraftView:_test(guild_id, mineId, level)
--     local GrainCarCorpseUnitData = require("app.data.GrainCarCorpseUnitData")
--     local unit = GrainCarCorpseUnitData.new()
--     local grainCarMsg = {
--                             grain_car_id = level,
--                             level = math.random(1, 3),
--                             guild_id = guild_id,
--                             mine_id = mineId,
--                             guild_name = "名字是六个字"
--                         }
--     unit:initData(grainCarMsg)
--     return unit
-- end

-- function MineCraftView:_test2()
--     for i = 101, 103 do
--         local unit2 = self:_test(i, 106, 2)
--         local unit3 = self:_test(i, 106, 3)
--         local unit4 = self:_test(i, 107, 4)
--         self:_addCarCorpse(unit2)
--         self:_addCarCorpse(unit3)
--         self:_addCarCorpse(unit4)
--     end
-- end

-- 更新粮车尸体
function MineCraftView:_addCarCorpse(carUnit)
    local mineId = carUnit:getCurPit()
    local level = carUnit:getLevel()
    local corpseHashTable = G_UserData:getGrainCar():getGrainCarCorpseHashTable()
    if corpseHashTable[mineId] and corpseHashTable[mineId][level] then
        local carList = corpseHashTable[mineId][level]
        if #carList >= GrainCarConst.MAX_CORPSE_EACH_LEVEL then
            return
        end
    end

    local carCorpse = self:_getCorpseAvatar(mineId, level)
    if carCorpse then
        carCorpse:addName(carUnit)
    else

        local mineData = G_UserData:getMineCraftData():getMineDataById(mineId)
        local config = mineData:getConfigData()
        local carCorpse = require("app.scene.view.mineCraft.MineMoveCarCorpse").new()
        carCorpse:updateUIWithLevel(level)
        local posFix = MineCraftView.CORPSE_FIX[level]
        local position = cc.p(config.x + posFix.x, config.y + posFix.y)
        self._grainCarCorpse:addChild(carCorpse)
        carCorpse:setPosition(position)
        self:_addCorpseAvatar(mineId, level, carCorpse)
        carCorpse:addName(carUnit)
    end
end

-- 添加粮车尸体avatar
function MineCraftView:_addCorpseAvatar(mineId, level, carCorpse)
    if not self._corpseAvatar[mineId] then
        self._corpseAvatar[mineId] = {}
    end
    self._corpseAvatar[mineId][level] = carCorpse
end

-- 获取粮车尸体avatar
function MineCraftView:_getCorpseAvatar(mineId, level)
    if self._corpseAvatar[mineId] and self._corpseAvatar[mineId][level] then
        return self._corpseAvatar[mineId][level]
    end
    return nil
end


--更新粮车位置
--    self:_updateGrainCarPos(210, 208, self._percent)
function MineCraftView:_updateGrainCarPos(carAvatar, minPit1, minPit2, percent)
    local midPoints = G_UserData:getMineCraftData():getMidPoints()
    local midPoint = midPoints[minPit1..minPit2]
    if not midPoint then 
        midPoint = midPoints[minPit2..minPit1]
    end
    assert(midPoint, "not midPoint between "..minPit1.."and"..minPit2)
    local startData = G_UserData:getMineCraftData():getMineDataById(minPit1):getConfigData()
    local startPos = cc.p(startData.x, startData.y)

    local endData = G_UserData:getMineCraftData():getMineDataById(minPit2):getConfigData()
    local endPos = cc.p(endData.x, endData.y)

    carAvatar:setPosition(startPos)

    local bezier =  {
            cc.p(0, 0),
            cc.pSub(midPoint, startPos),
            cc.pSub(endPos, startPos),
        }
    local posx, posy, angle = MineCraftHelper.getBezierPosition(bezier, percent)
	local pos = cc.pAdd(startPos, cc.p(posx, posy))
    carAvatar:setPosition(pos)

    if endPos.x < startPos.x then 
        carAvatar:turnBack()
    else 
        carAvatar:turnBack(false)
    end
end

--获取粮车位置
function MineCraftView:_grainCarProc()
    --尸体
    if GrainCarDataHelper.canShowCarCorpse() then
        self:_createCarCorpse()
    end

    self:_startGrainCarTimer()
    
    local BullectScreenConst = require("app.const.BullectScreenConst")
    G_BulletScreenManager:setBulletScreenOpen(BullectScreenConst.GRAIN_CAR_TYPE, true)

    if not GrainCarConfigHelper.isTodayOpen() then
        return
    end
    

    if GrainCarConfigHelper.isInActivityTime() and 
        not G_UserData:getGrainCar():isActivityOver() then
        G_AudioManager:playMusicWithId(AudioConst.SOUND_GRAIN_CAR_BGM)
        self._curBgm = AudioConst.SOUND_GRAIN_CAR_BGM
    end

    self:_updateGrainCarCountDown()
    self:_updateGrainCarBtn()
end

--获取全部粮车
function MineCraftView:_onEventGetAllGrainCar(eventName, grainCarList)
    for i, carUnitData in pairs(grainCarList) do
        local carInfo = self:_getMoveCar(carUnitData:getGuild_id())
        if carInfo then
            local carAvatar = carInfo.car
            carAvatar:updateUI(carUnitData)
            carAvatar:setVisible(true)
            if carUnitData:isReachTerminal() or carUnitData:isDead() then
                self:_reuseMoveCar(carUnitData:getGuild_id())
            else
                local pit1, pit2, percent = carUnitData:getCurCarPos()
                self:_updateGrainCarPos(carAvatar, pit1, pit2, percent)
                
                self._grainCarRoute:createRoute(carUnitData) 
            end

            ---更新站内粮车位置
            self:_refreshCarPosInMine(carUnitData, false)
        end
    end
end


--更新站内粮车位置
function MineCraftView:_refreshCarPosInMine(carUnit, bForceRefresh)
    local pit1, pit2, percent = carUnit:getCurCarPos()
    if bForceRefresh or carUnit:isStop() then
        self:_refreshCarPosInMineWithMineId(pit1)
    end
end

--更新某个矿内粮车位置
function MineCraftView:_refreshCarPosInMineWithMineId(mineId)
    --停留状态
    local offsetX = 0
    local selfMine = G_UserData:getMineCraftData():getMyMineData()
    if selfMine:getId() == mineId then
        offsetX = 90
    end
    
    local mineData = G_UserData:getMineCraftData():getMineDataById(mineId)
    local config = mineData:getConfigData()

    local carListSameMine = GrainCarDataHelper.getGuildCarInMineId(mineId)
    local posFix = MineCraftView.CAR_AVATAR_POS_FIX
    if mineId == MineCraftView.MINE_ID_UP_MAX then
        --最上面的矿
        posFix = MineCraftView.CAR_AVATAR_POS_FIX_110
    elseif mineId == MineCraftView.MINE_ID_LEFT_MAX then
        --最左面的矿
        posFix = MineCraftView.CAR_AVATAR_POS_FIX_210
    end

    --已经按离开时间排序过了
    for i = 1, #carListSameMine do
        local carUnit = carListSameMine[i]
        local position = cc.p(config.x - posFix.x - offsetX, 
                config.y + posFix.y)
        local carInfo = self:_getMoveCar(carUnit:getGuild_id())
        if carInfo then
            local carAvatar = carInfo.car
            carAvatar:setPosition(position)
            carAvatar:setGuildNameYWithIndex(i)
        end
    end
end

--更新暗度陈仓按钮
function MineCraftView:_updateGrainCarBtn()
    if G_UserData:getGuild():getMyGuildId() == 0 or 
        G_UserData:getGrainCar():isEmergencyClose() or 
        G_UserData:getGrainCar():isActivityOver() then
        self._btnGrainCar:setVisible(false)
        return
    end
    self._btnGrainCar:setVisible(GrainCarConfigHelper.isInActivityTimeFromGenerate())
    
    local RedPointHelper = require("app.data.RedPointHelper")
    local isShow = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_GRAIN_CAR, "mainRP")		
    self._btnGrainCar:showRedPoint(isShow)
end

--粮车update
function MineCraftView:_updateCarPos(f)
    if not GrainCarConfigHelper.isTodayOpen() or not GrainCarConfigHelper.isInActivityTime() then
        return
    end
    self._logTime = G_ServerTime:getMSTime()

    self._frameGrainCar = self._frameGrainCar + f
    if self._frameGrainCar > 2 * f then
        self._frameGrainCar = 0
    end
    local curFrame = self._frameGrainCar / f
    local grainCarList = G_UserData:getGrainCar():getGrainCarList()
    local carCount = #grainCarList
    for i, carUnitData in pairs(grainCarList) do
        if carCount > 15 then
            if i % 3 == curFrame then
                self:_updateCarUnit(carUnitData)
            end
        else
            self:_updateCarUnit(carUnitData)
        end
    end
end

--更新carUnit
function MineCraftView:_updateCarUnit(carUnitData)
    if carUnitData:isReachTerminal() or carUnitData:isDead() then
        self:_reuseMoveCar(carUnitData:getGuild_id())
        -- self._grainCarRoute:removeRoute(carUnitData)
    else
        local carInfo = self:_getMoveCar(carUnitData:getGuild_id())
        if carInfo then
            local carAvatar = carInfo.car
            carAvatar:setVisible(true)
            local pit1, pit2, percent = carUnitData:getCurCarPos()
            --这里不重复调用 carUnitData:isOnWay()
            if percent > 0 and percent < 1 then
                if carInfo.status ~= GrainCarConst.CAR_STATUS_RUN then
                    --在路上
                    carAvatar:updateUI(carUnitData)
                    carInfo.status = GrainCarConst.CAR_STATUS_RUN
                    carAvatar:playRun()
                    carAvatar:resetGuildNamePos()
                    self:_refreshCarPosInMineWithMineId(pit1)
                end
                self._grainCarRoute:updateArrow(carUnitData, percent)
            else
                if carInfo.status ~= GrainCarConst.CAR_STATUS_IDLE then
                    carInfo.status = GrainCarConst.CAR_STATUS_IDLE
                    carAvatar:updateUI(carUnitData)
                    carAvatar:playIdle()
                    -- self:_refreshCarPosInMineWithMineId(pit1)
                    -- self:_refreshCarPosInMineWithMineId(pit2)
                end
            end
            if carInfo.status == GrainCarConst.CAR_STATUS_RUN then
                self:_updateGrainCarPos(carAvatar, pit1, pit2, percent)
            end
        end
    end
end

--聚焦到指定矿
function MineCraftView:_focusOnMine(mineId) 
    local size = G_ResolutionManager:getDesignCCSize()
    local width = size.width / 2
    local height = size.height / 2

    local mineData = G_UserData:getMineCraftData():getMineDataById(mineId)
    if not mineData then
        return
    end
    local config = mineData:getConfigData()
    local avatarX = config.x
    local avatarY = config.y

    local mapY = 0
    if avatarY < height then 
        mapY = 0
    elseif avatarY + height > self._mapSize.height then 
        mapY = -self._mapSize.height + height*2
    else 
        mapY = -avatarY + height
    end

    local mapX = 0
    if avatarX < width then 
        mapX = 0
    elseif avatarX + width > self._mapSize.width then 
        mapX = -self._mapSize.width + width*2
    else 
        mapX = -avatarX + width
    end

    local xxx = (-mapX) / (self._mapSize.width - width*2) * 100
    local yyy = 100 - (-mapY) / (self._mapSize.height - height*2) * 100
    self._scrollMapBG:jumpToPercentBothDirection(cc.p(xxx, yyy))
end


function MineCraftView:_startGrainCarTimer()
    if not self._scheduleGrainCarHandler then
        self._scheduleGrainCarHandler = SchedulerHelper.newSchedule(handler(self, self._grainCarTimer), 1)
        self:_grainCarTimer()
    end
end

function MineCraftView:_stopGrainCarTimer()
    if self._scheduleGrainCarHandler ~= nil then
        SchedulerHelper.cancelSchedule(self._scheduleGrainCarHandler)
        self._scheduleGrainCarHandler = nil
    end
end

--设置倒计时类型 
--param type 0：默认 1：暗度陈仓
function MineCraftView:_setCountDownType(type)
    self._textRichMine:setVisible(type == 0)
    self._textTime:setVisible(type == 0)
    self._textPeaceMine:setVisible(type == 0)
    self._textTimePeace:setVisible(type == 0)
    self._textGrainCar:setVisible(type ~= 0)
    self._textTimeGrainCar:setVisible(type ~= 0)
    self._textGrainCar:setPositionX(MineCraftView.GRANCAR_COUNTDOWN_TITLE_POSX_NORMAL)
    self._textTimeGrainCar:setPositionX(MineCraftView.GRANCAR_COUNTDOWN_LABEL_POSX_NORMAL)
end

--更新暗度陈仓倒计时
function MineCraftView:_updateGrainCarCountDown()
    if not GrainCarConfigHelper.isTodayOpen() then
        self:_setCountDownType(0)
        return
    end
    local endTime = GrainCarConfigHelper.getGrainCarEndTimeStamp()
    if GrainCarConfigHelper.isInActivityTime() then
        if GrainCarConfigHelper.isInLaunchTime() then
            --22:00 到 22:30
            self:_setCountDownType(1)
            self._textTimeGrainCar:setString(G_ServerTime:getLeftSecondsString(endTime))
        else
            --22:30 到 22:40
            if G_UserData:getGrainCar():isActivityOver() then
                self:_setCountDownType(0)
            else
                self:_setCountDownType(1)
                self._textTimeGrainCar:setString(Lang.get("grain_car_minecraft_wait_over"))
                self._textTimeGrainCar:setPositionX(MineCraftView.GRANCAR_COUNTDOWN_LABEL_POSX_AFTER2230)
                self._textGrainCar:setVisible(false)
            end
        end
    else
        self:_setCountDownType(0)
    end
end


------------------------------------------------------
------------------------回调--------------------------
------------------------------------------------------
--暗度陈仓活动按钮
function MineCraftView:_onGrainCarClick()
    local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
    WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_GRAIN_CAR)
end

--粮车进站变动通知
function MineCraftView:_onEventMoveCarNotify(eventName, newCarUnit)
    self._grainCarRoute:createRoute(newCarUnit) 
    self:_refreshCarPosInMine(newCarUnit, true)
    
	self._grainCarRoute:removePassed(newCarUnit)
end

--镜头聚焦到某个矿
function MineCraftView:_onEventGo2Mine(eventName, mineId)
    self:_focusOnMine(mineId)
end

--占矿界面换成粮车界面
function MineCraftView:_onEventChangeMine2Car(eventName, mineData)
    G_SceneManager:showDialog("app.scene.view.grainCar.PopupGrainCar", nil, mineData:getId(), mineData)
end

--攻击粮车后 更新兵力值
function MineCraftView:_onEventUpdateArmy(eventName)
    self:_updateMyArmy()
end

--粮车信息变更通知
function MineCraftView:_onEventGrainCarNotify(eventName, carUnit)
    if carUnit then
        local carInfo = self._moveCarsHashTable["k"..carUnit:getGuild_id()]
        if carInfo then
            local carAvatar = carInfo.car
            carAvatar:updateUI(carUnit)
        end
    end

    if carUnit and carUnit:getStamina() == 0 then
        self:_refreshCarPosInMine(carUnit, true)
        self._grainCarRoute:removeRoute(carUnit)
        self:_addCarCorpse(carUnit)
    end
end

--暗度陈仓schedule
function MineCraftView:_grainCarTimer()
    if GrainCarConfigHelper.isTodayOpen() and 
        GrainCarConfigHelper.isInActivityTime() and 
        not G_UserData:getGrainCar():isActivityOver() then
            if self._curBgm ~= AudioConst.SOUND_GRAIN_CAR_BGM then
                G_AudioManager:playMusicWithId(AudioConst.SOUND_GRAIN_CAR_BGM)
                self._curBgm = AudioConst.SOUND_GRAIN_CAR_BGM
            end
    else
        if self._curBgm ~= AudioConst.MUSIC_BGM_NEW_CITY then
            G_AudioManager:playMusicWithId(AudioConst.MUSIC_BGM_NEW_CITY)
            self._curBgm = AudioConst.MUSIC_BGM_NEW_CITY
       end
    end

    self:_updateGrainCarCountDown()
    self:_updateGrainCarBtn()

    self._grainCarCorpse:setVisible(GrainCarDataHelper.canShowCarCorpse())
end

return MineCraftView