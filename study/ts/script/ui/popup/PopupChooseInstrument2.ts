import PopupChooseBase from "./PopupChooseBase";
import { G_SignalManager } from "../../init";
import { SignalConst } from "../../const/SignalConst";
import PopupChooseHeroHelper from "./PopupChooseHeroHelper";
import CommonTabGroup from "../component/CommonTabGroup";
import { handler } from "../../utils/handler";
import { Lang } from "../../lang/Lang";
import PopupChooseInstrumentHelper from "./PopupChooseInstrumentHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupChooseInstrument2 extends PopupChooseBase {
    public static path: string = "common/PopupChooseInstrument2";
    @property({ type: CommonTabGroup, visible: true })
    _nodeTabRoot: CommonTabGroup = null;

    _selectTabIndex: number = 0;

    public onShowFinish() {
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "PopupChooseInstrument2");
    }

    public onCreate() {
        super.onCreate();
        var param = {
            callback: handler(this, this._onTabSelect),
            isVertical: 2,
            textList: [
                Lang.get('hero_transform_country_tab1'),
                Lang.get('hero_transform_country_tab2'),
                Lang.get('hero_transform_country_tab3'),
                Lang.get('hero_transform_country_tab4')
            ]
        };
        this._nodeTabRoot.recreateTabs(param);
        this._nodeTabRoot.setTabIndex(0);
    }

    _onTabSelect(index, sender) {
        index++;
        if (this._selectTabIndex == index) {
            return;
        }
        this._selectTabIndex = index;
        this._updateListView(index);
        return true;
    }

    public updateUI(fromType, callBack, ...args) {
        let data: any[] = null;
        var helpFunc = PopupChooseInstrumentHelper['_FROM_TYPE' + fromType];
        if (helpFunc && typeof (helpFunc) == 'function') {
            data = helpFunc(args);
        }
        this._setData(data, [], args);
        super.updateUI(fromType, callBack);

    }

    _updateListView(index) {
        var data = this._data[index] || [];
        if (data != null) {
            this._listData = [];
            for (let i = 0; i < data.length; i++) {
                this._listData.push(PopupChooseInstrumentHelper.addInstrumentDataDesc(data[i], this._fromType));
            }
            this._listView.setData(this._listData);
        }
    }

    protected _onItemTouch(index) {
        var data = this._listData[index];
        var id = data.getId();
        if (this._callBack) {
            this._callBack(id, this._param, data);
        }
        this.close();
    }
}

