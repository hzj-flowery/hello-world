const { ccclass, property } = cc._decorator;

import CommonAttrNode from '../../../ui/component/CommonAttrNode'

import CommonAvatarIcon from '../../../ui/component/CommonAvatarIcon'

import CommonDetailTitleWithBg from '../../../ui/component/CommonDetailTitleWithBg'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { AvatarDataHelper } from '../../../utils/data/AvatarDataHelper';
import { Colors, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import { CommonDetailModule } from '../../../ui/component/CommonDetailModule';

@ccclass
export default class AvatarDetailCombinationModule extends ListViewCellBase implements CommonDetailModule {


    @property({
        type: cc.Sprite,
        visible: true
    })
    _panelBg: cc.Sprite = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _nodeTitle: CommonDetailTitleWithBg = null;

    @property({
        type: CommonAvatarIcon,
        visible: true
    })
    _fileNodeIcon1: CommonAvatarIcon = null;

    @property({
        type: CommonAvatarIcon,
        visible: true
    })
    _fileNodeIcon2: CommonAvatarIcon = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageAdd: cc.Sprite = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr1: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr2: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr3: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr4: CommonAttrNode = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;
    private _showId: number;
    private _isOnlyShow: boolean;
    create() {
        var contentSize = this._panelBg.node.getContentSize();
        this.node.setContentSize(contentSize);
        this._nodeTitle.setFontSize(24);
    }
    updateUI(showId, isOnlyShow?) {
        this._showId = showId;
        this._isOnlyShow = isOnlyShow;
    }
    enter() {
        var is = AvatarDataHelper.isHaveAvatarShow(this._showId);
        if (this._isOnlyShow == true) {
            is = false;
        }
        var nameColor = is && Colors.BRIGHT_BG_GREEN || Colors.SYSTEM_TARGET_RED;
        var attrColor = is && Colors.BRIGHT_BG_GREEN || Colors.BRIGHT_BG_ONE;
        var showConfig = AvatarDataHelper.getAvatarShowConfig(this._showId);
        this._textName.string = (showConfig.name);
        this._textName.node.color = (nameColor);
        for (var i = 1; i <= 2; i++) {
            var avatarId = showConfig['avatar_id' + i];
            this['_fileNodeIcon' + i].onLoad();
            this['_fileNodeIcon' + i].updateUI(avatarId);
            if (this._isOnlyShow != true) {
                var isHave = G_UserData.getAvatar().isHaveWithBaseId(avatarId);
                this['_fileNodeIcon' + i].setIconMask(!isHave);
            }
        }
        var attrInfo = AvatarDataHelper.getShowAttr(this._showId);
        for (var i = 1; i <= 4; i++) {
            var info = attrInfo[i - 1];
            if (info) {
                var attrId = info.attrId;
                var attrValue = info.attrValue;
                this['_nodeAttr' + i].updateView(attrId, attrValue);
                this['_nodeAttr' + i].setValueColor(attrColor);
                this['_nodeAttr' + i].alignmentCenter();
                this['_nodeAttr' + i].setVisible(true);
            } else {
                this['_nodeAttr' + i].setVisible(false);
            }
        }
        if (attrInfo.length == 1) {
            this['_nodeAttr1'].node.setPosition(cc.v2(201, 36));
        }
    }
    setTitle(index) {
        var index2Text = {
            1: '一',
            2: '二',
            3: '三',
            4: '四',
            5: '五',
            6: '六',
            7: '七',
            8: '八',
            9: '九',
            10: '十'
        };
        var text = index2Text[index];
        this._nodeTitle.setTitle(Lang.get('avatar_detail_combination_title', { index: text }));
    }

    numberOfCell(): number {
        return 1;
    }
    cellAtIndex(i: number): cc.Node {
        this.create();
        this.enter();
        return this.node;
    }
}
