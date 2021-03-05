import { G_UserData } from "../../../init";
import CommonHeroAvatar from "../../../ui/component/CommonHeroAvatar";
import CommonUI from "../../../ui/component/CommonUI";
import PopupBase from "../../../ui/PopupBase";
import { AvatarDataHelper } from "../../../utils/data/AvatarDataHelper";
import { clone2 } from "../../../utils/GlobleFunc";
import { Path } from "../../../utils/Path";

var IMAGE_STATE_NORMAL = 0;
var IMAGE_STATE_SELECTED = 1;
var IMAGE_NORMAL_RES = 'img_embattleherbg_nml';
var IMAGE_OVER_RES = 'img_embattleherbg_over';


const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupEmbattle extends PopupBase {

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonClose: cc.Button = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelKnightBg: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageKnightPos1: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageKnightPos4: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageKnightPos5: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageKnightPos2: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageKnightPos3: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageKnightPos6: cc.Sprite = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _commonHeroAvatarPrefab: cc.Prefab = null;

    private _embattleCopy: any;
    private _embattleMapping: any;
    private _embattlePos2Data: any;
    private _imageState: any;
    private _originalPos: number;
    private _isTouch: boolean;
    private _targetPos: number;
    private _distanceX: number;
    private _distanceY: number;
    private _curSelectedKnightSpine: any;
    onCreate() {
        this._embattleCopy = {};
        this._embattleMapping = {};
        this._embattlePos2Data = {};
        this._imageState = {};
        this._originalPos = null;
        this._targetPos = null;
        this._isTouch = false;
    }
    onEnter() {
        this._embattleCopy = clone2(G_UserData.getTeam().getEmbattle());
        this._initKnights();
        this._panelKnightBg.on(cc.Node.EventType.TOUCH_CANCEL, this._touchCanceled, this);
        this._panelKnightBg.on(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        this._panelKnightBg.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this._panelKnightBg.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMoved, this);

        this.scheduleOnce(function () {
            for (var i = 1; i <= 6; i++) {
                var data = this._embattlePos2Data[i];
                if (data) {
                    (data.spine as CommonHeroAvatar)._playAnim("idle", true);
                }
            }
        }.bind(this))
    }
    onClose() {
        if (this._checkIsChanged()) {
            G_UserData.getTeam().c2sChangeEmbattle(this._embattleCopy);
        }
    }
    onExit() {

    }
    getEmbattleMappingTable() {
        var result = {};
        for (var i in this._embattleCopy) {
            var embattlePos = this._embattleCopy[i];
            if (embattlePos > 0) {
                result[embattlePos] = parseInt(i) + 1;
            }
        }
        return result;
    }
    private _initKnights() {
        this._embattleMapping = this.getEmbattleMappingTable();
        for (var i = 1; i <= 6; i++) {
            var imagePos = this['_imageKnightPos' + i] as cc.Sprite;
            imagePos.addComponent(CommonUI).loadTexture(Path.getEmbattle(IMAGE_NORMAL_RES));
            this._imageState[i] = IMAGE_STATE_NORMAL;
            var lineupPos = this._embattleMapping[i];
            if (lineupPos) {
                var avatar = this._createHeroAvatar(lineupPos);
                avatar.node.setPosition(new cc.Vec2(imagePos.node.x + 100, imagePos.node.y + 50));
                this._panelKnightBg.addChild(avatar.node, i * 10);
                if (!this._embattlePos2Data[i]) {
                    this._embattlePos2Data[i] = {};
                }
                this._embattlePos2Data[i].spine = avatar;
                this._embattlePos2Data[i].lineupPos = lineupPos;
            }
        }
    }

    private _createHeroAvatar(lineupPos): CommonHeroAvatar {
        var heroId = G_UserData.getTeam().getHeroIdWithPos(lineupPos);
        var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
        var [heroBaseId, isEquipAvatar, avatarLimitLevel, arLimitLevel] = AvatarDataHelper.getShowHeroBaseIdByCheck(heroUnitData);
        var avatar = cc.instantiate(this._commonHeroAvatarPrefab).getComponent(CommonHeroAvatar);
        avatar.init();
        avatar.setTouchEnabled(false);
        var limitLevel = avatarLimitLevel || heroUnitData.getLimit_level();
        var limitRedLevel = arLimitLevel || heroUnitData.getLimit_rtg();
        avatar.updateUI(heroBaseId, null, null, limitLevel, null, null, limitRedLevel);
        avatar.showAvatarEffect(isEquipAvatar);
        return avatar;
    }

    private _updateKnights() {
        for (var i = 1; i <= 6; i++) {
            var data = this._embattlePos2Data[i];
            if (data) {
                var imagePos = this['_imageKnightPos' + i] as cc.Sprite;
                this._imageState[i] = IMAGE_STATE_NORMAL;
                imagePos.addComponent(CommonUI).loadTexture(Path.getEmbattle(IMAGE_NORMAL_RES));
                data.spine.node.setPosition(new cc.Vec2(imagePos.node.x + 100, imagePos.node.y + 50));
                (data.spine.node as cc.Node).zIndex = (i * 10);
            }
        }
    }
    private onButtonClose() {
        this.close();
    }

    private _onTouchEnd(touch: cc.Touch): void {
        if (this._isTouch) {
            this._onKnightUnselected();
        }
    }
    private _onTouchMoved(touch: cc.Touch): void {
        if (this._isTouch) {
            var movePos = touch.getLocation();
            var localMovePos = this._panelKnightBg.convertToNodeSpaceAR(movePos)
            var spinePosX = localMovePos.x + this._distanceX
            var spinePosY = localMovePos.y + this._distanceY
            this._curSelectedKnightSpine.node.setPosition(new cc.Vec2(spinePosX, spinePosY))
            this._checkMoveHit(localMovePos);
        }

    }
    private _onTouchStart(touch: cc.Touch): boolean {

        console.log("kkkkkkk-----", touch.getStartLocation());
        var index = this._checkIsSelectedKnight(touch);
        if (index) {
            this._isTouch = true;
            this._originalPos = index;
            var spine = this._embattlePos2Data[index].spine;
            var touchBeginPos = this._panelKnightBg.convertToNodeSpaceAR(touch.getStartLocation());
            spine.node.setPosition(touchBeginPos);
            var selectedKnightPos = new cc.Vec2(spine.node.getPosition());
            this._distanceX = selectedKnightPos.x - touchBeginPos.x;
            this._distanceY = selectedKnightPos.y - touchBeginPos.y;
            this._onKnightSelected(spine);
            this._checkMoveHit(touchBeginPos);
            return true;
        }
        this._isTouch = false;
        return false;
    }
    private _touchCanceled(): void {
        if (this._isTouch) {
            this._onKnightUnselected();
        }
    }
    private _onKnightSelected(target) {
        this._curSelectedKnightSpine = target;
        (this._curSelectedKnightSpine.node as cc.Node).setScale(1.12);
        (this._curSelectedKnightSpine.node as cc.Node).opacity = (180);
        (this._curSelectedKnightSpine.node as cc.Node).zIndex = (100);
    }
    private _onKnightUnselected() {
        if (this._targetPos) {
            var targetData = this._embattlePos2Data[this._targetPos];
            var originalData = this._embattlePos2Data[this._originalPos];
            this._embattlePos2Data[this._targetPos] = originalData;
            this._embattlePos2Data[this._originalPos] = targetData;
            var embattleMapping = {};
            for (var i = 1; i <= 6; i++) {
                var data = this._embattlePos2Data[i];
                if (data) {
                    embattleMapping[i] = data.lineupPos;
                }
            }
            var result = [];
            for (var k in embattleMapping) {
                var lineupPos = embattleMapping[k];
                result[lineupPos - 1] = parseInt(k);
            }
            for (var i = 0; i <= 5; i++) {
                if (!result[i]) {
                    result[i] = 0;
                }
            }
            this._embattleCopy = result;
        }
        (this._curSelectedKnightSpine.node as cc.Node).setScale(1);
        (this._curSelectedKnightSpine.node as cc.Node).opacity = (255);
        this._updateKnights();
    }
    private _getEmbattlePosWithSpine(knight): number {
        for (var k in this._embattlePos2Data) {
            var data = this._embattlePos2Data[k];
            if (data.spine == knight) {
                return parseInt(k);
            }
        }
        return null;
    }
    private _checkIsSelectedKnight(touch: cc.Touch): number {
        var pos = touch.getStartLocation();
        for (let k in this._embattlePos2Data) {
            var data = this._embattlePos2Data[k];
            if (!data) {
                continue;
            }
            var location = data.spine.getClickPanel().convertToNodeSpaceAR(pos);
            var rect = data.spine.getClickPanel().getBoundingBox();
            if (rect.contains(location)) {
                return parseInt(k);
            }
        }
        return null;
    }

    private _checkMoveHit(location) {
        this._targetPos = null;
        for (var i = 1; i <= 6; i++) {
            var image = this['_imageKnightPos' + i] as cc.Sprite;
            var rectImage: cc.Rect = image.node.getBoundingBox();
            if (rectImage.contains(location)) {
                if (this._imageState[i] == IMAGE_STATE_NORMAL) {
                    this._imageState[i] = IMAGE_STATE_SELECTED;
                    image.addComponent(CommonUI).loadTexture(Path.getEmbattle(IMAGE_OVER_RES));
                }
                this._targetPos = i;
            } else {
                if (this._imageState[i] == IMAGE_STATE_SELECTED) {
                    this._imageState[i] = IMAGE_STATE_NORMAL;
                    image.addComponent(CommonUI).loadTexture(Path.getEmbattle(IMAGE_NORMAL_RES));
                }
            }
        }
    }
    private _checkIsChanged(): boolean {
        var embattle = G_UserData.getTeam().getEmbattle();
        for (var i = 0; i < 6; i++) {
            if (embattle[i] != this._embattleCopy[i]) {
                return true;
            }
        }
        return false;
    }

}