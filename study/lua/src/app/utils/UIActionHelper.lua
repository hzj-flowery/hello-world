-- UIActionHelper
-- UI动画帮助模块
-- 主要是一些通用的UI动画效果，由这边封装，方便其他模块使用

local UIActionHelper = {}


local ACTION_ID = {}
ACTION_ID["playTipEffect"] = 1001

--播放上下浮动动画
function UIActionHelper.playFloatEffect( node )
	-- body
	if not node then return end

	--不需要重复执行
	if node:getActionByTag(678) then
		return
	end

	local action1 = cc.MoveBy:create(0.75, cc.p(0, 8))
	local fade1 = cc.FadeTo:create(0.75,255)
	local spawn1 = cc.Spawn:create(action1,fade1)

	local action2 = cc.MoveBy:create(0.75, cc.p(0, -8))
	local fade2 = cc.FadeTo:create(0.75,255*0.5)
	local spawn2 = cc.Spawn:create(action2,fade2)

	local seq = cc.Sequence:create(spawn1,spawn2)
	local rep = cc.RepeatForever:create(seq)
	rep:setTag(678)

	node:runAction(rep)
end

--播放左右浮动动画
function UIActionHelper.playFloatXEffect( node )
	-- body
	if not node then return end

	--不需要重复执行
	if node:getActionByTag(678) then
		return
	end

	local action1 = cc.MoveBy:create(0.75, cc.p(8, 0))
	local fade1 = cc.FadeTo:create(0.75,255)
	local spawn1 = cc.Spawn:create(action1,fade1)

	local action2 = cc.MoveBy:create(0.75, cc.p(-8, 0))
	local fade2 = cc.FadeTo:create(0.75,255*0.5)
	local spawn2 = cc.Spawn:create(action2,fade2)

	local seq = cc.Sequence:create(spawn1,spawn2)
	local rep = cc.RepeatForever:create(seq)
	rep:setTag(678)

	node:runAction(rep)
end

--播放闪烁动画
function UIActionHelper.playBlinkEffect(node, opacityParams, scaleParams, time)
	if not node then return end

	if node:getActionByTag(123) then
		return
	end

    local opacity1, opacity2 = 50, 255
    opacity1 = (opacityParams and opacityParams.opacity1 or opacity1)
    opacity2 = (opacityParams and opacityParams.opacity2 or opacity2)

	local scale1, scale2 = 0.9, 1.0
	local orgScale = node:getScale()
	scale1 = (scaleParams and scaleParams.scale1 or scale1)*orgScale
    scale2 = (scaleParams and scaleParams.scale2 or scale2)*orgScale
    
    local interval = time and time or 2.0
    
    local action1 = cc.FadeTo:create(interval, opacity1)
	local action2 = cc.FadeTo:create(interval, opacity2)
	local seq1 = cc.Sequence:create(action1, action2)
	local action3 = cc.ScaleTo:create(interval, scale1)
	local action4 = cc.ScaleTo:create(interval, scale2)
	local seq2 = cc.Sequence:create(action3, action4)
	local spawn = cc.Spawn:create(seq1, seq2)
	local rep = cc.RepeatForever:create(spawn)
	rep:setTag(123)

	node:runAction(rep)
end

function UIActionHelper.playBlinkEffect2(node)
	-- body
	if not node then return end

	--不需要重复执行
	if node:getActionByTag(567) then
		return
	end

	local action1 = cc.FadeOut:create(1.0)
	local action2 = cc.FadeIn:create(1.0)
	local seq = cc.Sequence:create(action1,action2)
	local rep = cc.RepeatForever:create(seq)
	rep:setTag(567)

	node:runAction(rep)
end

--添加effect_round1特效至addCommonIconRoundEffect上
--目前需求是循环播放，各模块需手动管理特效生命周期
--parent 父节点
function UIActionHelper.addCommonIconRoundEffect(parent, scale)
	assert(parent, "---------addCommonIconRoundEffect parent error------------")
	-- body
	--local effectNode = EffectNode.new("effect_around1")
   -- effectNode:play()

   -- local scale = scale or 1
   -- effectNode:setScale(scale)
  --  effectNode:setPosition(5, -2)
--	parent:addChild(effectNode)

--	return effectNode
	return nil
end

function UIActionHelper.playSkewFloatEffect( node )
	-- body
	if not node then return end

	--不需要重复执行
	if node:getActionByTag(789) then
		return
	end

	local action1 = cc.MoveBy:create(0.75, cc.p(-10, -10))
	local action2 = cc.MoveBy:create(0.75, cc.p(10, 10))
	local seq = cc.Sequence:create(action1,action2)
	local rep = cc.RepeatForever:create(seq)
	rep:setTag(789)

	node:runAction(rep)
end


function UIActionHelper.playSkewFloatEffect2( node )
	-- body
	if not node then return end

	--不需要重复执行
	if node:getActionByTag(789) then
		return
	end

	local action1 = cc.MoveBy:create(0.75, cc.p(10, -10))
	local action2 = cc.MoveBy:create(0.75, cc.p(-10, 10))
	local seq = cc.Sequence:create(action1,action2)
	local rep = cc.RepeatForever:create(seq)
	rep:setTag(789)

	node:runAction(rep)
end



--放大-还原效果
function UIActionHelper.playScaleUpEffect(node)
	local action1 = cc.ScaleTo:create(0.2, 1.2)
	local action2 = cc.ScaleTo:create(0.2, 1)
	local seq = cc.Sequence:create(action1,cc.DelayTime:create(0.1), action2)
	node:runAction(seq)
end


-- 通用弹出提示框动画
function UIActionHelper.popupAction(position)

	local width = display.width
	local height = display.height
	local dstPosition = cc.p(width*0.5, height*0.5)
	position = position or dstPosition

	local offset = cc.pSub(dstPosition, position)
	dump(offset)
	local duration = 0.3

	return cc.Spawn:create(
    	cc.EaseBackOut:create(
	    	cc.Spawn:create(
	    		cc.ScaleTo:create(duration, 1),
	    		cc.MoveBy:create(duration, offset)
	    	)
    	),
    	cc.FadeIn:create(0.1)
    )

end


--文字飘动效果
function UIActionHelper.addNumberChangeEffect( startPos,num,endPos,parent )
	-- body
	if(num == 0)then return end
	local str = tostring(num)
	local color = num > 0 and Colors.BRIGHT_BG_ONE or Colors.BRIGHT_BG_TWO
	if(num > 0)then
		str = "+"..str
	end

	local label = cc.Label:createWithTTF(str,Path.getCommonFont(),22)
	label:setColor(color)
	label:setAnchorPoint(1, 0.5)
	label:enableOutline(Colors.CLASS_GREEN_OUTLINE, 2)
	if(parent ~= nil)then
		parent:addChild(label)
	else
		display.getRunningScene():addChildToPopup(label)
	end
	label:setPosition(startPos.x,startPos.y)

	label:setScale(0)
	local fadeIn = cc.FadeIn:create(0.2)
	local scaleIn = cc.ScaleTo:create(0.2,1)
	fadeIn = cc.Spawn:create(fadeIn,scaleIn)

	local fadeOut = cc.FadeOut:create(0.2)
	local moveOutPos = endPos or cc.p(startPos.x,startPos.y + 15)
	local moveOut = cc.MoveTo:create(0.2,moveOutPos)
	fadeOut = cc.Spawn:create(fadeOut,moveOut)

	local seq = cc.Sequence:create(fadeIn,cc.DelayTime:create(0.2),fadeOut,cc.CallFunc:create(function(actionNode)
		actionNode:removeFromParent(true)
	end))

	label:runAction(seq)
end

--创建一个倒计时Action
function UIActionHelper.createUpdateAction(callback, interval)
	if not interval then
		interval = 0.5
	end
	local delay = cc.DelayTime:create(interval)
    local sequence = cc.Sequence:create(delay, cc.CallFunc:create(function()

        if callback then
			callback()
		end
    end))

    local action = cc.RepeatForever:create(sequence)
    return action
end

function UIActionHelper.createDelayAction(dt, callback)
    local delayAction = cc.DelayTime:create(dt)
	local callFuncAction = cc.CallFunc:create(callback)
	local seqAction = cc.Sequence:create(delayAction, callFuncAction)
    return seqAction
end

--商城进入特效
function UIActionHelper.playEnterShopSceneEffect(params)
	if not params then
		return
	end
	if params.startCallback then
		params.startCallback()
	end
	params.tabGroup:setVisible(false)
	for _, v in pairs(params.rightNodes)do
		v:setVisible(false)
	end
	local function eventFunc(event)
		if event == "top" then
			params.topBar:playEnterEffect()
		elseif event == "left" then
			params.tabGroup:setVisible(true)
			params.tabGroup:playEnterEffect("smoving_shangdian_left", 0.03)
		elseif event == "alpha" then
			for _, v in pairs(params.rightNodes)do
				v:setVisible(true)
				G_EffectGfxMgr:applySingleGfx(v, "smoving_shangdian_alpha", nil, nil, nil)
			end
		elseif event == "icon" then
			--pos scrollEffect
			if params.listViewPlayCallback then
				params.listViewPlayCallback()
			end
		end
	end
	G_EffectGfxMgr:createPlayMovingGfx( params.attachNode, "moving_shangdian_ui", nil, eventFunc  )
end

return UIActionHelper
