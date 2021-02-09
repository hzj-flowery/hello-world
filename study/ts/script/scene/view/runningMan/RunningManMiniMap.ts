import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";
import { RunningManHelp } from "./RunningManHelp";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RunningManMiniMap extends cc.Component {

    @property({ type: cc.Sprite, visible: true })
    _mapBk: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _line1: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _line2: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _line3: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _line4: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _line5: cc.Node = null;

    private IMAGE_NORMAL = "img_runway_smallmap_lv";
    private IMAGE_TOP = "img_runway_smallmap_red";
    private _pixelDist;
    private _lineNodes: cc.Node[];

    public onLoad() {
        this._pixelDist = this._line1.getContentSize().width - 10;
    }

    public reset() {
        if (this._lineNodes == null) {
            this._lineNodes = [this._line1, this._line2, this._line3, this._line4, this._line5];
        }
        for (let i = 0; i < 5; i++) {
            var widget = this._lineNodes[i].getChildByName('Image_run');
            widget.x = (0);
            UIHelper.loadTexture(widget.getComponent(cc.Sprite), Path.getRunningMan(this.IMAGE_NORMAL));
        }
    }

    public updateUI() {
        if (this._lineNodes == null) {
            this._lineNodes = [this._line1, this._line2, this._line3, this._line4, this._line5];
        }
        var [runningTable, maxIndex] = RunningManHelp.runningProcess();
        for (let i in runningTable) {
            var runningData = runningTable[i];
            var updatePos = Math.floor(runningData.percent * this._pixelDist);
            var subNode:cc.Node = this._lineNodes[runningData.roadNum - 1].getChildByName('Image_run');
            subNode.x = (updatePos);
            UIHelper.loadTexture(subNode.getComponent(cc.Sprite), Path.getRunningMan(this.IMAGE_NORMAL));
        }
        var maxTable = runningTable[maxIndex];
        if (maxTable) {
            var subNode:cc.Node = this._lineNodes[maxTable.roadNum - 1].getChildByName('Image_run');
            UIHelper.loadTexture(subNode.getComponent(cc.Sprite), Path.getRunningMan(this.IMAGE_TOP));
        }
    }
}