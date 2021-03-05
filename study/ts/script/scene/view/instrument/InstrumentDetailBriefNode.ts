import ListViewCellBase from "../../../ui/ListViewCellBase";
import CommonCustomListView from "../../../ui/component/CommonCustomListView";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import { Lang } from "../../../lang/Lang";
import { Colors } from "../../../init";
import { InstrumentUnitData } from "../../../data/InstrumentUnitData";

const { ccclass, property } = cc._decorator;


@ccclass
export default class InstrumentDetailBriefNode extends ListViewCellBase {
    @property({
        type: CommonCustomListView,
        visible: true
    })
    _listView: CommonCustomListView = null;

    @property({
        type: cc.Prefab,
        visible: true
    })    
    _CommonDetailTitleWithBg:cc.Prefab = null;

    @property({
        type: cc.Node,
        visible: true
    })    
    _titleNode:cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _textDesNode:cc.Node = null;

    private _instrumentData:InstrumentUnitData;

    init(instrumentData){
        this._instrumentData = instrumentData;
    }

    onCreate() {
        var title = this._createTitle();
        this._listView.pushBackCustomItem(title);
        var des = this._createDes();
        this._listView.pushBackCustomItem(des);
        this._listView.doLayout();
        var contentSize = this._listView.getInnerContainerSize();
        this.node.setContentSize(contentSize);
    }
    _createTitle() {
        var item = cc.instantiate(this._titleNode);
        var title = item.getChildByName("title").getComponent(CommonDetailTitleWithBg) as CommonDetailTitleWithBg;
        title.setFontSize(24);
        title.setTitle(Lang.get('instrument_detail_title_brief'));
        return item;
    }

    _createDes() {
        var briefDes = this._instrumentData.getConfig().instrument_description;
        var color = Colors.BRIGHT_BG_TWO;
        var textDesNode = cc.instantiate(this._textDesNode);
        var textDes = textDesNode.getChildByName("textDes");
        textDes.color = color;
        var textLabel = textDes.getComponent(cc.Label);
        textLabel.string = briefDes;
        var height = Math.ceil(briefDes.length / 17 + 1)*26;
        textDes.height = height;
        textDesNode.height = height;
        //(textLabel as any)._updateRenderData(true);
        return textDesNode;
    }
}
