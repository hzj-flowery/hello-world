local BaseData = require("app.data.BaseData")
local ConfigManager = class("ConfigManager", BaseData)
local PrioritySignal = require("yoka.event.PrioritySignal")
local PatchCode = require("yoka.utils.PatchCode")

local schema = {}

-- 公告
schema["popupUrl"]					= {"string", ""}             -- 已接入
-- 默认服务器
schema["defaultServer"]				= {"number", 0}              -- 已接入
-- app更新
schema["appVersion"]				= {"string", "0.0.0"}        -- 已接入
schema["appVersionDesc"]			= {"string", ""}
schema["appVersionUrl"]				= {"string", ""}
schema["appVersionType"]			= {"string", ""}
-- 内更新
schema["resVersion"]				= {"string", "0.0.0"}        -- 已接入
schema["resVersionUrl"]				= {"string", ""}
-- 可运行code
schema["runCode"] 					= {"number", 0}              -- 未接入
schema["runCodeDesc"]				= {"string", ""}
-- 错误战报上报
schema["reportFight"]				= {"boolean", false}         -- 未接入
-- lua错误提示
schema["error"]						= {"boolean", false}         -- 已接入
schema["errorTip"]					= {"string", ""}
-- 未开服
schema["serverNotAllowedTip"]		= {"string", ""}             -- 已接入
-- 未知错误提示
schema["serverUnknownErrorTip"]		= {"string", ""}             -- 已接入
-- 礼品码
schema["giftcode"]                  = {"boolean", false}         -- 已接入
-- 永远显示sdk悬浮icon
schema["alwaysShowToolBar"]         = {"boolean", false}         -- 已接入
-- dnspod
schema["dnspod"]                    = {"boolean", false}         -- 未接入
-- 充值
schema["recharge"]					= {"boolean", false}         -- 未接入
schema["rechargeTip"]				= {"boolean", false}
-- 沙盒环境
schema["sandbox"]					= {"boolean", false}         -- 未接入
-- appstore审核
schema["appstore"]					= {"boolean", false}         -- 未接入
-- 是否显示微信绑定
schema["showBindWeChat"]            = {"boolean", false}         -- 未接入   
-- 分享开关
schema["share"]                     = {"boolean", false}
-- 渠道名
schema["channel"]                   = {"string", ""}    
-- 评论开关
schema["review"]                    = {"boolean", false}
-- 服务器列表
schema["remoteServer"]              = {"boolean", true}          -- 已接入
schema["serverCacheTime"]           = {"number", 60}
schema["listServer"]                = {"string", ""}
schema["addServer"]                 = {"string", ""}
-- 网关列表
schema["remoteGateway"]             = {"boolean", true}          -- 已接入
schema["gatewayCacheTime"]          = {"number", 900}
schema["listGateway"]               = {"string", ""}
schema["addGateway"]                = {"string", ""}
-- 屏蔽字
schema["blackList"]                 = {"string", ""}             -- 已接入
-- 黑科技
schema["patchCode"]                 = {"string", ""}             -- 已接入
schema["patchCode2"]                = {"string", ""}             -- 已接入
--
schema["notification"]              = {"boolean", true}          --

-- 拉取角色列表开关
schema["getRoleList"]               = {"boolean", true}         -- 未接入   

-- 语音自动播放开关
schema["voiceAutoPay"]              = {"boolean", true}         -- 未接入   

--政策相关
--充值限制
schema["rechargeLimit"]             = {"number", 0}
--实名认证
schema["realName"]                  = {"boolean", false} 
--防沉迷
schema["avoidHooked"]               = {"boolean", false}
--沉迷时间
schema["avoidOnlineTime"]           = {"number", 10800}

--超级VIP开关
schema["svipOpen"]             = {"boolean", false}          -- 已接入
--专属Vip客服QQ号
schema["svipQQ"]               = {"string", ""}            -- 已接入
--专属Vip客服图片 
schema["svipImage"]            =  {"string", ""}        -- 已接入
--专属vipqq群链接
schema["svipQQURL"]             = {"string", ""}        

--大蓝2范伟专属VIP开关
schema["svipOpen2"]             = {"boolean", false}          -- 已接入
--大蓝2范伟专属Vip公众号
schema["svipQQ2"]               = {"string", ""}            -- 已接入
--大蓝2范伟专属Vip客服图片 
schema["svipImage2"]            =  {"string", ""}        -- 已接入
--

--高级VIP认证
schema["svipRegisteOpen"]            =  {"boolean", false}        -- 已接入

--大额充值项
schema["largeCashReCharge"]            =  {"boolean", false}        -- 已接入

--手杀联动
schema["downloadThreeKindoms"]      =  {"boolean", false}        -- 已接入
schema["downloadThreeKindomsUrl"]	= {"string", ""}

--是否是大蓝（用于判断去除水印之类的大蓝特殊操作）
schema["dalanVersion"] = {"boolean", false}

schema["serverListReIndex"] = {"boolean", false}

schema["urlFilter"] = {"boolean", false}    -- 是否需要通过url过滤

schema["autoPlayWorldAudioDefaut"] = {"boolean", true} --已接入 自动播放音频默认状态-世界
schema["autoPlayGuildAudioDefaut"] = {"boolean", true} --已接入 自动播放音频默认状态-军团

schema["openSdkRealName"]  = {"boolean", true}  --是否开启sdk实名
schema["showYouke"] = {"boolean", false}    --是否显示游客登陆
schema["police"]  =  {"boolean", false}   --是否接入公安系统的实名库
schema["checkReturnServer"] = {"boolean", false} --是否检查回归服服务器列表
schema["humanCheckUrl"] = {"string", ""}        --验证url
schema["openTShirt"] = {"boolean", false} --是否开启送T恤活动


ConfigManager.schema = schema

function ConfigManager:ctor(properties)
	ConfigManager.super.ctor(self, properties)
	--
	self.signal = PrioritySignal.new("string")
end

--
function ConfigManager:clear()
    
end

--
function ConfigManager:reset()
    
end

--
function ConfigManager:fresh()
	--
	local domain = CONFIG_URL
    local url = CONFIG_URL_TEMPLATE
    url = string.gsub(url, "#domain#", domain)
    

    if G_GameAgent:isGrayTest() then
        url = string.gsub(url, "#o#", tostring(G_GameAgent:getGrayOpId()))            --灰度测试id
        url = string.gsub(url, "#g#", tostring(G_GameAgent:getGrayOpGameId()))        --灰度测试id
    else
        url = string.gsub(url, "#o#", tostring(G_NativeAgent:getOpId()))            --运营商id
        url = string.gsub(url, "#g#", tostring(G_NativeAgent:getOpGameId()))        --运营平台id
    end
    url = string.gsub(url, "#g#", tostring(G_NativeAgent:getOpGameId()))        --运营平台id
    url = string.gsub(url, "#v#", G_NativeAgent:getAppVersion())                --App版本
    url = string.gsub(url, "#d#", G_NativeAgent:getDeviceId())                  --设备唯一id
    url = string.gsub(url, "#r#", tostring(VERSION_RES))                        --资源版本
    url = string.gsub(url, "#p#", G_NativeAgent:getNativeType())                --设备类型
    url = string.gsub(url, "#t#", tostring(os.time()))                          --当前时间
    --
    --url = string.gsub(url, "#t#", tostring(os.time()))                          --灰度测试

    print("get setting url = " .. url)
    --
	local xhr = cc.XMLHttpRequest:new()
    xhr.responseType = cc.XMLHTTPREQUEST_RESPONSE_STRING
    --xhr:setRequestHeader("Host", domain)
    xhr:open("GET", url)

    local function onReadyStateChange()
        local result = "fail"
        if xhr.readyState == 4 and (xhr.status >= 200 and xhr.status < 207) then
            if xhr.response ~= nil and xhr.response ~= "" then
                local ret = json.decode(xhr.response)
                if ret ~= nil and ret.status ~= nil and ret.status == 0 then
                    local data
                    if ret.version ~= nil and ret.version == 1 then
                        data = base64.decode(string.sub(ret.data, 15))
                    else
                        data = ret.data
                    end
                    data = json.decode(data)
                    if data ~= nil and data ~= "" then
                        --dump(data)
                        self:setProperties(data)
                        --self:setError(true)
                        --
                        local patch = self:getPatchCode()
                        if patch ~= nil and patch ~= "" then
                            local patch_md5 = md5.sum(patch .. "CLIENT_PATCH_CODE_SIG")
                            --print("compare md5 " .. patch_md5 .. "->" .. tostring(data['patchCodeSig']))

                            if patch_md5 == data['patchCodeSig'] then
                               PatchCode.loadPatchCode(patch) 
                            else
                               error("Error(666)")
                            end
                        end
                        local patch2 = self:getPatchCode2()
                        if patch2 ~= nil and patch2 ~= "" then
                            local patch_md5 = md5.sum(patch2 .. "CLIENT_PATCH_CODE_SIG2")
                            --print("compare md5 " .. patch_md5 .. "->" .. tostring(data['patchCodeSig']))

                            if patch_md5 == data['patchCodeSig2'] then
                               PatchCode.loadPatchCode(patch2)
                            else
                               error("Error2(666)")
                            end
                        end

						--配置回归资格检测url
						if RETURN_SERVER_CHECK_URL == "" then
							if self:isDalanVersion() then
								RETURN_SERVER_CHECK_URL = RETURN_SERVER_CHECK_URL_DALAN
							else
								RETURN_SERVER_CHECK_URL = RETURN_SERVER_CHECK_URL_YOKA
							end
						end
						
                        result = "success"
                    end
                end
            end
        end

        self.signal:dispatch(result, tostring(G_NativeAgent:getOpId()), tostring(G_NativeAgent:getOpGameId()))
    end

    xhr:registerScriptHandler(onReadyStateChange)
    xhr:send()
end


return ConfigManager