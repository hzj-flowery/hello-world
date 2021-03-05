local ViewBase = require("app.ui.ViewBase")
local GuildWarBattleView = class("GuildWarBattleView", ViewBase)
local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")
local GuildWarTaskListNode = require("app.scene.view.guildwarbattle.GuildWarTaskListNode")
local GuildWarBattleMapNode = require("app.scene.view.guildwarbattle.GuildWarBattleMapNode")
local GuildWarAuctionHelper = require("app.scene.view.guildwar.GuildWarAuctionHelper")
local BullectScreenConst = require("app.const.BullectScreenConst")
local AudioConst = require("app.const.AudioConst")
local GuildWarEnemyListNode = require("app.scene.view.guildwarbattle.GuildWarEnemyListNode")
local GuildWarNoticeNode = require("app.scene.view.guildwarbattle.GuildWarNoticeNode")
local GuildWarRebornCDNode = require("app.scene.view.guildwarbattle.GuildWarRebornCDNode")



function GuildWarBattleView:ctor(cityId)
    self._cityId = cityId
    self._nodeEnemyListParent = nil
    self._ndoeRankListParent = nil
    self._ndoeTargetListParent = nil
    self._nodeMapParent = nil
    
    self._hurtRankListNode = nil
    self._taskListNode = nil
    self._mapNode = nil


    self._btnMyPos = nil
    self._btnChangeCity = nil

    self._textDefenderInfo = nil
    self._textDefender = nil


    self._guildWarAuctionHelper = nil
    self._nodeCountdownParent = nil

    self._guildWarNotice = nil



    self._isCameraFar = false

    self._textCdTitle = nil
    self._textCdTime = nil
    self._rebornCDNode = nil
    self._nodeRebornCDParent = nil
    
    self._showMoveCdEffect = false
    self._showAttackCdEffect = false
    self._nodeEffectParent = nil

	local resource = {
		file = Path.getCSB("GuildWarBattleView", "guildwarbattle"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
            _btnMyPos = {
				events = {{event = "touch", method = "_onMyPosClick"}}
			},
            _btnChangeCity = {
				events = {{event = "touch", method = "_onChangeCityClick"}}
			},
        }
	}
	GuildWarBattleView.super.ctor(self, resource)
end

function GuildWarBattleView:onCreate()
    self:setName("GuildWarBattleView")

    local TopBarStyleConst = require("app.const.TopBarStyleConst")
    self._topbarBase:hideBG()
    self._topbarBase:setItemListVisible(false)


    self._btnBattleLog:updateUI(FunctionConst.FUNC_GUILD_DUNGEON_RECORD )
    self._btnBattleLog:addClickEventListenerEx(handler(self,self._onClickLog))

    self._btnMagnifier:updateUI(FunctionConst.FUNC_GUILD_WAR_MAP_BIG )
    self._btnMagnifier:addClickEventListenerEx(handler(self,self._onClickMagnifier))

    self:_refreshCityName()

    self._btnMyPos:updateUI(FunctionConst.FUNC_MINE_POS)



    local guildWarEnemyListNode = GuildWarEnemyListNode.new(self._cityId)
    self._nodeEnemyListParent:addChild(guildWarEnemyListNode)
  

    local taskListNode = GuildWarTaskListNode.new(self._cityId)
    self._ndoeTargetListParent:addChild(taskListNode)
    self._taskListNode = taskListNode


    self._guildWarNotice = GuildWarNoticeNode.new(1)
    self._tipsParentNode:addChild(self._guildWarNotice)
   

    local mapNode = GuildWarBattleMapNode.new(self._cityId)
    self._nodeMapParent:addChild(mapNode)
    self._mapNode  = mapNode
    self:_restoreMapScaleState()


    local rebornCDNode = GuildWarRebornCDNode.new()
    self._rebornCDNode = rebornCDNode
    self._nodeRebornCDParent:addChild(rebornCDNode)
    
    self._guildWarAuctionHelper  = GuildWarAuctionHelper.new(self._cityId)



    self._danmuPanel = self._commonChat:getPanelDanmu()
	self._danmuPanel:addClickEventListenerEx(handler(self,self._onBtnDanmu))
	self._danmuPanel:setVisible(true)
    G_BulletScreenManager:setBulletScreenOpen(BullectScreenConst.GUILD_WAR_TYPE,true)
    self:_updateBulletScreenBtn(BullectScreenConst.GUILD_WAR_TYPE)
end

function GuildWarBattleView:onEnter()
    G_AudioManager:playMusicWithId(AudioConst.MUSIC_GUILD_WAR_BATTLE)
  --  logWarn("GuildWarBattleView ----------- onEnter ")
    self._signalGuildWarBattleInfoGet = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_BATTLE_INFO_GET,
         handler(self,self._onEventGuildWarBattleInfoGet ))

    self._signalGuildWarBattleInfoSyn = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_BATTLE_INFO_SYN,
         handler(self,self._onEventGuildWarBattleInfoSyn ))


    self._signalGuildWarBattleMoveCamera = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_BATTLE_MOVE_CAMERA,
         handler(self,self._onEventGuildWarBattleMoveCamera  ))     

    self._signalLoginSuccess = G_SignalManager:add(SignalConst.EVENT_LOGIN_SUCCESS, handler(self, self._onEventLoginSuccess))

    
    self._signalGuildWarAttackNotice = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_ATTACK_NOTICE,
         handler(self,self._onEventGuildWarAttackNotice))

    self._signalGuildWarBattleGoCampNotice = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_BATTLE_GO_CAMP_NOTICE,
         handler(self,self._onEventGuildWarBattleGoCampNotice))

    self:_startTimer()

    self._guildWarAuctionHelper:onEnter()

    self:_refreshTimeView()
    self:_refreshCdTimeView()

	if self._isBulletOpen then
		G_BulletScreenManager:setBulletScreenOpen(BullectScreenConst.GUILD_WAR_TYPE,true)
	end

    self:_checkCountDown()

    self:_startFinishTimer()

        
    self._rebornCDNode:updateVisible(self._cityId)

    self:_refreshChangeCityBtn()
end	

function GuildWarBattleView:onExit()
    self:_endTimer()
    self:_removeCountDown()

    self:_endFinishTimer()

    self._signalGuildWarBattleInfoSyn:remove()
    self._signalGuildWarBattleInfoSyn = nil

    self._signalGuildWarBattleInfoGet:remove()
    self._signalGuildWarBattleInfoGet = nil

    self._signalGuildWarBattleMoveCamera:remove()
    self._signalGuildWarBattleMoveCamera  = nil

	self._signalLoginSuccess:remove()
    self._signalLoginSuccess = nil

    
    self._signalGuildWarAttackNotice:remove()
    self._signalGuildWarAttackNotice = nil

    self._signalGuildWarBattleGoCampNotice:remove()
    self._signalGuildWarBattleGoCampNotice = nil

    self._guildWarAuctionHelper:onExit()

    local runningScene = G_SceneManager:getTopScene()
	if runningScene and runningScene:getName() ~= "fight" then
		--关闭弹幕，弹出场景
	--	logWarn("G_BulletScreenManager:clearBulletLayer()")
		G_BulletScreenManager:clearBulletLayer()
		--G_UserData:getBulletScreen():setBulletScreenOpen(1, false)
	end
end

function GuildWarBattleView:_onEventGuildWarBattleInfoGet(event,cityId)
   --  logWarn("GuildWarBattleView ----------- _onEventGuildWarBattleInfoGet ")
    self._cityId = cityId
   
    self._nodeMapParent:removeAllChildren()
    local mapNode = GuildWarBattleMapNode.new(cityId )
    self._nodeMapParent:addChild(mapNode)
    self._mapNode  = mapNode

    
    self._guildWarNotice:clear()

    self:_restoreMapScaleState()

    self._guildWarAuctionHelper:setCityId( self._cityId)

    self:_refreshCityName()
    self:_refreshChangeCityBtn()
end

function GuildWarBattleView:_onEventGuildWarBattleInfoSyn(event)

end 

function GuildWarBattleView:_onEventGuildWarBattleMoveCamera(event,moving)
    --logWarn("GuildWarBattleView onEventGuildWarBattleMoveCamera"..tostring(moving))
    
    self._btnMagnifier:setEnabled(not moving)
end

function GuildWarBattleView:_onEventLoginSuccess()
    G_UserData:getGuildWar():c2sGetGuildWarWorld()

    local GuildWarConst = require("app.const.GuildWarConst")
    local status = GuildWarDataHelper.getGuildWarStatus()
	if status == GuildWarConst.STATUS_CLOSE then
        G_SceneManager:popScene()
        return 
    end
    local nextCityId = self._cityId
    G_UserData:getGuildWar():c2sEnterGuildWar(nextCityId)
end


function GuildWarBattleView:_onEventGuildWarAttackNotice(event,cityId,unit)
    if cityId ~= self._cityId then
        return
    end
    self._guildWarNotice:showMsg(unit)
end

function GuildWarBattleView:_onEventGuildWarBattleGoCampNotice(event,userData)

    if userData and userData:isSelf() then
         local callback = function()
            self._rebornCDNode:startCD()
           
         end

         callback()
         --local UIPopupHelper = require("app.utils.UIPopupHelper")
        -- UIPopupHelper.popupOkDialog(nil,Lang.get("guildwar_go_camp_dialog"),callback,Lang.get("common_btn_name_confirm"))
    end
end

function GuildWarBattleView:_startTimer()
	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
        return
	end
	self._refreshHandler = SchedulerHelper.newSchedule(handler(self,self._onRefreshTick),0.2)
end

function GuildWarBattleView:_endTimer()
	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._refreshHandler)
		self._refreshHandler = nil
	end
end

function GuildWarBattleView:_startFinishTimer()
    local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")
    local timeRegion = GuildWarDataHelper.getGuildWarTimeRegion()
    local endTime = timeRegion.endTime
    if endTime > G_ServerTime:getTime() then
        G_ServiceManager:registerOneAlarmClock("GuildWarAuctionHelper_Aution", endTime , function()
            G_BulletScreenManager:clearBulletLayer()
              self._mapNode:finishBattle()
        end)
    end
end

function GuildWarBattleView:_endFinishTimer()
    G_ServiceManager:DeleteOneAlarmClock("GuildWarAuctionHelper_Aution")
end
 

function GuildWarBattleView:_onMyPosClick()
    --取出我的位置
    self._mapNode:gotoMyPosition()
end


function GuildWarBattleView:_onChangeCityClick(sender)
    local pointId = sender:getTag()
    local GuildWarCheck = require("app.utils.logic.GuildWarCheck")
    local success = GuildWarCheck.guildWarCanExit(self._cityId )
    if success then
        G_SignalManager:dispatch(SignalConst.EVENT_GUILD_WAR_BATTLE_CHANGE_CITY,pointId)
    end
end

function GuildWarBattleView:_onRefreshTick(dt)
	self:_refreshTimeView()
    self:_refreshCdTimeView()
    
    local function finishCall( ... )
        -- body
         self._mapNode:gotoCamp()
        --self._mapNode:_cameraLock(true)
    end
    self._rebornCDNode:refreshCdTimeView(self._cityId,finishCall)

end

function GuildWarBattleView:_refreshTimeView() 
	local timeData = GuildWarDataHelper.getGuildWarNextOpeningTimeRegion()
	local curTime = G_ServerTime:getTime()
     if curTime >= timeData.startTime and curTime < timeData.time1 then
        local txt = G_ServerTime:getLeftSecondsString(timeData.time1, "00:00:00")
		self._textTimeTitle:setString(Lang.get("guildwar_prepare_downtime"))
		self._textTime:setString(txt)
        self._textTimeTitle:setPositionX(-40)
     elseif curTime >= timeData.time1 and curTime < timeData.endTime then
        local txt = G_ServerTime:getLeftSecondsString(timeData.endTime , "00:00:00")
		self._textTimeTitle:setString(Lang.get("guildwar_close_downtime"))	
		self._textTime:setString(txt)
        self._textTimeTitle:setPositionX(-40)
     else
        self._textTimeTitle:setString(Lang.get("guildwar_activity_finish"))	
		self._textTime:setString("")
        self._textTimeTitle:setPositionX(0)
     end
end

function GuildWarBattleView:_refreshCityName() 
    local config = GuildWarDataHelper.getGuildWarCityConfig( self._cityId)
    self._topbarBase:setTitle(config.name, 40, Colors.DARK_BG_THREE, Colors.DARK_BG_OUTLINE)
end

function GuildWarBattleView:_onBtnDanmu( ... )
	-- body
	--logWarn("CountryBossBigBossView:_onBtnDanmu")
	local bulletOpen = G_UserData:getBulletScreen():isBulletScreenOpen(BullectScreenConst.GUILD_WAR_TYPE)
	G_UserData:getBulletScreen():setBulletScreenOpen(BullectScreenConst.GUILD_WAR_TYPE, not bulletOpen)
	self:_updateBulletScreenBtn(BullectScreenConst.GUILD_WAR_TYPE)
end

function GuildWarBattleView:_updateBulletScreenBtn( bulletType )
	-- body
	self._danmuPanel:getSubNodeByName("Node_1"):setVisible(false)
	self._danmuPanel:getSubNodeByName("Node_2"):setVisible(false)
	local bulletOpen = G_UserData:getBulletScreen():isBulletScreenOpen(bulletType)
   -- logWarn("GuildWarBattleView updateBulletScreenBtn -------------  "..tostring(bulletType) )
	if bulletOpen == true then
		self._danmuPanel:getSubNodeByName("Node_1"):setVisible(true)
		G_BulletScreenManager:showBulletLayer()
		self._isBulletOpen = true
	else
		self._danmuPanel:getSubNodeByName("Node_2"):setVisible(true)
		G_BulletScreenManager:hideBulletLayer()
		self._isBulletOpen = false
	end
end

function GuildWarBattleView:_checkCountDown()
    self._nodeCountdownParent:removeAllChildren()
    local timeData = GuildWarDataHelper.getGuildWarNextOpeningTimeRegion()
	local curTime = G_ServerTime:getTime()
    if curTime >= timeData.startTime and curTime < timeData.time1 then
        local GuildWarCountdownNode = require("app.scene.view.guildwarbattle.GuildWarCountdownNode")

        local node =  GuildWarCountdownNode.new()
        self._nodeCountdownParent:addChild(node)
        node:startCountdown(timeData.time1)
    end
end

function GuildWarBattleView:_removeCountDown()
    self._nodeCountdownParent:removeAllChildren()
end


function GuildWarBattleView:_onClickLog(sender)
    local PopupGuildWarRecord = require("app.scene.view.guildwarbattle.PopupGuildWarRecord")
	local popup = PopupGuildWarRecord.new()
	popup:setName("PopupGuildWarRecord")
	popup:openWithAction()
end


function GuildWarBattleView:_onClickMagnifier(sender)
    self._isCameraFar = not self._isCameraFar
    if self._isCameraFar then
        self._mapNode:doScaleAnim(0)
    else
        self._mapNode:doScaleAnim(100)
    end
    
    self._btnMagnifier:updateUI(self._isCameraFar  and 
        FunctionConst.FUNC_GUILD_WAR_MAP_BIG  or 
        FunctionConst.FUNC_GUILD_WAR_MAP_SMALL 
        )
end

function GuildWarBattleView:_restoreMapScaleState()
   self._btnMagnifier:setEnabled(true)
   --self._mapNode:doScale(self._isCameraFar and 0 or 100 )
   self._mapNode:doScale(0)
end

function GuildWarBattleView:_refreshCdTimeView() 
    local guildWarUser = G_UserData:getGuildWar():getMyWarUser(self._cityId)
    local challengeTime = guildWarUser:getChallenge_time()
    local challengeCd = guildWarUser:getChallenge_cd()
    local maxCd = GuildWarDataHelper.getGuildWarTotalAtkCD()
    local curTime = G_ServerTime:getTime()
    if curTime <= challengeTime + challengeCd then
        local second = challengeTime + challengeCd - curTime
     
        self._textCdTitle:setVisible(true)
        self._textCdTime:setVisible(true)
        self._textCdTime:setString(Lang.get("guildwar_move_cd",{value = second}))

        if challengeCd >= maxCd then
             self._textCdTime:setColor(Colors.BRIGHT_BG_RED)
        else
             self._textCdTime:setColor(Colors.BRIGHT_BG_GREEN)    
        end

        self._showAttackCdEffect = true
    else
       self._textCdTitle:setVisible(true)
       self._textCdTime:setVisible(true)
       self._textCdTime:setColor(Colors.BRIGHT_BG_GREEN)    
       self._textCdTime:setString(Lang.get("guildwar_move_cd",{value = 0}))

        if self._showAttackCdEffect  then
			self._showAttackCdEffect = false
			self:_showCDFinishEffect(Lang.get("guildwar_attack_cd_finish_hint"))
		end

    end


    local moveTime = guildWarUser:getMove_time()
    local moveCD = GuildWarDataHelper.getGuildWarMoveCD() 
    if curTime <= moveTime + moveCD then
        self._showMoveCdEffect = true
    else
        if self._showMoveCdEffect  then
			self._showMoveCdEffect = false
			self:_showCDFinishEffect(Lang.get("guildwar_move_cd_finish_hint"))
		end
    end
end



function GuildWarBattleView:_showCDFinishEffect(content)

    local function effectFunction(effect)
            if effect == "gongke_txt" then 
                local fontColor = Colors.getSmallMineGuild()
                local label = cc.Label:createWithTTF(content, Path.getFontW8(), 52)
                label:setColor(fontColor) 
                label:enableOutline(cc.c3b(0xff, 0x78, 0x00), 2)
                return label                       
            end
        end
        local function eventFunction(event)
            if event == "finish" then
            end
        end
        G_EffectGfxMgr:createPlayMovingGfx( self._nodeEffectParent, "moving_gongkexiaocheng", effectFunction, eventFunction, true )

end


function GuildWarBattleView:_refreshChangeCityBtn()
    local pointId = GuildWarDataHelper.getExitPoint( self._cityId)
    if pointId then
        self._btnChangeCity:setTag(pointId)
        self._btnChangeCity:setVisible(true)
    else
         self._btnChangeCity:setVisible(false)    
    end
end

return GuildWarBattleView




