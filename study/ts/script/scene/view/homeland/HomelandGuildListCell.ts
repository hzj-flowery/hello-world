const { ccclass, property } = cc._decorator;

import CommonHeroIcon from '../../../ui/component/CommonHeroIcon'
import CommonListItem from '../../../ui/component/CommonListItem';
import { Path } from '../../../utils/Path';
import { G_UserData, Colors } from '../../../init';
import { HomelandHelp } from './HomelandHelp';
import { Lang } from '../../../lang/Lang';
import UIHelper from '../../../utils/UIHelper';

@ccclass
export default class HomelandGuildListCell extends CommonListItem {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBk: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPlayerName: cc.Label = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _commonBtn: cc.Button = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _commonBtnSelf: cc.Button = null;

    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _commonIcon: CommonHeroIcon = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTreeName: cc.Label = null;
    _userData: any;

    updateUI(index, datas) {
        var data = datas[0];
        var friendId = datas[1];
        if (data == null) {
            return;
        }
        var isVisible = index % 2 == 0;
        this._imageBk.node.active = (isVisible);
        var playerInfo = data.getPlayer_info();
        var heroName = data.getName();
        var official = data.getOfficer_level();
        var level = data.getLevel();
        var myGuildName = '';
        var myGuild = G_UserData.getGuild().getMyGuild();
        if (myGuild) {
            myGuildName = myGuild.getName();
        }
        var treeLevel = data.getHome_tree_level();
        if (treeLevel == null || treeLevel == 0) {
            treeLevel = 1;
        }
        var [cfgData] = HomelandHelp.getMainTreeCfg({ treeLevel: treeLevel });
        this._userData = data;
        this._textPlayerName.string = (heroName);
        this._textPlayerName.node.color = (Colors.getOfficialColor(official));
        var treeName = cfgData.name + Lang.get('homeland_main_tree_level' + treeLevel);
        this._textTreeName.string = (treeName);
        this._textTreeName.node.color = (Colors.getHomelandColor(treeLevel));
        UIHelper.enableOutline(this._textTreeName, Colors.getHomelandOutline(treeLevel), 1);
        var officialInfo = G_UserData.getBase().getOfficialInfo(official);
        this._commonIcon.updateIcon(playerInfo, null, data.getHead_frame_id());
        this._commonBtnSelf.node.active = (false);
        this._commonBtn.node.active = (false);
        if (data.getUid() != G_UserData.getBase().getId()) {
            this._commonBtn.node.active = (true);
        } else {
            if (friendId != G_UserData.getBase().getId()) {
                this._commonBtnSelf.node.active = (true);
            }
        }
    }
    onClickInvite(sender) {
        this.dispatchCustomCallback(this._userData.getUid());
    }
}