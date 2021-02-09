--服务器相关常量

local ServerConst = {}



ServerConst.SERVER_STATUS_NORMAL = 1	--正常	
ServerConst.SERVER_STATUS_NEW = 2	--新开	
ServerConst.SERVER_STATUS_HOT = 3	--火爆	
ServerConst.SERVER_STATUS_MAINTENANCE = 4	--维护	
ServerConst.SERVER_STATUS_CLOSE = 5	--停服	
ServerConst.SERVER_STATUS_MERGE = 6	--合服	
ServerConst.SERVER_STATUS_COMING = 7	--即将开启	
ServerConst.SERVER_STATUS_CONFIGURED  = 8	--已配服	
ServerConst.SERVER_STATUS_WAIT_OPEN = 9	--待开启	
ServerConst.SERVER_STATUS_GRAY = 11	--灰度测试服务器	
ServerConst.SERVER_STATUS_COMING_CLIENT = 12 --即将开启（客户端显示）

ServerConst.SHOW_BIG_STATUS_ICON = {
    [ServerConst.SERVER_STATUS_NEW] = true,
    [ServerConst.SERVER_STATUS_COMING] = true,
    [ServerConst.SERVER_STATUS_CONFIGURED] = true,
	[ServerConst.SERVER_STATUS_WAIT_OPEN] = true,
    [ServerConst.SERVER_STATUS_GRAY] = true,
    [ServerConst.SERVER_STATUS_COMING_CLIENT] = true,
}


ServerConst.SECRET_KEY_LIST = {--秘钥列表32位
    "73b7e2824d3b57a31b8968e01e144457",
	"34ed066df378efacc9b924ec161e7639",
	"9813b270ed0288e7c0388f0fd4ec68f5",
}

--判断是否是需要输入秘钥的服务器
function ServerConst.isNeedSecretKeyServer(serverStatus)
	if serverStatus == ServerConst.SERVER_STATUS_COMING or
		serverStatus == ServerConst.SERVER_STATUS_CONFIGURED or
		serverStatus == ServerConst.SERVER_STATUS_WAIT_OPEN  then
			return true
	end
    return false
end

function ServerConst.hasMatchedSecretKey(content)
     if content == nil or content == "" then
        return false
     end
     local md5Str = md5.sum(content)
     logWarn(" ServerConst ...  "..tostring(md5Str))
     for k,v in pairs(ServerConst.SECRET_KEY_LIST ) do
        if md5Str == v then
            return true
        end 
     end
     return false
end


return readOnly(ServerConst)
