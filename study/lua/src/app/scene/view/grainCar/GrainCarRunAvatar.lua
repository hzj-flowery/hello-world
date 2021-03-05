-- Description: 粮车
-- Company: yoka
-- Author: chenzhongjie
-- Date: 2019-09-09
local ViewBase = require("app.ui.ViewBase")
local GrainCarRunAvatar = class("GrainCarRunAvatar", ViewBase)
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
                        {flag = cc.p(-82, 150), title = cc.p(0, 230)}, 
                        {flag = cc.p(-82, 150), title = cc.p(0, 230)}, 
                        {flag = cc.p(-82, 150), title = cc.p(0, 230)}, 
                        {flag = cc.p(-82, 150), title = cc.p(0, 230)}, 
                        {flag = cc.p(-82, 150), title = cc.p(0, 230)}, 
                    }

function GrainCarRunAvatar:ctor()
    self._carUnit = nil
    self._bTouchEnable = true
    local resource = {
		file = Path.getCSB("GrainCarRunAvatar", "grainCar"),
        binding = {
			_touchPanel = {
				events = {{event = "touch", method = "_onPanelClick"}}
			},
		}
	}
	GrainCarRunAvatar.super.ctor(self, resource)
end

function GrainCarRunAvatar:onCreate()
    self._barArmy = GrainCarBar.new(self._armyBar)
    self._touchPanel:setSwallowTouches(false)
end

function GrainCarRunAvatar:onEnter()
end

function GrainCarRunAvatar:onExit()
end

function GrainCarRunAvatar:faceLeft()
    local level = self._carUnit:getLevel()
    self._grainCarAvatar:turnBack(true) 
    self._nodeFlag:setPositionX(-NODE_FLAG_POSITIONX)
    self._nodeTitle:setPositionX(CAR_LAYOUT[level].title.x)
end

function GrainCarRunAvatar:faceRight()
    local level = self._carUnit:getLevel()
    self._grainCarAvatar:turnBack(false) 
    self._nodeFlag:setPositionX(NODE_FLAG_POSITIONX)
    self._nodeTitle:setPositionX(CAR_LAYOUT[level].title.x)
end


------------------------------------------------------------------
----------------------------外部方法-------------------------------
------------------------------------------------------------------
function GrainCarRunAvatar:updateUI()
    local carUnit = G_UserData:getGrainCar():getGrainCar()
    self._carUnit = carUnit
    local level = carUnit:getLevel()
    self._grainCarAvatar:updateUI(level)
    self._nodeFlag:setPosition(CAR_LAYOUT[level].flag)
    self._nodeTitle:setPosition(CAR_LAYOUT[level].title)

    --军团名
    self._guildName:setString(carUnit:getGuild_name()..Lang.get("grain_car_guild_de")..carUnit:getConfig().name)
    self._guildName:setColor(Colors.BRIGHT_BG_GREEN)
    self._guildName:enableOutline(Colors.COLOR_QUALITY_OUTLINE[2], 2)
    -- local nameWidth = self._guildName:getContentSize().width
    -- local offset = (nameWidth - 36) / 2
    -- self._guildName:setPositionX(offset)
    -- self._title:setPositionX(offset)

    --粮车血量
    self._barArmy:updateBarWithCarUnit(carUnit)

    --车名
    -- self._title:loadTexture(Path.getGrainCarText(GrainCarConst.CAR_TITLE[level]))

    self._grainCarAvatar:playRun()

    --粮车损坏
    if carUnit:getStamina() <= 0 then
        --TODO
    end
end

function GrainCarRunAvatar:playRun()
    self._grainCarAvatar:playRun()
end

function GrainCarRunAvatar:playIdle()
    self._grainCarAvatar:playIdle()
end

function GrainCarRunAvatar:playDead()
    self._grainCarAvatar:playDead()
end

function GrainCarRunAvatar:setScale(scale)
    self._grainCarAvatar:setScale(scale)
end

function GrainCarRunAvatar:setTouchEnable(bEnable)
    self._bTouchEnable = bEnable
end

------------------------------------------------------------------
----------------------------方法----------------------------------
------------------------------------------------------------------


------------------------------------------------------------------
----------------------------回调----------------------------------
------------------------------------------------------------------
function GrainCarRunAvatar:_updateTimer()
    local startTime = GrainCarConfigHelper.getNextGrainCarStartTime()
    self._leaveTime:setString(G_ServerTime:getLeftSecondsString(startTime))
    self:_updateLeaveTime()
end

function GrainCarRunAvatar:_onPanelClick(sender)
    if not self._carUnit then 
        return
    end
    if not self._bTouchEnable then
        return
    end
    local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
    local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
    if moveOffsetX < 20 and moveOffsetY < 20 then
       
    end
end


return GrainCarRunAvatar