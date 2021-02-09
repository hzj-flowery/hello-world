local RedPetHelper = {}
local pet_red_activity = require("app.config.pet_red_activity")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

-----------曲线相关函数-----------------------------------
local bezierFix = function(posStart, posMid, posEnd, t)
    return (math.pow(1-t,2)*posStart + 2*t*(1-t)*posMid + math.pow(t, 2)*posEnd)
    --return 3*t*(math.pow(1-t,2))*posStart + 3*math.pow(t,2)*(1-t)*posMid + math.pow(t,3)*posEnd
end

local bezierAngle = function(posStart, posEnd, t)
	return posStart + (posEnd - posStart)*t
end

function RedPetHelper.getBezierPosition(bezier, t)
    local xa = bezier[1].x
	local xb = bezier[2].x
	local xc = bezier[3].x

	local ya = bezier[1].y
	local yb = bezier[2].y
	local yc = bezier[3].y

	return bezierFix(xa, xb, xc, t), bezierFix(ya, yb, yc, t)
end

function RedPetHelper.getBezierPositionAndAngle(bezier, t)
	local xa = bezier[1].x
	local xb = bezier[2].x
	local xc = bezier[3].x

	local ya = bezier[1].y
	local yb = bezier[2].y
	local yc = bezier[3].y

	local posx1 = bezierAngle(xa, xb, t) 
	local posy1 = bezierAngle(ya, yb, t)
	local posx2 = bezierAngle(xb, xc, t)
	local posy2 = bezierAngle(yb, yc, t)

	local angle = math.atan2(posy2-posy1, posx2-posx1)
	local angleRet = -math.floor(angle*180/3.14)

	return bezierFix(xa, xb, xc, t), bezierFix(ya, yb, yc, t), angleRet
end

---------------------------------------------------------------------

function RedPetHelper.getPreAwardInfo()
    local groupIds = G_UserData:getRedPetData():getOrange_pool_id()
    local awards = {}
    local length = pet_red_activity.length()

    -- 暂时只有一种红神兽，所以这里写死
    table.insert( awards, {type = 10, value = 201, size = 1} )

    for k, v in pairs(groupIds) do
        for id = 1, length do
            local configInfo = pet_red_activity.indexOf(id)
            if configInfo.group == v and configInfo.type == TypeConvertHelper.TYPE_PET then
                table.insert( awards, {type = configInfo.type, value = configInfo.value, size = configInfo.size} )
            end
        end
    end

    -- 写死的固定奖励
    table.insert( awards, {type = 6, value = 718, size = 1} )
    table.insert( awards, {type = 6, value = 89, size = 1} )

    return awards
end

function RedPetHelper.getShowPetsInfo()
    local groupIds = G_UserData:getRedPetData():getOrange_pool_id()
    local pets = {}
    local length = pet_red_activity.length()

    -- 暂时只有一种红神兽，所以这里写死
    table.insert( pets, {petId = 201} )

    for k, v in pairs(groupIds) do
        for id = 1, length do
            local configInfo = pet_red_activity.indexOf(id)
            if configInfo.group == v and configInfo.type == TypeConvertHelper.TYPE_PET then
                table.insert( pets, {petId = configInfo.value} )
            end
        end
    end

    return pets
end

function RedPetHelper.checkRectIntersects(rect1, rect2)
end

return RedPetHelper