const { ccclass, property } = cc._decorator;

import CommonGemstoneIcon from '../../../ui/component/CommonGemstoneIcon'

import CommonDetailTitleWithBg from '../../../ui/component/CommonDetailTitleWithBg'
import { handler } from '../../../utils/handler';
import { HeroDataHelper } from '../../../utils/data/HeroDataHelper';
import { Lang } from '../../../lang/Lang';
import PopupBase from '../../../ui/PopupBase';
import PopupItemGuider from '../../../ui/PopupItemGuider';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import CommonListItem from '../../../ui/component/CommonListItem';

@ccclass
export default class PopupAwakePreviewCell extends CommonListItem {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCount1: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textCount2: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textCount3: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textCount4: cc.Label = null;
    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _nodeTitle: CommonDetailTitleWithBg = null;

    @property({
        type: CommonGemstoneIcon,
        visible: true
    })
    _icon1: CommonGemstoneIcon = null;

    @property({
        type: CommonGemstoneIcon,
        visible: true
    })
    _icon2: CommonGemstoneIcon = null;

    @property({
        type: CommonGemstoneIcon,
        visible: true
    })
    _icon3: CommonGemstoneIcon = null;

    @property({
        type: CommonGemstoneIcon,
        visible: true
    })
    _icon4: CommonGemstoneIcon = null;

    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._nodeTitle.setFontSize(24);
        
    }
    onEnter(){
        for (var i = 1; i <= 4; i++) {
            (this['_icon' + i] as CommonGemstoneIcon).setCallBack(handler(this, this._onClick));
            (this['_icon' + i] as CommonGemstoneIcon).setTouchEnabled(true);
        }
    }
    updateUI(itemId,data) {
        var updateItem = function (index, item) {
            if (item) {
                (this['_icon' + index] as CommonGemstoneIcon).node.active = (true);
                (this['_icon' + index] as CommonGemstoneIcon).updateUI(item.value, item.size);
                var ownCount = HeroDataHelper.getOwnCountOfAwakeGemstone(item.type, item.value);
                this['_textCount' + index].string = (ownCount);
                var needCount = item.size;
                if (ownCount >= needCount) {
                    (this['_icon' + index] as CommonGemstoneIcon).setIconMask(false);
                } else {
                    (this['_icon' + index] as CommonGemstoneIcon).setIconMask(true);
                }
            } else {
                (this['_icon' + index] as CommonGemstoneIcon).node.active = (false);
            }
        }.bind(this);
        var [awakeStar, awakeLevel] = HeroDataHelper.convertAwakeLevel(data[0].level);
        var strLevel = Lang.get('hero_awake_star_level', {
            star: awakeStar,
            level: awakeLevel
        });
        this._nodeTitle.setTitle(strLevel);
        var items = data[0].items;
        for (var i=1;i<=items.length;i++) {
            var item = items[i-1];
            updateItem(i, item);
        }
    }
    _onClick(sender, itemParams) {
        UIPopupHelper.popupItemGuiderByType(itemParams.item_type, itemParams.cfg.id)
    }

}