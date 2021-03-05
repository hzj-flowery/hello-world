const { ccclass, property } = cc._decorator;

import PopupCheckBase from '../recovery/PopupCheckBase';
import { PopupCheckHeroHelper } from '../recovery/PopupCheckHeroHelper';
import CommonTabGroup from '../../../ui/component/CommonTabGroup';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import TabScrollView from '../../../utils/TabScrollView';
import { table } from '../../../utils/table';
import { G_UserData, G_Prompt } from '../../../init';
import { clone } from '../../../utils/GlobleFunc';
import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop';
import ListView from '../recovery/ListView';
import CommonButton from '../../../ui/component/CommonButton';
import CommonDesValue from '../../../ui/component/CommonDesValue';
import PopupBase from '../../../ui/PopupBase';
import PopupCheckCellBase from '../recovery/PopupCheckCellBase';

@ccclass
export default class PopupCheckHeroTransform extends PopupBase {
    public static path = 'heroTransform/PopupCheckHeroTransform';

    @property({ type: cc.Prefab, visible: true })
    _cellPrefab: cc.Prefab = null;
    @property({ type: CommonNormalLargePop, visible: true })
    _commonNodeBk: CommonNormalLargePop = null;
    @property({ type: ListView, visible: true })
    _tabListView: ListView = null;
    @property({ type: CommonButton, visible: true })
    _buttonOk: CommonButton = null;
    @property({ type: CommonDesValue, visible: true })
    _nodeCount: CommonDesValue = null;
    @property({ type: CommonTabGroup, visible: true })
    _nodeTabRoot: CommonTabGroup = null;

    _onClick: any;
    _tabIndex: any;
    _selectTabIndex: number;
    _datas: {};
    _cellCount: number;
    _curDatas: any[];
    _selectedIds: any;
    _parentView: any;
    _fromType: number;

    ctor(parentView, onClick, tabIndex = 1, fromType = PopupCheckHeroHelper.FROM_TYPE3) {
        this._parentView = parentView;
        this._onClick = onClick;
        this._tabIndex = tabIndex;
        this._fromType = fromType;
        this.setSelectedIds([]);
    }
    onCreate() {
        this._initData();
        this._initView();
    }
    _initData() {
        this._selectTabIndex = 0;
        this._datas = {};
        this._curDatas = [];
        this._cellCount = 0;

    }

    _initView() {
        this.initTitle();
        this._commonNodeBk.addCloseEventListener(handler(this, this._onButtonClose));
        this._buttonOk.addClickEventListenerEx(handler(this, this._onButtonOK));
        this._initTab();
        this._initList();
    }

    initTitle() {
        this._commonNodeBk.setTitle(Lang.get('hero_transform_choose_tip1'));
        this._buttonOk.setString(Lang.get('hero_transform_choose_btn_ok'));
    }
    _initTab() {
        var param = {
            callback: handler(this, this._onTabSelect),
            isVertical: 2,
            textList: [
                Lang.get('hero_transform_country_tab1'),
                Lang.get('hero_transform_country_tab2'),
                Lang.get('hero_transform_country_tab3'),
                Lang.get('hero_transform_country_tab4')
            ]
        };
        this._nodeTabRoot.recreateTabs(param);
    }
    _initList() {
        this._tabListView.setTemplate(this._cellPrefab);
        this._tabListView.setCallback(handler(this, this._onItemUpdate));

    }
    onEnter() {
        this._updateData();
        this._nodeTabRoot.setTabIndex(this._tabIndex - 1);
    }
    onExit() {
    }
    _onTabSelect(index, sender) {
        index++;
        if (this._selectTabIndex == index) {
            return false;
        }
        this._selectTabIndex = index;
        this._updateListView(index);
        this._updateCount();
        return true;
    }
    _updateData() {
        var helpFunc = this.getHelpFunc();
        if (helpFunc && typeof (helpFunc) == 'function') {
            this._datas = helpFunc();
        }
    }

    getHelpFunc() {
        return PopupCheckHeroHelper['_FROM_TYPE' + this._fromType];;
    }
    _updateListView(index) {
        this._curDatas = this._datas[index] || [];
        this._tabListView.setData(this._curDatas);
    }
    _onItemUpdate(item, index) {
        if (this._curDatas[index] != null) {
            var srcData = this._curDatas[index];
            var data = this.convertData(srcData);
            var isAdded = this._checkIsAdded(srcData.getId());
            let cell: PopupCheckCellBase = item.getComponent(PopupCheckCellBase);
            if (cell) {
                cell.updateUI(index, data, isAdded);
                cell.setCustomCallback(handler(this, this._onItemTouch));
            }
        }
    }

    convertData(data) {
        return PopupCheckHeroHelper.addHeroDataDesc(data, this._fromType);
    }

    _onItemSelected(item, index) {
    }

    _onItemTouch(index, selected, item) {
        var data = this._curDatas[index];
        if (selected && this._checkIsMeetCondition(data) == false) {
            item.setCheckBoxSelected(false);
            return;
        }
        var id = data.getId();
        if (selected) {
            this.insertItem(id);
        } else {
            this.deleteItem(id);
        }
        this._updateCount();
    }

    protected insertItem(id) {
        if (!this._checkIsAdded(id)) {
            this._selectedIds.push(id);
        }
    }

    protected deleteItem(id) {
        let i = this._selectedIds.indexOf(id);
        if (i > -1) {
            this._selectedIds.splice(i, 1);
        }
    }
    _checkIsAdded(heroId) {
        for (var i in this._selectedIds) {
            var id = this._selectedIds[i];
            if (id == heroId) {
                return true;
            }
        }
        return false;
    }
    _checkIsMeetCondition(data) {
        var heroCount = this._selectedIds.length;
        if (heroCount == 0) {
            return true;
        }
        var heroTrained = data.isDidTrain();
        var heroColor = data.getConfig().color;
        var firstHeroId = this._selectedIds[0];
        var firstHeroData = G_UserData.getHero().getUnitDataWithId(firstHeroId);
        var trained = firstHeroData.isDidTrain();
        var color = firstHeroData.getConfig().color;
        if (heroColor != color) {
            G_Prompt.showTip(Lang.get('hero_transform_condition_tip6'));
            return false;
        }
        if (trained == false) {
            if (heroTrained == true) {
                G_Prompt.showTip(Lang.get('hero_transform_condition_tip2'));
                return false;
            }
        } else {
            if (heroTrained == true) {
                G_Prompt.showTip(Lang.get('hero_transform_condition_tip3'));
                return false;
            } else {
                G_Prompt.showTip(Lang.get('hero_transform_condition_tip2'));
                return false;
            }
        }
        return true;
    }
    _updateCount() {
        var selectedCount = this._selectedIds.length;
        this._nodeCount.updateUI(Lang.get('hero_transform_choose_count'), selectedCount);
    }
    _onButtonOK() {
        if (this._onClick) {
            this._onClick(this._selectedIds);
        }
        this.close();
    }
    _onButtonClose() {
        this.close();
    }
    setSelectedIds(heroIds) {
        this._selectedIds = clone(heroIds);
    }
}