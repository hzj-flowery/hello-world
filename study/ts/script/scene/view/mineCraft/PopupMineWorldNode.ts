import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import CommonUI from "../../../ui/component/CommonUI";
import { G_UserData, G_Prompt } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { MineCraftData } from "../../../data/MineCraftData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PopupMineWorldNode extends cc.Component {

    @property({
        type: cc.Button,
        visible: true
    })
    _imageMine: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageGuildBG: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGuild: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageFight: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageClose: cc.Sprite = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _imageNodeName: cc.Button = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;


    private _districtData:any;
    setInitData(districtData) {
        this._districtData = districtData;
        this._init();
    }
    _init() {

        // this._imageMine.node.on(cc.Node.EventType.TOUCH_END,handler(this, this._onPanelClick));
        // this._imageMine.setTouchEnabled(false);
        this._imageGuildBG.node.active = (false);
        this._imageFight.node.active = (false);
        this._imageClose.node.active = (false);
        // this._imageNodeName.setTouchEnabled(false);
        // this._panelTouch.setTouchEnabled(false);
        this._refreshData();
    }
    _refreshData() {
        var config = this._districtData.getConfigData();
        // this._imageNodeName.ignoreContentAdaptWithSize(true);
        var districtImg = Path.getMineNodeTxt(config.district_name_txt);
        this._imageNodeName.node.addComponent(CommonUI).loadTexture(districtImg);
        // this._imageMine.ignoreContentAdaptWithSize(true);
        var iconImg = Path.getMineImage(config.district_icon);
        this._imageMine.node.addComponent(CommonUI).loadTexture(iconImg);
        if (this._districtData.isSeniorDistrict()) {
            if (!this._districtData.isOpen()) {
                this._imageClose.node.active = (true);
            } else if (this._districtData.getGuildId() == 0) {
                this._imageFight.node.active = (true);
            } else {
                this._imageGuildBG.node.active = (true);
                this._textGuild.string = (this._districtData.getGuildName());
            }
        }
    }
    getId() {
        return this._districtData.getId();
    }
    getPosition() {
        return this.node.getPosition();
    }
    setBright(isChooseBorn) {
        // this._imageMine.setTouchEnabled(false);
        // if (isChooseBorn) {
        //     this._imageMine.setBright(true);
        //     this._imageNodeName.setBright(true);
        // } else {
        //     if (!this._districtData.isDistrictCanReborn()) {
        //         this._imageMine.setBright(false);
        //         this._imageNodeName.setBright(false);
        //     } else {
        //         this._imageMine.setTouchEnabled(true);
        //     }
        // }
    }
    _onPanelClick() {
        // var bornId = G_UserData.getMineCraftData().getBornDistrictId();
        // if (bornId == this._districtData.getId()) {
        //     G_Prompt.showTip(Lang.get('mine_already_born'));
        //     return;
        // }
        // G_UserData.getMineCraftData().c2sChangeMineGuildBorn(this._districtData.getId());
    }
}