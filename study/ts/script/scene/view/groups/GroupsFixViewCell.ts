const { ccclass, property } = cc._decorator;

import CommonHeadFrame from '../../../ui/component/CommonHeadFrame'

import CommonHeroIcon from '../../../ui/component/CommonHeroIcon'

import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'
import { Lang } from '../../../lang/Lang';
import { Colors, G_UserData, G_Prompt } from '../../../init';
import UIHelper from '../../../utils/UIHelper';
import { GroupsDataHelper } from '../../../utils/data/GroupsDataHelper';
import { GroupsConst } from '../../../const/GroupsConst';

@ccclass
export default class GroupsFixViewCell extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _resourceNode: cc.Node = null;
    @property({ type: cc.Sprite, visible: true })
    _bg: cc.Sprite = null;
    @property({ type: cc.Label, visible: true })
    _targetName: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _leaderName: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _textState: cc.Label = null;
    @property({ type: CommonButtonLevel1Highlight, visible: true })
    _btnOk: CommonButtonLevel1Highlight = null;
    @property({ type: cc.Sprite, visible: true })
    _btnImg: cc.Sprite = null;
    @property({ type: CommonHeroIcon, visible: true })
    _icon1: CommonHeroIcon = null;
    @property({ type: CommonHeadFrame, visible: true })
    _commonHeadFrame1: CommonHeadFrame = null;
    @property({ type: CommonHeroIcon, visible: true })
    _icon2: CommonHeroIcon = null;
    @property({ type: CommonHeadFrame, visible: true })
    _commonHeadFrame2: CommonHeadFrame = null;
    @property({ type: CommonHeroIcon, visible: true })
    _icon3: CommonHeroIcon = null;
    @property({ type: CommonHeadFrame, visible: true })
    _commonHeadFrame3: CommonHeadFrame = null;
    @property({ type: cc.Label, visible: true })
    _levelLimit: cc.Label = null;

    private _memberData;
    private _customCallback;
    private _index;

    public onLoad() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._btnOk.setString(Lang.get('groups_apply'));
    }

    public updateUI(index, memberData) {
        this._index = index;
        this._memberData = memberData;
        var maxLv = memberData.getMax_level();
        var minLv = memberData.getMin_level();
        var leaderData = memberData.getUserData(memberData.getTeam_leader());
        this._leaderName.string = (Lang.get('groups_leader_content', { name: memberData.getLeaderName() }));
        this._leaderName.node.color = (Colors.getOfficialColor(leaderData.getOffice_level()));
        UIHelper.updateTextOfficialOutline(this._leaderName.node, leaderData.getOffice_level());
        this._targetName.string = (Lang.get('qin_title'));
        this._levelLimit.string = (Lang.get('groups_level_limit_content', {
            min: minLv,
            max: maxLv
        }));
        this._updateList();
        var strState = '';
        if (memberData.isIs_scene()) {
            var name = GroupsDataHelper.getTeamTargetConfig(memberData.getTeam_target()).name;
            strState = Lang.get('groups_in_active_tip');
        }
        this._textState.string = (strState);
        var isEndApply = memberData.isEndApply();
        this._btnImg.node.active = (!isEndApply);
        this._btnOk.setVisible(isEndApply);
    }

    private _updateList() {
        var memberData = this._memberData;
        if (memberData) {
            for (let i = 0; i < GroupsConst.MAX_PLAYER_SIZE; i++) {
                var icon: CommonHeroIcon = this['_icon' + (i + 1)];
                var userData = memberData.getUserDataWithLocation(i + 1);
                if (userData) {
                    icon.updateUI(userData.getCovertId(), null, userData.getLimitLevel());
                    icon.showHeroUnknow(false);
                    var frameNode: CommonHeadFrame = this['_commonHeadFrame' + (i + 1)];
                    frameNode.updateUI(userData.getHead_frame_id(), icon.node.scale);
                    frameNode.setLevel(userData.getLevel());
                } else {
                    icon.showHeroUnknow(true);
                }
            }
        }
    }

    public onBtnOk() {
        var memberData = this._memberData;
        var maxLv = memberData.getMax_level();
        var minLv = memberData.getMin_level();
        var gameUserLevel = G_UserData.getBase().getLevel();
        if (gameUserLevel > maxLv || gameUserLevel < minLv) {
            G_Prompt.showTip(Lang.get('groups_level_not_requirement_tip'));
            return;
        }
        if (this._customCallback) {
            this._customCallback(this._index, 1);
        }
    }

    public setCustomCallback(customCallback: Function) {
        this._customCallback = customCallback;
    }
}