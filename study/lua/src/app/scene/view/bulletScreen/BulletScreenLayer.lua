--BulletScreenLayer
--弹幕系统界面

local BulletScreenLayer = class("BulletScreenLayer", cc.Layer)
local BulletScreenHelper = require("app.scene.view.bulletScreen.BulletScreenHelper")
local BullectScreenConst = require("app.const.BullectScreenConst")

local BulletMotionPosition = class("BulletMotionPosition")
function BulletMotionPosition:retain() self._isUsed = true end
function BulletMotionPosition:release() self._isUsed = false end
function BulletMotionPosition:getPos() return self._pos end
function BulletMotionPosition:setPos(pos) self._pos = pos end
function BulletMotionPosition:isUsed() return self._isUsed end


function BulletScreenLayer:ctor()
	self:loadPosition()
end

function BulletScreenLayer:onCreate()
   
end

function BulletScreenLayer:onEnter()

end

function BulletScreenLayer:onExit()

end

function BulletScreenLayer:getPositionList()
	-- body
	local retList = {}
	for index=1, 6 do 
		local positionDesc = BulletScreenHelper.getParameter("boss_coordinate_"..index)
		local posX, posY = unpack( string.split( positionDesc, "|") )
		local position = cc.p(tonumber(posX), tonumber(posY))
		table.insert(retList, position)
	end
	return retList
end


function BulletScreenLayer:getMidPosList( )
	-- body
	local positionDesc = BulletScreenHelper.getParameter("boss_coordinate_baofa")
	local posList =  string.split( positionDesc, "|") 

	local retList = {}
	for i, value in ipairs(posList) do
		local posX, posY =  unpack( string.split( value, ",") )
		local position = cc.p(tonumber(posX), tonumber(posY))
		table.insert(retList, position)
	end
	
	return retList
end

function BulletScreenLayer:loadPosition()
	self._positions = {}
	local retList = self:getPositionList()
	for i , value in ipairs(retList) do 
		local position =  value
		local bulletPos  = BulletMotionPosition.new()
		bulletPos:setPos(position)
		bulletPos:release()
		self._positions[i] = bulletPos
	end
	self._posIndex = 0
	self._middlePositions = self:getMidPosList()
	self._posMidIndex = 0

	--上一条弹幕的缓存时间
	self._cacheTopBulletTime = {}
end

function BulletScreenLayer:getUnusedMidPos( ... )
	self._posMidIndex = self._posMidIndex + 1
	if self._posMidIndex > #self._middlePositions then
		self._posMidIndex = 1
	end
	return self._middlePositions[self._posMidIndex]
end

function BulletScreenLayer:getUnusedPos( ... )
	for i, value in ipairs(self._positions) do
		if value:isUsed() == false then
			return value
		end
	end
end

function BulletScreenLayer:clear()
	self:removeAllChildren()
	self:clearPosition()
end

function BulletScreenLayer:clearPosition()
	self._positions = {}
	self:loadPosition()
end


--中间显示的文字
function BulletScreenLayer:pushMiddleRichText(richText,dealyTime, snType)
	print("dealyTime "..dealyTime)
	local motionType = BullectScreenConst.ACTION_MIDDLE
	local richWidget = self:createRichText(richText)

	self:addChild(richWidget)
	richWidget:setVisible(false)

	-- 获取实际node的rect
	local bulletNodeRect = richWidget:getCascadeBoundingBox()
	local pos = self:getUnusedMidPos()
	
	dump(pos)
    
    if snType == BullectScreenConst.GACHA_GOLDENHERO_TYPE or
        snType == BullectScreenConst.GUILDCROSSWAR_TYPE then
        richWidget:setPosition(cc.p(G_ResolutionManager:getDesignWidth()/2, G_ResolutionManager:getDesignHeight()/2))
    else
        richWidget:setPosition(cc.p(G_ResolutionManager:getDesignWidth()/2, pos.y))
    end

	local function eventFunction(event, frameIndex, effectNode)
        if event == "finish" then
            effectNode._node:runAction(cc.RemoveSelf:create())
        end
	end
	richWidget:setAnchorPoint(cc.p(0.5,0.5))

	dealyTime = dealyTime or BulletScreenHelper.getBulletShowTime()
	richWidget:runAction(cc.Sequence:create(
		-- 随机延迟
		cc.DelayTime:create(dealyTime),
		cc.Show:create(),
		cc.CallFunc:create(function()
			local effect = G_EffectGfxMgr:applySingleGfx(richWidget, "smoving_danmu", eventFunction, nil, nil)
		end)
	))
end

function BulletScreenLayer:createRichText( richContents )
	-- body
	local label = ccui.RichText:create()
	label:setRichText(richContents)
	label:setAnchorPoint(cc.p(0.0,0.0))
	label:setCascadeOpacityEnabled(true)
	label:ignoreContentAdaptWithSize(true)
	label:formatText()
	return label
end

--顶部跑马灯显示的文字
function BulletScreenLayer:pushTopRichText(richText,delayTime,noticeColor, way)
	local position = self:getUnusedPos()
	if position == nil then
		return false
	end

	local motionType = BullectScreenConst.TYPE_UNIFORM
	local richWidget = self:createRichText(richText)

	richWidget:setPosition(position:getPos())
	position:retain()

	--richWidget:setName("BulletLine"..index)
	self:addChild(richWidget)
	richWidget:setVisible(false)

	-- 获取实际node的rect
	local bulletNodeRect = richWidget:getCascadeBoundingBox()
	local time = BulletScreenHelper.getParameterTime()
	local width = G_ResolutionManager:getDesignWidth()
	local speed = width / time
	local calcDelayTime =  ( bulletNodeRect.width + BulletScreenHelper.getBulletShowDistance() ) / speed

	delayTime = delayTime or 0
    local showAction = cc.Show:create()
    if way and way > 0 then                                     -- 1. 新控制模式
        if rawequal(way, BullectScreenConst.SHOWTYPE_POPUP_CENTER) then
            showAction = nil
        end
    else                                                        -- 0. 默认模式
        if noticeColor and noticeColor >= BullectScreenConst.COLOR_TYPE_4 then
            showAction = nil
        end
    end
	local seq1 = cc.Sequence:create(
			-- 随机延迟
			cc.DelayTime:create(delayTime),
			showAction,
			BulletScreenHelper.action(motionType == 0 and math.random(4) or motionType, -bulletNodeRect.width,time),
			cc.RemoveSelf:create())

	local seq2 = cc.Sequence:create(
			cc.DelayTime:create(calcDelayTime),
			cc.CallFunc:create(function()
				position:release()
			end))
			
	richWidget:runAction(cc.Spawn:create(seq1,seq2))

	return true
end

return BulletScreenLayer