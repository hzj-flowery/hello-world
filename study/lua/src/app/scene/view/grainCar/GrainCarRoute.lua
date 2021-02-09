-- Description: 粮车路线箭头
-- Company: yoka
-- Author: chenzhongjie
-- Date: 2019-10-11
local ViewBase = require("app.ui.ViewBase")
local GrainCarRoute = class("GrainCarRoute", ViewBase)
local GrainCarArrow = require("app.scene.view.grainCar.GrainCarArrow")
local MineCraftHelper = require("app.scene.view.mineCraft.MineCraftHelper")
local GrainCarConfigHelper = require("app.scene.view.grainCar.GrainCarConfigHelper") 
local GrainCarDataHelper = require("app.scene.view.grainCar.GrainCarDataHelper") 
local LinkedList = require("app.utils.dataStruct.LinkedList")

GrainCarRoute.ARROW_WIDTH = 30


function GrainCarRoute:ctor()
    self:_initMember()

	local resource = {
		file = Path.getCSB("GrainCarRoute", "grainCar"),
		binding = {
            
		}
	}
	self:setName("GrainCarRoute")
	GrainCarRoute.super.ctor(self, resource)
end

function GrainCarRoute:onCreate()
end

function GrainCarRoute:onEnter()
    self:_updateData()
end

function GrainCarRoute:onExit()
end

function GrainCarRoute:onShowFinish()
end

function GrainCarRoute:_initMember()
	self._guildNode = {}			--guildId, node
	--guildId {
	-- mineId1 --链表
	--  {arrow} 
	--  {arrow}
	-- mineId2
	-- }
	self._guildArrow = {}			
end

function GrainCarRoute:_updateData()
    
end

--------------------------------------------------------------------------
-------------------------------外部方法------------------------------------
--------------------------------------------------------------------------
--创建路线
function GrainCarRoute:createRoute(carUnit)
	local guildId = carUnit:getGuild_id()
	local node = self:_getNodeWithGuildId(guildId)
	if not self:_hasCreatedRoute(guildId) then
		self:_createRouteWithCarUnit(node, carUnit)
	end
	if not carUnit:hasLaunched() then
		node:setVisible(false)
	end
end

--更新箭头
function GrainCarRoute:updateArrow(carUnit, percent)
	if carUnit:hasLaunched() then
		local node = self:_getNodeWithGuildId(carUnit:getGuild_id())
		node:setVisible(true)
	end
	local guildId = carUnit:getGuild_id()
	local minPit = carUnit:getCurPit()
	local arrowMineList = self._guildArrow[guildId]
	if not arrowMineList then
		return
	end

	local arrowList = arrowMineList[minPit]
	if not arrowList then
		return
	end
	--移除已经经过的点
	local firstNode = arrowList:getFirst()
	while firstNode do
		local arrow = firstNode.data
		if percent > arrow:getPercent() then
			arrow:removeFromParent(true)
			arrowList:remove(firstNode)
			firstNode = arrowList:getFirst()
		else
			break
		end
	end
	-- local i = 1
	-- while i < #arrowList do
	-- 	local arrow = arrowList[i]
	-- 	if percent > arrow:getPercent() then
	-- 		arrow:removeFromParent(true)
	-- 		table.remove(arrowList, i)
	-- 		i = i - 1
	-- 	else
	-- 		break
	-- 	end
	-- 	i = i + 1
	-- end
end

--移除路径层
function GrainCarRoute:removeRoute(carUnit)
	local guildId = carUnit:getGuild_id()
	if self._guildNode[guildId] then
		self._guildNode[guildId]:removeFromParent(true)
		self._guildNode[guildId] = nil
		self._guildArrow[guildId] = nil
	end
end

--删除已经经过的点
function GrainCarRoute:removePassed(carUnit)
	local guildId = carUnit:getGuild_id()
	local arrowMineList = self._guildArrow[guildId]
	if not arrowMineList then
		return
	end
	local passedMineIdList = carUnit:getRoute_passed()
	for index = 1, #passedMineIdList - 1 do
		--最后一个是当前位置 不删
		local arrowList = arrowMineList[passedMineIdList[index]]
		if arrowList then
			local function walk(node, arrow)
				arrow:removeFromParent(true)
			end
			arrowList:walkThrough(walk)
			-- for _, arrow in pairs(arrowList) do
			-- 	arrow:removeFromParent(true)
			-- end
			self._guildArrow[guildId][passedMineIdList[index]] = nil
		end
	end
end

--------------------------------------------------------------------------
-------------------------------方法---------------------------------------
--------------------------------------------------------------------------
function GrainCarRoute:_getNodeWithGuildId(guildId)
	local isMyGuild = GrainCarDataHelper.isMyGuild(guildId)
	local zOrder = isMyGuild and 1 or 0
	if not self._guildNode[guildId] then
		local node = cc.Node:create()
		self._node:addChild(node, zOrder)
		node:setPosition(cc.p(0, 0))
		self._guildNode[guildId] = node
	end
	return self._guildNode[guildId]
end

--是否创建过路线
function GrainCarRoute:_hasCreatedRoute(guildId)
	local node = self:_getNodeWithGuildId(guildId)
	return node:getChildrenCount() > 0
end

--创建完整路径
function GrainCarRoute:_createRouteWithCarUnit(node, carUnit)
	local guildId = carUnit:getGuild_id()
	local route = carUnit:getNextRouteList()
	for i = 1, #route - 1 do
		local pit1 = route[i]
		local pit2 = route[i + 1]
		self:_createRouteWith2Mine(node, pit1, pit2, guildId)
	end
end

--创建2个矿间的路线
function GrainCarRoute:_createRouteWith2Mine(node, minPit1, minPit2, guildId)
	local key = guildId
	if not self._guildArrow[guildId] then
		self._guildArrow[guildId] = {}
	end
	if not self._guildArrow[guildId][minPit1] then
		-- self._guildArrow[guildId][minPit1] = {}
		self._guildArrow[guildId][minPit1] = LinkedList.new() --链表
	end
	local arrowList = self._guildArrow[guildId][minPit1]

	local midPoints = G_UserData:getMineCraftData():getMidPoints()
    local midPoint = midPoints[minPit1..minPit2]
    if not midPoint then 
        midPoint = midPoints[minPit2..minPit1]
    end
    assert(midPoint, "not midPoint between "..minPit1.."and"..minPit2)
    local startData = G_UserData:getMineCraftData():getMineDataById(minPit1):getConfigData()
    local startPos = cc.p(startData.x, startData.y)

    local endData = G_UserData:getMineCraftData():getMineDataById(minPit2):getConfigData()
    local endPos = cc.p(endData.x, endData.y)

    local bezier =  {
            cc.p(0, 0),
            cc.pSub(midPoint, startPos),
            cc.pSub(endPos, startPos),
		}

	local isMyGuild = GrainCarDataHelper.isMyGuild(guildId)
	self:_createRouteWith2Point(bezier, node, startPos, endPos, arrowList, isMyGuild)

end

--2个点间的坐标
function GrainCarRoute:_createRouteWith2Point(bezier, node, startPos, endPos, arrowList, isMyGuild)
	local diffY = math.abs( endPos.y - startPos.y )
	local diffX = math.abs( endPos.x - startPos.x )
	local distance = math.sqrt( diffX * diffX + diffY * diffY )
	local loop = math.ceil(distance / GrainCarRoute.ARROW_WIDTH) 
	if isMyGuild then
		loop = loop + 1
	end
	for i = 1, loop do
		local percent = i / loop
		local posx, posy, angle = MineCraftHelper.getBezierPosition(bezier, percent)
		local arrow = GrainCarArrow.new(isMyGuild)
		node:addChild(arrow)
		
		local pos = cc.pAdd(startPos, cc.p(posx, posy))
		arrow:setPosition(pos)
		arrow:setRotation(angle)

		arrow:setPercent(percent)
		-- table.insert(arrowList, arrow)
		local node = LinkedList.node(arrow)
		arrowList:addAtTail(node)
	end
end



return GrainCarRoute