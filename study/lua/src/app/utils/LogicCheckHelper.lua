--逻辑检查帮助类
--外部调用


local LogicCheckHelper  = {}


LogicCheckHelper = {}


local function addCheck(checks)
	-- 添加check
	for k, v in pairs(checks) do
		assert(not LogicCheckHelper[k], "There is an another check named: "..tostring(k))
		LogicCheckHelper[k] = v
	end
end


addCheck(import(".logic.UserCheck"))
addCheck(import(".logic.ShopCheck"))
addCheck(import(".logic.FunctionCheck"))
addCheck(import(".logic.ChatCheck"))
addCheck(import(".logic.GuildCheck"))
addCheck(import(".logic.DailyDungeonCheck"))
addCheck(import(".logic.TowerCheck"))
addCheck(import(".logic.GuildWarCheck"))


--根据函数名处理逻辑
function LogicCheckHelper._procCheckList(funcName, value)
    local checkFunc = LogicCheckHelper[funcName]
    if checkFunc and type(checkFunc) == "function" then
        local typeStr = type(value)

        if typeStr == "table" then
            local param = value.param
            if param and type(param) ~= "table" then
                param = {param}
            end
            local errorMsg = value.errorMsg
            if param then
                local ok, msg = checkFunc( unpack(param))
                return ok, msg or errorMsg
            else
                local ok, msg = checkFunc(nil)
                return ok, msg or errorMsg
            end
        end
    else
        assert(checkFunc, "LogicCheckHelper._procCheck checkFunc not find funcName is : "..funcName)
    end
end


--根据函数名处理逻辑
function LogicCheckHelper._procCheck(funcName, value)
    local checkFunc = LogicCheckHelper[funcName]
    if checkFunc and type(checkFunc) == "function" then
        local typeStr = type(value)
        if typeStr == "table" then
           local param = value.param
           if param and type(param) ~= "table" then
                param = {param}
           end
           local errorMsg = value.errorMsg
           local ok, msg = checkFunc( unpack(param))
           return ok, msg or errorMsg
        else
           local ok, msg = checkFunc(nil)
           return ok, msg
        end
    else
        assert(checkFunc, "LogicCheckHelper._procCheck checkFunc not find funcName is : "..funcName)
    end
end


--生成检查列表
--[[
例如传入以下参数
    local checkParams = {
        [1] = { funcName = "enoughLevel",param = 10, errorMsg = "level not enough"},  --检查玩家等级
        [2] = { funcName = "enoughMoney", param = 100, errorMsg = "money not enough"},  --检查玩家等级
        [3] = { funcName = "enoughCash",param = 10, errorMsg = "cash not enough"},  --检查玩家等级
    }
]]
function LogicCheckHelper.doCheckList(params, callback)
    
    for key, value in ipairs(params) do
        local funcName = value.funcName
        local checkValue, errorMsg =  LogicCheckHelper._procCheckList(funcName, value)
        if checkValue == false then
            logWarn( string.format("check function name %s, ===============================Begin", funcName))
            dump(params)
            logWarn( string.format("check function name %s, ===============================End" , funcName))

            --失败回调
            if callBack and type(callBack) == "function" then
                callBack(checkValue,errorMsg, funcName)
            end
            return false,errorMsg,funcName
        end
    end

    --成功回调
    if callBack and type(callBack) == "function" then
        callBack(true)
    end
    return true
end

function LogicCheckHelper.doCheckListExt(params, callback)
    local result = true
    local errorMsgs = {}
    local funcNames = {}

    for key, value in ipairs(params) do
        local funcName = value.funcName
        local checkValue, errorMsg =  LogicCheckHelper._procCheckList(funcName, value)
        if checkValue == false then
            result = false
            
            logWarn( string.format("check function name %s, ===============================Begin", funcName))
            dump(params)
            logWarn( string.format("check function name %s, ===============================End" , funcName))

            --失败回调
            if callBack and type(callBack) == "function" then
                callBack(checkValue,errorMsg, funcName)
            end

            table.insert( errorMsgs, errorMsg )
            funcNames[funcName] = 1
        end
    end

    --成功回调
    if callBack and type(callBack) == "function" then
        callBack(true)
    end


    return result, errorMsgs, funcNames
end

--[[
例如传入以下参数
    funcName 函数名
    params 参数列表 可以是table 或者 number string 等
    callback 执行成功 func返回为 true， 则做回调
]]

function LogicCheckHelper.doCheck(funcName, params, callBack)
    local checkValue, errorMsg = LogicCheckHelper._procCheck(funcName, params)
    if callBack and type(callBack) == "function" then
        callBack(checkValue,errorMsg, funcName)
    end
    return checkValue,errorMsg
end




------------------
--Test Code
function LogicCheckHelper.doExample()
    --check ok
    local checkParams = {
        [1] = { funcName = "enoughLevel",param = 10, errorMsg = "level not enough"},  --检查玩家等级
        [2] = { funcName = "enoughMoney", param = 100, errorMsg = "money not enough"},  --检查玩家等级
        [3] = { funcName = "enoughCash",param = 10, errorMsg = "cash not enough"},  --检查玩家等级
    }

   local success, errorMsg = LogicCheckHelper.doCheckList(checkParams, function(errorMsg)
        logDebug("LogicCheckHelper.doCheckList check ok")
    end)

    -----------------------------------------------------
    --check error
    local checkParams2 = {
        [1] = { funcName = "enoughLevel",param = 1, errorMsg = "level not enough"},  --检查玩家等级
        [2] = { funcName = "enoughMoney", param = 100, errorMsg = "money not enough"},  --检查玩家等级
        [3] = { funcName = "enoughCash",param = 99999999, errorMsg = "cash not enough"},  --检查玩家等级
    }
    
    local success, errorMsg = LogicCheckHelper.doCheckList(checkParams2, function()
        logDebug("check ok")
    end)

   
    if success == false and errorMsg then
        G_Prompt:showTip(errorMsg)
    end



    -----------------------------------------------------
    --check one
    local success, errorMsg = LogicCheckHelper.doCheck("enoughCash", 99, function()
         logDebug("LogicCheckHelper.doCheck check ok")
    end)

    if success == false  then
        G_Prompt:showTip(" LogicCheckHelper.doCheck enoughCash not enough")
    end
    
end

return LogicCheckHelper