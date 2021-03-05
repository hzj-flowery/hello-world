--邮件辅助类
local MailHelper = {}
local UserDataHelper = require("app.utils.UserDataHelper")
local TextHelper = require("app.utils.TextHelper")
local UIHelper = require("yoka.utils.UIHelper")

function MailHelper.updateMailRichContent(mailInfo,mailTitleLable, richtextParent)
    local content = MailHelper.updateRewardCell(mailInfo, mailTitleLable)

    -- formatStr, defaultColor, fontSize, YGap, alignment, widthLimit
    
    if richtextParent then
        richtextParent:removeAllChildren()

      
	   

        local richtext = UIHelper.createMultiAutoCenterRichText(content, Colors.NORMAL_BG_ONE, 20, 8, 1, 496)
        --[[
        local RichTextHelper = require("app.utils.RichTextHelper")
        local richMsg =  json.encode(RichTextHelper.getRichMsgListForHashText(
                    content,Colors.BRIGHT_BG_RED,Colors.BRIGHT_BG_TWO,22))
        local richtext = ccui.RichText:createWithContent(richMsg)

         richtext:setVerticalSpace(8)
         richtext:ignoreContentAdaptWithSize(false)
		 richtext:setContentSize(cc.size(496,0))--高度0则高度自适应
		 richtext:formatText()
		 local virtualContentSize = richtext:getVirtualRendererSize()
	     local richTextWidth = virtualContentSize.width
	     local richtextHeight = virtualContentSize.height
		 richtext:setContentSize(cc.size(richTextWidth, richtextHeight))
         richtext:setAnchorPoint(cc.p(0, 1))
       ]]
       
        richtextParent:pushBackCustomItem(richtext)
    end
end


--展开key value 类型字段
function MailHelper.updateRewardCell(mailInfo,mailTitleLable,mailContentLable)
    local mailTemplate = mailInfo.template
    local titleStr = TextHelper.convertKeyValuePairs(mailTemplate.mail_title, mailInfo.mail_title)
    if titleStr ~= "" and mailTitleLable then
        mailTitleLable:setString(titleStr)
    end

    --[[
    if mailNameLable and mailName.name then
        mailNameLable:setString(mailName.name)
    end	
    ]]
    local tempContent = TextHelper.convertKeyValuePairs(mailTemplate.mail_text, mailInfo.mail_contents)

    if tempContent == "" then
	     tempContent = Lang.get("mail_text_default_content")
	end
    if mailContentLable then
        mailContentLable:setString(tempContent)
    end
    return tempContent
end

function MailHelper.getMailExpiredTime(mailInfo)
    local days = UserDataHelper.getParameter(G_ParameterIDConst.MAIL_TIME)
    local expiredTime = days *  24 * 3600
    local remainTime = mailInfo.time + expiredTime - G_ServerTime:getTime()
    remainTime = math.max(remainTime,0)
    local totalSec = remainTime
    if totalSec == 0 then--0分钟
        return Lang.get("lang_common_format_min_unit",{min = 0})
    elseif totalSec <= 60 then--一分钟内
        return Lang.get("lang_common_format_min_unit",{min = 1})
    elseif totalSec <= 3600 then--一小时内    
        return Lang.get("lang_common_format_min_unit",{min = math.ceil(totalSec/60) })
    elseif totalSec <=  24 * 3600 then-- 一天内
        return Lang.get("lang_common_format_hour_unit",{hour = math.ceil(totalSec / 3600) })
    else
        local h = math.ceil(totalSec/3600)
        local day = math.floor(h/24)
        h = h - day*24
        if h == 0 then
            day = day -1
            h  = 24
        end
        local str1 = Lang.get("lang_common_format_day_unit",{day = day })    
        local str2 = Lang.get("lang_common_format_hour_unit",{hour = h })
        return str1..str2
    end
end

--获取时间戳t对应的服务器时间的字符串
function MailHelper.getSendTimeString(t)
    local localdate = G_ServerTime:getDateObject(t)
    return string.format("%04d.%02d.%02d %02d:%02d", localdate.year, localdate.month, localdate.day,localdate.hour, localdate.min)
end

--获取时间戳t对应的服务器时间的字符串--只要年月日
function MailHelper.getSendTimeShortString(t)
    local localdate = G_ServerTime:getDateObject(t)
    return string.format("%04d.%02d.%02d", localdate.year, localdate.month, localdate.day)
end

return MailHelper
