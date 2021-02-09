import { Path } from "../../../utils/Path";
import ViewBase from "../../ViewBase";
import UserDetailPetSingle from "./UserDetailPetSingle";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UserDetailPetNode extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _nodePetBg: cc.Node = null;

    private _parentView: any;
    private _detailData: any;
    private _userDetailPetSingle
    setInitData(parentView) {
        this._parentView = parentView;
    }
    onCreate() {
        this._userDetailPetSingle = cc.resources.get(Path.getPrefab("UserDetailPetSingle","team"));
        this._initData();
        this._initView();
    }
    _initData() {
        this._detailData = null;
    }
    _initView() {
    }
    onEnter() {
    }
    onExit() {
    }
    updateInfo(detailData) {
        this._detailData = detailData;
        this._updateData();
        this._updateView();
    }
    _updateData() {
    }
    _updateView() {
        var tbPos = {
            1: [new cc.Vec2(482, 199)],
            2: [
                new cc.Vec2(315, 199),
                new cc.Vec2(658, 199)
            ],
            3: [
                new cc.Vec2(230, 199),
                new cc.Vec2(482, 199),
                new cc.Vec2(733, 199)
            ],
            4: [
                new cc.Vec2(337, 316),
                new cc.Vec2(635, 316),
                new cc.Vec2(336, 91),
                new cc.Vec2(635, 91)
            ],
            5: [
                new cc.Vec2(267, 316),
                new cc.Vec2(486, 316),
                new cc.Vec2(705, 316),
                new cc.Vec2(376, 91),
                new cc.Vec2(595, 91)
            ],
            6: [
                new cc.Vec2(267, 316),
                new cc.Vec2(486, 316),
                new cc.Vec2(705, 316),
                new cc.Vec2(267, 91),
                new cc.Vec2(486, 91),
                new cc.Vec2(705, 91)
            ],
            7: [
                new cc.Vec2(267, 316),
                new cc.Vec2(486, 316),
                new cc.Vec2(705, 316),
                new cc.Vec2(189, 91),
                new cc.Vec2(391, 91),
                new cc.Vec2(594, 91),
                new cc.Vec2(797, 91)
            ]
        };
        var tbScale = {
            1: 0.6,
            2: 0.5,
            3: 0.5,
            4: 0.4,
            5: 0.4,
            6: 0.4,
            7: 0.4
        };
        this._nodePetBg.removeAllChildren();
        var petIds = this._detailData.getProtectPetIds();
        var len = petIds.length;
        for (var i in petIds) {
            var petId = petIds[i];
            var unitData = this._detailData.getPetUnitDataWithId(petId);
            var node = (cc.instantiate(this._userDetailPetSingle) as cc.Node).getComponent(UserDetailPetSingle)
            node.setInitData(unitData);
            node.setAvatarScale(tbScale[len]);
            node.node.setPosition(tbPos[len][i]);
            this._nodePetBg.addChild(node.node);
        }
    }

}