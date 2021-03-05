import ListViewCellBase from "../../../ui/ListViewCellBase";
import CommonCustomListView from "../../../ui/component/CommonCustomListView";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import { Lang } from "../../../lang/Lang";
import { Colors } from "../../../init";
import { InstrumentUnitData } from "../../../data/InstrumentUnitData";
import { InstrumentDataHelper } from "../../../utils/data/InstrumentDataHelper";

const { ccclass, property } = cc._decorator;


@ccclass
export default class InstrumentDetailTalentNode extends ListViewCellBase {
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
        this._buildDes();
        this._listView.doLayout();
        var contentSize = this._listView.getInnerContainerSize();
        this.node.setContentSize(contentSize);
    }
    _createTitle() {
        var item = cc.instantiate(this._titleNode);
        var title = item.getChildByName("title").getComponent(CommonDetailTitleWithBg) as CommonDetailTitleWithBg;
        title.setFontSize(24);
        title.setTitle(Lang.get('instrument_detail_title_talent'));
        return item;
    }
    _buildDes() {
        var templet = this._instrumentData.getAdvacneTemplateId();
        var talentInfo = InstrumentDataHelper.getInstrumentTalentInfo(templet);
        for (var i = 0;i<talentInfo.length;i++) {
            var one = talentInfo[i];
            var des = this._createDes(one);
            this._listView.pushBackCustomItem(des);
        }
    }
    _createDes(info) {
        var level = this._instrumentData.getLevel();
        var unlockLevel = info.level;
        var isActive = level >= unlockLevel;
        var color = isActive && Colors.SYSTEM_TARGET_RED || Colors.BRIGHT_BG_TWO;
        var name = info.name;
        var des = info.des;
        var unlockDes = '';
        if (!isActive) {
            unlockDes = Lang.get('instrument_detail_talent_unlock_des', { level: unlockLevel });
        }

        var txt = Lang.get('instrument_detail_talent_des', {
            name: name,
            des: des,
            unlock: unlockDes
        });

        var textDesNode = cc.instantiate(this._textDesNode);
        var textDes = textDesNode.getChildByName("textDes");
        textDes.color = color;
        var textLabel = textDes.getComponent(cc.Label);
        textLabel.string = txt;
        //(textLabel as any)._updateRenderData(true);
        return textDesNode;
    }
}
