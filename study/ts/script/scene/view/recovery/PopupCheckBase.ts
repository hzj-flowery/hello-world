import PopupBase from "../../../ui/PopupBase";
import CommonNormalLargePop from "../../../ui/component/CommonNormalLargePop";
import CommonButtonLevel0Normal from "../../../ui/component/CommonButtonLevel0Normal";
import CommonDesValue from "../../../ui/component/CommonDesValue";
import RecoveryRebornLayerBase from "./RecoveryRebornLayerBase";
import { Lang } from "../../../lang/Lang";
import { handler } from "../../../utils/handler";
import ListView from "./ListView";
import PopupCheckCellBase from "./PopupCheckCellBase";
import { G_Prompt, Colors } from "../../../init";
import CommonButton from "../../../ui/component/CommonButton";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupCheckBase extends PopupBase {

    @property({ type: cc.Prefab, visible: true })
    _cellPrefab: cc.Prefab = null;

    @property({ type: CommonNormalLargePop, visible: true })
    _commonNodeBk: CommonNormalLargePop = null;

    @property({ type: ListView, visible: true })
    _listView: ListView = null;

    @property({ type: CommonButton, visible: true })
    _buttonOk: CommonButton = null;

    @property({ type: CommonDesValue, visible: true })
    _nodeDes1: CommonDesValue = null;

    @property({ type: CommonDesValue, visible: true })
    _nodeDes2: CommonDesValue = null;

    @property({ type: CommonDesValue, visible: true })
    _nodeCount: CommonDesValue = null;

    protected _parentView: RecoveryRebornLayerBase;
    protected _clickOk: Function;
    protected _fromType: number;
    protected _maxCount: number;
    protected _listData: any[];
    protected _selectList: any[];

    public init(parentView: RecoveryRebornLayerBase, addDataList: any[]) {
        this._parentView = parentView;
        this._selectList = [];
        if (addDataList != null) {
            for (let i = 0; i < addDataList.length; i++) {
                if (addDataList[i] != null) {
                    this._selectList.push(addDataList[i]);
                }
            }
        }
    }

    public onCreate() {
        this._commonNodeBk.addCloseEventListener(handler(this, this._onButtonClose));
        this._buttonOk.addClickEventListenerEx(handler(this, this._onButtonOK));
        this._buttonOk.setString(Lang.get('hero_upgrade_btn_Ok'));
        this._nodeCount.setFontSize(20);
        if (this._nodeDes1) {
            this._nodeDes1.setFontSize(20);
            this._nodeDes1.node.active = false;
        }
        if (this._nodeDes2) {
            this._nodeDes2.setFontSize(20);
            this._nodeDes2.node.active = false;
        }
    }

    public onEnter() {
        this._updateCountUI();
    }

    public updateUI(fromType, clickOk) {
        this._fromType = fromType;
        this._clickOk = clickOk;
    }

    protected _updateInfo(listData: any, maxCount, title) {
        this._listData = [];
        for (const key in listData) {
            this._listData.push(listData[key]);
        }

        this._maxCount = maxCount;
        this._commonNodeBk.setTitle(title);
        this._listView.setTemplate(this._cellPrefab);
        this._listView.setCallback(handler(this, this._onItemUpdate));
        this._listView.setData(this._listData);
    }

    public onClose() {
        if (this._clickOk) {
            this._clickOk();
        }
    }

    protected _onItemUpdate(item: cc.Node, index: number, data) {

        if (data == null) {
            return;
        }
        let isAdded = this.checkIsAdded(this._listData[index]);
        let cell: PopupCheckCellBase = item.getComponent(PopupCheckCellBase);
        if (cell) {
            cell.updateUI(index, data, isAdded);
            cell.setCustomCallback(handler(this, this._onItemTouch));
        }
    }

    protected _onItemTouch(index: number, selected: boolean, cell: PopupCheckCellBase) {
        if (selected && this.checkIsMaxCount()) {
            G_Prompt.showTip(Lang.get('hero_upgrade_food_max_tip'));
            cell.setCheckBoxSelected(false);
            return;
        }
        var heroData = this._listData[index];
        if (selected) {
            this.insertItem(heroData);
        } else {
            this.deleteItem(heroData);
        }
        this._updateCountUI();
    }

    protected _updateCountUI() {
        var len = this._selectList.length;
        var max = this._maxCount;
        this._nodeCount.updateUI(Lang.get('hero_check_count_des'), len, max);
        this._nodeCount.setDesColor(Colors.BRIGHT_BG_TWO);
        this._nodeCount.setValueColor(Colors.BRIGHT_BG_GREEN);
        this._nodeCount.setMaxColor(Colors.BRIGHT_BG_ONE);
    }

    protected insertItem(data) {
        if (!this.checkIsAdded(data)) {
            this._selectList.push(data);
            this._parentView && this._parentView.insertItem(data);
        }
    }

    protected deleteItem(data) {
        let i = this._selectList.indexOf(data);
        if (i > -1) {
            this._selectList.splice(i, 1);
            this._parentView && this._parentView.deleteItem(data);
        }
    }

    protected checkIsAdded(data: any) {
        if (this._selectList == null) {
            return false;
        }
        return this._selectList.indexOf(data) > -1;
    }

    protected checkIsMaxCount() {
        return this._selectList.length >= this._maxCount;
    }

    private _onButtonClose() {
        this.close();
    }

    private _onButtonOK() {
        this.close();
    }
}