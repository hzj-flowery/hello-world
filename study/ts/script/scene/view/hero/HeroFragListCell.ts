const { ccclass, property } = cc._decorator;

import CommonListItem from '../../../ui/component/CommonListItem';
import CommonListCellBase from '../../../ui/component/CommonListCellBase';
import CommonButtonSwitchLevel1 from '../../../ui/component/CommonButtonSwitchLevel1';
import { assert } from '../../../utils/GlobleFunc';
import { G_UserData, Colors } from '../../../init';
import { HeroDataHelper } from '../../../utils/data/HeroDataHelper';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import { RichTextExtend } from '../../../extends/RichTextExtend';

@ccclass
export default class HeroFragListCell extends CommonListItem {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: CommonListCellBase,
        visible: true
    })
    _item1: CommonListCellBase = null;

    @property({
        type: CommonListCellBase,
        visible: true
    })
    _item2: CommonListCellBase = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTop1: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTop2: cc.Sprite = null;

    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _button1: CommonButtonSwitchLevel1 = null;

    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _button2: CommonButtonSwitchLevel1 = null;

    onLoad() {
        this._button1.addClickEventListenerEx(handler(this, this._onButtonClicked1));
        this._button2.addClickEventListenerEx(handler(this, this._onButtonClicked2));
    }

    _setTopImage(image, heroID) {
      //assert((image != null, 'HeroFragListCell:_setTopImage image == nil');
      //assert((heroID != null, 'HeroFragListCell:_setTopImage heroID == nil');
        var inBattle = G_UserData.getTeam().isInBattleWithBaseId(heroID);
        var isKaram = HeroDataHelper.isHaveKarmaWithHeroBaseId(heroID);
        var yokeCount = HeroDataHelper.getWillActivateYokeCount(heroID)[0];
        if (inBattle) {
            UIHelper.loadTexture(image, Path.getTextSignet('img_iconsign_shangzhen'));
            image.node.active = (true);
        } else if (isKaram) {
            UIHelper.loadTexture(image, Path.getTextSignet('img_iconsign_mingjiangce'));
            image.node.active = (true);
        } else if (yokeCount > 0) {
            UIHelper.loadTexture(image, Path.getTextSignet('img_iconsign_jiban'));
            image.node.active = (true);
        } else {
            image.node.active = (false);
        }
    }

    updateUI(index, itemLine) {
        for (var i = 1; i <= 2; i++) {
            var item = this['_item' + i];
            item.node.active = (false);
        }
        for (var j in itemLine) {
            var id = itemLine[j];
            this.updateCell(parseFloat(j) + 1, id);
        }
    }
    updateCell(index, data) {
        if (data) {
            if (typeof (data) != 'object') {
                return;
            }
            this['_item' + index].node.active = (true);
            this['_item' + index].updateUI(TypeConvertHelper.TYPE_FRAGMENT, data.getId());
            this['_item' + index].setTouchEnabled(true);
            var image = this['_imageTop' + index];
            this._setTopImage(image, data.getConfig().comp_value);
            var myCount = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_FRAGMENT, data.getId());
            var maxCount = data.getConfig().fragment_num;
            var isEnough = myCount >= maxCount;
            var btnDes = isEnough && Lang.get('fragment_list_cell_btn_compose') || Lang.get('fragment_list_cell_btn_get');
            var colorCount = isEnough && Colors.colorToNumber(Colors.BRIGHT_BG_GREEN) || Colors.colorToNumber(Colors.BRIGHT_BG_RED);
            this['_button' + index].setString(btnDes);
            if (isEnough) {
                this['_button' + index].switchToHightLight();
            } else {
                this['_button' + index].switchToNormal();
            }
            this['_button' + index].showRedPoint(isEnough);
            var content = Lang.get('fragment_count_text', {
                count1: myCount,
                color: colorCount,
                count2: maxCount
            });
           // var textCount = RichTextExtend.createWithContent(content);
            this['_item' + index].setCountTextContent(content);
        } else {
            this['_item' + index].setVisible(false);
        }
    }
    _onButtonClicked1() {
        this.dispatchCustomCallback(0);
    }
    _onButtonClicked2() {
        this.dispatchCustomCallback(1);
    }
}