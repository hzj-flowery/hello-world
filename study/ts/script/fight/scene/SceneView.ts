import { G_ResolutionManager, G_ConfigLoader } from "../../init";
import FarGround from "./FarGround";
import Background from "./Background";
import Slowground from "./Slowground";
import Gameground from "./Gameground";
import Frontground from "./Frontground";
import Flashground from "./Flashground";
import Attenuator from "./Attenuator";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { FightConfig } from "../FightConfig";

export default class SceneView extends cc.Component {

    private _sceneWidth: number;
    private _sceneHeight: number;

    private _farGround: FarGround;
    private _grdBack: Background;
    private _grdFlash: Flashground;
    private _grdSlow: Slowground;
    private _grdGame: Gameground;
    private _grdFront: Frontground;
    private _attenuator: Attenuator;

    public init() {
        var width = G_ResolutionManager.getDesignWidth();
        var height = G_ResolutionManager.getDesignHeight();
        this._sceneWidth = width;
        this._sceneHeight = height;
        this._farGround = new cc.Node("_farGround").addComponent(FarGround);
        this.node.addChild(this._farGround.node);
        this._farGround.init();

        this._grdBack = new cc.Node("_grdBack").addComponent(Background);
        this.node.addChild(this._grdBack.node);
        this._grdBack.init();

        this._grdFlash = new cc.Node("_grdFlash").addComponent(Flashground);
        this.node.addChild(this._grdFlash.node);
        this._grdFlash.init();

        this._grdSlow = new cc.Node("_grdSlow").addComponent(Slowground);
        this.node.addChild(this._grdSlow.node);
        this._grdSlow.init();

        this._grdGame = new cc.Node("_grdGame").addComponent(Gameground);
        this.node.addChild(this._grdGame.node);
        this._grdGame.node.setPosition(0, -FightConfig.GAME_GROUND_FIX);
        this._grdGame.init();

        this._grdFront = new cc.Node("_grdFront").addComponent(Frontground);
        this.node.addChild(this._grdFront.node);
        this._grdFront.init();

        this._attenuator = this.node.addComponent(Attenuator);
        this._attenuator.init();
    }

    public resetScene(sceneId) {
        var mapData = G_ConfigLoader.getConfig(ConfigNameConst.BATTLE_SCENE).get(sceneId);
        var turn = 1;
        if (mapData.is_turn == 1) {
            turn = -1;
        }
        this._farGround.setBG(mapData.farground);
        this._farGround.node.scaleX = turn;
        this._farGround.createEffect(mapData.back_eft);
        this._grdBack.setBG(mapData.background);
        this._grdBack.node.scaleX = turn;
        this._grdBack.createEffect(mapData.middle_eft);
        this._grdFront.node.scaleX = turn;
        this._grdFront.createEffect(mapData.front_eft);
    }

    public doFinalSlow() {
    }

    public reCreateFront() {
    }

    public getBackGround() {
        return this._grdBack;
    }

    public getFlashGround() {
        return this._grdFlash;
    }

    public addEntityActor(actor: cc.Node) {
        this._grdGame.addActor(actor);
    }

    public removeActorByName(name) {
        this._grdGame.removeActorByName(name);
    }

    public removeEntityActor(actor) {
        this._grdGame.removeActor(actor);
    }

    public addTipView(view) {
        this._grdGame.addTipView(view);
    }

    public shake(ampX, ampY, atteCoef, timeCoef) {
        this._attenuator.setStart(ampX, ampY, atteCoef, timeCoef);
    }

    public addDrop(stageId, awards) {
        this._grdGame.addDrop(stageId, awards);
    }

    public showSkill2Layer(s) {
        this._grdGame.showLayerBlack(s);
        this._grdFront.node.active = (!s);
    }

    public showSkill3Layer(s) {
        if (s) {
            this._grdBack.fadeInCombineBG();
        } else {
            this._grdBack.fadeOutCombineBG();
        }
        this._grdFront.node.active = (!s);
    }

    public showFinalSlow(callback) {
        this._grdGame.showLayerBlack(false);
        this._grdSlow.showWhiteAndYellow(callback);
    }
}