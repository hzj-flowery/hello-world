local MainEffectNode = class("MainEffectNode")


function MainEffectNode:ctor(target)
    self._target = target
    self:_createBackgroudEffectNode(target._nodeEffect_01)
    --self:_createForegroundEffectNode(target._nodeEffect_02)
end

function MainEffectNode:_createBackgroudEffectNode(effectRootNode)
	local TextHelper = require("app.utils.TextHelper")
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
		return display.newNode()  
    end
    local function eventFunction(event,frameIndex,movingNode)
        if event == "finish" then	 	 	
        end
    end
   local node =  G_EffectGfxMgr:createPlayMovingGfx( effectRootNode, "moving_newzhucheng_front", effectFunction, eventFunction , false )
   return node
end

function MainEffectNode:_createForegroundEffectNode(effectRootNode)
	local TextHelper = require("app.utils.TextHelper")
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        if TextHelper.stringStartsWith(effect,"effect_") then
            local subEffect = EffectGfxNode.new(effect)
            subEffect:play()
            return subEffect
        elseif TextHelper.stringStartsWith(effect,"qizi")  then    
            local spineEffect = require("yoka.node.SpineNode").new()
            spineEffect:setAsset(Path.getEffectSpine("zhuchengqizipiao"))
            spineEffect:setAnimation("qizi",true)
            return spineEffect
		else
			return display.newNode()  
		end
    end
    local function eventFunction(event,frameIndex,movingNode)
        if event == "finish" then	 	 	
        end
    end
   local node =  G_EffectGfxMgr:createPlayMovingGfx( effectRootNode, "moving_zhucheng_middle", effectFunction, eventFunction , false )
   return node
end

return MainEffectNode