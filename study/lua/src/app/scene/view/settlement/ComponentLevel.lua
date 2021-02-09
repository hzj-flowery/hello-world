--经验条
local ComponentBase = require("app.scene.view.settlement.ComponentBase")
local ComponentLevel = class("ComponentLevel", ComponentBase)

local UserDataHelper = require("app.utils.UserDataHelper")
local CSHelper  = require("yoka.utils.CSHelper")

ComponentLevel.LEVEL_SPEED = 5
ComponentLevel.WAIT_TIME = 0.2

function ComponentLevel:ctor(getExp, position)
    self._getExp = getExp   --获得经验
    self._targetLevel = G_UserData:getBase():getLevel() --目标等级
    self._targetExp = G_UserData:getBase():getExp() --目标经验

    self._targetPercent = math.floor(self._targetExp / UserDataHelper.getUserLevelUpExp() * 100)    --目标百分比

    self._lastLevel = 0     --开始等级
    self._lastExp = 0       --开始经验
    local isLevelUp, lastLevel = G_UserData:getBase():isLevelUp()       --判断是否有升级
    if not isLevelUp then
        self._lastLevel = self._targetLevel             --没有升级，开始等级等于目标等级
        self._lastExp = self._targetExp - getExp        
    else
        self._lastLevel = lastLevel
        self._targetPercent = self._targetPercent + 100
        self._lastExp = UserDataHelper.getUserLevelUpExp(self._lastLevel) - (getExp - self._targetExp)
    end
    if self._lastExp < 0 then
        self._lastExp = 0
    end
    self._lastPercent = math.floor(self._lastExp / UserDataHelper.getUserLevelUpExp(self._lastLevel) * 100) --开始时候的百分比
    self._isLevelUp = isLevelUp

    -- self._lastLevel = self._targetLevel
    -- local isLevelUp, lastLevel = G_UserData:getBase():isLevelUp()       --判断是否有升级
    -- if isLevelUp then
    --     self._lastLevel = lastLevel --如果升级的话，获得上一级
    -- end
    -- self._isLevelup = false
    -- if self._lastLevel ~= self._targetLevel then
    --     self._isLevelup = true
    --     self._lastExp = UserDataHelper.getUserLevelUpExp(self._lastLevel) - (getExp - self._targetExp)
    -- else
    --     self._lastExp = self._targetExp - getExp
    -- end

    
    -- self._targetPercent = math.floor(self._targetExp / UserDataHelper.getUserLevelUpExp() * 100)
    -- if self._isLevelup then
    --     self._targetPercent = self._targetPercent + 100
    -- end

    self._expPercent = nil          --百分比条控件
    self._textLevel = nil           --等级控件
    self._isChangeLevel = false     --是否显示过等级变化
    self._nowPercent = self._lastPercent    --现在的百分比
    self._panelExp = nil            --经验条csb
    self._startExp = false          --开始exp动画
    self._waitExpTime = 0           --等待开始时间
    self._textExpPercent2 = nil     --等级总经验
    self._textExpPercent1 = nil     --现在的经验

    self._curMaxLevel = self:_getCurMaxLevel() --当前最大等级
    self:setPosition(position)
    ComponentLevel.super.ctor(self)
end

function ComponentLevel:start()
    self:_createExpAnim()
    ComponentLevel.super.start(self)
end

function ComponentLevel:update(f)   
    if self._startExp then
        self._nowPercent = self._nowPercent + ComponentLevel.LEVEL_SPEED
		local t = self._nowPercent / self._targetPercent
		t = t > 1 and 1 or t
        if self._nowPercent > self._targetPercent then
            self._nowPercent = self._targetPercent
        end
        local showPercent = self._nowPercent
        if showPercent >= 100 then
            if not self._isChangeLevel then
                local bgPercent = self._targetPercent - 100
                self._expPercentBG:setPercent(bgPercent)
                self._textLevel:setString(self._targetLevel)
                self._isChangeLevel = true
            end
            showPercent = showPercent - 100
        end
        self:_setProgressPercent(showPercent)
        self:_updateLevelText()
        if t == 1 then
            self:onFinish()
        end
    else
        if self:isStart() and self._panelExp then
            self._waitExpTime = self._waitExpTime + f
            if self._waitExpTime >= ComponentLevel.WAIT_TIME then
                self._startExp = true
            end
        end
    end
end

function ComponentLevel:onFinish()
    self._textExpPercent1:setString(self._targetExp)
    ComponentLevel.super.onFinish(self)
end

function ComponentLevel:_updateLevelText()
    local lastLevelExp = 0
    if not self._isChangeLevel then
        lastLevelExp = UserDataHelper.getUserLevelUpExp(self._lastLevel)  --升级需要经验
        self._textExpPercent2:setString("/"..lastLevelExp)
    else
        lastLevelExp = UserDataHelper.getUserLevelUpExp()  --升级需要经验
        self._textExpPercent2:setString("/"..lastLevelExp)
    end
    local expPercent = self._nowPercent
    if expPercent >= 100 then
        expPercent = expPercent - 100
    end
    local nowExp = math.floor(lastLevelExp * expPercent / 100)
    self._textExpPercent1:setString(nowExp)
end

function ComponentLevel:_createCsbNode()
    local panelExp = CSHelper.loadResourceNode(Path.getCSB("PanelExp", "settlement"))
    self._textLevel = ccui.Helper:seekNodeByName(panelExp, "TextLevel")
    self._textLevel:setString(self._lastLevel)  
    self._expPercent = ccui.Helper:seekNodeByName(panelExp, "ExpPercent")
    self._expPercent:setPercent(self._lastPercent)

    self._expPercentBG = ccui.Helper:seekNodeByName(panelExp, "ExpPercentBG")
    local bgPercent = self._targetPercent
    if bgPercent > 100 then
        bgPercent = 100
    end
    self._expPercentBG:setPercent(bgPercent)

	local percent = math.floor(self._lastPercent)
    self._expPercent:setPercent(percent)
    
    self._textExpPercent1 = ccui.Helper:seekNodeByName(panelExp, "TextExpPercent1")
    self._textExpPercent2 = ccui.Helper:seekNodeByName(panelExp, "TextExpPercent2")
    self:_updateLevelText()
    -- self._textExpPercent2:setString("/"..UserDataHelper.getUserLevelUpExp())
    -- self._textExpPercent1:setString(UserDataHelper.getUserLevelUpExp(self._lastLevel))

    return panelExp
end

function ComponentLevel:_createExpAnim()
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        if effect == "win_dengji" then  
            -- local expPanel = self:_createCsbNode()
            -- return expPanel
            self._panelExp = self:_createCsbNode()
            return self._panelExp
        end
    end
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_level", effectFunction, nil , false )
end

function ComponentLevel:_getCurMaxLevel()
    local ParameterIDConst = require("app.const.ParameterIDConst")
    local UserCheck = require("app.utils.logic.UserCheck")
    local nowDay = G_UserData:getBase():getOpenServerDayNum()
    local paramContent = require("app.config.parameter").get(ParameterIDConst.PLAYER_DETAIL_LEVEL_LIMIT).content
	local valueList = string.split(paramContent, ",")

	for i, value in ipairs(valueList) do
		local day, level = unpack(string.split(value, "|"))
		local currLevel = tonumber(level)
		local currDay = tonumber(day)
		if UserCheck.enoughOpenDay(currDay) then
			return currLevel
		end
	end
end

function ComponentLevel:_setProgressPercent(percent)
    local lastLevelExp = 0
    if not self._isChangeLevel then
        lastLevelExp = UserDataHelper.getUserLevelUpExp(self._lastLevel)
    else
        lastLevelExp = UserDataHelper.getUserLevelUpExp()
    end
    if self._targetLevel >= self._curMaxLevel then
        --达到最大等级
        if self._targetExp >= lastLevelExp then
            self._expPercent:setPercent(100)
        else
            self._expPercent:setPercent(percent)
        end
    else
        self._expPercent:setPercent(percent)
    end
end

return ComponentLevel