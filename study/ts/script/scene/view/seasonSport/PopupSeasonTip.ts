import PopupBase from "../../../ui/PopupBase";
import { G_ResolutionManager, G_SceneManager, Colors, G_UserData } from "../../../init";
import { handler } from "../../../utils/handler";
import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";
import { Lang } from "../../../lang/Lang";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupSeasonTip extends PopupBase {

    @property({ type: cc.Node, visible: true })
    _panelBg: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _desNode: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _panelTouch: cc.Node = null;

    private _dstPosition;
    private _label:cc.Label;
    public init(dstPosition) {
        this._dstPosition = dstPosition || cc.v2(0, 0);
        this.setNotCreateShade(true);
    }

    public onCreate() {
        this._label = null;
        this._panelTouch.setContentSize(G_ResolutionManager.getDesignCCSize());
        this._panelTouch.on(cc.Node.EventType.TOUCH_END, handler(this, this._onClick));
        (this._panelTouch as any)._touchListener.setSwallowTouches(false);
    }

    public onEnter() {
        this._updateView();
    }

    public onExit() {
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
        if (this._label == null) {
            this._label = UIHelper.createWithTTF('', Path.getCommonFont(), 22);
            this._label.lineHeight = 25;
            this._label.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
            this._label.node.setAnchorPoint(cc.v2(0, 0.8));
            this._label.node.color = (Colors.DARK_BG_ONE);
            this._label.node.width = (450);
            this._desNode.addChild(this._label.node);
        }
        var stage = G_UserData.getSeasonSport().getSeason_Stage();
        this._label.string = Lang.get('season_tip_rulecontent_' + stage);
        UIHelper.updateLabelSize(this._label);
        var txtHeight = this._label.node.getContentSize().height;
        var panelHeight = 132;
        if (txtHeight > 132 - 60) {
            panelHeight = 60 + txtHeight;
            this._desNode.y = (panelHeight - 49);
            var bgSize = this._panelBg.getContentSize();
            this._panelBg.setContentSize(cc.size(bgSize.width, panelHeight));
        }
        this._panelBg.setPosition(this._dstPosition);
    }

    private _onClick() {
        this.close();
    }
}