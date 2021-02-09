local callObjcStaticMethod = LuaObjcBridge and LuaObjcBridge.callStaticMethod or nil
local callJavaStaticMethod = LuaJavaBridge and LuaJavaBridge.callStaticMethod or nil

-- 
local function call_luaoc(className, methodName, args)
	local ok, ret = callObjcStaticMethod(className, methodName, args)
    if not ok then
        local msg = string.format("luaoc.callStaticMethod(\"%s\", \"%s\", \"%s\") - error: [%s] ",
                className, methodName, tostring(args), tostring(ret))
        if ret == -1 then
            print(msg .. "INVALID PARAMETERS")
        elseif ret == -2 then
            print(msg .. "CLASS NOT FOUND")
        elseif ret == -3 then
            print(msg .. "METHOD NOT FOUND")
        elseif ret == -4 then
            print(msg .. "EXCEPTION OCCURRED")
        elseif ret == -5 then
            print(msg .. "INVALID METHOD SIGNATURE")
        else
            print(msg .. "UNKNOWN")
        end
        ret = nil
    end
    return ok, ret
end

-- Check Java Arguments
local function checkArguments(args, returnType)
    if type(args) ~= "table" then args = {} end

    local sig = {"("}
    for i, v in ipairs(args) do

        local t = type(v)
        if t == "number" then
            sig[#sig + 1] = "I"  -- 'F' for number ,but we always use "interger" lua
        elseif t == "boolean" then
            sig[#sig + 1] = "Z"
        elseif t == "function" then
            sig[#sig + 1] = "I"
        else
            sig[#sig + 1] = "Ljava/lang/String;"
        end
    end

    local returnSig = 'V'
    if returnType  ~= nil then
    	if returnType == "boolean" then
    		returnSig = 'Z'
    	elseif returnType == "int" then
    		returnSig = 'I'
    	elseif returnType == "string" then
    		returnSig = 'Ljava/lang/String;'
    	end
    end

    sig[#sig + 1] = ")" .. returnSig

    return args, table.concat(sig)
end

-- Call Java StaticMethod
local function call_luaj(className, methodName, args, returnType)
	local args, sig = checkArguments(args, returnType)
	print("call_luaj => " .. className .. ": " .. methodName .. tostring(sig))
	local ok, ret = callJavaStaticMethod(className, methodName, args, sig)
    if not ok then
        print("call java StaticMethod failed: " .. tostring(ret))
        ret = nil
    end

    return ok, ret
end

--
local function convertLogArgs(className, func, args, returnType)
    local str = className .. ":" .. func .. "("
    if args then
        for i, v in ipairs(args) do
            for k, v2 in pairs(v) do
                str = str .. k .. "=" .. tostring(v2)
                if i ~= #args then
                    str = str .. ", "
                end
                break
            end
        end
    else
        --str = str .. "null"
    end
    return str .. ") => " .. (returnType and returnType or "void")
    --print("LuaNativeBridge => " .. str)
end

--
local function convertIosArgs(args)
    if args == nil then return nil end

	local p = {}
	for i, v in ipairs(args) do
		for k, v2 in pairs(v) do
			p[k] = v2
			break
		end
	end

	return p
end

--
local function convertAndroidArgs(args)
    if args == nil then return nil end

    local p = {}
	for i, v in ipairs(args) do
		for k, v2 in pairs(v) do
			table.insert(p, v2)
			break
		end
	end

	return p
end

--
local LuaNativeBridge = {}
local target = cc.Application:getInstance():getTargetPlatform()

--
function LuaNativeBridge.call(className, func, args, returnType)
    --
    local ok, ret
    if target == cc.PLATFORM_OS_ANDROID then
        ok, ret = call_luaj(className, func, convertAndroidArgs(args), returnType)
    elseif target == cc.PLATFORM_OS_IPHONE or target == cc.PLATFORM_OS_IPAD then
        ok, ret = call_luaoc(className, func, convertIosArgs(args))
    end
    --
    -- local p = convertLogArgs(className, func, args, returnType)
    -- if ok then
    --     p = p .. (ret and ": "..tostring(ret) or "")
    -- else
    --     p = p .. " failed!!!"
    -- end
    -- print("LuaNativeBridge => " .. p)
    return ret
end


return LuaNativeBridge