const {ccclass, property} = cc._decorator;
import { Colors } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { CommonDetailModule } from "../../../ui/component/CommonDetailModule";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import ListViewCellBase from "../../../ui/ListViewCellBase";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";

@ccclass
export default class AvatarDetailBriefModule extends ListViewCellBase implements CommonDetailModule {

    @property({
        type: cc.Node,
        visible: true
    })
    _newListView: cc.Node = null;


    private _data:any;
    updateUI(data) {
        this._data = data;
    }
    // onCreate(){
       
    //     var title = this._createTitle();
    //     this._newListView.addChild(title);
    //     var des = this._createDes();
    //     this._newListView.addChild(des);
        
    // }
    _createTitle() {
        var title = (cc.instantiate(cc.resources.get(Path.getCommonPrefab("CommonDetailTitleWithBg"))) as cc.Node).getComponent(CommonDetailTitleWithBg)
        title.setFontSize(24);
        title.setTitle(Lang.get('avatar_detail_brief_title'));
        var widget = new cc.Node();
        var titleSize = cc.size(402, 36);
        var widgetSize = cc.size(402, 36 + 10);
        widget.setContentSize(widgetSize);
        title.node.setPosition(titleSize.width / 2, titleSize.height / 2-20);
        widget.addChild(title.node);
        return widget;
    }
    _createDes() {
        var briefDes = this._data.getConfig().description;
        var color = Colors.BRIGHT_BG_TWO;
        var widget = new cc.Node();
        widget.setAnchorPoint(0,0);
        var labelDes = UIHelper.createLabel({fontSize:20}).getComponent(cc.Label);
        labelDes.string = briefDes;
        
        labelDes.node.setAnchorPoint(new cc.Vec2(0, 1));
        labelDes.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        labelDes.node.width = (350);
        labelDes.node.color = (color);
        labelDes["_updateRenderData"](true);
        var height = labelDes.node.getContentSize().height;
        labelDes.node.setPosition(new cc.Vec2(24, height +15));
        widget.addChild(labelDes.node);
        var size = cc.size(402, height + 20);
        widget.setContentSize(size);
        return widget;
    }

    numberOfCell(): number {
        return 2;
    }
    cellAtIndex(i: number): cc.Node {
       if (i== 0) {
           return this._createTitle();
       }else {
           return this._createDes();
       }
    }
    sectionView?(): cc.Node {
        return this._newListView;
    }
}
