import { G_ConfigLoader, G_EffectGfxMgr, G_ResolutionManager } from "../../../init";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;
@ccclass
export default class SiegeSceneCell extends cc.Component {

    //中层要分，从前到后，前特效，宝箱层，人物层，人物后，图片，后特效
    private static Z_BACKEFT = 1
    private static Z_MAINPIC = 2
    private static Z_BACKNODE = 3
    private static Z_STAGENODE = 5
    private static Z_STAGEBOX = 4
    private static Z_FRONTEFT = 6
    private static SCENE_BACK = 1
    private static SCENE_MIDDLE = 2
    private static SCENE_FRONT = 3
    private static SCENE_INDEX = 8      //南蛮场景的id
    private static SCENE_LAST_WIDTH = 300   //最后一个怪距离版边的距离
    private static SCENE_SIZE_WIDTH = 2556;
    private static SCENE_SIZE_HEIGHT = 640;

    private static SCENE_CONFIG =
        {
            nodePosition1: [
                cc.v2(430, 182),
                cc.v2(765, 126),
                cc.v2(1042, 273),
                cc.v2(1283, 396),
                cc.v2(1593, 168),
                cc.v2(1889, 126),
                cc.v2(2145, 258),
            ],

            nodePosition: [
                cc.v2(98, 151),
                cc.v2(430, 182),
                cc.v2(765, 126),
                cc.v2(1042, 273),
                cc.v2(1283, 396),
                cc.v2(1593, 168),
                cc.v2(1889, 126),
                cc.v2(2145, 258),
            ]
        };

    private _config;
    private _sceneConfig;
    private _scenes: { [key: number]: cc.Node };
    private _nodeIndex;
    private _cellIndex;
    private _positionList;
    private _size;

    public init(cellIndex) {
        this._config = SiegeSceneCell.SCENE_CONFIG;
        this._sceneConfig = G_ConfigLoader.getConfig(ConfigNameConst.STORY_CHAPTER_SCENE).get(SiegeSceneCell.SCENE_INDEX);
        this._scenes = {};
        this._nodeIndex = 0;
        this._cellIndex = cellIndex;
        this._positionList = this._config['nodePosition' + this._cellIndex];
        if (!this._positionList) {
            this._positionList = this._config.nodePosition;
        }
        this._size = new cc.Size(SiegeSceneCell.SCENE_SIZE_WIDTH, SiegeSceneCell.SCENE_SIZE_HEIGHT);
    }

    public onLoad() {
        for (var i = 1; i <= SiegeSceneCell.SCENE_FRONT; i++) {
            var scene = new cc.Node();
            scene.setPosition(0, 0);
            this.node.addChild(scene, i);
            this._scenes[i] = scene;
        }
        var [picBack, picMid, picFront] = Path.getStageMapPath(this._sceneConfig.background);

        var spriteBack = this._setStageMapSprite(picBack, new cc.Vec2(0, 640), new cc.Vec2(0, 1));
        this._scenes[SiegeSceneCell.SCENE_BACK].name = "_sceneBack";
        this._scenes[SiegeSceneCell.SCENE_BACK].addChild(spriteBack.node, SiegeSceneCell.Z_MAINPIC);

        var spriteMid = this._setStageMapSprite(picMid, new cc.Vec2(0, 0), new cc.Vec2(0, 0));
        this._scenes[SiegeSceneCell.SCENE_MIDDLE].name = "_sceneMiddle";
        this._scenes[SiegeSceneCell.SCENE_MIDDLE].addChild(spriteMid.node, SiegeSceneCell.Z_MAINPIC);

        var spriteFront = this._setStageMapSprite(picFront, new cc.Vec2(0, 0), new cc.Vec2(0, 0));
        this._scenes[SiegeSceneCell.SCENE_FRONT].name = "_sceneFront";
        this._scenes[SiegeSceneCell.SCENE_FRONT].addChild(spriteFront.node, SiegeSceneCell.Z_MAINPIC);

        this._createEffect(SiegeSceneCell.SCENE_FRONT, this._sceneConfig.front_front, SiegeSceneCell.Z_FRONTEFT);
        this._createEffect(SiegeSceneCell.SCENE_FRONT, this._sceneConfig.front_back, SiegeSceneCell.Z_BACKEFT);
        this._createEffect(SiegeSceneCell.SCENE_MIDDLE, this._sceneConfig.mid_front, SiegeSceneCell.Z_BACKNODE);
        this._createEffect(SiegeSceneCell.SCENE_MIDDLE, this._sceneConfig.mid_back, SiegeSceneCell.Z_BACKEFT);
        this._createEffect(SiegeSceneCell.SCENE_BACK, this._sceneConfig.back_front, SiegeSceneCell.Z_FRONTEFT);
    }

    private _setStageMapSprite(spirtePath: string, pos: cc.Vec2, anchorPoint: cc.Vec2): cc.Sprite {
        var sprite = UIHelper.newSprite(spirtePath);
        sprite.node.setPosition(pos);
        sprite.node.setAnchorPoint(anchorPoint);
        return sprite;
    }

    public getSize() {
        return this._size;
    }

    public addStageNode(node: cc.Node) {
        this._nodeIndex = this._nodeIndex + 1;
        var position = this._positionList[this._nodeIndex - 1];
        node.setPosition(position);
        this._scenes[SiegeSceneCell.SCENE_MIDDLE].addChild(node, SiegeSceneCell.Z_STAGENODE);
        if (this._nodeIndex == this._positionList.length) {
            return true;
        }
    }

    public _createEffect(sceneIndex, effectName, ZOrder) {
        if (effectName == '') {
            return;
        }
        var scene = this._scenes[sceneIndex];
        var effect = G_EffectGfxMgr.createPlayMovingGfx(scene, effectName, null, null, false);
        effect.node.setPosition(this._size.width * 0.5, this._size.height * 0.5);
        if (ZOrder) {
            effect.node.zIndex = (ZOrder);
        }
    }

    public getVisibleWidth() {
        var lastIndex = this._nodeIndex;
        if (lastIndex == this._positionList.length) {
            return this._size.width;
        } else if (this._cellIndex == 1 && lastIndex == 0) {
            return G_ResolutionManager.getDesignWidth();
        }
        var width = this._positionList[this._nodeIndex - 1].x + SiegeSceneCell.SCENE_LAST_WIDTH;
        if (this._size.width < width) {
            width = this._size.width;
        }
        return width;
    }
}