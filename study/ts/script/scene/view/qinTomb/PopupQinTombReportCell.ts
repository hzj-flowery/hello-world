import { G_UserData, G_ServerTime, Colors } from "../../../init";
import { Lang } from "../../../lang/Lang";
import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";
import CommonHeroIcon from "../../../ui/component/CommonHeroIcon";
import CommonHeadFrame from "../../../ui/component/CommonHeadFrame";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { TextHelper } from "../../../utils/TextHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupQinTombReportCell extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _resourceNode: cc.Node = null;

    @property({ type: cc.Label, visible: true })
    _textReportResult: cc.Label = null;

    @property({ type: cc.Sprite, visible: true })
    _imageLeftResult: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageRightResult: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _nodePlayer1: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _nodePlayer2: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _nodePlayer3: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _nodePlayer4: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _nodePlayer5: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _nodePlayer6: cc.Node = null;

    @property({ type: cc.Label, visible: true })
    _textTimeLeft: cc.Label = null;

    public onLoad() {
        this.node.name = "PopupQinTombReportCell";
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }

    private _isSelfAttack(reportList) {
        for (let i in reportList) {
            var value = reportList[i];
            if (value.attack.user_id == G_UserData.getBase().getId()) {
                return true;
            }
        }
        return false;
    }

    public updateUI(report, index) {
        var reportList = report.report;
        var is_win = report.is_win;
        var report_type = report.report_type || 1;
        if (report_type == 1) {
            this._textReportResult.string = (Lang.get('qin_tomb_report1'));
        } else {
            this._textReportResult.string = (Lang.get('qin_tomb_report2'));
        }
        if (report_type == 1) {
            if (is_win) {
                UIHelper.loadTexture(this._imageLeftResult, Path.getBattleFont('txt_com_battle_v05'))
                UIHelper.loadTexture(this._imageRightResult, Path.getBattleFont('txt_com_battle_f05'))
            } else {
                UIHelper.loadTexture(this._imageLeftResult, Path.getBattleFont('txt_com_battle_f05'))
                UIHelper.loadTexture(this._imageRightResult, Path.getBattleFont('txt_com_battle_v05'))
            }
        } else if (report_type == 2) {
            if (is_win) {
                UIHelper.loadTexture(this._imageRightResult, Path.getBattleFont('txt_com_battle_v05'))
                UIHelper.loadTexture(this._imageLeftResult, Path.getBattleFont('txt_com_battle_f05'))
            } else {
                UIHelper.loadTexture(this._imageRightResult, Path.getBattleFont('txt_com_battle_f05'))
                UIHelper.loadTexture(this._imageLeftResult, Path.getBattleFont('txt_com_battle_v05'))
            }
        }
        for (let i = 0; i < reportList.length; i++) {
            var value = reportList[i];
            var attack = value.attack;
            var defense = value.defense;
            var result = value.result;
            this.updateHeroIcon(i, attack, result);
            if (result == 1) {
                this.updateHeroIcon(i + 3, defense, 2);
            } else if (result == 2) {
                this.updateHeroIcon(i + 3, defense, 1);
            } else if (result == 0) {
                this.updateHeroIcon(i + 3, defense, 0);
            }
        }
        var leftTime = report.report_time;
        if (!leftTime) {
            this._textTimeLeft.node.active = (false);
        } else {
            this._textTimeLeft.node.active = (true);
            this._textTimeLeft.string = (G_ServerTime.getPassTime(leftTime));
        }
    }

    public onEnter() {
    }

    public onExit() {
    }

    public updateHeroIcon(index, teamUserInfo, result) {
        var nodePlayer: cc.Node = this['_nodePlayer' + (index + 1)];
        if (nodePlayer == null) {
            return;
        }
        var heroIcon = nodePlayer.getChildByName('FileNode_1').getComponent(CommonHeroIcon);
        var textGroup = nodePlayer.getChildByName('Text_group').getComponent(cc.Label);
        var textPower = nodePlayer.getChildByName('Text_power').getComponent(cc.Label);
        textGroup.string = (Lang.get('qin_tomb_report_guild1'));
        textPower.string = (Lang.get('qin_tomb_report_power1'));
        var frameNode = nodePlayer.getChildByName('CommonHeadFrame').getComponent(CommonHeadFrame);
        let imageHead = nodePlayer.getChildByName("Image_head").getComponent(cc.Sprite);
        if (result == 2) {
            UIHelper.loadTexture(imageHead, Path.getTextBattle('txt_com_battle_win'));
        }
        if (result == 1) {
            UIHelper.loadTexture(imageHead, Path.getTextBattle('txt_com_battle_lose'));
        }
        if (result == 0) {
            UIHelper.loadTexture(imageHead, Path.getTextBattle('txt_com_battle_ping'));
        }
        var heroName = nodePlayer.getChildByName('Text_PlayerName').getComponent(cc.Label);
        if (teamUserInfo == null) {
            heroIcon.refreshToEmpty(true);
            heroName.string = (Lang.get('qin_tomb_empty'));
            return;
        }
        var [avatarBaseId, avatarTable] = UserDataHelper.convertAvatarId(teamUserInfo);
        heroIcon.updateIcon(avatarTable);
        frameNode.updateUI(teamUserInfo.head_frame_id, heroIcon.node.scale)
        if (teamUserInfo.office_level > 0) {
            heroName.node.color = (Colors.getOfficialColor(teamUserInfo.office_level));
            UIHelper.updateTextOfficialOutline(heroName.node, teamUserInfo.office_level);
        }
        heroName.string = (teamUserInfo.name);
        if (teamUserInfo.guild_name != '') {
            textGroup.string = (Lang.get('qin_tomb_report_guild', { name: teamUserInfo.guild_name }));
        }
        var power = TextHelper.getAmountText(teamUserInfo.power);
        textPower.string = (Lang.get('qin_tomb_report_power', { name: power }));
    }
}