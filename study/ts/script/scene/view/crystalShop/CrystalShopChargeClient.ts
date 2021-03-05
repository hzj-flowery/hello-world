import ViewBase from "../../ViewBase";
import { Lang } from "../../../lang/Lang";
import { G_EffectGfxMgr, G_UserData } from "../../../init";
import CommonCustomListViewEx from "../../../ui/component/CommonCustomListViewEx";
import { handler } from "../../../utils/handler";
import { FunctionConst } from "../../../const/FunctionConst";
import { WayFuncDataHelper } from "../../../utils/data/WayFuncDataHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CrystalShopChargeClient extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _page1: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _page2: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDesc: cc.Label = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listView: CommonCustomListViewEx = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _effectNode: cc.Node = null;

    @property(cc.Prefab)
    CrystalChargeCell:cc.Prefab = null;


    static BoxImageConfig = [
        [
            'baoxiangtong_guan',
            'baoxiangtong_kai',
            'baoxiangtong_kong'
        ],
        [
            'baoxiangyin_guan',
            'baoxiangyin_kai',
            'baoxiangyin_kong'
        ],
        [
            'baoxiang_jubaopeng_guan',
            'baoxiang_jubaopeng_kai',
            'baoxiang_jubaopeng_kong'
        ],
        [
            'baoxiangjin_guan',
            'baoxiangjin_kai',
            'baoxiangjin_kong'
        ]
    ];
    _pageIndex: any;
    _showData: any[];
    loadIndex:number = 0;
    scheduleHandler:any;

    ctor(pageIndex) {
        this._pageIndex = pageIndex;
    }
    onCreate() {
        this._initListView();
        if (this._pageIndex == 1) {
            this._page1.active = (true);
            this._page2.active = (false);
            this._textDesc.string = (Lang.get('lang_crystal_shop_lable_desc1'));
        } else if (this._pageIndex == 2) {
            this._page1.active = (false);
            this._page2.active = (true);
            this._textDesc.string = (Lang.get('lang_crystal_shop_lable_desc2'));
            G_EffectGfxMgr.createPlayMovingGfx(this._effectNode, 'moving_shuijingshangdian', null, null, false);
        }
    }
    onEnter() {
    }
    onExit() {
    }
    _refreshList() {
        //this._listView.resize(this._showData.length, 2, true);
        this.loadIndex = 0;
        if(this.scheduleHandler){
            this.unschedule(this.scheduleHandler);
            this.scheduleHandler = null;
        }
        this._listView.clearAll();
        this.scheduleHandler = handler(this,this.loadListView);
        this.schedule(this.scheduleHandler, 0.1);
        this.loadListView();
    }
    loadListView(){
        this.loadIndex++;
        let total = this._showData.length;
        if(this.loadIndex >= total){
            if(this.scheduleHandler){
                this.unschedule(this.scheduleHandler);
                this.scheduleHandler = null;
            }
            this.loadIndex = total;
        }
        this._listView.resize(this.loadIndex, 2, false);
    }
    _initListView() {
        this._listView.setTemplate(this.CrystalChargeCell);
        this._listView.setCallback(handler(this, this._onListViewItemUpdate), handler(this, this._onListViewItemSelected));
        this._listView.setCustomCallback(handler(this, this._onListViewItemTouch));
    }
    _onListViewItemUpdate(item, index) {
        var data = this._showData[index];
        item.updateUI(data);
    }
    _onListViewItemSelected(item, index) {
    }
    _onListViewItemTouch(index, params) {
        var data = this._showData[index];
        if (data) {
            if (data.canGet(data.getPage())) {
                G_UserData.getCrystalShop().c2sGetShopCrystalAward(data.getId());
            } else {
                var funcId = data.getIs_function();
                if (funcId == 0) {
                    funcId = FunctionConst.FUNC_RECHARGE;
                }
                WayFuncDataHelper.gotoModuleByFuncId(funcId);
            }
        }
    }
    refreshClient() {
        this._showData = G_UserData.getCrystalShop().getShowDatas(this._pageIndex);
        this._refreshList();
    }
}
