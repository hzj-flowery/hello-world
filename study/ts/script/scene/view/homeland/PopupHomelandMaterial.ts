const { ccclass, property } = cc._decorator;

import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop'
import PopupBase from '../../../ui/PopupBase';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import { HomelandHelp } from './HomelandHelp';
import PopupHomelandMaterialCell from './PopupHomelandMaterialCell';
import CommonCustomListView from '../../../ui/component/CommonCustomListView';

@ccclass
export default class PopupHomelandMaterial extends PopupBase {
    public static path = 'homeland/PopupHomelandMaterial';
    @property({
        type: cc.Node,
        visible: true
    })
    _panelBase: cc.Node = null;

    @property({
        type: CommonNormalLargePop,
        visible: true
    })
    _rankBase: CommonNormalLargePop = null;

    @property({
        type: CommonCustomListView,
        visible: true
    })
    _listRank: CommonCustomListView = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    popupHomelandMaterialCell: cc.Prefab = null;


    _dataList: any[];

    onCreate() {
        this._rankBase.setTitle(Lang.get('homeland_tree_preview'));
        this._rankBase.addCloseEventListener(handler(this, this.onBtnCancel));
        this._dataList = HomelandHelp.getTreePreviewList();
        this._listRank.removeAllChildren();
        for (var i in this._dataList) {
            var value = this._dataList[i];
            var itemLine = cc.instantiate(this.popupHomelandMaterialCell);
            itemLine.getComponent(PopupHomelandMaterialCell).ctor(value);
            this._listRank.pushBackCustomItem(itemLine);
        }
    }
    onEnter() {
    }
    onExit() {
    }
    onBtnCancel() {
        this.close();
    }
}