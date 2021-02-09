-- Description: 粮车
-- Company: yoka
-- Author: chenzhongjie
-- Date: 2019-09-09
local ViewBase = require("app.ui.ViewBase")
local PopupGrainCarAvatar = class("PopupGrainCarAvatar", ViewBase)
local GrainCarBar = require("app.scene.view.grainCar.GrainCarBar")
local CSHelper = require("yoka.utils.CSHelper")
local UTF8 = require("app.utils.UTF8")
local SchedulerHelper = require("app.utils.SchedulerHelper")
local GrainCarConfigHelper = require("app.scene.view.grainCar.GrainCarConfigHelper") 
local PopupGrainCarDetail = require("app.scene.view.grainCar.PopupGrainCarDetail")
local GrainCarConst  = require("app.const.GrainCarConst")
local GrainCarDataHelper = require("app.scene.view.grainCar.GrainCarDataHelper")

local NODE_FLAG_POSITIONX = -70
local NODE_TITLE_POSITIONX = 35

local CAR_LAYOUT = { 
                        [1] = {flag = cc.p(-70, 160), title = cc.p(0, 160)}, 
                        [2] = {flag = cc.p(-70, 160), title = cc.p(0, 160)}, 
                        [3] = {flag = cc.p(-70, 160), title = cc.p(0, 160)}, 
                        [4] = {flag = cc.p(-70, 160), title = cc.p(0, 160)}, 
                        [5] = {flag = cc.p(-70, 160), title = cc.p(0, 160)}, 
                    }

function PopupGrainCarAvatar:ctor(mineData)
    self._mineData = mineData
    self._carUnit = nil
    self._onClickAvatarCallback = nil -- 点击回调
    local resource = {
		file = Path.getCSB("PopupGrainCarAvatar", "grainCar"),
        binding = {
			_touchPanel = {
				events = {{event = "touch", method = "_onPanelClick"}}
			},
		}
	}
	PopupGrainCarAvatar.super.ctor(self, resource)
end

function PopupGrainCarAvatar:onCreate()
    self._barArmy = GrainCarBar.new(self._armyBar)
    self._touchPanel:setSwallowTouches(false)
    self:_createSwordEft()
end

function PopupGrainCarAvatar:onEnter()
    if self._carUnit then
        self:_startTimer()
    end
end

function PopupGrainCarAvatar:onExit()
    self:_stopTimer()
end

function PopupGrainCarAvatar:faceLeft()
    local level = self._carUnit:getLevel()
    self._grainCarAvatar:turnBack(true) 
    self._nodeFlag:setPositionX(-CAR_LAYOUT[level].flag.x)
    self._nodeTitle:setPositionX(-CAR_LAYOUT[level].title.x)
end

function PopupGrainCarAvatar:faceRight()
    local level = self._carUnit:getLevel()
    self._grainCarAvatar:turnBack(false) 
    self._nodeFlag:setPositionX(CAR_LAYOUT[level].flag.x)
    self._nodeTitle:setPositionX(CAR_LAYOUT[level].title.x)
end


------------------------------------------------------------------
----------------------------外部方法-------------------------------
------------------------------------------------------------------
function PopupGrainCarAvatar:updateUI(carUnit)
    self._carUnit = carUnit
    local level = carUnit:getLevel()
    self._grainCarAvatar:updateUI(level)
    self._nodeFlag:setPosition(CAR_LAYOUT[level].flag)
    self._nodeTitle:setPosition(CAR_LAYOUT[level].title)

    --军团名
    -- self._guildName:setString(UTF8.utf8sub(carUnit:getGuild_name(), 1, 2))
    self._guildName:setString(carUnit:getGuild_name()..Lang.get("grain_car_guild_de")..carUnit:getConfig().name)
    if GrainCarDataHelper.isMyGuild(carUnit:getGuild_id()) then
        self._guildName:setColor(Colors.BRIGHT_BG_GREEN)
        self._guildName:enableOutline(Colors.COLOR_QUALITY_OUTLINE[2], 1)
    else
        self._guildName:setColor(Colors.BRIGHT_BG_RED)
        self._guildName:enableOutline(Colors.COLOR_QUALITY_OUTLINE[6], 1)
    end

    --粮车血量
    self._barArmy:updateBarWithCarUnit(carUnit)

    --粮车损坏
    if carUnit:getStamina() <= 0 then
        self._leaveTime:setString(Lang.get("grain_car_has_broken"))
        self:_stopTimer()
        self._grainCarAvatar:playDead()
        self._nodeSword:setVisible(false)
        self._nodeAttackCD:setVisible(false)
        return
    end

    --攻击动画
    self._nodeSword:setVisible(not self._carUnit:isFriendCar())

    --车名
    -- self._title:loadTexture(Path.getGrainCarText(GrainCarConst.CAR_TITLE[level]))

    self._grainCarAvatar:playIdle()
    self._grainCarAvatar:turnBack(true)

    self:_stopTimer()
    self:_startTimer()
end

function PopupGrainCarAvatar:setClickCallback(cb)
    self._onClickAvatarCallback = cb
end

------------------------------------------------------------------
----------------------------方法----------------------------------
------------------------------------------------------------------
function PopupGrainCarAvatar:_createSwordEft()
	local EffectGfxNode = require("app.effect.EffectGfxNode")
	local function effectFunction(effect)
        if effect == "effect_shuangjian"then
            local subEffect = EffectGfxNode.new("effect_shuangjian")
            subEffect:play()
            return subEffect 
        end
    end
    self._swordEffect = G_EffectGfxMgr:createPlayMovingGfx( self._nodeSword, "moving_shuangjian", effectFunction, nil, false )
end

function PopupGrainCarAvatar:_startTimer()
    self._scheduleTimeHandler = SchedulerHelper.newSchedule(handler(self, self._updateTimer), 1)
    self:_updateTimer()
end

function PopupGrainCarAvatar:_stopTimer()
    if self._scheduleTimeHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._scheduleTimeHandler)
		self._scheduleTimeHandler = nil
    end
end

--刷新离开倒计时
function PopupGrainCarAvatar:_updateLeaveTime()
    local carUnit = self._carUnit
    local leaveTime = carUnit:getLeaveTime()
    self._leaveTime:setString(G_ServerTime:getLeftSecondsString(leaveTime))
    local curTime = G_ServerTime:getTime()
    if curTime > leaveTime then
        self._leaveTime:setString(Lang.get("grain_car_has_left"))
        self:_stopTimer()
    end
end

--刷新攻击cd
function PopupGrainCarAvatar:_updateAttackCD()
    if self._carUnit:isFriendCar() then
        self._nodeAttackCD:setVisible(false)
        self._nodeSword:setVisible(false)
        return
    end
    local canAttack, nextAtkTime = GrainCarDataHelper.canAttackGrainCar()
    if canAttack then
        self._nodeAttackCD:setVisible(false)
        self._nodeSword:setVisible(true)
    else
        self._nodeAttackCD:setVisible(true)
        self._nodeSword:setVisible(false)
        self._labelAtkCD:setString(G_ServerTime:getLeftSeconds(nextAtkTime))
    end
end

------------------------------------------------------------------
----------------------------回调----------------------------------
------------------------------------------------------------------
function PopupGrainCarAvatar:_updateTimer()
    self:_updateLeaveTime()
    self:_updateAttackCD()
end

function PopupGrainCarAvatar:_onPanelClick(sender)
    if not self._carUnit then 
        return
    end
    
    local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
    local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
    if moveOffsetX < 20 and moveOffsetY < 20 then
        if not self._carUnit:isFriendCar() then
            G_SignalManager:dispatch(SignalConst.EVENT_GRAIN_CAR_AVATAR_CLICK_IN_MINE, self._carUnit)
            -- local popupGrainCarDetail = PopupGrainCarDetail.new( self._carUnit, self._mineData)
            -- popupGrainCarDetail:openWithAction()
        end
    end
end


return PopupGrainCarAvatar