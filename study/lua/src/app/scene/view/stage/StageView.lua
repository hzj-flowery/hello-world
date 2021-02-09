local ViewBase = require("app.ui.ViewBase")
local StageView = class("ChapterView", ViewBase)
local StageNode = require("app.scene.view.stage.StageNode")

local StoryBox = require("app.config.story_box")
local UIHelper  = require("yoka.utils.UIHelper")
local StoryTouch = require("app.config.story_touch")
local Path = require("app.utils.Path")
local AudioConst = require("app.const.AudioConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local ChapterConst = require("app.const.ChapterConst")
local ReturnConst = require("app.const.ReturnConst")
StageView.JUMP_MAP_TIME = 0.2

function StageView:ctor(chapterId, stageId, showBoss, isPopStageView)       --如果传入stageid则直接弹出详细面板,如果有bossid直接弹出boss详细面板, 不填chapterid则打开现在能打的最后一章
    local chapterId = chapterId or G_UserData:getChapter():getLastOpenChapterId()
    self._chapterData = G_UserData:getChapter():getGlobalChapterById(chapterId)     --信息
    self._chapterInfo = self._chapterData:getConfigData()   --表格信息
    self._stageId = stageId             --
    self._lastStageID = 0
    self._stageList = {}
    self._boxInfo = {}                  --选中宝箱的信息
    self._getStar = 0                   --本场节获得的星数
    self._stageBox = {}
    self._scene = nil                   --场景

    self._isPopStageView = isPopStageView
    --监听
    self._signalChapterBox = nil           --星数宝箱
    self._signalStageBox = nil          --关卡宝箱
    self._signalSiegeInfo = nil         --获得叛军信息的info
    self._signalStarEftFinish = nil     --星星播放完成
    self._signalGetAllAward = nil       --获得所有宝箱
    self._showBoss = showBoss           --是否直接弹出boss面板
    -- self._signalSweepFinish = nil       --扫荡完成
    self._signalTopBarPause = nil       --顶部栏暂停
    self._signalTopBarStart = nil       --顶部栏开启
    self._signalExecuteStage = nil

    --ui
    self._btnSiege = nil            --叛军按钮
    self._btnStarRank = nil         --星数排行榜
    self._btnStarBox1 = nil         --星级宝箱1
    self._btnStarBox2 = nil         --星级宝箱2
    self._btnStarBox3 = nil         --星级宝箱3
    self._starBoxEft = {}           --星级宝箱特效
    self._starRedpoint = {}         --星级宝箱红点
    self._btnFormation = nil        --布阵
    --self._btnBoss = nil             --boss
    self._nodeBossRoot = nil
    self._nodeBoss = nil
    self._scrollBG = nil            --场景滚动层
    self._topBar = nil              --顶部框

    self._isFirstEnter = true       --是否是第一次进入
    self._hasNewBox = false         --是否有新宝箱可以领取
    self._popupStageReward = nil    --弹出一键领取
    self._popupStageRewardSignal = nil    --一键领取信号
    self._btnPassBox = nil -- 通关宝箱

    self._firstReward = nil         --第一次名将副本后，通关奖励
    self._isFamousStroyOpen = true     --名将副本卷轴是否打开

	local resource = {
		file = Path.getCSB("StageView", "stage"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_btnStarBox1 = {
				events = {{event = "touch", method = "_onBox1Touch"}}
			},
			_btnStarBox2 = {
				events = {{event = "touch", method = "_onBox2Touch"}}
			},
			_btnStarBox3 = {
				events = {{event = "touch", method = "_onBox3Touch"}}
			},
            _btnFormation = {
				events = {{event = "touch", method = "_onTeamClick"}}
			},
            _btnStarRank = {
				events = {{event = "touch", method = "_onStarRankClick"}}
			},
            _btnSiege =
            {
                events = {{event = "touch", method = "_onSiegeClick"}}
            },
            --[[
            _btnBoss =
            {
                events = {{event = "touch", method = "_onBossClick"}}
            },
            ]]
			_btnPassBox = {
				events = {{event = "touch", method = "_onPassBoxTouch"}}
            },
            _panelFamousStory = {
                events = {{event = "touch", method = "_onPanelStoryClick"}}
            },
		}
	}

    self:setName("StageView")
	StageView.super.ctor(self, resource)
end

function StageView:onCreate()
    local chapterName
    if self._chapterInfo.chapter == "" then
        chapterName = self._chapterInfo.name
    else
        chapterName = self._chapterInfo.chapter.." "..self._chapterInfo.name
    end
    local TopBarStyleConst = require("app.const.TopBarStyleConst")
	if self._topBar then
		self._topBar:updateUI(TopBarStyleConst.STYLE_PVE)
        -- self._topBar:setBGType(TopBarStyleConst.BG_TYPE_STAGE)
        self._topBar:setTitle(chapterName, 40, Colors.DARK_BG_THREE, Colors.DARK_BG_OUTLINE, true)
        -- self._topBar:pauseUpdate()
	end
    self:_setBtnBossVisible(false)
    self:_createScene()
    self:_createStageNodes()
    self:_createBoxInfo()
    self._scrollBG:setScrollBarEnabled(false)
    self._scrollBG:setInertiaScrollEnabled(false)
    self:_setBtnSiegeVisible(false)
    self._btnFormation:updateUI(FunctionConst.FUNC_TEAM, nil, "txt_main_enter_group2" )
    self._btnStarRank:updateUI(FunctionConst.FUNC_STORY_STAR_RANK )
    self._btnSiege:updateUI(FunctionConst.FUNC_PVE_SIEGE )
    local isPassBoxVisible = self._chapterData:getPreward() == 0
	self._btnPassBox:setVisible(isPassBoxVisible)
    self:_doLayoutTopButton()
    self._nodeFamous:setVisible(false)
    self._imageFamousStory:setVisible(not self._isFamousStroyOpen)
    self._imageFamousStoryOpen:setVisible(self._isFamousStroyOpen)
end

function StageView:onEnter()
    if G_UserData:getChapter():isExpired() then
        G_UserData:getChapter():pullData()
    end

    G_AudioManager:playMusicWithId(AudioConst.MUSIC_PVE)
    self._topBar:resumeUpdate()
    self._signalChapterBox = G_SignalManager:add(SignalConst.EVENT_CHAPTER_BOX, handler(self, self._onEventChapterBox))
    self._signalStageBox = G_SignalManager:add(SignalConst.EVENT_CHAPTER_STAGE_BOX, handler(self, self._onEventStageBox))
    self._signalSiegeInfo = G_SignalManager:add(SignalConst.EVENT_REBEL_ARMY, handler(self, self._onEventSiegeInfo))
    self._signalStarEftFinish = G_SignalManager:add(SignalConst.EVENT_STAR_EFFECT_END, handler(self, self._onStarEftFinish))
    self._signalGetAllAward = G_SignalManager:add(SignalConst.EVENT_GET_ALL_BOX, handler(self, self._onGetAllAward))
    -- self._signalSweepFinish = G_SignalManager:add(SignalConst.EVENT_SWEEP_FINISH, handler(self, self._onEventSweepFinish))
    self._signalTopBarPause = G_SignalManager:add(SignalConst.EVENT_TOPBAR_PAUSE, handler(self, self._onEventTopBarPause))
    self._signalTopBarStart = G_SignalManager:add(SignalConst.EVENT_TOPBAR_START, handler(self, self._onEventTopBarStart))
    self._signalExecuteStage = G_SignalManager:add(SignalConst.EVENT_EXECUTE_STAGE, handler(self, self._onEventExecuteStage))
	self._signalLevelup = G_SignalManager:add(SignalConst.EVENT_USER_LEVELUP, handler(self, self._onEventLevelUp))
    self._signalCommonZeroNotice = G_SignalManager:add(SignalConst.EVENT_COMMON_ZERO_NOTICE, handler(self, self._onEventCommonZeroNotice))
    self._signalChapterInfoGet = G_SignalManager:add(SignalConst.EVENT_CHAPTER_INFO_GET, handler(self, self._onEventChapterInfoGet))
    self._signalActDailyBoss = G_SignalManager:add(SignalConst.EVENT_ACTIVITY_DAILY_BOSS, handler(self, self._onEventDailyBoss))

    self._hasNewBox = false
    self:_refreshBoxState()
    local isShowEnd = self:_checkChapterEnd()
    if not isShowEnd then
        self:_refreshBossBtn()
        self:_refreshSiegeBtn()
        self:_refreshView()
        self:_refreshRedPoint()
        self:_checkRebel()
        self:_checkFamousUI()
    else
        G_UserData:getStage():resetRebel()
    end

    --如果需要进入特定关卡
    if self._stageId and self._stageId ~= 0 then
        self:_enterStageById(self._stageId)
        self._stageId = nil
    end

    --如果需要显示boss
    if self._showBoss then
        self:_openChapterBoss()
        self._showBoss = false
    end

    --self._btnBoss:updateUI(FunctionConst.FUNC_ELITE_BOSS)

    self:_checkFirstEnter()
	self._nextFunctionOpen:updateUI()
    self._isFirstEnter = false

    self:_showFirstReward()
end


function StageView:onExit()

    self._signalExecuteStage:remove()
    self._signalExecuteStage = nil

    self._signalChapterBox:remove()
    self._signalChapterBox = nil

    self._signalStageBox:remove()
    self._signalStageBox = nil

    self._signalSiegeInfo:remove()
    self._signalSiegeInfo = nil

    self._signalStarEftFinish:remove()
    self._signalStarEftFinish = nil

    self._signalGetAllAward:remove()
    self._signalGetAllAward = nil

    -- self._signalSweepFinish:remove()
    -- self._signalSweepFinish = nil

    self._signalTopBarPause:remove()
    self._signalTopBarPause = nil

    self._signalTopBarStart:remove()
    self._signalTopBarStart = nil

	self._signalLevelup:remove()
	self._signalLevelup = nil

    self._signalChapterInfoGet:remove()
    self._signalChapterInfoGet = nil

    self._signalCommonZeroNotice:remove()
	self._signalCommonZeroNotice = nil

    self._signalActDailyBoss:remove()
    self._signalActDailyBoss = nil

end

function StageView:_onEventChapterInfoGet(event)
    
end

--收到精英副本boss消息
function StageView:_onEventDailyBoss(eventName, ret)
    self:_refreshBossBtn()
end 

function StageView:_onEventCommonZeroNotice(event,hour)
     G_UserData:getChapter():pullData()
end


function StageView:_checkFamousUI()
    if self._chapterInfo.type ~= ChapterConst.CHAPTER_TYPE_FAMOUS then
        self._nodeFamous:setVisible(false)
        return
    end
    self._btnStarRank:setVisible(false)
    self._starBoxNode:setVisible(false)
    self._nodeFamous:setVisible(true)

    local count = G_UserData:getChapter():getFamousLeftCount()
    self._textFamousCount:setString(count)

    self._textFamousStory:setString(self._chapterInfo.subtitle)

end

function StageView:_onEventLevelUp()
	self._nextFunctionOpen:updateUI()
end

function StageView:_openStageBox()
    if self._hasNewBox then
        self._popupStageReward = require("app.scene.view.stage.PopupStageReward").new(self._chapterData, self._getStar, handler(self, self._openMovieText))
        self._popupStageRewardSignal = self._popupStageReward.signal:add(handler(self, self._onStageRewardClose))
        self._popupStageReward:open()
    else
        self:_openMovieText()
    end
    self:_showAllUI(false)
end

function StageView:_openMovieText()
    local configData = self._chapterInfo
    if configData.type == 1 then
        local MovieConst = require("app.const.MovieConst")
        local PopupMovieText = require("app.ui.PopupMovieText").new(MovieConst.TYPE_CHAPTER_END,
        function()
            --在引导阶段不执行popScene
            if G_TutorialManager:isDoingStep() == false then
                G_SceneManager:popScene()
            end
        end)
        PopupMovieText:showUI(configData.chapter, configData.name, configData.subtitle)
        self._chapterData:setShowEnding(false)
    else
        self._chapterData:setShowEnding(false)
        --在引导阶段不执行popScene
        if G_TutorialManager:isDoingStep() == false then
            G_SceneManager:popScene()
        end
    end

end

function StageView:_refreshRedPoint()
    local RedPointHelper = require("app.data.RedPointHelper")
    local hasPoint = RedPointHelper.isModuleReach( FunctionConst.FUNC_TEAM )
    self._btnFormation:showRedPoint(hasPoint)
end


--检查第一次进入
function StageView:_checkFirstEnter()
    --发送引导事件
    local function postEvent()
        G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP,self.__cname)
    end

    --发送第一次进入的消息
    local function sendTutorialStepEvent()
        self:_checkStartChat(postEvent)
    end

    local chapterData = self._chapterData
    if not chapterData:isHas_entered() then
        G_UserData:getChapter():c2sFirstEnterChapter(self._chapterInfo.id)
        local MovieConst = require("app.const.MovieConst")
        local PopupMovieText = require("app.ui.PopupMovieText").new(MovieConst.TYPE_CHAPTER_START, sendTutorialStepEvent)
        PopupMovieText:showUI(self._chapterInfo.chapter, self._chapterInfo.name)
    else
        postEvent()
    end
end

--检查章节完结
function StageView:_checkChapterEnd()
    if self._chapterInfo.type == ChapterConst.CHAPTER_TYPE_FAMOUS then
        return false
    end
    local needShow = self._chapterData:isShowEnding()
    if needShow then
        self:_openStageBox()
    end
    return needShow
end

--检查是否有叛军
function StageView:_checkRebel()
    local rebel = G_UserData:getStage():getNewRebel()
    if rebel then
        local popupSiegeCome = require("app.scene.view.stage.PopupSiegeCome").new(rebel)
        popupSiegeCome:openWithAction()
        G_UserData:getStage():resetRebel()
    end
end

--创建场景
function StageView:_createScene()
    -- self._scene = require(Path.getStageSceneName(self._chapterInfo.background)).new(self._chapterInfo.differ_value, self._chapterInfo.differ_front_value)
    self._scene = require("app.scene.view.stage.StageScene").new(self._chapterInfo.background)
    local size = self._scene:getSize()
    self._scrollBG:setInnerContainerSize(cc.size(size.width, size.height))
    local innerContainer = self._scrollBG:getInnerContainer()
    innerContainer:addChild(self._scene)
    self._scrollBG:addEventListener(handler(self, self._moveLayerTouch))
end

--屏幕滚动事件
function StageView:_moveLayerTouch()
    local innerContainer = self._scrollBG:getInnerContainer()
    local posX = innerContainer:getPositionX()
    self._scene:onMoveEvent(posX)
end

--创建人物节点
function StageView:_createStageNodes()
    local type = self._chapterInfo.type
    local stageIdList = self._chapterData:getStageIdList()
    for i = 1, #stageIdList do
        local stageData = G_UserData:getStage():getStageById(stageIdList[i])
        local stageNode = StageNode.new(stageData, handler(self, self._enterStageById), type == ChapterConst.CHAPTER_TYPE_FAMOUS)
        table.insert(self._stageList, stageNode)
        local configData = stageData:getConfigData()
        stageNode:setPosition(cc.p(configData.res_x, configData.res_y))
        self._scene:addStageNode(stageNode, i)
        if configData.box_id ~= 0 then
            self:_createBox(configData)
        end
    end
end

--创建关卡宝箱
function StageView:_createBox(data)
    local UIHelper = require("yoka.utils.UIHelper")
    local stageId = data.id
    local params = {
        name = "ImageBox_"..stageId,
        contentSize = cc.size(90, 90),
        anchorPoint = cc.p(0.5, 0),
        position = cc.p(data.box_x, data.box_y)
    }

    local panelBox = UIHelper.createPanel(params)
    table.insert(self._stageBox, panelBox)
    panelBox:setTouchEnabled(true)
    panelBox:setSwallowTouches(false)
    panelBox:addClickEventListenerEx(handler(self,self._onBoxTouch))
    panelBox:setTag(stageId)
    local texture = Path.getCommonIcon("common", "img_mapbox_guan")
    self:_refreshBoxImg(panelBox, texture)
    self._scene:addStageBox(panelBox)
end

--创建星数宝箱信息
function StageView:_createBoxInfo()
    self._starText1:setString(self._chapterInfo.copperbox_star)
    self._starText2:setString(self._chapterInfo.silverbox_star)
    self._starText3:setString(self._chapterInfo.goldbox_star)
    self._starTotal:setString(""..self._getStar.."/"..self._chapterInfo.goldbox_star)
end

--点击关卡宝箱
function StageView:_onBoxTouch(sender)
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
        local stageID = tonumber(sender:getTag())
        local stageData = G_UserData:getStage():getStageById(stageID)
        local data = stageData:getConfigData()
        local detail = Lang.get("get_box_detail", { name = data.name})
        local boxid = data.box_id
        self._boxInfo.type = "stage"
        self._boxInfo.id = stageID
        self._boxInfo.get = false
        self._boxInfo.canGet = false
        if stageData then
            local isPass = stageData:isIs_finished()
            if isPass then
                self._boxInfo.canGet = true
            end
            local isget = stageData:isReceive_box()
            if isget then
                self._boxInfo.get = true
            end
        end
        self:_showBoxReward(boxid, detail, sender)
	end
end

--展示宝箱
function StageView:_showBoxReward(boxid, boxDetail,sender ,star)
    local boxInfo = StoryBox.get(boxid)
    assert(boxInfo, "story_box not find id "..tostring(boxid))
    local rewards = {}
    for i = 1, 10 do
        local nameType = "type_"..i
        local nameValue = "value_"..i
        local nameSize = "size_"..i
        if boxInfo[nameType] ~= 0 then
            local item =
            {
                type = boxInfo[nameType],
                value = boxInfo[nameValue],
                size = boxInfo[nameSize],
            }
            table.insert(rewards, item)
        end
    end
    local strLabel = ""
    if self._boxInfo.type == "star" then
        strLabel = Lang.get("stage_star_box")
    elseif self._boxInfo.type == "stage" then
        strLabel = Lang.get("stage_box")
	elseif self._boxInfo.type == "passBox" then
		strLabel = Lang.get("stage_pass_box")
    end
    local popupBoxReward = require("app.ui.PopupBoxReward").new(strLabel, handler(self, self._onGetBoxClick),false, true)
    popupBoxReward:updateUI(rewards)
    popupBoxReward:setBtnText(Lang.get("get_box_reward"))
    if star then
        dump(star)
        popupBoxReward:setChapterDesc(star)
    else
		if  self._boxInfo.type == "passBox" then
			local richText = ccui.RichText:createWithContent(boxDetail)
			popupBoxReward:addRichTextDetail(richText)
			popupBoxReward:setDetailTextVisible(false)
		else
			popupBoxReward:setDetailText(boxDetail)
		end

    end

    if self._boxInfo.get then
        popupBoxReward:setBtnText(Lang.get("got_star_box"))
        popupBoxReward:setBtnEnable(false)
    else
        if not self._boxInfo.canGet then
            popupBoxReward:setBtnEnable(false)
        end
    end
    popupBoxReward:openWithTarget(sender)
end

--更新宝箱图片
function StageView:_refreshBoxImg(node, image)
    node:removeAllChildren(true)
    local boxTex = display.newSprite(image)
    boxTex:setAnchorPoint(0.5, 0.5)
    node:addChild(boxTex)
    local size = node:getContentSize()
    boxTex:setPosition(cc.p(size.width*0.5, size.height*0.5))
end

--处理boss相关内容
function StageView:_refreshBossBtn()
    if self._chapterData:getBossId() ~= 0 and self._chapterData:getBossState() == 0 then    --存在boss并且没有被击杀
        self:_setBtnBossVisible(true)
    else
        self:_setBtnBossVisible(false)
    end
end

--叛军相关内容
function StageView:_refreshSiegeBtn()
    local configData = self._chapterInfo
    if configData.type == 3 then
		self:_setBtnSiegeVisible(false)
        return
    end
    local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
    if not LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_PVE_SIEGE) then
        self:_setBtnSiegeVisible(false)
    elseif G_UserData:getSiegeData():isHasEnemy() or G_UserData:getRedPoint():isRebelArmy() then
        self:_setBtnSiegeVisible(true)
    else
        self:_setBtnSiegeVisible(false)
    end
end

--刷新函数
function StageView:_refreshView()
    local posNode = self:_refreshStageNode()
    local posBox = self:_refreshStageBoxState()
    -- if self._isFirstEnter then  --第一次进入时，跳转到需要的地方
    --     if posBox ~= 0 then
    --         self:_jumpStageMap(posBox)
    --     else
    --         self:_jumpStageMap(posNode)
    --     end
    -- end
    if self._isFirstEnter then
        self:_jumpStageMap(posNode)
    end
end

--进入指定关卡
function StageView:_enterStageById(stageId)
    local StoryStage = require("app.config.story_stage")
    local stageInfo = StoryStage.get(stageId)
    assert(stageInfo, "stageid = "..stageId.." is not in table")
    self:_jumpStageMap(stageInfo.res_x)
    local popStageDetail = require("app.scene.view.stage.PopupStageDetail").new(stageId)
    popStageDetail:openWithAction()
end

--跳转到制定stageid
function StageView:jumpToStagePos(stageId)
    local stageData = G_UserData:getStage():getStageById(stageId)
    local config = stageData:getConfigData()
    if config.box_id ~= 0 then
        local isget = stageData:isReceive_box()
        if isget then
            self:_jumpStageMap(config.res_x)
        else
            self:_jumpStageMap(config.box_x)
        end
    else
        self:_jumpStageMap(config.res_x)
    end
end


--刷新节点
function StageView:_refreshStageNode()
    local jumpPos = 0
    local hasJump = false       --只要一个跳入的就行
    for i, v in pairs(self._stageList) do
        v:refreshStageNode()
        if v:isVisible() then
            jumpPos = v:getPositionX()
        elseif not v:isVisible() and self._isFirstEnter and not hasJump then
            v:playEnter()
            jumpPos = v:getPositionX()
            hasJump = true
        end
    end
    return jumpPos
end

-- --新avatar进入
-- function

--跳地图到指定坐标
function StageView:_jumpStageMap(posX, moveTime)
    local innerContainer = self._scrollBG:getInnerContainer()
    local disWidth = G_ResolutionManager:getDesignWidth()
    local width = self._scene:getSize().width
    if posX < disWidth*0.5 then
        posX = 0
    elseif posX > width - disWidth*0.5 then
        posX = disWidth - width
    else
        posX = disWidth*0.5 - posX
    end
    if moveTime then
        local posY = innerContainer:getPositionY()
        local action = cc.MoveTo:create(moveTime, cc.p(posX, posY))
        innerContainer:runAction(action)
    else
        innerContainer:setPositionX(posX)
    end
    self._scene:onMoveEvent(posX)
end

--接受叛军信号
function StageView:_onEventSiegeInfo()
    if G_UserData:getSiegeData():isHasEnemy() or G_UserData:getRedPoint():isRebelArmy() then
        self:_setBtnSiegeVisible(true)
    else
        self:_setBtnSiegeVisible(false)
    end
end

--刷新星数
function StageView:_refreshStarBar()
    local percent = 0
    if self._getStar <= self._chapterInfo.copperbox_star then
        percent = math.floor(0.33 * self._getStar/self._chapterInfo.copperbox_star*100)
    elseif self._getStar <= self._chapterInfo.silverbox_star then
        percent = math.floor(0.66 * self._getStar/self._chapterInfo.silverbox_star*100)
    else
        percent = math.floor(self._getStar/self._chapterInfo.goldbox_star*100)
    end
    self._starBar:setPercent(percent)
end

--宝箱发光
function StageView:_createBoxEffect(index)
    if self._starBoxEft[index] or self._starRedpoint[index] then
        return
    end
    local baseNode
	if index == 4 then
		baseNode = self._btnPassBox
	else
		baseNode = self["_btnStarBox"..index]
	end
    if not baseNode then
        return
    end
 	local EffectGfxNode = require("app.effect.EffectGfxNode")
	local function effectFunction(effect)
        if effect == "effect_boxflash_xingxing"then
            local subEffect = EffectGfxNode.new("effect_boxflash_xingxing")
            subEffect:play()
            return subEffect
        end
    end
    local effect = G_EffectGfxMgr:createPlayMovingGfx( baseNode, "moving_boxflash", effectFunction, nil, false )
    self._starBoxEft[index] = effect
    local redPoint = display.newSprite(Path.getUICommon("img_redpoint"))
    baseNode:addChild(redPoint)
    redPoint:setPosition(cc.p(80, 66))
    self._starRedpoint[index] = redPoint
end

--删除宝箱发光
function StageView:_removeBoxFlash(index)
    if self._starBoxEft[index] then
        self._starBoxEft[index]:removeFromParent()
        self._starBoxEft[index] = nil
    end
    if self._starRedpoint[index] then
        self._starRedpoint[index]:removeFromParent()
        self._starRedpoint[index] = nil
    end
end

--刷新宝箱信息
function StageView:_refreshBoxState()
    self._getStar = 0
    local stageList = self._chapterData:getStageIdList()
    for _, val in pairs(stageList) do
        local stageData = G_UserData:getStage():getStageById(val)
        if stageData then
            self._getStar = self._getStar + stageData:getStar()
        end
    end
    local star = self._getStar
    self._starTotal:setString(""..self._getStar.."/"..self._chapterInfo.goldbox_star)
    local chapterData = self._chapterData

	--通关宝箱状态
	if chapterData:getPreward() ~= 0 then
		self:_removeBoxFlash(4)
		self._btnPassBox:loadTextures(Path.getChapterBox("btn_common_box6_3"), "", "", 0)
	else
		if chapterData:isLastStagePass() then
			self._btnPassBox:loadTextures(Path.getChapterBox("btn_common_box6_2"), "", "", 0)
			self:_createBoxEffect(4)
			self._hasNewBox = true
		end
	end

    if self._chapterInfo.copperbox_star == 0 then
        self._btnStarBox1:setVisible(false)
    else
        if star >= self._chapterInfo.copperbox_star then
            if chapterData:getBreward() == 0 then
                self._btnStarBox1:loadTextures(Path.getChapterBox("baoxiangtong_kai"), "", "", 0)
                self:_createBoxEffect(1)
                self._hasNewBox = true
            else
                self._btnStarBox1:loadTextures(Path.getChapterBox("baoxiangtong_kong"), "", "", 0)
                self:_removeBoxFlash(1)
            end
        end
    end
    if star >= self._chapterInfo.silverbox_star then
        if chapterData:getSreward() == 0 then
            self._btnStarBox2:loadTextures(Path.getChapterBox("baoxiangyin_kai"), "", "", 0)
            self:_createBoxEffect(2)
            self._hasNewBox = true
        else
            self._btnStarBox2:loadTextures(Path.getChapterBox("baoxiangyin_kong"), "", "", 0)
            self:_removeBoxFlash(2)
        end
    end
    if star >= self._chapterInfo.goldbox_star then
        if chapterData:getGreward() == 0 then
            self._btnStarBox3:loadTextures(Path.getChapterBox("baoxiangjin_kai"), "", "", 0)
            self:_createBoxEffect(3)
            self._hasNewBox = true
        else
            self._btnStarBox3:loadTextures(Path.getChapterBox("baoxiangjin_kong"), "", "", 0)
            self:_removeBoxFlash(3)
        end
    end
    self:_refreshStarBar()
end

--检查开始对话
function StageView:_checkStartChat(postEvent)
    -- if not self._chapterData:isHas_entered() then
        -- local ChatView = require("app.scene.view.storyChat.ChatView")
        local PopupStoryChat = require("app.scene.view.storyChat.PopupStoryChat")
        -- local storyChat = require("app.scene.view.storyChat.PopupStoryChat").new(4)
		-- storyChat:open()
        local count = StoryTouch.length()
        for i = 1, count do
            local touch = StoryTouch.indexOf(i)
            if touch.control_type == PopupStoryChat.TYPE_CHAPTER_START and touch.control_value1 == self._chapterInfo.id then
                -- local chatView = ChatView.new(touch.story_touch,postEvent)
                -- self:addChild(chatView)
                local storyChat = PopupStoryChat.new(touch.story_touch, postEvent)
		        storyChat:open()
                return
            end
        end
    -- end
    postEvent()
end

--刷新章节宝箱
function StageView:_refreshStageBoxState()
    local boxPos = 0
    for _, v in pairs(self._stageBox) do
        local stageID = tonumber(v:getTag())
        local stageData = G_UserData:getStage():getStageById(stageID)
        if stageData then
            local isPass = stageData:isIs_finished()
            local isget = stageData:isReceive_box()
            if isPass then
                if isget then
                    local texture = Path.getCommonIcon("common", "img_mapbox_kong")
                    self:_refreshBoxImg(v, texture)
                else
                    self:_createStageBoxEffect(v)
                    self._hasNewBox = true
                    if boxPos == 0 then
                        boxPos = v:getPositionX()
                    end
                end
            end
        end
    end
    return boxPos
end

--宝箱发光
function StageView:_createStageBoxEffect(baseNode)
    if not baseNode then
        return
    end
    baseNode:removeAllChildren(true)
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        if effect == "effect_boxjump"then
            local subEffect = EffectGfxNode.new("effect_boxjump")
            subEffect:play()
            return subEffect
        end
    end
    local effect = G_EffectGfxMgr:createPlayMovingGfx( baseNode, "moving_boxjump", effectFunction, nil, false )
    local size = baseNode:getContentSize()
    effect:setPosition(size.width*0.5, size.height*0.5)
end

--点击铜宝箱
function StageView:_onBox1Touch()
    local boxId = self._chapterInfo.copperbox_drop_id
    self._boxInfo.type = "star"
    self._boxInfo.id = 1
    local detail = Lang.get("get_star_box_detail2", {count = self._chapterInfo.copperbox_star,urlIcon = Path.getUICommon("img_lit_stars02")})
    local chapterData = self._chapterData
    if chapterData:getBreward() == 0 then
        self._boxInfo.get = false
    else
        self._boxInfo.get = true
    end
    if self._getStar >= self._chapterInfo.copperbox_star then
        self._boxInfo.canGet = true
    else
        self._boxInfo.canGet = false
    end
    local star = self._chapterInfo.copperbox_star
    self:_showBoxReward(boxId, detail, nil,star)
end

--点击银宝箱
function StageView:_onBox2Touch()
    local boxId = self._chapterInfo.silverbox_drop_id
    self._boxInfo.type = "star"
    self._boxInfo.id = 2
    local detail = Lang.get("get_star_box_detail2", {count = self._chapterInfo.silverbox_star,urlIcon = Path.getUICommon("img_lit_stars02")})
    local chapterData = self._chapterData
    if chapterData:getSreward() == 0 then
        self._boxInfo.get = false
    else
        self._boxInfo.get = true
    end
    if self._getStar >= self._chapterInfo.silverbox_star then
        self._boxInfo.canGet = true
    else
        self._boxInfo.canGet = false
    end
    local star = self._chapterInfo.silverbox_star
    self:_showBoxReward(boxId, detail,nil, star)
end

--点击金宝箱
function StageView:_onBox3Touch()
    local boxId = self._chapterInfo.goldbox_drop_id
    self._boxInfo.type = "star"
    self._boxInfo.id = 3
    local detail = Lang.get("get_star_box_detail2", {count = self._chapterInfo.goldbox_star , urlIcon = Path.getUICommon("img_lit_stars02")})
    local chapterData = self._chapterData
    if chapterData:getGreward() == 0 then
        self._boxInfo.get = false
    else
        self._boxInfo.get = true
    end
    if self._getStar >= self._chapterInfo.goldbox_star then
        self._boxInfo.canGet = true
    else
        self._boxInfo.canGet = false
    end
    local star = self._chapterInfo.goldbox_star
    self:_showBoxReward(boxId, detail,nil,star)
end

--点击金宝箱
function StageView:_onPassBoxTouch()

    local boxId = self._chapterInfo.chapterbox_drop_id
	self._boxInfo.type = "passBox"
	self._boxInfo.id = 4
	local stageIdList = self._chapterData:getStageIdList()
	local lastStageID = stageIdList[#stageIdList]
	local StoryStage = require("app.config.story_stage")
	local lastStageInfo = StoryStage.get(lastStageID)
	assert(lastStageInfo ~= nil, "lastStageInfo is nil")
	local qColor = Colors.getColor(lastStageInfo.color)
	local detail = Lang.get("stage_pass_box_detail", {name = lastStageInfo.name, color = Colors.colorToNumber(qColor)})

	local chapterData = self._chapterData
	if chapterData:getPreward() == 0 then
	    self._boxInfo.get = false
	else
	    self._boxInfo.get = true
	end

	if chapterData:isLastStagePass() then
	    self._boxInfo.canGet = true
	else
	    self._boxInfo.canGet = false
	end
	self:_showBoxReward(boxId, detail,nil,nil)
end

--点击开启宝箱事件
function StageView:_onGetBoxClick()
    if self._boxInfo.type == "star" then
        G_UserData:getChapter():c2sFinishChapterBoxRwd(self._chapterInfo.id, self._boxInfo.id)
	elseif self._boxInfo.type == "passBox" then
		G_UserData:getChapter():c2sFinishChapterBoxRwd(self._chapterInfo.id, self._boxInfo.id)
    elseif self._boxInfo.type == "stage" then
        G_UserData:getChapter():c2sReceiveStageBox(self._boxInfo.id)
    end
end

--开启关卡宝箱事件
function StageView:_onEventStageBox(eventName, stageId)
    self:_refreshStageBoxState()
    local stageData = G_UserData:getStage():getStageById(stageId)
    local boxid = stageData:getConfigData().box_id
    local boxInfo = StoryBox.get(boxid)
    local rewards = {}
    for i = 1, 10 do
        local nameType = "type_"..i
        local nameValue = "value_"..i
        local nameSize = "size_"..i
        if boxInfo[nameType] ~= 0 then
            local item =
            {
                type = boxInfo[nameType],
                value = boxInfo[nameValue],
                size = boxInfo[nameSize],
            }
            table.insert(rewards, item)
        end
    end
    local popupGetRewards = require("app.ui.PopupGetRewards").new()
    popupGetRewards:showRewards(rewards)
    if self._popupStageReward then
        self._popupStageReward:onBoxGet()
    end
end

--获得章节（星数）宝箱事件
function StageView:_onEventChapterBox(eventName, rewards, boxType)
    self:_refreshBoxState()
    local popupGetRewards = require("app.ui.PopupGetRewards").new()
    popupGetRewards:showRewards(rewards)
    if self._popupStageReward then
        self._popupStageReward:onBoxGet()
    end
end

--领取所有宝箱
function StageView:_onGetAllAward(eventName, rewards)

    local popupGetRewards = require("app.ui.PopupGetRewards").new(handler(self, self._openMovieText))
    popupGetRewards:showRewards(rewards)
    if self._popupStageReward then
        self._popupStageReward:close()
        self._popupStageReward = nil
    end
    self:_refreshBoxState()
    self:_refreshStageBoxState()
end

--点击阵容
function StageView:_onTeamClick()
	G_SceneManager:showScene("team")
end

--点击排行榜
function StageView:_onStarRankClick()
    G_SceneManager:showDialog("app.scene.view.stage.PopupStarRank", nil, self._chapterInfo.type, self._chapterInfo.type)
end

--点击叛军
function StageView:_onSiegeClick()
    G_SceneManager:showScene("siege")
end

--精英本boss
function StageView:_onBossClick()
    self:_openChapterBoss()
end

--打开本章boss界面
function StageView:_openChapterBoss()
    local bossId = self._chapterData:getBossId()
    local bossState = self._chapterData:getBossState()
    if bossState == 0 then
        local bossData = require("app.config.story_essence_boss").get(bossId)
        assert(bossData, "wrong bossId "..bossId)
        local showBoss = self._showBoss
        local popupBossDetail = require("app.scene.view.stage.PopupBossDetail").new(self._chapterInfo.type,self._chapterInfo.id, bossData, showBoss, self._isPopStageView)
        popupBossDetail:openWithAction()
    end
end

-- function StageView:_getNextStageNode(stageId)
--     local stageIdList = self._chapterData:getStageIdList()
--     local nextId = 0
--     for i = 1, #stageIdList do 
--         if stageIdList[i] == stageId then 
--             nextId = stageIdList[i+1]
--         end
--     end
--     if nextId == 0 then
--         return nil
--     end
--     for i, v in pairs()
-- end

--播放完成动画
function StageView:_onStarEftFinish()
    local fightStageId = G_UserData:getStage():getNowFightStage()
    if fightStageId == 0 then   --每一章节打完。会变0
        return
    end
    local stageData = G_UserData:getStage():getStageById(fightStageId)
    if not stageData:isIs_finished() then
        return
    end
    local nextStageNode = nil
    for i, v in pairs(self._stageList) do 
        if v:getStageId() == fightStageId and not v:isPass() then 
            nextStageNode = self._stageList[i+1]
        end 
    end
    if nextStageNode then
        nextStageNode:playEnter(function() self:_jumpStageMap(nextStageNode:getPositionX(), StageView.JUMP_MAP_TIME) end)
    end 
    -- local stageData = G_UserData:getStage():getStageById(fightStageId)
    -- local isFinish = stageData:isIs_finished()
    -- local stageIdList = self._chapterData:getStageIdList()
    -- local hasFinish = stageData:isLastIs_finished()
    -- if hasFinish ~= stageData:isIs_finished() then      --如果新通关了，找个列表中最进的没有显示的关卡进入
    --     for i, v in pairs(self._stageList) do
    --         if not v:isVisible() then
    --             v:playEnter(function() self:_jumpStageMap(v:getPositionX(), StageView.JUMP_MAP_TIME) end)
    --             return
    --         end
    --     end
    -- end
end

--一键领取框关闭事件
function StageView:_onStageRewardClose(event)
    if event == "close" then
        self._popupStageReward = nil
        self._popupStageRewardSignal:remove()
        self._popupStageRewardSignal = nil
    end
end

function StageView:_onEventTopBarPause()
    self._topBar:pauseUpdate()
end

function StageView:_onEventTopBarStart()
    self._topBar:resumeUpdate()
end

--隐藏所有节点以及ui
function StageView:_showAllUI(s)
    for i, v in pairs(self._stageList) do
        v:setVisible(s)
    end
    for i, v in pairs(self._stageBox) do
        v:setVisible(s)
    end
    self._btnFormation:setVisible(s)
    self._btnStarRank:setVisible(s)
    self._starBoxNode:setVisible(s)
    self:_setBtnSiegeVisible(s)
    self:_setBtnBossVisible(s)
    self._topBar:setVisible(s)
	self._btnPassBox:setVisible(s)
	self._nextFunctionOpenParent:setVisible(s)
end

--打副本消息
function StageView:_onEventExecuteStage(eventName, message, isFirstPass, stageId)
    -- local ReportParser = require("app.fight.report.ReportParser")
    -- local reportData = nil
    -- local stageData = G_UserData:getStage():getStageById(stageId)
    -- local stageInfo = stageData:getConfigData()
    -- if isFirstPass then
    --     if stageInfo.false_report ~= "" then
    --         local baseId = G_UserData:getHero():getRoleBaseId()
    --         local gender = 1
    --         if baseId > 10 then
    --             gender = 2
    --         end
    --         local report = require("app.config."..stageInfo.false_report.."_"..gender)
    --         reportData = ReportParser.parse(report, true)
    --     else
    --         reportData = ReportParser.parse(message.battle_report)
    --     end

    --     if self._chapterInfo.type == ChapterConst.CHAPTER_TYPE_FAMOUS then
    --         local DropHelper = require("app.utils.DropHelper")
    --         self._firstReward = DropHelper.getDropReward(stageInfo.first_drop)
    --     end
    -- else
    --     reportData = ReportParser.parse(message.battle_report)
    -- end
    -- local BattleDataHelper = require("app.utils.BattleDataHelper")
    -- local battleData = BattleDataHelper.parseNormalDungeonData(message, stageInfo, self._chapterInfo.type == ChapterConst.CHAPTER_TYPE_FAMOUS)
    -- G_SceneManager:showScene("fight", reportData, battleData)
    local function enterFightView()
        local battleReport = G_UserData:getFightReport():getReport()
        local ReportParser = require("app.fight.report.ReportParser")
        local reportData = nil
        local stageData = G_UserData:getStage():getStageById(stageId)
        local stageInfo = stageData:getConfigData()
        if isFirstPass then 
            if stageInfo.false_report ~= "" then    
                local baseId = G_UserData:getHero():getRoleBaseId()
                local gender = 1
                if baseId > 10 then
                    gender = 2
                end
                local report = require("app.config."..stageInfo.false_report.."_"..gender)
                reportData = ReportParser.parse(report, true)
            else    
                reportData = ReportParser.parse(battleReport)
            end

            if self._chapterInfo.type == ChapterConst.CHAPTER_TYPE_FAMOUS then
                local DropHelper = require("app.utils.DropHelper")
                self._firstReward = DropHelper.getDropReward(stageInfo.first_drop)
            end
        else 
            reportData = ReportParser.parse(battleReport)
        end
        local BattleDataHelper = require("app.utils.BattleDataHelper")
        local battleData = BattleDataHelper.parseNormalDungeonData(message, stageInfo, self._chapterInfo.type == ChapterConst.CHAPTER_TYPE_FAMOUS, isFirstPass)
        G_SceneManager:showScene("fight", reportData, battleData)
    end

    G_SceneManager:registerGetReport(message.battle_report, function() enterFightView() end)
end

function StageView:_setBtnSiegeVisible(isVisible)
	self._btnSiege:setVisible(isVisible)
	self:_doLayoutTopButton()
end

function StageView:_setBtnBossVisible(isVisible)
    if not self._nodeBoss then
        local StageBossNode = require("app.scene.view.stage.StageBossNode")
        self._nodeBoss = StageBossNode.new()
        self._nodeBoss:setCustomCallback(handler(self,self._onBossClick))
        self._nodeBossRoot:addChild(self._nodeBoss)
    end
    self._nodeBoss:refreshBossInfo(self._chapterData)
    self._nodeBossRoot:setVisible(isVisible)
	--self._btnBoss:setVisible(isVisible)

	self:_doLayoutTopButton()
end

function StageView:_doLayoutTopButton()
    -- local width = G_ResolutionManager:getDesignWidth() - 70
    -- local width = 0
    local posStart = -105
	local startIndex = 0
	local gap = 90
	if self._btnPassBox:isVisible() then
		self._btnPassBox:setPositionX(posStart - gap *startIndex)
		startIndex = startIndex + 1
	end

	if self._btnSiege:isVisible() then
		self._btnSiege:setPositionX(posStart - gap *startIndex)
		startIndex = startIndex + 1
	end

	if self._nodeBossRoot:isVisible() then
		self._nodeBossRoot:setPositionX(posStart - gap *startIndex)
		startIndex = startIndex + 1
	end
end

function StageView:_showFirstReward()
    if not self._firstReward then
        return
    end
    self:runAction(cc.Sequence:create(
        cc.DelayTime:create(0.3),
        cc.CallFunc:create(function()
            local popupGetRewards = require("app.ui.PopupGetRewards").new()

            local doubleTimes = 0
            if self._chapterInfo.type == ChapterConst.CHAPTER_TYPE_FAMOUS then
                doubleTimes = G_UserData:getReturnData():getPrivilegeRestTimes(ReturnConst.PRIVILEGE_FAMOUS_CHAPTER)
            end

            popupGetRewards:show(self._firstReward, nil, nil, nil, nil, doubleTimes > 0)
            self._firstReward = nil
        end)))
end

function StageView:_onPanelStoryClick()
    if self._isFamousStroyOpen then
        self._imageFamousStory:setVisible(true)
        self._imageFamousStoryOpen:setVisible(false)
        self._isFamousStroyOpen = false
    else
        self._imageFamousStory:setVisible(false)
        self._imageFamousStoryOpen:setVisible(true)
        self._isFamousStroyOpen = true
    end
end




return StageView
