import { Colors } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonDetailDynamicModule from "../../../ui/component/CommonDetailDynamicModule";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;


@ccclass
export default class HistoryHeroDetailDescModule extends CommonDetailDynamicModule {
    @property(cc.Prefab)
    detailTitleWithBg:cc.Prefab = null;
    @property(cc.Node)
    textDesNode:cc.Node = null;
    _historyHeroInfo: any;

    ctor(historyHeroInfo) {
        this._historyHeroInfo = historyHeroInfo;
        this.onInit();
    }
    onInit() {
        var title = this._createTitle();
        this._listView.pushBackCustomItem(title);
        var des = this._createDes();
        this._listView.pushBackCustomItem(des);
        this._listView.doLayout();
        var contentSize = this._listView.getInnerContainerSize();
        contentSize.height = contentSize.height;
        this._listView.setContentSize(contentSize);
        this.node.setContentSize(contentSize);
    }
    _createTitle() {
        var node = cc.instantiate(this.detailTitleWithBg);
        var title = node.getComponent(CommonDetailTitleWithBg);
        title.setFontSize(24);
        title.setTitle(Lang.get('hero_detail_title_brief'));
        var widget = new cc.Node();
        var titleSize = cc.size(402, 36);
        var widgetSize = cc.size(402, 36 + 10);
        widget.setContentSize(widgetSize);
        title.node.setPosition(titleSize.width / 2, titleSize.height / 2 + 10);
        widget.addChild(title.node);
        return widget;
    }
    _createDes() {
        var briefDes =  this._historyHeroInfo.description;
        return UIHelper.createDetailDesEx(this.textDesNode, briefDes);
    }
    
}