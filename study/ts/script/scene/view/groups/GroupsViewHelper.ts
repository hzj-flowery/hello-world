import { FunctionConst } from "../../../const/FunctionConst";
import { GroupsConst } from "../../../const/GroupsConst";
import { Colors, G_Prompt, G_SceneManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import PopupSystemAlert from "../../../ui/PopupSystemAlert";
import { GroupsDataHelper } from "../../../utils/data/GroupsDataHelper";
import { Path } from "../../../utils/Path";
import GroupsMainNode from "./GroupsMainNode";

export namespace GroupsViewHelper {
    export function quitGroupTip() {
        var data = G_UserData.getGroups().getMyGroupData();
        if (data == null) {
            return;
        }
        var isSelfLeader = G_UserData.getGroups().isSelfLeader();
        var content = '';
        var onBtnGo = null;
        var onBtnCancel = null;
        if (isSelfLeader) {
            content = Lang.get('groups_leader_quit_content');
            onBtnGo = function () {
                G_UserData.getGroups().c2sLeaveTeam(GroupsConst.LEADER_DISSOLVE);
            };
            onBtnCancel = function () {
                G_UserData.getGroups().c2sLeaveTeam(GroupsConst.NORMAL_QUIT);
            };
        } else {
            content = Lang.get('groups_quit_content');
            onBtnGo = function () {
                G_UserData.getGroups().c2sLeaveTeam(GroupsConst.NORMAL_QUIT);
            };
            onBtnCancel = null;
        }
        G_SceneManager.openPopup(Path.getPrefab("PopupSystemAlert", "common"), (popup: PopupSystemAlert) => {
            popup.setup(Lang.get('groups_quit_title'), content, onBtnGo, onBtnCancel);
            if (isSelfLeader) {
                popup.setBtnOk(Lang.get('groups_btn_name_dissolve'));
                popup.setBtnCancel(Lang.get('groups_btn_name_quit'));
                popup.setCloseCallback(function () {
                });
            }
            popup.setCheckBoxVisible(false);
            popup.setCloseVisible(true);
            popup.openWithAction();
        })
    };
    export function pushApply(userData) {
        cc.resources.load(Path.getPrefab("GroupsMainNode", "groups"), cc.Prefab, (err, res: cc.Prefab) => {
            if (err != null || res == null) {
                return;
            }
            var noticeView = cc.instantiate(res).getComponent(GroupsMainNode);
            var data: any = {};
            var targetName = userData.getGuild_name();
            if (targetName == '') {
                targetName = Lang.get('siege_rank_no_crops');
            }
            data.showImageTips = false;
            data.imageRes = Path.getQinTomb('img_qintomb_shouye1');
            data.name = userData.getName();
            data.nameColor = Colors.getOfficialColor(userData.getOffice_level());
            data.targetName = targetName;
            data.covertId = userData.getCovertId();
            data.limitLevel = userData.getLimitLevel();
            data.headFrameId = userData.getHead_frame_id();
            data.level = userData.getLevel();
            if (!userData.isEndApply()) {
                data.endTime = userData.getApplyEndTime();
            }
            noticeView.setParam(userData, GroupsConst.APPLY);
            noticeView.slideOut(data, ['groups']);
        })
    };
    export function pushInvite(userData, teamId, teamType, teamTarget) {
        var isTip = G_UserData.getGroups().isTipInvite();
        if (!isTip) {
            return;
        }
        cc.resources.load(Path.getPrefab("GroupsMainNode", "groups"), cc.Prefab, (err, res: cc.Prefab) => {
            if (err != null || res == null) {
                return;
            }
            var noticeView = cc.instantiate(res).getComponent(GroupsMainNode);
            var data: any = {};
            data.showImageTips = true;
            data.imageRes = Path.getQinTomb('img_qintomb_shouye2');
            data.name = userData.getName();
            data.nameColor = Colors.getOfficialColor(userData.getOffice_level());
            data.targetName = GroupsDataHelper.getTeamTargetConfig(teamTarget).name;
            data.covertId = userData.getCovertId();
            data.limitLevel = userData.getLimitLevel();
            data.headFrameId = userData.getHead_frame_id();
            data.level = userData.getLevel();
            if (!userData.isEndInvite()) {
                data.endTime = userData.getInviteEndTime();
            }
            noticeView.setParam(userData, GroupsConst.INVITE, teamId);
            noticeView.slideOut(data, [
                'fight',
                'seasonSport',
                'seasonCompetitive'
            ]);
        })
    };
    export function popupEnterActiveScene(memberData) {
        var teamType = memberData.getTeam_type();
        var teamTarget = memberData.getTeam_target();
        var targetCfg = GroupsDataHelper.getTeamTargetConfig(teamTarget);
        var targetName = targetCfg.name;
        function onBtnGo() {
            G_UserData.getGroups().c2sTeamEnterScene(teamType);
        }
        function onBtnCancel() {
        }
        G_SceneManager.openPopup(Path.getPrefab("PopupSystemAlert", "common"), (popup: PopupSystemAlert) => {
            popup.setup(Lang.get('groups_enter_scene_title'), Lang.get('groups_Enter_scene_content'), onBtnGo, onBtnCancel);
            popup.setBtnOk(Lang.get('groups_btn_enter_scene'));
            popup.setBtnCancel(Lang.get('groups_target_cancel'));
            popup.setCheckBoxVisible(false);
            popup.setCloseVisible(true);
            popup.openWithAction();

        });
    };
    export function popupAppTransferLeaderNotice(userId, userName, endTime) {
        function onBtnGo() {
            G_UserData.getGroups().c2sOpTransferLeader(userId, GroupsConst.OK);
        }
        function onBtnCancel() {
            G_UserData.getGroups().c2sOpTransferLeader(userId, GroupsConst.NO);
        }
        G_SceneManager.openPopup(Path.getPrefab("PopupSystemAlert", "common"), (popup: PopupSystemAlert) => {
            popup.setup(Lang.get('groups_transfer_title'), Lang.get('groups_transfer_content', { name: userName }), onBtnGo, onBtnCancel);
            popup.setBtnOk(Lang.get('groups_agree'));
            popup.setBtnCancel(Lang.get('groups_refuse'));
            popup.setCheckBoxVisible(false);
            popup.setCloseVisible(true);
            // popup.setAutoContent(endTime);
            popup.openWithAction();
        });

    };
    export function popupGroupsAgreementDlg() {
        var runningScene = G_SceneManager.getRunningScene();
        var sceneName = runningScene.getName();
        if (sceneName == 'fight') {
            return;
        }
        if (sceneName == 'guildTrain' && !G_UserData.getGuild().getTrainEndState()) {
            return;
        }
        var popupView = G_SceneManager.getRunningScene().getPopupByName('PopupGroupsAgreementView');
        if (popupView) {
            return;
        }
        G_SceneManager.openPopup(Path.getPrefab("PopupGroupsAgreementView", "groups"));
    };
    export function checkIsCanCreate(groupType):any[] {
        var functionId = GroupsDataHelper.getTeamInfoConfig(groupType).function_id;
        function func() {
            G_Prompt.showTip(Lang.get('groups_can_not_create_tips_1'));
        }
        if (functionId == FunctionConst.FUNC_MAUSOLEUM) {
            var leftSec = GroupsDataHelper.getMyActiveLeftTime(functionId);
            var assistTime = GroupsDataHelper.getMyActiveAssistTime(functionId);
            if (leftSec + assistTime <= 0) {
                return [
                    false,
                    func
                ];
            }
        }
        return [true, null];
    };
    export function checkIsCanApplyJoin(groupType): any[] {
        var functionId = GroupsDataHelper.getTeamInfoConfig(groupType).function_id;
        function func() {
            G_Prompt.showTip(Lang.get('groups_can_not_create_tips_1'));
        }
        if (functionId == FunctionConst.FUNC_MAUSOLEUM) {
            var leftSec = GroupsDataHelper.getMyActiveLeftTime(functionId);
            var assistTime = GroupsDataHelper.getMyActiveAssistTime(functionId);
            if (leftSec + assistTime <= 0) {
                return [
                    false,
                    func
                ];
            }
        }
        return [true, null];
    };
}