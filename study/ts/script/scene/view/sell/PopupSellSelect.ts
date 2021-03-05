const {ccclass, property} = cc._decorator;

import CommonButtonLevel0Normal from '../../../ui/component/CommonButtonLevel0Normal'

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'

import CommonNormalMiniPop from '../../../ui/component/CommonNormalMiniPop'
import PopupBase from '../../../ui/PopupBase';
import UIHelper from '../../../utils/UIHelper';
import { Lang } from '../../../lang/Lang';
import SelectQualityNode from './SelectQualityNode';

@ccclass
export default class PopupSellSelect extends PopupBase {

   @property({
       type: cc.Node,
       visible: true
   })
   _resourceNode: cc.Node = null;

   @property({
       type: CommonNormalMiniPop,
       visible: true
   })
   _commonMinPop: CommonNormalMiniPop = null;

   @property({
       type: CommonButtonLevel0Highlight,
       visible: true
   })
   _btnConfirm: CommonButtonLevel0Highlight = null;

   @property({
       type: CommonButtonLevel0Normal,
       visible: true
   })
   _btnCancel: CommonButtonLevel0Normal = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _parentNode: cc.Node = null;

   @property(cc.Prefab)
   selectQualityNode:cc.Prefab = null;

   private _selectColors:any[];
   private _selectNodes:any[];
   private _closeCallBack:any;

    ctor(selectColors, callback) {
        this._selectColors = selectColors || [];
        this._closeCallBack = callback;

        UIHelper.addEventListener(this.node,this._btnCancel._button,'PopupSellSelect','_onBtnCancel');
        UIHelper.addEventListener(this.node,this._btnConfirm._button,'PopupSellSelect','_onBtnConfirm');
    }
    onCreate() {
        this._commonMinPop.hideCloseBtn();
        this._commonMinPop.setTitle(Lang.get('lang_sellfragmentselect_title'));
        this._btnConfirm.setString(Lang.get('common_btn_name_confirm'));
        this._btnCancel.setString(Lang.get('common_btn_name_cancel'));
        this._initSelectColors();
    }
    _initSelectColors() {
        this._selectNodes = [];
        for (var k=0; k<this._selectColors.length;k++) {
            var v = this._selectColors[k];
            var selectNode = cc.instantiate(this.selectQualityNode).getComponent(SelectQualityNode);
            selectNode.ctor(v);
            this._parentNode.addChild(selectNode.node);
            this._selectNodes.push(selectNode);
        }
        if (this._selectNodes.length == 2) {
            this._selectNodes[0].node.y = (35);
            this._selectNodes[1].node.y = (-35);
        }
    }
    onEnter() {
    }
    onExit() {
    }
    _onBtnCancel() {
        this.close();
    }
    _onBtnConfirm() {
        var selects = [];
        for (var k=0; k<this._selectNodes.length;k++) {
            var v = this._selectNodes[k];
            var length = v.getColorQuality() - selects.length;
            for(var i=0; i < length; i++){
                selects.push(false);
            }
            if (v.isSelected()) {
                selects[v.getColorQuality()-1] = true;
            }
        }
        if (this._closeCallBack) {
            this._closeCallBack(selects);
        }
        this.close();
    }

}
