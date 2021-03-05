const { ccclass, property } = cc._decorator;

import CommonDesValue from '../../../../ui/component/CommonDesValue'

import CommonButtonLevel0Highlight from '../../../../ui/component/CommonButtonLevel0Highlight'

import CommonNormalLargePop from '../../../../ui/component/CommonNormalLargePop'
import ListView from '../../recovery/ListView';
import CommonButton from '../../../../ui/component/CommonButton';
import RecoveryRebornLayerBase from '../../recovery/RecoveryRebornLayerBase';
import { handler } from '../../../../utils/handler';
import { Lang } from '../../../../lang/Lang';
import PopupCheckCellBase from '../../recovery/PopupCheckCellBase';
import { G_Prompt, Colors, G_UserData } from '../../../../init';
import { clone } from '../../../../utils/GlobleFunc';
import { PopupCheckTreasureHelper } from '../../recovery/PopupCheckTreasureHelper';
import PopupBase from '../../../../ui/PopupBase';

@ccclass
export default class PopupCheckTreasureTransform extends PopupBase {
    public static path = 'transform/treasure/PopupCheckTreasureTransform';
    @property({ type: cc.Prefab, visible: true })
    _cellPrefab: cc.Prefab = null;

    @property({ type: CommonNormalLargePop, visible: true })
    _commonNodeBk: CommonNormalLargePop = null;

    @property({ type: CommonButton, visible: true })
    _buttonOk: CommonButton = null;

    @property({ type: ListView, visible: true })
    _listView: ListView = null;

    @property({ type: CommonDesValue, visible: true })
    _nodeCount: CommonDesValue = null;

    protected _parentView;
    protected _onClick: Function;
    protected _fromType: number;
    protected _maxCount: number;
    protected _listData: any[];
    protected _selectList: any[];
    _itemData: {};
    _curItemData: {};
    _cellCount: number;

    public ctor(parentView, clickOK) {
        this._parentView = parentView;
        this._selectList = [];
        this._onClick = clickOK;
    }

    setSelectedIds(ids) {
        this._selectList = clone(ids);
    }

    public onCreate() {
        this._commonNodeBk.setTitle(Lang.get('transform_choose_tip1', { name: Lang.get('transform_tab_icon_2') }));
        this._commonNodeBk.addCloseEventListener(handler(this, this._onButtonClose));
        this._buttonOk.setString(Lang.get('transform_choose_btn_ok'));
        this._buttonOk.addClickEventListenerEx(handler(this, this._onButtonOK));
        this._nodeCount.setDesColor(Colors.BRIGHT_BG_TWO);
        this._nodeCount.setValueColor(Colors.BRIGHT_BG_GREEN);
        this._nodeCount.setMaxColor(Colors.BRIGHT_BG_ONE);
        this._initList();
        this._initData();
    }

    _initData() {
        this._fromType = PopupCheckTreasureHelper.FROM_TYPE2;
        this._listData = [];
    }

    public onEnter() {
        this._updateCountUI();
        this._updateData()
    }

    protected _initList() {
        this._listView.setTemplate(this._cellPrefab);
        this._listView.setCallback(handler(this, this._onItemUpdate));
    }

    _updateData() {
        var helpFunc = PopupCheckTreasureHelper['_FROM_TYPE' + this._fromType];
        if (helpFunc && typeof (helpFunc) == 'function') {
            this._listData = helpFunc();
        }
        this._listView.setData(this._listData);
    }

    protected _onItemUpdate(item: cc.Node, index: number, data) {
        if (this._listData[index] != null) {
            data = PopupCheckTreasureHelper.addTreasureDataDesc(this._listData[index], this._fromType);
        }
        if (data == null) {
            return;
        }
        let isAdded = this.checkIsAdded(data.getId());
        let cell: PopupCheckCellBase = item.getComponent(PopupCheckCellBase);
        if (cell) {
            cell.updateUI(index, data, isAdded);
            cell.setCustomCallback(handler(this, this._onItemTouch));
        }
    }

    protected _onItemTouch(index: number, selected: boolean, cell: PopupCheckCellBase) {
        var data = this._listData[index];
        if (selected && this._checkIsMeetCondition(data) == false) {
            G_Prompt.showTip(Lang.get('hero_upgrade_food_max_tip'));
            cell.setCheckBoxSelected(false);
            return;
        }
        if (selected) {
            this.insertItem(data.getId());
        } else {
            this.deleteItem(data.getId());
        }
        this._updateCountUI();
    }

    protected _updateCountUI() {
        var len = this._selectList.length;
        this._nodeCount.updateUI(Lang.get('treasure_transform_choose_count'), len);

    }

    protected insertItem(id) {
        if (!this.checkIsAdded(id)) {
            this._selectList.push(id);
        }
    }

    protected deleteItem(id) {
        let i = this._selectList.indexOf(id);
        if (i > -1) {
            this._selectList.splice(i, 1);
        }
    }

    _checkIsMeetCondition(itemData) {
        var heroCount = this._selectList.length;
        if (heroCount == 0) {
            return true;
        }
        var itemTrained = itemData.isDidTrain();
        var itemColor = itemData.getConfig().color;
        var firstItemId = this._selectList[0];
        var firstItemData = G_UserData.getTreasure().getTreasureDataWithId(firstItemId);
        var trained = firstItemData.isDidTrain();
        var color = firstItemData.getConfig().color;
        if (itemColor != color) {
            G_Prompt.showTip(Lang.get('transform_condition_tip6'));
            return false;
        }
        if (trained == false) {
            if (itemTrained == true) {
                G_Prompt.showTip(Lang.get('transform_condition_tip2', { name: Lang.get('transform_tab_icon_2') }));
                return false;
            }
        } else {
            if (itemTrained == true) {
                G_Prompt.showTip(Lang.get('transform_condition_tip3', { name: Lang.get('transform_tab_icon_2') }));
                return false;
            } else {
                G_Prompt.showTip(Lang.get('transform_condition_tip2', { name: Lang.get('transform_tab_icon_2') }));
                return false;
            }
        }
        return true;
    }

    protected checkIsAdded(id: any) {
        if (this._selectList == null) {
            return false;
        }
        return this._selectList.indexOf(id) > -1;
    }

    protected checkIsMaxCount() {
        return this._selectList.length >= this._maxCount;
    }

    private _onButtonClose() {
        this.close();
    }

    private _onButtonOK() {
        if (this._onClick) {
            this._onClick(this._selectList);
        }
        this.close();
    }

}