const { ccclass, property } = cc._decorator;

import HorseKarmaCellIcon from './HorseKarmaCellIcon'

import HorseKarmaCellTitle from './HorseKarmaCellTitle'
import { G_UserData } from '../../../init';
import HorseConst from '../../../const/HorseConst';
import { handler } from '../../../utils/handler';
import { TextHelper } from '../../../utils/TextHelper';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';

@ccclass
export default class HorseKarmaCell extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _resourceNode: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _item1: cc.Node = null;

    @property({ type: HorseKarmaCellTitle, visible: true })
    _fileNodeTitle1: HorseKarmaCellTitle = null;

    @property({ type: cc.Sprite, visible: true })
    _imageTitle1: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textTitle1: cc.Label = null;

    @property({ type: HorseKarmaCellIcon, visible: true })
    _fileNodeIcon1_1: HorseKarmaCellIcon = null;

    @property({ type: HorseKarmaCellIcon, visible: true })
    _fileNodeIcon1_2: HorseKarmaCellIcon = null;

    private COLOR_KARMA = [
        [
            cc.color(255, 222, 109),
            cc.color(212, 77, 8, 255)
        ],
        [
            cc.color(243, 255, 43),
            cc.color(100, 189, 13, 255)
        ]
    ];
    private ICON_POS = {
        1: [cc.v2(152, 131)],
        2: [
            cc.v2(105, 131),
            cc.v2(199, 131)
        ]
    };
    private ATTR_NUM = 4

    private _karmaId;
    private _index;
    private _customCallback;

    onLoad() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }

    public updateUI(index, data) {
        if (index != null) {
            this._index = index;
        }
        if (data == null) {
            return;
        }
        var photoId = data.photoId;
        var state = data.state;
        var karmaData = G_UserData.getHorse().getHorsePhotoDetailInfo(photoId);
        this._fileNodeTitle1.node.name = ('HorseKarmaCellTitle' + photoId);
        this._fileNodeTitle1.init(handler(this, this._onButtonActive));
        this._karmaId = photoId;
        this._item1.active = (true);
        var isCanActivate = false;
        var isActivated = false;
        if (state == HorseConst.HORSE_PHOTO_VALID) {
            isCanActivate = true;
        }
        if (state == HorseConst.HORSE_PHOTO_DONE) {
            isActivated = true;
        }
        var visibleCount = 2;
        this._fileNodeIcon1_1.init();
        this._fileNodeIcon1_2.init();
        for (var i = 1; i <= 2; i++) {
            var horseId = karmaData['horse' + i];
            var horseValid = G_UserData.getHandBook().isHorseHave(horseId);
            this["_fileNodeIcon1_" + i].updateIcon(horseId, !horseValid);
        }
        var posInfo: cc.Vec2[] = this.ICON_POS[visibleCount];
        if (posInfo) {
            for (var i = 1; i <= visibleCount; i++) {
                var pos = posInfo[i-1];
                this["_fileNodeIcon1_" + i].node.setPosition(pos);
            }
        }
        var desInfo = [];
        for (var i = 1; i <= this.ATTR_NUM; i++) {
            var attrType = karmaData['attribute_type_' + i];
            if (attrType != 0) {
                var attrValue = karmaData['attribute_value_' + i];
                var [name, value] = TextHelper.getAttrBasicText(attrType, attrValue);
                var attrStr = name + (':' + value);
                desInfo.push(attrStr);
            }
        }
        this._fileNodeTitle1.setDes(desInfo, isActivated, isCanActivate);
        var titleBgRes = isActivated && Path.getFetterRes('img_namebg_light') || Path.getFetterRes('img_namebg_nml');
        var titleColor = isActivated && this.COLOR_KARMA[2 - 1][1 - 1] || this.COLOR_KARMA[1 - 1][1 - 1];
        var titleOutline = isActivated && this.COLOR_KARMA[2 - 1][2 - 1] || this.COLOR_KARMA[1 - 1][2 - 1];
        this._textTitle1.string = (karmaData.name);
        UIHelper.loadTexture(this._imageTitle1, titleBgRes);
        this._textTitle1.node.color = (titleColor);
        UIHelper.enableOutline(this._textTitle1, titleOutline, 2);
    }

    public setCustomCallback(customCallback: Function) {
        this._customCallback = customCallback;
    }

    private _onButtonActive(id) {
        if (this._customCallback) {
            this._customCallback(this._index);
        }
    }

    public getKarmaId() {
        return this._karmaId;
    }
}