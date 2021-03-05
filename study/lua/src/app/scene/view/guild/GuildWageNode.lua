local ViewBase = require("app.ui.ViewBase")
local GuildWageNode = class("GuildWageNode", ViewBase)
local UserDataHelper = require("app.utils.UserDataHelper")

GuildWageNode.ACT_COLOR_IMGS = {"img_guild_huoyue_b02","img_guild_huoyue_b03","img_guild_huoyue_b04","img_guild_huoyue_b05","img_guild_huoyue_b06"}

function GuildWageNode:ctor()
	self._textActivePercent = nil--活跃百分比
	self._textActiveEvaluate = nil--活跃评价
	self._textActiveDayNum = nil--活跃天数
	self._textGuildPosition = nil--军团位置
	self._panelClip = nil--裁剪
	self._wageItem01 = nil
	self._wageItem02 = nil
	self._itemNodes = {}
	self._taskNodes = {}
	local resource = {
		file = Path.getCSB("GuildWageNode", "guild"),
		binding = {			
		}
	}
	GuildWageNode.super.ctor(self, resource)
end

function GuildWageNode:onEnter()
	self._signalGuildBaseInfoUpdate = G_SignalManager:add(SignalConst.EVENT_GUILD_BASE_INFO_UPDATE, handler(self, self._onEventGuildBaseInfoUpdate))
	self._signalGuildGetUserGuild = G_SignalManager:add(SignalConst.EVENT_GUILD_GET_USER_GUILD, handler(self, self._onEventGuildGetUserGuild))
end

function GuildWageNode:onExit()
	self._signalGuildBaseInfoUpdate:remove()
	self._signalGuildBaseInfoUpdate = nil
	self._signalGuildGetUserGuild:remove()
	self._signalGuildGetUserGuild = nil
end

function GuildWageNode:onCreate()
	self._itemNodes = {self._wageItem01,self._wageItem02}
	self._taskNodes = {self._imageAct,self._imageHelpAct,self._imageBossAct,
		self._imageGuildFightAct,self._imageStageAct,self._imageAskHelpAct
	}
	
	self._commonHelp:updateLangName("HELP_GUILD_WAGE")
end

function GuildWageNode:updateView()
	self:_updateContent()
	G_UserData:getGuild():c2sGetGuildBase()	
end


function GuildWageNode:_updateContent()
	local userGuildInfo = G_UserData:getGuild():getUserGuildInfo()
	local myGuild = G_UserData:getGuild():getMyGuild()
	local items = myGuild:getWeekWageItems()
	local dayNum = myGuild:getActive_days()
	local userMemberData = G_UserData:getGuild():getMyMemberData()
	local myPosition = userMemberData:getPosition()
	local duties = UserDataHelper.getGuildDutiesName(myPosition)
	local activePercent = UserDataHelper.getGuildTotalActivePercent()
	local activeColor = UserDataHelper.getGuildTotalActiveColor()
	for k,v in ipairs(self._itemNodes) do
		local item = items[k]
		if item then
			v:unInitUI()
			v:initUI(item.type,item.value,item.size)
		end
	end
	self._textActiveEvaluate:setString(Lang.get("guild_task_active_evaluate_arr")[activeColor])
	for k,v in ipairs(self._taskNodes) do
		local taskData = myGuild:getGuildTaskUnitData(k)
		self:_updateTaskItem(v,taskData)
	end
	self._textGuildPosition:setString(duties)
	
	self._textActiveDayNum:setString(Lang.get("guild_active_day_num",{value = 
		dayNum
	}))
	
	self._textActivePercent:setString(Lang.get("guild_task_active_percent",{value =
		activePercent
	 }))

	 
	 local pList = self:_getClipPoints()
	self:createClippingNode(pList)
end

function GuildWageNode:_updateTaskItem(node,taskData)
	local text = ccui.Helper:seekNodeByName(node, "Text")
	local textName = ccui.Helper:seekNodeByName(node, "Text_0")
	
	local config = taskData:getConfig()
    local people = taskData:getPeople()
    local maxPeople = config.max_active
	local actColor = 1
	for k = 5, 1 ,-1 do
		if people >= config["color"..k]  then
			actColor = k
			break
		end
	end
	node:setTag(actColor)
	node:loadTexture(Path.getGuildRes(GuildWageNode.ACT_COLOR_IMGS[actColor]))
	if config.is_open == 1 then
		text:setString(Lang.get("common_progress_2",{curr = people,max = maxPeople}))
	else
		text:setString(Lang.get("common_function_not_open"))	
	end
	textName:setString(config.name)
end

function GuildWageNode:_getClipPoints()
	local radius = 159
	local minLen = 30--最小长度
	local pList = {}--创建点
	local activeAngle = {120,180,240,300,0,60}
	local myGuild = G_UserData:getGuild():getMyGuild()
	for k,v in ipairs(self._taskNodes) do
		local taskData = myGuild:getGuildTaskUnitData(k)
		local config = taskData:getConfig()
		local people = taskData:getPeople()
	
		local maxPeople = config.max_active
		local len = people * (radius-minLen)/maxPeople + minLen
		local p = {x = 0,y = 0}
		local ao = activeAngle[k]
		p.x = len  *   math.cos(ao   *   3.14   /180   ) 
		p.y = len  *   math.sin(ao   *   3.14   /180   ) 
		table.insert(pList,p)
	end
	return pList
end	

function GuildWageNode:createClippingNode(p)
	local drawNode = cc.DrawNode:create()
	self._panelClip:removeAllChildren()
	--[[
	local children = self._panelClip:getChildren()
	local p = {}
	for k,v in ipairs(children) do
		local posX,poxY = v:getPosition()
		table.insert(p,{x = posX,y = poxY})
	end
	]]
	--凹多边形绘制不出来，需要转换成三角形绘制
	--drawNode:drawPolygon(p, #p, cc.c4f(1, 1, 1, 1), 0, cc.c4f(0, 0, 0, 0))
	local result = {}
	local Triangulate = require("app.utils.Triangulate")
	Triangulate.Process(p,result) 
    local tcount = #result/3
    for  i=1, tcount, 1 do
        local p1 = result[(i-1)*3+1]
        local p2 = result[(i-1)*3+2]
        local p3 = result[(i-1)*3+3]
        drawNode:drawTriangle(p1, p2, p3, cc.c4f(1, 1, 1, 1))--当前类继承drawnode  
    end 
	dump(result)


	local stencil = cc.Node:create()
	stencil:addChild(drawNode)
	

	local clipObject =  display.newSprite(Path.getGuildRes("img_guild_gongzi01"))

	local clippingNode = cc.ClippingNode:create()
	clippingNode:setStencil(stencil)  
	clippingNode:addChild(clipObject)

	clippingNode:setInverted(false)
	clippingNode:setAlphaThreshold(1)
	clippingNode:setName("clippingNode")
	
	local size = self._panelClip:getContentSize()
	clippingNode:setPosition(size.width*0.5,size.height*0.5)

	self._panelClip:addChild(clippingNode)

	local linePointDrawNode = cc.DrawNode:create()
	for k,v in ipairs(p) do
		if p[k+1] then
			linePointDrawNode:drawSegment( p[k],  p[k+1], 1.5,cc.c4f(1, 0.72,0.04, 1))
		else
			linePointDrawNode:drawSegment( p[k],  p[1], 1.5,cc.c4f(1, 0.72, 0.04, 1))	
		end
		linePointDrawNode:drawDot(v,5, cc.c4f(1,0.72, 0.04, 1))
	end
	self._panelClip:addChild(linePointDrawNode)
	--[[
	local drawNode2 = cc.DrawNode:create()
	drawNode2:drawPolygon(p, #p, cc.c4f(1, 1, 1, 1), 0, cc.c4f(0, 0, 0, 0))
	self._panelClip:addChild(drawNode2)
	]]
end

function GuildWageNode:_onEventGuildBaseInfoUpdate(event)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	self:_updateContent()
end

function GuildWageNode:_onEventGuildGetUserGuild(event)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	self:_updateContent()
end



return GuildWageNode