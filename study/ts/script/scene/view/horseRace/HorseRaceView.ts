const { ccclass, property } = cc._decorator;

import { AudioConst } from '../../../const/AudioConst';
import { HorseRaceConst } from '../../../const/HorseRaceConst';
import { SignalConst } from '../../../const/SignalConst';
import { FAKE_HORCE_RUN } from '../../../debug/DebugConfig';
import { G_AudioManager, G_ConfigLoader, G_SceneManager, G_SignalManager, G_UserData } from '../../../init';
import CommonCountdownAnimation from '../../../ui/component/CommonCountdownAnimation';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import { ResourceData } from '../../../utils/resource/ResourceLoader';
import ViewBase from '../../ViewBase';
import HorseRaceMap from './HorseRaceMap';
import PopupHorseRaceEnd from './PopupHorseRaceEnd';
import PopupHorseRaceNotice from './PopupHorseRaceNotice';

@ccclass
export default class HorseRaceView extends ViewBase {

    @property({ type: cc.Node, visible: true })
    _nodeMap: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _panelTouch: cc.Node = null;

    @property({ type: cc.Button, visible: true })
    _btnJump: cc.Button = null;

    @property({ type: cc.Sprite, visible: true })
    _percentBG: cc.Sprite = null;

    @property({ type: cc.ProgressBar, visible: true })
    _percentBar: cc.ProgressBar = null;

    @property({ type: cc.Sprite, visible: true })
    _imageNode: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textPercent: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textPoint: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textDistance: cc.Label = null;

    @property({ type: CommonCountdownAnimation, visible: true })
    _countDown: CommonCountdownAnimation = null;

    @property({ type: HorseRaceMap, visible: true })
    _raceMap: HorseRaceMap = null;

    private _raceConfigs = [
        "horse_tu_1",
        "horse_tu_1_bg",
        "horse_tu_2",
        "horse_tu_2_bg",
        "horse_tu_3",
        "horse_tu_3_bg",
        "horse_tu_4",
        "horse_tu_4_bg",
        "horse_tu_5",
        "horse_tu_5_bg",
        "horse_tu_6",
        "horse_tu_6_bg"
    ];
    protected preloadResList: ResourceData[] = [
        { path: Path.getHorseRaceImg('bg'), type: cc.SpriteFrame },
        { path: Path.getPrefab("PopupHorseRaceNotice", "horseRace"), type: cc.Prefab }
    ];

    private _listenerHorseInfo;
    private _listenerHorseRide;
    private _listenerHorseGameOver;
    private _listenerHorseGetPoint;
    private _listenerHorseMoveX;
    private _listenerCountDown;
    private _listenerRematch;
    private _listenerHorseRaceStart;
    private _runDistance;
    private _runPoint;
    private _percent;

    private percentFix = 0
    private meterFix = 10

    public preloadRes(callBack: Function, args: any[]) {
        G_ConfigLoader.loadConifgArray(this._raceConfigs, () => {
            super.preloadRes(callBack);
        });
    }

    public onCreate() {
        this.setSceneSize();
        this._btnJump.node.on(cc.Node.EventType.TOUCH_START, handler(this, this._onJumpClick));
        this._panelTouch.on(cc.Node.EventType.TOUCH_START, handler(this, this._onJumpClick));
        // this._nodeMap.addChild(this._raceMap);
        var textureList = [
            'img_runway_star',
            'img_runway_star1',
            'img_runway_star2',
            'img_runway_star3'
        ];
        this._countDown.setTextureList(textureList);
        this._raceMap.init();
        this._initMatch();
    }

    public onEnter() {
        if (!FAKE_HORCE_RUN) {
            if (G_UserData.getHorseRace().isExpired()) {
                G_UserData.getHorseRace().c2sWarHorseRideInfo();
            }
        }
        G_AudioManager.playMusicWithId(AudioConst.MUSIC_HORSE_RACE);

        let popupStartNode: cc.Node = cc.instantiate(cc.resources.get(Path.getPrefab("PopupHorseRaceNotice", "horseRace"), cc.Prefab));
        let popupStart: PopupHorseRaceNotice = popupStartNode.getComponent(PopupHorseRaceNotice);
        popupStart.open();

        this._listenerHorseInfo = G_SignalManager.add(SignalConst.EVENT_HORSE_RACE_RIDE_INFO, handler(this, this._onEventHorseInfo));
        this._listenerHorseRide = G_SignalManager.add(SignalConst.EVENT_HORSE_RACE_RIDE_END, handler(this, this._onEventHorseRide));
        this._listenerHorseGameOver = G_SignalManager.add(SignalConst.EVENT_HORSE_GAME_OVER, handler(this, this._onEventHorseGameOver));
        this._listenerHorseGetPoint = G_SignalManager.add(SignalConst.EVENT_HORSE_GET_POINT, handler(this, this._onEventHorseGetPoint));
        this._listenerHorseMoveX = G_SignalManager.add(SignalConst.EVENT_HORSE_MOVE_X, handler(this, this._onEventHorseMoveX));
        this._listenerCountDown = G_SignalManager.add(SignalConst.EVENT_HORSE_COUNT_DOWN, handler(this, this._onEventCountDown));
        this._listenerRematch = G_SignalManager.add(SignalConst.EVENT_HORSE_REMATCH, handler(this, this._onEventRematch));
        this._listenerHorseRaceStart = G_SignalManager.add(SignalConst.EVENT_HORSE_RACE_TOKEN, handler(this, this._onEventHorseRaceToken));
    }

    public onExit() {
        this._listenerHorseInfo.remove();
        this._listenerHorseInfo = null;
        this._listenerHorseRide.remove();
        this._listenerHorseRide = null;
        this._listenerHorseGameOver.remove();
        this._listenerHorseGameOver = null;
        this._listenerHorseGetPoint.remove();
        this._listenerHorseGetPoint = null;
        this._listenerHorseMoveX.remove();
        this._listenerHorseMoveX = null;
        this._listenerCountDown.remove();
        this._listenerCountDown = null;
        this._listenerRematch.remove();
        this._listenerRematch = null;
        this._listenerHorseRaceStart.remove();
        this._listenerHorseRaceStart = null;
        G_AudioManager.playMusicWithId(AudioConst.MUSIC_CITY);
    }

    private _initMatch() {
        var manIndex = Math.randInt(1, HorseRaceConst.MAP_COUNT);
        this._raceMap.resetMap(manIndex);
        this._imageNode.node.x = -this._percentBG.node.width / 2;
        this._textPoint.string = (0).toString();
        this._countDown.node.active = (false);
        this._percentBar.progress = (this.percentFix) / 100;
        this._textPercent.string = ('0%');
        this._textDistance.string = (0).toString();
        this._percent = 0;
    }

    private _onJumpClick(sender, state) {
        G_SignalManager.dispatch(SignalConst.EVENT_HORSE_JUMP);
    }

    private _onEventHorseInfo() {
    }

    private _onEventHorseRide(eventName, award) {
        G_SceneManager.openPopup(Path.getPrefab("PopupHorseRaceEnd", "horseRace"), (popupHorseRaceEnd: PopupHorseRaceEnd) => {
            popupHorseRaceEnd.init(this._runDistance, this._runPoint, award, this._percent == 100);
            popupHorseRaceEnd.open();
        })
    }

    private _onEventHorseGameOver(eventName, horsePosX, point) {
        if (FAKE_HORCE_RUN) {
            this._initMatch();
            this._onEventCountDown();
            return;
        }
        var mapWidth = this._raceMap.getMapDistance();
        var percent = Math.ceil(horsePosX / mapWidth * 100);
        if (percent > 100) {
            percent = 100;
        }
        this._runDistance = Math.floor(horsePosX / this.meterFix);
        G_UserData.getHorseRace().c2sWarHorseRide(percent, point);
        this._percent = percent;
    }

    private _onEventHorseGetPoint(eventName, point) {
        this._textPoint.string = (point);
        this._runPoint = point;
    }

    private _onEventHorseMoveX(eventName, horsePosX) {
        var mapWidth = this._raceMap.getMapDistance();
        var percent = horsePosX / mapWidth;
        this._textDistance.string = (Math.floor(horsePosX / this.meterFix)).toString();
        var showPercent = Math.floor(percent * 100);
        if (showPercent > 100) {
            showPercent = 100;
        }
        this._textPercent.string = (showPercent + '%');
        var width = this._percentBG.node.getContentSize().width;
        var nodePos = width * percent;
        if (nodePos > width) {
            nodePos = width;
        }
        this._imageNode.node.x = (nodePos) - width / 2;
        this._percentBar.progress = (percent * 100 + this.percentFix) / 100;
    }

    private _onEventCountDown() {
        this._countDown.node.active = (true);
        G_AudioManager.playSoundWithId(AudioConst.SOUND_HORSE_RACE_COUNT);
        this._countDown.playAnimation(4, 1, function () {
            G_SignalManager.dispatch(SignalConst.EVENT_HORSE_RACE_START);
        });
        this.scheduleOnce(function () {
            G_SignalManager.dispatch(SignalConst.EVENT_HORSE_START_ACTION);
        }, 3)
    }

    private _onEventHorseRaceToken() {
        this._onEventCountDown();
    }

    private _onEventRematch() {
        this._initMatch();
        G_UserData.getHorseRace().c2sWarHorseRideStart();
    }
}