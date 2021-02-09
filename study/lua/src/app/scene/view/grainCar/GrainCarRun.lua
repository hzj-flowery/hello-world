-- Description: 粮车跑动层
-- Company: yoka
-- Author: chenzhongjie
-- Date: 2019-10-11
local ViewBase = require("app.ui.ViewBase")
local GrainCarRun = class("GrainCarRun", ViewBase)
local GrainCarRunHero = require("app.scene.view.grainCar.GrainCarRunHero")
local GrainCarRouteProgress = require("app.scene.view.grainCar.GrainCarRouteProgress")
local GrainCarConfigHelper = require("app.scene.view.grainCar.GrainCarConfigHelper") 
local GrainCarDataHelper = require("app.scene.view.grainCar.GrainCarDataHelper") 
local SchedulerHelper = require ("app.utils.SchedulerHelper")


local BG_MOVE_SPEED = 50 --背景移动速度
local BG_WIDTH = 1400 --背景图宽度
local STATUS_IDLE = 1
local STATUS_RUN = 2
local STATUS_WIN = 3

function GrainCarRun:ctor()
    self:_initMember()

	local resource = {
		file = Path.getCSB("GrainCarRun", "grainCar"),
		binding = {
            
		}
	}
	self:setName("GrainCarRun")
	GrainCarRun.super.ctor(self, resource)
end

function GrainCarRun:_initMember()
    self._routeProgress = nil       --路径进度条
    self._grainCarRunAvatar = nil   --粮车avatar
    self._carSpeed = BG_MOVE_SPEED  --粮车速度
    self._curStatus = 0
end

function GrainCarRun:onCreate()
end

function GrainCarRun:onEnter()
    self:_initData()
    self:_resetBg()

    self:_initUI()
    
    self:scheduleUpdateWithPriorityLua(handler(self, self._onUpdateMoveBg), 0)
    self:_startTimer()
end

function GrainCarRun:onExit()
    self:_stopTimer()
end

function GrainCarRun:onShowFinish()
end

function GrainCarRun:_updateData()
end

--------------------------------------------------------------------------
-------------------------------外部方法------------------------------------
--------------------------------------------------------------------------
function GrainCarRun:updateUI(carUnit)
    --粮车血量
    self._grainCarRunAvatar:updateUI(carUnit)

    if carUnit:getStamina() <= 0 then
        self._grainCarRunAvatar:playDead()
        self:_showUsers(false)
    end
end

--粮车死亡
function GrainCarRun:carDead()
    self._grainCarRunAvatar:playDead()
    self._routeProgress:carDead()
    self:_stopTimer()
    self._carSpeed = 0

    self:_showUsers(false)
end

--粮车跑完全程
function GrainCarRun:carReachTerminal()
    self._grainCarRunAvatar:playIdle()
    self._routeProgress:carReachTerminal()
    self:_stopTimer()
    self._carSpeed = 0

    self:_userPlayWin()
end

--------------------------------------------------------------------------
-------------------------------UI-----------------------------------------
--------------------------------------------------------------------------
function GrainCarRun:_initUI()
    self:_initAvatar()
    self:_initProgress()
    self:_initRandAvatar()
end

--更新粮车
function GrainCarRun:_initAvatar()
    self._nodeAvatar:removeAllChildren()
    local GrainCarRunAvatar = require("app.scene.view.grainCar.GrainCarRunAvatar")
    local grainCarRunAvatar = GrainCarRunAvatar.new()
    self._nodeAvatar:addChild(grainCarRunAvatar)
    grainCarRunAvatar:updateUI()
    grainCarRunAvatar:faceRight()
    grainCarRunAvatar:setScale(2.0)
    grainCarRunAvatar:setTouchEnable(false)
    self._grainCarRunAvatar = grainCarRunAvatar
end

function GrainCarRun:_resetBg()
	self._nodeBg1:setPositionX(self._bgInitPosx1)
	self._nodeBg2:setPositionX(self._bgInitPosx2)
end

--创建路径进度
function GrainCarRun:_initProgress()
    local carUnit = G_UserData:getGrainCar():getGrainCar()
    self._routeProgress = GrainCarRouteProgress.new(carUnit)
    self._nodeProgress:removeAllChildren()
    self._nodeProgress:addChild(self._routeProgress)
end

--从5个位置随机出n个位置 放avatar
function GrainCarRun:_initRandAvatar()
    local users = G_UserData:getGrainCar():getUsers()
    local randList = GrainCarConfigHelper.randDiff(1, 5, #users)
    for i = 1, #users do
        local index = randList[i]
        local simpleUserData = users[i]
        local avatar =  GrainCarRunHero.new()
        self["_nodeRandAvatar" .. index]:addChild(avatar)
        avatar:updateAvatar(simpleUserData)
        self["_userAvatar_" .. i] = avatar
    end
end

--------------------------------------------------------------------------
-------------------------------方法---------------------------------------
--------------------------------------------------------------------------
function GrainCarRun:_initData()
    self._bgInitPosx1 = self._nodeBg1:getPositionX() --背景图1初始x坐标
	self._bgInitPosx2 = self._nodeBg2:getPositionX() --背景图2初始x坐标
    self._targetPosX = self._bgInitPosx1 - BG_WIDTH
end

function GrainCarRun:_startTimer()
    self._scheduleTimeHandler = SchedulerHelper.newSchedule(handler(self, self._updateTimer), 1)
    self:_updateTimer()
end

function GrainCarRun:_stopTimer()
    if self._scheduleTimeHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._scheduleTimeHandler)
		self._scheduleTimeHandler = nil
    end
end

function GrainCarRun:_updateTimer()
    local carUnit = G_UserData:getGrainCar():getGrainCar()
    self._routeProgress:updateUI(carUnit)
    if carUnit:isStop() then
        self._grainCarRunAvatar:playIdle()
        self._carSpeed = 0
        self:_userPlayIdle()
    else
        self._grainCarRunAvatar:playRun()
        self._carSpeed = BG_MOVE_SPEED
        self:_userPlayRun()
    end

    if carUnit:isReachTerminal() then
        self:_stopTimer()
    end
end

function GrainCarRun:_userPlayIdle()
    if self._curStatus == STATUS_IDLE then
        return
    end
    self._curStatus = STATUS_IDLE
    local users = G_UserData:getGrainCar():getUsers()
    for i = 1, #users do
        self["_userAvatar_" .. i]:playIdle()
    end
end

function GrainCarRun:_userPlayWin()
    if self._curStatus == STATUS_WIN then
        return
    end
    self._curStatus = STATUS_WIN
    local users = G_UserData:getGrainCar():getUsers()
    for i = 1, #users do
        self["_userAvatar_" .. i]:playWin()
    end
end

function GrainCarRun:_userPlayRun()
    if self._curStatus == STATUS_RUN then
        return
    end
    self._curStatus = STATUS_RUN
    local users = G_UserData:getGrainCar():getUsers()
    for i = 1, #users do
        self["_userAvatar_" .. i]:playRun()
    end
end

--显示隐藏人物
function GrainCarRun:_showUsers(bShow)
    for i = 1, 5 do
        self["_nodeRandAvatar" .. i]:setVisible(bShow)
    end
end




--------------------------------------------------------------------------
-------------------------------回调---------------------------------------
--------------------------------------------------------------------------
function GrainCarRun:_onUpdateMoveBg(dt)
	local function moveNode(node)
		local posx = node:getPositionX() - self._carSpeed * dt
		node:setPositionX(posx)
	end
	local function checkNode(node)
		local posx = node:getPositionX()
		if posx < self._targetPosX then
			return false
		else
			return true
		end
	end

	moveNode(self._nodeBg1)
	moveNode(self._nodeBg2)
	if checkNode(self._nodeBg1) == false then
		local posx = self._nodeBg2:getPositionX() + BG_WIDTH
		self._nodeBg1:setPositionX(posx)
	end
	if checkNode(self._nodeBg2) == false then
		local posx = self._nodeBg1:getPositionX() + BG_WIDTH
		self._nodeBg2:setPositionX(posx)
	end
end

return GrainCarRun