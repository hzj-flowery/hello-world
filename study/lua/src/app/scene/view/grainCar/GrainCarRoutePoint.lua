-- Description: 粮车路线点
-- Company: yoka
-- Author: chenzhongjie
-- Date: 2019-10-13
local ViewBase = require("app.ui.ViewBase")
local GrainCarRoutePoint = class("GrainCarRoutePoint", ViewBase)

GrainCarRoutePoint.POINT_TYPE_START     = 1
GrainCarRoutePoint.POINT_TYPE_MID       = 2
GrainCarRoutePoint.POINT_TYPE_END       = 3

function GrainCarRoutePoint:ctor(mineId)
    self._mineId = mineId
    self._pointType = GrainCarRoutePoint.POINT_TYPE_MID
    self._posX = 0

	local resource = {
		file = Path.getCSB("GrainCarRoutePoint", "grainCar"),
		binding = {
            
		}
	}
	self:setName("GrainCarRoutePoint")
	GrainCarRoutePoint.super.ctor(self, resource)
end

function GrainCarRoutePoint:onCreate()
end

function GrainCarRoutePoint:onEnter()
    self:_initUI()
end

function GrainCarRoutePoint:onExit()
end

function GrainCarRoutePoint:onShowFinish()
end

--------------------------------------------------------------------------
-------------------------------外部方法------------------------------------
--------------------------------------------------------------------------
--设置是否达到该点
function GrainCarRoutePoint:setReach(bIsReach)
    self._startPoint:setVisible(false)
    self._endPoint:setVisible(false)
    self._curPoint:setVisible(false)
    if self._pointType == GrainCarRoutePoint.POINT_TYPE_MID then
        self._curPoint:setVisible(bIsReach)
    elseif self._pointType == GrainCarRoutePoint.POINT_TYPE_START then
        self._startPoint:setVisible(bIsReach)
    elseif self._pointType == GrainCarRoutePoint.POINT_TYPE_END then
        self._endPoint:setVisible(bIsReach)
    end
end

--设置类型
function GrainCarRoutePoint:setPointType(pointType)
    self._pointType = pointType
end

--记录坐标
function GrainCarRoutePoint:recordPosX(posX)
    self._posX = posX
end

--获取坐标
function GrainCarRoutePoint:getPosX()
    return self._posX
end

--设置成未知
function GrainCarRoutePoint:showRouteName(bShow)
    if bShow then
        local mineConfig = G_UserData:getMineCraftData():getMineConfigById(self._mineId)
        local quality = mineConfig.pit_color
        self._routeName:setString(mineConfig.pit_name)
        self._routeName:setColor(Colors.COLOR_PIT_NAME[quality].color)
        self._routeName:enableOutline(Colors.COLOR_PIT_NAME[quality].outlineColor, 1)
    else 
        local quality = 5
        self._routeName:setString(Lang.get("grain_car_pit_unknow"))
        self._routeName:setColor(Colors.COLOR_PIT_NAME[quality].color)
        self._routeName:enableOutline(Colors.COLOR_PIT_NAME[quality].outlineColor, 1)
    end
end

--------------------------------------------------------------------------
-------------------------------UI-----------------------------------------
--------------------------------------------------------------------------
function GrainCarRoutePoint:_initUI()
    local mineConfig = G_UserData:getMineCraftData():getMineConfigById(self._mineId)
    local quality = mineConfig.pit_color
    self._routeName:setString(mineConfig.pit_name)
    self._routeName:setColor(Colors.COLOR_PIT_NAME[quality].color)
    self._routeName:enableOutline(Colors.COLOR_PIT_NAME[quality].outlineColor, 1)
end

--------------------------------------------------------------------------
-------------------------------方法---------------------------------------
--------------------------------------------------------------------------



--------------------------------------------------------------------------
-------------------------------回调---------------------------------------
--------------------------------------------------------------------------


return GrainCarRoutePoint