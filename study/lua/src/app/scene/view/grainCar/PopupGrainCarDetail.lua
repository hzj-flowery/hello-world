local PopupBase = require("app.ui.PopupBase")
local PopupGrainCarDetail = class("PopupGrainCarDetail", PopupBase)
local GrainCarBar = require("app.scene.view.grainCar.GrainCarBar")
local GrainCarDataHelper = require("app.scene.view.grainCar.GrainCarDataHelper")
local SchedulerHelper = require("app.utils.SchedulerHelper")
local GrainCarConst  = require("app.const.GrainCarConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local GrainCarConfigHelper = require("app.scene.view.grainCar.GrainCarConfigHelper") 

PopupGrainCarDetail.SCALE_AVATAR = 0.8

function PopupGrainCarDetail:ctor(carUnit, mineData)
    self._mineData = mineData
    self._carUnit = carUnit

	local resource = {
		file = Path.getCSB("PopupGrainCarDetail", "grainCar"),
		binding = {
            _btnFight = {
                events = {{event = "touch", method = "_onFightClick"}}
            },
		}
    }
    self:setName("PopupGrainCarDetail")
    PopupGrainCarDetail.super.ctor(self, resource)
end

function PopupGrainCarDetail:onCreate()
    self:_initUI()
end

function PopupGrainCarDetail:onEnter()
    self:_updateUI()
    self:_startTimer()
    self._signalGrainCarAttack = G_SignalManager:add(SignalConst.EVENT_GRAIN_CAR_ATTACK, handler(self, self._onEventGrainCarAttack))
    self._signalGrainCarNotify = G_SignalManager:add(SignalConst.EVENT_GRAIN_CAR_NOTIFY, handler(self, self._onEventGrainCarNotify))
end

function PopupGrainCarDetail:onExit()
    self:_stopTimer()

    if self._signalGrainCarAttack then 
        self._signalGrainCarAttack:remove()
        self._signalGrainCarAttack = nil
    end
    if self._signalGrainCarNotify then 
        self._signalGrainCarNotify:remove()
        self._signalGrainCarNotify = nil
    end
end

function PopupGrainCarDetail:_initUI()
    self._barArmy = GrainCarBar.new(self._armyBar)
    if not self._carUnit:isInMine(self._mineData:getId()) then
        self:closeWithAction()
        G_Prompt:showTip(Lang.get("grain_car_has_left"))
        return
    end
    self._popBG:addCloseEventListener(handler(self, self.closeWithAction))
    self._popBG:setTitle(Lang.get("grain_car_attack"))

    
    local sameGuild = false
    local myGuildId = G_UserData:getGuild():getMyGuildId()
    if self._carUnit:getGuild_id() ~= 0 and myGuildId == self._carUnit:getGuild_id() then
        sameGuild = true
    end
    self._btnFight:setVisible(not sameGuild)
    self._btnFight:setString(Lang.get("mine_fight"))

    self:_updateAvatar()

    --军团名
    self._textGuildName:setString(self._carUnit:getGuild_name())
    self._textGuildName:setColor(Colors.getMineGuildColor(2))

    --车名
    -- self._grainCarTitle:loadTexture(Path.getGrainCarText(GrainCarConst.CAR_TITLE[self._carUnit:getLevel()]))
end

------------------------------------------------------------------
----------------------------方法----------------------------------
------------------------------------------------------------------
function PopupGrainCarDetail:_updateData()
    self._carUnit = G_UserData:getGrainCar():getGrainCarWithGuildId(self._carUnit:getGuild_id())
end

function PopupGrainCarDetail:_updateUI()
    if self._carUnit:isInMine(self._mineData:getId()) then
        self._barArmy:updateBarWithCarUnit(self._carUnit)
    else
        self:closeWithAction()
    end
end

--更新粮车
function PopupGrainCarDetail:_updateAvatar()
    self._nodeAvatar:removeAllChildren()
    local PopupGrainCarDetailAvatar = require("app.scene.view.grainCar.PopupGrainCarDetailAvatar")
    local popupGrainCarAvatar = PopupGrainCarDetailAvatar.new(self._mineData)
    self._nodeAvatar:addChild(popupGrainCarAvatar)
    popupGrainCarAvatar:updateUI(self._carUnit)
    popupGrainCarAvatar:faceLeft()
    popupGrainCarAvatar:setScale(2.0)
    popupGrainCarAvatar:setTouchEnable(false)
end

--更新按钮
function PopupGrainCarDetail:_updateBtn()
    local canAttack, nextAtkTime = GrainCarDataHelper.canAttackGrainCar()
    if canAttack then
        self._btnFight:setEnabled(true)
        self._btnFight:setString(Lang.get("grain_car_attack_btn"))
    else
        self._btnFight:setEnabled(false)
        self._btnFight:setString(G_ServerTime:getLeftSeconds(nextAtkTime) .. Lang.get("grain_car_second"))
    end
end

function PopupGrainCarDetail:_startTimer()
    self._scheduleTimeHandler = SchedulerHelper.newSchedule(handler(self, self._updateTimer), 1)
    self:_updateBtn()
    self:_updateLeaveTime()
end

function PopupGrainCarDetail:_stopTimer()
    if self._scheduleTimeHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._scheduleTimeHandler)
		self._scheduleTimeHandler = nil
    end
end

--刷新离开倒计时
function PopupGrainCarDetail:_updateLeaveTime()
    local carUnit = self._carUnit
    if carUnit:getStamina() <= 0 then
        self._textLeave:setString(Lang.get("grain_car_has_broken"))
        return
    end

    local leaveTime = carUnit:getLeaveTime()
    self._textLeave:setString(G_ServerTime:getLeftSecondsString(leaveTime))
    local curTime = G_ServerTime:getTime()
    if curTime > leaveTime then
        self._textLeave:setString(Lang.get("grain_car_has_left"))
    end
end

------------------------------------------------------------------
----------------------------回调----------------------------------
------------------------------------------------------------------
function PopupGrainCarDetail:_updateTimer()
    self:_updateBtn()
    self:_updateLeaveTime()
end

function PopupGrainCarDetail:_onFightClick()
    if self._mineData:getId() ~= G_UserData:getMineCraftData():getSelfMineId() then
        G_Prompt:showTip(Lang.get("mine_diff_mine"))
        return
    end
    if self._carUnit:getStamina() <= 0 then
        G_Prompt:showTip(Lang.get("grain_car_has_broken")) --粮车已损坏
        return
    end
    self._btnFight:setEnabled(false)
    G_UserData:getGrainCar():c2sAttackGrainCar(self._carUnit:getGuild_id(), self._mineData:getId())
end

--攻击粮车
function PopupGrainCarDetail:_onEventGrainCarAttack(event, awards)
    self:_updateData()
    self:_updateBtn()
    self:_updateAvatar()
    
    local name = self._carUnit:getConfig().name
    local hurt = GrainCarConfigHelper.getGrainCarAttackHurt()
    G_Prompt:showTip(Lang.get("grain_car_attack_success", {name = name, hurt = hurt}))
    G_Prompt:showAwards(awards)
end

--粮车血量更新
function PopupGrainCarDetail:_onEventGrainCarNotify()
    self:_updateData()
    self:_updateAvatar()
end


return PopupGrainCarDetail

