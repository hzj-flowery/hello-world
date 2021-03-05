
-- BulletScreenHelper
local BulletScreenHelper = {
	-- 弹幕运动类型
	-- 匀速运动类型
	TYPE_UNIFORM = 1,
	-- 右边快速淡入然后匀速运动
	TYPE_RIGHT_FADEIN_UNIFORM = 2,
	-- 右边快速淡入然后匀速运动一定时间后快速淡出
	TYOE_RIGHT_FADEIN_UNIFORM_LEFT_FADEOUT = 3,
	-- 右边匀速进入运行一定时间后快速淡出
	TYPE_RIGHT_UNIFORM_LEFT_FADEOUT = 4,
}



	
function BulletScreenHelper.getParameterTime( ... )
	-- body
	local timeRangeMin,timeRangMax = unpack( string.split( BulletScreenHelper.getParameter("boss_speed_section"), "|" ) )
	local time = math.random( tonumber( timeRangeMin), tonumber( timeRangMax) ) / 1000
	return time
end


function BulletScreenHelper.action(type, offset, time)

	local action = nil
	
	if type == BulletScreenHelper.TYPE_UNIFORM then
		-- 匀速左移至屏幕外
		local width = G_ResolutionManager:getDesignWidth()
    	
		action = cc.MoveBy:create(time, cc.p(-width + offset, 0))

	elseif type == BulletScreenHelper.TYPE_RIGHT_FADEIN_UNIFORM then
		-- 快速进入然后匀速左移至屏幕外
		action = cc.Spawn:create(
			cc.EaseExponentialOut:create(
				cc.Spawn:create(cc.FadeIn:create(0.5), cc.MoveBy:create(0.5, cc.p(-400, 0)))
			),
			cc.Sequence:create(
				cc.DelayTime:create(0.3),
				cc.MoveBy:create(6, cc.p(-540 + offset, 0))
			)
		)

	elseif type == BulletScreenHelper.TYOE_RIGHT_FADEIN_UNIFORM_LEFT_FADEOUT then

		-- 快速进入然后匀速左移一段时间后快速淡出
		action = cc.Spawn:create(
			cc.EaseExponentialOut:create(
				cc.Spawn:create(cc.FadeIn:create(0.5), cc.MoveBy:create(0.5, cc.p(-400, 0)))
			),
			cc.Sequence:create(
				cc.DelayTime:create(0.3),
				cc.MoveBy:create(6, cc.p(-540 + offset, 0))
			),
			cc.Sequence:create(
				cc.DelayTime:create(3),
				cc.EaseExponentialOut:create(
					cc.Spawn:create(cc.FadeOut:create(0.5), cc.MoveBy:create(0.5, cc.p(-300, 0)))
				)
			)
		)

	elseif type == BulletScreenHelper.TYPE_RIGHT_UNIFORM_LEFT_FADEOUT then
		local width = G_ResolutionManager:getDesignWidth()
		-- 快速进入然后匀速左移一段时间后快速淡出
		action = cc.Spawn:create(
			cc.Sequence:create(
				cc.MoveBy:create(8, cc.p(-width + offset, 0))
			),
			cc.Sequence:create(
				cc.DelayTime:create(5),
				cc.EaseExponentialOut:create(
					cc.Spawn:create(cc.FadeOut:create(0.5), cc.MoveBy:create(0.5, cc.p(-300, 0)))
				)
			)
		)
	elseif type == BulletScreenHelper.TYPE_MIDDLE then
		
	end

	return cc.Sequence:create(action, cc.CallFunc:create(function()
			--position:release()
		end))

end

--boss_coordinate_1
function BulletScreenHelper.getParameter(keyIndex)
    local parameter = require("app.config.parameter")
    for i=1, parameter.length() do
        local configData = parameter.indexOf(i)
        if configData.key == keyIndex then
            return configData.content
        end
    end
    assert(false," can't find key index in BulletScreenHelper.getParameter"..keyIndex)
    return nil
end

function BulletScreenHelper.getBulletShowTime(  )
	-- body
	local tempDesc = BulletScreenHelper.getParameter("boss_paomadeng_interval")
	local min, max = unpack( string.split( tempDesc, "|") ) --根据策划配置范围，随即

	local sec = math.random( tonumber(min), tonumber(max) ) / 1000 -- 单位是千分之
	return sec
end

function BulletScreenHelper.getBulletShowDistance( ... )
	-- body
	local tempDesc = BulletScreenHelper.getParameter("boss_barrage_distance")
	return tonumber(tempDesc)
end
return BulletScreenHelper