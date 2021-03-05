const { ccclass, property } = cc._decorator;

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'
import { G_ResolutionManager, G_SceneManager, G_UserData } from '../../../init';
import { handler } from '../../../utils/handler';
import PopupBase from '../../../ui/PopupBase';
import { SeasonSportHelper } from './SeasonSportHelper';
import { Lang } from '../../../lang/Lang';

@ccclass
export default class PopupSeasonRewardsTip extends PopupBase {

    @property({ type: cc.Node, visible: true })
    _panelTouch: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _panelSeason: cc.Node = null;

    @property({ type: CommonIconTemplate, visible: true })
    _fileNodeIcon2: CommonIconTemplate = null;

    @property({ type: cc.Label, visible: true })
    _textDanRewards2: cc.Label = null;

    @property({ type: cc.Sprite, visible: true })
    _imageSeasonTitle2: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _panelNewSeason: cc.Node = null;

    @property({ type: CommonIconTemplate, visible: true })
    _fileNodeIcon1: CommonIconTemplate = null;

    @property({ type: cc.Label, visible: true })
    _textDanRewards1: cc.Label = null;

    private _callback;
    public init(callback) {
        this._callback = callback;
        this.setNotCreateShade(true);
    }
    public onCreate() {
        this._panelSeason.active = false;
        this._panelNewSeason.active = true;
        this._panelTouch.setContentSize(G_ResolutionManager.getDesignCCSize());
        this._panelTouch.on(cc.Node.EventType.TOUCH_END, handler(this, this._onClick));
        (this._panelTouch as any)._touchListener.setSwallowTouches(false);
    }

    public onEnter() {
        this._updateView();
    }

    public onExit() {
        if (this._callback) {
            this._callback();
        }
    }

    public closeView() {
        this.close();
    }

    public open() {
        var scene = G_SceneManager.getRunningScene();
        scene.addChildToPopup(this.node);
    }

    public close() {
        this.onClose();
        this.signal.dispatch('close');
        this.node.removeFromParent();
    }

    private _updateView() {
        var curStar = G_UserData.getSeasonSport().getCurSeason_Star();
        var danInfo = SeasonSportHelper.getDanInfoByStar(curStar);
        var [type , value, size]= SeasonSportHelper.getFightAwardsByStar(curStar);
        if (type != null) {
            this._fileNodeIcon1.unInitUI();
            this._fileNodeIcon1.initUI(type, value, size);
            this._fileNodeIcon1.setImageTemplateVisible(true);
            this._textDanRewards1.string = danInfo.name + Lang.get('season_lastrewards');
        }
    }

    private _onClick() {
        this.close();
    }
}