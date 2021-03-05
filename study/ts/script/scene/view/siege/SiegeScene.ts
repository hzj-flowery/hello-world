import SiegeSceneCell from "./SiegeSceneCell";

const { ccclass, property } = cc._decorator;
@ccclass
export default class SiegeScene extends cc.Component {

    private _scenes: SiegeSceneCell[] = [];
    private _sceneCellIndex = 1;
    private _needNewMap = false;

    public onLoad() {
        this._addScene();
    }

    public addNode(node: cc.Node) {
        if (this._needNewMap) {
            this._addScene();
            this._needNewMap = false;
        }
        var currentScene = this._scenes[this._scenes.length - 1];
        var needNewMap = currentScene.addStageNode(node);
        if (needNewMap) {
            this._needNewMap = true;
        }
    }

    private _addScene() {
        var scene = new cc.Node().addComponent(SiegeSceneCell);
        scene.init(this._sceneCellIndex);
        scene.node.x = (this.getWidth());
        this.node.addChild(scene.node);
        this._scenes.push(scene);
        this._sceneCellIndex = this._sceneCellIndex + 1;
    }

    public getWidth() {
        var width = 0;
        for (let i in this._scenes) {
            var v = this._scenes[i];
            width = width + v.getVisibleWidth();
        }
        return width;
    }

    public reset() {
        this.node.removeAllChildren();
        this._scenes = [];
        this._sceneCellIndex = 1;
        this._needNewMap = false;
        this._addScene();
    }
}