import { handler } from "../../../utils/handler";
import UIHelper from "../../../utils/UIHelper";
import { G_UserData, G_EffectGfxMgr, G_Prompt, G_SceneManager } from "../../../init";
import { SeasonSportConst } from "../../../const/SeasonSportConst";
import { SeasonSportHelper } from "../seasonSport/SeasonSportHelper";
import SquadAvatar from "./SquadAvatar";
import { Path } from "../../../utils/Path";
import UIActionHelper from "../../../utils/UIActionHelper";
import { Lang } from "../../../lang/Lang";
import PopupHeroView from "./PopupHeroView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class OwnHeroPickNode extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _resourceNode: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _heroPedespal4: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageAdd4: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _nodeEffect4: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _heroPedespal5: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageAdd5: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _nodeEffect5: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _heroPedespal6: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageAdd6: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _nodeEffect6: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _heroPedespal1: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageAdd1: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _nodeEffect1: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _heroPedespal2: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageAdd2: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _nodeEffect2: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _heroPedespal3: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageAdd3: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _nodeEffect3: cc.Node = null;
    @property({ type: cc.Prefab, visible: true })
    _squadAvatarPrefab: cc.Prefab = null;

    private _heroCallback;
    private _moveOutCallback;
    private _curSlot: number;
    private _squadAvatarData: { isLock: boolean, heroId: number, state: number, avatar: SquadAvatar, isExchange: boolean }[];
    private _isTouch;
    private _originalPos;
    private _targetPos;
    private _curTouchAvatar: SquadAvatar;
    private _curHeroViewTabIndex;
    private _curUpdateAvatarHeroId;
    private _curUpdateAvatarIndex;
    private _curRound;
    private _synchronizeDataCallBack;
    private _ownSign;
    private _distanceX;
    private _distanceY;

    public init(heroCallback, moveOutCallback) {
        this._heroCallback = heroCallback;
        this._moveOutCallback = moveOutCallback;
        this._curSlot = 0;
        this._squadAvatarData = [];
        this._isTouch = false;
        this._originalPos = 0;
        this._targetPos = null;
        this._curTouchAvatar = null;
        this._curHeroViewTabIndex = 1;
        this._curUpdateAvatarHeroId = 0;
        this._curUpdateAvatarIndex = 1;
        this._curRound = 0;

        this._initInfo();
    }

    public onLoad() {
        this._resourceNode.on(cc.Node.EventType.TOUCH_START, handler(this, this._onTouchStart));
        this._resourceNode.on(cc.Node.EventType.TOUCH_MOVE, handler(this, this._onTouchMove));
        this._resourceNode.on(cc.Node.EventType.TOUCH_END, handler(this, this._onTouchEnd));
        this._resourceNode.on(cc.Node.EventType.TOUCH_CANCEL, handler(this, this._onTouchEnd));
        UIHelper.setSwallowTouches(this._resourceNode, false);
    }

    public onEnable() {
        this._ownSign = G_UserData.getSeasonSport().getPrior();
    }

    private _hideAdd() {
        for (let index = 1; index <= SeasonSportConst.HERO_SQUAD_USEABLECOUNT; index++) {
            this['_imageAdd' + index].node.active = false;
        }
    }

    public switchAddVisible(bHide) {
        if (bHide) {
            this._hideAdd();
        } else {
            this._updateAvatar();
        }
    }

    public synchronizeData(callback) {
        this._synchronizeDataCallBack = callback;
    }

    public synchronizeUI(data: any[], typeDatas: any[]) {
        if (!data) {
            return;
        }
        for (let i = 0; i < data.length; i++) {
            var value = data[i];
            if (value > 0) {
                this._squadAvatarData[i].isLock = true;
                this._squadAvatarData[i].heroId = value;
                this._squadAvatarData[i].state = typeDatas[i];
                this._squadAvatarData[i].isExchange = false;
                if (typeDatas[i] != 0) {
                    var transCardId = SeasonSportHelper.getTransformCardId(value);
                    if (transCardId != null) {
                        this._squadAvatarData[i].heroId = transCardId;
                        value = SeasonSportHelper.getTransformCardsHeroId(transCardId);
                    }
                }
                let avatar = this._resourceNode.getChildByName('avatar' + (i + 1)).getComponent(SquadAvatar);
                if (avatar == null) {
                    avatar = this._createReconnectHeroAvatar(value, i + 1);
                    avatar.node.name = ('avatar' + (i + 1));
                    avatar.setTag(value);
                    this._resourceNode.addChild(avatar.node, (i + 1) * 10);
                    this._squadAvatarData[i].avatar = avatar;
                } else {
                    if (avatar.getTag() != null && avatar.getTag() != value) {
                        var limitLevel = SeasonSportHelper.getORedHeroLimitLevelById(value);
                        avatar.updateUI(value, limitLevel);
                        avatar.setTag(value);
                        this._squadAvatarData[i].avatar = avatar;
                    }
                }
            } else if (value == 0) {
                let avatar = this._resourceNode.getChildByName('avatar' + (i + 1));
                if (avatar != null) {
                    this._resourceNode.getChildByName('avatar' + (i + 1)).removeFromParent();
                    this._squadAvatarData[i] = {
                        isLock: false,
                        heroId: 0,
                        state: 0,
                        avatar: null,
                        isExchange: false,
                    };
                }
            }
        }
        if (this._synchronizeDataCallBack) {
            this._synchronizeDataCallBack(this._squadAvatarData);
        }
    }

    private _playWujiangPickAnimation(rootNode) {
        let eventFunction = (event) => {
            if (event == 'finish') {
            } else if (event == 'hero') {
                let avatar: SquadAvatar = null;
                if (this._resourceNode.getChildByName('avatar' + this._curUpdateAvatarIndex) != null) {
                    avatar = this._resourceNode.getChildByName('avatar' + this._curUpdateAvatarIndex).getComponent(SquadAvatar);
                }
                this['_imageAdd' + this._curUpdateAvatarIndex].node.active = false;
                var limitLevel = SeasonSportHelper.getORedHeroLimitLevelById(this._curUpdateAvatarHeroId);
                if (avatar != null) {
                    avatar.updateUI(this._curUpdateAvatarHeroId, limitLevel);
                    this._squadAvatarData[this._curUpdateAvatarIndex - 1].avatar = avatar;
                } else {
                    avatar = this._createHeroAvatar(this._curUpdateAvatarHeroId, this._curUpdateAvatarIndex);
                    avatar.node.name = ('avatar' + this._curUpdateAvatarIndex);
                    avatar.setTag(this._curUpdateAvatarHeroId);
                    this._resourceNode.addChild(avatar.node, this._curUpdateAvatarIndex * 10);
                    this._squadAvatarData[this._curUpdateAvatarIndex - 1].avatar = avatar;
                }
            }
        }
        G_EffectGfxMgr.createPlayMovingGfx(rootNode, 'moving_wuchabiebuzhen_wujiang', null, eventFunction.bind(this), false);
    }

    private _initInfo() {
        for (let index = 1; index <= SeasonSportConst.HERO_SQUAD_USEABLECOUNT; index++) {
            UIHelper.loadTexture(this['_heroPedespal' + index], Path.getSeasonDan(SeasonSportConst.SEASON_SILKBACK[0]));
            UIActionHelper.playBlinkEffect(this['_imageAdd' + index].node);
            let imageAdd: cc.Sprite = this['_imageAdd' + index];
            imageAdd.node.active = true;
            // imageAdd.setTag(index);
            // imageAdd.setSwallowTouches(false);
            // imageAdd.setTouchEnabled(true);
            // imageAdd.addClickEventListenerEx(handler(this, this._onClickAdd));
            UIHelper.addEventListenerToNode(this.node, imageAdd.node, "OwnHeroPickNode", "_onClickAdd");
            if (!this._squadAvatarData[index - 1]) {
                this._squadAvatarData[index - 1] = {
                    isLock: false,
                    heroId: 0,
                    state: 0,
                    avatar: null,
                    isExchange: false,
                };
            }
            this._squadAvatarData[index - 1].isLock = false;
            this._squadAvatarData[index - 1].heroId = 0;
            this._squadAvatarData[index - 1].state = 0;
            this._squadAvatarData[index - 1].avatar = null;
            this._squadAvatarData[index - 1].isExchange = false;
        }
    }

    private _curStageSelectedPickCount() {
        var selectCount = 0;
        for (let index = 1; index <= SeasonSportConst.HERO_SQUAD_USEABLECOUNT; index++) {
            if ((this._squadAvatarData[index - 1].heroId) > 0 && this._squadAvatarData[index - 1].isLock == false) {
                selectCount = selectCount + 1;
            }
        }
        return selectCount;
    }

    public _onClickAdd(sender: cc.Event) {
        var ownSign = G_UserData.getSeasonSport().getPrior();
        var curRound = G_UserData.getSeasonSport().getCurrentRound();
        var stageInfo = SeasonSportHelper.getSquadStageInfo(curRound);
        if (ownSign != parseInt(stageInfo.first)) {
            G_Prompt.showTip(Lang.get('season_squad_otherround'));
            return;
        }
        if (this._curStageSelectedPickCount() >= parseInt(stageInfo.number) && this._curStageSelectedPickCount() != 0) {
            G_Prompt.showTip(Lang.get('season_squad_selectcountenough'));
            return;
        }
        this._curSlot = parseInt((sender.target.name as string).replace("_imageAdd", ""));
        G_SceneManager.openPopup(Path.getPrefab("PopupHeroView", "seasonCompetitive"), (popupHeroView: PopupHeroView) => {
            popupHeroView.init(false, this._curHeroViewTabIndex, handler(this, this._onSelectTab), handler(this, this._onPick));
            popupHeroView.setCurOwnHeroData(this._squadAvatarData);
            popupHeroView.openWithAction();
        });
    }

    private _onSelectTab(index) {
        this._curHeroViewTabIndex = index;
    }

    private _onPick(tabIndex, heroId) {
        this.updateUI(heroId, this._curSlot);
    }

    public updateUI(heroId, index) {
        this._squadAvatarData[index - 1].isLock = false;
        this._squadAvatarData[index - 1].heroId = heroId;
        this._squadAvatarData[index - 1].state = 0;
        this._squadAvatarData[index - 1].isExchange = false;
        if (SeasonSportHelper.isHero(heroId) == false) {
            heroId = SeasonSportHelper.getTransformCardsHeroId(heroId);
            this._squadAvatarData[index - 1].state = 1;
        }
        this._curUpdateAvatarHeroId = heroId;
        this._curUpdateAvatarIndex = index;
        this['_nodeEffect' + index].removeAllChildren();
        this._playWujiangPickAnimation(this['_nodeEffect' + index]);
        if (this._heroCallback) {
            this._heroCallback(false, this._squadAvatarData, false);
        }
        this._updateAvatar();
    }

    public getCurSlot() {
        return this._curSlot;
    }

    private _createReconnectHeroAvatar(heroId, index): SquadAvatar {
        var avatar = cc.instantiate(this._squadAvatarPrefab).getComponent(SquadAvatar);
        var posX = this['_heroPedespal' + index].node.x;
        var posY = this['_heroPedespal' + index].node.y;
        avatar.node.x = posX;
        avatar.node.y = posY;
        var limitLevel = SeasonSportHelper.getORedHeroLimitLevelById(heroId);
        avatar.updateUI(heroId, limitLevel);
        avatar.setScale(0.65);
        return avatar;
    }

    private _createHeroAvatar(heroId, index) {
        var avatar = cc.instantiate(this._squadAvatarPrefab).getComponent(SquadAvatar);
        var posX = this['_heroPedespal' + index].node.x;
        var posY = this['_heroPedespal' + index].node.y;
        avatar.node.x = posX;
        avatar.node.y = posY;
        var limitLevel = SeasonSportHelper.getORedHeroLimitLevelById(this._curUpdateAvatarHeroId);
        avatar.updateUI(heroId, limitLevel);
        avatar.setScale(0.65);
        return avatar;
    }

    private _onTouchStart(sender: cc.Event.EventTouch) {
        var index = this._checkInCurSlot(sender);
        if (index != null) {
            this._isTouch = true;
            this._originalPos = index;
            this._curRound = G_UserData.getSeasonSport().getCurrentRound();
            var avatar: SquadAvatar = this._squadAvatarData[index - 1].avatar;
            var touchBeginPos = this._resourceNode.convertToNodeSpaceAR(sender.getStartLocation())
            avatar.node.setPosition(touchBeginPos);
            var selectedAvatarPosX = avatar.node.x;
            var selectedAvatarPosY = avatar.node.y;
            this._distanceX = selectedAvatarPosX - touchBeginPos.x;
            this._distanceY = selectedAvatarPosY - touchBeginPos.y;
            this._onAvatarTouchMove(avatar);
            this._onCheckOccupiedSlotHighlight(cc.v2(touchBeginPos.x, touchBeginPos.y));
            return true;
        }
        this._isTouch = false;
        return false;
    }

    private _onTouchMove(sender: cc.Event.EventTouch) {
        if (this._isTouch) {
            var movePos = sender.getLocation();
            var localMovePos = this._resourceNode.convertToNodeSpaceAR(movePos);
            var avatarPosX = localMovePos.x + this._distanceX;
            var avatarPosY = localMovePos.y + this._distanceY;
            this._curTouchAvatar.node.x = avatarPosX;
            this._curTouchAvatar.node.y = avatarPosY;
            this._onCheckOccupiedSlotHighlight(cc.v2(localMovePos.x, localMovePos.y));
        }
    }

    private _onTouchEnd(sender: cc.Event.EventTouch) {
        if (this._isTouch) {
            this._onAvatarTouchMoveEnd();
        }
    }

    private _checkInCurSlot(sender: cc.Event.EventTouch) {
        for (let index = 1; index <= SeasonSportConst.HERO_SQUAD_USEABLECOUNT; index++) {
            if (this._squadAvatarData[index - 1].isLock == false && (this._squadAvatarData[index - 1].heroId) > 0) {
                if (this._squadAvatarData[index - 1].avatar != null) {
                    var pos = sender.getStartLocation();
                    if (this._squadAvatarData[index - 1].avatar.getSpine().getSpineHero() != null) {
                        var location = this._squadAvatarData[index - 1].avatar.getSpine().getSpineHero().convertToNodeSpaceAR(pos);
                        var rect = this._squadAvatarData[index - 1].avatar.getSpine().getSpineHero().getBoundingBox();
                        if (rect.contains(cc.v2(location.x, location.y))) {
                            return index;
                        }
                    }
                }
            }
        }
        return null;
    }

    private _onAvatarTouchMove(target: SquadAvatar) {
        this._curTouchAvatar = target;
        this._curTouchAvatar.setScale(0.65);
        this._curTouchAvatar.setOpacity(180);
        this._curTouchAvatar.node.zIndex = (100);
    }

    private _onCheckOccupiedSlotHighlight(location: cc.Vec2) {
        this._targetPos = null;
        var rectLayout = this._resourceNode.getBoundingBox();
        if (rectLayout.contains(location)) {
            if (this._moveOutCallback) {
                this._moveOutCallback(true);
            }
            for (let index = 1; index <= SeasonSportConst.HERO_SQUAD_USEABLECOUNT; index++) {
                var image: cc.Sprite = this['_heroPedespal' + index];
                var addImg: cc.Sprite = this['_imageAdd' + index];
                var rectImage = image.node.getBoundingBox();
                if (this._squadAvatarData[index - 1].isLock == null || this._squadAvatarData[index - 1].isLock == false) {
                    UIHelper.loadTexture(image, Path.getSeasonDan(SeasonSportConst.SEASON_SILKBACK[1]));
                    // image.ignoreContentAdaptWithSize(true);
                    addImg.node.active = false;
                } else {
                    UIHelper.loadTexture(image, Path.getSeasonDan(SeasonSportConst.SEASON_SILKBACK[0]));
                    // image.ignoreContentAdaptWithSize(true);
                    addImg.node.active = false;
                }
                if (rectImage.contains(location) && this._squadAvatarData[index - 1].isLock != true) {
                    this._targetPos = index;
                }
            }
        } else {
            if (this._moveOutCallback) {
                this._moveOutCallback(true);
            }
            for (let index = 1; index <= SeasonSportConst.HERO_SQUAD_USEABLECOUNT; index++) {
                var image: cc.Sprite = this['_heroPedespal' + index];
                UIHelper.loadTexture(image, Path.getSeasonDan(SeasonSportConst.SEASON_SILKBACK[0]));
                // image.ignoreContentAdaptWithSize(true);
            }
            this._targetPos = SeasonSportConst.AVATAR_MOVETARGETPOS_OUT;
        }
    }

    private _onAvatarTouchMoveEnd() {
        if (this._curRound != G_UserData.getSeasonSport().getCurrentRound()) {
            this._targetPos = null;
        }
        if (this._targetPos == SeasonSportConst.AVATAR_MOVETARGETPOS_OUT) {
            this._resourceNode.getChildByName('avatar' + this._originalPos).removeFromParent();
            // this._squadAvatarData[this._originalPos] = {};
            this._squadAvatarData[this._originalPos - 1].isLock = false;
            this._squadAvatarData[this._originalPos - 1].heroId = 0;
            this._squadAvatarData[this._originalPos - 1].state = 0;
            this._squadAvatarData[this._originalPos - 1].avatar = null;
            this._squadAvatarData[this._originalPos - 1].isExchange = false;
            this._resetCurSlot();
        } else if (this._targetPos == null) {
            this._curSlot = this._originalPos;
            this._curTouchAvatar.setScale(0.7);
            this._curTouchAvatar.setOpacity(255);
        } else {
            this._onMovedAvatarInRightScop();
        }
        if (this._moveOutCallback) {
            this._moveOutCallback(false);
        }
        this._updateAvatar();
    }

    private _onMovedAvatarInRightScop() {
        if (this._targetPos <= SeasonSportConst.HERO_SQUAD_USEABLECOUNT) {
            var targetData = this._squadAvatarData[this._targetPos - 1];
            var originalData = this._squadAvatarData[this._originalPos - 1];
            this._squadAvatarData[this._targetPos - 1] = originalData;
            this._squadAvatarData[this._originalPos - 1] = targetData;
            this._squadAvatarData[this._targetPos - 1].isExchange = true;
            this._squadAvatarData[this._originalPos - 1].isExchange = true;
            if (this._squadAvatarData[this._targetPos - 1] && this._squadAvatarData[this._targetPos - 1].avatar) {
                this._squadAvatarData[this._targetPos - 1].avatar.node.name = ('avatar' + this._targetPos);
                this._squadAvatarData[this._targetPos - 1].avatar.setTag(this._squadAvatarData[this._targetPos - 1].heroId);
            }
            if (this._squadAvatarData[this._originalPos - 1] && this._squadAvatarData[this._originalPos - 1].avatar) {
                this._squadAvatarData[this._originalPos - 1].avatar.node.name = ('avatar' + this._originalPos);
                this._squadAvatarData[this._originalPos - 1].avatar.setTag(this._squadAvatarData[this._originalPos - 1].heroId);
            }
            this._curSlot = this._targetPos;
            this._curTouchAvatar.setScale(0.65);
            this._curTouchAvatar.setOpacity(255);
            for (let index = 1; index <= SeasonSportConst.HERO_SQUAD_USEABLECOUNT; index++) {
                if (index != this._targetPos && index != this._originalPos) {
                    this._squadAvatarData[index - 1].isExchange = false;
                }
            }
            if (this._heroCallback) {
                this._heroCallback(false, this._squadAvatarData, true);
            }
        }
    }

    private _resetCurSlot() {
        for (let index = 1; index <= SeasonSportConst.HERO_SQUAD_USEABLECOUNT; index++) {
            if ((this._squadAvatarData[index - 1].heroId) <= 0) {
                this._curSlot = index;
                break;
            }
        }
        if (this._heroCallback) {
            this._heroCallback(false, this._squadAvatarData, false);
        }
    }

    private _updateAvatar() {
        var ownSign = G_UserData.getSeasonSport().getPrior();
        var curRound = G_UserData.getSeasonSport().getCurrentRound();
        var stageInfo = SeasonSportHelper.getSquadStageInfo(curRound);
        for (let index = 1; index <= SeasonSportConst.HERO_SQUAD_USEABLECOUNT; index++) {
            var data = this._squadAvatarData[index - 1];
            let avatar: SquadAvatar = null;
            if (this._resourceNode.getChildByName('avatar' + index) != null) {
                avatar = this._resourceNode.getChildByName('avatar' + index).getComponent(SquadAvatar);
            }
            if (data) {
                var image: cc.Sprite = this['_heroPedespal' + index];
                UIHelper.loadTexture(image, Path.getSeasonDan(SeasonSportConst.SEASON_SILKBACK[1 - 1]));
                // image.ignoreContentAdaptWithSize(true);
                // console.log("_updateAvatar:", index, avatar.node.name, image.name);
                if (avatar != null) {
                    avatar.node.zIndex = (index * 10);
                    var posX = image.node.x;
                    var posY = image.node.y;
                    avatar.node.x = posX;
                    avatar.node.y = posY;
                }
            }
            if (ownSign == parseInt(stageInfo.first)) {
                let pickCount = this._curStageSelectedPickCount();
                if (data.avatar == null && pickCount < parseInt(stageInfo.number)) {
                    this['_imageAdd' + index].node.active = true;
                } else {
                    this['_imageAdd' + index].node.active = false;
                }
            } else {
                this['_imageAdd' + index].node.active = false;
            }
        }
    }
}