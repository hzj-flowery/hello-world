const { ccclass, property } = cc._decorator;




import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'
import { FunctionConst } from '../../../const/FunctionConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import ViewBase from '../../ViewBase';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { G_SignalManager, G_ConfigLoader, G_ResolutionManager } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { FunctionCheck } from '../../../utils/logic/FunctionCheck';
import ChallengeCell from './ChallengeCell';
import UIHelper from '../../../utils/UIHelper';

@ccclass
export default class ChallengeView extends ViewBase {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBG: cc.Sprite = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topBar: CommonTopbarBase = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listMenu: cc.ScrollView = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _challengeCell: cc.Node = null;

    public static FUNCTION_LIST = [
        FunctionConst.FUNC_ARENA,
        FunctionConst.FUNC_DAILY_STAGE,
        FunctionConst.FUNC_PVE_TOWER,
        FunctionConst.FUNC_PVE_SIEGE,
        FunctionConst.FUNC_PVE_TERRITORY
    ];

    private _listItems: any;
    private _signalRedPointUpdate: any;

    onCreate() {
        this.setSceneSize();
        this._challengeCell.active = false;
        this._listItems = {};

        this.node.name = "ChallengeView";
        this._topBar.setImageTitle('txt_sys_com_maoxian');
        this._topBar.updateUI(TopBarStyleConst.STYLE_COMMON);
        var functionList = this._reorderChallenge();
        this._listMenu.content.removeAllChildren();

        for (var i in functionList) {
            var v = functionList[i];
            var [isOpen, desc, funcInfo] = LogicCheckHelper.funcIsOpened(v);
            var isShow = LogicCheckHelper.funcIsShow(v);
            if (isShow) {
                this._createCell(v, funcInfo);
            }
        }
        // this._listMenu.doLayout();
    }
    onEnter() {
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        for (var k in this._listItems) {
            var v = this._listItems[k];
            v.refreshRedPoint();
        }
        this.scheduleOnce(() => {
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, this.node.name);
        }, 0);
    }
    onExit() {
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
    }
    _reorderChallenge() {

        var FunctionLevel = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL);
        var list = ChallengeView.FUNCTION_LIST;
        list.sort(function (a, b) {
            return FunctionLevel.get(a).level - FunctionLevel.get(b).level;
        });
        return list;
    }
    _createCell(functionId, info) {
        var challengeCell = (cc.instantiate(this._challengeCell) as cc.Node).getComponent(ChallengeCell);
        challengeCell.node.active = true;
        challengeCell.setInitData(functionId, info);
        this._listItems[functionId] = challengeCell;

        var sp = this._listMenu.content.getContentSize();
        this._listMenu.content.setContentSize(sp.width + challengeCell.node.width, sp.height)
        this._listMenu.content.addChild(challengeCell.node);
        this._listMenu.content.x = 0;
    }
    _onEventRedPointUpdate(event, funcId, param) {

        if (funcId == null || FunctionCheck.funcIsOpened(funcId)[0] == false) {
            return;
        }
        if (this._listItems[funcId]) {
            this._listItems[funcId].refreshRedPoint();
        }
    }


}