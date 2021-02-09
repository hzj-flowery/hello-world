const {ccclass, property} = cc._decorator;

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { G_EffectGfxMgr, G_UserData, G_ServerTime } from '../../../init';
import { Lang } from '../../../lang/Lang';
import GachaGoldenHeroHelper from './GachaGoldenHeroHelper';
import UIHelper from '../../../utils/UIHelper';

@ccclass
export default class JoyAwardsCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resource: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _item1: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageNormal1: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageSelected1: cc.Sprite = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _commonIcon1: CommonIconTemplate = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textIconName1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOpenTime1: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect1: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGroup1: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageGot1: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageOpened1: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _item2: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageNormal2: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageSelected2: cc.Sprite = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _commonIcon2: CommonIconTemplate = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textIconName2: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOpenTime2: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect2: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGroup2: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageGot2: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageOpened2: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _item3: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageNormal3: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageSelected3: cc.Sprite = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _commonIcon3: CommonIconTemplate = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textIconName3: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOpenTime3: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect3: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGroup3: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageGot3: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageOpened3: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _item4: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageNormal4: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageSelected4: cc.Sprite = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _commonIcon4: CommonIconTemplate = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textIconName4: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOpenTime4: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect4: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGroup4: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageGot4: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageOpened4: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _item5: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageNormal5: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageSelected5: cc.Sprite = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _commonIcon5: CommonIconTemplate = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textIconName5: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOpenTime5: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect5: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGroup5: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageGot5: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageOpened5: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _item6: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageNormal6: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageSelected6: cc.Sprite = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _commonIcon6: CommonIconTemplate = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textIconName6: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOpenTime6: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect6: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGroup6: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageGot6: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageOpened6: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _item7: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageNormal7: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageSelected7: cc.Sprite = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _commonIcon7: CommonIconTemplate = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textIconName7: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect7: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOpenTime7: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGroup7: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageGot7: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageOpened7: cc.Sprite = null;

    _size:cc.Size;

    onInit(){
        this._size = this._resource.getContentSize();
        this.node.setContentSize(this._size);
    }
    onCreate() {

    }
    updateUI(data:any[]) {
        for (var i = 1; i<=7; i++) {
            this['_item' + i].active = (false);
        }
        let createItem = function (index, itemData) {
            var got = itemData.cfg.drop_id < itemData.dropId;
            var bCurDrop = itemData.cfg.drop_id == itemData.dropId;
            if (G_ServerTime.getLeftSeconds(G_UserData.getGachaGoldenHero().getEnd_time()) <= 0) {
                got = true, bCurDrop = false;
            }
            this['_item' + index].active = (true);
            this['_imageNormal' + index].node.active = (!bCurDrop);
            this['_imageSelected' + index].node.active = (bCurDrop);
            this['_commonIcon' + index].unInitUI();
            this['_commonIcon' + index].initUI(itemData.cfg.type, itemData.cfg.value, 1);
            //this['_commonIcon' + index].setTouchEnabled(true);
            this['_commonIcon' + index].removeLightEffect();
            var params = this['_commonIcon' + index].getItemParams();
            this['_textIconName' + index].string = (GachaGoldenHeroHelper.getFormatServerName(params.name, 4, true) + (' x' + itemData.cfg.size));
            this['_textIconName' + index].node.color = (params.icon_color);
            if (itemData.cfg && itemData.cfg.type == 1) {
                UIHelper.enableOutline(this['_textIconName' + index], params.icon_color_outline, 2);
            } else if (itemData.cfg.type == 6 && itemData.cfg.value == 157) {
                UIHelper.enableOutline(this['_textIconName' + index], params.icon_color_outline, 2);
            }
            this['_textGroup' + index].string = (Lang.get('gacha_goldenjoy_itemgroup', { num: itemData.cfg.group }));
            this['_textOpenTime' + index].string = (itemData.cfg.time + ':00');
            this['_textOpenTime' + index].node.color = (bCurDrop && cc.color(255, 255, 255) || cc.color(113, 67, 6));
            this['_imageOpened' + index].node.active = (got);
            this['_imageGot' + index].node.active = (got);
            this['_nodeEffect' + index].removeAllChildren(true);
            if (bCurDrop) {
                G_EffectGfxMgr.createPlayGfx(this['_nodeEffect' + index], 'effect_rili_guang', null, true);
            }
        }.bind(this);
        for (let i=1; i<=data.length; i++) {
            var v = data[i-1];
            createItem(i, v);
        }
    }   

}
