const {ccclass, property} = cc._decorator;

import CommonPageItem from '../../../ui/component/CommonPageItem'
import CommonHeroCountryFlag from '../../../ui/component/CommonHeroCountryFlag'
import CommonInstrumentAvatar from '../../../ui/component/CommonInstrumentAvatar';
import CommonButtonLevel1Normal from '../../../ui/component/CommonButtonLevel1Normal';
import CommonInstrumentProperty from '../../../ui/component/CommonInstrumentProperty';
import { G_SceneManager, G_UserData } from '../../../init';
import PopupBase from '../../../ui/PopupBase';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { InstrumentUnitData } from '../../../data/InstrumentUnitData';
import { assert } from '../../../utils/GlobleFunc';
import { handler } from '../../../utils/handler';
import { Lang } from '../../../lang/Lang';
import PopupItemGuider from '../../../ui/PopupItemGuider';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';

@ccclass
export default class PopupInstrumentDetail extends PopupBase {

    @property({
        type: cc.Label,
        visible: true
    })
    _textTitle: cc.Label = null;

    @property({
        type: CommonHeroCountryFlag,
        visible: true
    })
    _fileNodeCountryFlag: CommonHeroCountryFlag = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _heroStage: cc.Node = null;

    @property({
        type: CommonInstrumentAvatar,
        visible: true
    })
    _fileNodeAvatar: CommonInstrumentAvatar = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPotential: cc.Label = null;

    @property({
        type: CommonButtonLevel1Normal,
        visible: true
    })
    _btnWayGet: CommonButtonLevel1Normal = null;

    @property({
        type: CommonInstrumentProperty,
        visible: true
    })
    _detailWindow: CommonInstrumentProperty = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonClose: cc.Button = null;

    private _unitData:any;//InstrumentUnitData
    private _type:number;
    private _value:number;
    private _limitLevel:number;

    public static path:string = "instrument/PopupInstrumentDetail";

    onEnter(){
        // var clickEventHandler = new cc.Component.EventHandler();
        // clickEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
        // clickEventHandler.component = "PopupInstrumentDetail";// 这个是代码文件名
        // clickEventHandler.handler = "_onBtnClose";
        // this._buttonClose.clickEvents.push(clickEventHandler);

        this._btnWayGet.addClickEventListenerEx(handler(this,this._onBtnWayGetClicked));

        this._detailWindow.updateUI(this._unitData);
        this._btnWayGet.setString(Lang.get('way_type_goto_get'));
        this._fileNodeCountryFlag.updateUI(TypeConvertHelper.TYPE_INSTRUMENT, this._unitData.getBase_id());
        this._fileNodeAvatar.updateUI(this._unitData.getBase_id());
        this._updateColor();
    }
    public init(type, value, isSelf?, limitLevel?){//before onLoad
        var convertData = TypeConvertHelper.convert(type, value);
        if (convertData == null) {
            return;
        }
        if (type == TypeConvertHelper.TYPE_INSTRUMENT && isSelf) {
            var unitData = G_UserData.getInstrument().getInstrumentDataWithId(value);
            this._unitData = unitData;
        } else if (type == TypeConvertHelper.TYPE_INSTRUMENT) {
            let unitData = G_UserData.getInstrument().createTempInstrumentUnitData({ baseId: value });
            this._unitData = unitData;
        } else if (type == TypeConvertHelper.TYPE_FRAGMENT) {
            var baseId = convertData.cfg.comp_value;
            let unitData = G_UserData.getInstrument().createTempInstrumentUnitData({ baseId: baseId });
            this._unitData = unitData;
        }
        if (this._unitData == null) {
          //assert((false, 'can\'t find instrument by id : ' + value);
        }
        this._type = type;
        this._value = value;
        this._limitLevel = limitLevel;

    }
    onBtnClose() {
        this.close();
    }
    private _onBtnWayGetClicked(){
        //var PopupItemGuider = new (require('PopupItemGuider'))(Lang.get('way_type_get'));
        UIPopupHelper.popupItemGuiderByType(this._type, this._value, Lang.get("way_type_get"));
        //PopupItemGuider.updateUI(this._type, this._value);
        //PopupItemGuider.openWithAction();
    }
    _updateColor() {
        this._textPotential.node.active = (false);
    }

}
