import { Lang } from "../../../lang/Lang";
import CommonDetailDynamicModule from "../../../ui/component/CommonDetailDynamicModule";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import HistoryHeroDetailAwakenCell from "./HistoryHeroDetailAwakenCell";

const { ccclass, property } = cc._decorator;


@ccclass
export default class HistoryHeroDetailAwakenModule extends CommonDetailDynamicModule {
    @property(cc.Prefab)
    detailTitleWithBg: cc.Prefab = null;
    @property(cc.Prefab)
    awakePrefab: cc.Prefab = null;
    _costList: any;

    ctor(costList) {
        this._costList = costList;
        var title = this._createTitle();
        this._listView.pushBackCustomItem(title);
        for (var i in this._costList) {
            var costId = this._costList[i];
            var cell = cc.instantiate(this.awakePrefab).getComponent(HistoryHeroDetailAwakenCell); 
            cell.ctor(costId);
            this._listView.pushBackCustomItem(cell.node);
        }
        this._listView.doLayout();
        var contentSize = this._listView.getInnerContainerSize();
        this._listView.setContentSize(contentSize);
        this.node.setContentSize(contentSize);
    }
    _createTitle() {
        var node = cc.instantiate(this.detailTitleWithBg);
        var title = node.getComponent(CommonDetailTitleWithBg);
        title.setFontSize(24);
        title.setTitle(Lang.get('historyhero_weapon_detail_title_cost'));
        var widget = new cc.Node();
        var titleSize = cc.size(402, 41);
        widget.setContentSize(titleSize);
        title.node.setPosition(titleSize.width / 2, titleSize.height / 2);
        widget.addChild(title.node);
        return widget;
    }
}