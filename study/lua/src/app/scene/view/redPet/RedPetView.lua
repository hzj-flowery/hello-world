-- 红神兽
local ViewBase = require("app.ui.ViewBase")
local RedPetView = class("RedPetView", ViewBase)

local scheduler = require("cocos.framework.scheduler")
local RedPetHelper = require("app.scene.view.redPet.RedPetHelper")
local TopBarStyleConst = require("app.const.TopBarStyleConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local Paramter = require("app.config.parameter")
local DataConst = require("app.const.DataConst")
local UserCheck = require("app.utils.logic.UserCheck")
local RedPetAvatarNode = require("app.scene.view.redPet.RedPetAvatarNode")
local PopupSystemAlert = require("app.ui.PopupSystemAlert")
local UserDataHelper = require("app.utils.UserDataHelper")
local AudioConst = require("app.const.AudioConst")
local UIPopupHelper = require("app.utils.UIPopupHelper")

RedPetView.ARROW_WIDTH = 45 -- 绘制路径图片所需的长度
RedPetView.CACHE_SIZE = 50 -- 缓存的路径图片数量
RedPetView.TOUCHE_RADIUS = 150 --摇杆触摸范围

function RedPetView:waitEnterMsg(callBack)
	local function onMsgCallBack()
		callBack()
	end

	G_UserData:getRedPetData():c2sGetRedPetInfo()

	local signal = G_SignalManager:add(SignalConst.EVENT_GET_RED_PET_INFO, onMsgCallBack)
	
	return signal
end

function RedPetView:ctor()
    self._unusedArrows = {}
    self._usedArrows = {}
    self._bezier = nil
    self._intersectRandomNum = 0
    self._gachaType = nil -- 0 免费抽， 1 单抽， 2 十连抽
    self._intersectPanelId = nil
    self._startPlayFly = false

    --self._isIntersectWithPet = false

	local resource = {
		size = G_ResolutionManager:getDesignSize(),
		file = Path.getCSB("RedPetView", "redPet"),
		binding = {
            _stick = {
                events = {{event = "touch", method = "_onAvatarPanelClick"}}
            },
            _btnRefresh = {
                events = {{event = "touch", method = "_onRefreshClick"}}
            },
            _purpleBtn = {
                events = {{event = "touch", method = "_onPurpleGourdClick"}}
            },
            _goldenBtn = {
                events = {{event = "touch", method = "_onGoldenGourdClick"}}
            },
		},
	}
	RedPetView.super.ctor(self, resource, 2014)
end

function RedPetView:onCreate()
    self:_initView()
    
    self:_initJoyStick()
    self:_createArrowsCache()
    self:_resetBullet()

    self:_initPlayerAvatar()
    self:_initPetAvatar()
    self:_initPreAwardPanel()

    self:_playTopTipsEffect()

    self:_preCalculateRect()

    --self:_playBulletParticleEffect()
end

function RedPetView:onEnter()
    self._signalGetRedPetInfo = G_SignalManager:add(SignalConst.EVENT_GACHA_RED_PET, handler(self, self._onEventGetAwards))
    self._signalRefreshPetInfo = G_SignalManager:add(SignalConst.EVENT_REFRESH_RED_PET, handler(self, self._onEventRefreshRedPetInfo))

    self._countDownScheduler = scheduler.scheduleGlobal(handler(self, self._update), 1.0)

    G_AudioManager:playMusicWithId(AudioConst.SOUND_RED_PET_BG)

    -- 修复重复进入界面avatar不显示的问题
    self._spineHero:setAnimation("idle", true)

    if self._gachaType == 2 then
        self:_onGoldenGourdClick()
    else
        self:_onPurpleGourdClick()
    end
end

function RedPetView:onExit()
    self._signalGetRedPetInfo:remove()
    self._signalGetRedPetInfo = nil
    self._signalRefreshPetInfo:remove()
    self._signalRefreshPetInfo = nil

    if self._countDownScheduler then
		scheduler.unscheduleGlobal(self._countDownScheduler)
		self._countDownScheduler = nil
    end
    
    self:_endFly()

    self._startPlayFly = false

    if self._xuliLoopSoundId then
        G_AudioManager:stopSound(self._xuliLoopSoundId)
        self._xuliLoopSoundId = nil
    end
end

function RedPetView:_initView()
    self._topbarBase:updateUI(TopBarStyleConst.STYLE_RED_PET_ACTIVITY, true)
    self._topbarBase:setImageTitle("txt_sys_com_qiling")

    self._nodeBook:updateUI(FunctionConst.FUNC_RED_PET_SHOP)
    self._nodeBook:addClickEventListenerEx(handler(self, self._onBtnShop))
    
    self._helpBtn:addClickEventListenerEx(handler(self, self._onHelpBtn))

    self._petAvatar1 = RedPetAvatarNode.new(self._petAvatarNode1)
    self._petAvatar2 = RedPetAvatarNode.new(self._petAvatarNode2)
    self._petAvatar3 = RedPetAvatarNode.new(self._petAvatarNode3)


    local costOnceNum = tonumber(Paramter.get(903).content)
    self._cost1:setString(costOnceNum)

    local costTenNum = tonumber(Paramter.get(904).content)
    self._cost2:setString(costTenNum)

    local refreshCostNum = tonumber(Paramter.get(905).content)
    self._refreshCost:setString(Lang.get("guild_create_cost", {value = refreshCostNum}))

    self:_updateDrawFreeDesc()
end

function RedPetView:_onRefreshClick()
    if self._startPlayFly == true then
        return 
    end

    local costNum = tonumber(Paramter.get(905).content)
    local canRun = UserCheck.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, costNum, true)

    if not canRun then
        return
    end

    local isNotNeedConfirm = UserDataHelper.getPopModuleShow("RedPetViewRefresh")
    if isNotNeedConfirm then
        G_UserData:getRedPetData():c2sRedPetRefresh()
        return 
    end

    local title = Lang.get("common_title_notice")
    local content = Lang.get("pet_red_refresh_tips")

    local function callback()
        G_UserData:getRedPetData():c2sRedPetRefresh()
    end

    local popup = PopupSystemAlert.new(title, content, callback)
    popup:setModuleName("RedPetViewRefresh")
    popup:setCheckBoxVisible(true)
    popup:openWithAction()
end

function RedPetView:_onEventRefreshRedPetInfo()
    self:_initPetAvatar()
    self:_initPreAwardPanel()

    self:_playPetRefreshEffect()

    G_AudioManager:playSoundWithId(AudioConst.SOUND_RED_PET_REFRESH_SOUND)
end

function RedPetView:_initPlayerAvatar()
    self._spineHero = require("yoka.node.HeroSpineNode").new()
    self._spineHero:setScale(0.8)

    self._heroAvatar:addChild(self._spineHero)

    local resJson = Path.getSpine("fennuxiaoniao")
    self._spineHero:setAsset(resJson)
	self._spineHero.signalLoad:add(
        function()
            self._spineHero:setAnimation("idle", true)
		end
    )
end

function RedPetView:_initPetAvatar()
    local pets = RedPetHelper.getShowPetsInfo()

    self._petAvatar2:updatePetAvatar({id = pets[1].petId})
    self._petAvatar1:updatePetAvatar({id = pets[2].petId})
    self._petAvatar3:updatePetAvatar({id = pets[3].petId})
end

function RedPetView:_playPetRefreshEffect()
    self._petAvatar1:playRefreshEffect()
    self._petAvatar2:playRefreshEffect()
    self._petAvatar3:playRefreshEffect()
end

function RedPetView:_onEventGetAwards(event, awards)
    if awards then
        local action1 = cc.CallFunc:create(function()
            self:_playAllPetsEmoji(awards)
        end)
        local action2 = cc.DelayTime:create(1)
        local action3 =
        cc.CallFunc:create(function()
            self:_removeAllPetsEmoji()
            local PopupGetRewards = require("app.ui.PopupGetRewards").new()
            PopupGetRewards:showDrawCard(awards)

            self._startPlayFly = false

            if self._gachaType == 1 or self._gachaType == 0 then
                self:_onPurpleGourdClick()
            elseif self._gachaType == 2 then
                self:_onGoldenGourdClick()
            end
        end)

        local action = cc.Sequence:create(action1, action2, action3)
        self:runAction(action)
    end

    self:_updateDrawFreeDesc()
end

function RedPetView:_onBtnShop()
	local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
	WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RED_PET_SHOP)
end

function RedPetView:_updateShopRP()
end

function RedPetView:_resetBullet()
    local worldPos = self._touchPanel:convertToWorldSpace(cc.p(RedPetView.TOUCHE_RADIUS, RedPetView.TOUCHE_RADIUS))
    local localPos = self._panelDesign:convertToNodeSpace(worldPos)

    self._bullet:setPosition(cc.p(0, 0))
    self._bulletNode:setPosition(cc.p(localPos.x, localPos.y))

    self._bulletNode:setVisible(false)

    self._bullet:removeAllChildren()

    self:_doBulletIdleAnim()
end

function RedPetView:_doBulletIdleAnim()
    local moveAction = cc.MoveBy:create(1, cc.p(0, 10))
    local rep = cc.RepeatForever:create(cc.Sequence:create(moveAction, moveAction:reverse()))
    self._bullet:runAction(rep)
end

function RedPetView:_removeAllPetsEmoji()
    self._petAvatar1:removeEmoji()
    self._petAvatar2:removeEmoji()
    self._petAvatar3:removeEmoji()
end

function RedPetView:_playAllPetsEmoji(awards)
    if awards == nil or #awards == 0 or self._intersectPanelId == nil then
        return
    end

    local pets = {}
    local fragments = {}

    for k, v in pairs(awards) do
        if v.type == TypeConvertHelper.TYPE_PET then
            table.insert( pets, v )
        elseif v.type == TypeConvertHelper.TYPE_FRAGMENT then
            table.insert( fragments, v )
        end
    end

    self._petAvatar1:playEmojiEffect(pets, fragments, self._intersectPanelId == 1)
    self._petAvatar2:playEmojiEffect(pets, fragments, self._intersectPanelId == 2)
    self._petAvatar3:playEmojiEffect(pets, fragments, self._intersectPanelId == 3)

    self._intersectPanelId = nil
end

function RedPetView:_setBulletToStickPos()
    local stickPosX, stickPosY = self._stick:getPosition()
    local worldPos = self._touchPanel:convertToWorldSpace(cc.p(stickPosX, stickPosY))
    local localPos = self._panelDesign:convertToNodeSpace(worldPos)

    self._bulletNode:setPosition(cc.p(localPos.x, localPos.y))
end

function RedPetView:_onHelpBtn(  )
	UIPopupHelper.popupHelpInfo(FunctionConst.FUNC_RED_PET)
end

function RedPetView:_initPreAwardPanel(  )
    local rewards = RedPetHelper.getPreAwardInfo()
    self._awardList:updateUI(rewards)
    self._awardList:setMaxItemSize(5)
    self._awardList:setListViewSize(410,100)
    self._awardList:setItemsMargin(2)
end

function RedPetView:_playBulletParticleEffect()
    local particleName = ""

    if self._gachaType == 0 or self._gachaType == 1 then
        particleName = "qilingguijizise"
    else
        particleName = "qilingguijichengse"
    end

    local emitter = cc.ParticleSystemQuad:create("effect/particle/"..particleName..".plist")
    emitter:resetSystem()
    
    self._bullet:addChild(emitter)
    emitter:setPosition(cc.p(30, 30))
end

function RedPetView:_doFlyAction()
    if self._startPlayFly == true then
        return
    end

    local ret, costYuBi, nameIndex = self:_checkCost()
    if ret == false then
        self:_cancelFly()
        return
    end
    local params = {
		moduleName = "COST_YUBI_MODULE_NAME_6",
		yubiCount = costYuBi,
        itemCount = 1,
        itemNameIndex = nameIndex
	}
    UIPopupHelper.popupCostYubiTip(params, handler(self, self._realDoFlyAction))
end

function RedPetView:_realDoFlyAction()
    G_AudioManager:playSoundWithId(AudioConst.SOUND_RED_PET_FLY_SOUND)

    self._joyStick:setVisible(false)

    if self._flyTimer then
        scheduler.unscheduleGlobal(self._flyTimer)
        self._flyTimer = nil 
    end

    self._spineHero:setAnimation("attack", false)

    self:_playBulletParticleEffect()

    self._addSpeed = 0.8

    self._bezierTime = 1
    self._curBezierTime = 0
    self._intersectRandomNum = math.random()
    self._startPlayFly = true
    self._flyTimer = scheduler.scheduleGlobal(handler(self, self._flyUpdate), 1 / 60)
end

function RedPetView:_endFly()
    if self._flyTimer then
        scheduler.unscheduleGlobal(self._flyTimer)
        self._flyTimer = nil 
    end

    self._bezier = nil

    self._spineHero:setAnimation("idle", true)

    self:_resetBullet()
end

function RedPetView:_removeChooseEffect()
    self._purpleEffectNode:removeAllChildren()	
    self._purpleEffectNode1:removeAllChildren()
    self._goldenEffectNode:removeAllChildren()
    self._goldenEffectNode1:removeAllChildren()
end

function RedPetView:_playHitEffect()
    self:_removeChooseEffect()

    if self._intersectPanelId == nil then
        self:_doGacha()
        return
    end
    
    -- local bulletPosx, bulletPosY = self._bullet:getPosition()
    -- local worldPos = self._bulletNode:convertToWorldSpace(cc.p(bulletPosx, bulletPosY))
    -- local localPos = self._panelDesign:convertToNodeSpace(worldPos)

    local function eventFunction(event)
        if event == "finish" then
            self:_doGacha()
        end
    end

    G_EffectGfxMgr:createPlayGfx(self["_panel"..self._intersectPanelId], "effect_qiling_mingzhong1", eventFunction, true, cc.p(30, 20))

    G_AudioManager:playSoundWithId(AudioConst.SOUND_RED_PET_HIT_SOUND)
end

function RedPetView:_flyUpdate(dt)
    if self._startPlayFly then
        self._addSpeed = self._addSpeed + 0.007
        self._curBezierTime = self._curBezierTime + 1 / 60 * self._addSpeed
        local percent = math.min(1, self._curBezierTime / self._bezierTime)
        local posx, posy = RedPetHelper.getBezierPosition(self._bezier, percent)
        self._bullet:setPosition(cc.p(posx, posy))

        if percent >= 1 then
            self:_playHitEffect()
            self:_endFly()
        end

        local isIntersectsWithPet, panelId = self:_checkBulletIntersectsWithPets()
        if isIntersectsWithPet == true then
            self._intersectPanelId = panelId
            self:_playHitEffect()
            self:_endFly()
        end
    end
end

function RedPetView:_showJoyStick()
    self._joyStick:setVisible(true)
    self._bulletNode:setVisible(true)
end

function RedPetView:_playChooseEffect()
    local activeEffectName = ""
    local activeEffectNode = nil

    self._purpleEffectNode:removeAllChildren()	
    self._goldenEffectNode:removeAllChildren()

    if self._gachaType == 0 or self._gachaType == 1 then
        activeEffectName = "effect_qiling_zisehulijihuo"
        activeEffectNode = self._purpleEffectNode
    else 
        activeEffectName = "effect_qiling_chengsehulijihuo"
        activeEffectNode = self._goldenEffectNode
    end

    G_EffectGfxMgr:createPlayGfx(activeEffectNode,activeEffectName,nil)
end

function RedPetView:_playChoosedStateEffect()
    local choosedEffectName = ""
    local choosedEffectNode = nil

    self._purpleEffectNode1:removeAllChildren()
    self._goldenEffectNode1:removeAllChildren()
    self._goldenEffectNode2:removeAllChildren()

    if self._gachaType == 0 or self._gachaType == 1 then
        choosedEffectName = "effect_qiling_zisehuluguang"
        choosedEffectNode = self._purpleEffectNode1
    else 
        choosedEffectName = "effect_qiling_chengsehuluguang"
        choosedEffectNode = self._goldenEffectNode1
    end

    G_EffectGfxMgr:createPlayGfx(choosedEffectNode,choosedEffectName,nil)

    if self._gachaType == 2 then
        G_EffectGfxMgr:createPlayGfx(self._goldenEffectNode2, "effect_qiling_chengsehuluguangzi", nil)
    end
end

function RedPetView:_playHeroAvatarXuliEffect()
    local xuliEffectName = "effect_qiling_xuli"

    self._heroEffect:removeAllChildren()	
    G_EffectGfxMgr:createPlayGfx(self._heroEffect, xuliEffectName, nil)
end

function RedPetView:_playGuideEffect()
    local guideEffectName = "effect_qiling_yindao"

    self._guideEffectNode:removeAllChildren()	
    G_EffectGfxMgr:createPlayGfx(self._guideEffectNode, guideEffectName, nil)
end

function RedPetView:_playTopTipsEffect()
    local effectName = "moving_qiling_wenzixingxing"

    self._topTipsEffectNode:removeAllChildren()	
    G_EffectGfxMgr:createPlayMovingGfx(self._topTipsEffectNode, effectName, nil)
end

function RedPetView:_onPurpleGourdClick(sender, state)
    if self._startPlayFly == true then
        return 
    end

    local itemNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2)
    local freeCnt = G_UserData:getRedPetData():getFree_times()
    local freeCD = G_UserData:getRedPetData():getFree_cd()

    if G_ServerTime:getLeftSeconds(freeCD) <= 0 then
        self._gachaType = 0
    else
        self._gachaType = 1
    end

    self._bullet:ignoreContentAdaptWithSize(true)
    self._bullet:loadTexture(Path.getRedPetImage("img_pet_hulu01a"))

    if sender then
        self:_playChooseEffect()
    end

    self:_playChoosedStateEffect()
    self:_showJoyStick()
    self:_playGuideEffect()
    --self:_playBulletParticleEffect()
end

function RedPetView:_onGoldenGourdClick(sender, state)
    if self._startPlayFly == true then
        return 
    end

    self._gachaType = 2

    self._bullet:ignoreContentAdaptWithSize(true)
    self._bullet:loadTexture(Path.getRedPetImage("img_pet_hulu01b"))

    if sender then
        self:_playChooseEffect()
    end
    
    self:_playChoosedStateEffect()
    self:_showJoyStick()
    self:_playGuideEffect()
    --self:_playBulletParticleEffect()
end

function RedPetView:_checkCost()
    local itemNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2)
    local needNum = 0
    local needYubi = nil

    if self._gachaType == 2 then
        needNum = tonumber(Paramter.get(904).content)
        needYubi = needNum
    elseif self._gachaType == 1 then
        needNum = tonumber(Paramter.get(903).content)
        needYubi = needNum
    elseif self._gachaType == 0 then
        needNum = 0
    else
    end

    if itemNum < needNum then
        self:_toRecharge()
        return false
    end

    return true, needYubi, self._gachaType
end

function RedPetView:_toRecharge( ... )
    --local popup = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
    local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
    WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_JADE2)
end

function RedPetView:_doGacha()
    if self._gachaType == nil then
        print("self._gachaType == nil !!!!!")
        return
    end

    G_UserData:getRedPetData():c2sGachaRedPet(self._gachaType, 1)

    --self._gachaType = nil
end

function RedPetView:_createFlyParabola(distanceX, distanceY)
    local endPosX = 1200 * distanceX / RedPetView.TOUCHE_RADIUS
    local endPos = cc.p(endPosX + 50, -100)

    local startPos = cc.p(0, 0)

    local midPointY = 1000 * distanceY / RedPetView.TOUCHE_RADIUS
    local midPoint = cc.p((endPos.x - startPos.x) / 2, midPointY + 200)

    self._bezier =  {
        startPos,
        midPoint,
        endPos,
    }

    self:_createBezierWith2Point(self._bezier, startPos, endPos, midPoint)
end

function RedPetView:_createBezierWith2Point(bezier, startPos, endPos, midPoint)
	local diffY = math.abs( endPos.y - startPos.y )
	local diffX = math.abs( endPos.x - startPos.x )
	local distance = math.sqrt( diffX * diffX + diffY * diffY ) + (midPoint.y - startPos.y)
    local loop = math.ceil(distance / RedPetView.ARROW_WIDTH) 

    self:_resetArrowsCache()

    --self._isIntersectWithPet = false
    
	for i = 1, loop do
		local percent = i / loop
		local posx, posy, angle = RedPetHelper.getBezierPositionAndAngle(bezier, percent)
		local arrow = self:_getUnusedArrow()
        
        local grayArrow = arrow.gray
        local lightArrow = arrow.light

		local pos = cc.p(posx, posy)
		grayArrow:setPosition(pos)
        grayArrow:setRotation(angle)
        lightArrow:setPosition(pos)
        lightArrow:setRotation(angle)
        
        -- local arrowSize = lightArrow:getContentSize()
        -- local worldPos = self._arrowRoot:convertToWorldSpace(pos)
        -- local localPos = self._panelDesign:convertToNodeSpace(worldPos)

        -- local arrowRect = {
        --     x = localPos.x, 
        --     y = localPos.y, 
        --     width = arrowSize.width, 
        --     height = arrowSize.height
        -- }

        -- if self._isIntersectWithPet == false then
        --     self._isIntersectWithPet = self:_checkIntersectsWithPets(arrowRect)
        -- end
    end
    
    for k, v in pairs(self._usedArrows) do
        v.gray:setVisible(bezier[3].x < 300)
        v.light:setVisible(bezier[3].x >= 300)
    end
end

function RedPetView:_preCalculateRect()
    local panel2X, panel2Y = self._panel2:getPosition()
    local panel2Size = self._panel2:getContentSize()
    local panel2WorldPos = self._petAvatarNode2:convertToWorldSpace(cc.p(panel2X, panel2Y))
    local panel2LocalPos = self._panelDesign:convertToNodeSpace(panel2WorldPos)

    self._redPetRect = {
        x = panel2LocalPos.x, 
        y = panel2LocalPos.y, 
        width = panel2Size.width, 
        height = panel2Size.height
    }

    local panel1X, panel1Y = self._panel1:getPosition()
    local panel1WorldPos = self._petAvatarNode1:convertToWorldSpace(cc.p(panel1X, panel1Y))
    local panel1LocalPos = self._panelDesign:convertToNodeSpace(panel1WorldPos)
    local panel1Size = self._panel1:getContentSize()

    self._orangePetRect1 = {
        x = panel1LocalPos.x, 
        y = panel1LocalPos.y, 
        width = panel1Size.width, 
        height = panel1Size.height
    }

    local panel3X, panel3Y = self._panel3:getPosition()
    local panel3WorldPos = self._petAvatarNode3:convertToWorldSpace(cc.p(panel3X, panel3Y))
    local panel3LocalPos = self._panelDesign:convertToNodeSpace(panel3WorldPos)
    local panel3Size = self._panel3:getContentSize()

    self._orangePetRect2 = {
        x = panel3LocalPos.x, 
        y = panel3LocalPos.y, 
        width = panel3Size.width, 
        height = panel3Size.height
    }

    self._bulletSize = self._arrowRect:getContentSize()
end

function RedPetView:_checkBulletIntersectsWithPets()
    local bulletX, bulletY = self._bullet:getPosition() 
    local worldPos = self._bulletNode:convertToWorldSpace(cc.p(bulletX, bulletY))
    local localPos = self._panelDesign:convertToNodeSpace(worldPos)

    local bulletRect = {
        x = localPos.x, 
        y = localPos.y, 
        width = self._bulletSize.width, 
        height = self._bulletSize.height
    }

    local isIntersects = cc.rectIntersectsRect(bulletRect, self._orangePetRect1)
    if isIntersects == true then
        if self._bezier[3].x >= self._orangePetRect2.x then
            if self._intersectRandomNum >= 0.5 then
                return false
            end
        end

        return true, 1
    end

    isIntersects = cc.rectIntersectsRect(bulletRect, self._orangePetRect2)
    if isIntersects == true then
        return true, 3
    end

    isIntersects = cc.rectIntersectsRect(bulletRect, self._redPetRect)
    if isIntersects == true then
        return true, 2
    end

    return false
end

function RedPetView:_checkIntersectsWithPets(rect)
    return cc.rectIntersectsRect(rect, self._orangePetRect1)
        or cc.rectIntersectsRect(rect, self._orangePetRect2)
        or cc.rectIntersectsRect(rect, self._redPetRect)
end

function RedPetView:_createArrowsCache()
    self._unusedArrows = {}
    self._usedArrows = {}

    for i = 1, RedPetView.CACHE_SIZE do
        local lightArrow = ccui.ImageView:create(Path.getRedPetImage("img_donghua_xian01"))
        local grayArrow = ccui.ImageView:create(Path.getRedPetImage("img_donghua_xian02"))
        lightArrow:setVisible(false)
        grayArrow:setVisible(false)
        self._arrowRoot:addChild(lightArrow)
        self._arrowRoot:addChild(grayArrow)
        table.insert( self._unusedArrows, {light = lightArrow, gray = grayArrow} )
    end
end

function RedPetView:_getUnusedArrow()
    local arrow = nil

    if #self._unusedArrows > 0 then
        arrow = self._unusedArrows[#self._unusedArrows]
        table.remove( self._unusedArrows, #self._unusedArrows )
        table.insert( self._usedArrows, arrow )
        arrow.light:setVisible(true)
        arrow.gray:setVisible(true)
    else
        local lightArrow = ccui.ImageView:create(Path.getRedPetImage("img_donghua_xian01"))
        local grayArrow = ccui.ImageView:create(Path.getRedPetImage("img_donghua_xian02"))
        lightArrow:setVisible(false)
        grayArrow:setVisible(false)
        self._arrowRoot:addChild(lightArrow)
        self._arrowRoot:addChild(grayArrow)

        arrow = {light = lightArrow, gray = grayArrow}
        table.insert( self._usedArrows, arrow )
    end

    return arrow
end

function RedPetView:_resetArrowsCache()
    for k, arrow in pairs(self._usedArrows) do
        table.insert( self._unusedArrows, arrow )
        arrow.light:setVisible(false)
        arrow.gray:setVisible(false)
    end

    self._usedArrows = {}
end

function RedPetView:_initJoyStick()
    local listener=cc.EventListenerTouchOneByOne:create()
    listener:setSwallowTouches(true)
    listener:registerScriptHandler(handler(self,self._onJoyStickTouchBegan),      cc.Handler.EVENT_TOUCH_BEGAN)
    listener:registerScriptHandler(handler(self,self._onJoyStickTouchMoved),      cc.Handler.EVENT_TOUCH_MOVED)
    listener:registerScriptHandler(handler(self,self._onJoyStickTouchEnded),      cc.Handler.EVENT_TOUCH_ENDED)
    listener:registerScriptHandler(handler(self, self._onJoyStickTouchCancelled), cc.Handler.EVENT_TOUCH_CANCELLED)

    cc.Director:getInstance():getEventDispatcher():addEventListenerWithSceneGraphPriority(listener, self._stick)

    self._joyStick:setVisible(false)

    local avatarPosX, avatarPosY = self._heroAvatarNode:getPosition()
    local worldPos = self._avatarRoot:convertToWorldSpace(cc.p(avatarPosX, avatarPosY))
    local localPos = self._panelDesign:convertToNodeSpace(worldPos)

    self._joyStick:setPositionX(localPos.x + 10)
end

function RedPetView:_onJoyStickTouchBegan(touch, event)
    local localPos = self._touchPanel:convertToNodeSpace(touch:getLocation())

    if self._startPlayFly == true or localPos.x > 300 or localPos.x < 0 or localPos.y > 300 or localPos.y < 0 then
        return false
    elseif self._gachaType then
        localPos.x = math.max(0, math.min(localPos.x, RedPetView.TOUCHE_RADIUS))
        localPos.y = math.max(0, math.min(localPos.y, RedPetView.TOUCHE_RADIUS))

        -- 复位摇杆
        self._stick:setPosition(localPos)
        self:_setBulletToStickPos()

        self._spineHero:setAnimation("dile2", true)
        self:_playHeroAvatarXuliEffect()

        self._guideEffectNode:removeAllChildren()

        -- 停止上下移动的动作
        self._bullet:setPosition(cc.p(0, 0))
        self._bullet:stopAllActions()

        self._xuliLoopSoundId = G_AudioManager:playSoundWithIdExt(AudioConst.SOUND_RED_PET_XULI_SOUND, nil, true)

        return true
    end
end

function RedPetView:_onJoyStickTouchMoved(touch, event)
    local localPos = self._touchPanel:convertToNodeSpace(touch:getLocation())
    localPos.x = math.max(0, math.min(localPos.x, RedPetView.TOUCHE_RADIUS))
    localPos.y = math.max(0, math.min(localPos.y, RedPetView.TOUCHE_RADIUS))
    self._stick:setPosition(localPos)
    self:_setBulletToStickPos()

    self:_createFlyParabola(RedPetView.TOUCHE_RADIUS - localPos.x, RedPetView.TOUCHE_RADIUS - localPos.y)
end

function RedPetView:_onJoyStickTouchEnded(touch, event)
    --local localEndedPos = self._touchPanel:convertToNodeSpace(touch:getLocation())
    self._stick:setPosition(cc.p(RedPetView.TOUCHE_RADIUS, RedPetView.TOUCHE_RADIUS))
    self:_resetArrowsCache()
    self._heroEffect:removeAllChildren()

    if self._xuliLoopSoundId then
        G_AudioManager:stopSound(self._xuliLoopSoundId)
        self._xuliLoopSoundId = nil
    end

    if self._bezier == nil or self._bezier[3].x < 300 then
        G_Prompt:showTip(Lang.get("red_pet_not_aim"))
        self:_cancelFly()

        return 
    end

    if self._bezier then
        self:_doFlyAction()
    end
end

function RedPetView:_onJoyStickTouchCancelled(touch, event)
    self._stick:setPosition(cc.p(RedPetView.TOUCHE_RADIUS, RedPetView.TOUCHE_RADIUS))

    self:_resetArrowsCache()
end

function RedPetView:_cancelFly()
    self._spineHero:setAnimation("idle", true)
    --self:_removeChooseEffect()
    self:_resetBullet()
    self:_showJoyStick()
    self:_playGuideEffect()
    --self._gachaType = nil
    --self._joyStick:setVisible(false)
end

function RedPetView:_update(dt)
    self:_updateDrawFreeDesc()
end

function RedPetView:_updateDrawFreeDesc()    
    local freeCnt = G_UserData:getRedPetData():getFree_times()
    local freeCD = G_UserData:getRedPetData():getFree_cd()

    self._freeTextRoot:removeAllChildren()

    local freeTime = G_ServerTime:getLeftSeconds(freeCD)
    if freeTime > 0 then
        local talentInfo = Lang.get("pet_red_free_cd_des", {cd = G_ServerTime:getLeftDHMSFormatEx(freeCD)})

        local label = ccui.RichText:createWithContent(talentInfo)
        label:setAnchorPoint(cc.p(0, 0.5))
        label:formatText()

        self._freeTextRoot:addChild(label)

        self._freeBg:setContentSize(cc.size(195, 32))
    else
        if self._gachaType == 1 then
            self._gachaType = 0 
        end

        local talentInfo = Lang.get("pet_red_free_count_des", {left = 1})

        local label = ccui.RichText:createWithContent(talentInfo)
        label:setAnchorPoint(cc.p(0, 0.5))
        label:formatText()

        self._freeTextRoot:addChild(label)

        self._freeBg:setContentSize(cc.size(150, 32))
    end
end


return RedPetView