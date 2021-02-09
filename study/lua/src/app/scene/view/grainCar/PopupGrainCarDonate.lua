-- Description: 粮车捐献弹出框
-- Company: yoka
-- Author: chenzhongjie
-- Date: 2019-09-04
local PopupBase = require("app.ui.PopupBase")
local PopupGrainCarDonate = class("PopupGrainCarDonate", PopupBase)
local GrainCarInfoNode = require("app.scene.view.grainCar.GrainCarInfoNode")
local GrainCarRun = require("app.scene.view.grainCar.GrainCarRun")
local GrainCarConfigHelper = require("app.scene.view.grainCar.GrainCarConfigHelper") 
local GuildConst = require("app.const.GuildConst")
local GrainCarConst = require("app.const.GrainCarConst")
local SchedulerHelper = require ("app.utils.SchedulerHelper")
local UIHelper  = require("yoka.utils.UIHelper")
local RedPointHelper = require("app.data.RedPointHelper")
local GrainCarRouteProgress = require("app.scene.view.grainCar.GrainCarRouteProgress")
local GrainCarDataHelper = require("app.scene.view.grainCar.GrainCarDataHelper")

PopupGrainCarDonate.TITLE_BG_HEIGHT = 28
PopupGrainCarDonate.LV_UP_EFFECT_OFFSET = 60
PopupGrainCarDonate.TITLE_CONFIG = {}
-- PopupGrainCarDonate.TITLE_CONFIG[GuildConst.GUILD_POSITION_1] = {bgWidth = 770, time = -205, route = -10, routeShow = true, routeConfig = true} --团长
PopupGrainCarDonate.TITLE_CONFIG[GuildConst.GUILD_POSITION_1] = {bgWidth = 370, time = 37, route = -85, routeShow = true, routeConfig = true, terminalShow = false} --团长
PopupGrainCarDonate.TITLE_CONFIG[GuildConst.GUILD_POSITION_2] = {bgWidth = 370, time = 37, route = -85, routeShow = true, routeConfig = true, terminalShow = false} --管理员
PopupGrainCarDonate.TITLE_CONFIG[GuildConst.GUILD_POSITION_3] = {bgWidth = 370, time = 37, route = -85, routeShow = true, routeConfig = true, terminalShow = false} --长老
PopupGrainCarDonate.TITLE_CONFIG[GuildConst.GUILD_POSITION_4] = {bgWidth = 370, time = 37, route = -85, routeShow = false, routeConfig = true, terminalShow = false} --无路线


function PopupGrainCarDonate:waitEnterMsg(callBack)
	local function onMsgCallBack()
		callBack()
    end
    G_UserData:getGrainCar():c2sGetGrainCarInfo()
    local signal = G_SignalManager:add(SignalConst.EVENT_GRAIN_CAR_GET_INFO, onMsgCallBack)
	return signal
end

function PopupGrainCarDonate:ctor()
    self:_initMember()
	local resource = {
		file = Path.getCSB("PopupGrainCarDonate", "grainCar"),
		binding = {
            _btnShare = 
			{
				events = {{event = "touch", method = "_onBtnShareOnClick"}}
            },
            _btnDonate = 
			{
				events = {{event = "touch", method = "_onBtnDonateOnClick"}}
            },
            _btnLaunch = 
			{
				events = {{event = "touch", method = "_onBtnLaunchOnClick"}}
            },
            _btnAdmin = 
			{
				events = {{event = "touch", method = "_onBtnShareAdminOnClick"}}
            },
            _btnAll = 
			{
				events = {{event = "touch", method = "_onBtnShareAllOnClick"}}
            },
            _btnGo2Car = 
			{
				events = {{event = "touch", method = "_onBtnGo2CarOnClick"}}
            },
		}
	}
	self:setName("PopupGrainCarDonate")
	PopupGrainCarDonate.super.ctor(self, resource)
end

function PopupGrainCarDonate:onCreate()
	self._commonNodeBk:addCloseEventListener(handler(self, self._onButtonClose))
    self:_initUI()
end

function PopupGrainCarDonate:onEnter()
    self._signalOnGetGrainCarInfo  = G_SignalManager:add(SignalConst.EVENT_GRAIN_CAR_GET_INFO, handler(self, self._onGetGrainCarInfo)) -- 获取粮车信息
    self._signalOnUpgradeGrainCar  = G_SignalManager:add(SignalConst.EVENT_GRAIN_CAR_UPGRADE, handler(self, self._onUpgradeGrainCar)) -- 粮车升级
    self._signalOnGrainCarAuthChanged  = G_SignalManager:add(SignalConst.EVENT_GRAIN_CAR_CHANGE_AUTH, handler(self, self._onGrainCarAuthChanged)) -- 粮车路线可见变化
    self._signalOnUpdateGrainCar  = G_SignalManager:add(SignalConst.EVENT_GRAIN_CAR_NOTIFY, handler(self, self._onUpdateGrainCar)) -- 粮车信息更新
    self._signalOnLaunchGrainCar  = G_SignalManager:add(SignalConst.EVENT_GRAIN_CAR_LAUNCH, handler(self, self._onLaunchGrainCar)) -- 发车
    self._signalOnGrainCarAuthNotify  = G_SignalManager:add(SignalConst.EVENT_GRAIN_CAR_VIEW_NOTIFY, handler(self, self._onGrainCarAuthNotify)) -- 粮车路线分享权限变动通知
    self._signalRedPointUpdate = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self,self._onEventRedPointUpdate))

    self:_updateData()
    self:_initRoute()
    self:_updateUI()
    self:_startTimer()
end

function PopupGrainCarDonate:onExit()
	if self._signalOnGetGrainCarInfo then
		self._signalOnGetGrainCarInfo:remove()
		self._signalOnGetGrainCarInfo = nil
	end
	if self._signalOnUpgradeGrainCar then
		self._signalOnUpgradeGrainCar:remove()
		self._signalOnUpgradeGrainCar = nil
	end
	if self._signalOnGrainCarAuthChanged then
		self._signalOnGrainCarAuthChanged:remove()
		self._signalOnGrainCarAuthChanged = nil
	end
	if self._signalOnUpdateGrainCar then
		self._signalOnUpdateGrainCar:remove()
		self._signalOnUpdateGrainCar = nil
    end
	if self._signalOnLaunchGrainCar then
		self._signalOnLaunchGrainCar:remove()
		self._signalOnLaunchGrainCar = nil
    end
	if self._signalOnGrainCarAuthNotify then
		self._signalOnGrainCarAuthNotify:remove()
		self._signalOnGrainCarAuthNotify = nil
    end
	if self._signalRedPointUpdate then
		self._signalRedPointUpdate:remove()
		self._signalRedPointUpdate = nil
    end
    self:_stopTimer()
end

function PopupGrainCarDonate:onShowFinish()
end


function PopupGrainCarDonate:_initMember()
    self._carInfoNode1 = nil    --粮车详情
    self._carInfoNode2 = nil    --粮车详情
    self._btnAdmin = nil        --仅管理
    self._btnAll = nil          --全军团
    self._btnAll = nil          --全军团
    self._btnDonate = nil       --捐献
    self._btnLaunch = nil       --发车
    self._btnGo2Car = nil       --前往
    self._tips = nil            --活动期间无法再为本军团粮车进行升级
    self._lastLevel = nil       --上个等级
    self._carRun = nil          --粮车跑动层
end

function PopupGrainCarDonate:_updateData()
    self._curCarData = G_UserData:getGrainCar():getGrainCar() 

    local userInfo = G_UserData:getGuild():getMyMemberData()
    self._userPosition = userInfo:getPosition()
end

------------------------------------------------------------------
----------------------------UI------------------------------------
------------------------------------------------------------------
function PopupGrainCarDonate:_initUI()
    self._commonNodeBk:setTitle(Lang.get("grain_car_donate_title"))
    self._commonHelp:updateUI(FunctionConst.FUNC_GRAIN_CAR)
    --1.按钮
    self._btnAdmin:setTitleText(Lang.get("grain_car_btn_share_title_admin"))
    self._btnAll:setTitleText(Lang.get("grain_car_btn_share_title_all"))
    self._btnDonate:setString(Lang.get("grain_car_btn_donate"))
    self._btnLaunch:setString(Lang.get("grain_car_btn_launch"))
    self._btnGo2Car:setString(Lang.get("grain_car_btn_go2Car"))
    self._donateCount:setString(Lang.get("grain_car_donate_tip_at_least", {num = GrainCarConfigHelper.getGrainCarLevelUp()}))
    self._shareMenuRoot:setVisible(false)
    self._checkBoxAdmin:addEventListener(handler(self, self._onClickCheckBoxAdmin))
    self._checkBoxAll:addEventListener(handler(self, self._onClickCheckBoxAll))
    self._labelAdmin:setString(Lang.get("grain_car_btn_share_title_admin"))
    self._labelAll:setString(Lang.get("grain_car_btn_share_title_all"))
    local canDonate = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_GRAIN_CAR, "canDonate")		
    local canLaunch = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_GRAIN_CAR, "canLaunch")		
    self._btnDonate:showRedPoint(canDonate) 
    self._btnLaunch:showRedPoint(canLaunch) 

    --2.消耗
    local type, value, size = GrainCarConfigHelper.getGrainCarDonateCost()
    self._resourceCost:updateUI(type, value, size)
    self._resourceCost:setCountColorToWhite()

    --3.经验
    local exp = GrainCarConfigHelper.getGrainCarDonateExp()
    local content = Lang.get("grain_car_add_exp", {exp = exp})
    local label = ccui.RichText:createWithContent(content)
    label:setAnchorPoint(cc.p(0, 0.5))
    self._nodeRichText:addChild(label)

    --4.粮车
    local grainCarInfoNode1 = GrainCarInfoNode.new()
    grainCarInfoNode1:setTextType(1)
    self._nodeInfo1:addChild(grainCarInfoNode1, 0)
    local nodeInfoPosX, nodeInfoPosY = self._nodeInfo1:getPosition()
    self._nodeMoving:setPosition(cc.p(nodeInfoPosX + PopupGrainCarDonate.LV_UP_EFFECT_OFFSET, nodeInfoPosY))
    self._carInfoNode1 = grainCarInfoNode1

    local grainCarInfoNode2 = GrainCarInfoNode.new()
    grainCarInfoNode2:setTextType(2)
    grainCarInfoNode2:setRightType()
    self._nodeInfo2:addChild(grainCarInfoNode2)
    self._carInfoNode2 = grainCarInfoNode2
end

--初始化粮车和路线
function PopupGrainCarDonate:_initRoute()
    --1.路线
    self._routeProgress = GrainCarRouteProgress.new(self._curCarData)
    self._nodeProgress:removeAllChildren()
    self._nodeProgress:addChild(self._routeProgress)
    self._routeProgress:updateUIStatic()
    self._routeProgress:showTerminal(false)

    self._lastLevel = self._curCarData:getLevel()
end


function PopupGrainCarDonate:_updateUI(withAni)
    self:_updateProgress(withAni)
    self:_updateCar()
    self:_updateTitle()
    self:_updateLaunchBtn()
end

--粮车
function PopupGrainCarDonate:_updateCar()
    local curLevel = self._curCarData:getLevel()
    local countDonate = self._curCarData:getDonate_users()
    self._labelDonateCount:setString(countDonate)
    -- if countDonate < GrainCarConfigHelper.getGrainCarLevelUp() then
    --     self._labelDonateCount:setColor(Colors.BRIGHT_BG_RED)
    --     self._labelDonateCount:setPositionX(210)
    --     self._donateCount:setString(Lang.get("grain_car_donate_tip_at_least", {num = GrainCarConfigHelper.getGrainCarLevelUp()}))
    -- else
    --     self._labelDonateCount:setColor(Colors.NUMBER_WHITE)
    --     self._labelDonateCount:setPositionX(60)
    --     self._donateCount:setString(Lang.get("grain_car_donate_tip_reach_count"))
    -- end

    
    self._nodeProgress:setVisible(countDonate >= GrainCarConfigHelper.getGrainCarLevelUp())
    if curLevel > self._lastLevel then
        self:_playLevelUpEffect()
    end
    if countDonate == GrainCarConfigHelper.getGrainCarLevelUp() then
        self:_initRoute()
    end
    if self._curCarData:getLevel() < GrainCarConst.MAX_LEVEL then
        self._carInfoNode1:updateUI(curLevel)
        self._carInfoNode2:updateUI(curLevel + 1)
        self._nodeMaxLevel:setVisible(false)
    else
        self._carInfoNode1:updateUI(curLevel)
        self._nodeDonate:setVisible(true)
        self._nodeMaxLevel:setVisible(false)
        self._expTitle:setVisible(false)
        self:_putMiddle()
    end
    self._lastLevel = self._curCarData:getLevel()
end

--进度条
function PopupGrainCarDonate:_updateProgress(withAni)
    local maxExp = self._curCarData:getConfig().exp
	if self._curCarData:getLevel() == GrainCarConst.MAX_LEVEL then
		local config = GrainCarConfigHelper.getGrainCarConfig(GrainCarConst.MAX_LEVEL - 1)
		maxExp = config.exp
    end
    local curExp = self._curCarData:getExp()
    local percent = curExp / maxExp * 100
    self._progressExp:setPercent(percent)
    
    if withAni then --播滚动动画
		local lastValue = tonumber(self._textExpPercent1:getString())
		if curExp ~= lastValue then
			self._textExpPercent2:doScaleAnimation()
		end
		self._textExpPercent1:updateTxtValue(curExp)
	else
		self._textExpPercent1:setString(curExp)
	end
    self._textExpPercent2:setString("/"..maxExp)
end

--标题
function PopupGrainCarDonate:_updateTitle()
    self:_updateAuth()
    -- self:_updateRoute()
end

--权限
function PopupGrainCarDonate:_updateAuth()
    if self._curCarData:getDonate_users() < GrainCarConfigHelper.getGrainCarLevelUp() then
        self._nodeRouteConfig:setVisible(false)
        return
    end
    local userPosition = self._userPosition
    if userPosition == GuildConst.GUILD_POSITION_1 or 
        userPosition == GuildConst.GUILD_POSITION_2 or 
        userPosition == GuildConst.GUILD_POSITION_3 then --团长 、 副团长、长老
        self:_updateAuthWithPosition(userPosition)
    else --成员
        if self._curCarData:getAll_view() == 0 then
            --管理可见
            self:_updateAuthWithPosition(userPosition)
        elseif self._curCarData:getAll_view() == 1 then
            --所有人可见 用长老配置
            self:_updateAuthWithPosition(GuildConst.GUILD_POSITION_3)
        end
    end
    -- self._textShare:setString(self._curCarData:getAll_view() == 0 and 
    --                         Lang.get("grain_car_btn_share_title_admin") or 
    --                         Lang.get("grain_car_btn_share_title_all"))
    self._checkBoxAdmin:setSelected(self._curCarData:getAll_view() == 0)
    self._checkBoxAll:setSelected(self._curCarData:getAll_view() == 1)
end

--根据权限更新title
function PopupGrainCarDonate:_updateAuthWithPosition(pos)
    self._titleBg:setContentSize(cc.size(PopupGrainCarDonate.TITLE_CONFIG[pos].bgWidth, PopupGrainCarDonate.TITLE_BG_HEIGHT))
    self._nodeTime:setPositionX(PopupGrainCarDonate.TITLE_CONFIG[pos].time)
    self._nodeRouteConfig:setVisible(PopupGrainCarDonate.TITLE_CONFIG[pos].routeConfig)
    -- self._nodeRoute:setPositionX(PopupGrainCarDonate.TITLE_CONFIG[pos].route)
    -- self._nodeRoute:setVisible(PopupGrainCarDonate.TITLE_CONFIG[pos].routeShow)

    -- self._nodeProgress:setVisible(PopupGrainCarDonate.TITLE_CONFIG[pos].routeShow)
    self._routeProgress:showRouteName(PopupGrainCarDonate.TITLE_CONFIG[pos].routeShow)
    self._nodeProgress:setPositionX(PopupGrainCarDonate.TITLE_CONFIG[pos].route)

    --显示起点终点
    self._routeProgress:showTerminal(PopupGrainCarDonate.TITLE_CONFIG[pos].terminalShow)
end

--路线
-- function PopupGrainCarDonate:_updateRoute()
--     if (self._userPosition == GuildConst.GUILD_POSITION_4 and self._curCarData:getAll_view() == 1) or 
--         self._userPosition == GuildConst.GUILD_POSITION_1 or 
--         self._userPosition == GuildConst.GUILD_POSITION_2 or 
--         self._userPosition == GuildConst.GUILD_POSITION_3 then --团长 、 副团长、长老
--             local roads = self._curCarData:getRoute()
--             if #roads == 0 then
--                 return
--             end
--             local startPit, endPit = roads[1], roads[#roads]
--             local startData = G_UserData:getMineCraftData():getMineDataById(startPit:getMine_id()):getConfigData()
--             local endData = G_UserData:getMineCraftData():getMineDataById(endPit:getMine_id()):getConfigData()
--             local startName, endName = startData.pit_name, endData.pit_name
--             self._textRoute:setString(Lang.get("grain_car_route", {name1 = startName, name2 = endName}))
--     end
-- end

--发车按钮
function PopupGrainCarDonate:_updateLaunchBtn()
    if  GrainCarConfigHelper.isInLaunchTime() and
        self._curCarData:getLevel() > 1 and
        (self._userPosition == GuildConst.GUILD_POSITION_1 or self._userPosition == GuildConst.GUILD_POSITION_2 )then
        --团长副团长可以发车
        self:_showLaunchBtn(true)
        self._nodeDonate:setVisible(false)
    else
        self:_showLaunchBtn(false)
    end
end

--显示发车按钮
function PopupGrainCarDonate:_showLaunchBtn(bShow)
    self._btnLaunch:setVisible(bShow)
end

--更新押镖中的显示
function PopupGrainCarDonate:_updateInActivityTime()
    if GrainCarConfigHelper.isInActivityTime() then
        if self._curCarData:hasLaunched() then
            --已经发车
            if not self._carRun then
                self._carRun = GrainCarRun.new()
                self._nodeRun:addChild(self._carRun)
            end
            if self._curCarData:isDead() then
                self._carRun:carDead()
            elseif self._curCarData:hasComplete() then
                self._carRun:carReachTerminal()
            end
            self._labelDonateCount:setVisible(false)
            self._donateCount:setVisible(false)
            -- --粮车居中，显示血量
            -- self:_putMiddle()
            -- local curLevel = self._curCarData:getLevel()
            -- self._carInfoNode1:updateRuntimeUI(self._curCarData)

            -- --隐藏捐献 显示前往
            -- self._nodeDonate:setVisible(false)
            -- self._nodeMaxLevel:setVisible(false)
            -- self._btnLaunch:setVisible(false)

            -- self._btnGo2Car:setVisible(true)
            -- self._tips:setVisible(false)
            -- if self._curCarData:isDead() then
            --     self._btnGo2Car:setVisible(false)
            --     self._btnLaunch:setVisible(false)
            -- elseif self._curCarData:hasComplete() then
            --     self._btnGo2Car:setVisible(false)
            --     self._btnLaunch:setVisible(false)
            -- end
        else
            --没发车
            self:_putMiddle()
            self._nodeDonate:setVisible(false)
            self._btnGo2Car:setVisible(false)
            if self._userPosition == GuildConst.GUILD_POSITION_1 or self._userPosition == GuildConst.GUILD_POSITION_2 then
                if GrainCarConfigHelper.isInLaunchTime()  then
                    --团长显示发车
                    self._tips:setVisible(false)
                    self:_showLaunchBtn(true)
                    if self._curCarData:getDonate_users() >= GrainCarConfigHelper.getGrainCarLevelUp() then
                        self:_showLaunchBtn(true)
                    else
                        self._carInfoNode1:setRuntime(true)
                        self:_showLaunchBtn(false)
                    end
                elseif GrainCarConfigHelper.isClose() then
                    self._nodeProgress:setVisible(false)
                    self._tips:setVisible(true)
                    self._tips:setString(Lang.get("grain_car_has_not_launched"))
                    self._nodeRouteConfig:setVisible(false)
                end
            else
                --团员显示tip
                -- if self._curCarData:getLevel() < PopupGrainCarDonate.CAR_MAX_LEVEL then
                --     self._tips:setVisible(true)
                -- else
                --     --满级不显示tip
                --     self._tips:setVisible(false)
                -- end
                if GrainCarConfigHelper.isInLaunchTime() then
                    self._tips:setString(Lang.get("grain_car_cannot_donate_in_activity_time"))
                elseif GrainCarConfigHelper.isClose() then
                    self._tips:setString(Lang.get("grain_car_has_not_launched"))
                    self._nodeProgress:setVisible(false)
                end
                self:_showLaunchBtn(false)
            end
        end
    else
        self._btnGo2Car:setVisible(false)
        self._tips:setVisible(false)
    end
end

--粮车居中
function PopupGrainCarDonate:_putMiddle()
    self._nodeInfo1:setVisible(true)
    self._nodeInfo1:setPositionX(0)
    self._nodeInfo2:setVisible(false)
    self._arrow:setVisible(false)
    
    local nodeInfoPosX, nodeInfoPosY = self._nodeInfo1:getPosition()
    self._nodeMoving:setPosition(cc.p(nodeInfoPosX + PopupGrainCarDonate.LV_UP_EFFECT_OFFSET, nodeInfoPosY))
end
------------------------------------------------------------------
----------------------------方法----------------------------------
------------------------------------------------------------------
function PopupGrainCarDonate:_startTimer()
    self._scheduleTimeHandler = SchedulerHelper.newSchedule(handler(self, self._updateTimer), 1)
    self:_updateTimer()
end

function PopupGrainCarDonate:_stopTimer()
    if self._scheduleTimeHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._scheduleTimeHandler)
		self._scheduleTimeHandler = nil
    end
end

--升级飘字
function PopupGrainCarDonate:_playPrompt()
	local summary = {}

	local content = Lang.get("grain_car_donate_success")
	local param = {
            content = content,
            flyTime = 0.3,
			anchorPoint = cc.p(0.5, 0.5),
            startPosition = {y = 100},        
            dstPosition = self._textExpPercent2:convertToWorldSpace(cc.p(0, 0)),
            finishCallback = function()
                if self._curCarData then
                    self:_updateProgress(true)
                    self:_updateCar()
                    self:_updateTitle()
                    self:_updateLaunchBtn()
                end
            end,
		}
    table.insert(summary, param)
    
    local color = Colors.colorToNumber(Colors.getColor(2))
	local outlineColor = Colors.colorToNumber(Colors.getColorOutline(2))
    local exp = GrainCarConfigHelper.getGrainCarDonateExp()
    local contentExp = Lang.get("grain_car_donate_add_exp", {exp = exp, color = color, outlineColor = outlineColor})
	local paramExp = {
            content = contentExp,
            flyTime = 0.3,
			anchorPoint = cc.p(0.5, 0.5),
            startPosition = {y = 100},        
            dstPosition = self._textExpPercent2:convertToWorldSpace(cc.p(0, 0)),
            finishCallback = function()
            end,
		}
	table.insert(summary, paramExp)
	
	G_Prompt:showSummary(summary)
end

function PopupGrainCarDonate:_playLevelUpEffect()
	local function eventFunction(event)
        if event == "finish" then
        	
        end
    end
	G_EffectGfxMgr:createPlayMovingGfx(self._nodeMoving, "moving_dangao_dangaoshengji", nil, eventFunction , true)
end

------------------------------------------------------------------
----------------------------回调----------------------------------
------------------------------------------------------------------
function PopupGrainCarDonate:_updateTimer()
    if GrainCarConfigHelper.isInActivityTimeFromGenerate() then
        --粮车生成了
        if GrainCarConfigHelper.isInLaunchTime() then
            local endTime = GrainCarConfigHelper.getGrainCarEndTimeStamp()
            self._textOpenTime:setString(G_ServerTime:getLeftSecondsString(endTime))
            self._titleOpenTime:setString(Lang.get("grain_car_donate_title_close"))
        elseif GrainCarConfigHelper.isClose() then
            self._textOpenTime:setString(Lang.get("grain_car_is_over"))
        else
            --不在发车时间
            local startTime = GrainCarConfigHelper.getGrainCarOpenTimeStamp()
            self._textOpenTime:setString(G_ServerTime:getLeftSecondsString(startTime))
            self._titleOpenTime:setString(Lang.get("grain_car_donate_title_open"))
        end
    else
        local startTime = GrainCarConfigHelper.getNextGrainCarStartTime()
        self._textOpenTime:setString(G_ServerTime:getLeftSecondsString(startTime))
    end
    self:_updateLaunchBtn()
    self:_updateInActivityTime()
end

function PopupGrainCarDonate:_onButtonClose()
    self:close()
end

--分享按钮
function PopupGrainCarDonate:_onBtnShareOnClick()
    self._shareMenuRoot:setVisible(not self._shareMenuRoot:isVisible())
end

--仅管理可见
function PopupGrainCarDonate:_onBtnShareAdminOnClick()
    G_UserData:getGrainCar():c2sChangeGrainCarView(GrainCarConst.AUTH_ADMIN)
    self._shareMenuRoot:setVisible(false)
end

--全军团可见
function PopupGrainCarDonate:_onBtnShareAllOnClick()
    G_UserData:getGrainCar():c2sChangeGrainCarView(GrainCarConst.AUTH_ALL)
    self._shareMenuRoot:setVisible(false)
end

--复选框仅管理
function PopupGrainCarDonate:_onClickCheckBoxAdmin(checkbox, event)
    if self._userPosition ~= GuildConst.GUILD_POSITION_1 and self._userPosition ~= GuildConst.GUILD_POSITION_2 then
        G_Prompt:showTip(Lang.get("grain_car_no_auth_share"))
        self._checkBoxAdmin:setSelected(self._curCarData:getAll_view() == 0)
        self._checkBoxAll:setSelected(self._curCarData:getAll_view() == 1)
        return
    end
    if event == 0 then
        self._checkBoxAll:setSelected(false)
        G_UserData:getGrainCar():c2sChangeGrainCarView(GrainCarConst.AUTH_ADMIN)
    end
end

--复选框全团
function PopupGrainCarDonate:_onClickCheckBoxAll(checkbox, event)
    if self._userPosition ~= GuildConst.GUILD_POSITION_1 and self._userPosition ~= GuildConst.GUILD_POSITION_2 then
        G_Prompt:showTip(Lang.get("grain_car_no_auth_share"))
        self._checkBoxAdmin:setSelected(self._curCarData:getAll_view() == 0)
        self._checkBoxAll:setSelected(self._curCarData:getAll_view() == 1)
        return
    end
    if event == 0 then
        self._checkBoxAdmin:setSelected(false)
        G_UserData:getGrainCar():c2sChangeGrainCarView(GrainCarConst.AUTH_ALL)
    end
end

--粮车路线分享权限变动通知
function PopupGrainCarDonate:_onGrainCarAuthNotify()
    --重新获取信息
    G_UserData:getGrainCar():c2sGetGrainCarInfo()
    -- self:_updateTitle()
end

--捐献按钮
function PopupGrainCarDonate:_onBtnDonateOnClick()
    G_UserData:getGrainCar():c2sUpgradeGrainCar()
end

--发车按钮
function PopupGrainCarDonate:_onBtnLaunchOnClick()
    G_UserData:getGrainCar():c2sStartGrainCarMove()
end

--前往按钮
function PopupGrainCarDonate:_onBtnGo2CarOnClick()
    local runtimeCar = self._curCarData
    if not runtimeCar then
        return
    end

    local pit1 = runtimeCar:getCurCarPos()

    local sceneName = G_SceneManager:getRunningSceneName()
    if sceneName == "mineCraft" then
        G_SignalManager:dispatch(SignalConst.EVENT_GRAIN_CAR_GO2MINE, pit1)
    else
        G_SceneManager:showScene("mineCraft", pit1)
    end
    self:close()
end

--获取粮车信息
function PopupGrainCarDonate:_onGetGrainCarInfo()
    self:_updateData()
    
    self._nodeProgress:removeAllChildren()
    self._routeProgress = GrainCarRouteProgress.new(self._curCarData)
    self._nodeProgress:addChild(self._routeProgress)
    self._routeProgress:updateUIStatic()
    self._routeProgress:showTerminal(false)
    self:_updateTitle()
end

--粮车升级
function PopupGrainCarDonate:_onUpgradeGrainCar()
    self:_updateData()
    self:_playPrompt()
end

--粮车路线可见变化 (allView   0:仅管理可见;1:全部可见)
function PopupGrainCarDonate:_onGrainCarAuthChanged(id, allView)
    -- self._textShare:setString(allView == 0 and 
    --                         Lang.get("grain_car_btn_share_title_admin") or 
    --                         Lang.get("grain_car_btn_share_title_all"))

    self._checkBoxAdmin:setSelected(allView == 0)
    self._checkBoxAll:setSelected(allView == 1)
    --现在权限修改不广播 不需要以下2行
    -- self:_updateData()
    -- self:_updateUI()
end

--粮车信息更新
function PopupGrainCarDonate:_onUpdateGrainCar()
    self:_updateData()
    if GrainCarConfigHelper.isInActivityTime() then
        self:_updateInActivityTime()
        if self._carRun then
            self._carRun:updateUI(self._curCarData)
        end
    else
        -- self:_playPrompt()
        self:_updateUI(true)
    end
end

--发车
function PopupGrainCarDonate:_onLaunchGrainCar()
    local startMineId = self._curCarData:getStartMine()
    local sceneName = G_SceneManager:getRunningSceneName()
    if sceneName == "mineCraft" then
        G_SignalManager:dispatch(SignalConst.EVENT_GRAIN_CAR_GO2MINE, startMineId)
    else
        G_SceneManager:showScene("mineCraft", startMineId)
    end
    self:close()
end

--红点
function PopupGrainCarDonate:_onEventRedPointUpdate(event,funcId,param)
    local canDonate = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_GRAIN_CAR, "canDonate")		
    local canLaunch = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_GRAIN_CAR, "canLaunch")		
    self._btnDonate:showRedPoint(canDonate) 
    self._btnLaunch:showRedPoint(canLaunch) 
end



return PopupGrainCarDonate