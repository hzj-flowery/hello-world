import { UserDataHelper } from "./UserDataHelper";
import ParameterIDConst from "../../const/ParameterIDConst";
import { G_ServerTime, G_UserData } from "../../init";

export namespace MailDataHelper {
    export function isMailExpired(mailInfo) {
        let days = UserDataHelper.getParameter(ParameterIDConst.MAIL_TIME);
        let expiredTime = days * 24 * 3600;
        let remainTime = mailInfo.time + expiredTime - G_ServerTime.getTime();
        return remainTime <= 0;
    };
    export function getExpiredMailIds() {
        let deleteMailList = [];
        let mailDataList = G_UserData.getMails().getMailDetailData();
        for (let k in mailDataList) {
            let v = mailDataList[k];
            if (v && MailDataHelper.isMailExpired(v)) {
                deleteMailList.push(v.id);
            }
        }
        return deleteMailList;
    };
};