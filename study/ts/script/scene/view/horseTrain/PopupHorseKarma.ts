const { ccclass, property } = cc._decorator;

import { AudioConst } from '../../../const/AudioConst';
import { SignalConst } from '../../../const/SignalConst';
import { G_AudioManager, G_EffectGfxMgr, G_Prompt, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonHorseIcon from '../../../ui/component/CommonHorseIcon';
import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop';
import PopupBase from '../../../ui/PopupBase';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';
import ListView from '../recovery/ListView';
import HorseKarmaCell from './HorseKarmaCell';

@ccclass
export default class PopupHorseKarma extends PopupBase {

    @property({ type: CommonNormalLargePop, visible: true })
    _panelBg: CommonNormalLargePop = null;

    @property({ type: ListView, visible: true })
    _listView: ListView = null;

    private _parentView;
    private _activeData;
    private _canClose;
    private _lastPowerValue;
    private _signalHorseKarmaActive;
    private _karmaData;
    private _karmaNum;
    private _effectPhotoId;

    public init(parentView) {
        this._parentView = parentView;
    }

    public onCreate() {
        this._activeData = null;
        this._canClose = true;
        this._lastPowerValue = 0;
        this._panelBg.addCloseEventListener(handler(this, this._onButtonClose));
        this._listView.setCallback(handler(this, this._onItemUpdate));
    }

    public onEnter() {
        this._signalHorseKarmaActive = G_SignalManager.add(SignalConst.EVENT_HORSE_KARMA_ACTIVE_SUCCESS, handler(this, this._horseKarmaActiveSuccess));
        this._initHorseKarmaInfo();
        this._updateView();
    }

    public onExit() {
        this._signalHorseKarmaActive.remove();
        this._signalHorseKarmaActive = null;
    }

    private _initHorseKarmaInfo() {
        [this._karmaData, this._karmaNum] = G_UserData.getHorse().getHorsePhotoStateList();
        this._lastPowerValue = G_UserData.getBase().getPower();
        G_UserData.getAttr().recordPower();
    }

    private _updateView() {
        this._panelBg.setTitle(Lang.get('horse_karma_title'));
        this._listView.clearAll();
        this._listView.resize(this._karmaNum);
    }

    private _onItemUpdate(cell: cc.Node, index) {
        let item = cell.getComponent(HorseKarmaCell);
        item.updateUI(index, this._karmaData[index]);
        item.setCustomCallback(handler(this, this._onItemTouch));
    }

    private _onItemSelected(item, index) {
    }

    public doActive(photoId) {
        G_UserData.getHorse().c2sActiveWarHorsePhoto(photoId);
    }

    private _onItemTouch(index, t) {
        var photoId = this._karmaData[index].photoId;
        G_UserData.getHorse().c2sActiveWarHorsePhoto(photoId);
    }

    private _onButtonClose() {
        if (this._canClose) {
            this.close();
        }
    }

    private _horseKarmaActiveSuccess(eventName, photoId) {
        [this._karmaData, this._karmaNum] = G_UserData.getHorse().getHorsePhotoStateList();
        var itemList = this._listView.getItems();
        for (let i in itemList) {
            var cell = itemList[i].getComponent(HorseKarmaCell);
            if (cell.getKarmaId() == photoId) {
                for (const key in this._karmaData) {
                    if (this._karmaData[key].photoId == photoId) {
                        cell.updateUI(null, this._karmaData[key]);
                        G_UserData.getAttr().recordPower();
                        this._playEffect(photoId);
                        return;
                    }
                }
            }
        }
    }

    private _playEffect(photoId) {
        this._effectPhotoId = photoId;
        function effectFunction(effect) {
            if (effect == 'heidi') {
                // var layerColor = cc.LayerColor.create(cc.c4b(0, 0, 0, 255 * 0.8));
                // layerColor.setAnchorPoint(0.5, 0.5);
                // layerColor.setIgnoreAnchorPointForPosition(false);
                // layerColor.setTouchEnabled(true);
                // layerColor.setTouchMode(cc.TOUCHES_ONE_BY_ONE);
                // return layerColor;
                return UIHelper.createLayerColor(cc.color(0, 0, 0, 255 * 0.8))
            }
            return this._createActionNode(effect);
        }
        function eventFunction(event) {
            if (event == 'piaozi') {
                this._playKarmaActiveSummary();
            } else if (event == 'finish') {
                this._canClose = true;
                this.setShowFinish(true);
            }
        }
        this._canClose = false;
        this.setShowFinish(false);
        var len = G_UserData.getHorse().getHorsePhotoNeedNum(photoId);
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_yuanfen_' + (len + 'p'), effectFunction.bind(this), eventFunction.bind(this), true);
        effect.node.setPosition(0, 0);
        G_AudioManager.playSoundWithId(AudioConst.SOUND_HERO_KARMA);
    }

    private _createActionNode(effect: string): cc.Node {
        if (effect.indexOf('moving_yuanfen_icon_') > -1) {
            var index = effect.replace('moving_yuanfen_icon_', "");;
            var node = this._createIconNode(parseInt(index));
            return node;
        }
        return new cc.Node();
    }

    private _createIconNode(index): cc.Node {
        function effectFunction(effect) {
            if (effect == 'icon_2') {
                let node = new cc.Node();
                var groupData = G_UserData.getHorse().getHorsePhotoDetailInfo(this._effectPhotoId);
                var horseBaseId = groupData['horse' + index];
                if (horseBaseId) {
                    cc.resources.load(Path.getCommonPrefab("CommonHorseIcon"), cc.Prefab, (err, res: cc.Prefab) => {
                        if (res == null || !node.isValid) {
                            return;
                        }
                        let icon = cc.instantiate(res).getComponent(CommonHorseIcon);
                        node.addChild(icon.node);
                        icon.updateUI(horseBaseId);
                    });
                    return node;
                }
            }
        }
        function eventFunction(event) {
            if (event == 'finish') {
            }
        }
        var node = new cc.Node();
        var resName = 'moving_yuanfen_icon_' + index;
        var effect = G_EffectGfxMgr.createPlayMovingGfx(node, resName, effectFunction.bind(this), eventFunction.bind(this), false);
        return node;
    }

    private _playKarmaActiveSummary() {
        G_Prompt.playTotalPowerSummary();
    }
}