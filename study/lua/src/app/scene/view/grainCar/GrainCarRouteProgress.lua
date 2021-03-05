-- Description: 粮车路线进度
-- Company: yoka
-- Author: chenzhongjie
-- Date: 2019-10-11
local ViewBase = require("app.ui.ViewBase")
local GrainCarRouteProgress = class("GrainCarRouteProgress", ViewBase)
local MineCraftHelper = require("app.scene.view.mineCraft.MineCraftHelper")
local GrainCarRoutePoint = require("app.scene.view.grainCar.GrainCarRoutePoint")
local GrainCarConfigHelper = require("app.scene.view.grainCar.GrainCarConfigHelper") 
local GrainCarDataHelper = require("app.scene.view.grainCar.GrainCarDataHelper") 

local WIDTH_PIT = 56    --两个站点之间的宽度
local WIDTH_LABEL = 35  --文字和进度条间距

function GrainCarRouteProgress:ctor(carUnit)
    self:_initMember(carUnit)

	local resource = {
		file = Path.getCSB("GrainCarRouteProgress", "grainCar"),
		binding = {
            
		}
	}
	self:setName("GrainCarRouteProgress")
	GrainCarRouteProgress.super.ctor(self, resource)
end

function GrainCarRouteProgress:_initMember(carUnit)
    self._routeList = {}                --全程路线
    self._mineIdPointHashTable = {}     --mineId, routePoint
    self._progressBgWidth = 0           --进度条宽度
    self._carUnit = carUnit
end

function GrainCarRouteProgress:onCreate()
end

function GrainCarRouteProgress:onEnter()
    self:_initData()
    self:_initUI()
end

function GrainCarRouteProgress:onExit()
end

function GrainCarRouteProgress:onShowFinish()
end

function GrainCarRouteProgress:_initData()
    self._routeList = self._carUnit:getWholeRoute()
end

--------------------------------------------------------------------------
-------------------------------外部方法------------------------------------
--------------------------------------------------------------------------
function GrainCarRouteProgress:updateUIStatic()
    self._pointer:setVisible(false)
    self._progress:setPercent(0)
end

--设置百分比
function GrainCarRouteProgress:updateUI(carUnit)
    if carUnit:isReachTerminal() then
        self:carReachTerminal()
        return
    end
    self:_updatePercent(carUnit)
    self:_updatePoints(carUnit)
end

--粮车死亡
function GrainCarRouteProgress:carDead()
    self._iconDead:setVisible(true)
    self._iconNormal:setVisible(false)
    self._labelPercent:setString(Lang.get("grain_car_progress_has_broken"))
    self._labelPercent:setColor(Colors.BRIGHT_BG_RED)
end

--粮车死亡
function GrainCarRouteProgress:carReachTerminal()
    self._labelPercent:setString("100%")
    self._pointer:setPositionX(self._progressBgWidth / 2)
    self._progress:setPercent(100)
    for _, routePoint in pairs(self._mineIdPointHashTable) do
        routePoint:setReach(true)
    end
end

--显示隐藏起点终点
function GrainCarRouteProgress:showTerminal(bShow)
    self._labelStart:setVisible(bShow)
    self._labelEnd:setVisible(bShow)
    local bgHeight = self._bg:getContentSize().height
    if bShow then
        self._bg:setContentSize(cc.size(self._progressBgWidth + WIDTH_LABEL * 4, bgHeight))
    else
        self._bg:setContentSize(cc.size(self._progressBgWidth + WIDTH_LABEL, bgHeight))
    end
end

--设置成未知
function GrainCarRouteProgress:showRouteName(bShow)
    for _, routePoint in pairs(self._mineIdPointHashTable) do
        routePoint:showRouteName(bShow)
    end
end

--------------------------------------------------------------------------
-------------------------------UI-----------------------------------------
--------------------------------------------------------------------------
function GrainCarRouteProgress:_initUI()
    local pitCount = #self._routeList - 1
    local progressBgWidth = pitCount * WIDTH_PIT
    local progressBgHeight = self._progressBg:getContentSize().height
    local progressHeight = self._progress:getContentSize().height
    local bgHeight = self._bg:getContentSize().height
    self._progressBg:setContentSize(cc.size(progressBgWidth + 12, progressBgHeight))
    self._progress:setContentSize(cc.size(progressBgWidth, progressHeight))
    self._labelStart:setPositionX(-progressBgWidth  / 2 - WIDTH_LABEL)
    self._labelEnd:setPositionX(progressBgWidth  / 2 + WIDTH_LABEL)
    self._bg:setContentSize(cc.size(progressBgWidth + WIDTH_LABEL * 4, bgHeight))

    self._progressBgWidth = progressBgWidth
    self:_createPits()
end

--创建中间点
function GrainCarRouteProgress:_createPits()
    local startX = -self._progressBgWidth / 2
    for i = 1, #self._routeList do
        local mineId = self._routeList[i]
        local routePoint = GrainCarRoutePoint.new(mineId)
        routePoint:setReach(false)
        self._nodePoint:addChild(routePoint)
        routePoint:setPositionX(startX + (i - 1) * WIDTH_PIT)
        if i == 1 then
            routePoint:setPointType(GrainCarRoutePoint.POINT_TYPE_START)
        elseif i == #self._routeList then
            routePoint:setPointType(GrainCarRoutePoint.POINT_TYPE_END)
        end
        
        self._mineIdPointHashTable[mineId] = routePoint
    end
end

--------------------------------------------------------------------------
-------------------------------方法---------------------------------------
--------------------------------------------------------------------------
function GrainCarRouteProgress:_updatePercent(carUnit)
    if carUnit:getStamina() > 0 then
        local percent = carUnit:getRoutePercent()
        percent = string.format("%.2f", percent) -- 2位有效数字
        self._labelPercent:setString(percent * 100 .. "%")
        
        --指针
        local minePit1, minePit2, percent = carUnit:getCurCarPos()
        local routePoint = self._mineIdPointHashTable[minePit1]
        local pointerX = routePoint:getPositionX() + percent * WIDTH_PIT
        self._pointer:setPositionX(pointerX)

        --进度条
        local startX = -self._progressBgWidth / 2
        local progressPercent = (pointerX - startX) / self._progressBgWidth
        self._progress:setPercent(progressPercent * 100)
    else
        --指针
        local deadMineId = carUnit:getMine_id()
        local routePoint = self._mineIdPointHashTable[deadMineId]
        local pointerX = routePoint:getPositionX()
        self._pointer:setPositionX(pointerX)

        --进度条
        local startX = -self._progressBgWidth / 2
        local progressPercent = (pointerX - startX) / self._progressBgWidth
        self._progress:setPercent(progressPercent * 100)
    end
end

--更新路径点
function GrainCarRouteProgress:_updatePoints(carUnit)
    if carUnit:getStamina() > 0 then
        local routePassed = carUnit:getRoute_passed()
        for i, mineId in pairs(routePassed) do
            self._mineIdPointHashTable[mineId]:setReach(true)
        end
    else
        local deadMineId = carUnit:getMine_id()
        local reachDead = false
        for i = 1, #self._routeList do
            local mineId = self._routeList[i]
            self._mineIdPointHashTable[mineId]:setReach(not reachDead)
            if mineId == deadMineId then
                reachDead = true
            end
        end
    end
end


--------------------------------------------------------------------------
-------------------------------回调---------------------------------------
--------------------------------------------------------------------------


return GrainCarRouteProgress