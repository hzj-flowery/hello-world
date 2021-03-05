const { ccclass, property } = cc._decorator;

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import UIHelper from '../../../utils/UIHelper';

@ccclass
export default class ChapterCityDropHeroCell extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _iconTemplate: CommonIconTemplate = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _iconTopImage: cc.Sprite = null;

    public onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }

    public onEnter() {
    }

    public onExit() {
    }

    public updateUI(type, value, size) {
        this._iconTemplate.unInitUI();
        this._iconTemplate.initUI(type, value, size);
        this._iconTemplate.setTouchEnabled(false);
        this._iconTopImage.node.active = (false);
        var itemParams = this._iconTemplate.getItemParams();
        if (type == TypeConvertHelper.TYPE_HERO) {
            this._showHeroTopImage(value);
        } else if (type == TypeConvertHelper.TYPE_FRAGMENT) {
            if (itemParams.cfg.comp_type == 1) {
                this._showHeroTopImage(itemParams.cfg.comp_value);
            }
        }
    }

    public _showHeroTopImage(heroId) {
        var res = UserDataHelper.getHeroTopImage(heroId)[0];
        if (res) {
            UIHelper.loadTexture(this._iconTopImage, res);
            this._iconTopImage.node.active = true;
            return true;
        }
        return false;
    }
}