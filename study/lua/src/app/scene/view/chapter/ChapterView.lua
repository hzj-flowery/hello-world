local ViewBase = require("app.ui.ViewBase")
local ChapterView = class("ChapterView", ViewBase)
local ChapterIcon = require("app.scene.view.chapter.ChapterIcon")
local StoryEssenceBoss = require("app.config.story_essence_boss")
local AudioConst = require("app.const.AudioConst")
local Path = require("app.utils.Path")
local ChapterConst = require("app.const.ChapterConst")
local ChapterMapCell = require("app.scene.view.chapter.ChapterMapCell")

local FunctionLevel = require("app.config.function_level")
local FunctionConst	= require("app.const.FunctionConst")
local ChapterRunMapNode =  import(".ChapterRunMapNode")

ChapterView.BG_COUNT = 4
ChapterView.REFRESH_DIS = 150    --滚动多少距离刷新
ChapterView.SCREEN_WIDTH_FIX = 250  --多出屏幕的刷新区域

--标签3种颜色
ChapterView.TYPE_NORMAL = 1
ChapterView.TYPE_HIGHLIGHT = 2
ChapterView.TYPE_DISABLE = 3

ChapterView.TOTAL_TYPE = 3          --总类型数量

ChapterView.ZORDER_CITY = 2000      --城市的zorder
ChapterView.MAP_WIDTH = 1136

function ChapterView:ctor(type)
    self._totalWidth = 0
    self._mapChapterCnt = 0
    self._bgType = 0
    self._lastChapterID = 0

    self._maps = {}
    self._chapters = {}
    self._generals = {}     --名将副本的帐篷

    self._chapterPool = {}      --城市csb池，复用csb达到减少loading的目的

    self._pageType = type or ChapterConst.CHAPTER_TYPE_NORMAL
    -- self._isChapterEliteClick = false
    -- self._btnBoss = nil     --敌军入侵
    self._signalActDailyBoss = nil  --精英副本boss信息
    self._needJump = false          --需要跳到当前副本

    self._lastMapX = 0

    self._isResizeScrollView = false

    --

    self._checkType1 = nil        --类型按钮
    self._checkType2 = nil
    self._checkType3 = nil
    self._imageLock1 = nil      --三个锁
    self._imageLock2 = nil
    self._imageLock3 = nil
    self._textType1 = nil       --三个字体（要变色）
    self._textType2 = nil
    self._textType3 = nil
    self._textTitle = nil       --标题

    --精英本boss ui
    self._nodeEliteEffect = nil  --特效或者ui节点
    self._btnBoss = nil         --敌军入侵

    self._openState = {}
    self._openState[ChapterConst.CHAPTER_TYPE_NORMAL] = true
    self._openState[ChapterConst.CHAPTER_TYPE_ELITE] = false
    self._openState[ChapterConst.CHAPTER_TYPE_FAMOUS] = false

    self._mapIndex = 1
    self._showPassLevelAnim = false
	local resource = {
		file = Path.getCSB("ChapterView", "chapter"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
            _btnBoss = {
				events = {{event = "touch", method = "_onBossClick"}}
			},
		}
	}
    self:setName("ChapterView")
    ChapterView.super.ctor(self, resource)
    
end

function ChapterView:onCreate()
    --cc.bind(self._commonChat,"CommonMiniChat")
    --self._topbarBase:setImageTitle("txt_sys_com_zhenyingjingji")
    self._topbarBase:setItemListVisible(false)

    self._scrollBG:setScrollBarEnabled(false)
    for i = 1, ChapterView.TOTAL_TYPE do
        self["_checkType"..i]:addEventListener(handler(self, self._onTypeClick))
    end

	if ChapterConst.CHAPTER_TYPE_NORMAL == self._pageType then
		local ChapterBox = require("app.scene.view.chapter.ChapterBox")
		self._chapterBox = ChapterBox.new()
		self._chapterBoxParent:addChild(self._chapterBox)
    end
    
    self:_createCityNode()
    self:_createAllMaps()
    
    if self._pageType == ChapterConst.CHAPTER_TYPE_NORMAL then
        self:_createNormalMap()
    elseif self._pageType == ChapterConst.CHAPTER_TYPE_ELITE then
        self:_createEliteMap()
    elseif self._pageType == ChapterConst.CHAPTER_TYPE_FAMOUS then
        self:_createFamousMap()
    end

    self._scrollBG:addEventListener(handler(self, self._moveLayerTouch))
    
end

function ChapterView:onEnter()
    G_AudioManager:playMusicWithId(AudioConst.MUSIC_PVE)
    
    --TODO 章节拉取信息
    if G_UserData:getChapter():isExpired() then
        G_UserData:getChapter():c2sGetChapterList()
    end
    
    self._signalActDailyBoss = G_SignalManager:add(SignalConst.EVENT_ACTIVITY_DAILY_BOSS, handler(self, self._onEventDailyBoss))
    self._signalChapterInfoGet = G_SignalManager:add(SignalConst.EVENT_CHAPTER_INFO_GET, handler(self, self._onEventChapterInfoGet))
    self._signalCommonZeroNotice = G_SignalManager:add(SignalConst.EVENT_COMMON_ZERO_NOTICE, handler(self, self._onEventCommonZeroNotice))
    self._chapterBoxSignal = G_SignalManager:add(SignalConst.EVENT_GET_PERIOD_BOX_AWARD_SUCCESS, handler(self, self._getChapterBoxAward))
    self._signalRedPointUpdate = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self,self._onEventRedPointUpdate))

    G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP,self.__cname)
    
    self:_refreshUsedNode()
    self:_checkNewChapter()
    self:_checkFamousUI()
    self:_refreshGeneral()
    self:_refreshTypeTitle()
    self:_refreshRedPoint()

	if self._chapterBox then
		self._chapterBox:updateUI()
	end
	self._nextFunctionOpen:updateUI()

    self._nodeEliteEffect:setVisible(false)

    self:_checkChapterBoss()
end

function ChapterView:onExit()
    --滚动停止
    self._scrollBG:stopAutoScroll()

    self._signalActDailyBoss:remove()
    self._signalActDailyBoss = nil
    self._signalRedPointUpdate:remove()
    self._signalRedPointUpdate = nil
	self._chapterBoxSignal:remove()
    self._chapterBoxSignal = nil
    self._signalChapterInfoGet:remove()
    self._signalChapterInfoGet = nil
    self._signalCommonZeroNotice:remove()
    self._signalCommonZeroNotice = nil
end

--创建城市池
function ChapterView:_createCityNode()
    local resList = G_UserData:getChapter():getResList()
    for i = 1, #resList do 
        local chapterNode = ChapterIcon.new(resList[i])
        chapterNode:setVisible(false)
        local innerContainer = self._scrollBG:getInnerContainer()
        innerContainer:addChild(chapterNode, ChapterView.ZORDER_CITY)
        table.insert(self._chapterPool, chapterNode)
    end
end

--创建4幅地图
function ChapterView:_createAllMaps()
    for i = 1, ChapterView.BG_COUNT do 
        local mapCell = ChapterMapCell.new(i)
        mapCell:setPosition(cc.p(0, 0))
        mapCell:setVisible(true)
        mapCell:setPositionX((i-1)*1136)
        local innerContainer = self._scrollBG:getInnerContainer()
        innerContainer:addChild(mapCell)
        table.insert(self._maps, mapCell)
    end
    self._lastStartPos = 1
end

function ChapterView:_checkFamousUI()
    if self._pageType == ChapterConst.CHAPTER_TYPE_FAMOUS then
        local count = G_UserData:getChapter():getFamousLeftCount()
        self._textFamousCount:setString(count)
    end
end

function ChapterView:_onEventChapterInfoGet(event)
    --  self:_refreshMap()
    self:_refreshUsedNode()
    self:_checkChapterBoss()
end

function ChapterView:_onEventCommonZeroNotice(event,hour)
    G_UserData:getChapter():pullData()
end

function ChapterView:_onEventRedPointUpdate(event,funcId,param)
	if funcId ==  FunctionConst.FUNC_NEW_STAGE then
		self:_refreshRedPoint()
    end

end

function ChapterView:_getChapterBoxAward(event, awards)
	if awards then
		local popupGetRewards = require("app.ui.PopupGetRewards").new()
		popupGetRewards:showRewards(awards)
	end
	if self._chapterBox then
		self._chapterBox:updateUI()
	end
	self:_refreshRedPoint()
end

function ChapterView:_refreshRedPoint()
    for type = 1, ChapterView.TOTAL_TYPE do
        local redPoint = false
        if type == ChapterConst.CHAPTER_TYPE_ELITE then
            local RedPointHelper = require("app.data.RedPointHelper")
            redPoint = RedPointHelper.isModuleReach(FunctionConst.FUNC_ELITE_CHAPTER)
        else
            redPoint = G_UserData:getChapter():hasRedPointForExplore(type)
        end
        self["_imageRedPoint"..type]:setVisible(redPoint)
    end
end

function ChapterView:_refreshTypeTitle()
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local isOpen, desc, funcInfo = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_ELITE_CHAPTER)
	if isOpen then
        self._openState[ChapterConst.CHAPTER_TYPE_ELITE] = true
	end
    local isOpen, desc, funcInfo = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_FAMOUS_CHAPTER)
	if isOpen then
        self._openState[ChapterConst.CHAPTER_TYPE_FAMOUS] = true
	end

    for type = 1, ChapterView.TOTAL_TYPE do
        if not self._openState[type] then
            self["_imageLock"..type]:setVisible(true)
            self["_checkType"..type]:setSelected(false)
            self["_checkType"..type]:setBright(false)
            self["_textType"..type]:setColor(Colors.getChapterTypeColor(ChapterView.TYPE_DISABLE))
            self["_textType"..type]:enableOutline(Colors.getChapterTypeOutline(ChapterView.TYPE_DISABLE), 2)
        else
            self["_checkType"..type]:setBright(true)
            self["_imageLock"..type]:setVisible(false)
            if self._pageType == type then
                self["_checkType"..type]:setSelected(true)
                self["_textType"..type]:setColor(Colors.getChapterTypeColor(ChapterView.TYPE_HIGHLIGHT))
                self["_textType"..type]:enableOutline(Colors.getChapterTypeOutline(ChapterView.TYPE_HIGHLIGHT), 2)
            else
                self["_checkType"..type]:setSelected(false)
                self["_textType"..type]:setColor(Colors.getChapterTypeColor(ChapterView.TYPE_NORMAL))
                self["_textType"..type]:enableOutline(Colors.getChapterTypeOutline(ChapterView.TYPE_NORMAL), 2)
            end
        end
    end
    --self._textTitle:setString(Lang.get("chapter_type")[self._pageType])
    self._topbarBase:setTitle(Lang.get("chapter_type")[self._pageType], 40, cc.c3b(0xff, 0xcc, 0x00), cc.c3b(0xb2, 0x5d, 0x1e))
end

--清除现在地图
function ChapterView:_clearMap()
    -- local innerContainer = self._scrollBG:getInnerContainer()
    -- innerContainer:removeAllChildren()

    -- for i, v in pairs(self._maps) do 
    --     v:removeFromParent()
    -- end
    for i, v in pairs(self._chapterPool) do 
        v:unUse()
    end

    -- self:_createAllMaps()

    -- self._chapterPool = {}

    self._totalWidth = 0
    self._mapChapterCnt = 0
    self._bgType = 0
    self._lastChapterID = 0
    -- self._maps = {}
    self._chapters = {}
    self._mapIndex = 1
    self._lastMapX = 0
end

--刷新副本,新建时候用
function ChapterView:_refreshMap()
    local chapterData = G_UserData:getChapter()
    local openChapterList = chapterData:getOpenChapter(self._pageType)
    local lastChapter = openChapterList[#openChapterList]
    self._mapChapterCnt = #openChapterList 
    
    local lastX = lastChapter:getConfigData().island_x
    self._lastChapterID = lastChapter:getId()
    
    
    self:_resizeScrollView(lastX)

    if self._needJump then
        self._scrollBG:jumpToPercentHorizontal(100)
        self:_refreshChapterPool()
        self:_refreshCityNode()
        self:_jumpMap(lastX)
        self._needJump = false
    end   

    self:_refreshCityNode()
end

function ChapterView:_refreshUsedNode()
    local chapterData = G_UserData:getChapter()
    local openChapterList = chapterData:getOpenChapter(self._pageType)
    local lastChapter = openChapterList[#openChapterList]
    for i, v in pairs(self._chapterPool) do 
        if not v:canUse() then 
            v:refreshUI()
            if v:getChapterId() == lastChapter:getId() then 
                v:showSword(true)
            else 
                v:showSword(false)
            end
        end
    end
end

function ChapterView:_checkNewChapter()
    local newChapter = false
    local chapterData = G_UserData:getChapter()
    local openChapterList = chapterData:getOpenChapter(self._pageType)
    if self._lastChapterID ~= openChapterList[#openChapterList]:getId() then 
        local curConfig = openChapterList[#openChapterList]:getConfigData()
        local curChapterIcon = self:_getChapterNode(curConfig)
        if curChapterIcon then
            curChapterIcon:setData(openChapterList[#openChapterList])
            newChapter = true
            self._lastMapX = 0
            self._lastChapterID = openChapterList[#openChapterList]:getId()
        end
    end

    if newChapter then
        local lastChapter = openChapterList[#openChapterList]
        local beforeChapter = openChapterList[#openChapterList-1]
        local lastX = lastChapter:getConfigData().island_x
        self:_resizeScrollView(lastX)
        self:_jumpMap(lastX)
        local beforeNode = self:_getChapterNodeById(beforeChapter:getId())
        local node = self:_getChapterNodeById(lastChapter:getId())
        if beforeNode and node then
            self:startRumMapAnim(beforeNode, node)
        end
    end
end

function ChapterView:_isInView(cityPosX)
    local innerContainer = self._scrollBG:getInnerContainer()
    local posX = -innerContainer:getPositionX()
    if cityPosX - posX > -ChapterView.SCREEN_WIDTH_FIX and cityPosX - posX < G_ResolutionManager:getDesignWidth() + ChapterView.SCREEN_WIDTH_FIX then 
        return true
    end
    return false
end


--刷新状态
function ChapterView:_refreshChapterPool()
    for i, v in pairs(self._chapterPool) do 
        local positionX = v:getPositionX()
        if not v:canUse() and not self:_isInView(positionX) then 
            v:unUse()
        end
    end
end

--获得可用的节点
function ChapterView:_getChapterNode(chapterConfig)
    local effectName = chapterConfig.island_eff
    for _, v in pairs(self._chapterPool) do 
        if v:canUse() and v:getEffectName() == effectName then 
            return v
        end
    end
    local chapterNode = ChapterIcon.new(effectName)
    chapterNode:setVisible(false)
    local innerContainer = self._scrollBG:getInnerContainer()
    innerContainer:addChild(chapterNode, ChapterView.ZORDER_CITY)
    table.insert(self._chapterPool, chapterNode)
    return chapterNode
end

--更具章节id获得节点
function ChapterView:_getChapterNodeById(chapterId)
    for _, v in pairs(self._chapterPool) do 
        if not v:canUse() and v:getChapterId() == chapterId then 
            return v
        end
    end
end

--根据坐标刷新需要显示的城市
function ChapterView:_refreshCityNode()
    local function isChapterInMap(chapterId)
        for i, v in pairs(self._chapterPool) do 
            if v:getChapterId() == chapterId then 
                return true
            end
        end
        return false
    end
    
    local chapterData = G_UserData:getChapter()
    local openChapterList = chapterData:getOpenChapter(self._pageType)
    local lastChapter = openChapterList[#openChapterList]
    for _, data in pairs(openChapterList) do 
        if self:_isInView(data:getConfigData().island_x) and not isChapterInMap(data:getId()) then 
            local chapterIcon = self:_getChapterNode(data:getConfigData())
            if chapterIcon then
                chapterIcon:setData(data)
                if data:getId() == lastChapter:getId() then 
                    chapterIcon:showSword(true)
                else 
                    chapterIcon:showSword(false)
                end
            end
        end
    end
end

function ChapterView:_moveLayerTouch(sender, event)
    if event == 9 then
        local pos = sender:getInnerContainerPosition()
        if math.abs(pos.x - self._lastMapX) > ChapterView.REFRESH_DIS then  
            self:_refreshChapterPool()
            self:_refreshCityNode()
            self._lastMapX = pos.x
        end
        self:_updateMap(pos.x)
    end
end

--创建普通副本
function ChapterView:_createNormalMap()
    self:_clearMap()
    self._needJump = true
    self:_refreshMap()
    self._nodeFamous:setVisible(false)
    self:_showGeneral(false)
    self:_hideEliteBoss()
end

--创建精英地图
function ChapterView:_createEliteMap()
    self:_clearMap()
    self._needJump = true
    self:_refreshMap()
    self._nodeFamous:setVisible(false)
    self:_showGeneral(false)
    self:_checkChapterBoss()
end

--创建名将副本
function ChapterView:_createFamousMap()
    self:_clearMap()
    self._needJump = true
    self:_refreshMap()
    self._nodeFamous:setVisible(true)
    self:_checkFamousUI()
    self:_refreshGeneral()
    self:_hideEliteBoss()
end

--跳转地图到当前关卡
function ChapterView:_jumpMap(lastX)
    local moveX = -lastX + G_ResolutionManager:getDesignWidth() * 0.5
    if moveX > 0 then
        moveX = 0
    end

    local innerContainer = self._scrollBG:getInnerContainer()
    local containerSize = innerContainer:getContentSize()
    local minX = containerSize.width-G_ResolutionManager:getDesignWidth()
    moveX = math.max(moveX,-minX)

    self._scrollBG:scrollToRight(0, false)
    self:_updateMap(moveX)
end

--重新制定地图滚动大小
function ChapterView:_resizeScrollView(iconPosX)
    local newW = iconPosX + G_ResolutionManager:getDesignWidth() * 0.5
    newW = math.max(newW, G_ResolutionManager:getDesignWidth())
    self._scrollBG:setInnerContainerSize(cc.size(newW, G_ResolutionManager:getDesignHeight()))
end

--调整地图zorder层级
function ChapterView:reOrderMaps()
    for i, v in pairs(self._maps) do
        v:setLocalZOrder(#self._maps-i)
    end
end

--收到精英副本boss消息
function ChapterView:_onEventDailyBoss(eventName, ret)
    -- self:_refreshMap()
    self:_refreshUsedNode()
    self:_checkChapterBoss()
end

--点击boss头像
function ChapterView:_onBossClick()
    local chapterData = G_UserData:getChapter()
    local bossChapters = chapterData:getBossChapters()
    if #bossChapters ~= 0 then
        local popupBossCome = require("app.scene.view.chapter.PopupBossCome").new(bossChapters)
        popupBossCome:open()
    end
end

--检查是否有章节boss
function ChapterView:_checkChapterBoss()
     if self._pageType ~= ChapterConst.CHAPTER_TYPE_ELITE then 
        self:_hideEliteBoss()
        return 
    end

    local chapterData = G_UserData:getChapter()
    local bossChapters = chapterData:getBossChapters()
    local hasAliveBoss = false
    for i, v in pairs(bossChapters) do
        if v:getBossState() == 0 then
            hasAliveBoss = true
            break
        end
    end
    logWarn("ChapterView  _checkChapterBoss 11111111  "..tostring(hasAliveBoss))
    if hasAliveBoss then
        if chapterData:isShowBossPage() then
            chapterData:setShowBossPage(false)
            self:_playEliteBossEnter()
        else
            self:_playEliteBoss()
        end
    else
       self:_hideEliteBoss()
    end
end

--点击返回按钮
function ChapterView:_onReturnClick()
    G_SceneManager:popScene()
end

--点击种类按钮
function ChapterView:_onTypeClick(sender)
    local changeType = 0
    for type = 1, ChapterView.TOTAL_TYPE do
        if sender == self["_checkType"..type] then
            changeType = type
            break
        end
    end
    if self._openState[changeType] and self._pageType ~= changeType then
        self._pageType = changeType
        self._scrollBG:setScrollBarEnabled(false)
        if self._pageType == ChapterConst.CHAPTER_TYPE_NORMAL then
            self:_createNormalMap()
        elseif self._pageType == ChapterConst.CHAPTER_TYPE_ELITE then
            self:_createEliteMap()
        elseif self._pageType == ChapterConst.CHAPTER_TYPE_FAMOUS then
            self:_createFamousMap()
        end

		if self._chapterBox then
			self._chapterBox:setChapterBoxVisible(self._pageType == ChapterConst.CHAPTER_TYPE_NORMAL)
		end
    end
    self:_refreshTypeTitle()
end

--跑图动画
function ChapterView:startRumMapAnim(chapterBefore,chapterAfter)
    self._panelTouch:setVisible(true)
    chapterBefore:startPassAnim()
    chapterAfter:startNewChapterAnim(handler(self,self.onRunMapAnimComplete))

    G_AudioManager:playSoundWithId(AudioConst.SOUND_ISLANG_OPEN)

    local posX1, posY1  = chapterBefore:getPosition()
    local posX2, posY2  = chapterAfter:getPosition()
    posY1 = posY1 + 150 - 45
    posY2 = posY2 + 150 - 45
    local offset_x = 130
    local offset_y = offset_x*(posY2-posY1)/(posX2-posX1)

    local node = ChapterRunMapNode.new()
    node:run(cc.p(posX1+offset_x,posY1+offset_y),cc.p(posX2,posY2))
    --self:addChild(node)
    local innerContainer = self._scrollBG:getInnerContainer()
    innerContainer:addChild(node, ChapterView.ZORDER_CITY)
end

function ChapterView:isPlayingPassLevelAnim()
    return self._showPassLevelAnim
end

function ChapterView:onRunMapAnimComplete()
    self._showPassLevelAnim = false
    self._panelTouch:setVisible(false)
    G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP,"ChapterView:onRunMapAnimComplete")
end

function ChapterView:_playEliteBossEnter()
    self._nodeEliteEffect:removeAllChildren()
    self._nodeEliteEffect:setVisible(true)
    local function eventFunction(event)
        if event == "finish" then
            self:_playEliteBoss()
        end
    end
    local effect = G_EffectGfxMgr:createPlayGfx(self._nodeEliteEffect, "effect_jingying_qimataofa", eventFunction, true)
    self._qimaEffect = effect
end

function ChapterView:_playEliteBoss()
    -- local function test(  )
    --     -- body
    --     if self._qimaEffect then
    --         self._qimaEffect:removeFromParent()
    --         self._qimaEffect = nil
    --     end
    -- end
    -- local delay = cc.DelayTime:create(1)
    -- local action = cc.Sequence:create(delay, cc.CallFunc:create(test))
    -- self:runAction(action)

    if  self._showBossEffect then
        self._nodeEliteEffect:setVisible(true)
        self._btnBoss:setVisible(true)
        return
    end

    self._nodeEliteEffect:removeAllChildren()
    self._nodeEliteEffect:setVisible(true)
    self._showBossEffect = G_EffectGfxMgr:createPlayGfx(self._nodeEliteEffect, "effect_jingying_taofahuo")
    self._btnBoss:setVisible(true)
end

function ChapterView:_hideEliteBoss()
    self._nodeEliteEffect:setVisible(false)
    self._btnBoss:setVisible(false)        
end

--刷新名将副本的帐篷
function ChapterView:_refreshGeneral()
    if self._pageType ~= ChapterConst.CHAPTER_TYPE_FAMOUS then 
        return 
    end
    self:_showGeneral(true)
    local generalList = G_UserData:getChapter():getOpenGeneralIds()
    for _, data in pairs(generalList) do
        local hasCity = false
        for _, city in pairs(self._generals) do
            if city:getId() == data:getId() then
                city:refresh()
                hasCity = true
                break
            end
        end
        
        if not hasCity then
            local city = require("app.scene.view.chapter.ChapterGeneralIcon").new(data)
            local innerContainer = self._scrollBG:getInnerContainer()
            innerContainer:addChild(city, ChapterView.ZORDER_CITY)
            table.insert(self._generals, city)
        end
    end
end

--隐藏名将帐篷
function ChapterView:_showGeneral(s)
    for i, v in pairs(self._generals) do 
        v:setVisible(s)
    end
end



function ChapterView:_updateMap(posX)

    -- posX 是滚动层的 x坐标，所以是负数
    -- 首先获得当前是第几幅地图
    local distance = posX * -1
    local offsetMid = distance
    -- local offsetMid = distance + G_ResolutionManager:getDesignWidth()/2 --中间坐标

    local cellCount = math.ceil(offsetMid / ChapterView.MAP_WIDTH)    --中间的块数
    local midIndex = cellCount % 4 + 1
    self._maps[midIndex]:setPositionX(cellCount*ChapterView.MAP_WIDTH)

    local leftIndex = (cellCount - 1) % 4 + 1
    self._maps[leftIndex]:setPositionX((cellCount-1)*ChapterView.MAP_WIDTH)

    local rightIndex = (cellCount + 1) % 4 + 1
    self._maps[rightIndex]:setPositionX((cellCount+1)*ChapterView.MAP_WIDTH)
    

    -- local offsetX = posX * -1
    -- local offsetX2 = posX * -1
    -- offsetX = offsetX + G_ResolutionManager:getDesignWidth()
    -- offsetX2 = offsetX2 - G_ResolutionManager:getDesignWidth()

    -- local cellCount = math.ceil(offsetX / ChapterView.MAP_WIDTH)
    -- local cellCountLeft = math.ceil(offsetX2 / ChapterView.MAP_WIDTH)
     
    -- local cellIndex = cellCount % 4 + 1
    -- self._maps[cellIndex]:setPositionX(cellCount*ChapterView.MAP_WIDTH)
    -- local cellIndexLeft = cellCountLeft % 4 + 1
    -- self._maps[cellIndexLeft]:setPositionX(cellCountLeft*ChapterView.MAP_WIDTH)
end
    

return ChapterView
