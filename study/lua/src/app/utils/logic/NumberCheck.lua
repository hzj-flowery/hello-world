
local NumberCheck = {}

function NumberCheck.checkPhone(var,popHint)
    local success = true
    local popFunc = nil
    if popHint == nil then
        popHint = true
    end

    if var == nil or var == "" then
        success = false
        popFunc = function() G_Prompt:showTip(Lang.get("common_error_phone_not_empty")) end
    end

    if success then
        local b = tonumber(var) 
        if  b==nil then
            success = false
            popFunc = function() G_Prompt:showTip(Lang.get("common_error_phone_not_number")) end
        end
    end

    if success and #var ~= 11 then
        success = false
        popFunc = function() G_Prompt:showTip(Lang.get("common_error_phone_less_11")) end
    end
--[[
    if success then    
        local array ={
        "133","153","180","189", --电信
        "130","131","132","145", --联通
        "155","156","185","186",
        "134","135","136","137", --移动
        "138","139","147","150",
        "151","152","157","158",
        "159","182","187","188"
        }
       
        local correctHead = false
        for i = 1, #array do
            if (array[i] == string.sub(var,0,3)) then
                correctHead = true
                break
            end
        end
        
        if not correctHead then
            success = false
            popFunc = function() G_Prompt:showTip(Lang.get("common_error_phone_not_exist")) end
        end
    end
    ]]
    if popHint and popFunc then
        popFunc()
    end
    return success,popFunc
end




function NumberCheck.checkName(var,popHint)
    local success = true
    local popFunc = nil
    if popHint == nil then
        popHint = true
    end

    if var==nil or var == "" then
        success = false
        popFunc = function() G_Prompt:showTip(Lang.get("common_error_name_not_empty")) end
    end

    if popHint and popFunc then
        popFunc()
    end
    return success,popFunc
end




function NumberCheck.checkBirthday(var,popHint)
    local success = true
    local popFunc = nil
    if popHint == nil then
          popHint = true
    end

    if var == nil or var == "" then
        success = false
        popFunc = function() G_Prompt:showTip(Lang.get("common_error_birthday_not_empty")) end
end

    if success then
        local b = tonumber(var) 
        if  b==nil then
            success = false
            popFunc = function() G_Prompt:showTip(Lang.get("common_error_birthday_not_number")) end
        end
end

    if popHint and popFunc then
         popFunc()
    end
    return success,popFunc
end



function NumberCheck.checkQQ(var,popHint)
    local success = true
    local popFunc = nil
    if popHint == nil then
         popHint = true
    end

    

    if var ==nil or var == "" then
        success = false
        popFunc = function() G_Prompt:showTip(Lang.get("common_error_qq_not_empty")) end
end

    if success then
        local b = tonumber(var) 
        if  b==nil then
            success = false
            popFunc = function() G_Prompt:showTip(Lang.get("common_error_qq_not_number")) end
        end
end

    if popHint and popFunc then
        popFunc()
    end
    return success,popFunc
end

return NumberCheck