import { clone } from "../../utils/GlobleFunc";
import { Lang } from "../../lang/Lang";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonProgressNode extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageProgress: cc.Sprite = null;

    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _loadingBar: cc.ProgressBar = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageDivider: cc.Sprite = null;


    @property({
        type: cc.Label,
        visible: true
    })
    _textProgress: cc.Label = null;

    _imgProgressSize: cc.Size;
    _dividerNodeArr: any[];

    public static readonly EXPORTED_METHODS = [
        'setPercent',
        'showDivider',
        'setProgressValue',
        'showLightLine'
    ];
    public static readonly PROGRESS_TYPE_LOADBAR = 1;
    public static readonly PROGRESS_TYPE_IMG = 2;
    _target: any;

    onLoad() {
        this._imgProgressSize = cc.size(0, 0);
        this._dividerNodeArr = [];

        if (this._textProgress) {
            this._textProgress.node.zIndex = (1);
        }
        if (this._imageProgress) {
            this._imgProgressSize = this._imageProgress.node.getContentSize();
        } else {
            this._imgProgressSize = this._loadingBar.node.getContentSize();
        }
        this._dividerNodeArr[0] = this._imageDivider.node;
        this.showDivider(false);
    }
    setPercent(currValue, maxValue, percentType?) {
        var percent = currValue >= maxValue && 1 || currValue / maxValue;
        percentType = percentType || CommonProgressNode.PROGRESS_TYPE_IMG;
        if (percentType == CommonProgressNode.PROGRESS_TYPE_LOADBAR && this._loadingBar) {
            this._loadingBar.progress = percent;
        } else if (percentType == CommonProgressNode.PROGRESS_TYPE_IMG && this._imageProgress) {
            var size = cc.size(this._imgProgressSize.width * percent, this._imgProgressSize.height);
            this._imageProgress.node.setContentSize(size);
            this.setProgressValue(currValue, maxValue);
        }
    }
    showDivider(needShow, maxDividerNum?, currValue?, maxValue?) {
        if (!this._imageDivider) {
            return;
        }
        for (var k in this._dividerNodeArr) {
            var v = this._dividerNodeArr[k];
            v.active = (false);
        }
        if (needShow == false || maxDividerNum <= 0 || maxValue <= 0) {
            return;
        }
        var oldDiverNum = this._dividerNodeArr.length;
        var needDividerNum = Math.ceil(maxDividerNum * currValue / maxValue) - 1;
        if (oldDiverNum < needDividerNum) {
            for (var i = 0; i < needDividerNum - oldDiverNum; i += 1) {
                let newImageDivider = (cc.instantiate(this._imageDivider.node) as cc.Node).getComponent(cc.Sprite);
                this.node.addChild(newImageDivider.node);
                this._dividerNodeArr.push(newImageDivider.node);
            }
        }
        var dividerGap = this._imgProgressSize.width / maxDividerNum;
        for (var i = 0; i < needDividerNum; i += 1) {
            var node = this._dividerNodeArr[i];
            node.active = (true);
            node.x = (dividerGap * (i+1));
        }
    }
    showLightLine(needShow, currValue, maxValue, minShowLightDis?) {
        if (!this._imageDivider) {
            return;
        }
        if (maxValue <= 0 || !needShow) {
            this._imageDivider.node.active = (false);
            return;
        }
        var lightPos = this._imgProgressSize.width * currValue / maxValue+284;
        var size = this._imageDivider.node.getContentSize();
        minShowLightDis = minShowLightDis || size.width * 0.8;
        // logWarn(lightPos + ('_____________===' + minShowLightDis));
        if (lightPos < minShowLightDis || lightPos > this._imgProgressSize.width - minShowLightDis) {
            this._imageDivider.node.active = (false);
            return;
        }
        // logWarn('_____________===' + minShowLightDis);
        this._imageDivider.node.active = (needShow);
        this._imageDivider.node.x = (lightPos);
    }
    setProgressValue(currValue, maxValue) {
        if (!this._textProgress) {
            return;
        }
        this._textProgress.node.active = (true);
        this._textProgress.string = (Lang.get('common_progress', {
            curr: currValue,
            max: maxValue
        }));
    }

}