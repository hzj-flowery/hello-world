const { ccclass, property } = cc._decorator;

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { Colors } from '../../../init';
import UIHelper from '../../../utils/UIHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { UnitStatisticsData } from '../../../fight/report/UnitStatisticsData';
import { UnitPetStatisticsData } from '../../../fight/report/UnitPetStatisticsData';
import { StatisticsData } from '../../../fight/report/StatisticsData';

@ccclass
export default class PopupStatisticsCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBase: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _panel1: cc.Sprite = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _icon1: CommonIconTemplate = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _panel2: cc.Sprite = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _icon2: CommonIconTemplate = null;

    public static TYPE_DAMAGE = 1;
    public static TYPE_FEATURE = 2;
    private _data1: UnitStatisticsData;
    private _data2: UnitStatisticsData;
    private _maxDamage1;
    private _maxDamage2;
    private _isPet;

    init(data1, data2, maxDamage1, maxDamage2, isPet) {
        this._data1 = data1;
        this._data2 = data2;
        this._maxDamage1 = maxDamage1;
        this._maxDamage2 = maxDamage2;
        this._isPet = isPet;
    }
    onInit() {
        var size = this._panelBase.getContentSize();
        this.node.setContentSize(size);
    }

    onCreate() {
        if (!this._data1) {
            this._panel1.node.active = (false);
        } else {
            if (this._isPet) {
                this._initData(1);
            }
            else {
                this._initHeroData(1);
            }
        }
        if (!this._data2) {
            this._panel2.node.active = (false);
        } else {
            if (this._isPet) {
                this._initData(2);
            }
            else {
                this._initHeroData(2);
            }
        }
        if (!this._isPet) {
            this.refreshData(PopupStatisticsCell.TYPE_DAMAGE);
        }
    }
    _initHeroData(index) {
        var panel: cc.Node = this['_panel' + index].node;
        var data: UnitStatisticsData = this['_data' + index];
        var icon: CommonIconTemplate = this['_icon' + index];
        var heroConfig = data.getConfigData();
        var name = panel.getChildByName('name').getComponent(cc.Label);
        name.string = (data.getName());
        var officerLevel = data.getOfficerLevel();
        if (data.isPlayer()) {
            name.node.color = (Colors.getOfficialColor(officerLevel));
            UIHelper.updateTextOfficialOutline(name.node, officerLevel);
        } else {
            name.node.color = (Colors.getColor(data.getColor()));
        }
        var qualityColor = data.getConfigData().color;
        if (qualityColor == 7 ||  data.getColor()==7 ) {
            UIHelper.enableOutline(name, Colors.getColorOutline(7), 2);
        }
        icon.initUI(TypeConvertHelper.TYPE_HERO, heroConfig.id);
        var heroIcon = icon.getIconTemplate();
        heroIcon.updateUI(heroConfig.id, 1, data.getLimit(), data.getLimitRed());
        if (data.isAlive()) {
            var alive = panel.getChildByName('alive');
            alive.active = (true);
        } else {
            var die = panel.getChildByName('die');
            die.active = (true);
        }
    }
    _initData(index) {
        var data: UnitPetStatisticsData = this['_data' + index];
        if (!data) {
            return;
        }
        var panel: cc.Node = this['_panel' + index].node;
        var icon: CommonIconTemplate = this['_icon' + index];
        var petConfig = data.getConfigData();
        icon.initUI(TypeConvertHelper.TYPE_PET, petConfig.id);
        icon.setTouchEnabled(false);
        var panelFeature = panel.getChildByName('PanelFeature');
        panelFeature.active = (true);
        var barBG = panel.getChildByName('ImageBarBG');
        barBG.active = (false);
        var name = panel.getChildByName('name').getComponent(cc.Label);
        name.string = (petConfig.name);
        name.node.color = (Colors.getColor(petConfig.color));
        var statistics: any[] = data.getStatistics();
        statistics.sort(function (a, b) {
            return a.getType() - b.getType();
        });
        for (var i = 1; i <= 3; i++) {
            var basePanel = panelFeature.getChildByName('FeatureBG' + i);
            if (statistics[i - 1]) {
                this._createSingleFeatuer(basePanel, statistics[i - 1]);
            }
        }
    }
    refreshData(type) {
        if (type == PopupStatisticsCell.TYPE_DAMAGE) {
            this._refreshDamage();
        } else if (type == PopupStatisticsCell.TYPE_FEATURE) {
            this._refreshFeature();
        }
    }
    _refreshDamage() {
        for (var i = 1; i <= 2; i++) {
            var data:UnitStatisticsData = this['_data' + i];
            if (data) {
                var panel: cc.Node = this['_panel' + i].node;
                var barBG = panel.getChildByName('ImageBarBG');
                barBG.active = (true);
                var panelFeature = panel.getChildByName('PanelFeature');
                panelFeature.active = (false);
                var damage = data.getStatisticsDamage();
                var text = barBG.getChildByName('textDamage').getComponent(cc.Label);
                text.string = (damage).toString();
                text.node.active = (true);
                var bar = barBG.getChildByName('bar').getComponent(cc.ProgressBar);
                var camp = Math.floor(data.getStageId() / 100);
                var maxDamage = this['_maxDamage' + camp];
                // var percent = damage / maxDamage * 100;
                var percent = damage / maxDamage;
                bar.progress = (percent);
            }
        }
    }
    _refreshFeature() {
        for (var i = 1; i <= 2; i++) {
            var data:UnitStatisticsData = this['_data' + i];
            if (data) {
                var panel: cc.Node = this['_panel' + i].node;
                var barBG = panel.getChildByName('ImageBarBG');
                barBG.active = (false);
                var panelFeature = panel.getChildByName('PanelFeature');
                panelFeature.active = (true);
                var statistics: any[] = data.getStatistics();
                statistics.sort(function (a, b) {
                    return a.getType() - b.getType();
                });
                for (var j = 1; j <= 3; j++) {
                    var basePanel = panelFeature.getChildByName('FeatureBG' + j);
                    basePanel.active = false;
                    if (statistics[j - 1]) {
                        this._createSingleFeatuer(basePanel, statistics[j - 1]);
                    }
                }
            }
        }
    }
    _createSingleFeatuer(panel: cc.Node, data:StatisticsData) {
        panel.active = (true);
        var description: string = data.getDescription();
        var strArry = description.split('|');
        panel.getChildByName('TextFeature').getComponent(cc.Label).string = (strArry[1 - 1]);
        panel.getChildByName('TextCount').getComponent(cc.Label).string = (strArry[2 - 1]);
        panel.getChildByName('TextNum').getComponent(cc.Label).string = (data.getCount().toString());
    }
}