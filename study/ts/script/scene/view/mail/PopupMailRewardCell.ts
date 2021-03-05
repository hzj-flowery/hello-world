import ListViewCellBase from "../../../ui/ListViewCellBase";
import { MailHelper } from "./MailHelper";
import { Path } from "../../../utils/Path";
import { Colors } from "../../../init";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupMailRewardCell extends ListViewCellBase {

    public static readonly NORMAL_IMGS = {
        bg: 'bth_mail01_nml',
        unOpenIcon: 'img_mail01_nml',
        openIcon: 'img_mail01_down'
    };
    public static readonly SELECT_IMGS = {
        bg: 'bth_mail01_down',
        unOpenIcon: 'img_mail01_nml',
        openIcon: 'img_mail01_down'
    };
    public static readonly COLOR = {
        select: new cc.Color(159, 74, 12),
        normal: new cc.Color(86, 104, 156)
    };
    public static readonly LABEL_IMGS = {
        [3]: 'img_iconsign_juntuan',
        [2]: 'img_iconsign_tonggao'
    };
    public static readonly ICONBG = {
        select: 'img_mailbg01',
        normal: 'img_mailbg02'
    };

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageIcon: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLabelType: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTitle: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRewardHint: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textSendTime: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageIconBg: cc.Sprite = null;

    _mailInfo: any;
    _isSelect: boolean;

    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height + this._resourceNode.y);
        this._imageIcon.sizeMode = cc.Sprite.SizeMode.RAW;
        // this._resourceNode.setSwallowTouches(false);
        this._imageBg.sizeMode = cc.Sprite.SizeMode.RAW;
    }
    updateUI(mailInfo, index, selectIndex) {
        if (mailInfo == null) {
            // assert(false, 'PopupMailRewardCell:updateUI mailInfo can not be nil ');
        }
        this._mailInfo = mailInfo;
        this._index = index;
        this._isSelect = index == selectIndex;
        var imgs = this._isSelect ? PopupMailRewardCell.SELECT_IMGS : PopupMailRewardCell.NORMAL_IMGS;
        MailHelper.updateRewardCell(mailInfo, this._textTitle, null);
        var hasReward = mailInfo.awards && 1 <= mailInfo.awards.length;
        var isShowRewardHint = hasReward && !mailInfo.isRead;
        this._textRewardHint.node.active = (isShowRewardHint);
        UIHelper.loadTexture(this._imageIcon, Path.getMail(mailInfo.isRead ? imgs.openIcon : imgs.unOpenIcon));
        UIHelper.loadTexture(this._imageIconBg, Path.getMailIconBg(this._isSelect ? PopupMailRewardCell.ICONBG.select : PopupMailRewardCell.ICONBG.normal));
        UIHelper.loadTexture(this._imageBg, Path.getMail(imgs.bg));
        this._textTitle.node.color = (this._isSelect ? PopupMailRewardCell.COLOR.select : PopupMailRewardCell.COLOR.normal);
        this._textRewardHint.node.color = (this._isSelect ? Colors.BRIGHT_BG_GREEN : Colors.BRIGHT_BG_GREEN);
        this._textSendTime.string = (MailHelper.getSendTimeShortString(mailInfo.time));
        if (PopupMailRewardCell.LABEL_IMGS[mailInfo.template.label_type]) {
            this._imageLabelType.node.active = (true);
            UIHelper.loadTexture(this._imageLabelType, Path.getTextSignet(PopupMailRewardCell.LABEL_IMGS[mailInfo.template.label_type]));
        } else {
            this._imageLabelType.node.active = (false);
        }
    }
    setSelected(isSelect) {
        this.updateUI(this._mailInfo, this._index, isSelect ? this._index : -1);
    }
    _onTouchCallBack(sender, state) {
        this.onItemClick(this);
    }
    onItemClick(sender) {
        // var curSelectedPos = sender.getTag();
        // logWarn('PopupMailRewardCell:_onIconClicked  ' + curSelectedPos);
        this.dispatchCustomCallback(this);
    }
}