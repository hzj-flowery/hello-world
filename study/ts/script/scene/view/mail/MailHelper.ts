import { Colors, G_ServerTime } from "../../../init";
import { Lang } from "../../../lang/Lang";
import ParameterIDConst from "../../../const/ParameterIDConst";
import { Util } from "../../../utils/Util";
import { TextHelper } from "../../../utils/TextHelper";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import UIHelper from "../../../utils/UIHelper";

export namespace MailHelper {
    export function updateMailRichContent(mailInfo, mailTitleLable, richtextParent: cc.Node) {
        var content = MailHelper.updateRewardCell(mailInfo, mailTitleLable, null);
        if (richtextParent) {
            richtextParent.removeAllChildren();
            var richtext = UIHelper.createMultiAutoCenterRichText(content, Colors.NORMAL_BG_ONE, 20, 8, 1, 496);
            richtextParent.addChild(richtext);
            richtext.x = 0;
            richtext.y = -richtext.height;
        }
    }
    export function updateRewardCell(mailInfo, mailTitleLable, mailContentLable) {
        var mailTemplate = mailInfo.template;
        var titleStr = TextHelper.convertKeyValuePairs(mailTemplate.mail_title, mailInfo.mail_title);
        if (titleStr != '' && mailTitleLable) {
            mailTitleLable.string = (titleStr);
        }
        var tempContent = TextHelper.convertKeyValuePairs(mailTemplate.mail_text, mailInfo.mail_contents);
        if (tempContent == '') {
            tempContent = Lang.get('mail_text_default_content');
        }
        if (mailContentLable) {
            mailContentLable.string = (tempContent);
        }
        return tempContent;
    }
    export function getMailExpiredTime(mailInfo) {
        var days = UserDataHelper.getParameter(ParameterIDConst.MAIL_TIME);
        var expiredTime = days * 24 * 3600;
        var remainTime = mailInfo.time + expiredTime - G_ServerTime.getTime();
        remainTime = Math.max(remainTime, 0);
        var totalSec = remainTime;
        if (totalSec == 0) {
            return Lang.get('lang_common_format_min_unit', { min: 0 });
        } else if (totalSec <= 60) {
            return Lang.get('lang_common_format_min_unit', { min: 1 });
        } else if (totalSec <= 3600) {
            return Lang.get('lang_common_format_min_unit', { min: Math.ceil(totalSec / 60) });
        } else if (totalSec <= 24 * 3600) {
            return Lang.get('lang_common_format_hour_unit', { hour: Math.ceil(totalSec / 3600) });
        } else {
            var h = Math.ceil(totalSec / 3600);
            var day = Math.floor(h / 24);
            h = h - day * 24;
            if (h == 0) {
                day = day - 1;
                h = 24;
            }
            var str1 = Lang.get('lang_common_format_day_unit', { day: day });
            var str2 = Lang.get('lang_common_format_hour_unit', { hour: h });
            return str1 + str2;
        }
    }
    export function getSendTimeString(t) {
        var localdate = G_ServerTime.getDateObject(t);
        return Util.format('%04d.%02d.%02d %02d:%02d', localdate.getFullYear(), localdate.getMonth() + 1, localdate.getDate(), localdate.getHours(), localdate.getMinutes());
    }
    export function getSendTimeShortString(t) {
        var localdate = G_ServerTime.getDateObject(t);
        return Util.format('%04d.%02d.%02d', localdate.getFullYear(), localdate.getMonth() + 1, localdate.getDate());
    }
}