-- @Author panhoa
-- @Date 5.5.2019
-- @Role 

local ViewBase = require("app.ui.ViewBase")
local GachaGoldenHeroView = class("GachaGoldenHeroView", ViewBase)
local GoldHeroAvatar = import(".GoldHeroAvatar")
local BullectScreenConst = require("app.const.BullectScreenConst")
local PointRankView = import(".PointRankView")
local AudioConst = require("app.const.AudioConst")
local GachaGoldenHeroHelper = import(".GachaGoldenHeroHelper")
local scheduler = require("cocos.framework.scheduler")
local GachaGoldenHeroConst = require("app.const.GachaGoldenHeroConst")
local SchedulerHelper = require("app.utils.SchedulerHelper")
local PopupJoyGachaView = require("app.scene.view.gachaGoldHero.PopupJoyGachaView")


-- function GachaGoldenHeroView:waitEnterMsg(callBack)
-- 	local function onMsgCallBack(id, message)
-- 		callBack()
-- 	end

-- 	G_UserData:getGachaGoldenHero():c2sGachaEntry()
-- 	local signal = G_SignalManager:add(SignalConst.EVENT_GACHA_GOLDENHERO_ENTRY, onMsgCallBack)
-- 	return signal
-- end

function GachaGoldenHeroView:ctor(zhenyin)
    self._topBar       = nil
    self._commonChat   = nil
    self._nodeRank     = nil
    self._pointRankView= nil
    self._joyGachaView = nil
    self._isBulletOpen = true
    self._countDownHandler = nil
    self._currentChooseZhenyin = zhenyin or 0
    
    local resource = {
        file = Path.getCSB("GachaGoldenHeroView", "gachaGoldHero"),
        size = G_ResolutionManager:getDesignSize(),
        binding = {
			_panelTouchJoy = {
				events = {{event = "touch", method = "_onButtonClickJoy"}}
            }
        }
    }
    GachaGoldenHeroView.super.ctor(self, resource)--, 2101)
end

function GachaGoldenHeroView:onCreate()
    self:_initFuncIcon()
    self:_initEffectAvatar()
    self:_initEffectFont()
    self:_initRankView()
    self:_updateJoyDraw(true)
    self:_updateJoyCountDown()
    self:_initDanmu()

    self:_playLightEffect()
end

function GachaGoldenHeroView:onEnter()
    if self._isBulletOpen then
        G_BulletScreenManager:setBulletScreenOpen(BullectScreenConst.GACHA_GOLDENHERO_TYPE,true)
    end
    G_AudioManager:playMusicWithId(AudioConst.SOUND_GACHA_GOLDEN_HERO)
    self._countDownScheduler = scheduler.scheduleGlobal(handler(self, self._update), 0.1)
end

function GachaGoldenHeroView:onExit()
    self:_endSchedule()
    local runningScene = G_SceneManager:getTopScene()
	if runningScene and runningScene:getName() ~= "fight" then
        G_BulletScreenManager:clearBulletLayer()
    end
    if self._countDownScheduler then
		scheduler.unscheduleGlobal(self._countDownScheduler)
		self._countDownScheduler = nil
	end
end

function GachaGoldenHeroView:_playLightEffect()
    self._nodeEffectLight:removeAllChildren()
    G_EffectGfxMgr:createPlayGfx(self._nodeEffectLight, "effect_baisequanpingbaoguang")
end

function GachaGoldenHeroView:_initEffectAvatar( ... )
    local groupIds = G_UserData:getGachaGoldenHero():getGoldHeroGroupIdByCountry(self._currentChooseZhenyin) or {}
    local num = #groupIds
    local panel = self["_panel_"..num]
    if num == 0 or panel == nil then
        return
    end

    panel:setVisible(true)

    local function createAvatar(index)
        local groupIds = G_UserData:getGachaGoldenHero():getGoldHeroGroupIdByCountry(self._currentChooseZhenyin) or {}
        local avatar = GoldHeroAvatar.new(handler(self, self._touchAvatar))
        avatar:updateUI(groupIds[index], nil, true)
        avatar:setScale(0.9)
        if index % 2 == 0 then
            avatar:turnBack(true)
            avatar:setAligement(GachaGoldenHeroConst.FLAG_ALIGNMENT_RIGHT)
        else
            avatar:turnBack(false)
            avatar:setAligement(GachaGoldenHeroConst.FLAG_ALIGNMENT_LEFT)
        end
        local type = 2 
        -- if num == 4 and index > 2 then
        --     type = 2
        -- end
        avatar:setNamePositionY(type)
        return avatar
    end

    for k, v in pairs(groupIds) do
        local node = self["_node_"..num.."_"..k]
        if node then
            local avatar = createAvatar(k)
            node:addChild(avatar)
        end
    end
end

function GachaGoldenHeroView:_initEffectFont( ... )
    local function effectFunction(effect)
	end
	
    local function eventFunction(event)
       if event == "finish" then
        end
    end
    
    self._nodeEffectFront:removeAllChildren()
    G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffectFront, "moving_jinjiangzhaomu_dianjiang_front", effectFunction, eventFunction , false)
end

function GachaGoldenHeroView:_updateJoyDraw(isCreateIn)
    self._poolData = GachaGoldenHeroHelper.getGachaState()
    local id = G_UserData:getGachaGoldenHero():getDrop_id()
    local data = GachaGoldenHeroHelper.getGoldenHeroDraw(id)

    --[[if self._poolData.isLottery then
        if GachaGoldenHeroHelper.isLastReward(id) then
            data = GachaGoldenHeroHelper.getLastReward(id)
        end
    end]]
    self._commonJoyIcon:unInitUI()
    self._commonJoyIcon:initUI(data.type, data.value, 1)
    self._commonJoyIcon:setTouchEnabled(false)

    local index = 0
    if self._poolData.isOver then
        index = 1
    else
        index = self._poolData.isLottery and 2 or 1
    end
    self._imageIconTxt:loadTexture(Path.getGoldHeroTxt(GachaGoldenHeroConst.DRAW_JOY_ICONTXT[index]))
    self._imageIconTxt:ignoreContentAdaptWithSize(true)

    -- popup Joy
    if isCreateIn then
        if G_UserData:getGachaGoldenHero():isAutoPopupJoy() and self._poolData.isLottery then
            local prizeLists = G_UserData:getGachaGoldenHero():getPrizeLists() or {}
            if self._joyGachaView == nil and GachaGoldenHeroHelper.isLottery(prizeLists) then
                self:_startCountDown(true)
            end
        end
    elseif self._poolData.isLottery then
        local prizeLists = G_UserData:getGachaGoldenHero():getPrizeLists() or {}
        if self._joyGachaView == nil and GachaGoldenHeroHelper.isLottery(prizeLists) then
            self:_startCountDown(false)
        end
    end
end

function GachaGoldenHeroView:_updateJoyCountDown()
    if self._poolData and self._poolData.stage <= 0 then
        self._panelJoy:setVisible(false)
        return
    end

    local leftTime = G_ServerTime:getLeftSeconds(self._poolData.countDowm)
    if leftTime <= 0 then
        if self._poolData.isLottery then
            G_UserData:getGachaGoldenHero():setLuck_draw_num(0)
        end
        self:_updateJoyDraw()
    end
    
    local times = G_ServerTime:getLeftDHMSFormatEx(self._poolData.countDowm)
    --[[times = self._poolData.isLottery and Lang.get("gacha_goldenhero_joinstart", {time = times}) 
                                      or Lang.get("gacha_goldenhero_joinend", {time = times})]]

    if self._poolData.isLottery then
        if self._poolData.isOver then
            times = Lang.get("gacha_goldenhero_joinend", {time = times})
        else
            times = Lang.get("gacha_goldenhero_joinstart", {time = times})
        end
    else
        if self._poolData.isCrossDay then
            times = Lang.get("gacha_goldenhero_joinstart", {time = times})
        else
            times = Lang.get("gacha_goldenhero_joinend", {time = times})
        end
    end
    self._textJoyTime:setString(tostring(times))
end

function GachaGoldenHeroView:_updateActivityEnd()
    self._activityCountDown:removeAllChildren()
    local entTime = G_UserData:getGachaGoldenHero():getEnd_time()
    local showTime = G_UserData:getGachaGoldenHero():getShow_time()
    local leftTime = G_ServerTime:getLeftSeconds(entTime)
    local desc = (leftTime > 0 and Lang.get("gacha_goldenhero_activityendtime", {time = G_ServerTime:getLeftDHMSFormatEx(entTime)})
                                or Lang.get("gacha_goldenhero_activityshowTime", {time = G_ServerTime:getLeftDHMSFormatEx(showTime)}))
    local fontSize = (leftTime > 0 and 20 or 18)
    local richText = ccui.RichText:createRichTextByFormatString(
        desc,
        {defaultColor = Colors.CLASS_WHITE, defaultSize = fontSize, other ={[1] = {color = Colors.GOLDENHERO_ACTIVITY_END_NORMAL}}})
        
    richText:setAnchorPoint(cc.p(0.5, 0.5))
    self._activityCountDown:addChild(richText)
end

function GachaGoldenHeroView:_closeJooy( ... )
    self._joyGachaView = nil 
end

function GachaGoldenHeroView:_startCountDown(isCreateIn)
    self:_endSchedule()
    self._countDownHandler = SchedulerHelper.newScheduleOnce(function()
        self._joyGachaView = PopupJoyGachaView.new(handler(self, self._closeJooy))
        self._joyGachaView:openWithAction()
        G_UserData:getGachaGoldenHero():setAutoPopupJoy(false)
    end, 1.5)
end

function GachaGoldenHeroView:_endSchedule()
    if self._countDownHandler then
        SchedulerHelper.cancelSchedule(self._countDownHandler)
        self._countDownHandler = nil
    end
end

function GachaGoldenHeroView:_initFuncIcon()
    self._topBar:setImageTitle("txt_sys_jianlongzaitian")
    local TopBarStyleConst = require("app.const.TopBarStyleConst")
    self._topBar:updateUI(TopBarStyleConst.STYLE_GOLD_GACHA, true)
    self._topBar:setCallBackOnBack(handler(self, self._onReturnBack))

    --local isReturnServer = G_GameAgent:isLoginReturnServer()
    --if isReturnServer then
    --    self._commonRecharge:setVisible(false)
    --else
        --self._commonRecharge:updateUI(5, 33, 30, 1)
    --end

    self._commonRecharge:setVisible(false)

    self._commonHelp:updateUI(FunctionConst.FUNC_GACHA_GOLDENHERO)

    local FunctionConst	= require("app.const.FunctionConst")
    self["_gachaAwards"]:updateUI(FunctionConst.FUNC_GACHA_GOLDENHERO_POINT)
    self["_gachaAwards"]:addClickEventListenerEx(handler(self, self._onButtonClickAwards))
    self["_gachaShop"]:updateUI(FunctionConst.FUNC_GACHA_GOLDENHERO_SHOP)
    self["_gachaShop"]:addClickEventListenerEx(handler(self, self._onButtonClickShop))
    self["_gachaShowAward"]:updateUI(FunctionConst.FUNC_GACHA_GOLDENHERO_DAILY)
    self["_gachaShowAward"]:addClickEventListenerEx(handler(self, self._onButtonClickShowAwards))
end

function GachaGoldenHeroView:_onReturnBack()
    G_UserData:getGachaGoldenHero():c2sGachaExit()
    G_SceneManager:popScene()
end

function GachaGoldenHeroView:_onButtonClickJoy()
    if self._joyGachaView == nil then
        self._joyGachaView = PopupJoyGachaView.new(handler(self, self._closeJooy))
        self._joyGachaView:openWithAction()
    end
end

function GachaGoldenHeroView:_onButtonClickShowAwards()
    G_SceneManager:showDialog("app.scene.view.gachaGoldHero.PopupJoyAwards")
end

function GachaGoldenHeroView:_onButtonClickAwards()
    G_SceneManager:showDialog("app.scene.view.gachaGoldHero.PopupGachaAwardsRank")
end

function GachaGoldenHeroView:_onButtonClickShop()
    G_SceneManager:showScene("gachaGoldShop")
end

function GachaGoldenHeroView:_initRankView()
    self._pointRankView = PointRankView.new()
    self._nodeRank:addChild(self._pointRankView)
end

function GachaGoldenHeroView:_initDanmu()
    self._danmuPanel = self._commonChat:getPanelDanmu()
	self._danmuPanel:addClickEventListenerEx(handler(self,self._onBtnDanmu))
    self._danmuPanel:setVisible(true)
    G_BulletScreenManager:setBulletScreenOpen(BullectScreenConst.GACHA_GOLDENHERO_TYPE,true)
    self:_updateBulletScreenBtn(BullectScreenConst.GACHA_GOLDENHERO_TYPE)
end

function GachaGoldenHeroView:_onBtnDanmu()
	local bulletOpen = G_UserData:getBulletScreen():isBulletScreenOpen(BullectScreenConst.GACHA_GOLDENHERO_TYPE)
	G_UserData:getBulletScreen():setBulletScreenOpen(BullectScreenConst.GACHA_GOLDENHERO_TYPE, not bulletOpen)
	self:_updateBulletScreenBtn(BullectScreenConst.GACHA_GOLDENHERO_TYPE)
end

function GachaGoldenHeroView:_updateBulletScreenBtn(bulletType)
	self._danmuPanel:getSubNodeByName("Node_1"):setVisible(false)
	self._danmuPanel:getSubNodeByName("Node_2"):setVisible(false)
    local bulletOpen = G_UserData:getBulletScreen():isBulletScreenOpen(bulletType)
    
	if bulletOpen == true then
		self._danmuPanel:getSubNodeByName("Node_1"):setVisible(true)
		G_BulletScreenManager:showBulletLayer()
		self._isBulletOpen = true
	else
		self._danmuPanel:getSubNodeByName("Node_2"):setVisible(true)
		G_BulletScreenManager:hideBulletLayer()
		self._isBulletOpen = false
	end
end

function GachaGoldenHeroView:_touchAvatar(heroId)
    G_SceneManager:showScene("gachaDrawGoldHero", heroId, self._currentChooseZhenyin)
end

function GachaGoldenHeroView:_update(dt)
    self:_updateActivityEnd()
    self:_updateJoyCountDown()
end


return GachaGoldenHeroView