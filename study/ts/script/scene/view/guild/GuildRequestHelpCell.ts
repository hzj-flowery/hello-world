const { ccclass, property } = cc._decorator;

import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'

import CommonProgressNodeSmall from '../../../ui/component/CommonProgressNodeSmall'

import CommonFragmentIcon from '../../../ui/component/CommonFragmentIcon'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { Lang } from '../../../lang/Lang';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';

@ccclass
export default class GuildRequestHelpCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPos: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panel1: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _spriteAdd: cc.Sprite = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonAdd: cc.Button = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panel2: cc.Node = null;

    @property({
        type: CommonFragmentIcon,
        visible: true
    })
    _fileNodeIcon: CommonFragmentIcon = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textFragName: cc.Label = null;

    @property({
        type: CommonProgressNodeSmall,
        visible: true
    })
    _commonProgressBar: CommonProgressNodeSmall = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textHelping: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCanReceiveCountTitle: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCanReceiveCount: cc.Label = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonReceive: CommonButtonLevel1Highlight = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageReach: cc.Sprite = null;
    public static readonly MAX_FRAGMENT = 5;

    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    updateData(pos, data) {
        this._textPos.string = (Lang.get('guild_help_request_pos', { pos: pos }));
        if (data) {
            this._panel1.active = (false);
            this._panel2.active = (true);
            var fragmentId = data.getHelp_id();
            var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_FRAGMENT, fragmentId);
            var alreadyHelpCount = data.getAlready_help();
            var limitMax = data.getLimit_max();
            var alreadyGet = data.getAlready_get();
            this._fileNodeIcon.updateUI(fragmentId, null, null);
            this._textFragName.string = (param.name);
            this._textFragName.node.color = (param.icon_color);
            // this._commonProgressBar._init();
            this._commonProgressBar.setPercent(alreadyHelpCount, limitMax);
            this._commonProgressBar.showDivider(true, GuildRequestHelpCell.MAX_FRAGMENT, alreadyHelpCount, limitMax);
            this._buttonReceive.setString(Lang.get('guild_help_btn_receive'));
            this._buttonReceive.setEnabled(true);
            if (alreadyGet == limitMax) {
                this._imageReach.node.active = (true);
                this._textHelping.node.active = (false);
                this._buttonReceive.node.active = (false);
                this._textCanReceiveCountTitle.node.active = (false);
                this._textCanReceiveCount.node.active = (false);
            } else {
                if (alreadyGet == alreadyHelpCount) {
                    this._textHelping.node.active = (true);
                    this._textCanReceiveCountTitle.node.active = (false);
                    this._textCanReceiveCount.node.active = (false);
                    this._imageReach.node.active = (false);
                    this._buttonReceive.node.active = (true);
                    this._buttonReceive.setEnabled(false);
                    this._buttonReceive.setString(Lang.get('guild_help_btn_helping'));
                } else {
                    this._buttonReceive.setVisible(true);
                    this._textCanReceiveCountTitle.node.active = (true);
                    this._textCanReceiveCount.node.active = (true);
                    this._textHelping.node.active = (false);
                    this._imageReach.node.active = (false);
                    this._textCanReceiveCount.string = (Lang.get('guild_help_can_receive_count', { count: alreadyHelpCount - alreadyGet }));
                }
            }
        } else {
            this._panel1.active = (true);
            this._panel2.active = (false);
        }
    }
    onButtonAddClicked() {
        this.dispatchCustomCallback('add');
    }
    onButtonReceiveClicked() {
        this.dispatchCustomCallback('receive');
    }

}