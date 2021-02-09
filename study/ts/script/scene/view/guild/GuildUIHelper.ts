import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { GuildConst } from "../../../const/GuildConst";
import ParameterIDConst from "../../../const/ParameterIDConst";
import { SignalConst } from "../../../const/SignalConst";
import { Colors, G_ConfigLoader, G_Prompt, G_SceneManager, G_ServerTime, G_SignalManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import PopupAlert from "../../../ui/PopupAlert";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { Path } from "../../../utils/Path";
import { UIPopupHelper } from "../../../utils/UIPopupHelper";
import { Util } from "../../../utils/Util";
import GuildPushTeamApply from "../guildTrain/GuildPushTeamApply";

export namespace GuildUIHelper {
    export function quitGuild() {
        var userMemberData = G_UserData.getGuild().getMyMemberData();
        var myPosition = userMemberData.getPosition();
        var canDissolve = UserDataHelper.isHaveJurisdiction(myPosition, GuildConst.GUILD_JURISDICTION_1);
        var callbackOK1 = function () {
            G_UserData.getGuild().c2sGuildDismiss();
        }.bind(this);
        var callbackOK2 = function () {
            G_UserData.getGuild().c2sGuildLeave();
        }.bind(this);
        if (canDissolve) {
            var count = G_UserData.getGuild().getGuildMemberCount();
            if (count > 1) {
                G_Prompt.showTip(Lang.get('guild_tip_can_not_dissolve'));
                return;
            }
            var content = Lang.get('guild_dissolve_hint');
            var title = Lang.get('guild_appoint_confirm_title');
            // var popup = new (require('PopupAlert'))();
            // popup.openWithAction();
            G_SceneManager.openPopup("prefab/common/PopupAlert", (popup: PopupAlert) => {
                popup.init(title, content, callbackOK1);
                popup.openWithAction();
            });
        } else {
            var userMemberData = G_UserData.getGuild().getMyMemberData();
            var time = userMemberData.getTime();
            if (!UserDataHelper.checkCanQuitGuild(time)) {
                return;
            }
            var timeLimit = Number(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.GUILD_QUIT_CD_ID).content);
            var timeStr = G_ServerTime.getDayOrHourOrMinFormat(timeLimit);
            var content = Lang.get('guild_leave_hint', { time: timeStr });
            var title = Lang.get('guild_appoint_confirm_title');
            // var popup = new (require('PopupAlert'))(title, content, callbackOK2);
            // popup.openWithAction();
            G_SceneManager.openPopup("prefab/common/PopupAlert", (popup: PopupAlert) => {
                popup.init(title, content, callbackOK2);
                popup.openWithAction();
            });
        }
    };
    export function noticeBeKickGuild() {
        UIPopupHelper.popupOkDialog(null, Lang.get('guild_kick_hint'), function () {
            G_SceneManager.popScene();
        }, Lang.get('common_btn_name_confirm'));
    };
    export function getS2CQueryGuildTrain() {
        G_Prompt.showTipOnTop(Lang.get('guild_train_wait'));
    };
    export function getConfirmGuildTrain(name) {
        var str = Lang.get('guild_cancel_invite').format(name);
        G_Prompt.showTipOnTop(str);
    };
    export function getS2CStartGuildTrainNotify(data?) {
        var scene = G_SceneManager.getTopScene();
        var sceneName = scene.getName();
        if (sceneName != 'guildTrain') {
            G_SceneManager.showScene('guildTrain');
        } else {
            G_SignalManager.dispatch(SignalConst.EVENT_GET_TRAIN_NOTIFY);
        }
    };
    export function pushGuildTeamApply(userData) {
        var isTip = G_UserData.getGuild().isTipInvite();
        if (!isTip) {
            return;
        }
        // var noticeView = new (require('GuildPushTeamApply'))();
        var data: any = {};
        data.imageRes = Path.getTrainAcceptImg('accept_train');
        data.name = userData.getName();
        data.nameColor = Colors.getOfficialColor(userData.getOffice_level());
        data.targetName = '';
        data.covertId = userData.getCovertId();
        data.limitLevel = userData.getLimit_level();
        data.level = userData.getLevel();
        data.imageBg = Path.getTrainInviteBg('img_train_shouye');
        if (!userData.isEndInvite()) {
            data.endTime = userData.getInviteEndTime();
        }

        cc.resources.load("prefab/guildTrain/GuildPushTeamApply", cc.Prefab, () => {
            let noticeView = Util.getNode("prefab/guildTrain/GuildPushTeamApply", GuildPushTeamApply) as GuildPushTeamApply;
            noticeView.setParam(userData);
            noticeView.slideOut(data, [
                'fight',
                'seasonSport',
                'seasonCompetitive',
                'qinTomb',
                'groups'
            ]);
        });
    };
    export function autoEndGuildTrain() {
    };
}