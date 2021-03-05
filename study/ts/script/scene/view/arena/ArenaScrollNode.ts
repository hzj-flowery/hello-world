import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { G_ConfigLoader, G_UserData } from "../../../init";
import { Path } from "../../../utils/Path";
import ViewBase from "../../ViewBase";
import ArenaHeroAvatar from "./ArenaHeroAvatar";
var MAX_HERO_SIZE = 11;
const { ccclass, property } = cc._decorator;

@ccclass
export default class ArenaScrollNode extends ViewBase {

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _scrollView: cc.ScrollView = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _heroNode10: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _heroNode9: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _heroNode8: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _heroNode7: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _heroNode6: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _heroNode5: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _heroNode4: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _heroNode3: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _heroNode2: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _heroNode1: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _heroNode11: cc.Node = null;

    private static enterCount: number = 0;
    private static enterInterval: number = 0.2;
    private _arenaHeroAvatar: any;
    private _showMap: Array<any> = [];
    onCreate() {
        this.node.name = ('ArenaScrollNode');
        this._arenaHeroAvatar = cc.resources.get(Path.getPrefab("ArenaHeroAvatar", "arena"));
        var events = new cc.Component.EventHandler();
        events.target = this.node;
        events.component = "ArenaScrollNode";
        events.handler = "onScrollListen";
        this._scrollView.scrollEvents = [];
        this._scrollView.scrollEvents.push(events);
        this._showMap.push({ "index": 1, "pos": new cc.Vec2(440, 1040) });
        this._showMap.push({ "index": 2, "pos": new cc.Vec2(440, 1340) });
        this._showMap.push({ "index": 3, "pos": new cc.Vec2(640, 1340) });
        this._showMap.push({ "index": 4, "pos": new cc.Vec2(990, 1910) });
        this._showMap.push({ "index": 5, "pos": new cc.Vec2(990, 1910) });
        this._showMap.push({ "index": 6, "pos": new cc.Vec2(1300, 2260) });
        this._showMap.push({ "index": 7, "pos": new cc.Vec2(1300, 2260) });
        this._showMap.push({ "index": 8, "pos": new cc.Vec2(1640, 3000) });
        this._showMap.push({ "index": 9, "pos": new cc.Vec2(1640, 3000) });
        this._showMap.push({ "index": 10, "pos": new cc.Vec2(1960, 3000) });
        this._showMap.push({ "index": 11, "pos": new cc.Vec2(1960, 3000) });

    }

    //最小值640 最大值2320
    private onScrollListen(): void {
        var y = this._scrollView.content.y;
        for (var i = 0; i < this._showMap.length; i++) {
            if (this._showMap[i].pos.x <= y && this._showMap[i].pos.y >= y) {
                this["_heroNode" + this._showMap[i]["index"]].active = true;
            }
            else {
                this["_heroNode" + this._showMap[i]["index"]].active = false;
            }
        }
    }
    getSelfNode() {
        for (var i = 1; i <= MAX_HERO_SIZE; i++) {
            var heroAvatar = this['_heroAvatar' + i];
            if (heroAvatar && heroAvatar.isSelf()) {
                return [
                    heroAvatar,
                    i
                ];
            }
        }
        //assert((false, 'can not find self node ');
        return null;
    }
    jumpToSelfNode(needAnimation) {
        if (needAnimation == null) {
            needAnimation = false;
        }
        var [selfNode, index] = this.getSelfNode();
        if (selfNode) {
            var parent = selfNode.node.getParent();
            var percent = Math.floor((index - 1) / MAX_HERO_SIZE * 100);
            if (percent > 1) {
                percent = percent + 20;
                percent = Math.min(percent, 100);
            }
            this._scrollView.scrollToPercentVertical(1 - percent / 100);
        }
    }
    _getSelfIndex() {

    }
    getHeroAvatar(index) {
        var heroAvatar = this['_heroAvatar' + index];
        return heroAvatar;
    }
    getSelfTopNode() {
        var [selfNode, index] = this.getSelfNode();
        if (selfNode && index) {
            var heroAvatar = this['_heroAvatar' + (index - 1)];
            if (heroAvatar) {
                return heroAvatar;
            }
        }
        return null;
    }
    getAvatarNodeById(userId): Array<any> {
        for (var i = 1; i <= MAX_HERO_SIZE; i++) {
            var heroAvatar = this['_heroAvatar' + i];
            if (heroAvatar && heroAvatar.getUserId() == userId) {
                return [
                    heroAvatar,
                    i
                ];
            }
        }
        return [null, null];
    }
    updateHeroList(playerList, callBack, needJump, needAnimation, endCallback) {
        this._scrollView.stopAutoScroll();

        for (var j = 0; j < playerList.length; j++) {
            if (playerList[j]["uid"] == G_UserData.getBase().getId()) {
                let index = j + 1;
                var percent = Math.floor((index - 1) / MAX_HERO_SIZE * 100);
                if (percent > 1) {
                    percent = percent + 20;
                    percent = Math.min(percent, 100);
                }
                this._scrollView.scrollToPercentVertical(1 - percent / 100);
                break;
            }
        }

        if (ArenaScrollNode.enterCount == 0) {
            ArenaScrollNode.enterInterval = 0.1;
        }
        else {
            ArenaScrollNode.enterInterval = 0;
        }
        this.scheduleOnce(this.onSchedule.bind(this, 1, playerList, callBack, needJump, needAnimation, endCallback), ArenaScrollNode.enterInterval);
    }
    onSchedule(i: number, playerList, callBack, needJump, needAnimation, endCallback): void {
        if (i > playerList.length) {
            ArenaScrollNode.enterCount++;
            if (needJump == true) {
                this.jumpToSelfNode(needAnimation);
            }
            if (endCallback) {
                endCallback();
            }
            this.onScrollListen();
            return;
        }
        var createHeroAvatar = function (index, heroNode) {
            var heroAvatar = (cc.instantiate(this._arenaHeroAvatar) as cc.Node).getComponent(ArenaHeroAvatar);
            heroNode.removeAllChildren();
            heroNode.addChild(heroAvatar.node);
            this['_heroAvatar' + index] = heroAvatar;
            return heroAvatar;
        }.bind(this)
        var player = playerList[i - 1];
        var heroNode = this['_heroNode' + i];
        var heroNodeCfg = G_ConfigLoader.getConfig(ConfigNameConst.ARENA_LIST_POSITION).get(i);
        if (heroNode) {
            var heroAvatar = this['_heroAvatar' + i];
            if (heroAvatar == null) {
                heroAvatar = createHeroAvatar(i, heroNode);
                heroAvatar.updateAvatar(player, callBack);
                heroAvatar.turnBack();
            }
            heroAvatar.updateAvatar(player, callBack);
            heroNode.setPosition(new cc.Vec2(heroNodeCfg.position_x, heroNodeCfg.position_y));
        }
        var p = i + 1;
        this.scheduleOnce(this.onSchedule.bind(this, p, playerList, callBack, needJump, needAnimation, endCallback), ArenaScrollNode.enterInterval);

    }
    getScrollContentSize(...vars) {
        return this._scrollView.content.getContentSize();
    }
    onEnter() {
    }
    onExit() {
    }
}