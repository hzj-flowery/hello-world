--
-- Author: Liangxu
-- Date: 2017-04-27 14:09:45
--
local RecoveryHelper = class("RecoveryHelper")

function RecoveryHelper.playSingleNodeFly(node, tarPos, callback)
	local moveTo = cc.MoveBy:create(0.2, tarPos)
	local scaleTo = cc.ScaleTo:create(0.2, 0.3)
	local spawn = cc.Spawn:create(moveTo, scaleTo)
	node:runAction(cc.Sequence:create(
        spawn,
        cc.CallFunc:create(function()
        	node:setVisible(false)
            if callback then
            	callback()
            end
        end))
    )
end

return RecoveryHelper