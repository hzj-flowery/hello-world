import ListViewCellBase from "../../../ui/ListViewCellBase";
import { G_UserData } from "../../../init";
import { GuildDataHelper } from "../../../utils/data/GuildDataHelper";
import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";
import { Lang } from "../../../lang/Lang";
import { TextHelper } from "../../../utils/TextHelper";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildMemberListCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _panel: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _official: cc.Sprite = null;

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
        type: cc.Label,
        visible: true
    })
    _duties: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textActiveRate: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _online: cc.Label = null;


    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }

    updateData(data, index) {
        var heroBaseId = data.getBase_id();
        var heroName = data.getName();
        var official = data.getOfficer_level();
        var res = GuildDataHelper.getOfficialInfo(official);
        var officialColor = res[1];
        var officialInfo = res[2];
        var level = data.getLevel();
        var power = TextHelper.getAmountText1(data.getPower());
        var position = data.getPosition();
        var duties = GuildDataHelper.getGuildDutiesName(position);
        var contribution = TextHelper.getAmountText1(data.getContribution());
        var contributionWeek = TextHelper.getAmountText1(data.getWeek_contribution());
        var [onlineText,color] = UserDataHelper.getOnlineText(data.getOffline());
        var activityNum = G_UserData.getLimitTimeActivity().hasActivityNum();
        var activeRate = Math.floor(data.getActive_cnt() * 100 / activityNum);
        UIHelper.loadTexture(this._official, Path.getTextHero(officialInfo.picture));
        this._official.sizeMode = cc.Sprite.SizeMode.RAW;
        // this._official.ignoreContentAdaptWithSize(true);
        this._name.string = (heroName);
        this._name.node.color = (officialColor);
        UIHelper.updateTextOfficialOutline(this._name.node, official);
        this._level.string = (level);
        this._power.string = (power);
        this._duties.string = (duties);
        this._textActiveRate.string = (Lang.get('guild_member_active_rate', { value: activeRate }));
        this._online.string = (onlineText);
        this._online.node.color = (color);
        if (index % 2 == 0) {
            UIHelper.loadTexture(this._panel, Path.getUICommon('img_com_board_list02b'));
        } else {
            UIHelper.loadTexture(this._panel, Path.getUICommon('img_com_board_list02a'));
        }
    }
    onButtonLook() {
        this.dispatchCustomCallback(null);
    }

}