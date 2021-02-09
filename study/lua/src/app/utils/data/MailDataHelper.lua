
local MailDataHelper = {}


function MailDataHelper.isMailExpired(mailInfo)
    local UserDataHelper = require("app.utils.UserDataHelper")
    local days = UserDataHelper.getParameter(G_ParameterIDConst.MAIL_TIME)
    local expiredTime = days *  24 * 3600
    local remainTime = mailInfo.time + expiredTime - G_ServerTime:getTime()
    return remainTime <= 0
end

function MailDataHelper.getExpiredMailIds()
    local deleteMailList = {}
    local mailDataList = G_UserData:getMails():getMailDetailData()
    for k,v in pairs(mailDataList) do
        if MailDataHelper.isMailExpired(v) then
            table.insert(deleteMailList, v.id)
        end
    end
    return deleteMailList
end

 

return MailDataHelper