import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { RunningManConst } from "../../../const/RunningManConst";
import { SignalConst } from "../../../const/SignalConst";
import { G_ConfigLoader, G_ResolutionManager, G_SignalManager, G_UserData } from "../../../init";
import { SpineNode } from "../../../ui/node/SpineNode";
import { Path } from "../../../utils/Path";
import RunningManAvatar from "./RunningManAvatar";
import { RunningManHelp } from "./RunningManHelp";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RunningManScrollView extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _panelbk: cc.Node = null;

    @property({ type: cc.ScrollView, visible: true })
    _scrollView: cc.ScrollView = null;

    @property({ type: cc.Prefab, visible: true })
    _runningManAvatarPrefab: cc.Prefab = null;

    private MAX_MID_SCROLL_COUNT = 8 * 3;
    private MAX_HERO_COUNT = 5;

    private _saipaozhongdian1SpineNode: SpineNode;
    private _saipaozhongdian2SpineNode: SpineNode;
    private _runningManAvatars: RunningManAvatar[] = [];

    public onLoad() {
        this._buildMapBk();
        this._buildSceneEffect();
    }

    private _buildMapBk() {
        var virtualRenderList: any[] = [];
        var imageBegin: cc.Sprite = this._scrollView.content.getChildByName('Image_begin').getComponent(cc.Sprite);
        var imageEnd: cc.Sprite = this._scrollView.content.getChildByName('Image_end').getComponent(cc.Sprite);
        var Image_mid1: cc.Sprite = this._scrollView.content.getChildByName('Image_mid1').getComponent(cc.Sprite);
        virtualRenderList.push(imageBegin);
        virtualRenderList.push(imageEnd);
        virtualRenderList.push(Image_mid1);
        var starX = imageBegin.node.getContentSize().width;
        imageBegin.node.x = (0);
        Image_mid1.node.x = (starX);
        Image_mid1.node.y = (0);
        for (let i = 0; i < this.MAX_MID_SCROLL_COUNT; i++) {
            var newWidget = cc.instantiate(Image_mid1.node);
            newWidget.x = (starX + Image_mid1.node.getContentSize().width * (i + 1));
            newWidget.y = (0);
            newWidget.name = ('Image_mid' + (i + 1));
            virtualRenderList.push(newWidget.getComponent(cc.Sprite));
            this._scrollView.content.addChild(newWidget);
        }
        var maxWidth = imageBegin.node.getContentSize().width +
            Image_mid1.node.getContentSize().width * this.MAX_MID_SCROLL_COUNT +
            imageEnd.node.getContentSize().width + Image_mid1.node.getContentSize().width;
        imageEnd.node.setAnchorPoint(1, 0);
        imageEnd.node.x = (maxWidth);
        imageEnd.node.y = (0);
        this._scrollView.content.setContentSize(maxWidth, 640);
        this._scrollView.enabled = false;
    }

    public reset() {
        for (let i = 0; i < this._runningManAvatars.length; i++) {
            this._runningManAvatars[i].node.removeFromParent();
        }
        this._runningManAvatars = [];
        if (this._saipaozhongdian1SpineNode) {
            this._saipaozhongdian1SpineNode.setAnimation('effect1', true);
        }
        if (this._saipaozhongdian2SpineNode) {
            this._saipaozhongdian2SpineNode.setAnimation('effect3', true);
        }
        this._scrollView.content.setPosition(0, 0);
    }

    public buildAvatar() {
        var runningList = G_UserData.getRunningMan().getBet_info();
        if (runningList && runningList.length > 0) {

            for (let i = 0; i < runningList.length; i++) {
                var value = runningList[i];
                var avatarNode = this._runningManAvatars[value.roadNum - 1];
                if (avatarNode == null) {
                    let avatar = cc.instantiate(this._runningManAvatarPrefab).getComponent(RunningManAvatar);
                    avatar.node.zIndex = (RunningManConst.START_AVATAR_ZORDER + i);
                    avatar.updateUI(value);
                    avatar.playIdle();
                    avatar.node.name = ('avatar' + (i + 1));
                    this._scrollView.content.addChild(avatar.node);
                    this._runningManAvatars.push(avatar);
                }
            }
        }
    }

    private _buildSceneEffect() {
        let createEffectByData = function (data): cc.Node {
            var spineNode = SpineNode.create();
            spineNode.setAsset(Path.getEffectSpine(data.name));
            spineNode.node.setPosition(data.x_coordinate, data.y_coordinate);
            spineNode.setAnimation(data.animation, true);
            spineNode.node.scaleX = (data.orientation);
            spineNode.setSize(cc.size(300, 100));
            spineNode.node.zIndex = (data.zorder);
            if (data.name == 'saipaozhongdian' && data.animation == 'effect1') {
                spineNode.node.name = ('saipaozhongdian1');
                this._saipaozhongdian1SpineNode = spineNode;
            }
            if (data.name == 'saipaozhongdian' && data.animation == 'effect3') {
                spineNode.node.name = ('saipaozhongdian2');
                this._saipaozhongdian2SpineNode = spineNode;
            }
            return spineNode.node;
        }.bind(this);
        var config = G_ConfigLoader.getConfig(ConfigNameConst.PLAY_HORSE_SCENE_EFFECT);
        for (let i = 0; i < config.length(); i++) {
            var data = config.indexOf(i);
            var node = createEffectByData(data);
            this._scrollView.content.addChild(node);
        }
    }

    public playOverRunning() {
        if (this._saipaozhongdian1SpineNode) {
            this._saipaozhongdian1SpineNode.setAnimation('effect2', false);
        }
        if (this._saipaozhongdian2SpineNode) {
            this._saipaozhongdian2SpineNode.setAnimation('effect4', false);
        }
    }

    public playIdle() {
        for (let i = 0; i < this._runningManAvatars.length; i++) {
            this._runningManAvatars[i].playIdle();
        }
    }

    public resetAvatar() {
        for (let i = 0; i < this._runningManAvatars.length; i++) {
            this._runningManAvatars[i].resetAvatar();
        }
    }

    public playRunningAndIdle() {
        for (let i = 0; i < this._runningManAvatars.length; i++) {
            this._runningManAvatars[i].playRunningAndIdle();
        }
    }

    public playRunning() {
        for (let i = 0; i < this._runningManAvatars.length; i++) {
            this._runningManAvatars[i].playRunning();
        }
    }

    public stopRunningByHeroId(heroId) {
        for (let i = 0; i < this._runningManAvatars.length; i++) {
            if (this._runningManAvatars[i].getHeroId() == heroId) {
                this._runningManAvatars[i].playIdle();
            }
        }
    }

    public updateCamera() {
        var unit = RunningManHelp.getTopUnitDistance();
        if (unit == null) {
            return;
        }
        var dst = unit.getRunningDistance();
        var moveOffset = dst - G_ResolutionManager.getDesignCCSize().width * 0.2;
        var maxWidth = this._scrollView.content.getContentSize().width - G_ResolutionManager.getDesignCCSize().width;
        // console.log(dst, moveOffset,this._scrollView.content.getContentSize().width, maxWidth);
        if (moveOffset > maxWidth) {
            moveOffset = maxWidth;
        }
        if (moveOffset < 0) {
            moveOffset = 0;
        }
        this._scrollView.content.setPosition(-moveOffset, 0);
    }

    public updateWait() {
        for (let i = 0; i < this._runningManAvatars.length; i++) {
            this._runningManAvatars[i].playWaitChat();
        }
    }

    public syncRuningPos() {
        for (let i = 0; i < this._runningManAvatars.length; i++) {
            var avatar = this._runningManAvatars[i];
            if (avatar) {
                var heroId = avatar.getHeroId();
                var unitData = G_UserData.getRunningMan().getRunningUnit(heroId);
                if (unitData) {
                    var avatarInfo = RunningManConst['AVATA_INFO' + unitData.getRoad_num()];
                    var distance = unitData.getRunningDistance();
                    avatar.node.x = (avatarInfo.startPos.x + distance);
                    avatar.node.y = (avatarInfo.startPos.y);
                    avatar.setAvatarScale(avatarInfo.scale);
                    if (unitData.isRunning() == false) {
                        avatar.playIdle();
                        G_SignalManager.dispatch(SignalConst.EVENT_PLAY_HORSE_HERO_RUNNING_END, unitData.getHero_id());
                    }
                }
            }
        }
    }

    public updateRunning(dt) {
        for (let i = 0; i < this._runningManAvatars.length; i++) {
            var avatar = this._runningManAvatars[i];
            if (avatar) {
                var heroId = avatar.getHeroId();
                var unitData = G_UserData.getRunningMan().getRunningUnit(heroId);
                if (unitData && unitData.isRunning()) {
                    var avatarInfo = RunningManConst['AVATA_INFO' + unitData.getRoad_num()];
                    unitData.updateRunning(dt);
                    var distance = unitData.getRunningDistance();
                    avatar.node.x = (avatarInfo.startPos.x + distance);
                    avatar.node.y = (avatarInfo.startPos.y);
                    avatar.setAvatarScale(avatarInfo.scale);
                    avatar.playRuningChat();
                }
            }
        }
        this.updateCamera();
    }
}