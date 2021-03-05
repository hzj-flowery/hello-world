local Gameground = class("Gameground", function()
	return cc.Node:create()
end)

local FightConfig = require("app.fight.Config")
local FightSignalConst = require("app.fight.FightSignalConst")
local FightSignalManager = require("app.fight.FightSignalManager")
--
function Gameground:ctor()

if FightConfig.drawRefLine then
	self._debugLayer = self:createDebugLayer()
	self:addChild(self._debugLayer)
end

	self._unitLayer = cc.Node:create()
	self:addChild(self._unitLayer)

	self._tipLayer = cc.Node:create()
	self:addChild(self._tipLayer)

	self._layerBlack = nil
end

function Gameground:addActor(actor)
	self._unitLayer:addChild(actor)
end

function Gameground:removeActor(actor)
	self._unitLayer:removeChild(actor)
	actor = nil		--赋值
end

function Gameground:removeActorByName(name)
	self._unitLayer:removeChildByName(name)
end


function Gameground:addTipView(view)
	self._tipLayer:addChild(view)
end

--掉落物品
function Gameground:addDrop(stageId, awards)
	for i, v in pairs(awards) do
	-- local box = cc.Sprite:create("icon/common/baoxiangjin_kai.png")
		local dropIcon = require("app.ui.component.ComponentIconHelper").createIcon(v.type, v.value, v.size)
		dropIcon:setTouchEnabled(false)
		local camp = math.floor(stageId / 100)
		local cell = stageId % 100
		local position = cc.p(FightConfig.getIdlePosition(camp, cell))
		position.y = position.y + FightConfig.GAME_GROUND_FIX
		dropIcon:setLocalZOrder(-checkint(position.y))
		local fix = (i-1)*55
		position.x = position.x + fix
		dropIcon:setPosition(position)
		dropIcon:setScale(0.8)
		self._unitLayer:addChild(dropIcon)
		local function itemDropFinish(node)
			local action1 = cc.Spawn:create(cc.MoveTo:create(0.4, cc.p(-520, 360)),cc.ScaleTo:create(0.6, 0.2))
			local action2 = cc.RemoveSelf:create()
			local action3 = cc.CallFunc:create(function() self:_itemMoveFinish() end)
			local action = cc.Sequence:create(action1, action3, action2)
			node:runAction(action)
		end
		G_EffectGfxMgr:applySingleGfx(dropIcon, "smoving_wupindiaoluo", function() itemDropFinish(dropIcon) end , nil, nil)
	end
end

function Gameground:_itemMoveFinish()
	FightSignalManager.getFightSignalManager():dispatchSignal(FightSignalConst.SIGNAL_DROP_ITEM)
end

function Gameground:createDebugLayer()
	local layer = cc.Layer:create()

	local drawNode = cc.DrawNode:create()
	--
	drawNode:drawLine(cc.p(FightConfig.cells[1][4][1], FightConfig.cells[1][4][2]), 
					  cc.p(FightConfig.cells[2][4][1], FightConfig.cells[2][4][2]), cc.c4f(1, 0, 0, 1))
	drawNode:drawLine(cc.p(FightConfig.cells[1][5][1], FightConfig.cells[1][5][2]), 
					  cc.p(FightConfig.cells[2][5][1], FightConfig.cells[2][5][2]), cc.c4f(1, 0, 0, 1))
	drawNode:drawLine(cc.p(FightConfig.cells[1][6][1], FightConfig.cells[1][6][2]), 
					  cc.p(FightConfig.cells[2][6][1], FightConfig.cells[2][6][2]), cc.c4f(1, 0, 0, 1))

	drawNode:drawLine(cc.p(FightConfig.cells[1][3][1], FightConfig.cells[1][3][2]), 
					  cc.p(FightConfig.cells[1][1][1], FightConfig.cells[1][1][2]), cc.c4f(1, 0, 0, 1))
	drawNode:drawLine(cc.p(FightConfig.cells[1][6][1], FightConfig.cells[1][6][2]), 
					  cc.p(FightConfig.cells[1][4][1], FightConfig.cells[1][4][2]), cc.c4f(1, 0, 0, 1))
	drawNode:drawLine(cc.p(0, FightConfig.cells[1][1][2]), 
					  cc.p(0, FightConfig.cells[1][3][2]), cc.c4f(1, 0, 0, 1))
	drawNode:drawLine(cc.p(FightConfig.cells[2][3][1], FightConfig.cells[2][3][2]), 
					  cc.p(FightConfig.cells[2][1][1], FightConfig.cells[2][1][2]), cc.c4f(1, 0, 0, 1))
	drawNode:drawLine(cc.p(FightConfig.cells[2][6][1], FightConfig.cells[2][6][2]), 
					  cc.p(FightConfig.cells[2][4][1], FightConfig.cells[2][4][2]), cc.c4f(1, 0, 0, 1))

	drawNode:drawPoint(cc.p(0,0), 20, cc.c4f(0, 0, 1, 1))
	--
	for ci,cv in ipairs(FightConfig.cells) do
		for i,v in ipairs(cv) do
			if i <= 6 then
				local p = {
					{x=v[1]-FightConfig.cellWidth, y=v[2]+FightConfig.cellWidth},
					{x=v[1]+FightConfig.cellWidth, y=v[2]+FightConfig.cellWidth},
					{x=v[1]+FightConfig.cellWidth, y=v[2]-FightConfig.cellWidth},
					{x=v[1]-FightConfig.cellWidth, y=v[2]-FightConfig.cellWidth}
				}
				drawNode:drawPolygon(p, 4, cc.c4f(1, 0, 1, 0), 1, cc.c4f(0, 1, 0, 1))
				drawNode:drawPoint(cc.p(v[1],v[2]), 20, cc.c4f(0, 0, 1, 1))
			end
		end
	end
	
    layer:addChild(drawNode)
    return layer
end

function Gameground:showLayerBlack(s)
    if not self._layerBlack then
        self._layerBlack = cc.LayerColor:create(cc.c4b(0, 0, 0, 255*FightConfig.BLACK_LAYER_ALPHA))
        self._layerBlack:setAnchorPoint(0.5,0.5)
		self._layerBlack:setPositionY(self._layerBlack:getPositionY()+FightConfig.GAME_GROUND_FIX)
        self._layerBlack:setIgnoreAnchorPointForPosition(false)
		self._layerBlack:setLocalZOrder(FightConfig.ZORDER_BLACK_LAYER)
        self._unitLayer:addChild(self._layerBlack)
    end
	self._layerBlack:setVisible(s)
end

return Gameground