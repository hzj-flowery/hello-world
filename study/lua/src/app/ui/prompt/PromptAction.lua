
-- PromptAction

local PromptAction = {}

-- 通用信息飘字动画
function PromptAction.tipAction()
	return cc.Sequence:create(
		cc.Spawn:create(cc.MoveBy:create(0.15, cc.p(0, 40)),  cc.FadeIn:create(0.15)),
		cc.DelayTime:create(0.8),
		cc.Spawn:create(cc.MoveBy:create(0.4, cc.p(0, 100)), cc.FadeOut:create(0.4))
	)
end

-- 通用弹出提示框动画
function PromptAction.PopupAction(position)
	local width = G_ResolutionManager:getDesignWidth()
	local height = G_ResolutionManager:getDesignHeight()
	local dstPosition = cc.p(width*0.5, height*0.5)
	position = position or dstPosition

	local offset = cc.pSub(dstPosition, position)
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

-- 通用弹出提示框动画
function PromptAction.popupBackAction(position)
	local width = G_ResolutionManager:getDesignWidth()
	local height = G_ResolutionManager:getDesignHeight()
	local dstPosition = position or cc.p(width*0.5, height*0.5)
	local duration = 0.3

    return cc.Spawn:create(
    	cc.EaseBackOut:create(
	    	cc.Spawn:create(
	    		cc.ScaleTo:create(duration, 0),
	    		cc.MoveTo:create(duration, dstPosition)
	    	)
    	),
    	cc.FadeOut:create(0.1)
    )
end

-- 通用领取奖励icon动画
function PromptAction.awardSummaryIconAction()
	return cc.Sequence:create(
		cc.EaseBounceOut:create(cc.Spawn:create(cc.ScaleTo:create(0.4, 1),  cc.FadeIn:create(0.4))),
		cc.DelayTime:create(0.8),
		cc.Spawn:create(cc.MoveBy:create(0.4, cc.p(0, 100)), cc.FadeOut:create(0.4))
	)
end

-- 通用领取奖励icon名称动画
function PromptAction.awardSummaryIconNameAction()
	return cc.Sequence:create(
		cc.DelayTime:create(0.2),
		cc.EaseBounceOut:create(cc.Spawn:create(cc.ScaleTo:create(0.4, 1),  cc.FadeIn:create(0.4))),
		cc.DelayTime:create(0.6),
		cc.Spawn:create(cc.MoveBy:create(0.4, cc.p(0, 100)), cc.FadeOut:create(0.4))
	)
end

return PromptAction
