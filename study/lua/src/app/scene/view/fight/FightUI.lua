local ViewBase = require("app.ui.ViewBase")
local FightUI = class("FightUI", ViewBase)

local Path = require("app.utils.Path")
local Engine = require("app.fight.Engine")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local FunctionConst = require("app.const.FunctionConst")
local CustomNumLabel = require("app.ui.number.CustomNumLabel")
local FightConfig = require("app.fight.Config")
local FightSignalConst = require("app.fight.FightSignalConst")
local FightSignalManager = require("app.fight.FightSignalManager")
local HeroRes = require("app.config.hero_res")

FightUI.HIDE_TOTAL_TIME = 0.4

function FightUI:ctor()
    self._textBoxNum = nil      --宝箱数量
    self._textRound = nil       --回合数   
    self._imageSpeed = nil      --切换速度
    self._imageJump = nil       --跳过按钮

    self._panelFourBtn = nil
    self._button1 = nil
    self._button2 = nil
    self._button3 = nil
    self._button4 = nil
    self._textSpeed = nil
    self._imageTotalDamage = nil        --总伤害

    self._battleSpeed = 1   --测试用
    
    self._speedCallback = nil
    self._totalNum = nil
    self._totalHeal = nil
    self._showLabel = nil
    self._hideStartTime = 0
    self._startHide = false
    self._image_ACC_BG = nil

	local resource = {
        file = Path.getCSB("FightUI", "fight"),
        size = G_ResolutionManager:getDesignSize(),
		binding = {
			_imageSpeed = {
				events = {{event = "touch", method = "_onSpeedTouch"}}
			},
            _imageJump = {
                events = {{event = "touch", method = "_onJumpTouch"}}
            },
            _imageJumpStory = 
            {
                events = {{event = "touch", method = "_onJumpTouch"}}
            },
			_button1 = {
				events = {{event = "touch", method = "_onSlow"}}
			},
            _button2 = {
                events = {{event = "touch", method = "_onFast"}}
			},  
            _button3 = {
				events = {{event = "touch", method = "_revert"}}
			},
            _button4 = {
                events = {{event = "touch", method = "_pause"}}
            },    
            _button5 = {
                events = {{event = "touch", method = "_reportParse"}}
            }
		}
	}
	FightUI.super.ctor(self, resource)
end

function FightUI:onCreate()
    self._textBoxNum:setString(0)
    if CONFIG_JUMP_BATTLE_ENABLE then
        self._panelFourBtn:setVisible(true)
    else
        self._panelFourBtn:setVisible(false)
    end
    self._totalNum = CustomNumLabel.create("num_battle_hit",Path.getBattleDir(), 0, CustomNumLabel.SIGN_NO, nil, true)
    self._imageTotalDamage:addChild(self._totalNum)
    self._totalNum:setPosition(138, 30)

    self._totalHeal = CustomNumLabel.create("num_battle_heal",Path.getBattleDir(), 0, CustomNumLabel.SIGN_NO, nil, true)
    self._imageTotalDamage:addChild(self._totalHeal)
    self._totalHeal:setPosition(138, 30)

    self:hideTotalHurt()

    cc.bind(self._commonChat,"CommonMiniChat")
end

function FightUI:onEnter()
    self:setPosition(cc.p(0, 0))

    local posLeft = G_ResolutionManager:getBangOffset()
    self._nodeLeft:setPositionX(posLeft)

    local posRight = G_ResolutionManager:getDesignCCSize().width - posLeft
    self._nodeRight:setPositionX(posRight)
end

function FightUI:setSpeedVisible(s)
    self._imageSpeed:setVisible(s)
    self._image_ACC_BG:setVisible(s)
end

function FightUI:setSpeedCallback(callback)
    self._speedCallback = callback  
end

function FightUI:refreshSpeed(speed)
    local image = Path.getBattleRes("btn_battle_acc0"..speed)
    self._imageSpeed:loadTexture(image)
end

function FightUI:_onJumpTouch()
    if CONFIG_JUMP_BATTLE_ENABLE and self._battleSpeed == 0 then
        self._battleSpeed = 1
        local sharedScheduler = cc.Director:getInstance():getScheduler()
        sharedScheduler:setTimeScale(self._battleSpeed)
    end
    local engine = Engine.getEngine()
    engine:jumpToEnd()
    self:setVisible(false)
end

function FightUI:setJumpVisible(v)
    if CONFIG_JUMP_BATTLE_ENABLE then
        self._imageJump:setVisible(true)
    else 
        self._imageJump:setVisible(v)
    end
end

function FightUI:_onSpeedTouch()
    self._speedCallback()
end

function FightUI:setItemCount(count)
    self._textBoxNum:setString(count)
end

function FightUI:updateRound()
    local engine = require("app.fight.Engine").getEngine()
    local round = engine:getBattleRound()
    local maxRound = engine:getMaxRound()
    self._textRound:setString(round .. "/" .. maxRound)
    if round >= FightConfig.SHOW_JUMP_ROUND then
        self._imageJump:setVisible(true)
    end
end

function FightUI:_onSlow()
    if self._battleSpeed > 0 then
        self._battleSpeed = self._battleSpeed / 2
        local sharedScheduler = cc.Director:getInstance():getScheduler()
        sharedScheduler:setTimeScale(self._battleSpeed)
        self._textSpeed:setString(self._battleSpeed)
    end
end

function FightUI:_onFast()
    self._battleSpeed = self._battleSpeed * 2
    local sharedScheduler = cc.Director:getInstance():getScheduler()
    sharedScheduler:setTimeScale(self._battleSpeed)
    self._textSpeed:setString(self._battleSpeed)
end

function FightUI:_revert()
    self._battleSpeed = 1
    local sharedScheduler = cc.Director:getInstance():getScheduler()
    sharedScheduler:setTimeScale(self._battleSpeed)
    self._textSpeed:setString(self._battleSpeed)
end

function FightUI:_pause()
    if self._battleSpeed ~= 0 then
        self._battleSpeed = 0
    else
        self._battleSpeed = 1
    end
    local sharedScheduler = cc.Director:getInstance():getScheduler()
    sharedScheduler:setTimeScale(self._battleSpeed)
    self._textSpeed:setString(self._battleSpeed)
end

function FightUI:_refreshTotalLabel(type)
    self._totalNum:setVisible(false)
    self._totalHeal:setVisible(false)
    if type == 1 then
        self._imageTotalDamage:loadTexture(Path.getBattleFont("txt_allheal_bg"))
        self._totalHeal:setVisible(true)
        self._showLabel = self._totalHeal
    elseif type == -1 then
        self._imageTotalDamage:loadTexture(Path.getBattleFont("txt_alldamage_bg"))
        self._totalNum:setVisible(true)
        self._showLabel = self._totalNum
    end
end

function FightUI:_convertHurt(val)
    local convertType = 0
    if CONFIG_SHOW_BATTLEHURT_CONVERT then
        return val, convertType
    end

    if checknumber(val) and math.abs(val) > 100000000 then
        if val < 0 then
            convertType = -1
            val = -math.floor(math.abs(val)/10000)
        else
            convertType = 1
            val = math.floor(val/10000)
        end
    end
    return val, convertType
end

function FightUI:updateTotalHurt(val, type)
    local val, convertType = self:_convertHurt(val)
    self:_refreshTotalLabel(type)
    self._imageTotalDamage:setVisible(true)
    local action1 = cc.ScaleTo:create(0.05, 1.5)
    local action2 = cc.CallFunc:create(function() self._showLabel:setNumber(val, convertType) end)
    local action3 = cc.ScaleTo:create(0.05, 1)
    local action = cc.Sequence:create(action1, action2, action3)
    self._showLabel:runAction(action)
end

function FightUI:hideTotalHurt()
    -- self._imageTotalDamage:setVisible(false)
    -- self._totalNum:setNumber(0)
    self._hideStartTime = 0
    self._startHide = true
end

function FightUI:update(f)
    if self._startHide then
        if self._hideStartTime >= FightUI.HIDE_TOTAL_TIME then
            self._imageTotalDamage:setVisible(false)
            self._totalNum:setNumber(0)
            self._totalHeal:setNumber(0)
            self._startHide = false
        else
            self._hideStartTime = self._hideStartTime + f
        end
    end
end

--关闭聊天弹出的各种窗口
function FightUI:closeChatUI()
    
    local isMiniInRecordVoice = self._commonChat:isInRecordVoice()--是否小聊天窗在录音
    if not isMiniInRecordVoice then
         G_SignalManager:dispatch(SignalConst.EVENT_VOICE_RECORD_CHANGE_NOTICE,true)
    end
   
    local chatMainView  = G_SceneManager:getRunningScene():getPopupByName("ChatMainView")
    if chatMainView then
        chatMainView:forceClose()
    end
    local popupUserBaseInfo  = G_SceneManager:getRunningScene():getPopupByName("PopupUserBaseInfo")
    if popupUserBaseInfo then
        popupUserBaseInfo:close()
    end
    local popupUserDetailInfo  = G_SceneManager:getRunningScene():getPopupByName("PopupUserDetailInfo")
    if popupUserDetailInfo then
        popupUserDetailInfo:close()
    end

    local popupChatSetting  = G_SceneManager:getRunningScene():getPopupByName("PopupChatSetting")
    if popupChatSetting then
        popupChatSetting:close()
    end
    
    
    local chatVoiceView  = G_SceneManager:getRunningScene():getVoiceViewByName("ChatVoiceView")
    if not isMiniInRecordVoice and chatVoiceView then
        chatVoiceView:close()
    end

end

function FightUI:setJumpStoryVisible(v)
    self._imageJumpStory:setVisible(v)
end

function FightUI:setPanelVisible(v)
    self._nodeLeft:setVisible(v)
    self._nodeRight:setVisible(v)
    self._commonChat:setVisible(v)
end

function FightUI:playSkillAnim(camp, anim, petId, color)
    local node = self["_nodeSkill"..camp]
    if node then 
        local function effectFunction(effect)
            if effect == "shenshou_zi_sb" then 
                local pic = Path.getSkillShow(petId.."_z")
                local image = cc.Sprite:create(pic)
                return image
            elseif effect == "shenshou_tu_sb" then 
                local pic = Path.getBattlePet(petId.."_s")
                local image = cc.Sprite:create(pic)
                return image
            elseif effect == "shenshou_pinzhi_sb" then 
                local pic = Path.getBattlePet(FightConfig.PET_COLOR_BG[color])
                local image = cc.Sprite:create(pic)
                return image
            end
        end
        G_EffectGfxMgr:createPlayMovingGfx( node, anim, effectFunction, nil, true )
    end
end

function FightUI:playHistoryAnim(hisCamp, hisId, skillShowId, stageId)
    self:setVisible(true)
    local CSHelper  = require("yoka.utils.CSHelper")
    local HistoricalHero = require("app.config.historical_hero") 
    local HeroSkillPlay = require("app.config.hero_skill_play")
    local fightSignalManager = FightSignalManager.getFightSignalManager()
    local heroData = HistoricalHero.get(hisId)
    assert(heroData, "wrong history hero id "..hisId)
    local heroResData = HeroRes.get(heroData.res_id)
    assert(heroResData, "wrong history hero res id "..heroData.res_id)
    -- local anim = FightConfig.getHistoryAnimShow(heroData.color, hisCamp)
    local anim = FightConfig.getHistoryAnimShow(heroData.color, hisCamp)
    local node = self["_nodeSkill"..hisCamp]
    if node then 
        local function effectFunction(effect)
            if effect == "weizi" then 
                local skillShow = HeroSkillPlay.get(skillShowId)
                assert(skillShow, "wrong skill show id = "..skillShowId)
                local image = Path.getSkillShow(skillShow.txt)
                local sprite = display.newSprite(image)
                return sprite   
            elseif effect == "lihui" then 
                local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonStoryAvatar", "common"))
                local resId = heroData.res_id
                avatar:updateUIByResId(resId)
                return avatar
            elseif effect == "texiao" then 
                local spineNode = require("yoka.node.SpineNode").new(1)
                spineNode:setAsset(Path.getFightEffectSpine(heroResData.hero_show_effect))
                spineNode:setAnimation("effect")
                return spineNode
            end
        end
        local function eventFunction(event)
            if event == "skill" then 
                fightSignalManager:dispatchSignal(FightSignalConst.SIGNAL_HISTORY_BUFF, stageId)
            elseif event == "finish" then 
                fightSignalManager:dispatchSignal(FightSignalConst.SIGNAL_HISTORY_SHOW_END, stageId)
            end
        end
        G_EffectGfxMgr:createPlayMovingGfx( node, anim, effectFunction, eventFunction, true )
    end
end

-- 战报解析
function FightUI:_reportParse()
    if self._battleSpeed == 0 then
        self:_pause()
    end

    local battleReport          = G_UserData:getFightReport():getReport()
    local reportParseManager    = require("app.fight.reportParse.ReportParseManager").new()
    reportParseManager:setReport(battleReport)
    local result = reportParseManager:getAllReport()

    local function callback()
        self:_pause()
    end

    local popup = require("app.ui.PopupReportParse").new(self,result,callback)
    popup:openWithAction()
end

return FightUI
