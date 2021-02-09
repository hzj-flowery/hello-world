const { ccclass, property } = cc._decorator;

import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'

import CommonResourceInfo from '../../../ui/component/CommonResourceInfo'
import { Lang } from '../../../lang/Lang';
import { TextHelper } from '../../../utils/TextHelper';
import { DropHelper } from '../../../utils/DropHelper';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';

@ccclass
export default class TowerChooseCell extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBG: cc.Sprite = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _reward1: CommonResourceInfo = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _reward2: CommonResourceInfo = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _btnFight: CommonButtonLevel1Highlight = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPower: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _starNode1: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _starNode2: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _starNode3: cc.Node = null;

    private _layerConfig;
    private _difficulty;
    private _callback;
    private _starNodes: cc.Node[];
    private _rewards: CommonResourceInfo[];

    public init(layerConfig, difficulty, callback) {
        this._layerConfig = layerConfig;
        this._difficulty = difficulty;
        this._callback = callback;
    }

    public onLoad() {
        this._btnFight.setString(Lang.get('challenge_button'));

        this._starNodes = [this._starNode1, this._starNode2, this._starNode3];
        for (var i = 0; i < 3; i++) {
            this._starNodes[i].active = ((i + 1) == this._difficulty);
        }
        var battlePoint = this._layerConfig['team' + (this._difficulty + '_combat')];
        this._textPower.string = (TextHelper.getAmountText2(battlePoint));
        var drop = DropHelper.getTowerDrop(this._layerConfig.id, this._difficulty);

        this._rewards = [this._reward1, this._reward2];
        for (let i = 0; i < 2; i++) {
            if (drop[i]) {
                this._rewards[i].updateUI(drop[i].type, drop[i].value, drop[i].size);
            }
        }
        var titleColor = this._difficulty;
        var titleBG = Path.getTowerChallengeIcon('img_level0' + titleColor);
        UIHelper.loadTexture(this._imageBG, titleBG);
    }

    public onFightClick(sender, event) {
        if (this._callback) {
            this._callback(this._difficulty);
        }
    }
}