


local ViewBase = require("app.ui.ViewBase")
local GuildWarEnemyListNode = class("GuildWarEnemyListNode", ViewBase)
local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")
local GuildWarConst = require("app.const.GuildWarConst")

GuildWarEnemyListNode.REFRESH_CD = 3

function GuildWarEnemyListNode:ctor(cityId )
    self._cityId = cityId
    self._pointId = nil

    self._listData = {}
    self._reportInfo = nil

    self._nodeContent = nil
    self._imageBg = nil
    self._listView = nil
    self._imageArrow = nil
    self._imageArrowBg = nil
    self._isFold = false

    self._textCdTitle = nil
    self._textTime = nil
    self._textPointName = nil
    self._lastRefreshTime = 0
    self._roleInPoint = false
    self._pointChanged = false
    self._buildConfig = nil

	local resource = {
		file = Path.getCSB("GuildWarEnemyListNode", "guildwarbattle"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
             _imageArrowBg = {
				events = {{event = "touch", method = "_onButtonArrow"}}
			},
		}
	}
	GuildWarEnemyListNode.super.ctor(self, resource)
end

function GuildWarEnemyListNode:onCreate()
    local GuildWarEnemyItemCell = require("app.scene.view.guildwarbattle.GuildWarEnemyItemCell")
    cc.bind(self._listView,"CommonScrollView2")
	self._listView:setTemplate(GuildWarEnemyItemCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
    self._listView:setRemoveChildren(false)
end

function GuildWarEnemyListNode:onEnter()
   -- logWarn("GuildWarEnemyListNode ----------- onEnter ")
    self:_startTimer()
    self._signalGuildWarBattleInfoSyn = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_BATTLE_INFO_SYN, handler(self, self._onEventGuildWarBattleInfoSyn))
    self._signalGuildWarReportNotice = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_REPORT_NOTICE, handler(self, self._onEventGuildWarReportNotice ))
    self._signalGuildWarBattleInfoGet = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_BATTLE_INFO_GET,
         handler(self,self._onEventGuildWarBattleInfoGet ))
    
    self._signalGuildWarBattleAvatarStateChange = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_BATTLE_AVATAR_STATE_CHANGE,
         handler(self,self._onEventGuildWarBattleAvatarStateChange ))

     self._signalGuildWarBattleGoCampNotice = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_BATTLE_GO_CAMP_NOTICE,
         handler(self,self._onEventGuildWarBattleGoCampNotice))

    self._signalGuildWarPointChange = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_POINT_CHANGE,
         handler(self,self._onEventGuildWarPointChange))
     
         
    self._signalGuildWarUserChange = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_USER_CHANGE,
        handler(self, self._onEventGuildWarUserChange))

    self._signalGuildWarBuildingChange = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_BUILDING_CHANGE,
        handler(self, self._onEventGuildWarBattleBuildingChange))


    self:_saveHeight()

    self:_refreshData()
    self:_refreshView()

    self:_checkWindowState()

    self:_refreshTimeView()
end

function GuildWarEnemyListNode:onExit()
    self:_endTimer()
    if self._signalGuildWarBattleInfoSyn then
        self._signalGuildWarBattleInfoSyn:remove()
        self._signalGuildWarBattleInfoSyn = nil
    end
   
    if self._signalGuildWarReportNotice then
         self._signalGuildWarReportNotice:remove()
         self._signalGuildWarReportNotice = nil
    end

    if self._signalGuildWarBattleInfoGet then
        self._signalGuildWarBattleInfoGet:remove()
        self._signalGuildWarBattleInfoGet = nil
    end    

    if self._signalGuildWarBattleAvatarStateChange then
        self._signalGuildWarBattleAvatarStateChange:remove()
        self._signalGuildWarBattleAvatarStateChange = nil
    end
    if self._signalGuildWarBattleGoCampNotice then
        self._signalGuildWarBattleGoCampNotice:remove()
        self._signalGuildWarBattleGoCampNotice = nil
    end

    if self._signalGuildWarPointChange then
        self._signalGuildWarPointChange:remove()
        self._signalGuildWarPointChange = nil
    end

    if self._signalGuildWarUserChange then
        self._signalGuildWarUserChange:remove()
        self._signalGuildWarUserChange = nil
    end

    if self._signalGuildWarBuildingChange then
        self._signalGuildWarBuildingChange:remove()
        self._signalGuildWarBuildingChange = nil
    end


end


function GuildWarEnemyListNode:_onEventGuildWarBattleInfoGet(event,cityId)
    self._cityId = cityId
    -- logWarn("GuildWarEnemyListNode ----------- _onEventGuildWarBattleInfoGet ")
    self:_refreshData()
    self:_refreshView()
end


function GuildWarEnemyListNode:_onEventGuildWarBattleInfoSyn(event)
    --[[
     self:_refreshData() 
     self:_refreshView()
     ]]
end


function GuildWarEnemyListNode:_onEventGuildWarReportNotice(event,message)
    local isWin = rawget(message,"is_win")
    local userId = rawget(message,"user_id")

    --[[
    --找到UserID的Item播放刀光效果
    local index = self:_findIndexById(userId)
    local item = self._listView:getItemByTag(index)
if item then 
        item:playAttackEffect()
    end
    ]]
end

function GuildWarEnemyListNode:_onEventGuildWarBattleAvatarStateChange(event,userData,newState,oldState)
   -- logWarn("GuildWarEnemyListNode ----------------  StateChange")    
    local GuildWarRunAvatorNode = require("app.scene.view.guildwarbattle.GuildWarRunAvatorNode")

    --[[
    -- EVENT_GUILD_WAR_POINT_CHANGE
    if oldState == GuildWarRunAvatorNode.RUN_STATE then 
        self:_refreshView()
    end
    ]]

     if userData and userData:isSelf() then
        local show = newState ==  GuildWarRunAvatorNode.STAND_STATE
            or newState ==  GuildWarRunAvatorNode.ATTACK_STATE
        self._roleInPoint = show
       -- logWarn("GuildWarEnemyListNode ----------------  "..tostring(show))  

        self._pointChanged = true
        if self:_isCanRefreshList() then
            self:_updateList()
        end


        if not show then
            self:_hide(true)
        elseif show and oldState == GuildWarRunAvatorNode.RUN_STATE then
            if self:_isCamp()  then
                 self:_hide(true)
            else
                 self:_show()
            end
           
        end


     end
   
end

function GuildWarEnemyListNode:_onEventGuildWarBattleGoCampNotice(event,userData)
    if userData and userData:isSelf() then
        self:_hide(true)
    end
end


function GuildWarEnemyListNode:_onEventGuildWarUserChange(event,cityId,changedUserMap)
    local userId = G_UserData:getBase():getId()
    if changedUserMap[userId] then
        self:_refreshData()
        self:_refreshView()
    end
end

function GuildWarEnemyListNode:_onEventGuildWarPointChange(event,cityId,changedPointMap,changedUserMap)
    if self._cityId == cityId and self._pointId and changedPointMap[self._pointId ] then
          self._pointChanged = true
          if self:_isCanRefreshList() then
             self:_updateList()
          end
    end
end

function GuildWarEnemyListNode:_onEventGuildWarBattleBuildingChange(event,cityId,changedBuildingMap)
    if self._cityId == cityId and self._pointId and changedBuildingMap[self._pointId ] then
        self._pointChanged = true
        if self:_isCanRefreshList() then
            self:_updateList()
        end
    end
end


function GuildWarEnemyListNode:_startTimer()
	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
        return
	end
	self._refreshHandler = SchedulerHelper.newSchedule(handler(self,self._onRefreshTick),0.2)
end

function GuildWarEnemyListNode:_endTimer()
	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._refreshHandler)
		self._refreshHandler = nil
	end
end

function GuildWarEnemyListNode:_isCamp()
    local config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(self._cityId,self._pointId )
    if config.point_type == GuildWarConst.POINT_TYPE_CAMP_ATTACK or 
       config.point_type == GuildWarConst.POINT_TYPE_CAMP_DEFENDER  then
        return true
    end
     return false
end

function GuildWarEnemyListNode:_updateList()
    local time = G_ServerTime:getTime()
    self._lastRefreshTime = time
    self._pointChanged = false
    self._buildConfig = nil
    if not self._roleInPoint then
         self._listData = {}
    elseif self:_isCamp()  then
         self._listData = {}
    else
        self._listData = G_UserData:getGuildWar():getOtherGuildWarUserList( self._cityId,self._pointId)
        local need = GuildWarDataHelper.isNeedAttackBuild(self._cityId,self._pointId)
        if need then
             self._buildConfig = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(self._cityId,self._pointId)
        end
       
    end
    
    local size = #self._listData + (self._buildConfig and 1 or 0)


	self._listView:clearAll()
    self._listView:resize(size)
    self._listView:jumpToTop()

    if size > 0 and self._roleInPoint and self._isFold == true then
        self:_setWindowState(false)
    end

    --列表框显示逻辑
    if size == 0 then
        self._nodeContent:setVisible(false)
        return
    elseif size == 1 then
        self._panelList:setContentSize(cc.size(277,92))
        self._listView:setPositionY(92)
        self._listView:setTouchEnabled(false)
        self._imageBg:setContentSize(cc.size(277,391 - 66 - 92 - 92))
    elseif size == 2 then
        self._panelList:setContentSize(cc.size(277,184))
        self._listView:setPositionY(184)
        self._listView:setTouchEnabled(false)
        self._imageBg:setContentSize(cc.size(277,391 - 66 - 92))
    elseif size == 3 then
        self._panelList:setContentSize(cc.size(277,276))
        self._listView:setPositionY(276)
        self._listView:setTouchEnabled(false)
        self._imageBg:setContentSize(cc.size(277,391 -66))
    elseif size >= 4 then
        self._panelList:setContentSize(cc.size(277,340))
        self._listView:setPositionY(340)
        self._listView:setTouchEnabled(true)
        self._imageBg:setContentSize(cc.size(277,391))
    end
     self._nodeContent:setVisible(true)
end

function GuildWarEnemyListNode:_onItemUpdate(item, index)
    if self._buildConfig then
        if index == 0 then
            item:updateBuildingUI(self._cityId,self._buildConfig)
            return 
        end
        index = index - 1
    end
     if self._listData[index + 1] then
        item:updateUI(self._listData[index + 1])
    end
    
end

function GuildWarEnemyListNode:_onItemSelected(item, index)
end

function GuildWarEnemyListNode:_onItemTouch(index,warUserData,buildConfig)
    if index == 0 and (self._buildConfig or buildConfig) then
        local config = self._buildConfig or buildConfig
        local GuildWarCheck = require("app.utils.logic.GuildWarCheck")
        local success = GuildWarCheck.guildWarCanAttackPoint(self._cityId,config.point_id,false,true)
        if success then
            G_UserData:getGuildWar():c2sGuildWarBattleWatch(config.point_id)
        end
        return 
    end

    if not warUserData then
        return
    end
    local GuildWarCheck = require("app.utils.logic.GuildWarCheck")
    local nowGuildWarUser = G_UserData:getGuildWar():getWarUserById(
             warUserData:getCity_id(), warUserData:getUser_id()
    )
    if not nowGuildWarUser then
        return
    end
       
    local success = GuildWarCheck.guildWarCanAttackUser(self._cityId,nowGuildWarUser,true)
    if success then
        local myGuildWarUser = G_UserData:getGuildWar():getMyWarUser(self._cityId)
       -- self._reportInfo = {attackUser = clone(myGuildWarUser),beAttackUser = clone(warUserData) }
        local userId = warUserData:getUser_id()
        G_UserData:getGuildWar():c2sGuildWarBattleUser(userId)
    end

end

function GuildWarEnemyListNode:_refreshData()
    local guildWarUser = G_UserData:getGuildWar():getMyWarUser(self._cityId)
    local pointId  = guildWarUser:getCurrPoint()
    local nowPointId =  guildWarUser:getNow_point()
    self._roleInPoint = pointId ~= 0
    self._pointId = nowPointId
    self._pointChanged = false
end

function GuildWarEnemyListNode:_refreshView()

    self:_updateList()
   
    self:_refreshName()
end

function GuildWarEnemyListNode:_closeWindow(fold)
    --[[
    self:stopAllActions()
    self._nodeContent:setVisible(true)
    local posY = self:getPositionY()
    local posX = self._imageArrowBg:getPositionX()
    local callAction = cc.CallFunc:create(function()
        self._imageArrow:setScale(fold and -1 or 1)
        self._nodeContent:setVisible(not fold)
	end)
	local action = cc.MoveTo:create(0.3,cc.p(fold and  math.abs(posX) or 0,posY))
	local runningAction = cc.Sequence:create(action,callAction)
	self:runAction(runningAction)
    ]]
end

function GuildWarEnemyListNode:_onButtonArrow(sender)
    self._isFold = not self._isFold
    self:_closeWindow(self._isFold)
end

function GuildWarEnemyListNode:_hide(showAnim)
    if showAnim then
        if not self._isFold then
            self._isFold = true
            self:_closeWindow(self._isFold)
        end
    else
         self:_setWindowState(true)
    end
end

function GuildWarEnemyListNode:_show()
   if #self._listData > 0 then
        self:_setWindowState(false)
   end
  
end

function GuildWarEnemyListNode:_setWindowState(isClose)
    --[[
    self:stopAllActions()
    self._isFold = isClose
    local posX = self._imageArrowBg:getPositionX()
    self:setPositionX(self._isFold and math.abs(posX) or 0)
    self._imageArrow:setScale( self._isFold and -1 or 1)
    self._nodeContent:setVisible(not self._isFold)
    ]]
end


function GuildWarEnemyListNode:_checkWindowState(isFold)
    local guildWarUser = G_UserData:getGuildWar():getMyWarUser(self._cityId)
    local pointId  = guildWarUser:getCurrPoint()
    if pointId ~= 0 and not self:_isCamp() then
        self:_setWindowState(false)   
    else    
        self:_setWindowState(true)    
    end
end


function GuildWarEnemyListNode:_onRefreshTick(dt)
	self:_refreshTimeView()
    --self:_checkListUpdate()
end

function GuildWarEnemyListNode:_refreshTimeView() 
    local guildWarUser = G_UserData:getGuildWar():getMyWarUser(self._cityId)
    local challengeTime = guildWarUser:getChallenge_time()
    local challengeCd = guildWarUser:getChallenge_cd()
    local maxCd = GuildWarDataHelper.getGuildWarTotalAtkCD()
    local curTime = G_ServerTime:getTime()
    if curTime <= challengeTime + challengeCd then
        local second = challengeTime + challengeCd - curTime
     
        self._textCdTitle:setVisible(true)
        self._textTime:setVisible(true)
        self._textTime:setString(Lang.get("guildwar_move_cd",{value = second}))

        if challengeCd >= maxCd then
             self._textTime:setColor(Colors.BRIGHT_BG_RED)
        else
             self._textTime:setColor(Colors.BRIGHT_BG_GREEN)    
        end

    else
       self._textCdTitle:setVisible(true)
       self._textTime:setVisible(true)
       self._textTime:setColor(Colors.BRIGHT_BG_GREEN)    
       self._textTime:setString(Lang.get("guildwar_move_cd",{value = 0}))
    end
end

function GuildWarEnemyListNode:_refreshName()
    local config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(self._cityId,self._pointId )
    self._textPointName:setString(config.name)
end


function GuildWarEnemyListNode:_findIndexById(userId)
	if not self._listData then
		return nil
	end
	for k,v in ipairs( self._listData) do
		if v:getUser_id() == userId then
			return k
		end
	end
	return nil
end


function GuildWarEnemyListNode:_checkListUpdate() 
    if self:_isCanRefreshList() then
         self:_updateList()
    end
end

function GuildWarEnemyListNode:_isCanRefreshList() 
    if not self._roleInPoint or not self._pointChanged then
        return false
    end
    --[[
    local time = G_ServerTime:getTime()
    if self._lastRefreshTime + GuildWarEnemyListNode.REFRESH_CD >= time then
        return false
    end
    ]]
    return true
end

function GuildWarEnemyListNode:_saveHeight()
    self._size1 = self._imageBg:getContentSize()
    self._size2 = self._listView:getContentSize()
end

return GuildWarEnemyListNode 
