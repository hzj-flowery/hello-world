const { ccclass, property } = cc._decorator;

@ccclass
export default class PanelExp extends cc.Component {
    @property({ type: cc.Label, visible: true })
    _textLevel: cc.Label = null;

    @property({ type: cc.ProgressBar, visible: true })
    _expPercent: cc.ProgressBar = null;

    @property({ type: cc.ProgressBar, visible: true })
    _expPercentBG: cc.ProgressBar = null;

    @property({ type: cc.Label, visible: true })
    _textExpPercent1: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textExpPercent2: cc.Label = null;

    public setLevel(level: number) {
        this._textLevel.string = level.toString();
    }

    public setExpPercent(percent: number) {
        this._expPercent.progress = percent/100;
    }

    public setExpPercentBG(percent: number) {
        this._expPercentBG.progress = percent/100;
    }

    public setTextExpPercent1(exp: string) {
        this._textExpPercent1.string = exp;
    }

    public setTextExpPercent2(exp: string) {
        this._textExpPercent2.string = exp;
    }
}