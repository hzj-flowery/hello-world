
-- Author: Liangxu
-- Date: 2017-06-15 14:17:28
local ViewBase = require("app.ui.ViewBase")
local GuildMainView = class("GuildMainView", ViewBase)
local UserDataHelper = require("app.utils.UserDataHelper")
local PopupGuildHall = require("app.scene.view.guild.PopupGuildHall")
local GuildConst = require("app.const.GuildConst")
local ParameterIDConst = require("app.const.ParameterIDConst")
local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
local RedPointHelper = require("app.data.RedPointHelper")
local GuildCityNode = require("app.scene.view.guild.GuildCityNode")
local LogicCheckHelper  = require("app.utils.LogicCheckHelper")

local CrossWorldBossHelper = require("app.scene.view.crossworldboss.CrossWorldBossHelper")

GuildMainView.ZORDER_CITY = 2000--城市的zorder



GuildMainView.MAP_RES =  {
		{path = "ui3/stage/guild_sky.jpg",x = 0,y = 480,anchorPoint = cc.p(0.5,1),layer = 1},
		{path = "ui3/stage/guild_farground.png",layer = 3},
		{path = "juntuan_back",layer = 3},
		{path = "ui3/stage/guild_mountain.png",x = -852,y = 40,anchorPoint = cc.p(0,0.5),layer = 5},
		{path = "juntuan_back2",layer = 7},
		{path = "ui3/stage/guild_midground.png",layer = 7,main = true},
		{path = "juntuan_middle",layer = 7},
		{path = "juntuan_front",layer = 9}
}

GuildMainView.MAP_LAYER_DATA = {
	[1] = {differ = 300},
	[3] = {differ = 200},
	[5] = {differ = 100},
	[7] = {differ = 0},
	[9] = {differ = 0},
}

GuildMainView.MAP_LAYER_CITY = 8

--等服务器回包后，创建对话框并弹出UI
function GuildMainView:waitEnterMsg(callBack)
	local function onMsgCallBack()
		callBack()
	end
	local msgReg = G_SignalManager:add(SignalConst.EVENT_GUILD_QUERY_MALL, onMsgCallBack)
	G_UserData:getGuild():c2sQueryGuildMall()----我的军团职位信息需要从大厅或成员列表消息获取
	return msgReg
end

function GuildMainView:ctor(buildId)
	self._cityNodes = {}
	self._touchFlag = nil--是否点击了建筑
	self._openBuildId = buildId
	self._panelFlagTouch = nil
	self._scene = nil
	local resource = {
		file = Path.getCSB("GuildMainView", "guild"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_panelFlagTouch = {
				events = {{event = "touch", method = "_onClickGuildFlag"}}
			},		
		}
		
	}
	GuildMainView.super.ctor(self, resource)
end

function GuildMainView:onCreate()
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_GUILD)
--	self._topbarBase:setBGType(2)--使用长文字底图

	self._scrollBG:setScrollBarEnabled(false)
	self:_createMapView()



end

function GuildMainView:onEnter()
	self._signalRedPointUpdate = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self,self._onEventRedPointUpdate))
	self._signalGuildBaseInfoUpdate = G_SignalManager:add(SignalConst.EVENT_GUILD_BASE_INFO_UPDATE, handler(self, self._onEventGuildBaseInfoUpdate))
	self._signalGuildKickNotice = G_SignalManager:add(SignalConst.EVENT_GUILD_KICK_NOTICE, handler(self, self._onEventGuildKickNotice))
	self._signalCommonZeroNotice = G_SignalManager:add(SignalConst.EVENT_COMMON_ZERO_NOTICE, handler(self, self._onEventCommonZeroNotice))
	self._signalDismissSuccess = G_SignalManager:add(SignalConst.EVENT_GUILD_DISMISS_SUCCESS, handler(self, self._dismissSuccess))
	self._signalGuildDungeonMonsterGet = G_SignalManager:add(SignalConst.EVENT_GUILD_DUNGEON_MONSTER_GET, handler(self, self._onEventGuildDungeonMonsterGet))


	if not G_UserData:getGuild():isInGuild() then
		G_SceneManager:popScene()
		return
	end

	self:_updateInfo()
	self:_refreshCityView()
	self:_refreshCityRedPoint()


	if self._openBuildId  then
		self:openBuild(self._openBuildId)
		self._openBuildId  = nil
	end


	G_UserData:getGuild():c2sGetGuildBase()	


	if G_UserData:getGuild():isExpired() == true then
        G_UserData:getGuild():pullData()
    end


end	

function GuildMainView:onExit()
	self._signalRedPointUpdate:remove()
	self._signalRedPointUpdate =nil
	self._signalGuildBaseInfoUpdate:remove()
	self._signalGuildBaseInfoUpdate = nil
	self._signalGuildKickNotice:remove()
	self._signalGuildKickNotice = nil
	self._signalCommonZeroNotice:remove()
	self._signalCommonZeroNotice = nil
	self._signalDismissSuccess:remove()
	self._signalDismissSuccess = nil
	self._signalGuildDungeonMonsterGet:remove()
	self._signalGuildDungeonMonsterGet = nil
end

function GuildMainView:_onEventCommonZeroNotice(event,hour)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	--if G_UserData:getGuild():isExpired() == true then
        G_UserData:getGuild():pullData()
        --return
    --end
end

function GuildMainView:_onEventGuildDungeonMonsterGet(event)
	
	if not UserDataHelper.hasGuildDungeonMonsterData() then
		--服务器没有怪物数据
		local stageOpenNum = UserDataHelper.getParameter(G_ParameterIDConst.GUILD_STAGE_OPENNUM )
	    G_Prompt:showTip(Lang.get("guilddungeon_not_open_as_member_num",{value = stageOpenNum}))
	else
		G_SceneManager:showScene("guilddungeon")
	end
end

--[[
function GuildMainView:_updateNotice()
	local announcement = UserDataHelper.getGuildAnnouncement()
	self._textNotice:setString(announcement)
end
]]
function GuildMainView:_updateInfo()
	local myGuild = G_UserData:getGuild():getMyGuild()
	assert(myGuild, "G_UserData:getGuild():getMyGuild() = nil")
	local name = myGuild:getName()
	local level = G_UserData:getGuild():getMyGuildLevel()--myGuild:getLevel()
	local exp = G_UserData:getGuild():getMyGuildExp()--myGuild:getExp()

	local needExp = UserDataHelper.getGuildLevelUpNeedExp(level)
	local names = UserDataHelper.getGuildLeaderNames()

	self._textGuidName:setString(name)
	self._textGuidLevel:setString(Lang.get("guild_maincity_level", {level = level}))
	self._loadingBarProgress:setPercent(exp / needExp * 100)
	self._textProgress:setString(exp.."/"..needExp)
	self._topbarBase:setTitle(name,40, Colors.DARK_BG_THREE, Colors.DARK_BG_OUTLINE)
	
	self:_updateFlagColor()
end

function GuildMainView:_updateFlagColor() 
    local myGuild = G_UserData:getGuild():getMyGuild()
	assert(myGuild, "G_UserData:getGuild():getMyGuild() = nil")
	local name = myGuild:getName()
    local icon = myGuild:getIcon()
    self._commonGuildFlag:updateUI(icon,name)
end

function GuildMainView:openBuild(buildId)
	if not LogicCheckHelper.checkGuildModuleIsOpen(buildId) then
		return
	end
	if buildId == GuildConst.CITY_HALL_ID then
		self:_onButtonHallClicked()
	elseif buildId== GuildConst.CITY_HELP_ID then	
		self:_onButtonHelpClicked()
	elseif buildId == GuildConst.CITY_SHOP_ID then	
		self:_onButtonShopClicked()
	elseif buildId == GuildConst.CITY_BOSS_ID then	
		self:_onButtonBossClicked()	
	elseif buildId == GuildConst.CITY_CONTRIBUTION_ID then		
		self:_onButtonContribution()
	elseif buildId == GuildConst.CITY_DUNGEON_ID then
		self:_onButtonDungeon()
	elseif buildId == GuildConst.CITY_GUILD_WAR_ID then	
		self:_onButtonGuildWar()
	else
		G_Prompt:showTip(Lang.get("common_tip_function_not_open"))		
	end
end

--大厅
function GuildMainView:_onButtonHallClicked()
	local popup = PopupGuildHall.new()
	popup:setAllowHide(false)
	popup:openWithAction()
end

--援助
function GuildMainView:_onButtonHelpClicked()
	G_SceneManager:showScene("guildHelp",true)
end


--商店
function GuildMainView:_onButtonShopClicked()
	WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_GUILD_SHOP)
end

--军团BOSS
function GuildMainView:_onButtonBossClicked()
	if CrossWorldBossHelper.checkShowCrossBoss() then
		WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_CROSS_WORLD_BOSS)
	else
		WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_WORLD_BOSS)
	end
end

--军团贡献
function GuildMainView:_onButtonContribution(sender)
	local PopupGuildContribution = require("app.scene.view.guild.PopupGuildContribution")
	local popup = PopupGuildContribution.new()
	popup:openWithAction()
end

--军团副本
function GuildMainView:_onButtonDungeon(sender)
	--判断时间

	--[[
	--这里的成员人数指的是生成副本数据时的人数，客户端没法判断
	local success,popFunc = LogicCheckHelper.checkGuildDungeonHasEnoughMember()
	if not success then
		return 
	end
	if not UserDataHelper.hasGuildDungeonMonsterData() then
		G_UserData:getGuildDungeon():c2sGetGuildDungeon()
	else
		G_SceneManager:showScene("guilddungeon")
    end
	]]
	G_UserData:getGuildDungeon():c2sGetGuildDungeon()
end

function GuildMainView:_onButtonGuildWar(sender)
	WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_GUILD_WAR)  
end

function GuildMainView:_onClickGuildFlag(sender)
	local UserDataHelper = require("app.utils.UserDataHelper")
	local userMemberData = G_UserData:getGuild():getMyMemberData()
	local myPosition = userMemberData:getPosition()
	local showFlag = UserDataHelper.isHaveJurisdiction(myPosition,GuildConst.GUILD_JURISDICTION_14 ) 
	if not showFlag then
		return 
	end
	local PopupGuildFlagSetting = require("app.scene.view.guild.PopupGuildFlagSetting")
	local popup = PopupGuildFlagSetting.new()
	popup:openWithAction()
end


function GuildMainView:_refreshCityRedPoint()
	for k,v in ipairs(self._cityNodes) do
	 	local hasRedPoint = false
		local cityData = v:getCityData()
		if cityData.id == GuildConst.CITY_HALL_ID then
			hasRedPoint = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP,"hallRP")
		elseif cityData.id == GuildConst.CITY_HELP_ID then	
			hasRedPoint = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP,"helpRP")
		elseif cityData.id == GuildConst.CITY_CONTRIBUTION_ID then	
			hasRedPoint = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP,"contributionRP")	
		elseif cityData.id == GuildConst.CITY_DUNGEON_ID then	
			hasRedPoint = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP,"dungeonRP")		
		end
		v:refreshRedPoint(hasRedPoint)
	end
end

function GuildMainView:_refreshCityView()
	for k,v in ipairs(self._cityNodes) do
		v:refreshCityView()
	end
end

function GuildMainView:_onEventGuildBaseInfoUpdate(event)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	self:_updateInfo()
	self:_refreshCityView()
end

function GuildMainView:_onEventRedPointUpdate(event,funcId,param)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	if not funcId or funcId == FunctionConst.FUNC_ARMY_GROUP then
		self:_refreshCityRedPoint()
	end
end

--踢出事件
function GuildMainView:_onEventGuildKickNotice(event,uid)
	if uid == G_UserData:getBase():getId() then--被踢玩家是自己
		local GuildUIHelper = require("app.scene.view.guild.GuildUIHelper")
		GuildUIHelper.noticeBeKickGuild()
	end
end

function GuildMainView:_createMapView()
	local innerContainer = self._scrollBG:getInnerContainer()
	--local newMap = cc.Sprite:create(Path.getStageBG("guild_bg"))
    --newMap:setAnchorPoint(cc.p(0, 0))


	local ViewBase = require("app.ui.ViewBase")
	local sceneNode = ViewBase.new(nil,nil,cc.size(1704,960))
	sceneNode:updateSceneByRes(GuildMainView.MAP_RES ,GuildMainView.MAP_LAYER_DATA )

	innerContainer:addChild(sceneNode)
	

	self._scene = sceneNode
	local size = sceneNode:getSceneSize()
	self._scrollBG:setInnerContainerSize(cc.size(size.width,size.height))--newMap:getContentSize()
	self._scrollBG:addTouchEventListener(handler(self, self._onScrollViewTouchCallBack))
	self._scrollBG:addEventListener(handler(self, self._moveLayerTouch))

	local cityRootNode = cc.Node:create()
	local ccPoint = cc.p(-size.width*0.5, -size.height*0.5)
	cityRootNode:setPosition(ccPoint)
	self._scene:getEffectLayer(GuildMainView.MAP_LAYER_CITY ):addChild(cityRootNode)

	local GuildBuildPostion = require("app.config.guild_build_postion")
	for i = 1,GuildBuildPostion.length(),1 do
		local config = GuildBuildPostion.indexOf(i)
		local icon = GuildCityNode.new(config,handler(self,self._onCityClick))
    	cityRootNode:addChild(icon,math.ceil(GuildMainView.ZORDER_CITY-config.postion_y))
	
		table.insert( self._cityNodes, icon )
	end

	self:_moveToMapPos(829,504)--聚焦坐标位置
end



function GuildMainView:_moveToMapPos(x,y)
	local scrollX = - (x - math.min(1136, display.width) * 0.5)
	local scrollY = - (y - math.min(640, display.height) * 0.5)
	local innerContainer = self._scrollBG:getInnerContainer()
	innerContainer:setPosition(scrollX,scrollY)

	self._scene:onMoveEvent(scrollX)
end

--屏幕滚动事件
function GuildMainView:_moveLayerTouch()
    local innerContainer = self._scrollBG:getInnerContainer()
    local posX = innerContainer:getPositionX()
    self._scene:onMoveEvent(posX)
end


function GuildMainView:_onCityClick(sender,cityData)
	if self._touchFlag then
		return
	end
	self._touchFlag = true
	self:openBuild(cityData.id)
end

function GuildMainView:_onScrollViewTouchCallBack(sender,state)
	logWarn(state.."..._onScrollViewTouchCallBack")
	if state == ccui.TouchEventType.ended or state == ccui.TouchEventType.canceled then
		self._touchFlag = false
	end
end

function GuildMainView:_dismissSuccess()
	--TODO功能跳转，出现多个主城
	G_Prompt:showTip(Lang.get("guild_tip_dismiss_success"))
	G_SceneManager:backToMain()
end

return GuildMainView