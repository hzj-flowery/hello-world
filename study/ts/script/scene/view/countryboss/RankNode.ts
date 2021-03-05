import { G_UserData } from "../../../init";
import CommonListView from "../../../ui/component/CommonListView";
import { handler } from "../../../utils/handler";
import RankUnitCell from "./RankUnitCell";

const { ccclass, property } = cc._decorator;
@ccclass
export default class RankNode extends cc.Component {
    @property({
        type: CommonListView,
        visible: true
    })
    _rankListView: CommonListView = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _myRankParent: cc.Node = null;

    @property({ type: cc.Prefab, visible: true })
    rankUnitCell: cc.Prefab = null;
    _bossId: any;
    _rankDatas: any[];
    _selfRankdata: any;
    _myRank: any;

    ctor(bossId) {
        this._bossId = bossId;
        this._rankDatas = [];
    }
    onLoad() {
        this._initRankListView();
        this._addMyRankNode();
    }
    onEnter() {
    }
    onExit() {
    }
    updateUI() {
        var bossData = G_UserData.getCountryBoss().getBossDataById(this._bossId);
        if (!bossData) {
            return;
        }
        this._rankDatas = bossData.getBoss_rank();
        this._rankListView.resize(this._rankDatas.length);
        this._selfRankdata = bossData.getMyRankInfo();
        this._myRank.updateUI(undefined, this._selfRankdata);
    }
    _addMyRankNode() {
        var cell = cc.instantiate(this.rankUnitCell).getComponent(RankUnitCell);
        this._myRankParent.addChild(cell.node);
        this._myRank = cell;
    }
    _updateMyRank() {
    }
    _initRankListView() {
        this._rankListView.init(this.rankUnitCell, handler(this, this._onRankListViewItemUpdate), handler(this, this._onRankListViewItemTouch));
    }
    _onRankListViewItemUpdate(item, index) {
        item.updateItem(index, this._rankDatas[index]);
    }
    _onRankListViewItemSelected(item, index) {
    }
    _onRankListViewItemTouch(index, params) {
    }
}