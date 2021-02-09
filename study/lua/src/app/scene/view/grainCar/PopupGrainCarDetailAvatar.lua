-- Description: 粮车
-- Company: yoka
-- Author: chenzhongjie
-- Date: 2019-09-09
local ViewBase = require("app.ui.ViewBase")
local PopupGrainCarDetailAvatar = class("PopupGrainCarDetailAvatar", ViewBase)
local GrainCarBar = require("app.scene.view.grainCar.GrainCarBar")
local CSHelper = require("yoka.utils.CSHelper")
local UTF8 = require("app.utils.UTF8")
local SchedulerHelper = require("app.utils.SchedulerHelper")
local GrainCarConfigHelper = require("app.scene.view.grainCar.GrainCarConfigHelper") 
local PopupGrainCarDetail = require("app.scene.view.grainCar.PopupGrainCarDetail")
local GrainCarConst  = require("app.const.GrainCarConst")

local NODE_FLAG_POSITIONX = -82
local NODE_TITLE_POSITIONX = 35

local CAR_LAYOUT = { 
                        {flag = cc.p(-82, 150), title = cc.p(0, 190)}, 
                        {flag = cc.p(-82, 150), title = cc.p(0, 190)}, 
                        {flag = cc.p(-82, 150), title = cc.p(0, 190)}, 
                    }

function PopupGrainCarDetailAvatar:ctor(mineData)
    self._mineData = mineData
    self._carUnit = nil
    self._bTouchEnable = true
    local resource = {
		file = Path.getCSB("PopupGrainCarDetailAvatar", "grainCar"),
        binding = {
			_touchPanel = {
				events = {{event = "touch", method = "_onPanelClick"}}
			},
		}
	}
	PopupGrainCarDetailAvatar.super.ctor(self, resource)
end

function PopupGrainCarDetailAvatar:onCreate()
    self._barArmy = GrainCarBar.new(self._armyBar)
    self._touchPanel:setSwallowTouches(false)
end

function PopupGrainCarDetailAvatar:onEnter()
end

function PopupGrainCarDetailAvatar:onExit()
    self:_stopTimer()
end

function PopupGrainCarDetailAvatar:faceLeft()
    local level = self._carUnit:getLevel()
    self._grainCarAvatar:turnBack(true) 
    self._nodeFlag:setPositionX(-NODE_FLAG_POSITIONX)
    self._nodeTitle:setPositionX(CAR_LAYOUT[level].title.x)
end

function PopupGrainCarDetailAvatar:faceRight()
    local level = self._carUnit:getLevel()
    self._grainCarAvatar:turnBack(false) 
    self._nodeFlag:setPositionX(NODE_FLAG_POSITIONX)
    self._nodeTitle:setPositionX(CAR_LAYOUT[level].title.x)
end


------------------------------------------------------------------
----------------------------外部方法-------------------------------
------------------------------------------------------------------
function PopupGrainCarDetailAvatar:updateUI(carUnit)
    self._carUnit = carUnit
    local level = carUnit:getLevel()
    self._grainCarAvatar:updateUI(level)
    self._nodeFlag:setPosition(CAR_LAYOUT[level].flag)
    self._nodeTitle:setPosition(CAR_LAYOUT[level].title)

    --军团名
    -- self._guildName:setString(UTF8.utf8sub(carUnit:getGuild_name(), 1, 2))
    -- self._guildName:setColor(Colors.getGuildFlagColor(index))
    -- self._guildName:enableOutline(Colors.getGuildFlagColorOutline(index))

    --粮车血量
    self._barArmy:updateBarWithCarUnit(carUnit)

    --粮车损坏
    if carUnit:getStamina() <= 0 then
        self._leaveTime:setString(Lang.get("grain_car_has_broken"))
        self:_stopTimer()
        return
    end

    --车名
    -- self._title:loadTexture(Path.getGrainCarText(GrainCarConst.CAR_TITLE[level]))

    self._grainCarAvatar:playIdle()
    self._grainCarAvatar:turnBack(true)

    -- 这里不做了
    -- self:_stopTimer()
    -- self:_startTimer()
end

function PopupGrainCarDetailAvatar:setScale(scale)
    self._grainCarAvatar:setScale(scale)
end

function PopupGrainCarDetailAvatar:setTouchEnable(bEnable)
    self._bTouchEnable = bEnable
end

------------------------------------------------------------------
----------------------------方法----------------------------------
------------------------------------------------------------------
function PopupGrainCarDetailAvatar:_startTimer()
    self._scheduleTimeHandler = SchedulerHelper.newSchedule(handler(self, self._updateTimer), 1)
    self:_updateLeaveTime()
end

function PopupGrainCarDetailAvatar:_stopTimer()
    if self._scheduleTimeHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._scheduleTimeHandler)
		self._scheduleTimeHandler = nil
    end
end

--刷新离开倒计时
function PopupGrainCarDetailAvatar:_updateLeaveTime()
    local carUnit = self._carUnit
    local leaveTime = carUnit:getLeaveTime()
    self._leaveTime:setString(G_ServerTime:getLeftSecondsString(leaveTime))
    local curTime = G_ServerTime:getTime()
    if curTime > leaveTime then
        self._leaveTime:setString(Lang.get("grain_car_has_left"))
    end
end

------------------------------------------------------------------
----------------------------回调----------------------------------
------------------------------------------------------------------
function PopupGrainCarDetailAvatar:_updateTimer()
    local startTime = GrainCarConfigHelper.getNextGrainCarStartTime()
    self._leaveTime:setString(G_ServerTime:getLeftSecondsString(startTime))
    self:_updateLeaveTime()
end

function PopupGrainCarDetailAvatar:_onPanelClick(sender)
    if not self._carUnit then 
        return
    end
    if not self._bTouchEnable then
        return
    end
    local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
    local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
    if moveOffsetX < 20 and moveOffsetY < 20 then
        if not self._carUnit:isFriendCar() then
            local popupGrainCarDetail = PopupGrainCarDetail.new( self._carUnit, self._mineData)
            popupGrainCarDetail:openWithAction()
        end
    end
end


return PopupGrainCarDetailAvatar