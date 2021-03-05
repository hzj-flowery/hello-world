const { ccclass, property } = cc._decorator;

import CommonHeroIcon from '../../../ui/component/CommonHeroIcon'

import CommonButtonLevel3 from '../../../ui/component/CommonButtonLevel3'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { G_UserData, G_SceneManager } from '../../../init';
import { GuildDataHelper } from '../../../utils/data/GuildDataHelper';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';
import { Lang } from '../../../lang/Lang';
import { TextHelper } from '../../../utils/TextHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import PopupAlert from '../../../ui/PopupAlert';
import { RichTextExtend } from '../../../extends/RichTextExtend';

@ccclass
export default class GuildMemberListCellTrain extends ListViewCellBase {

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
        type: CommonButtonLevel3,
        visible: true
    })
    _buttonLook: CommonButtonLevel3 = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _contributionTotal: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _power: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _contributionWeek: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textActiveRate: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _duties: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _level: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true,
        override: true
    })
    _name: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _official: cc.Sprite = null;

    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _fileNodeIcon: CommonHeroIcon = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _online: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _train: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _invite: cc.Sprite = null;
    _trainData: any;

    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._buttonLook.setString(Lang.get('guild_btn_check'));
    }
    updateData(data, index) {
        this._trainData = data;
        var heroBaseId = data.getBase_id();
        var heroName = data.getName();
        var official = data.getOfficer_level();
        var [officialName, officialColor, officialInfo] = UserDataHelper.getOfficialInfo(official);
        var level = data.getLevel();
        var power = TextHelper.getAmountText1(data.getPower());
        var position = data.getPosition();
        var duties = UserDataHelper.getGuildDutiesName(position);
        var contribution = TextHelper.getAmountText1(data.getContribution());
        var contributionWeek = TextHelper.getAmountText1(data.getWeek_contribution());
        var [onlineText, color] = UserDataHelper.getOnlineText(data.getOffline());
        var activityNum = G_UserData.getLimitTimeActivity().hasActivityNum();
        var activeRate = Math.floor(data.getActive_cnt() * 100 / activityNum);
        this._fileNodeIcon.updateUI(heroBaseId);
        UIHelper.loadTexture(this._official, Path.getTextHero(officialInfo.picture));
        this._official.sizeMode = cc.Sprite.SizeMode.RAW;
        this._name.string = (heroName);
        this._name.node.color = (officialColor);
        UIHelper.updateTextOfficialOutline(this._name.node, official);
        this._level.string = (level);
        this._power.string = (power);
        this._duties.string = (duties);
        this._contributionWeek.string = (contributionWeek);
        this._contributionTotal.string = (contribution);
        this._textActiveRate.string = (Lang.get('guild_member_active_rate', { value: activeRate }));
        this._online.string = (onlineText);
        this._online.node.color = (color);
        this._setTrainIcon();
        if (index % 2 == 0) {
            UIHelper.loadTexture(this._panel, Path.getComplexRankUI('img_com_ranking04'));
        } else {
            UIHelper.loadTexture(this._panel, Path.getComplexRankUI('img_com_ranking05'));
        }
    }
    _setTrainIcon() {
        var trainType = this._trainData.getTrainType();
        var active = trainType > 3;
        var srcPath = trainType > 3 ? trainType - 3 : trainType;
        this._train.node.active = (trainType <= 3);
        UIHelper.loadTexture(this._train, Path.getTrainIcon('btn_training' + srcPath));
        if (G_UserData.getGuild().getInviteTrainListById(this._trainData.getUid()) != null) {
            this._invite.node.active = (true);
            if (trainType <= 3) {
                this._train.node.active = (false);
            }
        } else {
            this._invite.node.active = (false);
            if (trainType <= 3) {
                this._train.node.active = (true);
            }
        }
    }
    onButtonTrain(sender, state) {
        var userId = this._trainData.getUid();
        if (userId == G_UserData.getBase().getId()) {
            var content = Lang.get('guild_self_train');
            var okCallback = function () {
                G_UserData.getGuild().c2sQueryGuildTrain(userId);
            }
            G_SceneManager.openPopup("prefab/common/PopupAlert", (popup: PopupAlert) => {
                popup.init(Lang.get('guild_self_train_alert'), "", okCallback, null, null);
                popup.setBtnStr(Lang.get('guild_self_tanin_ok'), Lang.get('guild_self_tanin_concel'));
                let richText = RichTextExtend.createWithContent(content);
                popup.addRicheTextChild(richText);
                popup.openWithAction();
            });
        } else {
            this._invite.node.active = (true);
            this._train.node.active = (false);
            G_UserData.getGuild().c2sQueryGuildTrain(userId);

        }
    }
    onButtonLook() {
        this.dispatchCustomCallback();
    }

}