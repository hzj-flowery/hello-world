import { AudioConst } from "../../../const/AudioConst";
import { HorseRaceConst } from "../../../const/HorseRaceConst";
import { SignalConst } from "../../../const/SignalConst";
import { G_AudioManager, G_ResolutionManager, G_SignalManager } from "../../../init";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import HorseRaceAvatar from "./HorseRaceAvatar";
import { HorseRaceHelper } from "./HorseRaceHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HorseRaceMap extends cc.Component {

    @property({ type: cc.ScrollView, visible: true })
    _scrollView: cc.ScrollView = null;
    @property({ type: cc.Prefab, visible: true })
    _horseRaceAvatarPrefab: cc.Prefab = null;

    private _mapContent: cc.Node;
    private _mapWidth;
    private _bgWidth;
    private _index;
    private _blocks;
    private _blockMapWidth;
    private _startPosition: cc.Vec2;
    private _endPosition: cc.Vec2;
    private _distance;
    private _move;
    private _canPlayGold;
    private _playGoldTime;

    private _avatar: HorseRaceAvatar;

    private _listenerHorseGetPoint;
    private _listenerHorsePosX;

    private ZORDER_AVATAR = 1000

    init() {
        this._distance = 0;
        this._startPosition = cc.v2(0, 0);
        this._endPosition = cc.v2(0, 0);
        this._mapWidth = 0;
        this._bgWidth = 0;
        this._blockMapWidth = 0;
        this._canPlayGold = 0;
        this._playGoldTime = 0;
        G_AudioManager.preLoadSoundWithId(AudioConst.SOUND_HORSE_RACE_GOLD)

        var size = G_ResolutionManager.getDesignCCSize();
        this._scrollView.node.setContentSize(size);
        this._scrollView.enabled = (false);
        this._mapContent = this._scrollView.content;
        this._mapWidth = size.width;
    }

    public onEnable() {
        this._listenerHorseGetPoint = G_SignalManager.add(SignalConst.EVENT_HORSE_GET_POINT, handler(this, this._onEventHorseGetPoint));
        this._listenerHorsePosX = G_SignalManager.add(SignalConst.EVENT_HORSE_RACE_POSX, handler(this, this._onEventHorseMove));
    }

    public onDisable() {
        this._listenerHorseGetPoint.remove();
        this._listenerHorseGetPoint = null;
        this._listenerHorsePosX.remove();
        this._listenerHorsePosX = null;
        G_AudioManager.unLoadSoundWithId(AudioConst.SOUND_HORSE_RACE_GOLD);
    }

    public getMapWidth() {
        return this._scrollView.content.width;
    }

    private _createBG(mapWidth) {
        this._bgWidth = 0;
        while (this._bgWidth < mapWidth) {
            var spriteBG = new cc.Node("BG_" + this._bgWidth).addComponent(cc.Sprite);
            spriteBG.spriteFrame = cc.resources.get(Path.getHorseRaceImg('bg'), cc.SpriteFrame);
            spriteBG.node.setAnchorPoint(0, 0);
            spriteBG.node.x = (this._bgWidth);
            this._mapContent.addChild(spriteBG.node);
            this._bgWidth = this._bgWidth + spriteBG.node.getContentSize().width;
        }
    }

    private _createFarGround() {
        var bgBlocks = HorseRaceHelper.getBlockInfo(this._index, HorseRaceConst.CONFIG_TYPE_MAP_BG)[0];
        for (let i in bgBlocks) {
            var v = bgBlocks[i];
            this.createSpriteBlock(v);
        }
    }

    private _createBlocks(id) {
        [this._blocks, this._blockMapWidth] = HorseRaceHelper.getBlockInfo(id, HorseRaceConst.CONFIG_TYPE_MAP);
        for (let i in this._blocks) {
            var v = this._blocks[i];
            if (v.type == HorseRaceConst.BLOCK_TYPE_START) {
                this._startPosition.x = (v.blockX - 1) * HorseRaceConst.BLOCK_WIDTH + v.width / 2;
                this._startPosition.y = (v.blockY - 1) * HorseRaceConst.BLOCK_HEIGHT;
            }
            if (v.type == HorseRaceConst.BLOCK_TYPE_FINAL) {
                this._endPosition.x = (v.blockX - 1) * HorseRaceConst.BLOCK_WIDTH + v.width / 2;
                this._endPosition.y = (v.blockY - 1) * HorseRaceConst.BLOCK_HEIGHT;
            }
            if (v.resType == 'png') {
                this.createSpriteBlock(v);
            }
        }
        this._distance = this._endPosition.x - this._startPosition.x;
    }

    public getMapDistance() {
        return this._distance;
    }

    public createSpriteBlock(block) {
        var node = new cc.Node(block.res);
        var posX = (block.blockX - 1) * HorseRaceConst.BLOCK_WIDTH;
        var posY = (block.blockY - 1) * HorseRaceConst.BLOCK_HEIGHT;
        this._mapContent.addChild(node);
        node.setContentSize(block.width, block.height - 1);
        node.zIndex = (block.zOrder);
        block.mapPos = cc.v2(posX, posY);
        node.setPosition(block.mapPos);
        var pic = UIHelper.newSprite(Path.getHorseRaceImg(block.res));
        pic.sizeMode = cc.Sprite.SizeMode.RAW;
        pic.trim = false;
        pic.node.name = block.res;
        pic.node.setAnchorPoint(cc.v2(0, 0));
        pic.node.x = block.moveX;
        node.addChild(pic.node);
        block.mapRes = pic;
        return pic;
    }

    private _createAvatar() {
        this._avatar = cc.instantiate(this._horseRaceAvatarPrefab).getComponent(HorseRaceAvatar);
        this._avatar.node.name = "_avatar";
        this._avatar.init();
        this._mapContent.addChild(this._avatar.node);
        this._avatar.setStartPos(this._startPosition);
        this._avatar.node.zIndex = (this.ZORDER_AVATAR);
    }

    private _startMove() {
        if (!this._move) {
            this._move = true;
            var time = this._distance / 700;
            this._scrollView.scrollToPercentHorizontal(100, time, false);
        }
    }

    update(f) {
        this._avatar.updateAvatar(f, this._blocks);
        if (!this._canPlayGold) {
            if (this._playGoldTime > 0.5) {
                this._canPlayGold = true;
                this._playGoldTime = 0;
            }
            this._playGoldTime = this._playGoldTime + f;
        }
    }

    private _onEventHorseMove(eventName, horsePosX) {
        var posX = horsePosX - this._mapWidth / 4;
        if (posX < 0) {
            posX = 0;
        }
        if (posX > this._blockMapWidth - this._mapWidth) {
            posX = this._blockMapWidth - this._mapWidth;
        }
        this._mapContent.x = (-posX);
    }

    private _onEventHorseGetPoint(eventName, point, block) {
        if (block.resType == 'png') {
            if (this._canPlayGold) {
                G_AudioManager.playSoundWithId(AudioConst.SOUND_HORSE_RACE_GOLD);
                this._canPlayGold = false;
            }
            block.mapRes.setVisible(false);
        }
    }

    public resetMap(index) {
        this._mapContent.removeAllChildren();
        this._index = index;
        var size = G_ResolutionManager.getDesignCCSize();
        var mapWidth = HorseRaceHelper.getMapWidthBlock(this._index) * HorseRaceConst.BLOCK_WIDTH;
        this._scrollView.content.setContentSize(cc.size(mapWidth, size.height));
        this._createBG(mapWidth);
        this._createFarGround();
        this._createBlocks(this._index);
        this._createAvatar();
    }
}