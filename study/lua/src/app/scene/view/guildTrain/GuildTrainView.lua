local ViewBase = require("app.ui.ViewBase")
local GuildTrainView = class("GuildTrainView", ViewBase)

local GuildTrainTeamNode = require("app.scene.view.guildTrain.GuildTrainTeamNode")
local SchedulerHelper = require("app.utils.SchedulerHelper")
local UIConst = require("app.const.UIConst")
local Parameter = require("app.config.parameter")
local ParameterIDConst = require("app.const.ParameterIDConst")
local FunctionConst = require("app.const.FunctionConst")
local Role = require("app.config.role")

function GuildTrainView:ctor()
	self._countDownHandler = nil
	self._expPromtHandle = nil
	self._autoEnd = false
	self._forceEnd = false

	self._myTeamNode = nil
	self._myTeamInfo = nil
	self._oldOtherTeam = {}
	self:setName("guildTrain")

	local resource = {
		file = Path.getCSB("GuildTrainView", "guildTrain"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {

		},
	}
	GuildTrainView.super.ctor(self, resource,109)
end

function GuildTrainView:onCreate()
	self._topbarBase:setImageTitle("txt_sys_yanwuchang")
	self._topbarBase:setItemListVisible(false)
	self._topbarBase:hideBG()
	self._topbarBase:setCallBackOnBack(handler(self,self.onButtonBack))
	self._btnRule:updateUI(FunctionConst.FUNC_GUILD_TRAIN)
	self._expGap = tonumber(Parameter.get(ParameterIDConst.TRAIN_PERCENT_EXP).content) -- 经验tick 时间间隔
	self._currentExp = G_UserData:getBase():getExp()
	G_UserData:getGuild():setTrainEndState(false)

	self:_createTeamNode()
	self:_createOthersNode()

	self:_updateMyTeamView()
	self:_updateOthersView()
end

function GuildTrainView:_createTeamNode( ... )
	self._myTeamNode = GuildTrainTeamNode.new(self._teamNode)
end

function GuildTrainView:_createOthersNode( ... )
	self._oldOtherTeam = {}
	for index=1,8 do
		local teamNode = GuildTrainTeamNode.new(self["_teamNode"..index])
		table.insert(self._oldOtherTeam,teamNode)
	end
end

function GuildTrainView:_updateMyTeamView(  )
	self._myTeamInfo = G_UserData:getGuild():getMyGuildTrainTeamInfo()
	self._myTeamNode:updateUI(self._myTeamInfo)
end


function GuildTrainView:_updateOthersView( ... )
	self._otherInfo = {}
	self._otherInfo = G_UserData:getGuild():getOtherGuildTrainTeamInfo()


	for i=1,8 do
		if self._otherInfo[i].first ~= nil or self._otherInfo[i].second ~= nil then
			self._oldOtherTeam[i]:setVisible(true)
			self:_updateOthersViewWithIndex(i)
		else
			self._oldOtherTeam[i]:setVisible(false)
		end
	end

end

function GuildTrainView:_updateOthersViewWithIndex( index )
	local trainInfo = self._otherInfo[index]
	self._oldOtherTeam[index]:updateUI(trainInfo)
end


function GuildTrainView:_createEndEffect()
    local function effectFunction(effect)
        if effect == "gongke_txt" then
            local fontColor = Colors.getSmallMineGuild()
            local content = ""
            local trainType = G_UserData:getGuild():getGuildTrainType()
            if trainType == 1 then
            	content = Lang.get("guild_end_mm_string")
            elseif trainType == 2 then
            	content = Lang.get("guild_end_mo_string")
            elseif trainType == 3 then
            	content = Lang.get("guild_end_om_string")
            end

            local label = cc.Label:createWithTTF(content, Path.getFontW8(), 52)
			label:setColor(fontColor)
			label:enableOutline(cc.c3b(0xff, 0x78, 0x00), 2)
            return label
        end
    end
    local function eventFunction(event)
        if event == "finish" then
            self:hide()
            --升级检查
			local UserCheck = require("app.utils.logic.UserCheck")
			UserCheck.isLevelUp()
        end
    end
    G_EffectGfxMgr:createPlayMovingGfx( self._effectNode, "moving_gongkexiaocheng", effectFunction, eventFunction, true )
end

function GuildTrainView:hide( ... )
	if self._effectNode ~= nil then
		self._effectNode:setVisible(false)
	end
end

function GuildTrainView:onButtonBack( ... )
	if not G_UserData:getGuild():getTrainEndState() then
		-- local content = Lang.get("guild_exit_tanin")
		-- local function okCallback( ... )
		-- 	G_UserData:getGuild():c2sEndGuildTrain()
		-- end

		-- local popup = require("app.ui.PopupAlert").new(Lang.get("guild_exit_train_alert"), content, okCallback, nil,nil)
		-- popup:setBtnStr(Lang.get("guild_self_tanin_ok"),Lang.get("guild_self_tanin_concel"))
		-- popup:openWithAction()
		G_Prompt:showTipOnTop(Lang.get("guild_exit_tanin_forbid"))
	else
		G_SceneManager:popScene()
	end
end

function GuildTrainView:onEnter()
	self._signalGuildTrainAutoEnd = G_SignalManager:add(SignalConst.EVENT_GUILD_TRAIN_AUTO_END, handler(self, self._onEventGuildTrainAutoEnd))
	self._signalGuildTrainForceEnd = G_SignalManager:add(SignalConst.EVENT_GUILD_TRAIN_FORCE_END, handler(self, self._onEventGuildTrainFroceEnd))
	self._signalGuildTrainUpdate = G_SignalManager:add(SignalConst.EVENT_GUILD_TRAIN_UPDATE, handler(self, self._onEventGuildTrainUpdate))
	self._signalGuildGetNotify = G_SignalManager:add(SignalConst.EVENT_GET_TRAIN_NOTIFY, handler(self, self._onEventGetTrainNotify))
	self._signalDeadNetwork = G_SignalManager:add(SignalConst.EVENT_NETWORK_DEAD, handler(self, self._onDeadNetwork)) -- 弱网检测
	if not G_UserData:getGuild():getTrainEndState() then
		self:_startTick()
		self:_timeTick()
		self:_expPromtTick()
	end
end

function GuildTrainView:_onEventGuildTrainAutoEnd( eventId, data )

	self._autoEnd = true
	self:_endExpPromtTick()
	self._myTeamNode:stopAniAndSound()
	self:_createEndEffect()
	-- G_UserData:getGuild():setTrainEndState(true)

	self:_stopTick()
	if data ~= nil then
		local index = 1
		local trainType = G_UserData:getGuild():getGuildTrainType()
		-- 强制退出时 收到这条协议 肯定是对方走了   退出的是对方的位置
		if trainType == 2 then -- 传给别人   自己在一号位
			index = 2
		elseif trainType == 3 then -- 传给自己  自己在二号位
			index = 1
		end
		local myIndex = 3 - index

		local lvOld = G_UserData:getBase():getOldPlayerLevel()
		if data < G_UserData:getGuild():getGuildTrainTotalExp(lvOld,myIndex) then
			self._myTeamNode:myTeamExit(index)
			local teamName = ""
			if index == 1 then
				teamName = self._myTeamInfo.first:getName()
			elseif index == 2 then
				teamName = self._myTeamInfo.second:getName()
			end
			G_Prompt:showTipOnTop(string.format(Lang.get("guild_end_train_by_other"),teamName))
		end
	end
end

function GuildTrainView:getMyNodeIndex( ... )
	local index = 1
	local trainType = G_UserData:getGuild():getGuildTrainType()

	-- 强制退出时 收到这条协议 肯定是对方走了   退出的是对方的位置
	if trainType == 2 then -- 传给别人   自己在一号位
		index = 2
	elseif trainType == 3 then -- 传给自己  自己在二号位
		index = 1
	end
	local myIndex = 3 - index
	return myIndex
end


-- 在演武场中接收到邀请
function GuildTrainView:_onEventGetTrainNotify( event,message )
	self._autoEnd = false
	self._forceEnd = false
	-- G_UserData:getGuild():setTrainEndState(false)

	self:_updateMyTeamView()

    if self._countDownHandler then
        SchedulerHelper.cancelSchedule(self._countDownHandler)
        self._countDownHandler = nil
    end
    self:_endExpPromtTick()
	self:_startTick()
end

function GuildTrainView:_onEventGuildTrainFroceEnd( eventId,message )
	self._autoEnd = false
	self._forceEnd = true
	G_SceneManager:popScene()
	G_UserData:getGuild():c2sQueryGuildMall()
end

function GuildTrainView:_onEventGuildTrainUpdate( eventId,message )
	if not self._forceEnd then

		self:_updateOthersView()

		local myFirstUid = self._myTeamInfo.first ~= nil and self._myTeamInfo.first:getUser_id() or 0
		local mySecondUid = self._myTeamInfo.second ~= nil and self._myTeamInfo.second:getUser_id() or 0

		if self._autoEnd then
			for k,v in pairs(self._otherInfo) do
				local otherFirstUid = v.first ~= nil and v.first:getUser_id() or 1
				local otherSecondUid = v.second ~= nil and v.second:getUser_id() or 1

				if otherFirstUid == myFirstUid or myFirstUid == otherSecondUid then
					self._myTeamNode:myTeamExit(1)
				elseif otherFirstUid == mySecondUid or otherFirstUid == mySecondUid then
					self._myTeamNode:myTeamExit(2)
				end
			end
		end
	end
end


function GuildTrainView:_onDeadNetwork()
	self:endTrainByDeadNet()
	self:_stopTick()
	G_Prompt:showTipOnTop(Lang.get("guild_end_by_net"))
end

function GuildTrainView:endTrainByDeadNet( ... )
    if self._autoEnd == false then   -- 断线重连处理
    	G_UserData:getGuild():setTrainEndState(true)
		self._autoEnd = true
		self:_endExpPromtTick()
		self._myTeamNode:stopAniAndSound()
    end
end


function GuildTrainView:onExit()
    if self._countDownHandler then
        SchedulerHelper.cancelSchedule(self._countDownHandler)
        self._countDownHandler = nil
    end
    self:_endExpPromtTick()
	self._signalGuildTrainAutoEnd:remove()
	self._signalGuildTrainAutoEnd = nil
	self._signalGuildTrainForceEnd:remove()
	self._signalGuildTrainForceEnd = nil
	self._signalGuildTrainUpdate:remove()
	self._signalGuildTrainUpdate = nil
	self._oldOtherTeam = {}
	self._signalGuildGetNotify:remove()
	self._signalGuildGetNotify = nil
	self._signalDeadNetwork:remove()
	self._signalDeadNetwork = nil

	self._autoEnd = false
	self._myTeamInfo = nil
end


function GuildTrainView:_startTick( ... )
    self._myTeamNode:setTimeLabelVisible(true)
    self._progressLabel:setVisible(true)


    local trainIime = G_UserData:getGuild():getTrainTime()
    local endTime = trainIime.endTime

    self._totalTime = endTime - G_ServerTime:getTime()
    self._countDownHandler = SchedulerHelper.newSchedule(handler(self, self._timeTick), 1)

    self._expPromtHandle = SchedulerHelper.newSchedule(handler(self, self._expPromtTick), self._expGap)
end

function GuildTrainView:_expPromtTick( ... )
	self._myTeamNode:playExpAnimation()
end


function GuildTrainView:_endExpPromtTick( ... )
    if self._expPromtHandle then
        SchedulerHelper.cancelSchedule(self._expPromtHandle)
        self._expPromtHandle = nil
    end
end


function GuildTrainView:_timeTick( ... )
    if self._totalTime > 0 then
	    if not G_NetworkManager:isConnected() then
	    	self:_onDeadNetwork()
	    end
        self._totalTime = self._totalTime - 1
        self._myTeamNode:setTimeLabelString(self._totalTime.."s")

	    local userBase = G_UserData:getBase()
	    local myIndex = self:getMyNodeIndex()
	    self._currentExp = self._currentExp + G_UserData:getGuild():getGuildPercentExpByOneS(userBase:getLevel(),myIndex)
	    local roleData  = Role.get( userBase:getLevel() )
	    if roleData then
	    	local value = self._currentExp / roleData.exp
	    	if value > 1 then
					if  (userBase:getLevel()+ 1) > self:getMaxLevel() then
						value = 1
					else
	    			self._currentExp = self._currentExp - roleData.exp -- 溢出来的经验值
	    			value = self._currentExp / Role.get( userBase:getLevel() + 1 ).exp
					end
	    	end
	      local percent = math.floor(value * 100)
	      self._progressLabel:getSubNodeByName("text2"):setString(percent.."%")
	    end
    else
        self:_stopTick()
    end
end

function GuildTrainView:getMaxLevel()
	local paramContent = require("app.config.parameter").get(ParameterIDConst.PLAYER_DETAIL_LEVEL_LIMIT).content
	local valueList = string.split(paramContent, ",")
	local UserCheck = require("app.utils.logic.UserCheck")
	local minDay = 1000000
	local maxDay = 0
	local maxLv  = 0
	local maxDlv = 0
	for i, value in ipairs(valueList) do
		local day, level = unpack(string.split(value, "|"))
		local currLevel = tonumber(level)
		local currDay = tonumber(day)
		if currDay > maxDay then
			maxDay = currDay
			maxDlv = currLevel
		end
		if UserCheck.enoughOpenDay(currDay) then
			if currDay < minDay then
				minDay = currDay
				maxLv = currLevel
			end
		end
	end
	if UserCheck.enoughOpenDay(maxDay) then
		return maxDlv
	else
		return maxLv
	end
end





function GuildTrainView:_stopTick( ... )
    if self._countDownHandler then
        SchedulerHelper.cancelSchedule(self._countDownHandler)
        self._myTeamNode:setTimeLabelVisible(false)
        -- self._progressLabel:setVisible(false)
        self._countDownHandler = nil
    end
end


return GuildTrainView
