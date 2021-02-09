import PopupChooseBase from "./PopupChooseBase";
import { G_SignalManager } from "../../init";
import { SignalConst } from "../../const/SignalConst";
import PopupChooseHeroHelper from "./PopupChooseHeroHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupChooseHero extends PopupChooseBase {

    public static path: string = "common/PopupChooseHero";

    public onShowFinish() {
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "PopupChooseHero");
    }

    public updateUI(fromType, callBack, ...args) {
        let data: any[] = null;
        let listData: any[] = null;
        var helpFunc = PopupChooseHeroHelper['_FROM_TYPE' + fromType];
        if (helpFunc && typeof (helpFunc) == 'function') {
            data = helpFunc(args);
        }
        if (data != null) {
            listData = [];
            listData.length = data.length;
            // for (let i = 0; i < data.length; i++) {
            //     listData.push(PopupChooseHeroHelper.addHeroDataDesc(data[i], fromType, i));
            // }
        }
        this._setData(data, listData, args);
        super.updateUI(fromType, callBack);
    }

    addDataDesc(data, fromType, i){
        return PopupChooseHeroHelper.addHeroDataDesc(data, fromType, i)
    }
}

// import PopupBase from "./PopupBase";
// import PopupChooseHeroHelper from "./PopupChooseHeroHelper";
// import { G_SignalManager } from "../init";
// import { handler } from "../utils/handler";
// import { SignalConst } from "../const/SignalConst";
// import { assert } from "../utils/GlobleFunc";
// import CommonNormalLargePop from "./component/CommonNormalLargePop";
// import CommonNormalSmallPop from "./component/CommonNormalSmallPop";
// import CommonListView from "./component/CommonListView";


// const {ccclass, property} = cc._decorator;

// @ccclass
// export default class PopupChooseHero extends PopupBase{


//     @property({
//         type: CommonNormalLargePop,
//         visible: true
//     })
//     _commonNodeBk: CommonNormalLargePop = null;

//     @property({
//         type: cc.ScrollView,
//         visible: true
//     })
//     _listView: cc.ScrollView = null;

//     @property({
//         type: CommonListView,
//         visible: true
//     })
//     _commListView: CommonListView = null;

//     @property({
//         type: cc.Node,
//         visible: true
//     })
//     _popupChooseHeroCell: cc.Node = null;







//     private _herosData:any;
//     private _fromType:number;
//     private _callBack:any;
//     private _param:Array<any> = [];
//     private _count:number;



//     public static path:string = "common/PopupChooseHero";

//     setTitle(title) {
//         this._commonNodeBk.setTitle(title);
//     }
//     onCreate() {
//         this._commonNodeBk.addCloseEventListener(handler(this, this.onButtonClose));
//     }
//     onEnter() {

//         var scrollViewParam = {
//             template: this._popupChooseHeroCell,
//         };

//         this._commListView.init(scrollViewParam.template, handler(this, this._onItemUpdate), handler(this, this._onItemTouch));
//         this._commListView.setData(this._count);
//     }
//     onExit() {
//     }
//     onShowFinish() {
//         G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP,"PopupChooseHero");
//     }
//     updateUI(fromType, callBack,...vars) {
//         this._fromType = fromType;
//         this._callBack = callBack;
//         this._param = vars;
//         var helpFunc = PopupChooseHeroHelper['_FROM_TYPE' + this._fromType];
//         if (helpFunc && typeof(helpFunc) == 'function') {
//             this._herosData = helpFunc(this._param);
//         }
//       //assert((this._herosData, 'self._herosData can not be null');
//         this._count = Math.ceil(this._herosData.length / 2);
//     }
//     _onItemUpdate(item, index,type) {

//         var startIndex = index * 2 + 0;
//         var endIndex = startIndex + 1;

//         var data = [];

//         if (this._herosData[startIndex]) {
//             var herodata = this._herosData[startIndex];
//             data.push(PopupChooseHeroHelper.addHeroDataDesc(herodata, this._fromType, index, 1));
//         }
//         if (this._herosData[endIndex]) {
//             var herodata = this._herosData[endIndex];
//             data.push(PopupChooseHeroHelper.addHeroDataDesc(herodata, this._fromType, index, 2));
//         }


//         // var t = data[0].data;
//         // var p = t.getBase_id();
//         item.updateItem(index, data.length>0?data:null,type);

//     }
//     _onItemSelected(item, index) {
//     }
//     _onItemTouch(index, t) {
//         var heroData = this._herosData[index * 2 + t-1];
//         var heroId = heroData.getId();
//         if (this._callBack) {
//             this._callBack(heroId, this._param, heroData);
//         }
//         this.close();
//     }
//     onButtonClose() {
//         this.close();
//     }
// }