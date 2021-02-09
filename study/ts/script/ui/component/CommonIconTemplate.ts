import CommonIconBase from "./CommonIconBase";
import { ComponentIconHelper } from "./ComponentIconHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonIconTemplate extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTemplate: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_doubleTips: cc.Sprite = null;


    _iconTemplate;



    getIconTemplate() {
        this._checkInit();
        return this._iconTemplate;
    }
    unInitUI() {
        if (this._iconTemplate) {
            this._iconTemplate.node.destroy();
            this._iconTemplate = null;
        }
    }
    isInit() {
        return this._iconTemplate != null;
    }
    initUI(iconType, iconValue?, iconSize?) {
        if (this._image_doubleTips) {
            this._image_doubleTips.node.active = (false);
            this._image_doubleTips.node.z = (10);
        }
        this.setImageTemplateVisible(false);
        if (this._iconTemplate == null) {
            var icon:cc.Node= ComponentIconHelper.createIcon(iconType, iconValue, iconSize);
            this._iconTemplate = icon.getComponent(CommonIconBase);
            this.node.addChild(icon);
        }else {
            this._iconTemplate._type = iconType;
            this._iconTemplate.updateUI(iconValue, iconSize);
        }
    }
    _checkInit() {
        console.assert(this._iconTemplate, 'self._iconTemplate must be inited');
    }

    showDoubleTips (flag) {
        if (this._image_doubleTips) {
            this._image_doubleTips.node.active = (flag);
        }
    }

    updateUI(value, size) {
        this._checkInit();
        this._iconTemplate.updateUI(value, size);
    }
    loadColorBg(res) {
        this._checkInit();
        this._iconTemplate.loadColorBg(res);
    }
    loadIcon(res) {
        this._checkInit();
        this._iconTemplate.loadIcon(res);
    }
    appendUI(node) {
        this._checkInit();
        this._iconTemplate.appendUI(node);
    }
    getType() {
        this._checkInit();
        return this._iconTemplate.getType();
    }
    getItemParams() {
        this._checkInit();
        return this._iconTemplate.getItemParams();
    }
    setCount(size) {
        this._checkInit();
        this._iconTemplate.setCount(size);
    }
    setUniqueId(id) {
        if (this._iconTemplate.getItemParams() != null) {
            this._iconTemplate.getItemParams().uniqueId = id;
        }
    }
    showName(needShow, fixWidth) {
        this._checkInit();
        this._iconTemplate.showName(needShow, fixWidth);
    }
    setName(nameStr) {
        this._checkInit();
        console.warn('CommonIconTemplate:setName   ' + nameStr);
        this._iconTemplate.setName(nameStr);
    }
    showCollect(needShow) {
        this._checkInit();
        this._iconTemplate.showCollect(needShow);
    }
    setIconMask(needMask) {
        this._checkInit();
        this._iconTemplate.setIconMask(needMask);
    }
    setIconDark(needDark) {
        this._checkInit();
        this._iconTemplate.setIconDark(needDark);
    }
    setCallBack(callback) {
        this._checkInit();
        this._iconTemplate.setCallBack(callback);
    }
    setTouchEnabled(enabled) {
        this._checkInit();
        this._iconTemplate.setTouchEnabled(enabled);
    }
    setSwallowTouchesEnabled(enabled) {
        this._checkInit();
        this._iconTemplate.setSwallowTouchesEnabled(enabled);
    }
    setIconSelect(enabled) {
        this._checkInit();
        this._iconTemplate.setIconSelect(enabled);
    }
    showCount(needShow) {
        if (this._iconTemplate != null) {
            this._iconTemplate.showCount(needShow);
        }
    }
    getPanelSize() {
        if (this._iconTemplate) {
            return this._iconTemplate.getPanelSize();
        }
        return null;
    }
    setIconVisible(visible) {
        if (this._iconTemplate != null) {
            this._iconTemplate.setIconVisible(visible);
        }
    }
    setImageTemplateVisible(visible) {
        if (visible == null) {
            visible = false;
        }
        this._imageTemplate.node.active = visible;
    }
    setTopImage(path) {
        if (this._iconTemplate.setTopImage) {
            this._iconTemplate.setTopImage(path);
        }
    }
    showTopImage(trueOrFalse) {
        if (this._iconTemplate.showTopImage) {
            this._iconTemplate.showTopImage(trueOrFalse);
        }
    }
    refreshToEmpty() {
        this.setImageTemplateVisible(true);
        this._imageTemplate.node.opacity = (25);
    }
    showLightEffect(scale?, effectName?) {
        this._iconTemplate.showLightEffect(scale, effectName);
    }
    removeLightEffect() {
        this._iconTemplate.removeLightEffect();
    }
    showIconEffect(scale, effectName) {
        this._iconTemplate.showIconEffect(scale, effectName);
    }
    setEquipBriefVisible(visible) {
        this._iconTemplate.setEquipBriefVisible(visible);
    }
    updateEquipBriefBg(horseLevel) {
        this._iconTemplate.updateEquipBriefBg(horseLevel);
    }
    updateEquipBriefIcon(stateList) {
        this._iconTemplate.updateEquipBriefIcon(stateList);
    }
    hideBg() {
        this._iconTemplate.hideBg();
    }
    setIconScale(scale) {
        this._iconTemplate.node.setScale(scale);
    }
}