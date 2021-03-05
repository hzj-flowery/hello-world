import { Lang } from "../../../lang/Lang";
import CommonButtonLargeHighlight from "../../../ui/component/CommonButtonLargeHighlight";
import CommonListView from "../../../ui/component/CommonListView";
import { handler } from "../../../utils/handler";
import ViewBase from "../../ViewBase";
import { GrainCarDataHelper } from "./GrainCarDataHelper";


var MAX_CELL_COUNT_NO_SCROLL = 6;
var CELL_HEIGHT = 33;
var LIST_VIEW_OFFSET = 13;
const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupGrainCarGuildSelector extends ViewBase {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _bg: cc.Sprite = null;

    @property({
        type: CommonButtonLargeHighlight,
        visible: true
    })
    _btnSearch: CommonButtonLargeHighlight = null;

    @property({
        type: CommonListView,
        visible: true
    })
    _listView: CommonListView = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    popupGrainCarGuildSelectorCell: cc.Prefab = null;

    private _mineId: number;
    private _selectorCallback;
    private _guildList: Array<any>;
    ctor(mineId) {
        this._mineId = mineId;
        this._selectorCallback = null;
    }
    onCreate() {
        this._updateData();
        this._initUI();
    }
    onEnter() {
    }
    onExit() {
    }
    _updateData() {
        this._guildList = [];
        this._guildList = GrainCarDataHelper.getGuildListDividByGuildWithMineId(this._mineId);
        this._guildList = GrainCarDataHelper.sortGuild(this._guildList);
    }
    _initUI() {
        this._btnSearch.setString(Lang.get('grain_car_search'));
        var itemCount = this._guildList.length;
        var bgSize = this._bg.node.getContentSize();
        this._bg.node.setContentSize(cc.size(bgSize.width, CELL_HEIGHT * Math.min(itemCount, MAX_CELL_COUNT_NO_SCROLL) + LIST_VIEW_OFFSET));
        this._listView.scrollView.node.setContentSize(cc.size(bgSize.width, CELL_HEIGHT * Math.min(itemCount, MAX_CELL_COUNT_NO_SCROLL)));
        this._listView.init(this.popupGrainCarGuildSelectorCell,handler(this, this._onItemUpdate), handler(this, this._onItemSelected),handler(this, this._onItemTouch))
        this._listView.resize(this._guildList.length);
        this._bg.node.active = (false);
    }
    updateUI(mineId) {
        this._mineId = mineId;
        this._updateData();
        this._listView.resize(this._guildList.length);
    }
    setSelectorCallback(cb) {
        this._selectorCallback = cb;
    }
    close() {
        this._bg.node.active = (false);
    }
    _onItemUpdate(item, index) {
        var data = this._guildList[index + 1];
        item.update(data);
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index, guildData) {
        console.log(guildData);
        if (this._selectorCallback) {
            this._selectorCallback(guildData.id);
        }
    }
    _onBtnSearchClick() {
        this._bg.node.active = (!this._bg.node.active);
    }
}