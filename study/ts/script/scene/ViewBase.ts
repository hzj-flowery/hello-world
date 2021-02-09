import { AudioConst } from "../const/AudioConst";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { G_AudioManager, G_ConfigLoader, G_EffectGfxMgr, G_ResolutionManager } from "../init";
import { EffectGfxData, EffectGfxType } from "../manager/EffectGfxManager";
import { Path } from "../utils/Path";
import ResourceLoader, { ResourceData } from "../utils/resource/ResourceLoader";
import UIHelper from "../utils/UIHelper";

const { ccclass, property } = cc._decorator;
@ccclass
export default abstract class ViewBase extends cc.Component {

    public static Z_ORDER_FAR_GROUND = 1;
    public static Z_ORDER_GRD_BACK = 3;
    public static Z_ORDER_GRD_FRONT = 5;

    protected preloadEffectList: EffectGfxData[];
    protected preloadResList: ResourceData[];
    protected preloadResListData:any;

    private _effectLayers: { [key: number]: cc.Node };
    private _sceneSize: cc.Size;
    _sceneData;
    protected _viewEffectNode: cc.Node;
    protected nextSceneName: string;
    _layerDatas: any;

    private _sceneName: string

    constructor() {
        super();
        this._effectLayers = {};
        this._sceneData = null;
    }

    onSoundClick() {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_BUTTON);
    }

    onLoad() {
        this.node.on(cc.Node.EventType.MOUSE_DOWN, this.onSoundClick, this, true);
        this.onCreate();
    }

    onEnable() {
        this.nextSceneName = "";
        this.onEnter();
    }

    onDisable() {
        this.onExit();
    }

    onDestroy() {
        this.onCleanup();
    }

    public setSceneSize(sceneSize?: cc.Size, setAnchorMid: boolean = true) {

        this._sceneSize = sceneSize;
        if (!this._sceneSize) {
            this._sceneSize = G_ResolutionManager.getDesignCCSize();
        }

        this.node.setContentSize(this._sceneSize.width, this._sceneSize.height);
        this.node.setPosition(0, 0);
        setAnchorMid && this.node.setAnchorPoint(0.5, 0.5);

        let resourceNode = this.node.getChildByName("_resourceNode");
        if (resourceNode) {
            resourceNode.setContentSize(this._sceneSize.width, this._sceneSize.height);
            this.node.setPosition(0, 0);
            this.node.setAnchorPoint(0.5, 0.5);
        }

        G_ResolutionManager.doLayout(this.node.getChildByName("_panelDesign"));
    }

    public static waitEnterMsg(callBack, ...vars) {
        callBack();
    }

    public preloadRes(callBack: Function, params?) {
        let preloadeds = [];
        this.preloadEffectList && preloadeds.concat(this.preloadEffectList)
        this.preloadResList && preloadeds.concat(this.preloadResList);

        let loadNum: number = 0;
        this.preloadEffectList != null && loadNum++;
        this.preloadResList != null && loadNum++;
        if (loadNum <= 0) {
            callBack();
            return;
        }
        let loadedNum: number = 0;

        function loadCallback() {
            loadedNum++;
            if (loadedNum >= loadNum) {
                callBack();
            }
        }

        if (this.preloadEffectList != null) {
            G_EffectGfxMgr.loadEffectGfxList(this.preloadEffectList, loadCallback, this.getSceneName());
        }
        if (this.preloadResList != null) {
            ResourceLoader.loadResArrayWithType(this.preloadResList, null, (err, resources) =>{
                loadCallback()
            }, this.getSceneName());
        }
    }

    protected getSceneName(): string {
        return this._sceneName;
    }

    public setSceneName(name: string) {
        this._sceneName = name;
    }


    protected  onCreate(){};
    protected  onEnter(){};
    protected  onExit(){};

    protected onCleanup() { }

    onMoveEvent(posX) {
        var sceneWidth = this._sceneSize.width;
        for (var k in this._effectLayers) {
            var v = this._effectLayers[k];
            var data = this._layerDatas[k];
            if (data) {
                var diffPerPix = data.differ / sceneWidth;
                var backPosX = -posX * diffPerPix;
                v.x = (backPosX);
            }
        }
    }

    /**
     * TODO:直接用资源来创建场景
     * @param res 
     * @param layerDatas 
     */
    updateSceneByRes(res, layerDatas?: any) {
        res = res || {};
        layerDatas = layerDatas || {};
        this._layerDatas = layerDatas;
        var sceneSize = null;
        var layerNum = layerDatas.length;
        for (let k = 0; k < res.length; k++) {
            var v = res[k];
            var layer = this.getEffectLayer(v.layer);
            var data = layerDatas[v.layer];
            if (v.path != '') {
                var start1 = v.path.indexOf('.png');
                var start2 = v.path.indexOf('.jpg');
                var node = null;
                if (start1 != -1 || start2 != -1) {
                    node = new cc.Node();
                    node.addComponent(cc.Sprite);
                    let str = (v.path as string).slice(0, v.path.length);
                    str = str.replace(".png", "");
                    str = str.replace(".jpg", "");
                    UIHelper.loadTexture(node.getComponent(cc.Sprite), str)
                    node.setAnchorPoint(cc.v2(0.5, 0.5));
                    layer.addChild(node);
                } else {
                    node = G_EffectGfxMgr.createPlayMovingGfx(layer, Path.getFightSceneEffect(v.path), null, null, false).node;
                    node.setPosition(cc.v2(0, 0));
                }
                if (v.anchorPoint) {
                    node.setAnchorPoint(v.anchorPoint);
                }
                if (v.x != undefined && v.y != undefined) {
                    node.setPosition(cc.v2(v.x, v.y));
                }
                if (v.main) {
                    sceneSize = new cc.Size(0, 0);
                    // sceneSize = node.getContentSize();
                }
            }
        }
        if (sceneSize) {
            this._sceneSize = sceneSize;
            var ccPoint = cc.v2(this._sceneSize.width * 0.5, this._sceneSize.height * 0.5);
            this._viewEffectNode.setPosition(ccPoint);
        }
    }

    public getSceneSize() {
        return this._sceneSize;
    }

    public updateSceneId(sceneId: number, isLoadEffect: boolean = false) {
        if (sceneId) {
            for (const k in this._effectLayers) {
                var v = this._effectLayers[k];
                if (k == ViewBase.Z_ORDER_FAR_GROUND.toString() ||
                    k == ViewBase.Z_ORDER_GRD_BACK.toString() ||
                    k == ViewBase.Z_ORDER_GRD_FRONT.toString()) {
                    (v as cc.Node).destroy();
                    this._effectLayers[k] = null;
                }
            }
            this._sceneData = G_ConfigLoader.getConfig(ConfigNameConst.BATTLE_SCENE).get(sceneId);
            this._createFarGround(isLoadEffect);
            this._createBackGround(isLoadEffect);
            this._createFrontEffect(isLoadEffect);
        }
    }

    clearScene() {
        for (const k in this._effectLayers) {
            var v = this._effectLayers[k];
            if (k == ViewBase.Z_ORDER_FAR_GROUND.toString() ||
                k == ViewBase.Z_ORDER_GRD_BACK.toString() ||
                k == ViewBase.Z_ORDER_GRD_FRONT.toString()) {
                (v as cc.Node).destroy();
                this._effectLayers[k] = null;
            }
        }
    }

    public addPreloadSceneRes(sceneId: number, isLoadEffect: boolean = false) {
        this._sceneData = G_ConfigLoader.getConfig(ConfigNameConst.BATTLE_SCENE).get(sceneId);

        let fargroundPicName: string = this._sceneData.farground;
        fargroundPicName = fargroundPicName.split(".")[0];
        let fargroundEffectName = this._sceneData.back_eft;

        let backgroundPicName = this._sceneData.background;
        backgroundPicName = backgroundPicName.split(".")[0];
        let backgroundEffectName = this._sceneData.middle_eft;

        let frontEffectName = this._sceneData.front_eft;

        this._addScenePicRes(fargroundPicName);
        this._addScenePicRes(backgroundPicName);
        if (isLoadEffect) {
            this._addSceneEffectRes(fargroundEffectName);
            this._addSceneEffectRes(backgroundEffectName);
            this._addSceneEffectRes(frontEffectName);
        }
    }

    private _addScenePicRes(picName: string) {
        if (picName == null || picName == "") {
            return;
        }
        this.preloadResList = this.preloadResList || [];
        this.preloadResList.push({ path: picName, type: cc.SpriteFrame });
    }

    private _addSceneEffectRes(effectName: string) {
        if (effectName == null || effectName == "") {
            return;
        }
        this.preloadEffectList = this.preloadEffectList || [];
        this.preloadEffectList.push({ name: Path.getFightSceneEffect(effectName), type: EffectGfxType.MovingGfx });
    }

    public getName() {
        return this.node.name;
    }

    public getResourceNode() {
        return this.node.getChildByName("_resourceNode") || this.node;
    }

    public getGroundNode() {
        return this.getEffectLayer(ViewBase.Z_ORDER_GRD_BACK);
    }

    public getEffectLayer(layerIndex: number): cc.Node {
        if (this._effectLayers[layerIndex]) {
            return this._effectLayers[layerIndex];
        }
        var node = new cc.Node;
        if (this._viewEffectNode == null) {
            this._viewEffectNode = new cc.Node("_viewEffectNode");
            this.node.insertChild(this._viewEffectNode, 0)
            this._viewEffectNode.setPosition(0, 0);
        }
        this._viewEffectNode.addChild(node, layerIndex);
        this._effectLayers[layerIndex] = node;
        return node;
    }

    _createFarGround(isLoadEffect: boolean = false) {
        var farGround = this.getEffectLayer(ViewBase.Z_ORDER_FAR_GROUND);
        var picName: string = this._sceneData.farground;
        picName = picName.split(".")[0];
        if (picName != '') {
            var pic = new cc.Node("farGroundPic");
            let picSprite: cc.Sprite = pic.addComponent(cc.Sprite);
            pic.setAnchorPoint(0.5, 1);
            farGround.addChild(pic);
            pic.setPosition(0, G_ResolutionManager.getDesignHeight() / 2);
            var res = cc.resources.get(picName,cc.SpriteFrame);
            if(res&&picSprite != null && picSprite.node != null && picSprite.node.isValid)
            {
                picSprite.spriteFrame = res;
            }
            else
            {
                cc.resources.load(picName, cc.SpriteFrame, function (erro, res) {
                    if (picSprite != null && picSprite.node != null && picSprite.node.isValid) {
                        picSprite.spriteFrame = res;
                    }
                })
            }
        }
        if (!isLoadEffect) {
            return;
        }
        var effectName = this._sceneData.back_eft;
        if (effectName != '') {
            var effectNode = new cc.Node();
            farGround.addChild(effectNode);
            G_EffectGfxMgr.createPlayMovingGfx(effectNode, Path.getFightSceneEffect(effectName), null, null, false);
        }
    }
    protected _makeBackGroundBottom() {
        var grdBack: cc.Node = this.getEffectLayer(ViewBase.Z_ORDER_GRD_BACK);
        var backgrdPic = grdBack.getChildByName('backgrdPic');
        if (backgrdPic) {
            backgrdPic.setAnchorPoint(0.5, 0);
            backgrdPic.setPosition(0, -320);
        }
    }
    
    _createBackGround(isLoadEffect: boolean = false) {
        var grdBack = this.getEffectLayer(ViewBase.Z_ORDER_GRD_BACK);
        var picName = this._sceneData.background;
        picName = picName.split(".")[0];
        if (picName != '') {
            var pic = new cc.Node();
            let picSprite: cc.Sprite = pic.addComponent(cc.Sprite);
            pic.setAnchorPoint(0.5, 0);
            pic.y = -320;
            pic.name = 'backgrdPic';
            grdBack.addChild(pic);
            var res = cc.resources.get(picName,cc.SpriteFrame);
            if(res&&picSprite != null && picSprite.node != null && picSprite.node.isValid)
            {
                picSprite.spriteFrame = res;
            }
            else
            {
                cc.resources.load(picName, cc.SpriteFrame, function (erro, res) {
                    if (picSprite != null && picSprite.node != null && picSprite.node.isValid) {
                        picSprite.spriteFrame = res;
                    }
                })
            }
        }
        if (!isLoadEffect) {
            return;
        }
        var effectName = this._sceneData.middle_eft;
        if (effectName != '') {
            var effectNode = new cc.Node("MiddleEffect");
            grdBack.addChild(effectNode);
            G_EffectGfxMgr.createPlayMovingGfx(effectNode, Path.getFightSceneEffect(effectName), null, null, false);
        }
    }

    private _createFrontEffect(isLoadEffect: boolean = false) {
        if (!isLoadEffect) {
            return;
        }
        var grdFront = this.getEffectLayer(ViewBase.Z_ORDER_GRD_FRONT);
        var effectName = this._sceneData.front_eft;
        if (effectName != '') {
            var effectNode = new cc.Node("FrontEffect");
            grdFront.addChild(effectNode);
            G_EffectGfxMgr.createPlayMovingGfx(effectNode, Path.getFightSceneEffect(effectName), null, null, false)
        }
    }
}