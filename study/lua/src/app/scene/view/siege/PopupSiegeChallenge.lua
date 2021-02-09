local PopupBase = require("app.ui.PopupBase")
local PopupSiegeChallenge = class("PopupSiegeChallenge", PopupBase)

local Color = require("app.utils.Color")
local Path = require("app.utils.Path")
local HeroRes = require("app.config.hero_res")
local Hero = require("app.config.hero")

local DataConst = require("app.const.DataConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local RebelTime = require("app.config.rebel_time")
local RebelBase = require("app.config.rebel_base")
local CSHelper = require("yoka.utils.CSHelper")

local SiegeChallengeInfo = require("app.scene.view.siege.SiegeChallengeInfo")
local SiegeChallengeBtns = require("app.scene.view.siege.SiegeChallengeBtns")
local UserDataHelper = require("app.utils.UserDataHelper")
local SchedulerHelper = require ("app.utils.SchedulerHelper")


function PopupSiegeChallenge:ctor(siegeData, siegeUid, siegeId)
    self._siegeData = siegeData --表格信息
    self._siegeUid = siegeUid
    self._siegeId = siegeId
    self._bossId = 0        --用于分享的bossid
    -- self._challegeUid = self._siegeInfo:getUid()     --发现者id，用于刷新

    self._panelInfo = nil           --信息面板
    self._panelBtns = nil           --两个按钮
    self._effect = nil              --入侵动画

    self._scheduler = nil

    self._isEffectFinish = false    --动画是否结束

    --signal
    self._signalBattle = nil		--叛军战斗

    --ui
    self._panelTouch = nil          --触摸面板
    self._imageBG = nil             --背景图案
    self._continueNode = nil        --点击继续
    -- self._btnShare = nil            --分享按钮


	local resource = {
		file = Path.getCSB("PopupSiegeChallenge", "siege"),
		binding = {
            _panelTouch = 
            {
            	events = {{event = "touch", method = "_onCloseClick"}}
            },
            -- _btnShare = 
            -- {
            -- 	events = {{event = "touch", method = "_onShareClick"}}
            -- },

        }
	}
	PopupSiegeChallenge.super.ctor(self, resource, true, true)
end

function PopupSiegeChallenge:onCreate()
    self._continueNode:setVisible(false)
    -- self._btnShare:setVisible(false)
    -- self._btnShare:setString(Lang.get("siege_share"))
end

function PopupSiegeChallenge:onEnter()
    self._scheduler = SchedulerHelper.newSchedule(handler(self, self._update), 1)
    self._signalBattle = G_SignalManager:add(SignalConst.EVENT_SIEGE_BATTLE, handler(self, self._onEventSiegeBattle))
    self:_createAnim()
end

function PopupSiegeChallenge:onExit()
    if self._scheduler then
        SchedulerHelper.cancelSchedule(self._scheduler)
        self._scheduler = nil
    end
    self._signalBattle:remove()
    self._signalBattle = nil
    if self._panelInfo then
        self._panelInfo:removeFromParent()
        self._panelInfo = nil
    end
    if self._panelBtns then
        self._panelBtns:removeFromParent()
        self._panelBtns = nil
    end
    if self._effect then
        self._effect:removeFromParent()
        self._effect = nil
    end
end

--播放动画
function PopupSiegeChallenge:_createAnim()
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
		if string.find(effect, "effect_") then
            local subEffect = EffectGfxNode.new(effect)
            subEffect:play()
            return subEffect
        else
            return self:_createActionNode(effect) 
		end
    end
    local effect = G_EffectGfxMgr:createPlayMovingGfx( self._imageBG, "moving_jiaofei", effectFunction, handler(self, self._checkFinish) , false )	
    self._effect = effect
end

--动画组件
function PopupSiegeChallenge:_createActionNode(effect)
    local siegeInfo = G_UserData:getSiegeData():getSiegeEnemyData(self._siegeUid, self._siegeId)
    if effect == "name" then
        if not self._panelInfo then
            self._panelInfo = SiegeChallengeInfo.new()
            self._panelInfo:updateUI(self._siegeData, siegeInfo)
        end
        return self._panelInfo
    elseif effect == "button" then
        if not self._panelBtns then 
            self._panelBtns = SiegeChallengeBtns.new(self._panelInfo:isHalfTime(), self._siegeUid, self._siegeData.id, self._panelInfo:isLeave())
            self._panelBtns:setShareFunc(handler(self, self._onShareClick))
        end
        if siegeInfo:isPublic() then
            self._panelBtns:setShareVisible(false)
        end
        return self._panelBtns
	elseif effect == "role" then
		-- local heroResId = Hero.get(self._siegeData.res).res_id
		-- local heroImgId = HeroRes.get(heroResId).story_res
		-- local res = Path.getChatRoleRes(heroImgId)
        -- return display.newSprite(res)
        local roleNode = CSHelper.loadResourceNode(Path.getCSB("CommonStoryAvatar", "common"))
		roleNode:updateUI(self._siegeData.res)
		return roleNode
	end    
end

--检查结束事件
function PopupSiegeChallenge:_checkFinish(event)
    if event == "finish" then
        --抛出事件，点击全力一击
        G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP,self.__cname)
        -- self._scheduler = Scheduler.scheduleGlobal(handler(self, self._update), 1)
        self._continueNode:setVisible(true)
        self._isEffectFinish = true
    end
end

--关闭界面
function PopupSiegeChallenge:_onCloseClick()
    if self._isEffectFinish then
        self:close()
    end
end

function PopupSiegeChallenge:_update(f)
    if self._panelInfo and self._isEffectFinish then
        self._panelInfo:update()
    end
end

--战斗信号
function PopupSiegeChallenge:_onEventSiegeBattle(eventName, message)
	local ReportParser = require("app.fight.report.ReportParser")
    local reportData = ReportParser.parse( message.battle_report )
    local BattleDataHelper = require("app.utils.BattleDataHelper")
	local bossId = message.boss_id
	local background = RebelBase.get(bossId).in_res
    local battleData = BattleDataHelper.parseSiegeBattleData( message, background )
    self._bossId = bossId

	G_SceneManager:showScene("fight", reportData, battleData)
    if reportData:isWin() then
        self:close()
        return
    end
    if self._siegeUid ~= G_UserData:getBase():getId() then
        return 
    end

	local shareInfo = G_UserData:getSiegeData():getMyEnemyById(bossId)
    if shareInfo and shareInfo:getKiller_id() == 0 and not shareInfo:isPublic() then
        local isNotNeedConfirm = UserDataHelper.getPopModuleShow("PopupSiegeChallenge")
        if isNotNeedConfirm then
            --self:_shareBoss()
        else
            local alertInfo = Lang.get("siege_share_text")
            local popupSystemAlert = require("app.ui.PopupSystemAlert").new(Lang.get("siege_share"), 
                                                                            alertInfo, 
                                                                            handler(self, self._shareBoss)
                                                                        )
            --popupSystemAlert:setCheckBoxVisible(false)
            popupSystemAlert:setModuleName("PopupSiegeChallenge")
            popupSystemAlert:setCheckBoxCallback(handler(self, self._onCheckBoxClick))
            popupSystemAlert:openWithAction()
        end
    end
end

function PopupSiegeChallenge:_onCheckBoxClick(isCheck)
    UserDataHelper.setPopModuleShow("PopupSiegeChallenge", isCheck)
end

--点击分享
function PopupSiegeChallenge:_onShareClick()
    local siegeInfo = G_UserData:getSiegeData():getSiegeEnemyData(self._siegeUid, self._siegeId)
    if not siegeInfo then 
        G_Prompt:showTip(Lang.get("siege_wrong_share"))
        self:close()
        return
    end
    if not siegeInfo:isPublic() then
        G_UserData:getSiegeData():c2sRebArmyPublic(self._siegeId)
    else 
        G_Prompt:showTip(Lang.get("siege_already_share"))
    end
end

--分享
function PopupSiegeChallenge:_shareBoss()
    if not G_UserData:getGuild():isInGuild() then
        G_Prompt:showTip(Lang.get("siege_no_guild"))
        return
    end
    G_UserData:getSiegeData():c2sRebArmyPublic(self._bossId)
end

return PopupSiegeChallenge