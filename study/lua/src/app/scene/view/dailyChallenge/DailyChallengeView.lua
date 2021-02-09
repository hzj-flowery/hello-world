local ViewBase = require("app.ui.ViewBase")
local DailyChallengeView = class("DailyChallengeView", ViewBase)

local DailyCity = require("app.scene.view.dailyChallenge.DailyCity")
local DailyDungeonType = require("app.config.daily_dungeon_type")

local ReturnPrivilege = require("app.config.return_privilege")
local UserDataHelper = require("app.utils.UserDataHelper")
local ParameterIDConst = require("app.const.ParameterIDConst")

function DailyChallengeView:ctor()
    self._topBar = nil      --顶部栏
    self._cities = {}       --城市数组
    self._panelPos = {}     --位置数组

    --6个位置
    self._panelPos1 = nil
    self._panelPos2 = nil
    self._panelPos3 = nil
    self._panelPos4 = nil
    self._panelPos5 = nil
    self._panelPos6 = nil
    self._panelPos7 = nil

    self._signalTopBarPause = nil
    self._signalTopBarStart = nil

	local resource = {
		file = Path.getCSB("DailyChallengeView", "dailyChallenge"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
            _resetBtn  = {
                events = {{event = "touch", method = "_onResetDailyChallengeInfo"}}
            },
		}
	}
    self:setName("DailyChallengeView")
	DailyChallengeView.super.ctor(self, resource, 101)
end

function DailyChallengeView:onCreate()
    self._topBar:setImageTitle("txt_sys_com_rchangfuben")
 	local TopBarStyleConst = require("app.const.TopBarStyleConst")
    self._topBar:updateUI(TopBarStyleConst.STYLE_COMMON)
    
    self._panelPos = {self._panelPos1, self._panelPos2, self._panelPos3, self._panelPos4, 
        self._panelPos5, self._panelPos6, self._panelPos7,self._panelPos8}
    for idx, val in pairs(self._panelPos) do
        local city = self:createCityByType(idx)
        val:addChild(city)
        table.insert(self._cities, city)
    end

    self._resetBtn:setString(Lang.get("return_reset_btn_text"))
end

function DailyChallengeView:_resetTowerInfo()
    G_Prompt:showTip(Lang.get("return_reset_challenge_tips"))
    G_UserData:getDailyDungeonData():pullData()

    local resetTimes = G_UserData:getReturnData():getDailyChallengeResetTimes()
    self._resetBtn:setVisible(resetTimes > 0)
end

function DailyChallengeView:_onResetDailyChallengeInfo()
    local callbackOK = function ()
        local privilegeInfo = G_UserData:getReturnData():getPrivilegeInfo()
        local id = 0
    
        for k, v in pairs(privilegeInfo) do
            local configInfo = ReturnPrivilege.get(v.id)
            if configInfo.privilege_type == 1 then
                id = v.id
                break
            end
        end
    
        G_UserData:getReturnData():c2sReceiveAwards(2, id)
    end

    local isNeedReset = G_UserData:getDailyDungeonData():isNeedReset()

    if isNeedReset == false then
        local title = Lang.get("guild_appoint_confirm_title")
        local content = Lang.get("return_reset_challenge_times_tips")
        local popupAlert = require("app.ui.PopupAlert").new(title, content, callbackOK)
        popupAlert:openWithAction()
    else
        callbackOK()
    end
end

function DailyChallengeView:_createFarGround()
    local farGround = self:getEffectLayer(ViewBase.Z_ORDER_FAR_GROUND)
   
    -- print("1112233 picName", picName)
    local width = G_ResolutionManager:getDesignWidth()
    local height = G_ResolutionManager:getDesignHeight()

    local picName = self._sceneData.farground
    if picName ~= "" then
        local pic = cc.Sprite:create(picName)
        pic:setAnchorPoint(cc.p(0.5, 1))
        farGround:addChild(pic)
       -- pic:setPositionY(height/2) 
        pic:setPosition(cc.p(0, height/2))       
    end
    
      local function effectFunction(effect)
        if effect == "richang_shenshou" then
            return display.newSprite(Path.getDailyChallengeIcon("build8"))    
        end
    end

    local effectName = self._sceneData.back_eft
	if effectName ~= "" then
        local effect = G_EffectGfxMgr:createPlayMovingGfx( farGround, Path.getFightSceneEffect(effectName), effectFunction, nil ,false ) 
        effect:setPosition(cc.p(0, 0))-- effect:setPosition(cc.p(width/2, height/2))
	end
end

function DailyChallengeView:_createBackGround()
    local grdBack =self:getEffectLayer(ViewBase.Z_ORDER_GRD_BACK)
   
    local width = G_ResolutionManager:getDesignWidth()
    local height = G_ResolutionManager:getDesignHeight()
    
    local picName = self._sceneData.background
    if picName ~= "" then
        local pic = cc.Sprite:create(picName)
        pic:setAnchorPoint(cc.p(0.5, 0.5))-- pic:setAnchorPoint(cc.p(0, 0))
        grdBack:addChild(pic)
    end


    local function effectFunction(effect)
        if effect == "richang_jinglianshi" then
            return display.newSprite(Path.getDailyChallengeIcon("build4"))
        elseif effect == "richang_shenbing" then
            return display.newSprite(Path.getDailyChallengeIcon("build7"))
        elseif effect == "richang_baowujinglianshi" then
            return display.newSprite(Path.getDailyChallengeIcon("build6"))
        elseif effect == "richang_gonggao" then
            return display.newSprite(Path.getDailyChallengeIcon("men"))
        elseif effect == "richang_baowujingyan" then
            return display.newSprite(Path.getDailyChallengeIcon("build5"))
        elseif effect == "richang_wujiangjinyan" then
            return display.newSprite(Path.getDailyChallengeIcon("build1"))
        elseif effect == "richang_yinbi" then
            return display.newSprite(Path.getDailyChallengeIcon("build2"))
        elseif effect == "richang_tupodan" then
            return display.newSprite(Path.getDailyChallengeIcon("build3"))
        elseif effect == "richang_shenshou" then
            return display.newSprite(Path.getDailyChallengeIcon("build6"))    
        end
    end
 
    local effectName = self._sceneData.middle_eft
	if effectName ~= "" then
        local effect = G_EffectGfxMgr:createPlayMovingGfx( grdBack, Path.getFightSceneEffect(effectName), effectFunction, nil ,false ) 
         effect:setPosition(cc.p(0, 0))--effect:setPosition(cc.p(width/2, height/2))
	end
end

function DailyChallengeView:enableTopBar(enable)
    -- print("1112233 enable ", tostring(enable))
    if enable then
        self._topBar:resumeUpdate()
    else 
        self._topBar:pauseUpdate()
    end
end

function DailyChallengeView:createCityByType(type)
    local dailyInfo = DailyDungeonType.get(type)
    local city = DailyCity.new(dailyInfo)
    return city
end

function DailyChallengeView:onEnter()
    self:enableTopBar(true)
    if G_UserData:getDailyDungeonData():isExpired() == true then
		G_UserData:getDailyDungeonData():pullData()
	end
    self._signalTopBarPause = G_SignalManager:add(SignalConst.EVENT_TOPBAR_PAUSE, handler(self, self._onEventTopBarPause))
    self._signalTopBarStart = G_SignalManager:add(SignalConst.EVENT_TOPBAR_START, handler(self, self._onEventTopBarStart))
    self._signalCommonZeroNotice = G_SignalManager:add(SignalConst.EVENT_COMMON_ZERO_NOTICE, handler(self, self._onEventCommonZeroNotice))
    --抛出新手事件出新手事件
    G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)

    self._signalResetTimes = G_SignalManager:add(SignalConst.EVENT_RETURN_RESET_TIMES, handler(self, self._resetTowerInfo))

    self:_onEventTopBarStart()

    local isRegression = G_UserData:getBase():isIs_regression()
    local resetTimes = G_UserData:getReturnData():getDailyChallengeResetTimes()
    self._resetBtn:setVisible(resetTimes > 0 and isRegression)
end

function DailyChallengeView:onExit()
    self._signalTopBarPause:remove()
    self._signalTopBarPause = nil

    self._signalTopBarStart:remove()
    self._signalTopBarStart = nil

    self._signalCommonZeroNotice:remove()
    self._signalCommonZeroNotice = nil
    
    self._signalResetTimes:remove()
	self._signalResetTimes = nil
end

function DailyChallengeView:_onEventTopBarPause()
    self._topBar:pauseUpdate()
end

function DailyChallengeView:_onEventTopBarStart()
    self._topBar:resumeUpdate()
end

function DailyChallengeView:_onEventCommonZeroNotice(event,hour)
    G_UserData:getDailyDungeonData():pullData()
end

return DailyChallengeView