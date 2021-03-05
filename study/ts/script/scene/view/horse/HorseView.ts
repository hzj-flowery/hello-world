const { ccclass, property } = cc._decorator;

import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'
import ViewBase from '../../ViewBase';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { G_SignalManager, G_SceneManager, G_UserData } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { FunctionConst } from '../../../const/FunctionConst';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { HorseRaceHelper } from '../horseRace/HorseRaceHelper';
import { Path } from '../../../utils/Path';
import PopupHorseKarma from '../horseTrain/PopupHorseKarma';

@ccclass
export default class HorseView extends ViewBase {

    @property({ type: cc.Node, visible: true })
    _btnRace: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _imageHorsePlayRP: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _buttonHorseList: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _imageHorseListRP: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _buttonHorseJudge: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _imageHorseJudgeRP: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _buttonHorseShop: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _imageHorseShopRP: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _btnHorsePhoto: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _imageHorsePhotoRP: cc.Sprite = null;

    @property({ type: CommonTopbarBase, visible: true })
    _topBar: CommonTopbarBase = null;

    private _signalRedPointUpdate;

    public preloadRes(callBack: Function, params) {
        this.addPreloadSceneRes(115);
        super.preloadRes(callBack, params);
    }

    onCreate() {
        this.setSceneSize();
        this.updateSceneId(115);
        this._topBar.setImageTitle('txt_sys_com_horse');
        this._topBar.updateUI(TopBarStyleConst.STYLE_HORSE);
    }

    public onEnter() {
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._redPointUpdate));
        this._updateBtnRP();
    }

    public onExit() {
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
    }

    public onHorsePhotoClick() {
        G_SceneManager.openPopup(Path.getPrefab('PopupHorseKarma', "horse"), (popupHorseKarma: PopupHorseKarma) => {
            popupHorseKarma.init(this);
            popupHorseKarma.openWithAction();
        })
    }

    public onRaceClick() {
        G_SceneManager.showScene('horseRace');
    }

    public onListClick() {
        G_SceneManager.showScene('horseList');
    }

    public onJudgeClick() {
        G_SceneManager.showScene('horseJudge');
    }

    public onShopClick() {
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_HORSE_SHOP);
    }

    private _updateBtnRP() {
        var reach1 = RedPointHelper.isModuleReach(FunctionConst.FUNC_HORSE_LIST);
        this._imageHorseListRP.node.active = (reach1);
        var reach2 = !HorseRaceHelper.isRewardFull();
        this._imageHorsePlayRP.node.active = (reach2);
        var reach3 = RedPointHelper.isModuleReach(FunctionConst.FUNC_HORSE_JUDGE);
        this._imageHorseJudgeRP.node.active = (reach3);
        var reach4 = false;
        this._imageHorseShopRP.node.active = (reach4);
        var horsePhotoValid = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE_BOOK, 'horseBook');
        this._imageHorsePhotoRP.node.active = (horsePhotoValid);
    }

    private _redPointUpdate() {
        var horsePhotoValid = G_UserData.getHorse().isHorsePhotoValid();
        this._imageHorsePhotoRP.node.active = (horsePhotoValid);
    }
}