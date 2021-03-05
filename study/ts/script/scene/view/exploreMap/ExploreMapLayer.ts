
import { AudioConst } from "../../../const/AudioConst";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { ExploreBaseData } from "../../../data/ExploreBaseData";
import EffectGfxNode from "../../../effect/EffectGfxNode";
import { G_AudioManager, G_ConfigLoader, G_EffectGfxMgr, G_ResolutionManager, G_UserData } from "../../../init";
import CommonHeroAvatar from "../../../ui/component/CommonHeroAvatar";
import BigImagesNode from "../../../utils/BigImagesNode";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import { Util } from "../../../utils/Util";
import { ExploreMapHelper } from "./ExploreMapHelper";

export class ExploreMapLayer extends cc.Component {

    //地图
    static ZORDER_BLOCK = 1     //方块
    static ZORDER_EVENT = 2     //事件
    static ZORDER_ACTOR = 3     //主角
    static SCALE_AVATAR = 0.85;

    private _scrollMap: cc.ScrollView;
    private _exploreBaseData: ExploreBaseData;
    private _mapBlockSize;
    private _mapBg: BigImagesNode;
    private _mapBlockData: any[];
    private _blocksParent: cc.Node;
    private _innerContainer: cc.Node;
    private _index: number;
    private _actor: CommonHeroAvatar;

    private _autoExploreEffectConNode: cc.Node;
    private _autoExploreEffect: EffectGfxNode;

    setUp(mapScroll: cc.ScrollView, exploreBaseData: ExploreBaseData) {
        this._scrollMap = mapScroll;
        this._exploreBaseData = exploreBaseData;

        this._mapBlockSize = 0;
        this._mapBlockData = [];
        this._innerContainer = this._scrollMap.content;

        var mapId = this._exploreBaseData.getMap_id();
        var mapInfo = G_ConfigLoader.getConfig(ConfigNameConst.EXPLORE_MAP).get(mapId);
        this._mapBlockSize = mapInfo.size;

        var mapBgNode: cc.Node = new cc.Node();
        this._mapBg = mapBgNode.addComponent(BigImagesNode);
        this._mapBg.setUp(Path.getStageBG(mapInfo.map_size));
        this._mapBg.node.setAnchorPoint(0, 0);
        this._innerContainer.addChild(this._mapBg.node);
        this._innerContainer.setContentSize(this._mapBg.node.getContentSize());
        this._blocksParent = new cc.Node();
        this._blocksParent.setAnchorPoint(0, 0);
        this.node.addChild(this._blocksParent);
        // this._createActor();
        // this._addSelfToScrollMap();
    }

    // data
    createMap(exploreBaseData, isFirstPass) {
        if (!exploreBaseData) return;
        this._exploreBaseData = exploreBaseData;
        this._initmapInfo();
        this._createMapBlockUI();
        this._addPassBoxToBlock(isFirstPass);

        if (!this._actor) this._createActor();
    }
    // 重置状态
    resetStatus() {
        this._stopActorAllAction();
        var index = this._exploreBaseData.getFoot_index();
        this._index = Math.min(this._mapBlockSize - 1, index);
        
        if(this._actor.node.parent){
            this._actor.node.parent.removeChild(this._actor.node);
        }
        this._blocksParent.addChild(this._actor.node, ExploreMapLayer.ZORDER_ACTOR);
        this.setFaceDirection(this._index);
        this.setActorPositionByIndex(this._index);
        this._innerContainer.stopAllActions();
        this.jumpMap();
    }
    //初始话创建地图数据
    _initmapInfo() {
        var mapEvents = this._exploreBaseData.getEvents();
        var mapId = this._exploreBaseData.getMap_id();
        var mapInfo = G_ConfigLoader.getConfig(ConfigNameConst.EXPLORE_MAP).get(mapId);
      //assert((mapInfo != null, 'can not find map info mapID = ' + mapId);
        this._mapBlockData = [];
        var firstBlock = ExploreMapHelper.createFirstBlockData(mapInfo.x, mapInfo.y, mapEvents[0] || 0, mapInfo.start_road);
        this._mapBlockData.push(firstBlock);
        var exploreId = this._exploreBaseData.getId();
        var directionsInfo: string[] = mapInfo.map.split('|');
        for (var i = 0, n = directionsInfo.length - 1; i < n; i++) {
            var lastBlock = this._mapBlockData[this._mapBlockData.length - 1];
            var eventType = mapEvents[i + 1] || 0;
            var block = ExploreMapHelper.generateBlockData(lastBlock, directionsInfo[i], eventType, exploreId, mapInfo.road);
            this._mapBlockData.push(block);
        }
        var endBlock = ExploreMapHelper.createEndBlockData(this._mapBlockData[this._mapBlockData.length - 1], directionsInfo[directionsInfo.length - 1], mapEvents[mapEvents.length - 1] || 0, mapInfo.end_road);
        this._mapBlockData.push(endBlock);
    }

    private createBlockSprite(blockData): cc.Sprite {
        var blockSprite: cc.Sprite =  UIHelper.newSprite(blockData.blockImagePath); //this.createSprite(blockData.blockImagePath);
        blockSprite.node.setPosition(blockData.posX, blockData.posY);
        blockSprite.node.zIndex = ExploreMapLayer.ZORDER_BLOCK;
        blockData.blockImagePath = null;
        return blockSprite;
    }

    private createEventIcon(blockData): cc.Node {
        var parentNode: cc.Node = new cc.Node();
        parentNode.zIndex = ExploreMapLayer.ZORDER_EVENT;
        var eventIconInfo = blockData.eventIconInfo;
        var eventIcon: cc.Sprite = this.createSprite(eventIconInfo.eventIconPath);
        parentNode.addChild(eventIcon.node);
        eventIcon.node.setScale(0.9);
        eventIcon.node.setPosition(blockData.posX, blockData.posY + 30);
        var eventName: cc.Sprite = this.createSprite(eventIconInfo.eventNamePath);
        parentNode.addChild(eventName.node);
        eventName.node.setScale(0.9);
        eventName.node.setPosition(blockData.posX, blockData.posY);
        blockData.eventIconInfo = null;
        return parentNode;
    }

    private createTreasureIcon(blockData): cc.Node {
        var parentNode: cc.Node = new cc.Node();
        parentNode.zIndex = ExploreMapLayer.ZORDER_EVENT;
        var treasureIconInfo: any = blockData.treasureIconInfo;
        var treasureIcon: cc.Sprite = this.createSprite(treasureIconInfo.treasureIconPath);
        parentNode.addChild(treasureIcon.node);
        treasureIcon.node.setScale(0.5);
        treasureIcon.node.setPosition(blockData.posX, blockData.posY + 30);
        var nameLabel: cc.Node = UIHelper.createLabel({
            text: treasureIconInfo.name,
            fontSize: 21,
            color: treasureIconInfo.color,
            outlineColor: treasureIconInfo.color_outline,
            position: cc.v2(blockData.posX, blockData.posY - 5)
        });
        parentNode.addChild(nameLabel);
        blockData.treasureIconInfo = null;
        return parentNode;
    }

    // 创建地图UI
    _createMapBlockUI() {
        this._blocksParent.removeAllChildren();
        for (var key in this._mapBlockData) {
            var v = this._mapBlockData[key];
            var blockSprite = this.createBlockSprite(v);
            this._blocksParent.addChild(blockSprite.node);
            v.blockSprite = blockSprite;
            if (!this._checkEventPassed(v.index)) {
                if (v.eventIconInfo) {
                    var eventNode = this.createEventIcon(v);
                    this._blocksParent.addChild(eventNode);
                    v.icon = eventNode;
                } else if (v.treasureIconInfo) {
                    var treasureNode = this.createTreasureIcon(v);
                    this._blocksParent.addChild(treasureNode);
                    v.icon = treasureNode;
                }
            }
        }
    }
    _checkEventPassed(index) {
        var rollList = this._exploreBaseData.getRoll_nums();
        var rollIndex = 0;
        for (var i in rollList) {
            var v = rollList[i];
            rollIndex = rollIndex + v;
            if (rollIndex == index - 1) {
                return true;
            }
        }
        return false;
    }
    //创建通关宝箱
    _addPassBoxToBlock(isFirstPass) {
        var endBlock = this._mapBlockData[this._mapBlockData.length - 1];
        var passboxNode: cc.Node = new cc.Node();
        this._blocksParent.addChild(passboxNode);
        passboxNode.zIndex = ExploreMapLayer.ZORDER_EVENT;
        var endBoxIcon: cc.Sprite = this.createSprite(Path.getExploreDiscover('img_baoxiang01'));
        passboxNode.addChild(endBoxIcon.node);
        endBoxIcon.node.setPosition(endBlock.posX, endBlock.posY + 25);
        endBoxIcon.node.setScale(0.4);
        var endBoxIconTitle: cc.Sprite;
        if (isFirstPass) {
            endBoxIconTitle = this.createSprite(Path.getExploreTextImage('txt_stbx'));
        } else {
            endBoxIconTitle = this.createSprite(Path.getExploreTextImage('txt_tgbx'));
        }
        endBoxIconTitle.node.setPosition(endBlock.posX, endBlock.posY - 10);
        passboxNode.addChild(endBoxIconTitle.node);
        endBlock.icon = passboxNode;
    }
    //隐藏通关宝箱
    hidePassBox() {
        var block = this._mapBlockData[this._mapBlockData.length - 1];
        if (block.icon) {
            block.icon.active = false;
        }
    }
    //隐藏当前位置 事件图标
    hideCurPosIcon() {
        var block = this._mapBlockData[this._index];
        if (block && block.icon) {
            block.icon.active = false;
        }
    }
    //======================================
    //           Map滚动层相关函数
    //======================================
    // _addSelfToScrollMap() {
    //     if (CONFIG_EXPLORE_FREE_MOVE) {
    //         this._scrollMap.addEventListener(handler(this, this._moveLayerTouch));
    //     } else {
    //         this._scrollMap.setTouchEnabled(false);
    //     }
    //     this._scrollMap.node.on(cc.Node.EventType.TOUCH_START, handler(this, this._moveLayerTouch));
    //     this._scrollMap.horizontal = this._scrollMap.vertical = false;
    // }
    // // 地图触摸
    // _moveLayerTouch() {
    //     var x = this._innerContainer.getPosition().y;
    //     this._innerContainer.setPosition(this._getInnerPosition(this._innerContainer.getPosition()));
    // }
    //判断是不是在界面内
    _getInnerPosition(position) {
        var size = this._mapBg.node.getContentSize();
        var pos = cc.v2(position.x, position.y);
        var width = G_ResolutionManager.getDesignWidth();
        var height = G_ResolutionManager.getDesignHeight();
        if (pos.x > 0) {
            pos.x = 0;
        }
        if (pos.x < width - size.width) {
            pos.x = width - size.width;
        }
        if (pos.y > 0) {
            pos.y = 0;
        }
        if (pos.y < height - size.height) {
            pos.y = height - size.height;
        }
        return pos;
    }
    //移动地图
    jumpMap() {
        var curPos: cc.Vec2 = this.getPositionByIndex();
        var width = G_ResolutionManager.getDesignWidth();
        var x = width * 0.5 - curPos.x;
        var height = G_ResolutionManager.getDesignHeight();
        var y = height * 0.5 - curPos.y;
        var pos = this._getInnerPosition(cc.v2(x, y));
        this._innerContainer.setPosition(pos);
    }
    //获得人物获得地图坐标
    _getMapPosition(posX, posY): cc.Vec2 {
        var width = G_ResolutionManager.getDesignWidth();
        var x = width * 0.5 - posX;
        var height = G_ResolutionManager.getDesignHeight();
        var y = height * 0.5 - posY;
        return this._getInnerPosition(cc.v2(x, y));
    }
    //创建跑图角色
    _createActor() {
        this._actor = Util.getNode('prefab/common/CommonHeroAvatar', CommonHeroAvatar);
        this._actor.init();
        this.scheduleOnce(this.onDelay.bind(this), 0);

        this._autoExploreEffectConNode = new cc.Node();
        this._actor.node.addChild(this._autoExploreEffectConNode);
        this._autoExploreEffect = G_EffectGfxMgr.createPlayGfx(this._autoExploreEffectConNode, 'effect_zidongyouli_zi', null, false, cc.v2(0, 185));
        this._autoExploreEffectConNode.active = false;
    }

    private onDelay(): void {
        if (!this._actor) return;

        // var avatarInfo = this._actor.updateAvatar(G_UserData.getBase().getPlayerShowInfo();
        var avatarInfo = G_UserData.getBase().getPlayerShowInfo();
        this._actor.updateAvatar(avatarInfo, null, false, null);
        this._actor.setScale(ExploreMapLayer.SCALE_AVATAR);
    }

    //停止actor 动作
    _stopActorAllAction() {
        this._actor.node.stopAllActions();
    }
    //设置脸朝向
    setFaceDirection(index) {
        var block = this._mapBlockData[index];
        var nextBlock = this._mapBlockData[index + 1];
        if (block && nextBlock) {
            if (nextBlock.posX < block.posX) {
                this._setActorScaleX(-1);
            } else {
                this._setActorScaleX(1);
            }
        }
    }
    _setActorScaleX(scale) {
        this._actor.node.scaleX = scale;
        // this._autoExploreEffect.node.scaleX = scale;
        this._autoExploreEffectConNode.scaleX = scale;
    }
    // 设置角色位置
    setActorPositionByIndex(index) {
        var block = this._mapBlockData[index];
        this._actor.node.setPosition(block.posX, block.posY);
        console.log('setActorPositionByIndex >>>>> ', index, block.posX, block.posY);
        this._actor.setAction('idle', true);
    }
    // 自动游历特效字
    setActorAutoExploreWord(trueOrFalse) {
        console.log('change auto explore effecrt: ', trueOrFalse);
        this._autoExploreEffectConNode.active = trueOrFalse;
    }
    // 获取当前位置
    getPositionByIndex(index = -1): cc.Vec2 {
        if (index < 0) index = this._index;
        var block = this._mapBlockData[index];
        return cc.v2(block.posX, block.posY);
    }
    //获取角色 世界坐标
    // getWorldPositionByIndex(index = null) {
    //     if (!index) {
    //         index = this._index;
    //     }
    //     var block = this._mapBlockData[index];
    //     var pos = cc.v2(block.posX, block.posY);
    //     return this._innerContainer.convertToWorldSpaceAR(pos);
    // }
    // 是否跑到终点了
    isActorRunEnd() {
        return this._index >= (this._mapBlockSize - 1);
    }
    getRunEndDis(): number {
        return this._mapBlockSize - this._index - 1;
    }
    // 获取当前的百分比
    getPercent() {
        if (this._index <= 0) return 0;
        var percent = Math.floor((this._index + 1) / this._mapBlockSize * 100);
        return percent;
    }
    // 获取当前运动索引
    getCurIndex() {
        return this._index;
    }
    //获取当前 事件类型
    getCurPosEventType() {
        var block = this._mapBlockData[this._index];
        return block.type;
    }
    // 判断当前位置 是否有宝物
    isCurPosTreasure() {
        var block = this._mapBlockData[this._index];
        return block.isTreasure;
    }

    debugGetPosEventType(rollNum: number) {
        var block = this._mapBlockData[this._index + rollNum];
        if (!block) return 0;
        return block.type;
    }

    private turnBackArr: number[] = [];
    //前进格子
    moveForward(n, callback) {
        if (this._index + n >= this._mapBlockSize) {
            n = this._mapBlockSize - this._index - 1;
        }
        var actions = [];
        var mapActions = [];
        this.turnBackArr.splice(0, this.turnBackArr.length);
        for (var i = 0; i < n; i++) {
            var nowBlock = this._mapBlockData[this._index];
            var block = this._mapBlockData[this._index + 1];
            var turnBack: number = block.posX < nowBlock.posX ? -1 : 1;
            this.turnBackArr.push(turnBack);
            var scaleCallFunc = cc.callFunc(() => {
                if (this.turnBackArr.length > 0) {
                    var turnNum: number = this.turnBackArr.shift();
                    this._setActorScaleX(turnNum);
                }
            });
            var soundCallFunc = cc.callFunc(() => {
                G_AudioManager.playSoundWithId(AudioConst.SOUND_EXPLORE_WALK, null);
            });
            var actorAction = cc.spawn(cc.moveTo(0.2, block.posX, block.posY), scaleCallFunc, soundCallFunc);
            actions.push(actorAction);
            var mapAction = cc.moveTo(0.2, this._getMapPosition(block.posX, block.posY));
            mapActions.push(mapAction);
            this._index = this._index + 1;
        }
        var actionEnd = cc.callFunc(() => {
            this._actor.setAniTimeScale(1);
            this._actor.setAction('idle', true);
            if (callback) {
                callback();
            }
        });
        var actionInterval: cc.ActionInterval = cc.sequence(actions[0], actions[1], actions[2], actions[3], actions[4], actions[5], actionEnd);
        this._actor.setAniTimeScale(2);
        this._actor.setAction('run', true);
        this._actor.node.runAction(actionInterval);
        var mapAction = cc.sequence(mapActions[0], mapActions[1], mapActions[2], mapActions[3], mapActions[4], mapActions[5]);
        this._innerContainer.runAction(mapAction);
    }

    private createSprite(texturePath: string): cc.Sprite {
        // var node: cc.Node = new cc.Node();
        // var sp: cc.Sprite = node.addComponent(cc.Sprite);
        // var spFrame: cc.SpriteFrame = cc.resources.get(texturePath);
        // if (!spFrame) {
        //     console.log('未加载图片: ', texturePath);
        // }
        // sp.spriteFrame = spFrame;
        return UIHelper.newSprite(texturePath);
    }

}