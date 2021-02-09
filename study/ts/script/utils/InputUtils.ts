import { Colors, G_Prompt } from "../init";
import CommonEditBox from "../ui/component/CommonEditBox";
import { UTF8 } from "./UTF8";

export default class InputUtils {
    //暂时有问题--not Complete -lqs
    public static createInputView(param) {
        if (!param || !param.bgPanel) {
            return;
        }
        param.fontSize = param.fontSize || 22;
        param.fontColor = param.fontColor || Colors.BRIGHT_BG_ONE;
        param.placeholder = param.placeholder || '';
        param.placeholderFontColor = param.placeholderFontColor || Colors.INPUT_PLACEHOLDER;
        param.placeholderFontSize = param.placeholderFontSize || param.fontSize;
        param.inputMode = param.inputMode || cc.EditBox.InputMode.SINGLE_LINE;
        param.inputFlag = param.inputFlag || cc.EditBox.InputFlag.SENSITIVE;
        param.returnType = param.returnType || 1;
        param.maxLength = param.maxLength || 7;
        param.maxLenTip = param.maxLenTip;
        var contentSize = param.bgPanel.getContentSize();

        var resource = cc.resources.get("prefab/common/CommonEditBox");
        let commonEditBox = (cc.instantiate(resource) as cc.Node).getComponent(CommonEditBox);
        let editBox = commonEditBox._editBox;

        //UIHelper.loadTexture(editBox.background, Path.getUICommon('input_bg'));
        // editBox.setCascadeOpacityEnabled(true);

        // editBox.textLabel.useSystemFont = true;
        // editBox.textLabel.fontFamily = (Path.getCommonFont());
        editBox.textLabel.fontSize = (param.fontSize);
        editBox.textLabel.node.color = (param.fontColor);

        editBox.placeholderLabel.string = (param.placeholder);
        editBox.placeholderLabel.node.color = (param.placeholderFontColor);
        editBox.placeholderLabel.fontSize = (param.placeholderFontSize);

        // editBox.inputMode = (param.inputMode);
        // editBox.inputFlag = (param.inputFlag);
        // editBox.returnType = (param.returnType);
        editBox.maxLength = param.maxLength;
        editBox.node.setAnchorPoint(0, 1);
        editBox.node.x = (-1 * contentSize.width * 0.5);
        editBox.node.y = (contentSize.height * 0.5);
        editBox.node.setContentSize(contentSize);

        var bgPanel = param.bgPanel as cc.Node;
        if(bgPanel.anchorX == 0){
            commonEditBox.node.x = bgPanel.width/2;
        }
        if(bgPanel.anchorY == 0){
            commonEditBox.node.y = bgPanel.height/2;
        }

        param.bgPanel.addChild(commonEditBox.node);
        var onInputEventBegan = function (event:cc.EditBox) {
            if (param.textLabel) {
                //event.setText(param.textLabel.string);
                param.textLabel.node.active = (false);
            }
            if (param.textEmpty) {
                param.textEmpty.node.active(false);
            }
            if (param.inputEvent) {
                param.inputEvent("editing-did-began", event);
            }
            event.background.node.active = true;
        }

        var onInputEventEnd = function (event) {
            var text = event.string;
            if (UTF8.utf8len(text) > param.maxLength) {
                if (param.maxLenTip) {
                    G_Prompt.showTip(param.maxLenTip);
                    event.string = ('');
                } else {
                    text = UTF8.utf8sub(text, 1, param.maxLength);
                    event.string = (text);
                }
            }
            if (param.textLabel) {
                param.textLabel.node.active = (true);
                param.textLabel.string = (event.string);
            }
            if (param.textEmpty && event.string == '') {
                param.textEmpty.node.active = (true);
            }

            if (param.inputEvent) {
                param.inputEvent("editing-did-ended", event);
            }
            event.background.node.active = false;
        }

        var onInputEventReturn = function (event) {
            if (param.inputEvent) {
                param.inputEvent("editing-return", event);
            }
        }
        var onInputEventChange = function (event) {
            if (param.inputEvent) {
                param.inputEvent("text-changed", event);
            }
        }

        editBox.node.on('editing-did-began', onInputEventBegan, this);
        editBox.node.on('editing-did-ended', onInputEventEnd, this);
        editBox.node.on('text-changed', onInputEventChange, this);
        editBox.node.on('editing-return', onInputEventReturn, this);


        if (param.textLabel) {
            editBox.node.opacity = (0);
            editBox.node.color.setA(0);
        }
        return editBox;
    }
}