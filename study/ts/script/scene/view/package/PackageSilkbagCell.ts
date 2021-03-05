const { ccclass, property } = cc._decorator;

import CommonListCellBase from '../../../ui/component/CommonListCellBase'
import CommonListItem from '../../../ui/component/CommonListItem';
import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight';
import { SilkbagConst } from '../../../const/SilkbagConst';
import { Lang } from '../../../lang/Lang';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import { SilkbagDataHelper } from '../../../utils/data/SilkbagDataHelper';
import { handler } from '../../../utils/handler';

@ccclass
export default class PackageSilkbagCell extends CommonListItem {

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
    Image_1: cc.Node = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textDes1: cc.Label = null;
    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _button1: CommonButtonLevel1Highlight = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textHeroName1: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    Image_2: cc.Node = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textDes2: cc.Label = null;
    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _button2: CommonButtonLevel1Highlight = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textHeroName2: cc.Label = null

    onLoad() {
        this._button1.addClickEventListenerEx(handler(this, this._onClickButton1));
        this._button2.addClickEventListenerEx(handler(this, this._onClickButton2));
    }

    updateUI(index, itemLine) {
        for (var i = 1; i <= 2; i++) {
            var item = this['_item' + i];
            item.node.active = (false);
        }

        for (var j in itemLine) {
            var data = itemLine[j];
            var itemIdx:number = parseFloat(j) + 1;
            this.updateCell(itemIdx, data);
        }
    }

    updateCell(i, data) {
        if (data) {
            this['_item' + i].node.active = (true);
            var baseId = data.getBase_id();
            var info = SilkbagDataHelper.getSilkbagConfig(baseId);
            var nameStr = info.only == SilkbagConst.ONLY_TYPE_1 && Lang.get('silkbag_only_tip', { name: info.name }) || info.name;
            this['_item' + i].updateUI(TypeConvertHelper.TYPE_SILKBAG, baseId);
            this['_item' + i].setName(nameStr);
            this['_textDes' + i].string = (info.bag_description);
            this['_button' + i].setString(info.button_txt);
            var heroBaseId = data.getHeroBaseIdOfWeared();
            if (heroBaseId > 0) {
                var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId);
                this['_textHeroName' + i].node.active = (true);
                this['_textHeroName' + i].string = (heroParam.name);
                this['_textHeroName' + i].node.color = (heroParam.icon_color);
                UIHelper.updateTextOutline(this['_textHeroName' + i], heroParam);
            } else {
                this['_textHeroName' + i].node.active = (false);
            }
        }
    }
    _onClickButton1() {
         this.dispatchCustomCallback(1);
    }
    _onClickButton2() {
         this.dispatchCustomCallback(2);
    }

}