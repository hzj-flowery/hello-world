import CommonUI from "./CommonUI";
import { Path } from "../../utils/Path";
import UIHelper from "../../utils/UIHelper";
import { G_ConfigLoader } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonHeroCountry2 extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_115: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_116: cc.Sprite = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _panel_Touch: cc.Button = null;

    private _callBack: any;
    private _heroId;
    onLoad(){
        UIHelper.addEventListener(this.node, this._panel_Touch, 'CommonHeroCountry2', 'onClickPanelTouch');
        this._heroId = 0;
    }
    showSelected(heroId) {
        this._image_115.node.active = (this._heroId != heroId);
        this._image_116.node.active = (this._heroId == heroId);
    }
    show(isShow) {
        if (this.node) {
            this.node.active = (isShow);
        }
    }
    private _tagHeroId;
    updateHero(index, heroId) {
        var heroResConfigInfo = G_ConfigLoader.getConfig(ConfigNameConst.HERO_RES).get(heroId);
        var country2ImageResNormal = heroResConfigInfo.gold_hero_small + '_nml';
        var country2ImageResSelected = heroResConfigInfo.gold_hero_small + '_down';
        this._heroId = heroId;
        // this._panel_Touch.setTag(heroId);
        this._tagHeroId = heroId;
        this._image_115.node.addComponent(CommonUI).loadTexture(Path.getGoldHero(country2ImageResNormal));
        this._image_116.node.addComponent(CommonUI).loadTexture(Path.getGoldHero(country2ImageResSelected));
    }
    updateCountry(country) {
        var country2ImageResNormal = {
            1: 'img_hero_01_nml',
            2: 'img_hero_02_nml',
            3: 'img_hero_03_nml',
            4: 'img_hero_04_nml'
        };
        var country2ImageResSelected = {
            1: 'img_hero_01_down',
            2: 'img_hero_02_down',
            3: 'img_hero_03_down',
            4: 'img_hero_04_down'
        };
        this._panel_Touch.node.name = (country).toString();
        this._image_115.node.addComponent(CommonUI).loadTexture(Path.getGoldHero(country2ImageResNormal[country]));
        this._image_116.node.addComponent(CommonUI).loadTexture(Path.getGoldHero(country2ImageResSelected[country]));
    }
    addClickEventListenerEx(callback) {
        this._callBack = callback;
    }

    onClickPanelTouch(event): void {
        if (this._callBack) this._callBack(this._panel_Touch,this._tagHeroId);
    }

}
