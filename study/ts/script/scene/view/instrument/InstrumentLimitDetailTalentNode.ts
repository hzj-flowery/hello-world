import ListViewCellBase from "../../../ui/ListViewCellBase";
import CommonCustomListView from "../../../ui/component/CommonCustomListView";
import { InstrumentDataHelper } from "../../../utils/data/InstrumentDataHelper";
import { Path } from "../../../utils/Path";
import { Lang } from "../../../lang/Lang";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import CommonCustomListViewEx from "../../../ui/component/CommonCustomListViewEx";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import UIHelper from "../../../utils/UIHelper";
import { RichTextHelper } from "../../../utils/RichTextHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class InstrumentLimitDetailTalentNode extends ListViewCellBase{
    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listView1: CommonCustomListViewEx = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listView2: CommonCustomListViewEx = null;

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
    
    _instrumentUnitData: any;
    _templateId1: any;
    _templateId2: any;

    ctor(instrumentUnitData, templateId1, templateId2) {
        this._instrumentUnitData = instrumentUnitData;
        this._templateId1 = templateId1;
        this._templateId2 = templateId2;
    }
    onCreate() {
        for (var i = 1; i<=2; i++) {
            this._updateSubView(i);
        }

        var height1 = this._listView1.node.getContentSize().height;
        var height2 = this._listView2.node.getContentSize().height;
        var height = Math.max(height1, height2);
        this.node.setContentSize(940, height+10);

        this.scheduleOnce(function () {
            this._listView1.enabled = false;
            this._listView2.enabled = false;
        }.bind(this), 0.05);

    }
    _updateSubView(index) {
        var title = this._createTitle(index);
        this['_listView' + index].pushBackCustomItem(title);
        var templet = this['_templateId' + index];
        var talentInfo = InstrumentDataHelper.getInstrumentTalentInfo(templet);
        for (let i in talentInfo) {
            var one = talentInfo[i];
            var des = this._createDes(one);
            des.addComponent(ListViewCellBase);
            this['_listView' + index].pushBackCustomItem(des);
        }
        this['_listView' + index].doLayout();
        var contentSize = this['_listView' + index].getInnerContainerSize();
        contentSize.width = 402;
        contentSize.height = contentSize.height + 10;
        this['_listView' + index].node.setContentSize(contentSize);
    }
    _createTitle(index) {
        var item = cc.instantiate(this._titleNode);
        var title = item.getChildByName("title").getComponent(CommonDetailTitleWithBg) as CommonDetailTitleWithBg;
        title.setFontSize(24);
        title.setTitle(Lang.get('instrument_limit_detail_talent_title'));
        item.addComponent(ListViewCellBase);
        return item;
    }
    _createDes(info) {
        var name = info.name;
        var des = info.des;
        var unlockDes = '';
        var content = Lang.get('instrument_limit_talent_des', {
            name: name,
            des: des,
            unlock: unlockDes
        });
        var label = RichTextExtend.createWithContent(content);

        label.node.setAnchorPoint(cc.v2(0, 1));
        //label.ignoreContentAdaptWithSize(false);
        label.maxWidth = 360;
        label.lineHeight = 20;
        var height = label.node.getContentSize().height;
        label.node.setPosition(cc.v2(24, height));
        var widget = new cc.Node();
        widget.addChild(label.node);
        var size = cc.size(402, height);
        widget.setContentSize(size);
        return widget;
    }
}
