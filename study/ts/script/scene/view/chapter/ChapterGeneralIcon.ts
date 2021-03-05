const { ccclass, property } = cc._decorator;

import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar'
import { handler } from '../../../utils/handler';
import { Colors, G_SceneManager } from '../../../init';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';
import PopupGeneralDetail from './PopupGeneralDetail';

@ccclass
export default class ChapterGeneralIcon extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeBgEffect: cc.Node = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _nodeHero: CommonHeroAvatar = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelCity: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeInfo: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageNameBG: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _stageName: cc.Label = null;

    private static ICON_SCALE = 0.8;
    private static COLOR = 5;		//默认品质
    private _data;
    private _configData;
    public init(data) {

        this._data = data;
        this._configData = data.getConfigData();
        this._panelCity.on(cc.Node.EventType.TOUCH_END, handler(this, this._onButtonChapterClick));
        this._nodeHero.init();
    }

    public onLoad() {
        this.node.setPosition(this._configData.position_x, this._configData.position_y);
        this._updateHeroAvatar();
    }

    private _updateHeroAvatar() {
        this._nodeHero.updateUI(this._configData.show_res);
        this._nodeHero.setScale(ChapterGeneralIcon.ICON_SCALE);
        this._nodeHero.turnBack();
        this._stageName.string = (this._configData.name);
        this._stageName.node.color = (Colors.getColor(ChapterGeneralIcon.COLOR));
        UIHelper.enableOutline(this._stageName, Colors.getColorOutline(ChapterGeneralIcon.COLOR), 1);
        var nameWidth = this._stageName.node.getContentSize().width;
        this._imageNameBG.node.setContentSize(nameWidth + 65, 33);
        var height = this._nodeHero.getHeight();
        this._nodeInfo.y = (height);
    }

    public getId() {
        return this._data.getId();
    }

    public refresh() {
    }

    private _popupDetail() {
        G_SceneManager.openPopup(Path.getPrefab("PopupGeneralDetail", "chapter"), (popupGeneralDetail: PopupGeneralDetail) => {
            popupGeneralDetail.init(this._data);
            popupGeneralDetail.openWithAction();
        })
    }

    private _onButtonChapterClick(sender: cc.Event.EventTouch) {
        var offsetX = Math.abs(sender.getLocation().x - sender.getStartLocation().x);
        var offsetY = Math.abs(sender.getLocation().y - sender.getStartLocation().y);
        if (offsetX < 20 && offsetY < 20) {
            this._popupDetail();
        }
    }
}