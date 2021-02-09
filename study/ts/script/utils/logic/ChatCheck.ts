import { ChatConst } from "../../const/ChatConst";
import { Lang } from "../../lang/Lang";
import { G_UserData, G_Prompt } from "../../init";

export namespace ChatCheck {
    export function chatMsgSendCheck(sendMsgChannel, popHint, ignoreCD, msgType) {
        let success = true;
        let popFunc = null;
        let showTipsByLimitInfo = function (limitInfo) {
            for (var k in limitInfo) {
                let v = limitInfo[k];
                var flag = Number(k);
                if (flag == ChatConst.LIMIT_FLAG_LEVLE) {
                    return Lang.get('chat_send_msg_level_limit_hint', { level: v });
                } else if (flag == ChatConst.LIMIT_FLAG_NO_GANG) {
                    return Lang.get('chat_send_msg_not_gang_hint');
                } else if (flag == ChatConst.LIMIT_FLAG_NO_COUNT) {
                    return Lang.get('chat_send_msg_count_limit', {
                        value01: v[1],
                        value02: v[2]
                    });
                }
            }
        };
        let limitInfo = {};
        if (!G_UserData.getChat().canSendMsg(sendMsgChannel, limitInfo)) {
            let err = showTipsByLimitInfo(limitInfo);
            if (err) {
                popFunc = function () {
                    G_Prompt.showTip(err);
                };
            }
            success = false;
        }
        let [ cdTime, cdType ] = G_UserData.getChat().getCDTime(sendMsgChannel, msgType);
        if (cdTime > 0 && !ignoreCD) {
            let promptTxt = Lang.get('chat_send_msg_cd_limit_hint', {
                channel: Lang.get('chat_channel_names')[sendMsgChannel-1],
                num: cdTime
            });
            if (cdType == ChatConst.CD_TYPE_EVENT) {
                promptTxt = Lang.get('chat_send_groups_msg_cd_limit_hint', {
                    channel: Lang.get('chat_channel_names')[sendMsgChannel-1],
                    num: cdTime
                });
            }
            popFunc = function () {
                G_Prompt.showTip(promptTxt);
            };
            success = false;
        }
        if (popHint && popFunc) {
            popFunc();
        }
        return [
            success,
            popFunc
        ];
    };
};
