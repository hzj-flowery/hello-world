--奖励
local PopupBase = require("app.ui.PopupBase")
local PopupNextFunction = class("PopupNextFunction", PopupBase)
local CSHelper  = require("yoka.utils.CSHelper")

function PopupNextFunction:ctor(data)
	self._data = data
    self._resourceNode = self
    self:setName("PopupNextFunction")
	PopupNextFunction.super.ctor(self,nil,false,true)
end

function PopupNextFunction:onCreate()
	self._titleImagePath = Path.getNextFunctionOpen("img_newopen_jijiangzi")
	self:_createTouchLayer()
	local effectNode = self:_createEffectNode(self)

	local commonContinueNode = CSHelper.loadResourceNode(Path.getCSB("CommonContinueNode", "common"))
	commonContinueNode:setPositionY(-289)
	commonContinueNode:setVisible(false)
	self:addChild(commonContinueNode)
	self._commonContinueNode = commonContinueNode

	local PopupNextFunctionPopInfoNode = require("app.ui.PopupNextFunctionPopInfoNode")

	local nextInfoNode = PopupNextFunctionPopInfoNode.new(self._data)
	nextInfoNode:setPositionY(-10)
	self:addChild(nextInfoNode)
end

function PopupNextFunction:onEnter()

end

function PopupNextFunction:onClose( ... )
    -- body
end

function PopupNextFunction:onExit()

end


function PopupNextFunction:_createTouchLayer()
    --创建屏蔽层
    local numAlpha =  0.75
    local layerColor = cc.LayerColor:create(cc.c4b(0, 0, 0, 255*numAlpha))
    layerColor:setIgnoreAnchorPointForPosition(false)
    layerColor:setTouchMode(cc.TOUCHES_ONE_BY_ONE)
    layerColor:setTouchEnabled(true)
    layerColor:registerScriptTouchHandler(function(event,x,y)
        if event == "began" then
            return true
        elseif event == "ended" then
			self:close()
        end
    end)
    self:addChild(layerColor)
    self._layerColor = layerColor

end

function PopupNextFunction:_createActionNode(effect)

    if effect == "txt" then
        local txtSp = display.newSprite(self._titleImagePath)
        return txtSp
    elseif effect == "all_bg" then
         local bgSp = display.newSprite(Path.getUICommon("img_board_break03b"))

         return bgSp
    elseif effect == "button" then
         self._btn = self._commonContinueNode
         self._commonContinueNode:setVisible(true)
         return display.newNode()
    elseif effect == "txt_meirilibao" then
        return display.newNode()
    elseif effect == "txt_shuoming" then
        return display.newNode()
    end
end


function PopupNextFunction:_createEffectNode(rootNode)
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local TextHelper = require("app.utils.TextHelper")
    local function effectFunction(effect)
        if TextHelper.stringStartsWith(effect,"effect_") then
			local subEffect = EffectGfxNode.new(effect)
            subEffect:play()
            return subEffect
		else
			return self:_createActionNode(effect)
		end
    end
    local function eventFunction(event,frameIndex, movingNode)
        if event == "finish" then

        end
    end
   local node =  G_EffectGfxMgr:createPlayMovingGfx( rootNode, "moving_choujiang_hude", effectFunction, eventFunction , false )
   return node
end

return PopupNextFunction
