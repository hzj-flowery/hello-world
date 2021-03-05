const { ccclass, property } = cc._decorator;

import CommonListCellBase from '../../../ui/component/CommonListCellBase'
import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight';
import CommonDesValue from '../../../ui/component/CommonDesValue';
import CommonHeroStarBig from '../../../ui/component/CommonHeroStarBig';
import CommonListItem from '../../../ui/component/CommonListItem';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import { G_UserData } from '../../../init';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';

var TOPIMAGERES = [
    'img_iconsign_shangzhen',
    'img_iconsign_shangzhen'
];

@ccclass
export default class PetListCell extends CommonListItem {

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
        type: CommonListCellBase,
        visible: true
    })
    _item2: CommonListCellBase = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonStrengthen1: CommonButtonLevel1Highlight = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonStrengthen2: CommonButtonLevel1Highlight = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeLevel1: CommonDesValue = null;

    @property({
        type: CommonHeroStarBig,
        visible: true
    })
    _nodeStar1: CommonHeroStarBig = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeLevel2: CommonDesValue = null;

    @property({
        type: CommonHeroStarBig,
        visible: true
    })
    _nodeStar2: CommonHeroStarBig = null;


    onLoad() {
        this._buttonStrengthen1.setString(Lang.get('hero_btn_strengthen'));
        this._buttonStrengthen2.setString(Lang.get('hero_btn_strengthen'));

        this._buttonStrengthen1.addClickEventListenerEx(handler(this, this._onButtonStrengthenClicked1));
        this._buttonStrengthen2.addClickEventListenerEx(handler(this, this._onButtonStrengthenClicked2));
    }

    updateUI(index, itemLine) {
        this.updateCell(1, itemLine[0]);
        this.updateCell(2, itemLine[1]);
    }

    updateCell(index, heroId) {
        if (heroId) {
            if (typeof (heroId) != 'number') {
                return;
            }
            this['_item' + index].node.active = (true);
            var data = G_UserData.getPet().getUnitDataWithId(heroId);
            this['_item' + index].updateUI(TypeConvertHelper.TYPE_PET, data.getBase_id());
            this['_item' + index].setCallBack(handler(this, this['_onClickIcon' + index]));
            this._showTopImage(index, data);
            var icon = this['_item' + index].getCommonIcon();
            var params = icon.getItemParams();
            var starLevel = data.getStar();
            var name = params.name;
            this['_nodeStar' + index].setCount(starLevel);
            this['_item' + index].setName(name);
            this['_item' + index].setTouchEnabled(true);
            this['_nodeLevel' + index].updateUI(Lang.get('hero_list_cell_level_des'), Lang.get('hero_txt_level', { level: data.getLevel() }));
            this['_buttonStrengthen' + index].setVisible(data.isCanTrain());
        } else {
            this['_item' + index].node.active = (false);
        }
    }
    _showTopImage(index, data) {
        var imageTop = this['_imageTop' + index];
        var isInBattle = data.isInBattle();
        var isInBless = data.isPetBless();
        if (isInBattle) {
            UIHelper.loadTexture(imageTop, Path.getTextSignet(TOPIMAGERES[0]));
            imageTop.node.active = (true);
        } else if (isInBless) {
            UIHelper.loadTexture(imageTop, Path.getTextSignet(TOPIMAGERES[1]));
            imageTop.node.active = (true);
        } else {
            imageTop.node.active = (false);
        }
    }

    _onButtonStrengthenClicked1() {
        this.dispatchCustomCallback(0);
    }
    _onButtonStrengthenClicked2() {
        this.dispatchCustomCallback(1);
    }
    _onClickIcon1(sender, itemParams) {
        this.dispatchCustomCallback(0);
    }
    _onClickIcon2(sender, itemParams) {
        this.dispatchCustomCallback(1);
    }
}