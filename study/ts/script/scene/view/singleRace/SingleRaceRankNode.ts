import CommonTabGroupHorizon3 from "../../../ui/component/CommonTabGroupHorizon3";
import CommonListView from "../../../ui/component/CommonListView";
import { handler } from "../../../utils/handler";
import TabScrollView from "../../../utils/TabScrollView";
import { table } from "../../../utils/table";
import { Lang } from "../../../lang/Lang";
import { G_UserData } from "../../../init";
import { SingleRaceConst } from "../../../const/SingleRaceConst";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SingleRaceRankNode extends cc.Component {
    @property({ type: cc.Sprite, visible: true })
    _imageBg: cc.Sprite = null;
    @property({ type: CommonTabGroupHorizon3, visible: true })
    _nodeTabRoot: CommonTabGroupHorizon3 = null;
    @property({ type: CommonListView, visible: true })
    _listView: CommonListView = null;
    @property({ type: cc.Prefab, visible: true })
    singleRaceRankCell: cc.Prefab = null;

    _rankList: any[];
    _selectTabIndex: number;
    _tabListView: any;

    onLoad() {
        this._rankList = [];
        this._selectTabIndex = -1;
        var scrollViewParam = {
            template: this.singleRaceRankCell,
            updateFunc: handler(this, this._onItemUpdate),
            selectFunc: handler(this, this._onItemSelected),
            touchFunc: handler(this, this._onItemTouch)
        };
        this._listView.initWithParam(scrollViewParam);
        var tabNameList = [
            Lang.get('single_race_rank_title1'),
            Lang.get('single_race_rank_title2'),
            Lang.get('single_race_rank_title3')
        ];
        this._nodeTabRoot.setCustomColor([
            [cc.color(169, 106, 42)],
            [cc.color(255, 180, 106)],
            [cc.color(169, 106, 42)]
        ]);
        var param = {
            callback: handler(this, this._onTabSelect),
            isVertical: 2,
            textList: tabNameList
        };
        this._nodeTabRoot.recreateTabs(param);
        this._nodeTabRoot.setTabIndex(0);
    }
    _onTabSelect(index, sender) {
        index++;
        if (index == this._selectTabIndex) {
            return false;
        }
        this._selectTabIndex = index;
        this.updateUI();
        return true;
    }
    updateUI() {
        var status = G_UserData.getSingleRace().getStatus();
        if (status == SingleRaceConst.RACE_STATE_NONE || status == SingleRaceConst.RACE_STATE_PRE) {
            this._imageBg.node.active = (false);
            return;
        }
        this._imageBg.node.active = (true);
        if (this._selectTabIndex == 1) {
            this._rankList = G_UserData.getSingleRace().getServerRankList();
        } else if (this._selectTabIndex == 2) {
            this._rankList = G_UserData.getSingleRace().getPlayerRankList();
        } else {
            this._rankList = G_UserData.getSingleRace().getSameServerRankList();
        }
        this._listView.setData(this._rankList.length, this._selectTabIndex);
    }
    _onItemUpdate(item, index, type) {
        var data = this._rankList[index];
        item.updateItem(index, data, type);
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index, t) {
    }
}