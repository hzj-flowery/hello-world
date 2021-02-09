local ViewBase = require("app.ui.ViewBase")
local TowerView = class("TowerView", ViewBase)

local EquipStage = require("app.config.equip_stage")
local scheduler = require("cocos.framework.scheduler")

local HeroRes = require("app.config.hero_res")
local EquipBoss = require("app.config.equip_boss")
local Path = require("app.utils.Path")

local DataConst = require("app.const.DataConst")
local AudioConst = require("app.const.AudioConst")

local FunctionConst = require("app.const.FunctionConst")

local ReturnPrivilege = require("app.config.return_privilege")

local UserDataHelper = require("app.utils.UserDataHelper")

local ParameterIDConst = require("app.const.ParameterIDConst")

--宝箱状态
TowerView.BOX_STATE_CLOSE = 0
TowerView.BOX_STATE_OPEN = 1
TowerView.BOX_STATE_EMPTY = 2
TowerView.BOX_STATE_NO = 3      --没有宝箱

TowerView.PAGE_AVATAR_MAX = 3   --一页上有3个人

function TowerView:ctor()
    self._topBar = nil      --顶部条

    self._nodeStages = {}
    self._heroNode1 = nil
    self._heroNode2 = nil
    self._heroNode3 = nil

    self._pageIds = {}
    self._nowLayer = 0      --现在打到第几层
    self._nextLayer = 0     --下一层打第几层g

    self._textHistoryStar = nil     --总星数
    self._textStar = nil              --当前总星数
    self._textChallengeCount = nil  --剩余次数
    self._textRecoverTitle = nil    --回复时间
    self._textRecoverTime = nil     --回复倒计时

    self._scheduler = nil           --update
   

    self._btnSweep = nil             --扫荡按钮
    self._btnRank = nil             --排行榜

    self._surprises = {}             --奇遇
    self._lastSurprise = {}          --上次的奇遇，用来判断是否有新奇遇
    
    self._btnEvent1 = nil           --事件1
    self._btnEvent2 = nil           --事件2
    self._btnEvent3 = nil           --事件3
    self._btnEvents = {}            --事件集合

    self._rankClick = false         --是否点击了排行榜按钮

    self._panelBox = nil        --宝箱
    self._imageBox = nil        --宝箱图
    self._boxState = TowerView.BOX_STATE_CLOSE      --宝箱状态
    self._boxEft = nil          --宝箱跳动特效
    self._boxLayer = 0          --有宝箱的层数

    --监听
    self._signalTowerRank = nil     --爬塔排行榜回调
    self._signalGetBox = nil        --开宝箱回调
    self._signalSweep = nil         --监听扫荡

    self._commonHelpBig = nil
    self._imageBG = nil             --爬塔背景
    self._btnSuperStage = nil
	local resource = {
		file = Path.getCSB("TowerView", "tower"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
            _btnSweep = {
				events = {{event = "touch", method = "_onSweepClick"}}
			},
            _panelBox = {
				events = {{event = "touch", method = "_onBoxClick"}}
			},
            _btnShop = {
				events = {{event = "touch", method = "_onShopClick"}}
			},
            _btnRank = {
				events = {{event = "touch", method = "_onRankClick"}}
			},
            _btnEvent1 = {
                events = {{event = "touch", method = "_onEventClick"}}
            },
            _btnEvent2 = {
                events = {{event = "touch", method = "_onEventClick"}}
            },
            _btnEvent3 = {
                events = {{event = "touch", method = "_onEventClick"}}
            },
            _btnSuperStage  = {
                events = {{event = "touch", method = "_onSuperStageClick"}}
            },
            _resetBtn  = {
                events = {{event = "touch", method = "_onResetTowerInfo"}}
            },
            
		}
	}
    self:setName("TowerView")
	TowerView.super.ctor(self, resource)
end

function TowerView:onCreate()
    self._topBar:setImageTitle("txt_sys_com_guoguanzhanjiang")
 	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topBar:updateUI(TopBarStyleConst.STYLE_TOWER)
    self._btnEvents = {self._btnEvent1, self._btnEvent2, self._btnEvent3,}

   -- self._imageBG:ignoreContentAdaptWithSize(true)
    self._btnShop:updateUI(FunctionConst.FUNC_EQUIP_SHOP)
    self._btnRank:updateUI(FunctionConst.FUNC_TOWER_RANK)

    self._commonHelpBig:updateUI(FunctionConst.FUNC_PVE_TOWER)

    local TowerAvatarNode = require("app.scene.view.tower.TowerAvatarNode")
    for i = 1, TowerView.PAGE_AVATAR_MAX do
        local towerAvatarNode = TowerAvatarNode.new(i)
        self["_heroNode"..i]:addChild(towerAvatarNode)
   
        table.insert(self._nodeStages, towerAvatarNode)
    end
    self._btnSweep:setString(Lang.get("challenge_tower_sweep"))
    self._resetBtn:setString(Lang.get("return_reset_btn_text1"))
    local surpriseList = G_UserData:getTowerData():getSurprises()
    for _, v in pairs(surpriseList) do
        table.insert(self._lastSurprise, v:getSurprise_id())
    end

    self._btnSuperStage:updateUI(FunctionConst.FUNC_TOWER_SUPER)

    cc.bind(self._commonChat,"CommonMiniChat")
end

function TowerView:onEnter()

   --判断是否过期
    if G_UserData:getTowerData():isExpired() == true then
        G_UserData:getTowerData():c2sGetTower()
    end

    G_AudioManager:playMusicWithId(AudioConst.MUSIC_PVP)    
    self:_refreshStage()     
    self:_refreshCount()
    self:_refreshBoxState()
    self._scheduler = scheduler.scheduleGlobal(handler(self, self._update), 1)
    self._signalTowerRank = G_SignalManager:add(SignalConst.EVENT_TOWER_RANK, handler(self, self._onEventTowerRank))
    self._signalGetBox = G_SignalManager:add(SignalConst.EVENT_TOWER_GET_BOX, handler(self, self._onEventGetBox))
    self._signalSweep = G_SignalManager:add(SignalConst.EVENT_TOWER_SWEEP, handler(self, self._onEventSweep))
    self._signalRedPointUpdate = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self,self._onEventRedPointUpdate))
    self._signalTowerGetInfo = G_SignalManager:add(SignalConst.EVENT_TOWER_GET_INFO, handler(self, self._onEventTowerGetInfo))
    self._signalUserLevelUpdate  = G_SignalManager:add(SignalConst.EVENT_USER_LEVELUP, handler(self, self._onEventUserLevelUpdate))
    self._signalCommonZeroNotice = G_SignalManager:add(SignalConst.EVENT_COMMON_ZERO_NOTICE, handler(self, self._onEventCommonZeroNotice))

    self._signalResetTimes = G_SignalManager:add(SignalConst.EVENT_RETURN_RESET_TIMES, handler(self, self._resetTowerInfo))

    local surpriseList = G_UserData:getTowerData():getSurprises()
    self._surprises = {}
    for _, v in pairs(surpriseList) do
        if not v:isWin() then
            --没有通关惊喜列表
            table.insert(self._surprises, v:getSurprise_id())
        end
    end
    self:_checkNewSurprise()
    self:refreshRedPoint()
    
    --TODO 是否在通用组件处理
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local canShow = LogicCheckHelper.funcIsShow(FunctionConst.FUNC_TOWER_SWEEP)
    self._btnSweep:setVisible(canShow)

    local isRegression = G_UserData:getBase():isIs_regression()
    local resetTimes = G_UserData:getReturnData():getTowerResetTimes()
    self._resetBtn:setVisible(resetTimes > 0 and isRegression)

    self:_refreshMenuBtns()

    --抛出新手事件出新手事件
    G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
end

function TowerView:onExit()
	scheduler.unscheduleGlobal(self._scheduler)
	self._scheduler = nil
    self._signalTowerRank:remove()
    self._signalTowerRank = nil
    self._signalGetBox:remove()
    self._signalGetBox = nil
    self._signalSweep:remove()
    self._signalSweep = nil
    self._signalRedPointUpdate:remove()
    self._signalRedPointUpdate = nil

    self._signalTowerGetInfo:remove()
    self._signalTowerGetInfo = nil

    self._signalUserLevelUpdate:remove()
    self._signalUserLevelUpdate =nil

    self._signalCommonZeroNotice:remove()
    self._signalCommonZeroNotice = nil
    
    self._signalResetTimes:remove()
	self._signalResetTimes = nil
end

function TowerView:_resetTowerInfo()
    G_Prompt:showTip(Lang.get("return_reset_tower_tips"))
    G_UserData:getTowerData():c2sGetTower()

    local resetTimes = G_UserData:getReturnData():getTowerResetTimes()
    self._resetBtn:setVisible(resetTimes > 0)
end

function TowerView:_onResetTowerInfo()

    local callbackOK = function ()
        local privilegeInfo = G_UserData:getReturnData():getPrivilegeInfo()
        local id = 0
    
        for k, v in pairs(privilegeInfo) do
            local configInfo = ReturnPrivilege.get(v.id)
            if configInfo.privilege_type == 2 then
                id = v.id
                break
            end
        end
    
        G_UserData:getReturnData():c2sReceiveAwards(2, id)
    end

    local count = G_UserData:getTowerData():getSpuer_cnt()
    local totalCount = UserDataHelper.getParameter(ParameterIDConst.TOWER_SUPER_CHALLENGE_MAX_TIME)
    local stars = G_UserData:getTowerData():getNow_star()

    if stars == 0 then
        local title = Lang.get("guild_appoint_confirm_title")
        local content = Lang.get("return_reset_tower_stars_tips")
        local popupAlert = require("app.ui.PopupAlert").new(title, content, callbackOK)
        popupAlert:openWithAction()
    elseif count < totalCount then
        local title = Lang.get("guild_appoint_confirm_title")
        local content = Lang.get("return_reset_tower_stars_tips1")
        local popupAlert = require("app.ui.PopupAlert").new(title, content, callbackOK)
        popupAlert:openWithAction()
    else
        callbackOK()
    end
end

function TowerView:refreshRedPoint()
    local RedPointHelper = require("app.data.RedPointHelper")
    local red = RedPointHelper.isModuleSubReach( FunctionConst.FUNC_SHOP_SCENE, "equipShop" )
    self._btnShop:showRedPoint(red)

    local redValue02 = RedPointHelper.isModuleReach(FunctionConst.FUNC_TOWER_SUPER)
    self._btnSuperStage:showRedPoint(redValue02)


    local redValue03 = RedPointHelper.isModuleReach(FunctionConst.FUNC_TOWER_SWEEP)
    self._btnSweep:showRedPoint(redValue03)
end

function TowerView:_onEventCommonZeroNotice(event,hour)
    G_UserData:getTowerData():pullData()
end

function TowerView:_onEventTowerGetInfo(event)
    self:_refreshStage()
    self:_refreshBoxState()  
end

function TowerView:_onEventRedPointUpdate(event,funcId,param)
	if not funcId or funcId ==  FunctionConst.FUNC_SHOP_SCENE 
        or funcId ==  FunctionConst.FUNC_TOWER_SUPER or funcId ==  FunctionConst.FUNC_PVE_TOWER then	
		self:refreshRedPoint()
    end

     
end

function TowerView:_sweepExit()
    self:_refreshStage()
    self:_refreshCount()
    self:_refreshBoxState()
    local surpriseList = G_UserData:getTowerData():getSurprises()
    self._surprises = {}
    for _, v in pairs(surpriseList) do
        if not v:isWin() then
            --没有通关惊喜列表
            table.insert(self._surprises, v:getSurprise_id())
        end
    end
    -- self:_refreshSurprises()
    self:_checkNewSurprise()
end

function TowerView:_checkNewSurprise()
    local nowSurprise = G_UserData:getTowerData():getSurprises()
    local lastNewId = nil
    for _, v in pairs(nowSurprise) do
        local id = v:getSurprise_id()
        local isNew = true
        for _, vv in pairs(self._lastSurprise) do
            if vv == id then
                isNew = false
                break
            end
        end
        if isNew then
            table.insert(self._lastSurprise, id)
            lastNewId = id
        end
    end
    if lastNewId then
        self:_openSurprise(lastNewId)
    end
end

function TowerView:_refreshSurprises()
    for i = 1, 3 do
        self._btnEvents[i]:setVisible(false)
    end
    for i, v in pairs(self._surprises) do
        local heroResId = EquipBoss.get(v).res
        local icon = HeroRes.get(heroResId).icon
        local image = Path.getCommonIcon("hero", icon)
        self._btnEvents[i]:loadTextures(image, "", "", 0)
        self._btnEvents[i]:setVisible(true)
    end
end

function TowerView:_update(f)
    self:_refreshCount()
end

--爬塔次数
function TowerView:_refreshCount()
	local baseMgr = G_UserData:getBase()
	local towerCount =  baseMgr:getResValue(DataConst.RES_TOWER_COUNT)
    self._textChallengeCount:setString(towerCount)
    local TowerData = G_UserData:getTowerData()
    local star = TowerData:getMax_star()
    local nowStar = TowerData:getNow_star()
    self._textHistoryStar:setString(star)
    self._textStar:setString(nowStar)

    local recoverUnit = G_RecoverMgr:getRecoverUnit(3)  --爬塔回复次数资源
    local maxCount = recoverUnit:getMaxLimit()
    local remainTime = recoverUnit:getRemainCount()

    local min = math.floor(remainTime / 60)
    local second = remainTime % 60
    local timeString = Lang.get("challenge_tower_remain_min", {count = min})..Lang.get("challenge_tower_remain_second", {count = second})
    if min == 0 then
        timeString = Lang.get("challenge_tower_remain_second", {count = second})
    end
    if maxCount == towerCount then
        self._textRecoverTitle:setVisible(false)
    else
        self._textRecoverTitle:setVisible(true)
        self._textRecoverTime:setString(tostring(timeString))
    end
end

function TowerView:_refreshStageNode(idx)
    local layerId = self._pageIds[idx]
    local layerConfig = EquipStage.get(layerId)
    assert(layerConfig, "get wrong layerid "..layerId)
    local layerData = G_UserData:getTowerData():getLayerByIndex(layerId)
    if idx == 1 then    --去这层的第一关的map作为这层的map
    --[[
        local background = Path.getStageBG(layerConfig.map)
        self._imageBG:loadTexture(background)
    ]]    
        self:updateSceneId(layerConfig.map)
    end
    local towerAvatar = self._nodeStages[idx]
    towerAvatar:refresh(layerData, layerConfig, self._nextLayer)    --下次可以攻打的层数

end

--最后一个关卡是否可见
function TowerView:_checkLastStageVisible()
    if self._nextLayer == self._pageIds[#self._pageIds] then
        self._nodeStages[#self._nodeStages]:setVisible(true)
    else
        self._nodeStages[#self._nodeStages]:setVisible(false)
    end
end

function TowerView:_refreshStage()
    local TowerData = G_UserData:getTowerData()
    self._nowLayer = TowerData:getNow_layer()
    self._pageIds = self:_getShowPage()
    for i, v in pairs(self._pageIds) do
        self:_refreshStageNode(i)
    end
    -- self:_checkLastStageVisible()
end

--根据layer获得当前在哪一页上
function TowerView:_getShowPage()
    local group = 0
    local nowLayerConfig = nil
    if self._nowLayer ~= 0 then
        nowLayerConfig = EquipStage.get(self._nowLayer)
        assert(nowLayerConfig, "tower id is wrong,"..self._nowLayer)
    end
    if self._nowLayer == 0 then
        self._nextLayer = EquipStage.indexOf(1).id
    elseif nowLayerConfig.box_id ~= 0 and not G_UserData:getTowerData():getLayerByIndex(self._nowLayer):isReceive_box() then  
        self._nextLayer = self._nowLayer
    else
        self._nextLayer = EquipStage.get(self._nowLayer).next_id
    end
    if self._nextLayer == 0 then --临时避免报错，add by liangxu 2018-8-27 11:06:40
        self._nextLayer = nowLayerConfig.id
    end
    local group = EquipStage.get(self._nextLayer).group
    local layerCount = EquipStage.length()
    local layerIds = {}
    for i = 1, layerCount do
        if EquipStage.indexOf(i).group == group then
            local layerData = EquipStage.indexOf(i)
            table.insert(layerIds, layerData.id)
        end
    end
    table.sort(layerIds, function(a, b) return a < b end)
    return layerIds
end

--点击扫荡
function TowerView:_onSweepClick()
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local isOpened, errMsg = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_TOWER_SWEEP)
    if isOpened == false then
        if errMsg then G_Prompt:showTip(errMsg) end
        return
    end
    if self._nowLayer ~= 0 then
        local nowLayerConfig = EquipStage.get(self._nowLayer)
        assert(nowLayerConfig, "tower id is wrong,"..self._nowLayer)
        if nowLayerConfig.box_id ~= 0 and not G_UserData:getTowerData():getLayerByIndex(self._nowLayer):isReceive_box() then  
            self._nextLayer = self._nowLayer
            self:_onBoxClick()
            return 
        end
    end
    local layerData = G_UserData:getTowerData():getLayerByIndex(self._nextLayer)

    if not layerData or layerData:getStar() < 3 then
        G_Prompt:showTip(Lang.get("challenge_tower_cannot_sweep"))
    else
        G_UserData:getTowerData():sendSweep()  
    end
end

--接收box
function TowerView:_onEventGetBox(eventName, rewards)
    self:_refreshStage()
    self:_refreshBoxState()  

    local PopupGetRewards = require("app.ui.PopupGetRewards").new()
    PopupGetRewards:showRewards(rewards)
      
end

--收到排行榜
function TowerView:_onEventTowerRank()
    if self._rankClick then
        local popupTowerRank = require("app.scene.view.tower.PopupTowerRank").new()
        popupTowerRank:openWithAction() 
    end
    self._rankClick = false
end

--收到扫荡信息
function TowerView:_onEventSweep(eventName, results)
    local towerSweep = require("app.scene.view.tower.TowerSweep").new(self._nextLayer, results, handler(self, self._sweepExit))
    towerSweep:openWithAction()    
end

--获得宝箱奖励详情
function TowerView:_getBoxReward()
    local layerId = self._boxLayer
    local boxId = EquipStage.get(layerId).box_id
    local rewards = require("app.utils.DropHelper").getDropReward(boxId)
    local title = Lang.get("challenge_tower_box_title")   
    local detail = Lang.get("challenge_tower_box_detail", {count = layerId}) 
    return rewards, title, detail
end

--点击box
function TowerView:_onBoxClick()
    local rewards, title, detail = self:_getBoxReward()
    local popupBoxReward = require("app.ui.PopupBoxReward").new(title, handler(self, self._getBox))
    popupBoxReward:updateUI(rewards)
    if self._boxState == TowerView.BOX_STATE_CLOSE or self._boxState == TowerView.BOX_STATE_OPEN then
        popupBoxReward:setBtnText(Lang.get("get_box_reward"))
    elseif self._boxState == TowerView.BOX_STATE_EMPTY then
        popupBoxReward:setBtnText(Lang.get("got_star_box"))
        popupBoxReward:setBtnEnable(false)
    end
    popupBoxReward:setDetailText(detail) 
    popupBoxReward:openWithAction()              
end

--领宝箱
function TowerView:_getBox()
    if self._nowLayer < self._boxLayer then
        G_Prompt:showTip(Lang.get("challenge_tower_box_cannot_get", {count = self._boxLayer}))
        return
    end
    G_UserData:getTowerData():openBox(self._boxLayer)
end

--点击排行榜
function TowerView:_onRankClick()
    self._rankClick = true
    G_UserData:getTowerRankData():c2sGetTowerStarRank()
end

--点击商店
function TowerView:_onShopClick()
    local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
    WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_EQUIP_SHOP)
end

function TowerView:_refreshBoxState()
    -- 找到本页有宝箱的
    self._boxLayer = 0
    for i, v in pairs(self._pageIds) do
        local layer = v
        local layerConfig = EquipStage.get(layer)
        if layerConfig.box_id ~= 0 then
            self._boxLayer = layer
            if self._boxLayer <= self._nowLayer then
                local layerData = G_UserData:getTowerData():getLayerByIndex(layer)
                if layerData:isReceive_box() then
                    self._boxState = TowerView.BOX_STATE_EMPTY
                else
                    self._boxState = TowerView.BOX_STATE_OPEN
                end
            else 
                self._boxState = TowerView.BOX_STATE_CLOSE
            end
            break
        end
    end
    if self._boxEft then
        self._boxEft:removeFromParent(true)
        self._boxEft = nil
    end
    if self._boxState == TowerView.BOX_STATE_CLOSE then
        self._imageBox:loadTexture(Path.getChapterBox("img_mapbox_guan"))
        self._imageBox:setVisible(true)
    elseif self._boxState == TowerView.BOX_STATE_EMPTY then
        self._imageBox:loadTexture(Path.getChapterBox("img_mapbox_kong"))
        self._imageBox:setVisible(true)
    elseif self._boxState == TowerView.BOX_STATE_OPEN then
        self._imageBox:setVisible(false)
        local EffectGfxNode = require("app.effect.EffectGfxNode")
        local function effectFunction(effect)
            if effect == "effect_boxjump"then
                local subEffect = EffectGfxNode.new("effect_boxjump")
                subEffect:play()
                return subEffect 
            end
        end
        local effect = G_EffectGfxMgr:createPlayMovingGfx( self._panelBox, "moving_boxjump", effectFunction, nil, false ) 
        local size = self._panelBox:getContentSize()
        effect:setPosition(size.width*0.5, size.height*0.5) 
        self._boxEft = effect
    end
end

--打开奇遇
function TowerView:_openSurprise(id)
    local PopupSurprise = require("app.scene.view.tower.PopupTowerSurprise").new(id)
    PopupSurprise:openWithAction()
end

--点击事件
function TowerView:_onEventClick(sender)
    for i, v in pairs(self._btnEvents) do
        if v == sender then
            self:_openSurprise(self._surprises[i])
        end
    end
end

function TowerView:_onSuperStageClick(sender)
    local popup = require("app.scene.view.tower.PopupTowerSuperStage").new()
    popup:openWithAction()
end

-- 角色升级，刷新按钮状态
function TowerView:_onEventUserLevelUpdate(event, param)
    self:_refreshMenuBtns()
end

function TowerView:_refreshMenuBtns()
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local visible = LogicCheckHelper.funcIsShow(FunctionConst.FUNC_TOWER_SUPER)
    self._btnSuperStage:setVisible(visible)
end 


return TowerView