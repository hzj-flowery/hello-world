import { SignalConst } from "../../const/SignalConst";
import { G_SignalManager } from "../../init";
import { Lang } from "../../lang/Lang";
import { handler } from "../../utils/handler";
import { Path } from "../../utils/Path";
import CommonIconNameNode from "../component/CommonIconNameNode";
import CommonNormalSmallPop2 from "../component/CommonNormalSmallPop2";
import PopupBase from "../PopupBase";
const {ccclass, property} = cc._decorator;

@ccclass
export default class PopupReward extends PopupBase{

    private _title:string;
    private _awardList:Array<any>;
    @property({
        type: CommonNormalSmallPop2,
        visible: true
    })
    _commonNodeBk:CommonNormalSmallPop2 = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDetail:cc.Label = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listViewDrop:cc.ScrollView = null;

    

    protected preloadResList = [
        {path:Path.getCommonPrefab("CommonIconNameNode"),type:cc.Prefab}
    ]
    

    setInitData(title, isClickOtherClose, isNotCreateShade) {
        this._title = title || Lang.get('common_btn_help');
        this.node.name = ('PopupReward');
    }
    onCreate() {
        this._commonNodeBk.setTitle(this._title);
        this._commonNodeBk.addCloseEventListener(handler(this, this.onBtnCancel));
    }
    setItemsMargin(margin) {
        // this._listViewDrop.setItemsMargin(margin);
    }
    setDetailText(text) {
        this._textDetail.string = (text);
        this._textDetail.node.active = (true);
    }
    _createCellEx(award) {
        var widget = new cc.Node();
        var uiNode = (cc.instantiate(cc.resources.get(Path.getCommonPrefab("CommonIconNameNode"))) as cc.Node).getComponent(CommonIconNameNode);
        uiNode.updateUI(award.type, award.value, award.size);
        uiNode.showItemBg(true);
        uiNode.setTouchEnabled(true);
        var panelSize = uiNode.getPanelSize();
        widget.setContentSize(panelSize);
        widget.addChild(uiNode.node);
        return widget;
    }
    _updateAwards(awards) {
        if(awards.length<=0)
        {
            return;
        }
        this._listViewDrop.content.removeAllChildren();
        this._listViewDrop.content.removeComponent(cc.Layout);
        var totalLen = 0;
        this._listViewDrop.content.width = this._listViewDrop.node.width;
        for (var i = 1; i <= awards.length; i++) {
            var award = awards[i-1];
            var widget = this._createCellEx(award);
            this._listViewDrop.content.addChild(widget);
            totalLen = totalLen+ widget.width;
        }

        var childs = this._listViewDrop.content.children;
        var isOu = awards.length%2==0;
        var dis = childs[0].width+10;
        if(isOu)
        {
            //偶数
            for(var j = 0;j<childs.length;j=j+2)
            {
                childs[j].x = -[(j+2)/2*dis-dis/2];
                childs[j+1].x = (j+2)/2*dis-dis/2;
            }
        }
        else
        {
            childs[0].x = 0;
            //奇数
            for(var j = 1;j<childs.length;j=j+2)
            {
                childs[j].x = (j+1)/2*dis;
                childs[j+1].x = -(j+1)/2*dis;
            }
        }
    }
    onBtnCancel() {
        this.close();
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index, t) {
    }
    updateUI(awards) {
        if(typeof(awards)!="object")
        {
            awards = [];
        }
        this._awardList = awards;
        this._updateAwards(awards);
    }
    onEnter() {
    }
    onExit() {
    }
    onShowFinish() {
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, this.node.name);
    }
}