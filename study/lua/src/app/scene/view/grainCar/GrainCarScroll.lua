-- Description: 劫镖scroll容器
-- Company: yoka
-- Author: chenzhongjie
-- Date: 2019-09-04
local ViewBase = require("app.ui.ViewBase")
local GrainCarScroll = class("GrainCarScroll", ViewBase)
local CSHelper = require("yoka.utils.CSHelper")
local GrainCarDataHelper = require("app.scene.view.grainCar.GrainCarDataHelper")
local SchedulerHelper = require("app.utils.SchedulerHelper")

GrainCarScroll.BG_WIDTH = 1400                   --背景宽度
GrainCarScroll.ROBBER_WIDTH = 150                --avatar宽
GrainCarScroll.ROBBER_HEIGHT = 150               --avatar高
GrainCarScroll.GUILD_PADDING = 230               --相邻军团间隔
GrainCarScroll.LINE_NUM = 3                      --行数
GrainCarScroll.MAX_AVATAR = 30                   --最多多少avatar
GrainCarScroll.MAX_CAR_AVATAR = 6                --最多多少粮车avatar
GrainCarScroll.SCROLL_INVIEW_PADDING = 200       --在视野中的误差
GrainCarScroll.SCROLL_START_POS = cc.p(100, 400)  --初始位置
GrainCarScroll.DEFAULT_COLUMN = 2                --我方人数不够，默认多少列填充

local GESTURE_TOUCH_BEGAN   = 1
local GESTURE_TOUCH_MOVE    = 2
local GESTURE_TOUCH_END     = 3

function GrainCarScroll:ctor(mineData)
    self:_initMember(mineData)

	local resource = {
		file = Path.getCSB("GrainCarScroll", "grainCar"),
		-- binding = {
        --     _btnMoveIn = {
        --         events = {{event = "touch", method = "_onBtest"}}
        --     },
		-- }
	}
	self:setName("GrainCarScroll")
	GrainCarScroll.super.ctor(self, resource)
end

-- function GrainCarScroll:_onBtest()
--     self:updateLayout()
--     -- self:updateLayout()
-- end
function GrainCarScroll:onCreate()
    self:_initAvatarPool()
    self:_initScrollView()
end

function GrainCarScroll:onEnter()
    self:_updateData()
    self:_resetAvatarPool()
    
    self:_initAvatarLayout()
    local totalWidth = self:_getTotalWidth()
    self._scrollView:setInnerContainerSize(cc.size(totalWidth, self._scrollSize.height))

    self:_refreshAvatarPos()
    self:_findMe()

    -- --test
    -- self._scheduleGestureHandler2 = SchedulerHelper.newSchedule(handler(self, self._testTimer), 4)
end

function GrainCarScroll:_testTimer()
    self:updateLayout()
end

function GrainCarScroll:onExit()
    self:_resetAvatarPool()
    self:_stopGestureTimer()

    -- --test
     --SchedulerHelper.cancelSchedule(self._scheduleGestureHandler2)
end

function GrainCarScroll:onShowFinish()
end

function GrainCarScroll:_initMember(mineData)
    self._mineData = mineData
    self._bgList = {}
    self._avatarUnusedPool = {} --角色复用池
    self._avatarUsedPool = {}   --角色已用池
    self._carUnusedPool = {}    --粮车复用池
    self._carUsedPool = {}      --粮车已用池
    self._windowIndex = 1       --滑动窗口序号
    self._isDirty = false       --是否是脏数据
    self._curGuild = nil        --当前聚焦军团(滑动聚焦)
    self._curAtkGuild = nil     --当前聚焦军团(攻击聚焦)
    self._bLockCurGuild = false --锁定当前聚焦军团（不锁定的话setInnerContainerSize会有问题）
    self._gestureList = {}      --手势列表
end

function GrainCarScroll:_updateData()
    self._avatarUsedPool = {}   --角色已用池
    self._carUsedPool = {}      --粮车已用池

    self._mineData = G_UserData:getMineCraftData():getMineDataById(self._mineData:getId())
    self._guildData = {}
    self._guildData = GrainCarDataHelper.getUserListDividByGuildWithMineId(self._mineData:getId())
    self._guildData = GrainCarDataHelper.sortGuild(self._guildData)


    self._userData = {}
    self._guildHashData = {}
    for iGuild, guild in pairs(self._guildData) do
        for iUser, user in pairs(guild.data) do
            self._userData["k" .. user.id] = user
        end
    end
    for iGuild, guild in pairs(self._guildData) do
        self._guildHashData['k' .. guild.id] = guild
    end
end

------------------------------------------------------------------
----------------------------外部方法-------------------------------
------------------------------------------------------------------
function GrainCarScroll:scroll2Guild(guildId)
    for iGuild, guild in pairs(self._guildData) do
        if guild.id == guildId then
            local windowWidth = self._scrollSize.width
            if self._scrollView:getInnerContainerSize().width == windowWidth then
                self._scrollView:scrollToPercentHorizontal(0, 0.5, true)
            else
                local percent = 100 * (guild.pos.x - windowWidth / 2) / (self._scrollView:getInnerContainerSize().width - windowWidth)
                self._scrollView:scrollToPercentHorizontal(percent, 0.5, true)
            end
        end
    end
end

--更新某个粮车
function GrainCarScroll:updateCar(carUnit)
    for iGuild, guild in pairs(self._guildData) do
        if guild.id == carUnit:getGuild_id() then
            guild.isDirty = true
        end
    end
    self:_refreshAvatarPos()
end

--更新布局
function GrainCarScroll:updateLayout()
    if self:_isTouched() then
        self._isDirty = true
    else
        self:_resetAvatarPool()
        self:_updateData()
        self:_initAvatarLayout()
        self._userCenterX = self:_getUserCenterX()
        
        self._bLockCurGuild = true
        --调整容器大小 会改变_curGuild
        local totalWidth = self:_getTotalWidth()
        self._scrollView:setInnerContainerSize(cc.size(totalWidth, self._scrollSize.height))
        self:_findFocusedGuild()
    end
end

--设成脏数据
function GrainCarScroll:setDataDirty()
    self._isDirty = true
end

--攻击粮车后锁定所属军团
function GrainCarScroll:setAtkFocusedGuild(guildId)
    for iGuild, guild in pairs(self._guildData) do
        if guildId == guild.id then
            self._curAtkGuild = guild
            return
        end
    end
end

------------------------------------------------------------------
----------------------------UI------------------------------------
------------------------------------------------------------------
function GrainCarScroll:_initScrollView()
    self._scrollSize = self._scrollView:getContentSize()
    local totalWidth = 1000
    self._scrollView:setInnerContainerSize(cc.size(totalWidth, self._scrollSize.height))
    self._scrollView:setScrollBarEnabled(false)
    self._scrollView:addEventListener(handler(self, self._moveLayerTouch))
    self._scrollView:addTouchEventListener(handler(self, self._onTouchScroll))

    --scrollView里面3张背景图 根据滑动窗口位置（self._windowIndex）改变背景图坐标
    for i = 1, 3 do
        local grainCarBg = CSHelper.loadResourceNode(Path.getCSB("GrainCarBg", "grainCar"))
        self._bgList[i] = grainCarBg
        self._scrollView:addChild(grainCarBg)
        grainCarBg:setPosition(cc.p(self._scrollSize.width / 2 + GrainCarScroll.BG_WIDTH * (i - 1), self._scrollSize.height / 2))
    end

end

--初始化avatar放入复用池
function GrainCarScroll:_initAvatarPool()
    local PopupGrainCarRobber = require("app.scene.view.grainCar.PopupGrainCarRobber")
    local PopupGrainCarAvatar = require("app.scene.view.grainCar.PopupGrainCarAvatar")
    for i = 1, GrainCarScroll.MAX_AVATAR do
        local popupGrainCarRobber = PopupGrainCarRobber.new(self._mineData)
        self._scrollView:addChild(popupGrainCarRobber, 100)
        popupGrainCarRobber:setVisible(false)
        self:_addAvatarPool(popupGrainCarRobber)
    end
    for i = 1, GrainCarScroll.MAX_CAR_AVATAR do
        local popupGrainCarAvatar = PopupGrainCarAvatar.new(self._mineData)
        self._scrollView:addChild(popupGrainCarAvatar, 100)
        popupGrainCarAvatar:setVisible(false)
        self:_addCarAvatarPool(popupGrainCarAvatar)
    end
end

--重置复用池
function GrainCarScroll:_resetAvatarPool()
    for key, avatar in pairs(self._avatarUsedPool) do
        if avatar:isVisible() then
            self:_removeAvatarFromUsedPool(key)
        end
    end
    for key, avatar in pairs(self._carUsedPool) do
        if avatar:isVisible() then
            self:_removeCarAvatarFromUsedPool(key)
        end
    end
end

--初始化布局
function GrainCarScroll:_initAvatarLayout()
    local innerWidth = 0
    local startPos = GrainCarScroll.SCROLL_START_POS
    for i, guild in pairs(self._guildData) do
        local curIndex = 0
        if guild.isMine then
            startPos = self:_initMyLayout(guild)
        else
            startPos = self:_initEnemyLayout(guild, startPos)
        end
    end
end

--初始化我军布局
function GrainCarScroll:_initMyLayout(guild)
    local userCount = #guild.data
    local haveCar = guild.haveCar
    local columnUser = math.floor(userCount / GrainCarScroll.LINE_NUM)
    columnUser = math.max(columnUser, GrainCarScroll.DEFAULT_COLUMN)
    local modUser = userCount % GrainCarScroll.LINE_NUM
    local myStartPos = cc.p(GrainCarScroll.SCROLL_START_POS.x + columnUser * GrainCarScroll.ROBBER_WIDTH,
                            GrainCarScroll.SCROLL_START_POS.y)
    

    local nextStartPos = GrainCarScroll.SCROLL_START_POS
    if userCount == 0 then
        --没有成员
        nextStartPos = cc.p(myStartPos.x + GrainCarScroll.GUILD_PADDING, 400)
        guild.endOffset = nextStartPos.x - GrainCarScroll.GUILD_PADDING / 2
        guild.startOffset = GrainCarScroll.SCROLL_START_POS.x
    end
    if haveCar then
        local carOffsetX = GrainCarScroll.ROBBER_WIDTH * 1.5
        if userCount == 0 then
            carOffsetX = GrainCarScroll.GUILD_PADDING / 2
        end
        guild.pos = cc.p(myStartPos.x - carOffsetX, myStartPos.y - GrainCarScroll.ROBBER_HEIGHT)
    end
    local curIndex = 0
    for iUser, user in pairs(guild.data) do
        if iUser == 1 then
            guild.startOffset = GrainCarScroll.SCROLL_START_POS.x
        end
        if haveCar and iUser == 5 then
            curIndex = curIndex + 1
        elseif haveCar and iUser == 7 then
            curIndex = curIndex + 1
        end
        local columnUser = math.floor(curIndex / GrainCarScroll.LINE_NUM)
        local modUser = curIndex % GrainCarScroll.LINE_NUM
        user.pos = cc.p(myStartPos.x - columnUser * GrainCarScroll.ROBBER_WIDTH, 
                        myStartPos.y - modUser * GrainCarScroll.ROBBER_HEIGHT)
        self._userData["k"..user.id].pos = user.pos
        curIndex = curIndex + 1
        if iUser == #guild.data then
            nextStartPos = cc.p(myStartPos.x + GrainCarScroll.GUILD_PADDING, 400)
            guild.endOffset = nextStartPos.x - GrainCarScroll.GUILD_PADDING / 2
        end
    end
    return nextStartPos
end

--初始化敌军布局
function GrainCarScroll:_initEnemyLayout(guild, startPos)
    local userCount = #guild.data
    local nextStartPos = startPos
    local haveCar = guild.haveCar
    if userCount == 0 then
        --没有成员
        nextStartPos = cc.p(startPos.x + 1 * GrainCarScroll.ROBBER_WIDTH + GrainCarScroll.GUILD_PADDING, 400)
        guild.endOffset = nextStartPos.x - GrainCarScroll.GUILD_PADDING / 2
        guild.startOffset = startPos.x
    end
    local curIndex = 0
    if haveCar then
        local carOffsetX = GrainCarScroll.ROBBER_WIDTH * 1.5
        if userCount == 0 then
            carOffsetX = GrainCarScroll.GUILD_PADDING / 2
        end
        guild.pos = cc.p(startPos.x + carOffsetX, startPos.y - GrainCarScroll.ROBBER_HEIGHT)
    end
    for iUser, user in pairs(guild.data) do
        if iUser == 1 then
            guild.startOffset = startPos.x
        end
        if haveCar and iUser == 5 then
            curIndex = curIndex + 1
        elseif haveCar and iUser == 7 then
            curIndex = curIndex + 1
        end
        local columnUser = math.floor(curIndex / GrainCarScroll.LINE_NUM)
        local modUser = curIndex % GrainCarScroll.LINE_NUM
        user.pos = cc.p(startPos.x + columnUser * GrainCarScroll.ROBBER_WIDTH, 
                        startPos.y - modUser * GrainCarScroll.ROBBER_HEIGHT)
        self._userData["k"..user.id].pos = user.pos
        curIndex = curIndex + 1
        if iUser == #guild.data then
            if haveCar then
                --有车 按照车的宽度
                columnUser = math.max(columnUser, 2)
            end
            nextStartPos = cc.p(startPos.x + columnUser * GrainCarScroll.ROBBER_WIDTH + GrainCarScroll.GUILD_PADDING, 400)
            guild.endOffset = nextStartPos.x - GrainCarScroll.GUILD_PADDING / 2
        end
    end
    return nextStartPos
end

------------------------------------------------------------------
----------------------------方法----------------------------------
------------------------------------------------------------------
--计算总宽度
function GrainCarScroll:_getTotalWidth()
    local lastGuild = self._guildData[#self._guildData]
    if not lastGuild then
        return GrainCarScroll.GUILD_PADDING
    end
    local width = lastGuild.endOffset + GrainCarScroll.GUILD_PADDING
    return math.max(width, self._scrollSize.width)
end

--找到自己
function GrainCarScroll:_findMe()
    if #self._guildData == 0 then
        return
    end

    local firstGuildId = self._guildData[1].id
    if GrainCarDataHelper.isMyGuild(firstGuildId) then
        local windowWidth = self._scrollSize.width
        local pos = self._guildData[1].endOffset
        if self._scrollView:getInnerContainerSize().width == windowWidth then
            self._scrollView:scrollToPercentHorizontal(0, 0.5, true)
        else
            local percent = 100 * (pos - windowWidth / 2) / (self._scrollView:getInnerContainerSize().width - windowWidth)
            self._scrollView:scrollToPercentHorizontal(percent, 0.5, true)
        end
    end
end

--找到某军团
function GrainCarScroll:_findFocusedGuild()
    local windowWidth = self._scrollSize.width
    if self._scrollView:getInnerContainerSize().width <= windowWidth then
        self._scrollView:setInnerContainerPosition(cc.p(-1, 0))
    else
        local scrollX = self._userCenterX - windowWidth / 2
        if scrollX < 0 then
            scrollX = -1
        elseif scrollX > self._scrollView:getInnerContainerSize().width - windowWidth then
            scrollX = self._scrollView:getInnerContainerSize().width - windowWidth
        end
        self._scrollView:setInnerContainerPosition(cc.p(-scrollX, 0))
        -- local percent = 100 * scrollX / (self._scrollView:getInnerContainerSize().width - windowWidth)
        -- percent = math.min(percent, 100)
        -- percent = math.max(percent, 0.1)
        -- self._scrollView:scrollToPercentHorizontal(percent, 0.01, false)
    end
end

 --获取离最近的的avatar
 function GrainCarScroll:_getUserCenterX()
    if self._curAtkGuild then
        --攻击锁定优先
        for iGuild, guild in pairs(self._guildData) do
            if self._curAtkGuild.id == guild.id then
                return guild.pos.x
            end
        end
    end

    local guild = self._curGuild
    if #guild.data == 0 then
        --没有成员
        return guild.startOffset
    end

    local minDistance = self._scrollView:getInnerContainerSize().width
    local posX = 0
    for iUser, user in pairs(guild.data) do
         --guild开始坐标和结束坐标在视野内
        if self:_isInView(user.pos.x) then
            --找最小的距离
            local distance = self:_distance2Center(user.pos.x)
            if distance <  minDistance then
                minDistance = distance
                posX = user.pos.x
            end
        end
    end
    return posX
end

--重置攻击锁定军团
function GrainCarScroll:_resetAtkGuild()
    if self._curAtkGuild and self._curAtkGuild.haveCar and self:_isTouched() then
        if not self:_isInView(self._curAtkGuild.pos.x) or 
            self._curAtkGuild.car:getStamina() <= 0 then
            --车不在视野或者车死了
            self._curAtkGuild = nil
        end
    end
end

---------------------------可回收avatar----------------------------
--刷新avatar位置
function GrainCarScroll:_refreshAvatarPos()
    self:_refreshAvatarOutView()
    self:_refreshAvatarInView()
    self:_refreshCarAvatarOutView()
    self:_refreshCarAvatarInView()
end

--刷新视野外的Avatar（通过已用池Avatar坐标，确定是否需要回收）
function GrainCarScroll:_refreshAvatarOutView()
    for key, avatar in pairs(self._avatarUsedPool) do
        local user = self._userData[key]
        if self:_isInView(avatar:getPositionX()) then
            avatar:setPosition(user.pos)
        else
            --在视野外则回收
            self:_removeAvatarFromUsedPool(key)
            user.avatar = nil
        end
    end
end

--刷新视野外的Car Avatar（通过已用池Avatar坐标，确定是否需要回收）
function GrainCarScroll:_refreshCarAvatarOutView()
    for key, carAvatar in pairs(self._carUsedPool) do
        local guild = self._guildHashData[key]
        if self:_isInView(carAvatar:getPositionX()) then
            carAvatar:setPosition(guild.pos)
        else
            --在视野外则回收
            self:_removeCarAvatarFromUsedPool(key)
            guild.avatar = nil
        end
    end
end

--刷新视野内的Avatar
function GrainCarScroll:_refreshAvatarInView()
    local function refreshAvatarWithGuild(guild)
        for iUser, user in pairs(guild.data) do
            if self:_isInView(user.pos.x) and user.avatar == nil then
                --使用复用avatar
                local avatar = self:_getAvatarUnused()
                avatar:updateAvatar(user.mineUser)
                user.avatar = avatar
                avatar:setPosition(user.pos)
                if guild.isMine then
                    avatar:faceRight()
                else
                    avatar:faceLeft()
                end
                local key = "k" .. user.id
                self:_addAvatarUsedPool(key, avatar)
            elseif self:_isInView(user.pos.x) and user.isDirty then
                user.avatar:updateAvatar(user.mineUser)
                if guild.isMine then
                    user.avatar:faceRight()
                else
                    user.avatar:faceLeft()
                end
            end
        end
    end

    local minDistance = self._scrollView:getInnerContainerSize().width
    for iGuild, guild in pairs(self._guildData) do
        --guild开始坐标和结束坐标在视野内
        if self:_isInView(guild.startOffset) or self:_isInView(guild.endOffset) or self:_guildIsInView(guild) then
            refreshAvatarWithGuild(guild)
            
            --找最小的距离
            local distance = self:_guild2Center(guild)
            if distance <  minDistance and not self._bLockCurGuild then
                self._curGuild = guild
                minDistance = distance
            end
        end
    end
end

--刷新视野内的car Avatar
function GrainCarScroll:_refreshCarAvatarInView()
    local function refreshCarAvatarWithGuild(guild)
        if self:_isInView(guild.pos.x) and guild.avatar == nil then
            --使用复用avatar
            local avatar = self:_getCarAvatarUnused()
            avatar:updateUI(guild.car)
            guild.avatar = avatar
            avatar:setPosition(guild.pos)
            if guild.isMine then
                avatar:faceRight()
            else
                avatar:faceLeft()
            end
            local key = "k" .. guild.id
            self:_addCarAvatarUsedPool(key, avatar)
        elseif self:_isInView(guild.pos.x) and guild.isDirty then
            guild.isDirty = false
            guild.avatar:updateUI(guild.car)
            if guild.isMine then
                guild.avatar:faceRight()
            else
                guild.avatar:faceLeft()
            end
        end
    end
    for iGuild, guild in pairs(self._guildData) do
        --guild开始坐标和结束坐标在视野内
        if self:_isInView(guild.pos.x) and guild.haveCar then
            refreshCarAvatarWithGuild(guild)
        end
    end
end

--军团离中心最小距离
function GrainCarScroll:_guild2Center(guild)
    local start2Center = self:_distance2Center(guild.startOffset)
    local end2Center = self:_distance2Center(guild.endOffset - GrainCarScroll.GUILD_PADDING / 2)
    if guild.isMine then
        end2Center = self:_distance2Center(guild.endOffset)
    end
    return math.min(start2Center, end2Center)
end

--窗口中心在军团startOffset和endOffset中间
function GrainCarScroll:_guildIsInView(guild)
    local scorllPos = self._scrollView:getInnerContainerPosition()
    local windowX = math.abs(scorllPos.x)
    local centerX = windowX + self._scrollSize.width / 2
    return centerX > guild.startOffset and centerX < guild.endOffset
end

function GrainCarScroll:_isInView(offsetX)
    local scorllPos = self._scrollView:getInnerContainerPosition()
    local windowX = math.abs(scorllPos.x)
    return offsetX > (windowX - GrainCarScroll.SCROLL_INVIEW_PADDING) and offsetX < (windowX + self._scrollView:getContentSize().width + GrainCarScroll.SCROLL_INVIEW_PADDING)
end

-- 到当前窗口中心点的距离
function GrainCarScroll:_distance2Center(offsetX)
    local scorllPos = self._scrollView:getInnerContainerPosition()
    local windowX = math.abs(scorllPos.x)
    local centerX = windowX + self._scrollSize.width / 2
    return math.abs(offsetX - centerX)
end
-------------------------------------------

-------------------人物池-------------------
--加入复用池
function GrainCarScroll:_addAvatarPool(avatar)
    avatar:setVisible(false)
    table.insert(self._avatarUnusedPool, avatar)
end

--获取复用的avatar
function GrainCarScroll:_getAvatarUnused()
    local lastIndex = #self._avatarUnusedPool
    local avatar = self._avatarUnusedPool[lastIndex]
    self._avatarUnusedPool[lastIndex] = nil
    avatar:setVisible(true)
    return avatar
end

--加入已用池
function GrainCarScroll:_addAvatarUsedPool(key, avatar)
    self._avatarUsedPool[key] = avatar
end

--从已用池删除一个
function GrainCarScroll:_removeAvatarFromUsedPool(key)
    self:_addAvatarPool(self._avatarUsedPool[key]) --加入复用池
    self._avatarUsedPool[key] = nil
end

---------------------粮车池--------------------------- 
--加入粮车复用池
function GrainCarScroll:_addCarAvatarPool(carAvatar)
    carAvatar:setVisible(false)
    table.insert(self._carUnusedPool, carAvatar)
end

--获取复用的car avatar
function GrainCarScroll:_getCarAvatarUnused()
    local lastIndex = #self._carUnusedPool
    local avatar = self._carUnusedPool[lastIndex]
    self._carUnusedPool[lastIndex] = nil
    avatar:setVisible(true)
    return avatar
end

--加入已用池
function GrainCarScroll:_addCarAvatarUsedPool(key, avatar)
    self._carUsedPool[key] = avatar
end

--从已用池删除一个
function GrainCarScroll:_removeCarAvatarFromUsedPool(key)
    self:_addCarAvatarPool(self._carUsedPool[key]) --加入复用池
    self._carUsedPool[key] = nil
end
-----------------------------------------------------

--刷新滑动窗口背景
function GrainCarScroll:_refreshBg()
    local pos = self._scrollView:getInnerContainerPosition()
    local windowIndex = math.ceil(math.abs(pos.x) / GrainCarScroll.BG_WIDTH)
    if windowIndex ~= self._windowIndex then
        self._windowIndex = windowIndex
        self._bgList[1]:setPosition(cc.p(self._scrollSize.width / 2 + GrainCarScroll.BG_WIDTH * (windowIndex - 2), self._scrollSize.height / 2))
        self._bgList[2]:setPosition(cc.p(self._scrollSize.width / 2 + GrainCarScroll.BG_WIDTH * (windowIndex - 1), self._scrollSize.height / 2))
        self._bgList[3]:setPosition(cc.p(self._scrollSize.width / 2 + GrainCarScroll.BG_WIDTH * (windowIndex), self._scrollSize.height / 2))
    end
end

--添加手势
function GrainCarScroll:_addGesture(gesture)
    if gesture == GESTURE_TOUCH_BEGAN then
        if #self._gestureList == 0 then
            self._gestureList[1] = GESTURE_TOUCH_BEGAN
        end
    elseif gesture == GESTURE_TOUCH_MOVE then
        if self._gestureList[1] == GESTURE_TOUCH_BEGAN and 
            not self._gestureList[2] then
                self._gestureList[2] = GESTURE_TOUCH_MOVE
        end
    elseif gesture == GESTURE_TOUCH_END then
        if self._gestureList[1] == GESTURE_TOUCH_BEGAN and 
            self._gestureList[2] == GESTURE_TOUCH_MOVE then
                self._gestureList[3] = GESTURE_TOUCH_END
        end
    end
end

--是否用手移动过
function GrainCarScroll:_isTouched()
    return #self._gestureList > 0
end

--重置手势
function GrainCarScroll:_resetGesture()
    self._gestureList = {}
end

function GrainCarScroll:_stopGestureTimer()
    if self._scheduleGestureHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._scheduleGestureHandler)
		self._scheduleGestureHandler = nil
    end
end
------------------------------------------------------------------
----------------------------回调----------------------------------
------------------------------------------------------------------
function GrainCarScroll:_onButtonClose()
	self:close()
end

function GrainCarScroll:_moveLayerTouch(sender, event)
    if event == 9 then
        self:_refreshAvatarPos()
        self:_refreshBg()
        self._bLockCurGuild = false
    elseif event == 10 then
        if self:_isTouched() then
            self:_resetGesture()
            if self._isDirty then
                self._isDirty = false
                self:updateLayout()
            end
        end
    end
end

function GrainCarScroll:_onTouchScroll(sender, state)
    if state == ccui.TouchEventType.began then
        self:_addGesture(GESTURE_TOUCH_BEGAN)
        self:_stopGestureTimer()
    elseif state == ccui.TouchEventType.moved then
        self:_addGesture(GESTURE_TOUCH_MOVE)
        self:_resetAtkGuild()
    elseif state == ccui.TouchEventType.ended or state == ccui.TouchEventType.canceled then
        self:_addGesture(GESTURE_TOUCH_END)
        self._scheduleGestureHandler = SchedulerHelper.newScheduleOnce(handler(self, self._gestureTimer), 1)
    end
end

function GrainCarScroll:_gestureTimer()
    if self:_isTouched() then
        self:_resetGesture()
        if self._isDirty then
            self._isDirty = false
            self:updateLayout()
        end
    end
end

return GrainCarScroll