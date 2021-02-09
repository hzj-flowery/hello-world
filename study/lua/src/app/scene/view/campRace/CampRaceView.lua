local ViewBase = require("app.ui.ViewBase")
local CampRaceView = class("CampRaceView", ViewBase)
local CampRaceHelper = require("app.scene.view.campRace.CampRaceHelper")
local CampRaceConst = require("app.const.CampRaceConst")
local CampRaceSignin = require("app.scene.view.campRace.CampRaceSignin")
local CampRacePreMatch = require("app.scene.view.campRace.CampRacePreMatch")
local CampRacePlayOff = require("app.scene.view.campRace.CampRacePlayOff")

local LAYER_INDEX_1 = 1 --报名子界面索引
local LAYER_INDEX_2 = 2 --预赛子界面索引
local LAYER_INDEX_3 = 3 --季后赛子界面索引

local TITLE_IMG     = {
    "txt_sys_com_zhenyingjingji",   -- 阵容竞技
    "txt_sys_com_yusai",            -- 预赛
    "txt_sys_com_baqiangsai",       -- "八强赛"
    "txt_sys_com_banjuesai",        -- 半决赛
    "txt_sys_com_juesai",           -- 决赛
    "txt_sys_com_bisaijieshu",      -- 比赛结束
}

function CampRaceView:ctor()
	local resource = {
		file = Path.getCSB("CampRaceView", "campRace"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
		}
	}
    CampRaceView.super.ctor(self, resource)
    self:setName("CampRaceView")
end

function CampRaceView:onCreate()
    self._topbarBase:setImageTitle("txt_sys_com_zhenyingjingji")
    self._topbarBase:setItemListVisible(false)

    self:_initData()
    self:_initView()
end

function CampRaceView:_initData()
    self._curLayerIndex = 0 -- 当前子界面的索引
    self._subLayers = {} -- 存不同子界面
end

function CampRaceView:_initView()
    
end

function CampRaceView:onEnter()
    self._signalGetBattleReport = G_SignalManager:add(SignalConst.EVENT_GET_CAMP_REPORT, handler(self, self._onEventGetReport)) --播放战报
    self._signalGetBaseInfo = G_SignalManager:add(SignalConst.EVENT_GET_CAMP_BASE_INFO, handler(self, self._onEventBaseInfo)) --获得基本信息，主要是状态
    self._signalUpdateState = G_SignalManager:add(SignalConst.EVENT_CAMP_UPDATE_STATE, handler(self, self._onEventUpdateState)) --季后赛状态刷新
    self._signalUpdateTitle = G_SignalManager:add(SignalConst.EVENT_CAMP_RACE_UPDATE_TITLE, handler(self, self._refreshTitle))

    self:_updateSubLayer()
    self:_refreshTitle()
    self:_checkIsGetChampion()
end

function CampRaceView:onExit()
    self._signalGetBattleReport:remove()
    self._signalGetBattleReport = nil
    self._signalGetBaseInfo:remove()
    self._signalGetBaseInfo = nil
    self._signalUpdateState:remove()
    self._signalUpdateState = nil
    self._signalUpdateTitle:remove()
    self._signalUpdateTitle = nil
end

function CampRaceView:_getCurSubLayer()
    local subLayer = self._subLayers[self._curLayerIndex]
    if subLayer == nil then
        subLayer = self:_createSubLayer(self._curLayerIndex)
    end
    return subLayer
end

function CampRaceView:_createSubLayer(layerIndex)
    local subLayer = nil

    if layerIndex == LAYER_INDEX_1 then
        subLayer = CampRaceSignin.new()
    elseif layerIndex == LAYER_INDEX_2 then
        subLayer = CampRacePreMatch.new()
    elseif layerIndex == LAYER_INDEX_3 then
        subLayer = CampRacePlayOff.new() 
    end

    if subLayer then
        self._nodeBase:addChild(subLayer)
        self._subLayers[layerIndex] = subLayer
    end

    return subLayer
end

function CampRaceView:_getLayerIndex(state)
    local layerIndex = 0

    if state == CampRaceConst.STATE_PRE_OPEN then
        layerIndex = LAYER_INDEX_1
    elseif state == CampRaceConst.STATE_PRE_MATCH then
        if not G_UserData:getCampRaceData():isSignUp() then
            layerIndex = LAYER_INDEX_1
        else
            layerIndex = LAYER_INDEX_2
        end
    elseif state == CampRaceConst.STATE_PLAY_OFF then
        layerIndex = LAYER_INDEX_3
    end

    return layerIndex
end

function CampRaceView:_updateSubLayer()
    local state = G_UserData:getCampRaceData():getStatus()
    local layerIndex = self:_getLayerIndex(state)
    self._curLayerIndex = layerIndex
    
    for k, subLayer in pairs(self._subLayers) do
        subLayer:setVisible(false)
        subLayer:onHide()
    end
    local curLayer = self:_getCurSubLayer()
    curLayer:setVisible(true)
    curLayer:onShow()
    curLayer:updateInfo()
end

function CampRaceView:_refreshTitle()
    local smallCamps = {8,5,7,6}
    local state = G_UserData:getCampRaceData():getStatus()
    if state == CampRaceConst.STATE_PRE_OPEN then  
        self._topbarBase:setImageTitle(TITLE_IMG[1])
        self._imageCamp:setVisible(false)
    elseif state == CampRaceConst.STATE_PRE_MATCH then
        self._topbarBase:setImageTitle(TITLE_IMG[2])
        self._imageCamp:setVisible(true)
        local showCamp = G_UserData:getCampRaceData():getMyCamp()
        local campSmall = Path.getTextSignet("img_com_camp0"..smallCamps[showCamp])
        self._imageCamp:loadTexture(campSmall)
    elseif state == CampRaceConst.STATE_PLAY_OFF then
        local showCamp = G_UserData:getCampRaceData():findCurWatchCamp()
        local finalStatus = G_UserData:getCampRaceData():getFinalStatusByCamp(showCamp)
        local campSmall = Path.getTextSignet("img_com_camp0"..smallCamps[showCamp])
        self._imageCamp:loadTexture(campSmall)
        self._imageCamp:setVisible(true)
        if TITLE_IMG[finalStatus + 2] then
            self._topbarBase:setImageTitle(TITLE_IMG[finalStatus + 2])
        else
            self._topbarBase:setImageTitle("")
        end
    end
end

function CampRaceView:_onEventGetReport(eventName, battleReport)
	-- local ReportParser = require("app.fight.report.ReportParser")
    -- local reportData = ReportParser.parse(battleReport)

    local function enterFightView()
        local battleReport = G_UserData:getFightReport():getReport()
        local ReportParser = require("app.fight.report.ReportParser")
        local reportData = ReportParser.parse(battleReport)
        local leftName = reportData:getLeftName()
        local leftOfficer = reportData:getAttackOfficerLevel()
        local rightName = reportData:getRightName()
        local rightOfficer = reportData:getDefenseOfficerLevel()
        local winPos = 1 
        if not reportData:isWin() then 
            winPos = 2
        end
        local battleData = require("app.utils.BattleDataHelper").parseCampRace(leftName, rightName, leftOfficer, rightOfficer, winPos)
    
        G_SceneManager:showScene("fight", reportData, battleData)
    end

    G_SceneManager:registerGetReport(battleReport, function() enterFightView() end)

end

function CampRaceView:_onEventBaseInfo(eventName)
    if self:_checkIsIntoPlayOffStatus() == true then --进入决赛阶段，先播放“晋级成功/失败”特效，再切换到决赛场景
        self:_playPromotedAnim()
    else
        self:_updateSubLayer()
        self:_refreshTitle()
    end
end

function CampRaceView:_onEventUpdateState(eventName, camp)
    self:_refreshTitle()
    self:_checkIsAllFinish()
end

function CampRaceView:_onReturnClick()
    G_SceneManager:popScene()
end

--检测是否从预赛阶段进入了决赛阶段(只针对参赛者)
function CampRaceView:_checkIsIntoPlayOffStatus()
    local state = G_UserData:getCampRaceData():getStatus()
    if state == CampRaceConst.STATE_PLAY_OFF then 
        local isSignUp = G_UserData:getCampRaceData():isSignUp()
        if isSignUp then
            return true
        else
            return false
        end
    else
        return false
    end
end

function CampRaceView:_playPromotedAnim()
    local camp = G_UserData:getCampRaceData():getMyCamp()
    local preRankData = G_UserData:getCampRaceData():getPreRankWithCamp(camp)
    if preRankData == nil then
        return
    end
	local myRank = preRankData:getSelf_rank()

    local effectName = ""
	if myRank <= 8 then 
		effectName = "effect_jingji_chenggongjinji"
    else
        effectName = "effect_jingji_jinjishibai"
	end

	G_EffectGfxMgr:createPlayGfx(self._nodeEffect, effectName, function() self:_updateSubLayer() end)
end

function CampRaceView:_checkIsAllFinish()
    local isAllFinish = G_UserData:getCampRaceData():isAllRaceFinish()
    if isAllFinish then
        local AuctionConst = require("app.const.AuctionConst")
        local isAuctionWorldEnd = G_UserData:getAuction():isAuctionShow(AuctionConst.AC_TYPE_ARENA_ID)
        if isAuctionWorldEnd == false then
            return
        end

        local status = G_UserData:getCampRaceData():getStatus()
        if status == CampRaceConst.STATE_PRE_OPEN then 
            --跳转到拍卖界面
            local function onBtnGo()
                local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
                WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_AUCTION)
            end 
        
            local PopupSystemAlert = require("app.ui.PopupSystemAlert").new(Lang.get("camp_aution_title"), Lang.get("camp_aution_content"), onBtnGo)
            PopupSystemAlert:setCheckBoxVisible(false)
            PopupSystemAlert:showGoButton(Lang.get("worldboss_go_btn2"))
            PopupSystemAlert:setCloseVisible(true)
            PopupSystemAlert:openWithAction()
        end
    end
end

function CampRaceView:_checkIsGetChampion()
    if G_UserData:getCampRaceData():isSelfWinChampion() then
        self:_playGetChampionEffect()
        G_UserData:getCampRaceData():setSelfWinChampion(false)
        return true
    end
    return false
end

--播放恭喜夺冠
function CampRaceView:_playGetChampionEffect()
    local effectName = "effect_jingji_gongxiduoguan"
    G_EffectGfxMgr:createPlayGfx(self._nodeEffect, effectName, nil, true)
end

return CampRaceView
