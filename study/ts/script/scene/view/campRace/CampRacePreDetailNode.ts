import CampRaceHeroIcon from "./CampRaceHeroIcon";

import { handler } from "../../../utils/handler";

import { G_UserData, Colors } from "../../../init";

import { TextHelper } from "../../../utils/TextHelper";

import { Lang } from "../../../lang/Lang";

const { ccclass, property } = cc._decorator;
@ccclass
export default class CampRacePreDetailNode extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBG: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageFirst: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRank: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPlayerName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPower: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBase: cc.Node = null;

    @property({
        type: CampRaceHeroIcon,
        visible: true
    })
    _hero1: CampRaceHeroIcon = null;

    @property({
        type: CampRaceHeroIcon,
        visible: true
    })
    _hero2: CampRaceHeroIcon = null;

    @property({
        type: CampRaceHeroIcon,
        visible: true
    })
    _hero3: CampRaceHeroIcon = null;

    @property({
        type: CampRaceHeroIcon,
        visible: true
    })
    _hero4: CampRaceHeroIcon = null;

    @property({
        type: CampRaceHeroIcon,
        visible: true
    })
    _hero5: CampRaceHeroIcon = null;

    @property({
        type: CampRaceHeroIcon,
        visible: true
    })
    _hero6: CampRaceHeroIcon = null;
    _pos: any;
    _heroIcons: {};
    _touchIndex: number;
    _canEmbattle: boolean;
    _targetPos: any;

    ctor(pos) {
        this._pos = pos;
        this.onCreate();
    }
    onCreate() {
        this._heroIcons = {};
        this._touchIndex = 0;
        this._canEmbattle = true;
        if (this._pos == 1) {

            this._panelBase.on(cc.Node.EventType.TOUCH_START, this._onTouchBegan, this, false);
            this._panelBase.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMoved, this, false);
            this._panelBase.on(cc.Node.EventType.TOUCH_END, this._onTouchEnded, this, false);
            this._panelBase.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancel, this, false);

            for (var i = 1; i <= 6; i++) {
                this._heroIcons[i] = this['_hero' + i];
            }
        } else {
            for (var i = 1; i <= 6; i++) {
                var icon = this['_hero' + i];
                if (i < 4) {
                    this._heroIcons[i + 3] = icon;
                } else {
                    this._heroIcons[i - 3] = icon;
                }
            }
        }
    }
    onEnter() {
    }
    onExit() {
    }
    _checkMoveHit(location) {
        this._targetPos = null;
        for (var i = 1; i <= 6; i++) {
            var rectImage: cc.Rect = this._heroIcons[i].getBoundingBox();
            if (rectImage.contains(location)) {
                this._targetPos = i;
            }
        }
    }
    _checkIsSelectedKnight(touchPos) {
        for (var i in this._heroIcons) {
            var v = this._heroIcons[i];
            var rect = v.getBoundingBox();
            if (rect.contains(touchPos)) {
                return i;
            }
        }
        return null;
    }
    _checkFormation(touchPos?) {
        if (touchPos && this._canEmbattle) {
            for (var i in this._heroIcons) {
                var v = this._heroIcons[i];
                var rect = v.getBoundingBox();
                if (rect.contains(touchPos) && i != this._touchIndex.toString()) {
                    var embattle = G_UserData.getTeam().getEmbattle();
                    for (var index = 0; index < 6; index++) {
                        if (embattle[index] == i) {
                            embattle[index] = this._touchIndex;
                        } else if (embattle[index] == this._touchIndex) {
                            embattle[index] = Number(i);
                        }
                    }
                    G_UserData.getTeam().c2sChangeEmbattle(embattle);
                    break;
                }
            }
        }
        for (i in this._heroIcons) {
            var v = this._heroIcons[i];
            v.refreshIconPos();
        }
    }
    updatePlayer(player) {
        if (!player) {
            this._initPlayer(false);
            return;
        }
        this._initPlayer(true);
        this._textPlayerName.node.color = Colors.getOfficialColor(player.getOfficer_level());
        this._textPlayerName.string = player.getName();
        var textPower = TextHelper.getAmountText2(player.getPower());
        this._textPower.string = (textPower);
        var formation = player.getFormation();
        for (var i in formation) {
            var id = formation[i];
            var hero = player.getHeroDataById(id);
            var baseId = hero ? hero.getCoverId() : 0;
            var rank = hero ? hero.getRank_level() : 0;
            var limitLevel = hero ? hero.getLimitLevel() : 0;
            var limitRedLevel = hero ? hero.getLimitRedLevel() : 0
            this._heroIcons[Number(i) + 1].updateIcon(baseId, rank, limitLevel, limitRedLevel);
        }
        this._textRank.string = (Lang.get('camp_per_rank', { count: player.getPer_rank() }));
        this._imageFirst.node.active = (player.isFirst_hand());
    }
    _initPlayer(isPlayer) {
        this._imageFirst.node.active = (isPlayer);
        this._textRank.node.active = (isPlayer);
        if (isPlayer) {
            this._textPlayerName.node.color = (Colors.getCampWhite());
        } else {
            this._textPlayerName.string = (Lang.get('camp_no_enemy'));
            this._textPlayerName.node.color = (Colors.getCampGray());
            this._textPower.string = ('? ? ?');
            for (var i = 1; i <= 6; i++) {
                this._heroIcons[i].updateIcon(0);
            }
        }
    }
    _onTouchBegan(touch: cc.Touch, event) {
        var touchPos = this._panelBase.convertToNodeSpaceAR(touch.getStartLocation());
        var index = this._checkIsSelectedKnight(touchPos);
        if (index && this._canEmbattle) {
            this._heroIcons[index].setIconPosition(touchPos);
            this._heroIcons[index].setLocalZOrder(CampRaceHeroIcon.ZORDER_TOUCH);
            this._touchIndex = Number(index);
            return true;
        }
        return false;
    }
    _onTouchMoved(touch, event) {
        if (this._touchIndex != 0) {
            var movePos = this._panelBase.convertToNodeSpaceAR(touch.getLocation());
            this._heroIcons[this._touchIndex].setIconPosition(movePos);
        }
    }
    _onTouchEnded(touch, event) {
        if (this._touchIndex != 0) {
            this._heroIcons[this._touchIndex].setLocalZOrder(CampRaceHeroIcon.ZORDER_UNTOUCH);
            var endPos = this._panelBase.convertToNodeSpaceAR(touch.getLocation());
            this._checkFormation(endPos);
            this._touchIndex = 0;
        }
    }
    _onTouchCancel(touch, event) {
        if (this._touchIndex != 0) {
            this._heroIcons[this._touchIndex].setLocalZOrder(CampRaceHeroIcon.ZORDER_UNTOUCH);
            this._checkFormation();
            this._touchIndex = 0;
        }
    }

    setEmbattleEnable(enable) {
        this._canEmbattle = enable;
    }

}