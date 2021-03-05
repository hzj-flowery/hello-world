local ViewBase = require("app.ui.ViewBase")
local GachaGoldenHeroChooseZhenyinView = class("GachaGoldenHeroChooseZhenyinView", ViewBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local GachaGoldenHeroConst = require("app.const.GachaGoldenHeroConst")
local UserDataHelper = require("app.utils.UserDataHelper")
local scheduler = require("cocos.framework.scheduler")
local AudioConst = require("app.const.AudioConst")

function GachaGoldenHeroChooseZhenyinView:waitEnterMsg(callBack)
	local function onMsgCallBack(id, message)
		callBack()
    end

	G_UserData:getGachaGoldenHero():c2sGachaEntry()
    local signal = G_SignalManager:add(SignalConst.EVENT_GACHA_GOLDENHERO_ENTRY, onMsgCallBack)
    
    G_SpineManager:addSpine(Path.getEffectSpine("jinjiangzhenying"), 1.0)
    
	return signal
end

function GachaGoldenHeroChooseZhenyinView:ctor(heroId)
    self._nodeEffectChoose  = nil
    self._enterEffectIsEnd = false
    self._zhenyinEffectIsBegin = false
    self._currentChooseZhenyin = 0
    
    local resource = {
        file = Path.getCSB("GachaGoldHeroChooseZhenyin", "gachaGoldHeroChooseZhenyin"),
        size = G_ResolutionManager:getDesignSize(),
        binding = {
            _panelWei = {
				events = {{event = "touch", method = "_onChooseWeiCallback"}}
            },
            _panelShu = {
				events = {{event = "touch", method = "_onChooseShuCallback"}}
            },
            _panelWu = {
				events = {{event = "touch", method = "_onChooseWuCallback"}}
            },
            _panelQun = {
				events = {{event = "touch", method = "_onChooseQunCallback"}}
            },
        }
    }
    GachaGoldenHeroChooseZhenyinView.super.ctor(self, resource)
end

function GachaGoldenHeroChooseZhenyinView:onCreate()
    self:_playChooseZhenYinEffect()

    self._topBar:setImageTitle("txt_sys_jianlongzaitian")
    local TopBarStyleConst = require("app.const.TopBarStyleConst")
    self._topBar:updateUI(TopBarStyleConst.STYLE_GOLD_GACHA, true)
end

function GachaGoldenHeroChooseZhenyinView:onEnter()

end

function GachaGoldenHeroChooseZhenyinView:onExit()

end

function GachaGoldenHeroChooseZhenyinView:_onChooseWeiCallback(  )
    if self._enterEffectIsEnd == false or self._zhenyinEffectIsBegin == true then
        return
    end

    self:_playZhenyinEffect(1)
end

function GachaGoldenHeroChooseZhenyinView:_onChooseShuCallback(  )
    if self._enterEffectIsEnd == false or self._zhenyinEffectIsBegin == true then
        return
    end

    self:_playZhenyinEffect(2)
end

function GachaGoldenHeroChooseZhenyinView:_onChooseWuCallback(  )
    if self._enterEffectIsEnd == false or self._zhenyinEffectIsBegin == true then
        return
    end

    self:_playZhenyinEffect(3)
end

function GachaGoldenHeroChooseZhenyinView:_onChooseQunCallback(  )
    if self._enterEffectIsEnd == false or self._zhenyinEffectIsBegin == true then
        return
    end

    self:_playZhenyinEffect(4)
end

function GachaGoldenHeroChooseZhenyinView:_playChooseZhenYinEffect(  )
    local function effectFunction(effect)
	end
	
    local function eventFunction(event)
        if event == "finish" then
            self._enterEffectIsEnd = true
            self:_playLoopEffect()
        end
    end

    G_AudioManager:playSoundWithId(AudioConst.SOUND_GACHA_GOLDEN_OPEN)
    
    self._nodeEffectChoose:removeAllChildren()
    G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffectChoose, "moving_jinjiangzhanmu_zhenyingxuanzecome", effectFunction, eventFunction , false)
end

function GachaGoldenHeroChooseZhenyinView:_playLoopEffect(  )
    local function effectFunction(effect)
	end
	
    local function eventFunction(event)
        if event == "finish" then
        end
    end
    
    self._nodeEffectLoop:removeAllChildren()
    G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffectLoop, "moving_jinjiangzhanmu_zhenyingxuanzeidle", effectFunction, eventFunction , false)
end

function GachaGoldenHeroChooseZhenyinView:_playZhenyinEffect (zhenyinIndex)
    self._zhenyinEffectIsBegin = true 
    self._currentChooseZhenyin = zhenyinIndex

    G_AudioManager:playSoundWithId(AudioConst.SOUND_GACHA_GOLDEN_OPEN1)

    local function effectFunction(effect)
	end
	
    local function eventFunction(event)
        if event == "finish" then
            G_SceneManager:replaceCurrentScene("gachaGoldHero", self._currentChooseZhenyin)
        end
    end

    local randomIndex = math.random(2)
    print("randomIndex "..randomIndex)
    local soundName = ""

    local movingJsonName = ""
    if self._currentChooseZhenyin == 1 then     --魏
        movingJsonName = "moving_jinjiangzhanmu_zhenyingxuanzewei"
        soundName = "SOUND_WEI" .. randomIndex
    elseif self._currentChooseZhenyin == 2 then --蜀
        movingJsonName = "moving_jinjiangzhanmu_zhenyingxuanzeshu"
        soundName = "SOUND_SHU" .. randomIndex
    elseif self._currentChooseZhenyin == 3 then --吴
        movingJsonName = "moving_jinjiangzhanmu_zhenyingxuanzewu"
        soundName = "SOUND_WU" .. randomIndex
    elseif self._currentChooseZhenyin == 4 then --群
        movingJsonName = "moving_jinjiangzhanmu_zhenyingxuanzequn"
        soundName = "SOUND_QUN" .. randomIndex
    end

    G_AudioManager:playSoundWithId(AudioConst[soundName])
    
    self._nodeEffectChoose:removeAllChildren()
    self._nodeEffectLoop:removeAllChildren()
    G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffectChoose, movingJsonName, effectFunction, eventFunction , false)
end


return GachaGoldenHeroChooseZhenyinView