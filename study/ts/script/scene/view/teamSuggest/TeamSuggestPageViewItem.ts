const { ccclass, property } = cc._decorator;

import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar'
import { G_UserData, G_ConfigLoader } from '../../../init';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { assert } from '../../../utils/GlobleFunc';
import { Path } from '../../../utils/Path';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import CommonUI from '../../../ui/component/CommonUI';

@ccclass
export default class TeamSuggestPageViewItem extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _heroPedespal4: cc.Sprite = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _heroAvater4: CommonHeroAvatar = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _heroName4: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _heroPedespal5: cc.Sprite = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _heroAvater5: CommonHeroAvatar = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _heroName5: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _heroPedespal6: cc.Sprite = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _heroAvater6: CommonHeroAvatar = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _heroName6: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _heroPedespal1: cc.Sprite = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _heroAvater1: CommonHeroAvatar = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _heroName1: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _heroPedespal2: cc.Sprite = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _heroAvater2: CommonHeroAvatar = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _heroName2: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _heroPedespal3: cc.Sprite = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _heroAvater3: CommonHeroAvatar = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _heroName3: cc.Label = null;

    onLoad() {
        for (var i = 1; i <= 6; i++) {
            (this['_heroAvater' + i] as CommonHeroAvatar).init();
        }
    }

    updateUI(data) {
        if (!data) {
            return;
        }
        var Hero = G_ConfigLoader.getConfig(ConfigNameConst.HERO);
        this.scheduleOnce(this.waitUpdateUI.bind(this,data,Hero,1),0.1);
    }

    private waitUpdateUI(data,Hero,i):void{
        if(i>6)
        {
            (this['_heroAvater' + 1] as CommonHeroAvatar).setCallBack(function () {
                UIPopupHelper.popupIconDetail(TypeConvertHelper.TYPE_HERO, data['hero' + 1])
            });
            (this['_heroAvater' + 2] as CommonHeroAvatar).setCallBack(function () {
                UIPopupHelper.popupIconDetail(TypeConvertHelper.TYPE_HERO, data['hero' + 2])
            });
            (this['_heroAvater' + 3] as CommonHeroAvatar).setCallBack(function () {
                UIPopupHelper.popupIconDetail(TypeConvertHelper.TYPE_HERO, data['hero' + 3])
            });
            (this['_heroAvater' + 4] as CommonHeroAvatar).setCallBack(function () {
                UIPopupHelper.popupIconDetail(TypeConvertHelper.TYPE_HERO, data['hero' + 4])
            });
            (this['_heroAvater' + 5] as CommonHeroAvatar).setCallBack(function () {
                UIPopupHelper.popupIconDetail(TypeConvertHelper.TYPE_HERO, data['hero' + 5])
            });
            (this['_heroAvater' + 6] as CommonHeroAvatar).setCallBack(function () {
                UIPopupHelper.popupIconDetail(TypeConvertHelper.TYPE_HERO, data['hero' + 6])
            });

            return;
        }
        var heroID = data['hero' + i];
        if (1 == heroID) {
            heroID = G_UserData.getHero().getRoleBaseId();
        }
        var heroConfig = Hero.get(heroID);
      //assert((heroConfig != null, cc.js.formatStr('can not get hero info id = %s', heroID || 'nil'));
        (this['_heroAvater' + i] as CommonHeroAvatar).updateUI(heroID);
        (this['_heroAvater' + i] as CommonHeroAvatar).setTouchEnabled(true);
        if (G_UserData.getHero().isInListWithBaseId(heroID)) {
            (this['_heroPedespal' + i] as cc.Sprite).node.addComponent(CommonUI).loadTexture(Path.getEmbattle('img_embattleherbg_over'));
            (this['_heroAvater' + i] as CommonHeroAvatar).getFlashEntity()[0].getSpine().node.color = (new cc.Color(255, 255, 255));
            
        } else {
            (this['_heroPedespal' + i] as cc.Sprite).node.addComponent(CommonUI).loadTexture(Path.getEmbattle('img_embattleherbg_nml'));
            (this['_heroAvater' + i] as CommonHeroAvatar).getFlashEntity()[0].getSpine().node.color = (new cc.Color(150, 150, 150))
        }
        (this['_heroName' + i] as cc.Label).string = (heroConfig.name);
        var p = i+1;
        this.scheduleOnce(this.waitUpdateUI.bind(this,data,Hero,p),0.1);
    }


}