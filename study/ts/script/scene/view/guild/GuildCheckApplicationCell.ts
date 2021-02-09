const { ccclass, property } = cc._decorator;

import CommonButtonSelect from '../../../ui/component/CommonButtonSelect'

import CommonButtonDelete from '../../../ui/component/CommonButtonDelete'

import CommonHeroIcon from '../../../ui/component/CommonHeroIcon'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import { GuildConst } from '../../../const/GuildConst';
import { Path } from '../../../utils/Path';
import { G_UserData } from '../../../init';
import { UserBaseData } from '../../../data/UserBaseData';
import UIHelper from '../../../utils/UIHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { TextHelper } from '../../../utils/TextHelper';
import { GuildDataHelper } from '../../../utils/data/GuildDataHelper';
import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight';
import CommonButtonLevel1Normal from '../../../ui/component/CommonButtonLevel1Normal';

@ccclass
export default class GuildCheckApplicationCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panel: cc.Node = null;

    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _fileNodeIcon: CommonHeroIcon = null;

    @property({
        type: cc.Label,
        visible: true,
        override: true
    })
    _name: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _level: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _power: cc.Label = null;

    @property({
        type: CommonButtonLevel1Normal,
        visible: true
    })
    _buttonAgree: CommonButtonLevel1Normal = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonRefuse: CommonButtonLevel1Highlight = null;

    _data: any;


    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._buttonRefuse.addClickEventListenerExDelay(handler(this, this._onButtonRefuse), 0.1);
        this._buttonAgree.addClickEventListenerExDelay(handler(this, this._onButtonAgree), 0.1);
        var userMemberData = G_UserData.getGuild().getMyMemberData();
        var userPosition = userMemberData.getPosition();
        var isHave = UserDataHelper.isHaveJurisdiction(userPosition, GuildConst.GUILD_JURISDICTION_6);
        if (isHave) {
            this._buttonRefuse.setString(Lang.get('guild_btn_refuse'));
            this._buttonAgree.setString(Lang.get('guild_btn_agree'));
            this._buttonRefuse.node.active = (true);
            this._buttonAgree.node.active = (true);
        } else {
            this._buttonRefuse.node.active = (false);
            this._buttonAgree.node.active = (false);
        }
    }
    _onButtonRefuse() {
        this.dispatchCustomCallback(GuildConst.GUILD_CHECK_APPLICATION_OP2);
    }
    _onButtonAgree() {
        this.dispatchCustomCallback(GuildConst.GUILD_CHECK_APPLICATION_OP1);
    }
    _initIcon() {
        this._fileNodeIcon.setTouchEnabled(true);
        this._fileNodeIcon.setCallBack(handler(this, this.onClickHeroHead));
    }
    onClickHeroHead(sender) {
        if (this._data) {
            G_UserData.getBase().c2sGetUserBaseInfo(this._data.getUid());
        }
    }
    updateData(data) {
        this._initIcon();
        this._data = data;
        var heroBaseId = data.getPlayer_info().covertId;
        var heroName = data.getName();
        var official = data.getOfficer_level();
        var res = GuildDataHelper.getOfficialInfo(official);
        var officialColor = res[1];
        var level = data.getLevel();
        var power = TextHelper.getAmountText1(data.getPower());
        this._fileNodeIcon.updateIcon(data.getPlayer_info(), null, data.getHead_frame_id());
        // this._official.ignoreContentAdaptWithSize(true);
        this._name.string = (heroName);
        UIHelper.updateTextOfficialOutline(this._name.node, official);
        this._name.node.color = (officialColor);
        this._level.string = (level);
        this._power.string = (power);
    }

}