import { Colors } from "../../../init";
import UIHelper from "../../../utils/UIHelper";
import { Lang } from "../../../lang/Lang";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { RichTextHelper } from "../../../utils/RichTextHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MineReportBarNode extends cc.Component {
    // ctor(target) {
    //     this._target = target;
    //     this._barGreen = null;
    //     this._barYellow = null;
    //     this._barRed = null;
    //     this._textArmy = null;
    //     this._nodeText = null;
    //     this._init();
    // }
    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _barGreen: cc.ProgressBar = null;

    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _barYellow: cc.ProgressBar = null;

    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _barRed: cc.ProgressBar = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textArmy: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeText: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeText2: cc.Node = null;
    

    onLoad():void{
        this._init();
    }
    _init() {
        this._barGreen.node.active = (false);
        this._barYellow.node.active = (false);
        this._barRed.node.active = (false);
    }
    updateUI(army, redArmy, needTurnBack, isPrivilege?, infame?) {
        this._setArmy(army, isPrivilege);
        this._setRedArmy(redArmy);
        this._turnBack(needTurnBack);
        if (infame) {
            this._setInfame(infame);
        }
    }
    _setArmy(army, isPrivilege) {
        this._barGreen.node.active = (false);
        this._barYellow.node.active = (false);
        this._barRed.node.active = (false);
        this._textArmy.string = (army);
        var bar = this._barGreen;
        army = isPrivilege && army / 200 * 100 || army;
        if (army > 25 && army <= 75) {
            bar = this._barYellow;
        } else if (army <= 25) {
            bar = this._barRed;
        }
        bar.node.active = (true);
        bar.progress = (army/100);
        var fontColor = Colors.getMinePercentColor(army);
        this._textArmy.node.color = (fontColor.color);
        UIHelper.enableOutline(this._textArmy,fontColor.outlineColor, 2)
    }
    _setRedArmy(redArmy) {
        this._nodeText.removeAllChildren();
        let text = RichTextExtend.createWithContent(Lang.get('mine_report_red_army', { count: redArmy }));
        text.node.setAnchorPoint(0,0);
        var s = text.fontSize/2;
        text.node.y = -s;
        this._nodeText.addChild(text.node);
    }
    _setInfame(infame) {
        this._nodeText2.removeAllChildren();
        if (infame == 0) {
            return;
        }
        var langKey = '';
        if (infame > 0) {
            langKey = 'mine_report_infame_add';
        } else {
            infame = -infame;
            langKey = 'mine_report_infame_reduce';
        }
        var text = RichTextExtend.createWithContent(Lang.get(langKey, { count: infame }));
        text.node.setAnchorPoint(cc.v2(0, 0));
        this._nodeText2.addChild(text.node);
    }
    _turnBack(needTurn) {
        var scaleX = 1;
        this._nodeText.x = (-76);
        this._nodeText2.x = (-76);
        if (needTurn) {
            scaleX = -1;
            this._nodeText.x = (-50);
            this._nodeText2.x = (-50);
        }
        this._barGreen.node.setScale(scaleX);
        this._barYellow.node.setScale(scaleX);
        this._barRed.node.setScale(scaleX);
    }
}