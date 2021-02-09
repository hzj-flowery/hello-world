const { ccclass, property } = cc._decorator;

import { HeroUnitData } from '../../../data/HeroUnitData';
import { Lang } from '../../../lang/Lang';
import CommonDetailTitleWithBg from '../../../ui/component/CommonDetailTitleWithBg';
import CommonNormalMidPop from '../../../ui/component/CommonNormalMidPop';
import PopupBase from '../../../ui/PopupBase';
import { HeroDataHelper } from '../../../utils/data/HeroDataHelper';
import { Path } from '../../../utils/Path';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import TeamViewHelper from './TeamViewHelper';
import TeamYokeConditionNode from './TeamYokeConditionNode';
import YokeDesNode from './YokeDesNode';


@ccclass
export default class PopupHeroYoke extends PopupBase {

    @property({
        type: CommonNormalMidPop,
        visible: true
    })
    _panelBg: CommonNormalMidPop = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _nodeTitle: CommonDetailTitleWithBg = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listView: cc.ScrollView = null;

    private _heroUnitData: HeroUnitData;
    private _teamYokeConditionNode: any;

    protected preloadResList = [
        { path: Path.getPrefab("TeamYokeConditionNode", "team"), type: cc.Prefab }]
    public setInitData(data: HeroUnitData): void {
        this._heroUnitData = data;
        this._teamYokeConditionNode = cc.resources.get(Path.getPrefab("TeamYokeConditionNode", "team"))
    }

    onCreate() {
        this._panelBg.setTitle(Lang.get('hero_yoke_title'));
        // this._panelBg.addCloseEventListener(handler(this, this._onButtonClose));
        this._nodeTitle.setFontSize(22);
        this._nodeTitle.setFontName(Path.getCommonFont());
    }
    onEnter() {
        this._updateView();
    }
    onExit() {
    }
    _updateView() {
        this._listView.content.removeAllChildren();
        var heroBaseId = this._heroUnitData.getBase_id();
        var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId);
        this._nodeTitle.setTitle(heroParam.name);
        this._nodeTitle.setTitleColor(heroParam.icon_color);
        if (heroParam.icon_color_outline_show) {
            this._nodeTitle.setTitleOutLine(heroParam.icon_color_outline);
        }
        var heroYoke = HeroDataHelper.getHeroYokeInfo(this._heroUnitData);
        if (heroYoke == null) {
            return;
        }
        for (var j = 0; j < heroYoke.yokeInfo.length; j++) {
            var unit = heroYoke.yokeInfo[j];
            // var teamYokeConditionNode = (cc.instantiate(this._teamYokeConditionNode) as cc.Node).getComponent(TeamYokeConditionNode) as TeamYokeConditionNode;
            // teamYokeConditionNode.updateView(unit);
            // UIHelper.insertCurstomListContent(this._listView.content, teamYokeConditionNode.node, -1);
            // teamYokeConditionNode.node.y = teamYokeConditionNode.node.y - teamYokeConditionNode.node.height;
            // var widgetCondition = this._createWidgetCondition(unit, teamYokeConditionNode.node.height);
            // UIHelper.insertCurstomListContent(this._listView.content, widgetCondition, -1);
            // if (j != heroYoke.yokeInfo.length - 1) {
            //     var widgetLine = this._createWidgetLine();
            //     UIHelper.insertCurstomListContent(this._listView.content, widgetLine.node, -1)
            // }
            this._createSchedule(unit,j,heroYoke.yokeInfo.length);
        }
        this._listView.scrollToTop();
    }

    private _createSchedule(unit,j:number,max:number):void{
        this.scheduleOnce(function(unit,j,max){
            var teamYokeConditionNode = (cc.instantiate(this._teamYokeConditionNode) as cc.Node).getComponent(TeamYokeConditionNode) as TeamYokeConditionNode;
            teamYokeConditionNode.updateView(unit);
            UIHelper.insertCurstomListContent(this._listView.content, teamYokeConditionNode.node, -1);
            teamYokeConditionNode.node.y = teamYokeConditionNode.node.y - teamYokeConditionNode.node.height;
            var widgetCondition = this._createWidgetCondition(unit, teamYokeConditionNode.node.height);
            UIHelper.insertCurstomListContent(this._listView.content, widgetCondition, -1);
            if (j != max - 1) {
                var widgetLine = this._createWidgetLine();
                UIHelper.insertCurstomListContent(this._listView.content, widgetLine.node, -1)
            }
            this._listView.scrollToTop();
        }.bind(this,unit,j,max),j*0.1);
    }
    _createWidgetCondition(unit, height): cc.Node {
        var node = new cc.Node();
        var yokeDesNode = new YokeDesNode();
        yokeDesNode.updateView(unit, 525);
        node.addChild(yokeDesNode);
        var con = yokeDesNode.getContentSize();
        yokeDesNode.setPosition(new cc.Vec2(18, 0));
        node.setContentSize(con);
        return node;
    }
    _createWidgetLine() {
        var node = new cc.Node();
        var widget = node.addComponent(cc.Widget) as cc.Widget;
        var line = TeamViewHelper.createLine(564, 0);
        widget.node.addChild(line);
        widget.node.setContentSize(line.getContentSize());
        return widget;
    }
    private onButtonClose() {
        this.close();
    }



}