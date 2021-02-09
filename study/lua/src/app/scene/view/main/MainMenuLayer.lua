--按钮层,主界面的按钮有该层处理
local ViewBase = require("app.ui.ViewBase")
local MainMenuLayer = class("MainMenuLayer", ViewBase)
local FunctionConst = require("app.const.FunctionConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local RedPointHelper = require("app.data.RedPointHelper")
local DataConst = require("app.const.DataConst")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local SeasonSportHelper = require("app.scene.view.seasonSport.SeasonSportHelper")
local GuildCrossWarHelper = require("app.scene.view.guildCrossWar.GuildCrossWarHelper")
local HomelandBuffIcon = require("app.scene.view.homeland.HomelandBuffIcon")
local SchedulerHelper = require("app.utils.SchedulerHelper")
local Queue = require("app.utils.Queue")

MainMenuLayer.ICON_INTERVAL = 45+10
MainMenuLayer.ICON_SIZE = 90

MainMenuLayer.RIGHT_TOP_ICON_INTERVAL = 82 -- 67

MainMenuLayer.TIP_FONT_SIZE = 16
MainMenuLayer.TIP_POSITION = cc.p(0, -30-14)
MainMenuLayer.TIP_COLOR = cc.c3b(0, 0xff, 0)
MainMenuLayer.TIP_OUTLINE_COLOR = cc.c3b(0, 0, 0)
--左下按钮
MainMenuLayer.LEFT_BOTTOM_ICON = {
    {funcId = FunctionConst.FUNC_TEAM},
    {funcId = FunctionConst.FUNC_HERO_LIST},
    {funcId = FunctionConst.FUNC_EQUIP_LIST},
    {funcId = FunctionConst.FUNC_TREASURE_LIST},
    {funcId = FunctionConst.FUNC_INSTRUMENT_LIST},
    {funcId = FunctionConst.FUNC_DRAW_HERO},
    {funcId = FunctionConst.FUNC_ITEM_BAG},
    {funcId = FunctionConst.FUNC_PET_HOME},
    {funcId = FunctionConst.FUNC_HORSE},
    {funcId = FunctionConst.FUNC_TACTICS},      -- 战法
    {funcId = FunctionConst.FUNC_BOUT},
    -- { funcId = FunctionConst.FUNC_MAUSOLEUM},
}

--左下按钮80级以后
MainMenuLayer.LEFT_BOTTOM_ICON_LV80 = {
    {funcId = FunctionConst.FUNC_TEAM},
    {funcId = FunctionConst.FUNC_HERO_LIST},
    {funcId = FunctionConst.FUNC_DRAW_HERO},
    {funcId = FunctionConst.FUNC_ITEM_BAG},
    {funcId = FunctionConst.FUNC_PET_HOME},
    {funcId = FunctionConst.FUNC_HORSE}
    -- { funcId = FunctionConst.FUNC_MAUSOLEUM},
}

--主界面icon合并后
MainMenuLayer.LEFT_BOTTOM_ICON_MERGE = {
    {funcId = FunctionConst.FUNC_TEAM},
    {funcId = FunctionConst.FUNC_HERO_LIST},
    {funcId = FunctionConst.FUNC_DRAW_HERO},
    {funcId = FunctionConst.FUNC_ICON_MERGE},
    {funcId = FunctionConst.FUNC_PET_HOME},
    {funcId = FunctionConst.FUNC_HORSE},
    {funcId = FunctionConst.FUNC_TACTICS},      -- 战法
    {funcId = FunctionConst.FUNC_BOUT},
}

--右上按钮第一排
MainMenuLayer.RIGHT_TOP_ICON_A1 = {
    {funcId = FunctionConst.FUNC_ACTIVITY},
    {funcId = FunctionConst.FUNC_CARNIVAL_ACTIVITY},
    {funcId = FunctionConst.FUNC_WELFARE},
    -- 充值，replaceFuncIds替换功能为更换图标的充值
    {funcId = FunctionConst.FUNC_RECHARGE, replaceFuncIds = {{funcId = FunctionConst.FUNC_JADE2}}},
    {funcId = FunctionConst.FUNC_VIP_GIFT},
    {funcId = FunctionConst.FUNC_FIRST_RECHARGE},
    {funcId = FunctionConst.FUNC_AUCTION},
    {funcId = FunctionConst.FUNC_WORLD_BOSS}, --世界Boss
    {funcId = FunctionConst.FUNC_GUILD_ANSWER}, --军团答题
    {funcId = FunctionConst.FUNC_GUILD_SERVER_ANSWER}, -- 全服答题
    {funcId = FunctionConst.FUNC_GUILD_DUNGEON}, --军团副本
    {funcId = FunctionConst.FUNC_RECHARGE_REBATE}, --充值返利
    {funcId = FunctionConst.FUNC_COUNTRY_BOSS}, --三国战纪
    {funcId = FunctionConst.FUNC_CAMP_RACE}, --阵营竞技
    {funcId = FunctionConst.FUNC_RUNNING_MAN}, --跑男系统
    {funcId = FunctionConst.FUNC_GUILD_WAR}, --军团战
    {funcId = FunctionConst.FUNC_GACHA_GOLDENHERO}, --金将招募
    {funcId = FunctionConst.FUNC_CAKE_ACTIVITY}, --蛋糕活动
    {funcId = FunctionConst.FUNC_GRAIN_CAR}, --暗度陈仓
    {funcId = FunctionConst.FUNC_CROSS_WORLD_BOSS}, --跨服军团Boss
}

--右上按钮第二排
MainMenuLayer.RIGHT_TOP_ICON_A2 = {
    {funcId = FunctionConst.FUNC_RED_PET}, --红神兽
    {funcId = FunctionConst.FUNC_WEEK_ACTIVITY}, --七日活动
    {funcId = FunctionConst.FUNC_DAILY_MISSION}, --任务
    {funcId = FunctionConst.FUNC_CRYSTAL_SHOP}, --水晶商店
    {funcId = FunctionConst.FUNC_LINKAGE_ACTIVITY}, --手杀联动 （三国杀）
    {funcId = FunctionConst.FUNC_LINKAGE_ACTIVITY2},
    --手杀联动 （三国杀online）
    {funcId = FunctionConst.FUNC_CAMP_RACE_CHAMPION}, --阵营竞技新人王
    {funcId = FunctionConst.FUNC_AVOID_GAME}, --防沉迷
    {funcId = FunctionConst.FUNC_SUPER_VIP}, --超级VIP
    {funcId = FunctionConst.FUNC_SUPER_VIP_2}, --超级VIP样式2
    {funcId = FunctionConst.FUNC_OPPO_FORUM}, --oppo社区
    {funcId = FunctionConst.FUNC_GROUPS}, --组队
    {funcId = FunctionConst.FUNC_SEASONSOPRT}, -- 无差别竞技
    {funcId = FunctionConst.FUNC_SINGLE_RACE}, -- 跨服个人竞技
    {funcId = FunctionConst.FUNC_SINGLE_RACE_CHAMPION}, -- 跨服个人竞技冠军
    -- {funcId = FunctionConst.FUNC_HISTORY_HERO}, -- 历代名将
    {funcId = FunctionConst.FUNC_RETURN},
    {funcId = FunctionConst.FUNC_GUILD_CROSS_WAR},
    {funcId = FunctionConst.FUNC_UNIVERSE_RACE}, -- 真武战神
    {funcId = FunctionConst.FUNC_UNIVERSE_RACE_CHAMPION}, -- 真武战神冠军
    {funcId = FunctionConst.FUNC_TEN_JADE_AUCTION}, -- 跨服拍卖
	{funcId = FunctionConst.FUNC_RETURN_CONFIRM}, --回归服-回归确认
    {funcId = FunctionConst.FUNC_RETURN_AWARD}, --回归服-返利
    {funcId = FunctionConst.FUNC_TSHIRT}, --周年T恤
}

--右下第二排按钮 征战按钮上面
MainMenuLayer.RIGHT_BOTTOM_ICON_A2 = {
    {funcId = FunctionConst.FUNC_TRAVEL}, --游历
    {funcId = FunctionConst.FUNC_MINE_CRAFT}, --矿战
    {funcId = FunctionConst.FUNC_HOMELAND} --家园
}

--更多按钮
MainMenuLayer.MORE_ICON = {
    {funcId = FunctionConst.FUNC_HAND_BOOK},
    -- { funcId = FunctionConst.FUNC_FRIEND },
    {funcId = FunctionConst.FUNC_RANK},
    -- { funcId = FunctionConst.FUNC_ACHIEVEMENT },
    {funcId = FunctionConst.FUNC_OFFICIAL},
    {funcId = FunctionConst.FUNC_RECYCLE},
    {funcId = FunctionConst.FUNC_CONVERT},
    {funcId = FunctionConst.FUNC_GIFT_ECHANGE},
    {funcId = FunctionConst.FUNC_BECOME_STRONGER},
    {funcId = FunctionConst.FUNC_FRIEND},
    {funcId = FunctionConst.FUNC_TEAM_SUGGEST},
    {funcId = FunctionConst.FUNC_MAIL},
    {funcId = FunctionConst.FUNC_SYNTHESIS},
    {funcId = FunctionConst.FUNC_SYSTEM_SET},
    {funcId = FunctionConst.FUNC_AVATAR_MORE_BTN},
    {funcId = FunctionConst.FUNC_RICH_MAN_INFO_COLLECT},
}

--背包合并按钮
MainMenuLayer.BAG_MERGE = {
    {funcId = FunctionConst.FUNC_ITEM_BAG2},
    {funcId = FunctionConst.FUNC_EQUIP_LIST},
    {funcId = FunctionConst.FUNC_TREASURE_LIST},
    {funcId = FunctionConst.FUNC_INSTRUMENT_LIST},
}

--OtherList
MainMenuLayer.OTHER_ICON = {
    --左上
    {funcId = FunctionConst.FUNC_MORE},
    {funcId = FunctionConst.FUNC_SHOP_SCENE},
    {funcId = FunctionConst.FUNC_MAIN_STRONGER},
    ---------------
    --右下
    {funcId = FunctionConst.FUNC_ADVENTURE},
    {funcId = FunctionConst.FUNC_ARMY_GROUP},
    --{ funcId = FunctionConst.FUNC_TRAVEL },
    {funcId = FunctionConst.FUNC_INDULGE}
    -- { funcId = FunctionConst.FUNC_MINE_CRAFT },
}

MainMenuLayer.FUNC_VIEW = {
    {funcId = FunctionConst.FUNC_CHAT}
}
--领地
MainMenuLayer.FUNC_TERRITORY = {
    {funcId = FunctionConst.FUNC_PATROL_AWARDS},
    {funcId = FunctionConst.FUNC_RIOT_AWARDS},
    {funcId = FunctionConst.FUNC_RIOT_HAPPEN},
    {funcId = FunctionConst.FUNC_RIOT_HELP},
    {funcId = FunctionConst.FUNC_MAIL_RED},
    {funcId = FunctionConst.FUNC_ACTIVITY_RESOURCE_BACK},
    {funcId = FunctionConst.FUNC_ENEMY_REVENGE_LOG},
    {funcId = FunctionConst.FUNC_CHAPTER_BOSS},
    {funcId = FunctionConst.FUNC_RED_PACKET_RAIN},
}

function MainMenuLayer:getParameter(keyIndex)
    local parameter = require("app.config.parameter")
    for i = 1, parameter.length() do
        local itemData = parameter.indexOf(i)
        if itemData.key == keyIndex then
            return itemData.content
        end
    end
    assert(false, " can't find key index in Parameter " .. keyIndex)
    return nil
end

function MainMenuLayer:ctor()
    self._commonHeroIcon = nil
    self._panelDesign = nil
    self._heroAvatar1 = nil
    self._menusMapData = {}
    self._redDotMap = {}

    self._btnMap = {}
    self._viewMapData = {}
    --CC_DESIGN_RESOLUTION.width, CC_DESIGN_RESOLUTION.height
    local resource = {
        file = Path.getCSB("MainMenuLayer", "main"),
        size = G_ResolutionManager:getDesignSize(),
        binding = {
            -- _btnMainFight = {
            --     events = {{event = "touch", method = "_onFightBtn"}}
            -- },
            _panelInfo = {
                events = {{event = "touch", method = "_onClickPanelInfo"}}
            }
        }
    }

    self:setName("MainMenuLayer")
    MainMenuLayer.super.ctor(self, resource)
    self._cacheReset = Queue.new() --缓存 重置按钮
end

function MainMenuLayer:onCreate()
    --G_ResolutionManager:doLayout(self._panelDesign)
    local panelMore = self._panelDesign:getSubNodeByName("Panel_more")
    self._morePanel = panelMore
    self._morePanel:setScale(0)
    self._morePanel:setVisible(false)

    self._panelDesign:setTouchEnabled(true)
    self._panelDesign:setSwallowTouches(false)
    self._panelDesign:addTouchEventListener(handler(self, self._onPanelConTouch))

    self._imagePlayerBg:ignoreContentAdaptWithSize(true)
    self._imagePlayer:ignoreContentAdaptWithSize(true)

    self._homelandBuff = HomelandBuffIcon.new(self._btnBuff)

    self:_setRedDotData(
        self._btnMainFight:getSubNodeByName("RedPoint"),
        FunctionConst.FUNC_NEW_STAGE,
        self._btnMainFight
    )
    -- self:_setRedDotData(
    --     self._commonHeroIcon:getSubNodeByName("RedPoint"),
    --     FunctionConst.FUNC_TITLE,
    --     self._commonHeroIcon
    -- )

    -- self:_setRedDotData(
    --     self._headFrame:getSubNodeByName("RedPoint"),
    --     FunctionConst.FUNC_HEAD_FRAME,
    --     self._headFrame
    --     )

    self:_initFuncMap()

    self:_createUIGuideRoot()

    local UIGuideConst = require("app.const.UIGuideConst")
    self._btnMainFight:setLocalZOrder(10000)
    self._uiGuideRootNode:bindUIGuide(UIGuideConst.GUIDE_TYPE_MAIN_CITY_FIGHT, 0, self._btnMainFight)
    self._btnMainFight:addClickEventListenerEx(handler(self, self._onFightBtn), nil, 1000) --点击间隔改成1秒
    --G_UserData:getRunningMan():makePlayHourseInfo()

    self:_setOtherBtnCallback()
    self:_initBagMergePanel()
end

--初始化背包合并
function MainMenuLayer:_initBagMergePanel()
    self._panelBag:setScale(0)
    self._panelBag:setVisible(false)
end

function MainMenuLayer:_createUIGuideRoot()
    local UIGuideConst = require("app.const.UIGuideConst")
    local UIGuideRootNode = require("app.scene.view.uiguide.UIGuideRootNode")
    if not self._uiGuideRootNode then
        self._uiGuideRootNode = UIGuideRootNode.new()
        self:addChild(self._uiGuideRootNode)
    end
end

function MainMenuLayer:updateAll()
    logWarn("MainMenuLayer:updateAll")
    self:_updateRoleInfo()
    self:_resetButtons()
    self:_resetRedIcon()
    self:_updateHeroAvatar()
    self._nextFunctionOpen:updateUI()
end
-- 特殊处理
function MainMenuLayer:_getEffectSMovingCanPlay(funcId)
    --特殊处理 世界boss 倒计时5分钟前 不显示特效
    if
        funcId == FunctionConst.FUNC_WORLD_BOSS or funcId == FunctionConst.FUNC_GUILD_ANSWER or
            funcId == FunctionConst.FUNC_GUILD_DUNGEON or
            funcId == FunctionConst.FUNC_RUNNING_MAN or
            funcId == FunctionConst.FUNC_GUILD_WAR
     then
        local curFuncId, _, _, isNeedShowEffect = G_UserData:getLimitTimeActivity():getCurMainMenuLayerActivityIcon()
        if curFuncId == funcId and isNeedShowEffect then
            return true
        else
            return false
        end
    end

    return true
end

function MainMenuLayer:_playBtnEffect()
    for key, value in pairs(self._menusMapData) do
        if value and value.node then
            local funcInfo = value.cfg
            if self:_getEffectSMovingCanPlay(funcInfo.function_id) then
                value.node:playBtnMoving()
            end
        end
    end
end

function MainMenuLayer:_delayResetButtons(param)
    self._cacheReset:push(param)
    self._delayResetNum = self._delayResetNum or 0
    self._delayResetNum = self._delayResetNum + 1
    -- G_Prompt:showTip(self._delayResetNum .. "" )
    if self._cacheReset:size()==1 then  -- 队列第一个，开始计时器
        if self._scheduleResetHandler then
            SchedulerHelper.cancelSchedule(self._scheduleResetHandler)
            self._scheduleResetHandler = nil
        end
        self._scheduleResetHandler = SchedulerHelper.newScheduleOnce(handler(self, self._resetButtons), 0.5)
    end
end

--重置屏幕上的按钮
function MainMenuLayer:_resetButtons()
    self._delayResetNum = 0

    local size = self._cacheReset:size()
    local resetAll = false
    local record = {}
    for i=1,size do
        local t = self._cacheReset:pop()
        if t == nil then
            resetAll = true
            break
        end
        record[t] = true
    end
    if size == 0 then
        resetAll = true
    end
    
    if resetAll then
        for key, value in pairs(self._menusMapData) do
            if value and value.node then
                value.node:setVisible(false)
            end
        end
        self:_resetLeftBottom()
        self:_resetRightTop1()
        self:_resetRightTop2()
        self:_resetRightBottom2()
        self:_resetMoreBtns()
        self:_resetOtherBtn()
        self:_resetTerritory()
        self:_resetFuncView()
        self:_updateHeadFrameRedPoint()
        --特殊处理逻辑，处理拍卖
        local function procSpLogic()
            local needShow = G_UserData:getAuction():isGuildAuctionShow() or G_UserData:getAuction():isCrossWorldBossAuctionShow()
            self:showEffectByFuncId(FunctionConst.FUNC_AUCTION, needShow)
        end
    
        procSpLogic()
    else
        for param,_ in pairs(record) do
            local item = self._funcResetMap[param]
            if item ~= nil then     -- 更新一个区域
                local index = item[1]
                local funcName = item[2]
                for key, value in pairs(self._menusMapData) do
                    print (value.functionId)
                    if value and value.node and value.isShow and value.functionId and self._funcResetMap[value.functionId]
                        and self._funcResetMap[value.functionId][1]==index then    -- 属于同一区域
                        value.node:setVisible(false)
                    end
                end
                funcName(self)
                if index == 6 then  -- 拍卖
                    --特殊处理逻辑，处理拍卖
                    local function procSpLogic()
                        local needShow = G_UserData:getAuction():isGuildAuctionShow() or G_UserData:getAuction():isCrossWorldBossAuctionShow()
                        self:showEffectByFuncId(FunctionConst.FUNC_AUCTION, needShow)
                    end
                end
                return
            end
        end
        self:_resetFuncView()
        self:_updateHeadFrameRedPoint()
    end
    self:_resetRedIcon()
end

--特殊处理逻辑，制定某个特效移除，只有满足条件才显示
function MainMenuLayer:showEffectByFuncId(funcId, needShow)
    local menuData = self._menusMapData["k" .. funcId]
    if menuData then
        local node = menuData.node
        node:stopFuncGfx()
        if needShow == true then
            node:playFuncGfx()
        end
    end
end

--重置小红点
function MainMenuLayer:_resetRedIcon()
    for funcId, v in pairs(self._redDotMap) do
        self:_updateRedPointByFuncId(funcId)
    end
end

--是否显示 和倒计时callback
function MainMenuLayer:_getVisibleAndCountDownCallback(targetFuncId, labelStr)
    -- body
    local funcId, _, _ = G_UserData:getLimitTimeActivity():getCurMainMenuLayerActivityIcon()
    -- assert(funcId ~= FunctionConst.FUNC_GUILD_SERVER_ANSWER, "xxp")
    if funcId ~= targetFuncId then
        return false
    end

    local callBack = function(menuBtn, menuData)
        local curTime = G_ServerTime:getTime()
        local _, startTime, endTime, isNeedShowEffect =
            G_UserData:getLimitTimeActivity():getCurMainMenuLayerActivityIcon()
        if curTime < startTime then
            menuBtn:removeCustomLabel()
            menuBtn:showRunningImage(false)
            menuBtn:openCountDown(
                startTime,
                function(menuBtnImp)
                    menuBtnImp:showRunningImage(true)
                end
            )
        else
            menuBtn:showRunningImage(true)
        end
        if isNeedShowEffect then
            menuBtn:playBtnMoving()
            menuBtn:playFuncGfx()
        else
            menuBtn:stopBtnMoving()
            menuBtn:stopFuncGfx()
        end
    end
    return true, callBack
end

function MainMenuLayer:_getVisibleAndCountDownCallbackForQinTomb(labelStr)
    local QinTombHelper = require("app.scene.view.qinTomb.QinTombHelper")
    local openingTable = QinTombHelper.getOpeningTable()
    if openingTable.show == false then
        return false
    end

    local callBack = function(menuBtn, menuData)
        local curTime = G_ServerTime:getTime()
        menuBtn:removeCustomLabel()
        menuBtn:showRunningImage(false)
        if openingTable.countDown then
            menuBtn:openCountDown(
                openingTable.countDown,
                function(menuBtnImp)
                    menuBtnImp:showRunningImage(true)
                end
            )
            G_ServiceManager:registerOneAlarmClock(
                "QinTombMainBtn",
                openingTable.refreshTime,
                function()
                    G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_GROUPS)
                end
            )
        end
        if openingTable.labelStr then
            menuBtn:addCustomLabel(openingTable.labelStr, MainMenuLayer.TIP_FONT_SIZE, MainMenuLayer.TIP_POSITION,
                MainMenuLayer.TIP_COLOR, MainMenuLayer.TIP_OUTLINE_COLOR, 1)
            G_ServiceManager:registerOneAlarmClock(
                "QinTombMainBtn",
                openingTable.refreshTime,
                function()
                    G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_GROUPS)
                end
            )
        end

        if openingTable.isFighting then
            menuBtn:showRunningImage(true)
        end

        if openingTable.isInTeam then
            menuBtn:showInTeamImage(true)
        end

        if openingTable.showEffect then
            menuBtn:playBtnMoving()
            menuBtn:playFuncGfx()
        else
            menuBtn:stopBtnMoving()
            menuBtn:stopFuncGfx()
        end
    end

    return true, callBack
end

function MainMenuLayer:_getVisibleAndCountDownCallbackForSeason(labelStr)
    local date = SeasonSportHelper.getSeasonOpenTime()
    if not SeasonSportHelper.isTodayOpen() or #date <= 0 then
        return false
    end

    local callBack = function(menuBtn, menuData)
        local curTime = G_ServerTime:getTime()

        local isAcrossToday, startTime, endTime = SeasonSportHelper.getActTimeRegion()
        local isNeedShowEffect = SeasonSportHelper.getRemainingTime() > 0 or false
        local bWaiting, time = SeasonSportHelper.getWaitingTime()

        menuBtn:showRunningImage(false)

        if curTime < startTime then
            local oneFirstTime = SeasonSportHelper.getFirstStartOpenTime()

            if (startTime - curTime) > (oneFirstTime * 3600) and isAcrossToday then
                local strTime = (Lang.get("season_maintime_tomorrow", {time = oneFirstTime}))
                menuBtn:removeCustomLabel()
                menuBtn:addCustomLabel(strTime, MainMenuLayer.TIP_FONT_SIZE, MainMenuLayer.TIP_POSITION, MainMenuLayer.TIP_COLOR,
                    MainMenuLayer.TIP_OUTLINE_COLOR, 1)
                G_ServiceManager:registerOneAlarmClock(
                    "SeasonMainBtn4",
                    (startTime - oneFirstTime * 3600),
                    function()
                        G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_SEASONSOPRT)
                    end
                )
            elseif (startTime - curTime) > (3600 * 2) then
                local strTime = (SeasonSportHelper.getMianWaitingTime() .. Lang.get("season_maintime_start"))

                menuBtn:removeCustomLabel()
                menuBtn:addCustomLabel(strTime, MainMenuLayer.TIP_FONT_SIZE, MainMenuLayer.TIP_POSITION, MainMenuLayer.TIP_COLOR,
                    MainMenuLayer.TIP_OUTLINE_COLOR, 1)
                G_ServiceManager:registerOneAlarmClock(
                    "SeasonMainBtn5",
                    (startTime - 3600 * 2),
                    function()
                        G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_SEASONSOPRT)
                    end
                )
            else
                menuBtn:removeCustomLabel()
                menuBtn:openCountDown(
                    startTime,
                    function(menuBtnImp)
                        menuBtnImp:showRunningImage(true)
                    end
                )
            end
        else
            menuBtn:removeCustomLabel()
            menuBtn:showRunningImage(true)
        end

        if curTime <= endTime then
            G_ServiceManager:registerOneAlarmClock(
                "SeasonMainBtn",
                endTime,
                function()
                    G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_SEASONSOPRT)
                end
            )
        end

        if isNeedShowEffect then
            menuBtn:playBtnMoving()
            menuBtn:playFuncGfx()
        else
            menuBtn:stopBtnMoving()
            menuBtn:stopFuncGfx()
        end
    end
    return true, callBack
end

function MainMenuLayer:_getVisibleAndCountDownCallbackForSingleRace(labelStr)
    local SingleRaceDataHelper = require("app.utils.data.SingleRaceDataHelper")
    local startTime = SingleRaceDataHelper.getStartTime()
    local endTime = SingleRaceDataHelper.getEndTime()
    if startTime <= 0 or G_ServerTime:getTime() >= endTime then
        return false
    end

    local callBack = function(menuBtn, menuData)
        local curTime = G_ServerTime:getTime()
        local isNeedShowEffect = false

        G_ServiceManager:registerOneAlarmClock(
            "SingleRaceMainBtn",
            endTime,
            function()
                G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_SINGLE_RACE)
                G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_SINGLE_RACE)
            end
        )

        local showEffectStartTime = startTime - 300
        if curTime < showEffectStartTime then
            isNeedShowEffect = false
            G_ServiceManager:registerOneAlarmClock(
                "SingleRaceMainBtn",
                showEffectStartTime,
                function()
                    G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_SINGLE_RACE)
                end
            )
        else
            isNeedShowEffect = true
        end

        if curTime < startTime then
            menuBtn:removeCustomLabel()
            menuBtn:showRunningImage(false)
            menuBtn:openCountDown(
                startTime,
                function(menuBtnImp)
                    menuBtnImp:showRunningImage(true)
                end,
                true
            )
        else
            menuBtn:showRunningImage(true)
        end
        if isNeedShowEffect then
            menuBtn:playBtnMoving()
            menuBtn:playFuncGfx()
        else
            menuBtn:stopBtnMoving()
            menuBtn:stopFuncGfx()
        end
    end

    return true, callBack
end

function MainMenuLayer:_getVisibleAndCountDownCallbackForUniverseRace(labelStr)
    local UniverseRaceDataHelper = require("app.utils.data.UniverseRaceDataHelper")
    local createTime = G_UserData:getUniverseRace():getCreate_time()
    local beginTime = G_UserData:getUniverseRace():getBegin_time()
    local endTime = UniverseRaceDataHelper.getEndTime()
    if createTime <= 0 or G_ServerTime:getTime() >= endTime then
        return false
    end
    if G_ServerTime:getTime() < createTime then
        G_ServiceManager:registerOneAlarmClock(
            "UniverseRaceMainBtn1",
            createTime,
            function()
                G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_UNIVERSE_RACE)
            end
        )
        return false
    end

    local callBack = function(menuBtn, menuData)
        local curTime = G_ServerTime:getTime()
        local isNeedShowEffect = false

        G_ServiceManager:registerOneAlarmClock(
            "UniverseRaceMainBtn",
            endTime,
            function()
                G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_UNIVERSE_RACE)
                G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_UNIVERSE_RACE)
            end
        )

        local showEffectStartTime = beginTime
        if curTime < showEffectStartTime then
            isNeedShowEffect = false
            G_ServiceManager:registerOneAlarmClock(
                "UniverseRaceMainBtn2",
                showEffectStartTime,
                function()
                    G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_UNIVERSE_RACE)
                end
            )
        else
            isNeedShowEffect = true
        end

        if curTime < beginTime then
            menuBtn:removeCustomLabel()
            menuBtn:showRunningImage(false)
            menuBtn:openCountDown(
                beginTime,
                function(menuBtnImp)
                    menuBtnImp:showRunningImage(true)
                end,
                true
            )
        else
            menuBtn:showRunningImage(true)
        end
        if isNeedShowEffect then
            menuBtn:playBtnMoving()
            menuBtn:playFuncGfx()
        else
            menuBtn:stopBtnMoving()
            menuBtn:stopFuncGfx()
        end
    end

    return true, callBack
end

function MainMenuLayer:_getVisibleAndCountDownCallbackForRedPacketRain(labelStr)
    local RedPacketRainConst = require("app.const.RedPacketRainConst")
    local actId = G_UserData:getRedPacketRain():getActId()
    local startTime = G_UserData:getRedPacketRain():getActOpenTime()
    local endTime = G_UserData:getRedPacketRain():getActEndTime()
    local curTime = G_ServerTime:getTime()
    local startShowTime = startTime - RedPacketRainConst.TIME_PRE_SHOW_ICON
    -- if G_UserData:getRedPacketRain():isPlayed() then
    --     return false
    -- end
    if actId == 0 or startTime == 0 or endTime == 0 or curTime < startShowTime or curTime >= endTime then
        return false
    end

    local callBack = function(menuBtn, menuData)
        local curTime = G_ServerTime:getTime()
        local isNeedShowEffect = false

        G_ServiceManager:registerOneAlarmClock(
            "RedPacketRainMainBtn",
            endTime,
            function()
                G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_RED_PACKET_RAIN)
                G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_AUCTION)
            end
        )

        local showEffectStartTime = startTime
        if curTime < showEffectStartTime then
            isNeedShowEffect = false
            G_ServiceManager:registerOneAlarmClock(
                "RedPacketRainMainBtn2",
                showEffectStartTime,
                function()
                    G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_RED_PACKET_RAIN)
                end
            )
        else
            if G_UserData:getRedPacketRain():isPlayed() then
                isNeedShowEffect = false
            else
                isNeedShowEffect = true
            end
        end

        if isNeedShowEffect then
            menuBtn:playBtnMoving()
            menuBtn:playFuncGfx()
        else
            menuBtn:stopBtnMoving()
            menuBtn:stopFuncGfx()
        end
    end

    return true, callBack
end

-- 金将招募
function MainMenuLayer:_getVisibleAndCountDownCallbackForGachaGoldenHero(labelStr)
    local startTime = G_UserData:getGachaGoldenHero():getStart_time()
    local endTime = G_UserData:getGachaGoldenHero():getEnd_time()
    local showTime = G_UserData:getGachaGoldenHero():getShow_time()
    local curTime = G_ServerTime:getTime()

    if startTime == 0 or endTime == 0 or curTime > showTime or curTime < startTime then
        return false
    end

    local callBack = function(menuBtn, menuData)
        menuBtn:removeCustomLabel()
        menuBtn:addCustomLabel(labelStr, MainMenuLayer.TIP_FONT_SIZE, MainMenuLayer.TIP_POSITION, MainMenuLayer.TIP_COLOR,
            MainMenuLayer.TIP_OUTLINE_COLOR, 1)
        menuBtn:playBtnMoving()
        menuBtn:playFuncGfx()
    end

    return true, callBack
end

-- 红神兽
function MainMenuLayer:_getVisibleAndCountDownCallbackForRedPet()
    --local activitySchedule = G_UserData:getRedPetData():getSchedule()
    local isVisible = G_UserData:getRedPetData():isActivityOpen()
    -- local curTime = G_ServerTime:getTime()
    -- local curEndTime = 0
    -- local curStartTime = 0

    -- for k, v in pairs(activitySchedule) do
    --     local start_time = v.start_time or 0
    --     local end_time = v.end_time or 0

    --     if curTime >= start_time and start_time < end_time then
    --         isVisible = true
    --         curStartTime = start_time
    --         curEndTime = end_time
    --     end
    -- end

    local callBack = function(menuBtn, menuData)
        menuBtn:removeCustomLabel()
        menuBtn:playBtnMoving()
        menuBtn:playFuncGfx()

        -- menuBtn:openCountDown(
        --     curEndTime,
        --     function(menuBtnImp)
        --         menuBtnImp:showRunningImage(true)
        --     end,
        --     true
        -- )
    end

    return isVisible, callBack
end

-- 暗度陈仓
function MainMenuLayer:_getVisibleAndCountDownCallbackForGrainCar(labelStr)
    local GrainCarConfigHelper = require("app.scene.view.grainCar.GrainCarConfigHelper")
    local GrainCarConst = require("app.const.GrainCarConst")
    if not GrainCarConfigHelper.isInActivityTimeFromGenerate() then
        return false
    end
    if G_UserData:getGuild():getMyGuildId() == 0 then
        return false
    end
    if G_UserData:getGrainCar():isActivityOver() then
        return false
    end
    if G_UserData:getGrainCar():isEmergencyClose() then
        return false
    end

    local actStage = GrainCarConfigHelper.getActStage()
    if actStage == GrainCarConst.ACT_STATGE_GENERATED  then
        G_ServiceManager:registerOneAlarmClock(
            "GrainCarMainBtn",
            GrainCarConfigHelper.getGrainCarEndTimeStamp(),
            function()
                G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_GRAIN_CAR)
            end
        )
    end
    
   
    local callBack = function(menuBtn, menuData)
        local actStage = GrainCarConfigHelper.getActStage()
        if actStage == GrainCarConst.ACT_STATGE_GENERATED  then
            menuBtn:removeCustomLabel()
            menuBtn:showRunningImage(false)
            menuBtn:stopBtnMoving()
            menuBtn:stopFuncGfx()
            menuBtn:openCountDown(
                GrainCarConfigHelper.getGrainCarOpenTimeStamp(),
                function(menuBtnImp)
                    menuBtnImp:showRunningImage(true)
                end,
                true
            )
        elseif actStage == GrainCarConst.ACT_STATGE_OPEN  then
            menuBtn:showRunningImage(true)
            menuBtn:playBtnMoving()
            menuBtn:playFuncGfx()
        end
    end

    return true, callBack
end

-- 一元拍卖
function MainMenuLayer:_getVisibleAndCountDownCallbackForTenJadeAuction(labelStr)
    local TenJadeAuctionConfigHelper = import("app.scene.view.tenJadeAuction.TenJadeAuctionConfigHelper")
    local TenJadeAuctionConst  = require("app.const.TenJadeAuctionConst")
    local phase = TenJadeAuctionConfigHelper.getAuctionPhase()
    if phase == TenJadeAuctionConst.PHASE_END then
        return false
    end
    
    if phase == TenJadeAuctionConst.PHASE_DEFAULT then
        G_ServiceManager:registerOneAlarmClock(
            "TenJadeAuctionMainBtn",
            TenJadeAuctionConfigHelper.getAuctionOpenTimeStamp(),
            function()
                G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_TEN_JADE_AUCTION)
            end
        )
        return false
    end

    local callBack = function(menuBtn, menuData)
        local curAuctionInfo = G_UserData:getTenJadeAuction():getCurAuctionInfo()
        if phase == TenJadeAuctionConst.PHASE_SHOW  then
            menuBtn:removeCustomLabel()
            menuBtn:showRunningImage(false)
            menuBtn:stopBtnMoving()
            menuBtn:stopFuncGfx()
            menuBtn:openCountDown(
                curAuctionInfo:getStart_time(),
                function(menuBtnImp)
                    menuBtnImp:showRunningImage(true)
                    menuBtn:playBtnMoving()
                    menuBtn:playFuncGfx(nil, true)
                end,
                true
            )
            
        elseif phase == TenJadeAuctionConst.PHASE_ITEM_SHOW or phase == TenJadeAuctionConst.PHASE_START then
            menuBtn:showRunningImage(true)
            menuBtn:playBtnMoving()
            menuBtn:playFuncGfx(nil, true)
            G_ServiceManager:registerOneAlarmClock(
                "TenJadeAuctionMainBtn",
                curAuctionInfo:getEnd_time(),
                function()
                    G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_TEN_JADE_AUCTION)
                end
            )
        end
    end

    return true, callBack
end

function MainMenuLayer:_getVisibleAndCountDownCallbackForCakeActivity()
    local CakeActivityDataHelper = require("app.utils.data.CakeActivityDataHelper")
    local CakeActivityConst = require("app.const.CakeActivityConst")
    local actStage, startTime, endTime = CakeActivityDataHelper.getActStage()
    if actStage == CakeActivityConst.ACT_STAGE_0 then
        if startTime then
            G_ServiceManager:registerOneAlarmClock(
                "CakeActivityMainBtn",
                startTime,
                function()
                    G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_CAKE_ACTIVITY)
                end
            )
        end
        return false
    end

    local callBack = function(menuBtn, menuData)
        local curTime = G_ServerTime:getTime()
        local isNeedShowEffect = false

        G_ServiceManager:registerOneAlarmClock(
            "CakeActivityMainBtn",
            endTime,
            function()
                G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_CAKE_ACTIVITY)
            end
        )

        local labelStr = Lang.get("lang_guild_answer_main_layer_running")
        if actStage == CakeActivityConst.ACT_STAGE_1 or actStage == CakeActivityConst.ACT_STAGE_3 then
            isNeedShowEffect = true
            menuBtn:showRunningImage(true)
        elseif actStage == CakeActivityConst.ACT_STAGE_2 then 
            isNeedShowEffect = false
            menuBtn:removeCustomLabel()
            menuBtn:showRunningImage(false)
            menuBtn:openCountDown(
                endTime,
                function(menuBtnImp)
                    menuBtnImp:showRunningImage(true)
                end,
                true
            )
        elseif actStage == CakeActivityConst.ACT_STAGE_4 then
            isNeedShowEffect = false
            labelStr = Lang.get("cake_activity_main_menu_finish")
            menuBtn:showFinishedImage(true)
        end

        if isNeedShowEffect then
            menuBtn:playBtnMoving()
            local info = CakeActivityDataHelper.getCurCakeResouceConfig()
            menuBtn:playFuncGfx(info)
        else
            menuBtn:stopBtnMoving()
            menuBtn:stopFuncGfx()
        end
    end

    return true, callBack
end

function MainMenuLayer:_getVisibleAndCountDownCallbackForGuildCrossWar(labelStr)
    local bOpenAct,_ = GuildCrossWarHelper.isTodayOpen()
    if not bOpenAct then
        return false
    end

    local regionStage = GuildCrossWarHelper.getCurActStage()
    local callBack = function(menuBtn, menuData)
        local curTime = G_ServerTime:getTime()
        local isNeedShowEffect = false

        if regionStage.stage ~= 4 and regionStage.stage ~= 5 then
            local showEffectStartTime = regionStage.fightStartTime
            if regionStage.stage == 2 and curTime < showEffectStartTime then
                isNeedShowEffect = false
                G_ServiceManager:registerOneAlarmClock(
                    "GuildCrossWarMainBtn2",
                    showEffectStartTime,
                    function()
                        G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_GUILD_CROSS_WAR)
                    end
                )
            elseif regionStage.stage == 3 then
                if regionStage.fightStartTime < curTime and regionStage.fightEndTime > curTime then
                    isNeedShowEffect = true
                end
            end
        else
            isNeedShowEffect = false
        end

        if isNeedShowEffect then
            menuBtn:removeCustomLabel()
            menuBtn:showRunningImage(true)
            menuBtn:playBtnMoving()
            menuBtn:playFuncGfx()
        else
            menuBtn:removeCustomLabel()
            local bShowDay, strTime = G_ServerTime:getLeftDHMSFormatD(regionStage.fightStartTime)
            if strTime then
                if regionStage.stage ~= 4 and regionStage.stage ~= 5 then
                    menuBtn:openCountDown(
                        regionStage.fightStartTime,
                        function(menuBtnImp)
                            menuBtnImp:showRunningImage(true)
                        end,
                        bShowDay
                    )
                end
            end
            menuBtn:showRunningImage(false)
            menuBtn:stopBtnMoving()
            menuBtn:stopFuncGfx()
        end
    end

    return true, callBack
end

--填充世界boss 个性化数据
function MainMenuLayer:_getWorldBossVisibleAndCustomData()
    --世界boss 开启等级
    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_WORLD_BOSS)
    if not isOpen then
        return false
    end

    local customData = {}
    local bossID = G_UserData:getWorldBoss():getBoss_id()
    if bossID and bossID ~= 0 then
        local iconPath = Path.getCommonIcon("main", "btn_main_enter_worldboss" .. bossID)
        customData.icon = iconPath
    end

    local isVisible, callFunc =
        self:_getVisibleAndCountDownCallback(FunctionConst.FUNC_WORLD_BOSS, Lang.get("worldboss_main_layer_running"))
    if isVisible then
        customData.callFunc = callFunc
        return true, customData
    end
    return false, customData
end


--跨服军团boss
function MainMenuLayer:_getCrossWorldBossVisibleAndCustomData()
    --跨服军团boss 开启等级
    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_CROSS_WORLD_BOSS)
    if not isOpen then
        return false
    end

    local CrossWorldBossHelper = require("app.scene.view.crossworldboss.CrossWorldBossHelper")

    local customData = {}
    local bossID = G_UserData:getCrossWorldBoss():getBoss_id()
    local bossConfigInfo = CrossWorldBossHelper.getBossConfigInfo(bossID)

    if bossConfigInfo and bossConfigInfo.id ~= 0 then
        local iconPath = Path.getCommonIcon("main", "btn_main_enter_crossboss" .. bossConfigInfo.id)
        customData.icon = iconPath
    end

    local isVisible, callFunc =
        self:_getVisibleAndCountDownCallback(FunctionConst.FUNC_CROSS_WORLD_BOSS, Lang.get("worldboss_main_layer_running"))
    if true then
        customData.callFunc = callFunc
        return isVisible, customData
    end
    return false, customData
end

--填充答题 个性化数据
function MainMenuLayer:_getGuildAnswerVisibleAndCustomData()
    --答题 开启等级
    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_GUILD_ANSWER)
    if not isOpen then
        return false
    end
    local GuildAnswerHelper = require("app.scene.view.guildAnswer.GuildAnswerHelper")
    local isTodayOpen = GuildAnswerHelper.isTodayOpen()
    if not isTodayOpen then
        return false
    end
    local customData = {}
    local isVisible, callFunc =
        self:_getVisibleAndCountDownCallback(
        FunctionConst.FUNC_GUILD_ANSWER,
        Lang.get("lang_guild_answer_main_layer_running")
    )
    if isVisible then
        customData.callFunc = callFunc
        return true, customData
    end
    return false, customData
end

-- 全服答题
function MainMenuLayer:_getGuildServerAnswerVisibleAndCustomData()
    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_GUILD_SERVER_ANSWER)
    if not isOpen then
        return false
    end
    local GuildServerAnswerHelper = require("app.scene.view.guildServerAnswer.GuildServerAnswerHelper")
    local isTodayOpen = GuildServerAnswerHelper.isTodayOpen()
    if not isTodayOpen then
        return false
    end
    local customData = {}
    local isVisible, callFunc =
        self:_getVisibleAndCountDownCallback(
        FunctionConst.FUNC_GUILD_SERVER_ANSWER,
        Lang.get("lang_guild_answer_main_layer_running")
    )
    -- assert(false,(isVisible and "ppp" or "xxx"))
    if isVisible then
        customData.callFunc = callFunc
        return true, customData
    end
    return false, customData
end

--填充跑步系统 个性化数据
function MainMenuLayer:_getRunningManVisibleAndCustomData()
    --开启等级
    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_RUNNING_MAN)
    if not isOpen then
        return false
    end
    local customData = {}

    local visibleStr = Lang.get("lang_guild_answer_main_layer_running")
    local RunningManHelp = require("app.scene.view.runningMan.RunningManHelp")
    local RunningManConst = require("app.const.RunningManConst")
    local runningState = RunningManHelp.getRunningState()

    if runningState == RunningManConst.RUNNING_STATE_BET or runningState == RunningManConst.RUNNING_STATE_PRE_START then
        visibleStr = "" --Lang.get("lang_guild_answer_main_layer_bet")
    end
    local isVisible, callFunc = self:_getVisibleAndCountDownCallback(FunctionConst.FUNC_RUNNING_MAN, visibleStr)
    if isVisible then
        customData.callFunc = callFunc
        return true, customData
    end
    return false, customData
end

--军团副本
function MainMenuLayer:_getGuildDungeonVisibleAndCustomData()
    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_GUILD_DUNGEON)
    if not isOpen then
        return false
    end
    local customData = {}

    local isVisible, callFunc =
        self:_getVisibleAndCountDownCallback(
        FunctionConst.FUNC_GUILD_DUNGEON,
        Lang.get("lang_guild_answer_main_layer_running")
    )
    if isVisible then
        customData.callFunc = callFunc
        return true, customData
    end
    return false, customData
end

--三国战纪
function MainMenuLayer:_getCountryBossVisibleAndCustomData()
    --世界boss 开启等级
    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_COUNTRY_BOSS)
    if not isOpen then
        return false
    end
    local customData = {}

    local isVisible, callFunc =
        self:_getVisibleAndCountDownCallback(
        FunctionConst.FUNC_COUNTRY_BOSS,
        Lang.get("lang_guild_answer_main_layer_running")
    )
    if isVisible then
        customData.callFunc = callFunc
        return true, customData
    end
    return false, customData
end

--阵营竞技
function MainMenuLayer:_getCampRaceVisibleAndCustomData()
    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_CAMP_RACE)
    if not isOpen then
        return false
    end
    local customData = {}

    local isVisible, callFunc =
        self:_getVisibleAndCountDownCallback(
        FunctionConst.FUNC_CAMP_RACE,
        Lang.get("lang_guild_answer_main_layer_running")
    )
    if isVisible then
        customData.callFunc = callFunc
        return true, customData
    end
    return false, customData
end

--个人跨服竞技
function MainMenuLayer:_getSingleRaceVisibleAndCustomData()
    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    local SingleRaceConst = require("app.const.SingleRaceConst")
    local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_SINGLE_RACE)
    if not isOpen then
        return false
    end
    local status = G_UserData:getSingleRace():getStatus()
    if status == SingleRaceConst.RACE_STATE_NONE or status == SingleRaceConst.RACE_STATE_FINISH then
        return false
    end

    local customData = {}
    local isVisible, callFunc =
        self:_getVisibleAndCountDownCallbackForSingleRace(Lang.get("lang_guild_answer_main_layer_running"))
    if isVisible then
        customData.callFunc = callFunc
        return true, customData
    end
    return false, customData
end

--真武战神
function MainMenuLayer:_getUniverseRaceVisibleAndCustomData()
    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    local SingleRaceConst = require("app.const.SingleRaceConst")
    local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_UNIVERSE_RACE)
    if not isOpen then
        return false
    end

    local customData = {}
    local isVisible, callFunc = 
        self:_getVisibleAndCountDownCallbackForUniverseRace(Lang.get("lang_guild_answer_main_layer_running"))
    if isVisible then
        customData.callFunc = callFunc
        return true, customData
    end
    return false, customData
end

--红包雨
function MainMenuLayer:_getRedPacketRainVisibleAndCustomData()
    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    local RedPacketRainConst = require("app.const.RedPacketRainConst")
    local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_RED_PACKET_RAIN)
    if not isOpen then
        return false
    end
    local customData = {}
    local isVisible, callFunc =
        self:_getVisibleAndCountDownCallbackForRedPacketRain("")
    if isVisible then
        customData.callFunc = callFunc
        return true, customData
    end
    return false, customData
end

--金将招募
function MainMenuLayer:_getGachaGoldenHeroVisibleAndCustomData()
    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_GACHA_GOLDENHERO)
    if not isOpen then
        return false
    end
    local customData = {}
    local isVisible, callFunc = self:_getVisibleAndCountDownCallbackForGachaGoldenHero()
    if isVisible then
        customData.callFunc = callFunc
        return true, customData
    end
    return false, customData
end

--红神兽
function MainMenuLayer:_getRedPetVisibleAndCustomData()
    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_RED_PET)
    if not isOpen then
        return false
    end
    
    local customData = {}
    local isVisible, callFunc = self:_getVisibleAndCountDownCallbackForRedPet()
    if isVisible then
        customData.callFunc = callFunc
        return true, customData
    end
    return false, customData
end

--蛋糕活动
function MainMenuLayer:_getCakeActivityVisibleAndCustomData()
    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_CAKE_ACTIVITY)
    if not isOpen then
        return false
    end
    local customData = {}
    local isVisible, callFunc =
        self:_getVisibleAndCountDownCallbackForCakeActivity()
    if isVisible then
        customData.callFunc = callFunc
        local CakeActivityDataHelper = require("app.utils.data.CakeActivityDataHelper")
        local info = CakeActivityDataHelper.getCurCakeResouceConfig()
        local iconPath = Path.getCommonIcon("main", info.icon)
        customData.icon = iconPath
        customData.iconTxt = info.icon_word
        return true, customData
    end
    return false, customData
end

--暗度陈仓
function MainMenuLayer:_getGrainCarVisibleAndCustomData()
    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_GRAIN_CAR)
    if not isOpen then
        return false
    end
    local customData = {}
    local isVisible, callFunc = self:_getVisibleAndCountDownCallbackForGrainCar()
    if isVisible then
        customData.callFunc = callFunc
        return true, customData
    end
    return false, customData
end

--跨服拍卖
function MainMenuLayer:_getTenJadeAuctionVisibleAndCustomData()
    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_TEN_JADE_AUCTION)
    if not isOpen then
        return false
    end
    if not G_UserData:getTenJadeAuction():hasAuction() then
        return false
    end
    
    local customData = {}
    local isVisible, callFunc = self:_getVisibleAndCountDownCallbackForTenJadeAuction()
    if isVisible then
        customData.callFunc = callFunc
        return true, customData
    end
    return false, customData
end

-- 无差别竞技
function MainMenuLayer:_getSeasonSportVisibleAndCustomData()
    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_SEASONSOPRT)

    local customData = {}
    if not isOpen then
        return false, customData
    else
        local isVisible, callFunc = self:_getVisibleAndCountDownCallbackForSeason(Lang.get("season_fighting"))
        customData.callFunc = callFunc
        return true, customData
    end
    return false, customData
end

-- 秦皇陵
function MainMenuLayer:_getQinTombVisibleAndCustomData()
    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_GROUPS)

    local customData = {}
    if not isOpen then
        return false, customData
    else
        local isVisible, callFunc = self:_getVisibleAndCountDownCallbackForQinTomb(Lang.get("qin_fighting"))
        customData.callFunc = callFunc
        return true, customData
    end
    return false, customData
end
-- 历代名将
function MainMenuLayer:_getHistoryHeroVisibleAndCustomData()
    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HISTORY_HERO)

    local customData = {}
    if not isOpen then
        return false, customData
    else
        local isVisible, callFunc = self:_getVisibleAndCountDownCallbackForSeason(Lang.get("season_fighting"))
        customData.callFunc = callFunc
        return true, customData
    end
    return false, customData
end

--军团战
function MainMenuLayer:_getGuildWarVisibleAndCustomData()
    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_GUILD_WAR)
    if not isOpen then
        return false
    end
    local customData = {}

    local isVisible, callFunc =
        self:_getVisibleAndCountDownCallback(
        FunctionConst.FUNC_GUILD_WAR,
        Lang.get("lang_guild_answer_main_layer_running")
    )
    if isVisible then
        local bVisible = isVisible
        local _, bOpenToday = GuildCrossWarHelper.isTodayOpen()
        if bOpenToday then
            local bQualification,_ = GuildCrossWarHelper.isGuildCrossWarEntry()
            bVisible = (not bQualification)
        end
        customData.callFunc = callFunc
        return bVisible, customData
    end
    return false, customData
end

--跨服军团战
function MainMenuLayer:_getGuildCrossWarVisibleAndCustomData()
    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_GUILD_CROSS_WAR)
    if not isOpen then
        return false
    end
    local customData = {}

    local isVisible, callFunc = self:_getVisibleAndCountDownCallbackForGuildCrossWar(Lang.get("lang_guild_answer_main_layer_running"))
    if isVisible then
        local GuildCrossWarHelper = require("app.scene.view.guildCrossWar.GuildCrossWarHelper")
        local bVisible,_ = GuildCrossWarHelper.isTodayOpen()
        if bVisible then
            bVisible = GuildCrossWarHelper.isGuildCrossWarEntry()
        end
        customData.callFunc = callFunc
        return bVisible, customData
    end
    return false, customData
end

--阵营竞技新人王
function MainMenuLayer:_getCampRaceChampionVisible()
    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    local CampRaceHelper = require("app.scene.view.campRace.CampRaceHelper")
    local CampRaceConst = require("app.const.CampRaceConst")
    local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_CAMP_RACE_CHAMPION)
    if not isOpen then
        return false
    end

    local champions = G_UserData:getCampRaceData():getChampion()
    local count = 0
    for camp, user in pairs(champions) do
        count = count + 1
    end
    if count == 0 then
        return false
    end

    local visible = CampRaceHelper.isInCampChampionIconShowTime()
    return visible
end

--个人跨服竞技冠军
function MainMenuLayer:_getSingleRaceChampionVisible()
    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_SINGLE_RACE_CHAMPION)
    if not isOpen then
        return false
    end

    local status = G_UserData:getSingleRace():getStatus()
    if status == require("app.const.SingleRaceConst").RACE_STATE_FINISH then
        return true
    else
        return false
    end
end

--真武战神冠军
function MainMenuLayer:_getUniverseRaceChampionViisible()
    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_UNIVERSE_RACE_CHAMPION)
    if not isOpen then
        return false
    end
    local UniverseRaceDataHelper = require("app.utils.data.UniverseRaceDataHelper")
    local status = UniverseRaceDataHelper:getRaceStateAndTime()
    if status == require("app.const.UniverseRaceConst").RACE_STATE_CHAMPION_SHOW then
        return true
    else
        return false
    end
end

-- 充值更换图标
function MainMenuLayer:_getRecharge2Visible()
    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_RECHARGE2)
    if not isOpen then
        return false
    end
    return true
end

--通用超级VIP
function MainMenuLayer:_getSvipVisible(functionId)
    local isOpen = G_ConfigManager:isSvipOpen()
    if isOpen and G_UserData:getBase():getVip_qq() > 0 then
        return true
    else
        return false
    end
end

--超级VIP样式2
function MainMenuLayer:_getSvipVisible2(functionId)
    local isOpen = G_ConfigManager:isSvipOpen2()
    if isOpen then
        return true
    else
        return false
    end
end

--回归服确认
function MainMenuLayer:_getReturnConfirmVisible()
	if G_GameAgent:isLoginReturnServer() then --登录的是回归服
		local returnSvr = G_UserData:getBase():getReturnSvr()
		if returnSvr == nil then --还没有确认回归
			return true
		else
			return false
		end
	else
		return false
	end
end

--回归服返利
function MainMenuLayer:_getReturnAwardVisible()
	if G_GameAgent:isLoginReturnServer() == false then
		return false
	end
	
	local returnSvr = G_UserData:getBase():getReturnSvr()
	if returnSvr then --说明已回归到本服了
		if returnSvr:isAllReceived() then
			return false
		else
			return true
		end
	else
		local isCanReturn = G_GameAgent:isCanReturnServer() --是否有回归资格
		if isCanReturn then
			return true
		else
			return false
		end
	end
end

--T恤活动
function MainMenuLayer:_getTShirtVisible()
    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_TSHIRT)
    if not isOpen then
        return false
    end
    return G_UserData:getTShirt():isOpen()
end

--判断功能按钮是否可见,按钮可见的额外控制
--返回个性化数据
function MainMenuLayer:_getFunctionBtnVisibleAndCustomData(functionId)
    local customData
    local visible = true
    -- dump(functionId)
    if functionId == FunctionConst.FUNC_FIRST_RECHARGE then --首冲豪礼
        visible = G_UserData:getActivityFirstPay():needShowFirstPayAct()
    elseif functionId == FunctionConst.FUNC_WEEK_ACTIVITY then --七日活动
        visible = G_UserData:getDay7Activity():isInActRewardTime()
    elseif functionId == FunctionConst.FUNC_ACTIVITY then --限时活动
        local UserDataHelper = require("app.utils.UserDataHelper")
        visible = G_UserData:getTimeLimitActivity():hasTimeLimitActivityCanVisible()
    elseif functionId == FunctionConst.FUNC_CARNIVAL_ACTIVITY then --欢庆佳节
        --ICON上实际显示的FunctionID
        local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_CARNIVAL_ACTIVITY)
        visible = G_UserData:getCarnivalActivity():hasActivityCanVisible()
        visible = visible and isOpen
        customData = {iconShowFunctionId = G_UserData:getCarnivalActivity():getMainMenuIconFunctionId()}
    elseif functionId == FunctionConst.FUNC_GACHA_GOLDENHERO then   -- 金将招募
        visible, customData = self:_getGachaGoldenHeroVisibleAndCustomData()
    elseif functionId == FunctionConst.FUNC_MAIL then --邮件
        visible = true
    elseif functionId == FunctionConst.FUNC_INDULGE then
        --local TimeConst = require("app.const.TimeConst")
        --visible = G_UserData:getBase():getOnlineTime() >= TimeConst.INDULGE_TIME_01
        visible = false
    elseif functionId == FunctionConst.FUNC_WORLD_BOSS then
        visible, customData = self:_getWorldBossVisibleAndCustomData()
    elseif functionId == FunctionConst.FUNC_CROSS_WORLD_BOSS then
        visible, customData = self:_getCrossWorldBossVisibleAndCustomData()
    elseif functionId == FunctionConst.FUNC_SEASONSOPRT then -- 无差别竞技
        visible, customData = self:_getSeasonSportVisibleAndCustomData()
    elseif functionId == FunctionConst.FUNC_GROUPS then -- 秦皇陵
        visible, customData = self:_getQinTombVisibleAndCustomData()
    elseif functionId == FunctionConst.FUNC_RED_PET then -- 红神兽
        visible, customData = self:_getRedPetVisibleAndCustomData()
    elseif functionId == FunctionConst.FUNC_HISTORY_HERO then -- 历代名将
        --, customData = self:_getHistoryHeroVisibleAndCustomData()
        visible = true
    elseif functionId == FunctionConst.FUNC_GUILD_CROSS_WAR then -- 跨服军团战
        visible, customData = self:_getGuildCrossWarVisibleAndCustomData()
    elseif functionId == FunctionConst.FUNC_GUILD_ANSWER then
        visible, customData = self:_getGuildAnswerVisibleAndCustomData()
    elseif functionId == FunctionConst.FUNC_GUILD_SERVER_ANSWER then
        -- visible = true
        visible, customData = self:_getGuildServerAnswerVisibleAndCustomData()
    elseif functionId == FunctionConst.FUNC_GUILD_DUNGEON then
        visible, customData = self:_getGuildDungeonVisibleAndCustomData()
    elseif functionId == FunctionConst.FUNC_GUILD_WAR then
        visible, customData = self:_getGuildWarVisibleAndCustomData()
    elseif functionId == FunctionConst.FUNC_RUNNING_MAN then
        visible, customData = self:_getRunningManVisibleAndCustomData()
    elseif functionId == FunctionConst.FUNC_PATROL_AWARDS then
        --巡逻奖励
        visible = G_UserData:getTerritory():isHavePatrolAward()
    elseif functionId == FunctionConst.FUNC_RIOT_AWARDS then
        visible = G_UserData:getTerritory():isRiotHaveTake()
    elseif functionId == FunctionConst.FUNC_RIOT_HAPPEN then
        visible = G_UserData:getTerritory():isRiotHaveHelp()
    elseif functionId == FunctionConst.FUNC_RIOT_HELP then
        visible = G_UserData:getTerritory():isRiotHelpRedPoint()
        customData = {}
        customData.callFunc = function(menuBtn, menuData)
            local isShow, count = G_UserData:getTerritory():isRiotHelpRedPoint()
            menuBtn:addCountText(count)
        end
    elseif functionId == FunctionConst.FUNC_MAIN_STRONGER then --我要变强
        -- visible = G_UserData:getTerritory():isRiotHaveHelp()
        local notShowValue = tonumber(self:getParameter("recommend_upgrage_close"))
        if G_UserData:getBase():getLevel() >= notShowValue then
            visible = false
        else
            visible = true
        end
    elseif functionId == FunctionConst.FUNC_TRAVEL then
        customData = {}
        customData.callFunc = function(menuBtn, menuData)
            local energyNum = G_UserData:getBase():getResValue(DataConst.RES_SPIRIT)
            local count = math.floor(energyNum / 2)
            if count >= 1 then
                menuBtn:addCountText(count)
                menuBtn:setCountTextVisible(true)
            else
                menuBtn:setCountTextVisible(false)
            end
        end
    elseif functionId == FunctionConst.FUNC_RECHARGE_REBATE then
        visible = G_UserData:getRechargeRebate():isNotTakenRebate()
    elseif functionId == FunctionConst.FUNC_MAIL_RED then
        visible = RedPointHelper.isModuleReach(FunctionConst.FUNC_MAIL)
    elseif functionId == FunctionConst.FUNC_ACTIVITY_RESOURCE_BACK then
        visible = G_UserData:getActivityResourceBack():hasRedPoint()
    elseif functionId == FunctionConst.FUNC_ENEMY_REVENGE_LOG then
        visible = G_UserData:getRedPoint():isEnemyRevengeRedPoint()
    elseif functionId == FunctionConst.FUNC_COUNTRY_BOSS then
        visible, customData = self:_getCountryBossVisibleAndCustomData()
    elseif functionId == FunctionConst.FUNC_LINKAGE_ACTIVITY then
        visible = G_UserData:getLinkageActivity():isVisible(1)
    elseif functionId == FunctionConst.FUNC_LINKAGE_ACTIVITY2 then
        visible = G_UserData:getLinkageActivity():isVisible(2)
    elseif functionId == FunctionConst.FUNC_VIP_GIFT then
        local VipDataHelper = require("app.utils.data.VipDataHelper")
        visible = VipDataHelper.isShowEnterIcon()
    elseif functionId == FunctionConst.FUNC_CAMP_RACE then --阵营竞技
        visible, customData = self:_getCampRaceVisibleAndCustomData()
    elseif functionId == FunctionConst.FUNC_CAMP_RACE_CHAMPION then
        visible = self:_getCampRaceChampionVisible()
    elseif functionId == FunctionConst.FUNC_CHAPTER_BOSS then
        visible = G_UserData:getChapter():isAliveBoss()
    elseif functionId == FunctionConst.FUNC_AVOID_GAME then
        visible = G_ConfigManager:isRealName() or G_ConfigManager:isAvoidHooked()
        if G_GameAgent:isRealName() then
            visible = false
        end
    elseif functionId == FunctionConst.FUNC_SUPER_VIP then
        visible = self:_getSvipVisible(functionId)
    elseif functionId == FunctionConst.FUNC_SUPER_VIP_2 then
        visible = self:_getSvipVisible2(functionId)
    elseif functionId == FunctionConst.FUNC_RICH_MAN_INFO_COLLECT then
        local UserDataHelper = require("app.utils.UserDataHelper")
        local minRechargeMoney = UserDataHelper.getParameter(G_ParameterIDConst.VIP_MIN_CHARGE)
        local isSvip = G_UserData:getBase():getRecharge_total() >= minRechargeMoney
        visible = isSvip and not G_UserData:getBase():isIs_admit() and G_ConfigManager:isSvipRegisteOpen()
        --是否是土豪并还没登记
        logWarn("------------isSvip " .. tostring(isSvip))
    elseif functionId == FunctionConst.FUNC_SINGLE_RACE then
        visible, customData = self:_getSingleRaceVisibleAndCustomData()
    elseif functionId == FunctionConst.FUNC_SINGLE_RACE_CHAMPION then
        visible = self:_getSingleRaceChampionVisible()
    elseif functionId == FunctionConst.FUNC_OPPO_FORUM then
        -- 运营伤opid，gameid，sdk版本
        local opId = G_NativeAgent:getOpId() == "77"
        local opGameId = G_NativeAgent:getOpGameId() == "1001"
        visible = opId and opGameId and G_NativeAgent:hasForum()
    elseif functionId == FunctionConst.FUNC_RED_PACKET_RAIN then
        visible, customData = self:_getRedPacketRainVisibleAndCustomData()
    elseif functionId == FunctionConst.FUNC_CAKE_ACTIVITY then
        visible, customData = self:_getCakeActivityVisibleAndCustomData()
    elseif functionId == FunctionConst.FUNC_GRAIN_CAR then
        visible, customData = self:_getGrainCarVisibleAndCustomData()
    elseif functionId == FunctionConst.FUNC_TEN_JADE_AUCTION then
        visible, customData = self:_getTenJadeAuctionVisibleAndCustomData()
    elseif functionId == FunctionConst.FUNC_RETURN then
        visible, customData = self:_getReturnActivityVisibleAndCustomData()
    elseif functionId == FunctionConst.FUNC_UNIVERSE_RACE then
        visible, customData = self:_getUniverseRaceVisibleAndCustomData()
    elseif functionId == FunctionConst.FUNC_UNIVERSE_RACE_CHAMPION then
        visible, customData = self:_getUniverseRaceChampionViisible()
    elseif functionId == FunctionConst.FUNC_RECHARGE2 then
        visible, customData = self:_getRecharge2Visible()
	elseif functionId == FunctionConst.FUNC_RETURN_CONFIRM then
		visible = self:_getReturnConfirmVisible()
	elseif functionId == FunctionConst.FUNC_RETURN_AWARD then
        visible = self:_getReturnAwardVisible()
    elseif functionId == FunctionConst.FUNC_TSHIRT then
        visible = self:_getTShirtVisible()
    end
    return visible, customData
end

function MainMenuLayer:_getReturnActivityVisibleAndCustomData()
    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_RETURN)
    if not isOpen then
        return false
    end
    local customData = {}
    --dump(G_UserData:getBase())
    local isVisible = G_UserData:getBase():isIs_regression() and G_UserData:getReturnData():getIsEmergency() == true
    if isVisible then
        --G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_RETURN)
        return true, customData
    end
    return false, customData
end

function MainMenuLayer:_createMenuData(funcData)
    local funcId = funcData.funcId
    local menuData = {}
    local funcInfo = require("app.config.function_level").get(funcId)
    assert(funcInfo, "Invalid function_level can not find funcId " .. funcId)
    local playerLevel = G_UserData:getBase():getLevel()

    local visible, customData = self:_getFunctionBtnVisibleAndCustomData(funcId)
    local isFuncShow = require("app.utils.logic.FunctionCheck").funcIsShow(funcId)

    visible = visible and isFuncShow

    menuData.cfg = funcInfo
    menuData.functionId = funcId
    menuData.isShow = visible
    menuData.funcData = funcData
    menuData.funcSubId = funcData.funcSubId
    menuData.customData = customData

    return menuData
end

function MainMenuLayer:_createMenuList(funcList, rootPanel, isShowFalseVisible)
    --dump(funcList)
    local menuDataList = {}
    for i, value in ipairs(funcList) do
        local menuData
        -- 优先显示替代功能
        for _, item in ipairs(value.replaceFuncIds or {}) do
            menuData = self:_createMenuData(item)
            if menuData.isShow==true then
                break
            end
        end
        if not menuData or not menuData.isShow then
            menuData = self:_createMenuData(value)
        end
        if menuData.isShow == true then
            local nodeData = self:_createMenu(menuData, rootPanel)
            table.insert(menuDataList, nodeData)
        else
            -- 领地援助 icon 不消失bug 修改
            -- menuData.isShow = true  导致 isShow = false 的没进入 menuDataList  导致icon 没消失
            -- 避免引发其他逻辑问题  添加一个参数控制 是否修改设置
            if isShowFalseVisible then
                self:_setIconMenuVisibleByMenuData(menuData, false)
            end
        end
    end

    table.sort(
        menuDataList,
        function(item1, item2)
            return item1.cfg.home_index < item2.cfg.home_index
        end
    )

    return menuDataList
end

function MainMenuLayer:_setOtherBtnCallback ()
    local otherList = {}
    table.insert(otherList, self._btnMore)
    table.insert(otherList, self._btnShop)
    table.insert(otherList, self._btnStronger)
    table.insert(otherList, self._btnAdventure)
    table.insert(otherList, self._btnGroup)
    table.insert(otherList, self._btnIndulge)

    for i, value in ipairs(MainMenuLayer.OTHER_ICON) do
        local node = otherList[i]
        if node then
            if i == 1 then
                node:addClickEventListenerEx(handler(self, self.onMoreBtn))
            else
                node:addClickEventListenerEx(handler(self, self._onButtonClick))
            end
        end
    end
end

function MainMenuLayer:_resetOtherBtn()
    local otherList = {}
    table.insert(otherList, self._btnMore)
    table.insert(otherList, self._btnShop)
    table.insert(otherList, self._btnStronger)
    table.insert(otherList, self._btnAdventure)
    table.insert(otherList, self._btnGroup)
    table.insert(otherList, self._btnIndulge)

    local function procNodeBtn(i, node, menuData)
        if menuData.isShow == true then
            node:setVisible(true)
            menuData.node = node

            local btn = node:getButton()
            node:updateUI(menuData.functionId)
            --新手引导使用
            -- dump(btn:getName())
            btn:setName("commonMain" .. menuData.functionId)
            -- if i == 1 then
            --     node:addClickEventListenerEx(handler(self, self.onMoreBtn))
            -- else
            --     node:addClickEventListenerEx(handler(self, self._onButtonClick))
            -- end
            self._btnMap[btn] = self:_createMenuData(menuData.funcData)
            local funcId = menuData.functionId
            self:_setRedDotData(node:getSubNodeByName("RedPoint"), funcId, btn)
        else
            node:setVisible(false)
        end
    end

    for i, value in ipairs(MainMenuLayer.OTHER_ICON) do
        local node = otherList[i]
        local menuData = self:_createMenuData(value)
        if node then
            procNodeBtn(i, node, menuData)
        end

        local customData = menuData.customData
        if customData then
            if customData.callFunc then
                customData.callFunc(node, menuData)
            end
        end
    end
end

function MainMenuLayer:_resetFuncView()
    self._viewMapData[FunctionConst.FUNC_CHAT] = self._chatNode
    for i, value in ipairs(MainMenuLayer.FUNC_VIEW) do
        local node = self._viewMapData[value.funcId]
        local menuData = self:_createMenuData(value)
        if not node and menuData.isShow then
            logWarn("create menu view" .. value.funcId)
        end
        if node then
            node:setVisible(menuData.isShow)
        end
    end
end

function MainMenuLayer:_resetLeftBottom()
    for i, value in ipairs(MainMenuLayer.BAG_MERGE) do
        local funcId = value.funcId
        self._menusMapData["k" .. funcId] = nil
    end
    
    local UserDataHelper = require("app.utils.UserDataHelper")
    local menuList = {}
    if UserDataHelper.isEnoughBagMergeLevel() then -- 80级以后按第二种风格
        menuList = self:_createMenuList(MainMenuLayer.LEFT_BOTTOM_ICON_MERGE)
    else
        menuList = self:_createMenuList(MainMenuLayer.LEFT_BOTTOM_ICON)
    end

    local iconInterval = MainMenuLayer.ICON_INTERVAL

    for i, value in ipairs(menuList) do
        local node = value.node
        if node then
            local posX = (i - 1) * MainMenuLayer.ICON_SIZE + iconInterval
            node:setPositionX(posX)
            node:setPositionY(54-12+10+20-10)
            if value.functionId == FunctionConst.FUNC_ICON_MERGE then
                self._bagMergePosX = posX
            end
        end
    end
    local offset = G_ResolutionManager:getDeviceOffset()
    -- if offset ~= nil and offset > 0 then    -- iPhoneX
        self._imgBtnBgIPX:setVisible(true)
        self._imgBtnBgNormal:setVisible(false)
    -- else
    --     self._imgBtnBgIPX:setVisible(false)
    --     self._imgBtnBgNormal:setVisible(true)
    -- end

    self:_resetBagMergeBtns()
end

--右上第一排，排序
function MainMenuLayer:_resetRightTop1()
    local starX = G_ResolutionManager:getBangDesignWidth() + 30 - 10
    local menuList = self:_createMenuList(MainMenuLayer.RIGHT_TOP_ICON_A1)
    for i, value in ipairs(menuList) do
        local node = value.node
        if node then
            local posX = starX - (i) * MainMenuLayer.RIGHT_TOP_ICON_INTERVAL
            logWarn("MainMenuLayer:_resetRightTop1 " .. value.functionId .. " " .. starX .. " " .. posX)
            node:setPositionX(posX)
            node:setPositionY(540+35-10)
            node:moveLetterToRight()
            -- node:setScale(1.2)
            -- node:playBtnMoving()
            local customData = value.customData
            if customData then
                if customData.callFunc then
                    customData.callFunc(node, value)
                end
                if customData.icon then
                    node:loadCustomIcon(customData.icon)
                end
            end
        end
    end
end

--右下第二拍，征战按钮下面
function MainMenuLayer:_resetRightBottom2(...)
    -- body
    local starX = G_ResolutionManager:getBangDesignWidth() + 41 - 10
    local funBtnList = {}
    for k, v in ipairs(MainMenuLayer.RIGHT_BOTTOM_ICON_A2) do
        table.insert(funBtnList, v)
    end
    local menuList = self:_createMenuList(funBtnList)
    for i, value in ipairs(menuList) do
        local node = value.node
        if node then
            local posX = starX - (i) * MainMenuLayer.ICON_SIZE
            node:setPositionX(posX)
            node:setPositionY(178-25+5+20-10)
        end

        local customData = value.customData
        if customData then
            if customData.callFunc then
                customData.callFunc(node, value)
            end
        end
    end

    --local isMineShow = require("app.utils.logic.FunctionCheck").funcIsShow(FunctionConst.FUNC_MINE_CRAFT)
    --self._btnMineCraft:setVisible(isMineShow)
end

--右上第二排，排序
function MainMenuLayer:_resetRightTop2()
    local starX = G_ResolutionManager:getBangDesignWidth() + 30 - 10
    local funBtnList = {}
    for k, v in ipairs(MainMenuLayer.RIGHT_TOP_ICON_A2) do
        table.insert(funBtnList, v)
    end
    --在后面插入调查问卷
    local questionList = G_UserData:getQuestionnaire():getQuestionList()
    for k, v in ipairs(questionList) do
        table.insert(funBtnList, {funcId = FunctionConst.FUNC_QUESTION, param = {v}, funcSubId = v:getId()})
    end
    -- dump(funBtnList)
    local menuList = self:_createMenuList(funBtnList)
    for i, value in ipairs(menuList) do
        local node = value.node
        if node then
            local posX = starX - (i) * MainMenuLayer.RIGHT_TOP_ICON_INTERVAL
            node:setPositionX(posX)
            node:setPositionY(440+35-10)
            node:moveLetterToRight()
            -- node:setScale(1.2)

            if rawget(value, "customData") ~= nil then
                local customData = value.customData
                if customData then
                    if customData.callFunc then
                        customData.callFunc(node, value)
                    end
                    if customData.icon then
                        node:loadCustomIcon(customData.icon)
                    end
                end
            end
        end
    end
end

--重新排列更多面板里面按钮的位置
function MainMenuLayer:_resetMoreBtns(...)
    local panelW = 590
    local cols = 6
    local spaceY = 86
    local spaceX = 88
    local offsetX = (panelW - spaceX * cols) / 2
    local offsetY = 10
    local menuList = self:_createMenuList(MainMenuLayer.MORE_ICON, self._morePanel)
    local conH = math.ceil(#menuList / cols) * spaceY + 15
    for i, value in ipairs(menuList) do
        local btn = value.node
        if btn then
            btn:setPositionX(offsetX + spaceX / 2 + spaceX * ((i - 1) % cols))
            btn:setPositionY(conH - spaceY / 2 - offsetY - math.floor((i - 1) / cols) * spaceY)
        end
    end
    self._morePanel:setContentSize(panelW, conH)
end

--重新排列背包合并面板里面按钮的位置
function MainMenuLayer:_resetBagMergeBtns(...)
    local UserDataHelper = require("app.utils.UserDataHelper")
    if not UserDataHelper.isEnoughBagMergeLevel() then -- 80级以后按第二种风格
        return
    end
    -- 95*95
    local panelW = 400
    local cols = 4
    local spaceY = 86
    local spaceX = 88
    local offsetX = (panelW - spaceX * cols) / 2
    local offsetY = 0
    local menuList = self:_createMenuList(MainMenuLayer.BAG_MERGE, self._panelBag)
    local conH = math.ceil(#menuList / cols) * spaceY + 20
    for i, value in ipairs(menuList) do
        local btn = value.node
        if btn then
            btn:setScale(0.9)
            btn:setPositionX(offsetX + spaceX / 2 + spaceX * ((i - 1) % cols))
            btn:setPositionY(conH - spaceY / 2 - offsetY - math.floor((i - 1) / cols) * spaceY)
        end
    end
    self._panelBag:setPositionX(self._bagMergePosX)
    self._panelBag:setContentSize(panelW, conH)
end

--重新排列领地按键
function MainMenuLayer:_resetTerritory(isShowFalseVisible)
    --
    local menuList = self:_createMenuList(MainMenuLayer.FUNC_TERRITORY, nil, isShowFalseVisible)
    local curWidth = G_ResolutionManager:getBangDesignWidth()
    for i, value in ipairs(menuList) do
        local node = value.node
        if node then
            -- local posX = curWidth / 2 + (i - 2) * 78
            local posX = 415 + 10 + (i-0.5)*78 -- + G_ResolutionManager:getDeviceOffset()
            node:setPositionX(posX)
            node:setPositionY(160-20+20+5-10)
            node:setVisible(value.isShow)
            local customData = value.customData
            if customData then
                if customData.callFunc then
                    customData.callFunc(node, value)
                end
            end
        end
    end
end

--给按钮设置跳转映射
function MainMenuLayer:_setBtnMapData(btn, menuData, imgRedDot)
    if self._btnMap[btn] ~= nil then
        return
    end
    self._btnMap[btn] = menuData
    btn:addClickEventListenerEx(handler(self, self._onButtonClick))

    if imgRedDot ~= nil then
        local funcId = menuData.functionId
        self:_setRedDotData(imgRedDot, funcId, btn)
    end
end

--给按钮红点绑定检测条件
function MainMenuLayer:_setRedDotData(imgRed, funcId, nodeBtn)
    -- body
    --self._redDotMap[funcId] = { id=funcId, node = nodeBtn, imgRed = imgRed }
    local redDotList = self._redDotMap[funcId]
    if not redDotList then
        redDotList = {}
        self._redDotMap[funcId] = redDotList
    end
    table.insert(redDotList, {id = funcId, node = nodeBtn, imgRed = imgRed})
end

-- 单独设置
function MainMenuLayer:_setIconMenuVisibleByMenuData(menuData, visible)
    local funcInfo = menuData.cfg
    local funcSubIdStr = menuData.funcSubId and tostring(menuData.funcSubId) or ""
    --相同的FucId可能有多个按钮
    local iconDataFunc = self._menusMapData["k" .. funcInfo.function_id .. funcSubIdStr]
    if iconDataFunc ~= nil and iconDataFunc.node ~= nil then
        iconDataFunc.node:setVisible(visible)
    end
end

function MainMenuLayer:_createMenu(menuData, rootPanel)
    local funcInfo = menuData.cfg
    rootPanel = rootPanel or self._nodeBtn
    local funcSubIdStr = menuData.funcSubId and tostring(menuData.funcSubId) or ""
    --相同的FucId可能有多个按钮
    local iconDataFunc = self._menusMapData["k" .. funcInfo.function_id .. funcSubIdStr]
    if iconDataFunc ~= nil and iconDataFunc.node ~= nil then
        iconDataFunc.node:setVisible(true)
        -- 这里要额外处理  修改世界boss图标 新的menuData数据 没有放进去 导致还是老的数据
        -- 一些自定义数据 没生效
        iconDataFunc.customData = menuData.customData
        return iconDataFunc
    end

    --logWarn("create menu  ..."..tostring(funcInfo.function_id))
    -- local iconPath  = Path.getCommonIcon("main",funcInfo.icon)

    local CSHelper = require("yoka.utils.CSHelper")
    local node = CSHelper.loadResourceNode(Path.getCSB("CommonMainMenu", "common"))

    local customIcon, customIconTxt
    --自定义icon
    if menuData.customData then
        customIcon = menuData.customData.icon
        customIconTxt = menuData.customData.iconTxt
    end

    local iconShowFunctionId = nil
    if menuData.customData then
        iconShowFunctionId = menuData.customData.iconShowFunctionId
    end

    node:updateUI(iconShowFunctionId or menuData.functionId, customIcon, customIconTxt)
    node:playBtnMoving()
    local button = node:getButton()

    -- 设置一个名字，新手引导会用到
    button:setName("commonMain" .. funcInfo.function_id)
    rootPanel:addChild(node)

    menuData.node = node
    menuData.node:setVisible(true)
    self._menusMapData["k" .. funcInfo.function_id .. funcSubIdStr] = menuData
    self:_setBtnMapData(button, menuData, node:getSubNodeByName("RedPoint"))
    return menuData
end

--获取按钮跳转映射数据
function MainMenuLayer:_getBtnMenuData(btn)
    -- body
    return self._btnMap[btn]
end

-------------按钮点击（所有界面上的按钮走统一流程）
function MainMenuLayer:_onButtonClick(sender)
    -- body
    -- dump(sender:getName())
    local menuData = self:_getBtnMenuData(sender)

    if (menuData ~= nil) then
        local mod = menuData.mod
        local functionId = menuData.functionId
        local param = menuData.funcData and menuData.funcData.param or nil
        local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
        WayFuncDataHelper.gotoModuleByFuncId(functionId, param)
    else
    end
    self._morePanel:setVisible(false)
    self._morePanel:setScale(0)

    if menuData.functionId ~= FunctionConst.FUNC_ICON_MERGE then
        self._panelBag:setVisible(false)
        self._panelBag:setScale(0)
    end
end

function MainMenuLayer:_onClickPanelInfo()
    local PopupPlayerDetail = require("app.scene.view.playerDetail.PopupPlayerDetail").new()
    PopupPlayerDetail:openWithAction()
end

function MainMenuLayer:_updatePlayerFrame( )
    self._commonHeroIcon:updateIcon(G_UserData:getBase():getPlayerShowInfo(), nil, G_UserData:getHeadFrame():getCurrentFrame():getId())
end

function MainMenuLayer:_updateRoleInfo()
    local userBase = G_UserData:getBase()
    local exp = userBase:getExp()
    local roleData = require("app.config.role").get(userBase:getLevel())

    if roleData then
        self._playerExp:setString(exp .. "/" .. roleData.exp)
        local percent = math.floor(exp / roleData.exp * 100)
        self._playerExpBar:setPercent(percent)
    end

    local playerName = userBase:getName()
    local power = userBase:getPower()

    self._playerLevel:setString(Lang.get("common_title_x_level", {level = userBase:getLevel()}))

    local officelLevel = G_UserData:getBase():getOfficer_level()
    local officalInfo = G_UserData:getBase():getOfficialInfo()
    self._playerName:setString(playerName)
    self._playerName:setColor(Colors.getOfficialColor(officelLevel))
    self._playerName:enableOutline(Colors.getOfficialColorOutline(officelLevel), 2)
    --local posX = self._playerName:getPositionX() + self._playerName:getContentSize().width
    --self._playerVip:setString("V"..G_UserData:getVip():getLevel())
    --self._playerVip:setPositionX(posX+5)

    self._playerVip:loadVipImg(Path.getPlayerVip(G_UserData:getVip():getLevel()))

    self._playerPower:setString(power)

    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    local playerBaseId = G_UserData:getBase():getPlayerBaseId()
    local isEquipAvatar = G_UserData:getBase():isEquipAvatar()
    --[[
    local itemParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, playerBaseId)
    if itemParams.icon_bg ~= nil then
        self._imagePlayerBg:loadTexture(itemParams.icon_bg)
        self._imagePlayer:loadTexture(itemParams.main_icon)
    end
]]
    self._commonHeroIcon:updateIcon(G_UserData:getBase():getPlayerShowInfo(), nil, G_UserData:getHeadFrame():getCurrentFrame():getId())
    --self._headFrame:updateIcon(G_UserData:getHeadFrame():getCurrentFrame(), self._commonHeroIcon:getScale())

    local bgSize = self._imagePlayerBg:getContentSize()
    self._imagePlayer:setPosition(cc.p(bgSize.width / 2, bgSize.height / 2))
    self._imageAvatarBg:setVisible(isEquipAvatar)
    self._imageAvatarCover:setVisible(isEquipAvatar)
    self._imageAvatarCover:setPosition(cc.p(bgSize.width / 2, bgSize.height / 2))

    if not self._label then
        local TextHelper = require("app.utils.TextHelper")
        local CustomNumLabel = require("app.ui.number.CustomNumLabel")
        local label = CustomNumLabel.create("img_main_powernum", Path.getMainDir(), nil, CustomNumLabel.SIGN_STR)
        label:registerRoll(self)
        self._nodePower:removeAllChildren()
        self._nodePower:addChild(label)
        self._label = label
    end
    self._label:updateTxtValue(power)
end

function MainMenuLayer:setNumberValue(value)
    local TextHelper = require("app.utils.TextHelper")
    self._label:setString(TextHelper.getAmountText3(value, 1))
end

function MainMenuLayer:getNumberValue()
    --[[
    local str = self._label:getString() or "0w"
    local num = tonumber(string.sub(str, 1, -2))
    num = num * 100000
    logWarn("getNumberValue "..str.."  "..num)
    return num
    ]]
    return G_UserData:getBase():getPower()
end

function MainMenuLayer:onEnter()
    self._signalUserDataUpdate =
        G_SignalManager:add(SignalConst.EVENT_RECV_ROLE_INFO, handler(self, self._onEventUserDataUpdate))
    self._signalUserLevelUpdate =
        G_SignalManager:add(SignalConst.EVENT_USER_LEVELUP, handler(self, self._onEventUserLevelUpdate))
    -- 服务器开服天数变更
    self._signalDayUpdate = 
        G_SignalManager:add(SignalConst.EVENT_CLEAN_DATA_CLOCK, handler(self, self._onEventDayUpdate))
    self._signalZeroClock = G_SignalManager:add(SignalConst.EVENT_ZERO_CLOCK, handler(self, self._onEventZeroClock))
    self._signalChangeHeroFormation =
        G_SignalManager:add(SignalConst.EVENT_CHANGE_HERO_FORMATION_SUCCESS, handler(self, self._onEventUserHeroChange))
    self._signalRedPointUpdate =
        G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self, self._onEventRedPointUpdate))
    self._signalMainCityCheckBtns =
        G_SignalManager:add(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, handler(self, self._onEventMainCityCheckBtns))
    self._signalOfficialLevelUp =
        G_SignalManager:add(SignalConst.EVENT_OFFICIAL_LEVEL_UP, handler(self, self._onEventOfficialLevelUp))

    self._signalActivityNotice =
        G_SignalManager:add(SignalConst.EVENT_ACTIVITY_NOTICE, handler(self, self._onEventActivityNotice))
    self._signalVipExpChange =
        G_SignalManager:add(SignalConst.EVENT_VIP_EXP_CHANGE, handler(self, self._onEventVipExpChange))

    self._signalHeadFrameChange =
        G_SignalManager:add(SignalConst.EVENT_UPDATE_HEAD_FRAME, handler(self, self._updatePlayerFrame))

    --监听矿区可能出现的红点
    self._signalSendMineInfo =
        G_SignalManager:add(SignalConst.EVENT_SEND_MINE_INFO, handler(self, self._onSendMineInfo))
    --监听精力变化
    self._signalRecvRecoverInfo =
        G_SignalManager:add(SignalConst.EVENT_RECV_RECOVER_INFO, handler(self, self._eventRecvRecoverInfo))

    self._signalShopNewRemindUpdate =
        G_SignalManager:add(SignalConst.EVENT_SHOP_NEW_REMIND_UPDATE, handler(self, self._updateShopNewRemind))

    self._signalRedPacketRainStartNotify =
        G_SignalManager:add(
        SignalConst.EVENT_RED_PACKET_RAIN_START_NOTIFY,
        handler(self, self._onEventRedPacketRainStartNotify)
    )
    self._signalLoginSuccess =
        G_SignalManager:add(SignalConst.EVENT_LOGIN_SUCCESS, handler(self, self._onEventLoginSuccess))
    
    self._signalHomelandBuffEmpty =
        G_SignalManager:add(SignalConst.EVENT_HOME_LAND_BUFF_EMPTY, handler(self, self._onEventHomelandBuffEmpty))

    self._signalGrainCarEnd =
        G_SignalManager:add(SignalConst.EVENT_GRAIN_CAR_END, handler(self, self._onEventGrainCarEnd))
        
    self._signalUniverseRaceSyncActInfo =
        G_SignalManager:add(SignalConst.EVENT_UNIVERSE_RACE_SYNC_ACTINFO, handler(self, self._onEventUniverseRaceSyncActInfo))
    self._signalUniverseRaceSwitchLayer =
        G_SignalManager:add(SignalConst.EVENT_UNIVERSE_RACE_SWITCH_LAYER, handler(self, self._onEventUniverseRaceSwitchLayer))
	
	self._signalReturnCheckInSuccess =
		G_SignalManager:add(SignalConst.EVENT_RETURN_CHECK_IN_SUCCESS, handler(self, self._onEventReturnCheckInSuccess))
	
	self._signalReturnRecvBonusSuccess =
        G_SignalManager:add(SignalConst.EVENT_RETURN_RECV_BONUS_SUCCESS, handler(self, self._onEventReturnRecvBonusSuccess))

    self._funcId2HeroReach = {} --存储武将各个模块的红点值
    self:updateAll()
    -- EffectGfxSingle widget onExit 退出时就会取消定时器 导致effect不播放
    self:_playBtnEffect()
    -- G_HeroVoiceManager:setIsInMainMenu(true)
    -- G_HeroVoiceManager:startPlayMainMenuVoice()

    self:_checkCampRaceChampion()
    self:_checkIsInGrave()
    self:_updateShopNewRemind()
    self._homelandBuff:updateUI()
end

-- 初始化功能按钮的映射
function MainMenuLayer:_initFuncMap()
    self._funcResetMap = {}          -- 存储初始化功能按钮的映射
    self._funcList = {MainMenuLayer.FUNC_TERRITORY, MainMenuLayer.OTHER_ICON, MainMenuLayer.MORE_ICON,
        MainMenuLayer.RIGHT_BOTTOM_ICON_A2, MainMenuLayer.RIGHT_TOP_ICON_A2, MainMenuLayer.RIGHT_TOP_ICON_A1,
        MainMenuLayer.LEFT_BOTTOM_ICON}
    local functionList = {self._resetTerritory, self._resetOtherBtn, self._resetMoreBtns,
        self._resetRightBottom2, self._resetRightTop2, self._resetRightTop1,
        self._resetLeftBottom}
    for i,v in ipairs(self._funcList) do
        for kk,vv in ipairs(v) do
            self._funcResetMap[vv.funcId] = {i, functionList[i]}
            for kkk,vvv in ipairs(vv.replaceFuncIds or {}) do
                self._funcResetMap[vvv.funcId] = {i, functionList[i]}
            end
        end
    end
    self._funcResetMap[FunctionConst.FUNC_QUESTION] = {5, MainMenuLayer._resetRightTop2}
end

function MainMenuLayer:_updateShopNewRemind()
    local ShopHelper = require("app.scene.view.shop.ShopHelper")
    local redValue = ShopHelper.isHaveNewRemindShop()
    self._btnShop:showImageTip(redValue, Path.getTextSignet("txt_sg_new02"))
end

--是否在秦皇陵里面
function MainMenuLayer:_checkIsInGrave(...)
    -- body
    G_UserData:getQinTomb():c2sGraveEnterScene()
end

function MainMenuLayer:onExit()
    -- G_HeroVoiceManager:setIsInMainMenu(false)
    -- G_HeroVoiceManager:stopPlayMainMenuVoice()
    self:_openMore(false)
    self:_openBagMerge(false)
    self._signalUserDataUpdate:remove()
    self._signalUserDataUpdate = nil
    self._signalUserLevelUpdate:remove()
    self._signalUserLevelUpdate = nil
    self._signalDayUpdate:remove()
    self._signalDayUpdate = nil
    self._signalZeroClock:remove()
    self._signalZeroClock = nil
    self._signalChangeHeroFormation:remove()
    self._signalChangeHeroFormation = nil
    self._signalMainCityCheckBtns:remove()
    self._signalMainCityCheckBtns = nil

    self._signalRedPointUpdate:remove()
    self._signalRedPointUpdate = nil

    self._signalOfficialLevelUp:remove()
    self._signalOfficialLevelUp = nil

    self._signalActivityNotice:remove()
    self._signalActivityNotice = nil

    self._signalVipExpChange:remove()
    self._signalVipExpChange = nil

    self._signalHeadFrameChange:remove()
    self._signalHeadFrameChange = nil

    self._signalRecvRecoverInfo:remove()
    self._signalRecvRecoverInfo = nil

    self._signalSendMineInfo:remove()
    self._signalSendMineInfo = nil

    self._signalShopNewRemindUpdate:remove()
    self._signalShopNewRemindUpdate = nil

    self._signalRedPacketRainStartNotify:remove()
    self._signalRedPacketRainStartNotify = nil

    self._signalLoginSuccess:remove()
    self._signalLoginSuccess = nil
    
    self._signalHomelandBuffEmpty:remove()
    self._signalHomelandBuffEmpty = nil

    self._signalGrainCarEnd:remove()
    self._signalGrainCarEnd = nil
    
    self._signalUniverseRaceSyncActInfo:remove()
    self._signalUniverseRaceSyncActInfo = nil
    
    self._signalUniverseRaceSwitchLayer:remove()
    self._signalUniverseRaceSwitchLayer = nil
	
	self._signalReturnCheckInSuccess:remove()
	self._signalReturnCheckInSuccess = nil
	
	self._signalReturnRecvBonusSuccess:remove()
	self._signalReturnRecvBonusSuccess = nil

    G_ServiceManager:DeleteOneAlarmClock("SeasonMainBtn")

    if self._scheduleResetHandler then
        SchedulerHelper.cancelSchedule(self._scheduleResetHandler)
        self._scheduleResetHandler = nil
    end
end

--点击其他区域关闭更多按钮面板
function MainMenuLayer:_onPanelConTouch(sender, state)
    -- body
    logWarn("MainMenuLayer:_onPanelConTouch")
    if state == ccui.TouchEventType.began then
        self:_openMore(false)
        self:_openBagMerge(false)
    end
end

--是否打开更多按钮面板
function MainMenuLayer:_openMore(boolValue)
    -- body
    local isOpenMore = self._morePanel:isVisible()

    if isOpenMore == boolValue then
        return
    end

    self._morePanel:stopAllActions()
    self._btnMore:flipButton(boolValue)
    if boolValue == true then
        self._morePanel:setVisible(true)
        local actionOpen = cc.ScaleTo:create(0.3, 1)
        local easeOpen = cc.EaseBackOut:create(actionOpen)
        local finishFunc =
            cc.CallFunc:create(
            function()
                --抛出新手事件
                G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname .. ": _openMore")
            end
        )
        self._morePanel:runAction(cc.Sequence:create(easeOpen, finishFunc))
    else
        local actionClose = cc.ScaleTo:create(0.2, 0)
        local easeClose = cc.EaseExponentialOut:create(actionClose)
        local seqClose =
            cc.Sequence:create(
            easeClose,
            cc.CallFunc:create(
                function(node)
                    node:setVisible(false)
                end
            )
        )
        self._morePanel:runAction(seqClose)
    end
end

function MainMenuLayer:_openBagMerge(boolValue)
    -- body
    local isOpenMore = self._panelBag:isVisible()

    if isOpenMore == boolValue then
        return
    end

    self._panelBag:stopAllActions()
    -- self._btnMore:flipButton(boolValue)
    if boolValue == true then
        self._panelBag:setVisible(true)
        local actionOpen = cc.ScaleTo:create(0.3, 1)
        local easeOpen = cc.EaseBackOut:create(actionOpen)
        local finishFunc =
            cc.CallFunc:create(
            function()
                --抛出新手事件
                --G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname .. ": _openMore")
            end
        )
        self._panelBag:runAction(cc.Sequence:create(easeOpen, finishFunc))
    else
        local actionClose = cc.ScaleTo:create(0.2, 0)
        local easeClose = cc.EaseExponentialOut:create(actionClose)
        local seqClose =
            cc.Sequence:create(
            easeClose,
            cc.CallFunc:create(
                function(node)
                    node:setVisible(false)
                end
            )
        )
        self._panelBag:runAction(seqClose)
    end
end

function MainMenuLayer:onMoreBtn()
    local isOpenMore = not self._morePanel:isVisible()
    self:_openMore(isOpenMore)
end

function MainMenuLayer:onBagMergeBtn()
    local isOpenMore = not self._panelBag:isVisible()
    self:_openBagMerge(isOpenMore)
end

function MainMenuLayer:_onFightBtn()
    G_SceneManager:showScene("chapter")
end

function MainMenuLayer:_onClickHeroAvatar(mainAvatar)
end
--更新上阵武将列表
function MainMenuLayer:_updateHeroAvatar()
    local heroIdList = G_UserData:getTeam():getHeroIdsInBattle()
    local startFuncId = FunctionConst.FUNC_TEAM_SLOT1
    for index = 1, 6 do
        local heroNode = self["_heroAvatar" .. index]
        if heroNode then
            local funcTeamSoltId = (index - 1) + FunctionConst.FUNC_TEAM_SLOT1
            heroNode:setFuncId(funcTeamSoltId)
        end
    end

    --只解锁一个
    local function onlyUnlockOne()
        local unLockOne = 0
        local lockLevel = 0
        for index = 1, 6 do
            local heroNode = self["_heroAvatar" .. index]
            local heroId = heroIdList[index]
            if heroNode then
                local funcTeamSoltId = (index - 1) + FunctionConst.FUNC_TEAM_SLOT1
                local isOpen = LogicCheckHelper.funcIsOpened(funcTeamSoltId)
                if isOpen == true and heroId == nil then
                    if unLockOne == 0 then
                        heroNode:setLock(false)
                        heroNode:setAdd(true)
                    else
                        heroNode:setLock(false)
                        heroNode:setAdd(false)
                    end
                    unLockOne = unLockOne + 1
                else
                    if isOpen == false and lockLevel == 0 and heroId == nil then
                        heroNode:showOpenLevel(true)
                        lockLevel = lockLevel + 1
                    end
                end
            end
        end
    end

    onlyUnlockOne()

    for i, value in ipairs(heroIdList) do
        local heroUnit = G_UserData:getHero():getUnitDataWithId(value)
        local heroNode = self["_heroAvatar" .. i]
        if heroUnit and heroNode then
            local heroBaseId, isEquipAvatar, avatarLimitLevel, arLimitLevel = AvatarDataHelper.getShowHeroBaseIdByCheck(heroUnit)
            local limitLevel = avatarLimitLevel or heroUnit:getLimit_level()
            local limitRedLevel = arLimitLevel or heroUnit:getLimit_rtg()
            heroNode:updateUI(heroBaseId, handler(self, self._onClickHeroAvatar), limitLevel, limitRedLevel)
            heroNode:updateHeroName(heroUnit:getBase_id(), heroUnit:getRank_lv(), heroUnit:getLevel(), limitLevel, heroUnit:getLimit_rtg())
            if heroUnit:getConfig().type == 1 then
                heroNode:updateOfficial()
            end
        end
    end
    self:_updateHeroAvatarRedPoint()
end

function MainMenuLayer:_updateRedPointByFuncId(funcId, param)
    if funcId and funcId > 0 then
        local redDotList = self._redDotMap[funcId]
        if redDotList then
            local valueBool = RedPointHelper.isModuleReach(funcId)
            for k, redDot in ipairs(redDotList) do
                if redDot then
                    local redPoint = redDot.imgRed
                    redPoint:setVisible(false)
                    if valueBool == true then
                        redPoint:setVisible(true)
                    end
                    if funcId == FunctionConst.FUNC_AUCTION then
                        self:showEffectByFuncId(FunctionConst.FUNC_AUCTION, valueBool)
                    end
                end
            end
        elseif self:_isInHeroAvatarFuncList(funcId) then
            self:_updateHeroAvatarRedPoint(funcId, param)
        end
    end
end

-- user数据更新
function MainMenuLayer:_onEventUserDataUpdate(_, param)
    self:_updateRoleInfo()
    self:_updateHeroAvatar()
    --改名
end

-- 角色升级，刷新按钮状态
function MainMenuLayer:_onEventUserLevelUpdate(_, param)
    self:_delayResetButtons()
    self._nextFunctionOpen:updateUI()
    self:_updateShopNewRemind()
    self:_resetRedIcon()
end

-- 服务器天数变更
function MainMenuLayer:_onEventDayUpdate(_, param)
    self:_delayResetButtons()
end

--零点
function MainMenuLayer:_onEventZeroClock()
    self:_delayResetButtons()
end

-- 角色升级，刷新按钮状态
function MainMenuLayer:_onEventUserHeroChange(_, param)
    self:_updateHeroAvatar()
end

function MainMenuLayer:_onEventOfficialLevelUp(_, param)
    self:_updateHeroAvatar()
end

--小红点刷新
function MainMenuLayer:_onEventRedPointUpdate(id, funcId, param)
    local function inTheMoreList(funcId)
        for i, value in ipairs(MainMenuLayer.MORE_ICON) do
            if value.funcId == funcId then
                return true
            end
        end
        return false
    end
    local function inTheBagMergeList(funcId)
        for i, value in ipairs(MainMenuLayer.BAG_MERGE) do
            if value.funcId == funcId then
                return true
            end
        end
        return false
    end
    -- if funcId and FunctionConst.FUNC_PVE_TERRITORY == funcId then
    --单独调用时  设置 isShowFalseVisible == true
    --_resetButtons 里面 有设置 全为false
    self:_resetTerritory(true)
    -- end

    --指定funcId，单个更新
    if funcId and type(funcId) == "number" then
        self:_updateRedPointByFuncId(funcId, param)
        --更新更多Icon的小红点
        if inTheMoreList(funcId) then
            self:_updateRedPointByFuncId(FunctionConst.FUNC_MORE, param)
        end
        if inTheBagMergeList(funcId) then
            self:_updateRedPointByFuncId(FunctionConst.FUNC_ICON_MERGE, param)
        end
    else
        --不制定funcId 全量更新
        self:_resetRedIcon()
    end
    self:_updateHeadFrameRedPoint()
end

-- 刷新头像框按钮 因为头像框由头衔和头像框共同决定 funcID 不同
function MainMenuLayer:_updateHeadFrameRedPoint(...)
    local frameRed = G_UserData:getHeadFrame():hasRedPoint()
    local titleRed = G_UserData:getTitles():isHasRedPoint()

    if titleRed or frameRed then
        self._commonHeroIcon:getSubNodeByName("RedPoint"):setVisible(true)
    else
        self._commonHeroIcon:getSubNodeByName("RedPoint"):setVisible(false)
    end
end

-- 刷新按钮状态
function MainMenuLayer:_onEventMainCityCheckBtns(_, param)
    self:_delayResetButtons(param)
    self:_resetRedIcon(param)
end

--是否在Avatar红点检测列表中
function MainMenuLayer:_isInHeroAvatarFuncList(funcId)
    local list = {
        FunctionConst.FUNC_EQUIP,
        FunctionConst.FUNC_TREASURE,
        FunctionConst.FUNC_INSTRUMENT,
        FunctionConst.FUNC_HORSE,
        FunctionConst.FUNC_HERO_TRAIN_TYPE1,
        FunctionConst.FUNC_HERO_TRAIN_TYPE2,
        FunctionConst.FUNC_HERO_TRAIN_TYPE3,
        FunctionConst.FUNC_HERO_TRAIN_TYPE4,
        FunctionConst.FUNC_EQUIP_TRAIN_TYPE1,
        FunctionConst.FUNC_EQUIP_TRAIN_TYPE2,
        FunctionConst.FUNC_TREASURE_TRAIN_TYPE1,
        FunctionConst.FUNC_TREASURE_TRAIN_TYPE2,
        FunctionConst.FUNC_TREASURE_TRAIN_TYPE4,
        FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1,
        FunctionConst.FUNC_HORSE_TRAIN,
        FunctionConst.FUNC_HERO_KARMA,
        FunctionConst.FUNC_TACTICS
    }
    for i, id in ipairs(list) do
        if id == funcId then
            return true
        end
    end
    return false
end

--收到活动开启通知，界面按钮刷新
function MainMenuLayer:_onEventActivityNotice(id, param)
    self:_delayResetButtons(param)
end

function MainMenuLayer:_onEventVipExpChange(event)
    self:_updateRoleInfo()
end

function MainMenuLayer:_onSendMineInfo()
    self:_updateRedPointByFuncId(FunctionConst.FUNC_MINE_CRAFT)
end

function MainMenuLayer:_updateHeroAvatarRedPoint(funcId, param)
    local function checkEquipRP(pos)
        local reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_EQUIP, "posRP", pos)
        return reach
    end

    local function checkTreasureRP(pos)
        local reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TREASURE, "posRP", pos)
        return reach
    end

    local function checkInstrumentRP(pos)
        local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
        if heroId > 0 then
            local unitData = G_UserData:getHero():getUnitDataWithId(heroId)
            local heroBaseId = unitData:getBase_id()
            local param = {pos = pos, heroBaseId = heroBaseId}
            local reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_INSTRUMENT, "posRP", param)
            return reach
        end
        return false
    end

    local function checkHorseRP(pos)
        local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
        if heroId > 0 then
            local unitData = G_UserData:getHero():getUnitDataWithId(heroId)
            local heroBaseId = unitData:getBase_id()
            local param = {pos = pos, heroBaseId = heroBaseId}
            local reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE, "posRP", param)
            return reach
        end
        return false
    end

    local function checkHeroUpgrade(pos)
        local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
        local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
        local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE1, heroUnitData)
        return reach
    end

    local function checkHeroBreak(pos)
        local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
        local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
        local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE2, heroUnitData)
        return reach
    end

    local function checkHeroAwake(pos)
        local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
        local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
        local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE3, heroUnitData)
        return reach
    end

    local function checkHeroLimit(pos)
        local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
        local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
        local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE4, heroUnitData)
        return reach
    end

    local function checkEquipStrengthen(pos)
        local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_EQUIP_TRAIN_TYPE1, pos)
        return reach
    end

    local function checkEquipRefine(pos)
        local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_EQUIP_TRAIN_TYPE2, pos)
        return reach
    end

    local function checkTreasureUpgrade(pos)
        local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE1, pos)
        return reach
    end

    local function checkTreasureRefine(pos)
        local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE2, pos)
        return reach
    end

    local function checkTreasureLimit(pos)
        local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE4, pos)
        return reach
    end

    local function checkInstrumentAdvance(pos)
        local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1, pos)
        return reach
    end

    local function checkHorseUpStar(pos)
        local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HORSE_TRAIN, pos)
        return reach
    end

    local function checkKarma(pos)
        local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
        local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
        local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_KARMA, heroUnitData)
        return reach
    end
    
    local function checkTactics(pos)
        local reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TACTICS, "posRP", pos)
        return reach
    end


    local function checkHeroChange(pos)
        local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
        local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
        local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_CHANGE, heroUnitData)
        return reach
    end

    local function checkAvatar(pos)
        if pos ~= 1 then
            return false
        end
        local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_AVATAR)
        return reach
    end

    local function checkMineCraft()
        local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_MINE_CRAFT, "mainRP")
        return reach
    end

    local checkFuncs = {
        [FunctionConst.FUNC_EQUIP] = checkEquipRP,
        [FunctionConst.FUNC_TREASURE] = checkTreasureRP,
        [FunctionConst.FUNC_INSTRUMENT] = checkInstrumentRP,
        [FunctionConst.FUNC_HORSE] = checkHorseRP,
        [FunctionConst.FUNC_HERO_TRAIN_TYPE1] = checkHeroUpgrade,
        [FunctionConst.FUNC_HERO_TRAIN_TYPE2] = checkHeroBreak,
        [FunctionConst.FUNC_HERO_TRAIN_TYPE3] = checkHeroAwake,
        [FunctionConst.FUNC_HERO_TRAIN_TYPE4] = checkHeroLimit,
        [FunctionConst.FUNC_EQUIP_TRAIN_TYPE1] = checkEquipStrengthen,
        [FunctionConst.FUNC_EQUIP_TRAIN_TYPE2] = checkEquipRefine,
        [FunctionConst.FUNC_TREASURE_TRAIN_TYPE1] = checkTreasureUpgrade,
        [FunctionConst.FUNC_TREASURE_TRAIN_TYPE2] = checkTreasureRefine,
        [FunctionConst.FUNC_TREASURE_TRAIN_TYPE4] = checkTreasureLimit,
        [FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1] = checkInstrumentAdvance,
        [FunctionConst.FUNC_HORSE_TRAIN] = checkHorseUpStar,
        [FunctionConst.FUNC_HERO_KARMA] = checkKarma,
        [FunctionConst.FUNC_TACTICS] = checkTactics,
        [FunctionConst.FUNC_HERO_CHANGE] = checkHeroChange,
        [FunctionConst.FUNC_AVATAR] = checkAvatar,
        [FunctionConst.FUNC_MINE_CRAFT] = checkMineCraft
    }

    --红点相关的
    local redPointFuncId = {
        FunctionConst.FUNC_EQUIP,
        FunctionConst.FUNC_TREASURE,
        FunctionConst.FUNC_INSTRUMENT,
        FunctionConst.FUNC_HORSE,
        FunctionConst.FUNC_HERO_TRAIN_TYPE1,
        FunctionConst.FUNC_HERO_TRAIN_TYPE2,
        FunctionConst.FUNC_HERO_TRAIN_TYPE3,
        FunctionConst.FUNC_HERO_TRAIN_TYPE4,
        FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1,
        FunctionConst.FUNC_HORSE_TRAIN,
        FunctionConst.FUNC_HERO_KARMA,
        FunctionConst.FUNC_TACTICS,
        FunctionConst.FUNC_HERO_CHANGE,
        FunctionConst.FUNC_AVATAR,
        FunctionConst.FUNC_MINE_CRAFT
    }
    --箭头相关的
    local arrowFuncId = {
        FunctionConst.FUNC_EQUIP_TRAIN_TYPE1,
        FunctionConst.FUNC_EQUIP_TRAIN_TYPE2,
        FunctionConst.FUNC_TREASURE_TRAIN_TYPE1,
        FunctionConst.FUNC_TREASURE_TRAIN_TYPE2,
        FunctionConst.FUNC_TREASURE_TRAIN_TYPE4
    }

    local heroIdList = G_UserData:getTeam():getHeroIdsInBattle()
    for i, value in ipairs(heroIdList) do
        local heroNode = self["_heroAvatar" .. i]
        local reachArrow = false
        local reachRedPoint = false
        if heroNode then
            if funcId then
                if param then
                    local item2FuncId = nil
                    for j = 1, #param do
                        local item = param[j]
                        if item.id then
                            if funcId == FunctionConst.FUNC_HERO_TRAIN_TYPE2 and item.id == DataConst.ITEM_BREAK then --是突破丹才判断
                                item2FuncId = funcId
                                break
                            end
                            if
                                funcId == FunctionConst.FUNC_EQUIP_TRAIN_TYPE2 and
                                    item.id == DataConst["ITEM_REFINE_STONE_1"] and
                                    item.id == DataConst["ITEM_REFINE_STONE_2"] and
                                    item.id == DataConst["ITEM_REFINE_STONE_3"] and
                                    item.id == DataConst["ITEM_REFINE_STONE_4"]
                             then --是精炼石才判断
                                item2FuncId = funcId
                                break
                            end
                            if
                                funcId == FunctionConst.FUNC_TREASURE_TRAIN_TYPE2 and
                                    item.id == DataConst.ITEM_TREASURE_REFINE_STONE
                             then --宝物精炼石
                                item2FuncId = funcId
                                break
                            end
                            if
                                funcId == FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1 and
                                    item.id == DataConst.ITEM_INSTRUMENT_STONE
                             then --神兵进阶石
                                item2FuncId = funcId
                                break
                            end
                        end
                    end
                    if item2FuncId then
                        local func = checkFuncs[item2FuncId]
                        if func then
                            self._funcId2HeroReach[item2FuncId] = func(i)
                        end
                    end
                else
                    local func = checkFuncs[funcId]
                    if func then
                        self._funcId2HeroReach[funcId] = func(i)
                    end
                end
            else
                for j, funcId in ipairs(arrowFuncId) do
                    local func = checkFuncs[funcId]
                    if func then
                        local reach = func(i)
                        self._funcId2HeroReach[funcId] = reach
                        if reach then
                            reachArrow = true
                            break
                        end
                    end
                end
                for j, funcId in ipairs(redPointFuncId) do
                    local func = checkFuncs[funcId]
                    if func then
                        local reach = func(i)
                        self._funcId2HeroReach[funcId] = reach
                        if reach then
                            reachRedPoint = true
                            break
                        end
                    end
                end
            end

            if reachArrow then
                heroNode:showRedPoint(reachRedPoint)
                heroNode:showImageArrow(false)
            else
                heroNode:showRedPoint(reachRedPoint)
                heroNode:showImageArrow(false)
            end
        end
    end
end
--精力发生变化 刷新可游历次数
function MainMenuLayer:_eventRecvRecoverInfo()
    self:_resetOtherBtn()
end

function MainMenuLayer:_checkCampRaceChampion()
    local champions = G_UserData:getCampRaceData():getChampion()
    local count = 0
    for camp, user in pairs(champions) do
        count = count + 1
    end
    if count == 0 then
        G_UserData:getCampRaceData():c2sGetCampRaceChampion()
    end
end

function MainMenuLayer:_onEventRedPacketRainStartNotify()
    self:_resetTerritory()
end

function MainMenuLayer:_onEventLoginSuccess()
    self:_delayResetButtons()
    self:_resetRedIcon()
end

function MainMenuLayer:_onEventHomelandBuffEmpty()
    self._homelandBuff:updateUI()
end

--暗度陈仓结束 刷新按钮
function MainMenuLayer:_onEventGrainCarEnd()
    self:_delayResetButtons(FunctionConst.FUNC_GRAIN_CAR)
end

--真武战神刷新
function MainMenuLayer:_onEventUniverseRaceSyncActInfo()
    self:_delayResetButtons(FunctionConst.FUNC_UNIVERSE_RACE)
end
--真武战神冠军图标刷出来
function MainMenuLayer:_onEventUniverseRaceSwitchLayer(eventName, layerState)
    local UniverseRaceConst = require("app.const.UniverseRaceConst")
    if layerState == UniverseRaceConst.LAYER_STATE_CHAMPION then
        self:_delayResetButtons(FunctionConst.FUNC_UNIVERSE_RACE_CHAMPION)
    end
end

--回归服确认回归
function MainMenuLayer:_onEventReturnCheckInSuccess(eventName)
	self:_delayResetButtons(FunctionConst.FUNC_RETURN_CONFIRM)
end

--回归服返利
function MainMenuLayer:_onEventReturnRecvBonusSuccess(eventName)
	local returnSvr = G_UserData:getBase():getReturnSvr()
	if returnSvr and returnSvr:isAllReceived() then
		self:_delayResetButtons(FunctionConst.FUNC_RETURN_AWARD)
	end
end

return MainMenuLayer
