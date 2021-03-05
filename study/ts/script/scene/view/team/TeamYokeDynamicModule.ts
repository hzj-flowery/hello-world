import CommonDetailNewTitleWithBg from "../../../ui/component/CommonDetailNewTitleWithBg";
import ListViewCellBase from "../../../ui/ListViewCellBase";
import { Path } from "../../../utils/Path";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIHelper from "../../../utils/UIHelper";
import TeamViewHelper from "./TeamViewHelper";
import TeamYokeConditionNode from "./TeamYokeConditionNode";
import YokeDesNode from "./YokeDesNode";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TeamYokeDynamicModule extends ListViewCellBase {

   @property({
       type: cc.Node,
       visible: true
   })
   _listView: cc.Node = null;

   private _teamYokeConditionNode:any
   private _commonDetailNewTitleWithBg:any;
   onCreate() {
       this._teamYokeConditionNode = cc.resources.get(Path.getPrefab("TeamYokeConditionNode","team"));
       this._commonDetailNewTitleWithBg = cc.resources.get(Path.getCommonPrefab("CommonDetailNewTitleWithBg"));
}

public setInitData():void{
    this._teamYokeConditionNode = cc.resources.get(Path.getPrefab("TeamYokeConditionNode","team"));
    this._commonDetailNewTitleWithBg = cc.resources.get(Path.getCommonPrefab("CommonDetailNewTitleWithBg"));
}
updateViewExtra(yokeInfo,heroBaseId):void{
    for (var j =yokeInfo.length-1;j>=0;j--) {
        var unit = yokeInfo[j];
        
        var disHeight = 3;
        if (j == 0) {
            disHeight = 3;
        }
        var widgetCondition = this._createWidgetDes(unit, disHeight);
        UIHelper.updateCurstomListSize(this._listView,widgetCondition)
        var teamYokeConditionNode = (cc.instantiate(this._teamYokeConditionNode) as cc.Node).getComponent(TeamYokeConditionNode) as TeamYokeConditionNode;
        teamYokeConditionNode.updateView(unit);
        UIHelper.updateCurstomListSize(this._listView,teamYokeConditionNode.node)
        if (j != 0) {
            var widgetLine = this._createWidgetLine(true);
            UIHelper.updateCurstomListSize(this._listView,widgetLine)
        }
    }

    var title = this._createDetailTitle(heroBaseId);
    UIHelper.updateCurstomListSize(this._listView,title.node);

    var contentSize = this._listView.getContentSize();
    this.node.setContentSize(contentSize);

    //************** */
    
}
private _createDetailTitle(heroBaseId) {
    var node = cc.instantiate(this._commonDetailNewTitleWithBg) as cc.Node;
    var title = node.getComponent(CommonDetailNewTitleWithBg) as CommonDetailNewTitleWithBg;
    title.setFontSize(26);
    var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId);
    title.setTitle(heroParam.name);
    title.setTitleColor(heroParam.icon_color);
    if (heroParam.icon_color_outline_show) {
        title.setTitleOutLine(heroParam.icon_color_outline);
    }
    title.setFontSize(22);
    var node1 = new cc.Node();
    var widget = node1.addComponent(cc.Widget) as cc.Widget;
    var titleSize = cc.size(562, 36);
    widget.node.setContentSize(titleSize);
    title.node.setPosition(titleSize.width / 2, titleSize.height / 2);
    widget.node.addChild(title.node);
    return widget;
}
updateView(yokeInfo) {
    for (var j =yokeInfo.length-1;j>=0;j--) {
        var unit = yokeInfo[j];
        
        var disHeight = 3;
        if (j == 0) {
            disHeight = 3;
        }
        var widgetCondition = this._createWidgetDes(unit, disHeight);
        UIHelper.updateCurstomListSize(this._listView,widgetCondition)
        var teamYokeConditionNode = (cc.instantiate(this._teamYokeConditionNode) as cc.Node).getComponent(TeamYokeConditionNode) as TeamYokeConditionNode;
        teamYokeConditionNode.updateView(unit);
        UIHelper.updateCurstomListSize(this._listView,teamYokeConditionNode.node)
        if (j != 0) {
            var widgetLine = this._createWidgetLine(true);
            UIHelper.updateCurstomListSize(this._listView,widgetLine)
        }
    }
    var contentSize = this._listView.getContentSize();
    this.node.setContentSize(contentSize);
}
private _createWidgetDes(unit, disHeight):cc.Node {
    var node = new cc.Node();
    var yokeDesNode = new YokeDesNode();
    yokeDesNode.updateView(unit, 510);
    yokeDesNode.setPosition(new cc.Vec2(24, disHeight*10));
    node.addChild(yokeDesNode);
    var size = yokeDesNode.getContentSize();
    node.setContentSize(cc.size(size.width, size.height + disHeight));
    return node;
}
private _createWidgetLine(show):cc.Node {
    var node = new cc.Node();
    var line = TeamViewHelper.createLine(540, 5);
    node.addChild(line);
    node.setContentSize(line.getContentSize());
    line.active = (show);
    return node;
}
onlyShow(yokeInfo) {
    var createDes = function (unit, disHeight):cc.Node {
        var node = new cc.Node();
        var yokeDesNode = new YokeDesNode();
        yokeDesNode.onlyShow(unit, 510);
        yokeDesNode.setPosition(new cc.Vec2(24, disHeight));
        node.addChild(yokeDesNode);
        var size = yokeDesNode.getContentSize();
        node.setContentSize(cc.size(size.width, size.height + disHeight));
        return node;
    }
    for (var j in yokeInfo) {
        var unit = yokeInfo[j];
        var teamYokeConditionNode = (cc.instantiate(this._teamYokeConditionNode) as cc.Node).getComponent(TeamYokeConditionNode) as TeamYokeConditionNode;
        teamYokeConditionNode.onlyShow(unit);
        UIHelper.updateCurstomListSize(this._listView,teamYokeConditionNode.node);
        var disHeight = 10;
        if (parseInt(j) == yokeInfo.length) {
            disHeight = 30;
        }
        var widgetCondition = createDes(unit, disHeight);
        this._listView.addChild(widgetCondition);
        if (j != yokeInfo.length) {
            var widgetLine = this._createWidgetLine(true);
            UIHelper.updateCurstomListSize(this._listView,widgetLine);
        }
    }
    var contentSize = this._listView.getContentSize();
    this.node.setContentSize(contentSize);
}

}