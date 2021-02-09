local ViewBase = require("app.ui.ViewBase")
local GachaDrawHeroView = class("GachaDrawHeroView", ViewBase)
local GoldHeroLayer = import(".GoldHeroLayer")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local GachaGoldenHeroConst = require("app.const.GachaGoldenHeroConst")
local UserDataHelper = require("app.utils.UserDataHelper")
local scheduler = require("cocos.framework.scheduler")
local AudioConst = require("app.const.AudioConst")
local BullectScreenConst = require("app.const.BullectScreenConst")
local UIPopupHelper = require("app.utils.UIPopupHelper")

function GachaDrawHeroView:ctor(heroId, zhenyin)
    self._effectNode  = nil
    self._heroId = heroId
    self._isPageViewMoving = false
    self._isPlayAni = false
    self._currentChooseZhenyin = zhenyin or 0
    
    local resource = {
        file = Path.getCSB("GachaDrawHeroView", "gachaDrawGoldHero"),
        size = G_ResolutionManager:getDesignSize(),
        binding = {
			_commonBtnFree = {
				events = {{event = "touch", method = "_onButtonFree"}}
			},
			_commonBtnTen = {
				events = {{event = "touch", method = "_onButtonTen"}}
            },
            _btnGoGet = {
				events = {{event = "touch", method = "_onButtonToGet"}}
            },
        }
    }
    GachaDrawHeroView.super.ctor(self, resource)
end

function GachaDrawHeroView:onCreate()
    self:_initSelectedPos(self._heroId)
    self:_initIconImg()
    self:_initCountry()
    self:_initBtnDesc()
    self:_initCommonBtn()
    self:_showPanel(false)
end

function GachaDrawHeroView:onEnter()
    self._msgGacha   = G_NetworkManager:add(MessageIDConst.ID_S2C_Gacha, handler(self, self._s2cGacha))     -- 抽奖
    self._signalRewadsClose = G_SignalManager:add(SignalConst.EVENT_GACHA_GOLDENHERO_DRAWCLOSE, handler(self, self._onEventRewadsClose)) -- 关闭展示
    self._signalUpdateItem = G_SignalManager:add(SignalConst.EVENT_GACHA_GOLDENHERO_UPDATEITEM, handler(self, self._onEventUpdateItem))  -- 刷新道具
    self._signalUpdateItemPro = G_SignalManager:add(SignalConst.EVENT_RECV_CURRENCYS_INFO, handler(self, self._onEventUpdateItem))  -- 刷新道具

    self:_updateForward()
    self:_palyShowZhaomu()
    --self:_showPanel(true)
    --self:_initHuoGuangEffect()
    self:_updateDrawFreeDesc()
    self:_updateDrawTenDesc()
    self:_updateBulletLayer()
    --G_AudioManager:playSoundWithId(AudioConst.SOUND_GACHA_GOLDEN_OPEN)
    self._countDownScheduler = scheduler.scheduleGlobal(handler(self, self._update), 1.0)
end

function GachaDrawHeroView:onExit()
    self._msgGacha:remove()
    self._msgGacha = nil
    self._signalRewadsClose:remove()
    self._signalRewadsClose = nil
    self._signalUpdateItem:remove()
    self._signalUpdateItem = nil
    self._signalUpdateItemPro:remove()
    self._signalUpdateItemPro = nil
    
    local runningScene = G_SceneManager:getTopScene()
	if runningScene and runningScene:getName() ~= "fight" then
        G_BulletScreenManager:clearBulletLayer()
    end

    if self._countDownScheduler then
		scheduler.unscheduleGlobal(self._countDownScheduler)
		self._countDownScheduler = nil
	end
end

function GachaDrawHeroView:_updateBulletLayer( ... )
    local isOpenBullet = G_UserData:getBulletScreen():isBulletScreenOpen(BullectScreenConst.GACHA_GOLDENHERO_TYPE)
    if isOpenBullet then
        G_BulletScreenManager:setBulletScreenOpen(BullectScreenConst.GACHA_GOLDENHERO_TYPE,true)    
        G_BulletScreenManager:showBulletLayer()
    end
end

function GachaDrawHeroView:_updateTotalItem( ... )
    local total = UserDataHelper.getNumByTypeAndValue(GachaGoldenHeroConst.ITEM_DATA_TYPE, GachaGoldenHeroConst.ITEM_DATA_VALUE)
    local yubiNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2)

    self._textItemIconTotal:setString(Lang.get("gacha_goldenhero_itemtotal", {num = yubiNum}))
    self._textItemIconTotal1:setString(Lang.get("gacha_goldenhero_itemtotal", {num = total}))

    local targetPosX = (self._textItemIconTotal:getPositionX() + self._textItemIconTotal:getContentSize().width)
    self._btnGoGet:setPositionX(targetPosX)
    
    self._nodeItem2:setVisible(total > 0)
end

function GachaDrawHeroView:_initIconImg( ... )
    --local isReturnServer = G_GameAgent:isLoginReturnServer()
    local typeRes = TypeConvertHelper.convert(GachaGoldenHeroConst.ITEM_DATA_TYPE, GachaGoldenHeroConst.ITEM_DATA_VALUE, 1)
    local total = UserDataHelper.getNumByTypeAndValue(GachaGoldenHeroConst.ITEM_DATA_TYPE, GachaGoldenHeroConst.ITEM_DATA_VALUE)

    local yubiTypeRes = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2, 1)
    if yubiTypeRes.res_mini then
        self._imageItemIcon:loadTexture(yubiTypeRes.res_mini)
    end

    if typeRes.res_mini then
        self._imageItemIcon1:loadTexture(typeRes.res_mini)
        --self._commonRecharge:updateUI(GachaGoldenHeroConst.ITEM_DATA_TYPE, GachaGoldenHeroConst.ITEM_DATA_VALUE, 30, 1)
    end

    if total >= 10 then
        self._imageFreeIcon:loadTexture(typeRes.res_mini)
        self._imageTenIcon:loadTexture(typeRes.res_mini)
    elseif total > 0 then
        self._imageFreeIcon:loadTexture(typeRes.res_mini)
        self._imageTenIcon:loadTexture(yubiTypeRes.res_mini)
    else
        self._imageFreeIcon:loadTexture(yubiTypeRes.res_mini)
        self._imageTenIcon:loadTexture(yubiTypeRes.res_mini)
    end

    self._commonRecharge:setVisible(false)

    self:_updateTotalItem()
end

function GachaDrawHeroView:_initCommonBtn( ... )
    local TopBarStyleConst = require("app.const.TopBarStyleConst")
    self._topBar:setImageTitle("txt_sys_jianlongzaitian")
    self._topBar:updateUI(TopBarStyleConst.STYLE_GOLD_GACHA, true)
    self._topBar:setCallBackOnBack(handler(self, self._onReturnBack))
    self["_goldenBook"]:updateUI(FunctionConst.FUNC_GACHA_GOLDENHERO_BOOK)
    self["_goldenBook"]:addClickEventListenerEx(handler(self, self._onButtonClickShop)) 
end

function GachaDrawHeroView:_onReturnBack( ... )
    if self._isPlayAni then
        return
    end
    G_SceneManager:popScene()
end

function GachaDrawHeroView:_onButtonClickShop()
    local HeroDataHelper = require("app.utils.data.HeroDataHelper")
    local info = HeroDataHelper.getHeroConfig(self._heroId)
    local PopupHeroDetail = require("app.scene.view.heroDetail.PopupHeroDetail").new(
        TypeConvertHelper.TYPE_HERO,
        self._heroId,
        true,
        info.limit
    )
    PopupHeroDetail:openWithAction()

    local GachaGoldenHeroHelper = require("app.scene.view.gachaGoldHero.GachaGoldenHeroHelper")
    local heroList = GachaGoldenHeroHelper.getGoldHeroCfgWithCountry(self._currentChooseZhenyin)
    PopupHeroDetail:setPageData(heroList)
    PopupHeroDetail:setDrawing(true)
end

function GachaDrawHeroView:_toRecharge( ... )
    local popup = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))

    -- local isReturnServer = G_GameAgent:isLoginReturnServer()
    -- if isReturnServer then
    --     popup:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2)
    --     popup:openWithAction()
    -- else
    --     popup:updateUI(GachaGoldenHeroConst.ITEM_DATA_TYPE, GachaGoldenHeroConst.ITEM_DATA_VALUE)
    --     popup:openWithAction()
    -- end

    -- popup:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2)
    -- popup:openWithAction()
    local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
    WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_JADE2)
end

function GachaDrawHeroView:_showTips( ... )
    local entTime = G_UserData:getGachaGoldenHero():getEnd_time()
    if G_ServerTime:getLeftSeconds(entTime) <= 0 then
        G_Prompt:showTip(Lang.get("gacha_goldenhero_recharging"))
        return true
    end
    return false
end

function GachaDrawHeroView:_onButtonFree()
    if self._isPlayAni then
        return
    end

    if self:_showTips() then
        return
    end

    local function checkCost(itemNum, freeCnt, freeCD)
        if freeCnt > 0 and G_ServerTime:getLeftSeconds(freeCD) <= 0 then
            return true, 0
        else
            if itemNum > 0 then
                return true, 1
            else
                local yubiNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2)
                local Paramter = require("app.config.parameter")
                local onceNeedNum = tonumber(Paramter.get(883).content)
    
                if onceNeedNum <= yubiNum then
                    return true, 1, onceNeedNum
                else
                    self:_toRecharge()
                    return false
                end
            end 
        end
    end

    local itemNum = UserDataHelper.getNumByTypeAndValue(GachaGoldenHeroConst.ITEM_DATA_TYPE, GachaGoldenHeroConst.ITEM_DATA_VALUE)
    local freeCnt = G_UserData:getGachaGoldenHero():getFree_cnt()
    local freeCD = G_UserData:getGachaGoldenHero():getFree_cd()

    local costYuBi = nil
    local ret, typeIndex, costYuBi = checkCost(itemNum, freeCnt, freeCD)
    if ret == false then
        return
    end
    local params = {
		moduleName = "COST_YUBI_MODULE_NAME_1",
		yubiCount = costYuBi,
		itemCount = 1,
	}
    UIPopupHelper.popupCostYubiTip(params,  handler(self, self._doGacha), typeIndex)
end

function GachaDrawHeroView:_onButtonTen()
    if self._isPlayAni then
        return
    end

    if self:_showTips() then
        return
    end

    local function checkCost()
        local itemOwnerNum = UserDataHelper.getNumByTypeAndValue(GachaGoldenHeroConst.ITEM_DATA_TYPE, GachaGoldenHeroConst.ITEM_DATA_VALUE)
        if itemOwnerNum >= 10 then
            return true
        else
            local yubiNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2)
            local Paramter = require("app.config.parameter")
            local onceNeedNum = tonumber(Paramter.get(883).content)
            local totalNeedNum = onceNeedNum * 10
            if totalNeedNum <= yubiNum then
                return true, totalNeedNum
            else
                self:_toRecharge()
                return false
            end
        end
    end

    local ret, costYuBi = checkCost()
    if ret == false then
        return
    end
    local params = {
		moduleName = "COST_YUBI_MODULE_NAME_1",
		yubiCount = costYuBi,
		itemCount = 10,
	}
    UIPopupHelper.popupCostYubiTip(params, handler(self, self._doGacha), 2)
end

function GachaDrawHeroView:_doGacha(typeIndex)
    G_UserData:getGachaGoldenHero():c2sGacha(typeIndex, self._heroId)
end

function GachaDrawHeroView:_onButtonToGet( ... )
    self:_toRecharge()
end

function GachaDrawHeroView:_s2cGacha(id, message)
    G_AudioManager:playSoundWithId(AudioConst.SOUND_GACHA_GOLDEN_RECRUIT)
    local award = rawget(message, "awards") or {}
    if award and #award > 0 then
        self:_showPanel(false)
        self:_palyShowZhaomu(true, award)
    end

    if rawget(message, "free_cnt") then
        local freeCnt = rawget(message, "free_cnt") or 5
        freeCnt = (5 - freeCnt)
        G_UserData:getGachaGoldenHero():setFree_cnt(freeCnt)
    end
    if rawget(message, "free_cd") then
        G_UserData:getGachaGoldenHero():setFree_cd(rawget(message, "free_cd"))
    end
    --if rawget(message, "luck_draw_num") then
        G_UserData:getGachaGoldenHero():setLuck_draw_num(rawget(message, "luck_draw_num") or 0)
    --end

    self:_initIconImg()
    self:_updateDrawFreeDesc()
    self:_updateDrawTenDesc()
end

function GachaDrawHeroView:_onEventRewadsClose()
    self:_showPanel(true)
    self._effectZhaomu:setVisible(true)
    self._effectDrawcard:setVisible(false)
end

function GachaDrawHeroView:_onEventUpdateItem()
    self:_updateTotalItem()
end

function GachaDrawHeroView:_showPanel(isShow)
    self._panelRightTop:setVisible(isShow)
    self._panelBottom:setVisible(isShow)
    self._goldenBook:setVisible(isShow)
end

function GachaDrawHeroView:_palyShowZhaomu(isDraw, awards)
    local function effectFunction(effect)
        if effect == "mingzi" then
            local heroResConfig = require("app.config.hero_res")
            local configInfo = heroResConfig.get(self._heroId)
            local mingzi = ccui.ImageView:create()
            mingzi:loadTexture(Path.getGoldHeroTxt(configInfo.gold_hero_show))

            if not isDraw then
                G_HeroVoiceManager:playVoiceWithHeroId(self._heroId, true)
            end

            return mingzi
        elseif effect == "lihui" then
            local view = GoldHeroLayer.new(self._heroId, handler(self, self._updatePageItem))
            view:setAnchorPoint(cc.p(0.5, 0.0))
            return view
		end
	end
	
    local function eventFunction(event)
        if event == "anniu" then
        elseif event == "gongxihuode" then
            local PopupGetRewards = require("app.ui.PopupGetRewards").new()
            PopupGetRewards:showDrawCard(awards)
        elseif event == "finish" then
            if not isDraw then
                self:_showPanel(not isDraw)
                self:_initHuoGuangEffect()
            end
            self._isPlayAni = false
        end
    end
    
    self._isPlayAni = true
    self._effectZhaomu:setVisible(not isDraw)
    self._effectDrawcard:setVisible(isDraw)
    if isDraw then
        self._effectDrawcard:removeAllChildren()
    end
    local effectNode = isDraw and self._effectDrawcard or self._effectZhaomu
    local flash = isDraw and "moving_jinjiangzhaomu_2" or "moving_jinjiangzhaomu_1"
    G_EffectGfxMgr:createPlayMovingGfx(effectNode, flash, effectFunction, eventFunction , false)
end

function GachaDrawHeroView:_initHuoGuangEffect()
    for effectIndex = 1, 1 do
        local selectedFlash = self["_effectHuoyan"]:getChildByName("shanguang_effect" ..effectIndex)
        if selectedFlash == nil then
            local lightEffect = require("app.effect.EffectGfxNode").new(GachaGoldenHeroConst.DRAW_HERO_EFFECT[effectIndex])
            lightEffect:setAnchorPoint(0, 0)
            lightEffect:play()
            lightEffect:setName("shanguang_effect" ..effectIndex)
            self["_effectHuoyan"]:addChild(lightEffect)
        end
    end
end

----------------------------------------------------------------------------
function GachaDrawHeroView:_initBtnDesc()
    self._commonBtnFree:setString(Lang.get("gacha_goldenhero_draw_free"))
    self._commonBtnTen:setString(Lang.get("gacha_goldenhero_draw_ten"))
end

function GachaDrawHeroView:_initCountry()
    local groupIds = G_UserData:getGachaGoldenHero():getGoldHeroGroupIdByCountry(self._currentChooseZhenyin) or {}

    for i=1, 4 do
        self["_commonCountry" ..i]:show(false)
    end

    local startIndex = 4 - #groupIds + 1
    local i = 1
    for index = startIndex, 4 do
        if self["_commonCountry" ..index] then
            self["_commonCountry" ..index]:show(true)
            self["_commonCountry" ..index]:updateHero(index, groupIds[i])
            self["_commonCountry" ..index]:addClickEventListenerEx(handler(self, self._touchCountry))
            
            i = i + 1
        end
    end
end

function GachaDrawHeroView:_touchCountry(sender)
    local flag = sender:getTag()

    if self._heroId == flag then
        return
    end


    local groupIds = G_UserData:getGachaGoldenHero():getGoldHeroGroupIdByCountry(self._currentChooseZhenyin) or {}
    -- if flag > table.nums(groupIds) or flag <= 0 then
    --     return
    -- end

    self._selectedPos = flag
    self._heroId = flag
    self._effectZhaomu:removeAllChildren()
    --G_AudioManager:playSoundWithId(AudioConst.SOUND_GACHA_GOLDEN_OPEN)
    self:_updateCountry()
    self:_palyShowZhaomu()
    --self:_showPanel(true)
    --self:_initHuoGuangEffect()
end

function GachaDrawHeroView:_updateCountry()
    -- local heroData = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, 
    --                                     self._allHeroIds[self._selectedPos])
    for i=1, 4 do
        self["_commonCountry" ..i]:showSelected(self._heroId)
    end
end

function GachaDrawHeroView:_initSelectedPos(id)
    self._allHeroIds = G_UserData:getGachaGoldenHero():getGoldHeroGroupIdByCountry(self._currentChooseZhenyin) or {}
    self._selectedPos = table.keyof(self._allHeroIds, id)
    self._heroCount = #self._allHeroIds
end

-- @Role    Update PageView
function GachaDrawHeroView:_updatePageItem(pos)
    self._selectedPos = pos
    self:_updateCountry()
end

function GachaDrawHeroView:_updateDrawFreeDesc()    
    local freeCnt = G_UserData:getGachaGoldenHero():getFree_cnt()
    local freeCD = G_UserData:getGachaGoldenHero():getFree_cd()

    self._imgFreeBg:setVisible(false)
    self._nodeFreeCountdown:removeAllChildren()
    self._nodeFreeDraw:removeAllChildren()
    self._imageFreeIcon:setVisible(true)

    local costNum = 0
    local total = UserDataHelper.getNumByTypeAndValue(GachaGoldenHeroConst.ITEM_DATA_TYPE, GachaGoldenHeroConst.ITEM_DATA_VALUE)

    --local isReturnServer = G_GameAgent:isLoginReturnServer()
    if total == 0 then
        local Paramter = require("app.config.parameter")
        local onceNeedNum = tonumber(Paramter.get(883).content)
        costNum = onceNeedNum
    else
        costNum = 1
    end

    local oneDrawDescStr = Lang.get("gacha_goldenhero_drawten", {num = costNum})

    self._nodeOneDraw:removeAllChildren()
    local richText = ccui.RichText:createRichTextByFormatString(
        oneDrawDescStr,
        {defaultColor = Colors.DARK_BG_THREE, defaultSize = 22, other ={[1] = {fontSize = 22}
    }})
    richText:setAnchorPoint(cc.p(0, 0.5))
    self._nodeOneDraw:addChild(richText)

    local descStr = ""
    if freeCnt > 0 then
        local freeTime = G_ServerTime:getLeftSeconds(freeCD)
        if freeTime > 0 then
            descStr = Lang.get("gacha_goldenhero_freecountdown", {time = G_ServerTime:secCountToString(freeTime)})
            self._commonBtnFree:setString(Lang.get("gacha_goldenhero_draw_one"))

            local richText = ccui.RichText:createRichTextByFormatString(
                descStr,
                {defaultColor = Colors.DARK_BG_THREE, defaultSize = 22, other ={[1] = {fontSize = 22}
            }})
            richText:setAnchorPoint(cc.p(0.5, 0.5))
            self._nodeFreeCountdown:addChild(richText)

            self._imgFreeBg:setVisible(true)
        else
            descStr = Lang.get("gacha_goldenhero_drawfree", {num = freeCnt})
            self._commonBtnFree:setString(Lang.get("gacha_goldenhero_draw_free"))

            local richText = ccui.RichText:createRichTextByFormatString(
                descStr,
                {defaultColor = Colors.DARK_BG_THREE, defaultSize = 22, other ={[1] = {fontSize = 22}
            }})
            richText:setAnchorPoint(cc.p(0.5, 0.5))
            self._nodeFreeDraw:addChild(richText)

            --有免费招募次数的时候隐藏单抽消耗
            self._nodeOneDraw:removeAllChildren()
            self._imageFreeIcon:setVisible(false)
        end
    else
        self._commonBtnFree:setString(Lang.get("gacha_goldenhero_draw_one"))
        self._nodeFreeDraw:removeAllChildren()
    end
end

function GachaDrawHeroView:_updateDrawTenDesc()
    self._nodeTenDraw:removeAllChildren()
    local costNum = 0
    local total = UserDataHelper.getNumByTypeAndValue(GachaGoldenHeroConst.ITEM_DATA_TYPE, GachaGoldenHeroConst.ITEM_DATA_VALUE)

    --local isReturnServer = G_GameAgent:isLoginReturnServer()
    if total < 10 then
        local Paramter = require("app.config.parameter")
        local onceNeedNum = tonumber(Paramter.get(883).content)
        costNum = onceNeedNum * 10
    else
        costNum = 10
    end

    local richText = ccui.RichText:createRichTextByFormatString(
		Lang.get("gacha_goldenhero_drawten", {num = costNum}),
        {defaultColor = Colors.DARK_BG_THREE, defaultSize = 22, other ={[1] = {fontSize = 22}
    }})

    richText:setAnchorPoint(cc.p(0, 0.5))
    self._nodeTenDraw:addChild(richText)
end

function GachaDrawHeroView:_updateForward( ... )
    if self._btnGoGet:isVisible() then
        if G_ServerTime:getLeftSeconds(G_UserData:getGachaGoldenHero():getEnd_time()) <= 0 then
            self._btnGoGet:setVisible(false)
        end
    end
end

function GachaDrawHeroView:_update(dt)
    self:_updateDrawFreeDesc()
    self:_updateForward()
end



return GachaDrawHeroView