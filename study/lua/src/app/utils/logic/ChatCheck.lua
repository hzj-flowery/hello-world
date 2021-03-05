local ChatCheck = {}
local ChatConst = require("app.const.ChatConst")

function ChatCheck.chatMsgSendCheck(sendMsgChannel,popHint,ignoreCD, msgType)
    local success = true
    local popFunc = nil 
    local showTipsByLimitInfo = function(limitInfo)
        for k,v in pairs(limitInfo) do
            if k == ChatConst.LIMIT_FLAG_LEVLE then
                return Lang.get("chat_send_msg_level_limit_hint",{level = v})
            elseif k == ChatConst.LIMIT_FLAG_NO_GANG then
               return  Lang.get("chat_send_msg_not_gang_hint")
            elseif k == ChatConst.LIMIT_FLAG_NO_COUNT then
               return  Lang.get("chat_send_msg_count_limit",{value01 = v[1],value02 = v[2]}) 
            elseif k == ChatConst.LIMIT_FLAG_CROSS_SERVER then
                return Lang.get("chat_send_msg_not_cross_server")
            end
        end
    end
    local limitInfo = {}
    if not G_UserData:getChat():canSendMsg(sendMsgChannel,limitInfo) then
        local err = showTipsByLimitInfo(limitInfo)
        if err then
            popFunc = function() 
                G_Prompt:showTip(err) 
            end
        end
  
        success = false
    end

    local cdTime, cdType = G_UserData:getChat():getCDTime(sendMsgChannel, msgType)
    if cdTime > 0 and (not ignoreCD) then
        local promptTxt = Lang.get("chat_send_msg_cd_limit_hint",
            {channel = Lang.get("chat_channel_names")[sendMsgChannel], num = cdTime})
        if cdType == ChatConst.CD_TYPE_EVENT then
            promptTxt = Lang.get("chat_send_groups_msg_cd_limit_hint",{channel = Lang.get("chat_channel_names")[sendMsgChannel], num = cdTime})
        end
        popFunc = function() G_Prompt:showTip(promptTxt) end
        success = false
    end
    if popHint and popFunc then
        popFunc()
    end
    return success,popFunc
end


return ChatCheck