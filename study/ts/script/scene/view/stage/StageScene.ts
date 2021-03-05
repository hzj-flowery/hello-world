import { G_ConfigLoader, G_EffectGfxMgr, G_ResolutionManager } from "../../../init";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import ViewBase from "../../ViewBase";
import StageNode from "./StageNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StageScene extends ViewBase {
    private static Z_BACKEFT = 1;
    private static Z_MAINPIC = 2;
    private static Z_BACKNODE = 3;
    private static Z_STAGENODE = 5;
    private static Z_STAGEBOX = 4;
    private static Z_FRONTEFT = 6;
    private static SCENE_BACK = 1;
    private static SCENE_MIDDLE = 2;
    private static SCENE_FRONT = 3;
    private static SCENE_SIZE_WIDTH = 2556;
    private static SCENE_SIZE_HEIGHT = 640;

    private _sceneInfo;
    private _moveDiff: number;
    private _moveFront: number;
    private _picPath: string;
    private _size: cc.Size;
    private _scenes: { [key: number]: cc.Node };

    public setScene(sceneId) {
        this._sceneInfo = G_ConfigLoader.getConfig(ConfigNameConst.STORY_CHAPTER_SCENE).get(sceneId);
        this._moveDiff = this._sceneInfo.differ_value;
        this._moveFront = -this._sceneInfo.differ_front_value;
        this._picPath = this._sceneInfo.background;
        this._size = new cc.Size(StageScene.SCENE_SIZE_WIDTH, StageScene.SCENE_SIZE_HEIGHT);
        this._scenes = {};
    }

    public onCreate() {
        for (var i = 1; i <= StageScene.SCENE_FRONT; i++) {
            var scene = new cc.Node();
            scene.setPosition(0, 0);
            this.node.addChild(scene, i);
            this._scenes[i] = scene;
        }
        let args: any[] = Path.getStageMapPath(this._picPath);
        var picBack = args[0];
        var picMid = args[1];
        var picFront = args[2];

        var spriteBack = this._setStageMapSprite(picBack, new cc.Vec2(0, 640), new cc.Vec2(0, 1));
        this._scenes[StageScene.SCENE_BACK].name = "_sceneBack";
        this._scenes[StageScene.SCENE_BACK].addChild(spriteBack.node, StageScene.Z_MAINPIC);

        var spriteMid = this._setStageMapSprite(picMid, new cc.Vec2(0, 0), new cc.Vec2(0, 0));
        this._scenes[StageScene.SCENE_MIDDLE].name = "_sceneMiddle";
        this._scenes[StageScene.SCENE_MIDDLE].addChild(spriteMid.node, StageScene.Z_MAINPIC);

        var spriteFront = this._setStageMapSprite(picFront, new cc.Vec2(0, 0), new cc.Vec2(0, 0));
        this._scenes[StageScene.SCENE_FRONT].name = "_sceneFront";
        this._scenes[StageScene.SCENE_FRONT].addChild(spriteFront.node, StageScene.Z_MAINPIC);

        this._createEffect(StageScene.SCENE_FRONT, this._sceneInfo.front_front, StageScene.Z_FRONTEFT);
        this._createEffect(StageScene.SCENE_FRONT, this._sceneInfo.front_back, StageScene.Z_BACKEFT);
        this._createEffect(StageScene.SCENE_MIDDLE, this._sceneInfo.mid_front, StageScene.Z_BACKNODE);
        this._createEffect(StageScene.SCENE_MIDDLE, this._sceneInfo.mid_back, StageScene.Z_BACKEFT);
        this._createEffect(StageScene.SCENE_BACK, this._sceneInfo.back_front, StageScene.Z_FRONTEFT);
    }

    onEnter() {
    }

    public onExit() {
    }

    private _setStageMapSprite(spirtePath: string, pos: cc.Vec2, anchorPoint: cc.Vec2): cc.Sprite {
        var sprite = UIHelper.newSprite(spirtePath);
        sprite.node.setPosition(pos);
        sprite.node.setAnchorPoint(anchorPoint);
        return sprite;
    }

    public onMoveEvent(posX) {
        let diffPerPix = this._moveDiff / this._size.width;
        let backPosX = -posX * diffPerPix;
        // console.log("onMoveEvent:", posX, this._moveDiff, this._size.width, diffPerPix, backPosX);
        this._scenes[StageScene.SCENE_BACK].x = backPosX;
        if (this._scenes[StageScene.SCENE_FRONT]) {
            diffPerPix = this._moveFront / this._size.width;
            backPosX = -posX * diffPerPix;
            this._scenes[StageScene.SCENE_FRONT].x = backPosX;
        }
    }

    public getSize() {
        return this._size;
    }

    public addStageNode(node: cc.Node) {
        this._scenes[StageScene.SCENE_MIDDLE].addChild(node, StageScene.Z_STAGENODE);
    }

    public addStageBox(node: cc.Node) {
        this._scenes[StageScene.SCENE_MIDDLE].addChild(node, StageScene.Z_STAGEBOX);
    }

    public getScene(index) {
        return this._scenes[index];
    }

    public _createEffect(sceneIndex, effectName, ZOrder) {
        if (effectName == null || effectName == '') {
            return;
        }
        var scene = this._scenes[sceneIndex];
        var effect = G_EffectGfxMgr.createPlayMovingGfx(scene, effectName, null, null, false);
        var height = Math.min(640, G_ResolutionManager.getDesignHeight());
        effect.node.setPosition(this._size.width * 0.5, height * 0.5);
        if (ZOrder) {
            effect.node.zIndex = ZOrder;
        }
    }
}