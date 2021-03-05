// import LabelOutlineExtend from "./LabelOutlineExtend";

// const { ccclass, property } = cc._decorator;

// var richTextPoop = new cc.NodePool("RichText");
// @ccclass
// export default class RichTextComponent extends cc.Component {
//     @property
//     _string: string = "<color=#00ff00>Rich</c><color=#0fffff>Text</color>";
//     @property({
//         multiline: true,
//         tooltip: "i18n:COMPONENT.richtext.string",
//     })
//     get string() {
//         return this._string;
//     }
//     set string(value) {
//         this._string = value;
//     }

//     @property
//     _horizontalAlign: cc.Label.HorizontalAlign = cc.Label.HorizontalAlign.LEFT;
//     @property({
//         type: cc.Label.HorizontalAlign,
//         animatable: false,
//         tooltip: "i18n:COMPONENT.richtext.horizontal_align",
//     })
//     get horizontalAlign() {
//         return this._horizontalAlign;
//     }
//     set horizontalAlign(value) {
//         this._horizontalAlign = value;
//     }

//     @property
//     _fontSize: number = 40;
//     @property({
//         tooltip: "i18n:COMPONENT.richtext.font_size",
//     })
//     get fontSize() {
//         return this._fontSize;
//     }
//     set fontSize(value) {
//         this._fontSize = value;
//     }

//     @property
//     _font: cc.Font = null;
//     @property({
//         type: cc.Font,
//         tooltip: "i18n:COMPONENT.richtext.font",
//     })
//     get font() {
//         return this._font;
//     }
//     set font(value) {
//         this._font = value;
//     }

//     @property
//     _cacheMode: cc.Label.CacheMode = cc.Label.CacheMode.NONE;
//     @property({
//         type: cc.Label.CacheMode,
//         tooltip: "i18n:COMPONENT.richtext.cacheMode",
//     })
//     get cacheMode() {
//         return this._cacheMode;
//     }
//     set cacheMode(value) {
//         this._cacheMode = value;
//     }

//     @property
//     _maxWidth: number = 0;
//     @property({
//         tooltip: "i18n:COMPONENT.richtext.maxWidth",
//     })
//     get maxWidth() {
//         return this._maxWidth;
//     }
//     set maxWidth(value) {
//         this._maxWidth = value;
//     }

//     @property
//     _lineHeight: number = 40;
//     @property({
//         tooltip: "i18n:COMPONENT.richtext.lineHeight",
//     })
//     get lineHeight() {
//         return this._lineHeight;
//     }
//     set lineHeight(value) {
//         this._lineHeight = value;
//     }

//     @property
//     _imageAtlas: cc.SpriteAtlas = null;
//     @property({
//         type: cc.SpriteAtlas,
//         tooltip: "i18n:COMPONENT.richtext.imageAtlas",
//     })
//     get imageAtlas() {
//         return this._imageAtlas;
//     }
//     set imageAtlas(value) {
//         this._imageAtlas = value;
//     }

//     @property
//     _handleTouchEvent: boolean = true;
//     @property({
//         tooltip: "i18n:COMPONENT.richtext.handleTouchEvent",
//     })
//     get handleTouchEvent() {
//         return this._handleTouchEvent;
//     }
//     set handleTouchEvent(value) {
//         this._handleTouchEvent = value;
//     }

//     private _textArray;
//     private _labelSegments;
//     private _labelSegmentsCache;
//     private _linesWidth;
//     private _updateRichTextStatus;
//     //     ctor: function ctor() {
//     //         this._textArray = null;
//     //         this._labelSegments = [];
//     //         this._labelSegmentsCache = [];
//     //         this._linesWidth = [];
//     //         false;
//     //         this._updateRichTextStatus = this._updateRichText;
//     //     }
//     //     editor: false,
//     //     properties: {
//     //         string: {
//     //             default: "<color=#00ff00>Rich</c><color=#0fffff>Text</color>",
//     //             multiline: true,
//     //             tooltip: (true, "i18n:COMPONENT.richtext.string"),
//     //     notify: function notify() {
//     //         this._updateRichTextStatus();
//     //     }
//     // }
//     // horizontalAlign: {
//     //           default: HorizontalAlign.LEFT,
//     //         type: HorizontalAlign,
//     //             tooltip: (true, "i18n:COMPONENT.richtext.horizontal_align"),
//     //                 animatable: false,
//     //                     notify: function notify(oldValue) {
//     //                         if (this.horizontalAlign === oldValue) return;
//     //                         this._layoutDirty = true;
//     //                         this._updateRichTextStatus();
//     //                     }
//     // }
//     // fontSize: {
//     //           default: 40,
//     //         tooltip: (true, "i18n:COMPONENT.richtext.font_size"),
//     //             notify: function notify(oldValue) {
//     //                 if (this.fontSize === oldValue) return;
//     //                 this._layoutDirty = true;
//     //                 this._updateRichTextStatus();
//     //             }
//     // }
//     // _fontFamily: "Arial",
//     //     fontFamily: {
//     //     tooltip: (true, "i18n:COMPONENT.richtext.font_family"),
//     //         get: function get() {
//     //             return this._fontFamily;
//     //         }
//     //     set: function set(value) {
//     //         if (this._fontFamily === value) return;
//     //         this._fontFamily = value;
//     //         this._layoutDirty = true;
//     //         this._updateRichTextStatus();
//     //     }
//     //     animatable: false
//     // }
//     // font: {
//     //           default: null,
//     //         type: cc.TTFFont,
//     //             tooltip: (true, "i18n:COMPONENT.richtext.font"),
//     //                 notify: function notify(oldValue) {
//     //                     if (this.font === oldValue) return;
//     //                     this._layoutDirty = true;
//     //                     if (this.font) {
//     //                         false;
//     //                         this.useSystemFont = false;
//     //                         this._onTTFLoaded();
//     //                     } else this.useSystemFont = true;
//     //                     this._updateRichTextStatus();
//     //                 }
//     // }
//     // _isSystemFontUsed: true,
//     //     useSystemFont: {
//     //     get: function get() {
//     //         return this._isSystemFontUsed;
//     //     }
//     //     set: function set(value) {
//     //         if (this._isSystemFontUsed === value) return;
//     //         this._isSystemFontUsed = value;
//     //         false;
//     //         this._layoutDirty = true;
//     //         this._updateRichTextStatus();
//     //     }
//     //     animatable: false,
//     //         tooltip: (true, "i18n:COMPONENT.richtext.system_font")
//     // }
//     // cacheMode: {
//     //           default: CacheMode.NONE,
//     //         type: CacheMode,
//     //             tooltip: (true, "i18n:COMPONENT.label.cacheMode"),
//     //                 notify: function notify(oldValue) {
//     //                     if (this.cacheMode === oldValue) return;
//     //                     this._updateRichTextStatus();
//     //                 }
//     //     animatable: false
//     // }
//     // maxWidth: {
//     //           default: 0,
//     //         tooltip: (true, "i18n:COMPONENT.richtext.max_width"),
//     //             notify: function notify(oldValue) {
//     //                 if (this.maxWidth === oldValue) return;
//     //                 this._layoutDirty = true;
//     //                 this._updateRichTextStatus();
//     //             }
//     // }
//     // lineHeight: {
//     //           default: 40,
//     //         tooltip: (true, "i18n:COMPONENT.richtext.line_height"),
//     //             notify: function notify(oldValue) {
//     //                 if (this.lineHeight === oldValue) return;
//     //                 this._layoutDirty = true;
//     //                 this._updateRichTextStatus();
//     //             }
//     // }
//     // imageAtlas: {
//     //           default: null,
//     //         type: cc.SpriteAtlas,
//     //             tooltip: (true, "i18n:COMPONENT.richtext.image_atlas"),
//     //                 notify: function notify(oldValue) {
//     //                     if (this.imageAtlas === oldValue) return;
//     //                     this._layoutDirty = true;
//     //                     this._updateRichTextStatus();
//     //                 }
//     // }
//     // handleTouchEvent: {
//     //           default: true,
//     //         tooltip: (true, "i18n:COMPONENT.richtext.handleTouchEvent"),
//     //             notify: function notify(oldValue) {
//     //                 if (this.handleTouchEvent === oldValue) return;
//     //                 this.enabledInHierarchy && (this.handleTouchEvent ? this._addEventListeners() : this._removeEventListeners());
//     //             }
//     // }
//     //       }
//     // statics: {
//     //     HorizontalAlign: HorizontalAlign,
//     //         VerticalAlign: VerticalAlign
//     // }
//     onEnable() {
//         this.handleTouchEvent && this._addEventListeners();
//         this._updateRichText();
//         this._activateChildren(true);
//     }
//     onDisable() {
//         this.handleTouchEvent && this._removeEventListeners();
//         this._activateChildren(false);
//     }
//     start() {
//         this._onTTFLoaded();
//     }
//     _onColorChanged(parentColor) {
//         var children = this.node.children;
//         children.forEach((function (childNode) {
//             childNode.color = parentColor;
//         }));
//     }
//     _addEventListeners() {
//         this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnded, this);
//         this.node.on(cc.Node.EventType.COLOR_CHANGED, this._onColorChanged, this);
//     }
//     _removeEventListeners() {
//         this.node.off(cc.Node.EventType.TOUCH_END, this._onTouchEnded, this);
//         this.node.off(cc.Node.EventType.COLOR_CHANGED, this._onColorChanged, this);
//     }
//     _updateLabelSegmentTextAttributes() {
//         this._labelSegments.forEach(function (item) {
//             this._applyTextAttribute(item, null, true);
//         }.bind(this));
//     }
//     _createFontLabel(string) {
//         return pool.get(string, this);
//     }
//     _onTTFLoaded() {
//         if (this.font instanceof cc.TTFFont) if (this.font._nativeAsset) {
//             this._layoutDirty = true;
//             this._updateRichText();
//         } else {
//             var self = this;
//             cc.loader.load(this.font.nativeUrl, (function (err, fontFamily) {
//                 self._layoutDirty = true;
//                 self._updateRichText();
//             }));
//         } else {
//             this._layoutDirty = true;
//             this._updateRichText();
//         }
//     }
//     _measureText(styleIndex, string) {
//         var self = this;
//         var func = function func(string) {
//             var label;
//             if (0 === self._labelSegmentsCache.length) {
//                 label = self._createFontLabel(string);
//                 self._labelSegmentsCache.push(label);
//             } else label = self._labelSegmentsCache[0];
//             label._styleIndex = styleIndex;
//             self._applyTextAttribute(label, string, true);
//             var labelSize = label.getContentSize();
//             return labelSize.width;
//         };
//         return string ? func(string) : func;
//     }
//     _onTouchEnded(event) {
//         var _this = this;
//         var components = this.node.getComponents(cc.Component);
//         var _loop = function _loop(i) {
//             var labelSegment = _this._labelSegments[i];
//             var clickHandler = labelSegment._clickHandler;
//             var clickParam = labelSegment._clickParam;
//             if (clickHandler && _this._containsTouchLocation(labelSegment, event.touch.getLocation())) {
//                 components.forEach((function (component) {
//                     component.enabledInHierarchy && component[clickHandler] && component[clickHandler](event, clickParam);
//                 }));
//                 event.stopPropagation();
//             }
//         };
//         for (var i = 0; i < this._labelSegments.length; ++i) _loop(i);
//     }
//     _containsTouchLocation(label, point) {
//         var myRect = label.getBoundingBoxToWorld();
//         return myRect.contains(point);
//     }
//     _resetState() {
//         var children = this.node.children;
//         for (var i = children.length - 1; i >= 0; i--) {
//             var child = children[i];
//             if (child.name === RichTextChildName || child.name === RichTextChildImageName) {
//                 child.parent === this.node ? child.parent = null : children.splice(i, 1);
//                 child.name === RichTextChildName && pool.put(child);
//             }
//         }
//         this._labelSegments.length = 0;
//         this._labelSegmentsCache.length = 0;
//         this._linesWidth.length = 0;
//         this._lineOffsetX = 0;
//         this._lineCount = 1;
//         this._labelWidth = 0;
//         this._labelHeight = 0;
//         this._layoutDirty = true;
//     }
//     onRestore: false,
//     _activateChildren: function _activateChildren(active) {
//         for (var i = this.node.children.length - 1; i >= 0; i--) {
//             var child = this.node.children[i];
//             child.name !== RichTextChildName && child.name !== RichTextChildImageName || (child.active = active);
//         }
//     }
//     _addLabelSegment(stringToken, styleIndex) {
//         var labelSegment;
//         labelSegment = 0 === this._labelSegmentsCache.length ? this._createFontLabel(stringToken) : this._labelSegmentsCache.pop();
//         labelSegment._styleIndex = styleIndex;
//         labelSegment._lineCount = this._lineCount;
//         labelSegment.active = this.node.active;
//         labelSegment.setAnchorPoint(0, 0);
//         this._applyTextAttribute(labelSegment, stringToken);
//         this.node.addChild(labelSegment);
//         this._labelSegments.push(labelSegment);
//         return labelSegment;
//     }
//     _updateRichTextWithMaxWidth(labelString, labelWidth, styleIndex) {
//         var fragmentWidth = labelWidth;
//         var labelSegment;
//         if (this._lineOffsetX > 0 && fragmentWidth + this._lineOffsetX > this.maxWidth) {
//             var checkStartIndex = 0;
//             while (this._lineOffsetX <= this.maxWidth) {
//                 var checkEndIndex = this._getFirstWordLen(labelString, checkStartIndex, labelString.length);
//                 var checkString = labelString.substr(checkStartIndex, checkEndIndex);
//                 var checkStringWidth = this._measureText(styleIndex, checkString);
//                 if (!(this._lineOffsetX + checkStringWidth <= this.maxWidth)) {
//                     if (checkStartIndex > 0) {
//                         var remainingString = labelString.substr(0, checkStartIndex);
//                         this._addLabelSegment(remainingString, styleIndex);
//                         labelString = labelString.substr(checkStartIndex, labelString.length);
//                         fragmentWidth = this._measureText(styleIndex, labelString);
//                     }
//                     this._updateLineInfo();
//                     break;
//                 }
//                 this._lineOffsetX += checkStringWidth;
//                 checkStartIndex += checkEndIndex;
//             }
//         }
//         if (fragmentWidth > this.maxWidth) {
//             var fragments = textUtils.fragmentText(labelString, fragmentWidth, this.maxWidth, this._measureText(styleIndex));
//             for (var k = 0; k < fragments.length; ++k) {
//                 var splitString = fragments[k];
//                 labelSegment = this._addLabelSegment(splitString, styleIndex);
//                 var labelSize = labelSegment.getContentSize();
//                 this._lineOffsetX += labelSize.width;
//                 fragments.length > 1 && k < fragments.length - 1 && this._updateLineInfo();
//             }
//         } else {
//             this._lineOffsetX += fragmentWidth;
//             this._addLabelSegment(labelString, styleIndex);
//         }
//     }
//     _isLastComponentCR(stringToken) {
//         return stringToken.length - 1 === stringToken.lastIndexOf("\n");
//     }
//     _updateLineInfo() {
//         this._linesWidth.push(this._lineOffsetX);
//         this._lineOffsetX = 0;
//         this._lineCount++;
//     }
//     _needsUpdateTextLayout(newTextArray) {
//         if (this._layoutDirty || !this._textArray || !newTextArray) return true;
//         if (this._textArray.length !== newTextArray.length) return true;
//         for (var i = 0; i < this._textArray.length; ++i) {
//             var oldItem = this._textArray[i];
//             var newItem = newTextArray[i];
//             if (oldItem.text !== newItem.text) return true;
//             var oldStyle = oldItem.style, newStyle = newItem.style;
//             if (oldStyle) {
//                 if (newStyle) {
//                     if (!oldStyle.outline !== !newStyle.outline) return true;
//                     if (oldStyle.size !== newStyle.size || !oldStyle.italic !== !newStyle.italic || oldStyle.isImage !== newStyle.isImage) return true;
//                     if (oldStyle.src !== newStyle.src || oldStyle.imageAlign !== newStyle.imageAlign || oldStyle.imageHeight !== newStyle.imageHeight || oldStyle.imageWidth !== newStyle.imageWidth || oldStyle.imageOffset !== newStyle.imageOffset) return true;
//                 } else if (oldStyle.size || oldStyle.italic || oldStyle.isImage || oldStyle.outline) return true;
//             } else if (newStyle && (newStyle.size || newStyle.italic || newStyle.isImage || newStyle.outline)) return true;
//         }
//         return false;
//     }
//     _addRichTextImageElement(richTextElement) {
//         var spriteFrameName = richTextElement.style.src;
//         var spriteFrame = this.imageAtlas.getSpriteFrame(spriteFrameName);
//         if (spriteFrame) {
//             var spriteNode = new cc.PrivateNode(RichTextChildImageName);
//             var spriteComponent = spriteNode.addComponent(cc.Sprite);
//             switch (richTextElement.style.imageAlign) {
//                 case "top":
//                     spriteNode.setAnchorPoint(0, 1);
//                     break;

//                 case "center":
//                     spriteNode.setAnchorPoint(0, .5);
//                     break;

//                 default:
//                     spriteNode.setAnchorPoint(0, 0);
//             }
//             richTextElement.style.imageOffset && (spriteNode._imageOffset = richTextElement.style.imageOffset);
//             spriteComponent.type = cc.Sprite.Type.SLICED;
//             spriteComponent.sizeMode = cc.Sprite.SizeMode.CUSTOM;
//             this.node.addChild(spriteNode);
//             this._labelSegments.push(spriteNode);
//             var spriteRect = spriteFrame.getRect();
//             var scaleFactor = 1;
//             var spriteWidth = spriteRect.width;
//             var spriteHeight = spriteRect.height;
//             var expectWidth = richTextElement.style.imageWidth;
//             var expectHeight = richTextElement.style.imageHeight;
//             if (expectHeight > 0) {
//                 scaleFactor = expectHeight / spriteHeight;
//                 spriteWidth *= scaleFactor;
//                 spriteHeight *= scaleFactor;
//             } else {
//                 scaleFactor = this.lineHeight / spriteHeight;
//                 spriteWidth *= scaleFactor;
//                 spriteHeight *= scaleFactor;
//             }
//             expectWidth > 0 && (spriteWidth = expectWidth);
//             if (this.maxWidth > 0) {
//                 this._lineOffsetX + spriteWidth > this.maxWidth && this._updateLineInfo();
//                 this._lineOffsetX += spriteWidth;
//             } else {
//                 this._lineOffsetX += spriteWidth;
//                 this._lineOffsetX > this._labelWidth && (this._labelWidth = this._lineOffsetX);
//             }
//             spriteComponent.spriteFrame = spriteFrame;
//             spriteNode.setContentSize(spriteWidth, spriteHeight);
//             spriteNode._lineCount = this._lineCount;
//             if (richTextElement.style.event) {
//                 richTextElement.style.event.click && (spriteNode._clickHandler = richTextElement.style.event.click);
//                 richTextElement.style.event.param ? spriteNode._clickParam = richTextElement.style.event.param : spriteNode._clickParam = "";
//             } else spriteNode._clickHandler = null;
//         } else cc.warnID(4400);
//     }
//     _updateRichText() {
//         if (!this.enabledInHierarchy) return;
//         var newTextArray = _htmlTextParser.parse(this.string);
//         if (!this._needsUpdateTextLayout(newTextArray)) {
//             this._textArray = newTextArray;
//             this._updateLabelSegmentTextAttributes();
//             return;
//         }
//         this._textArray = newTextArray;
//         this._resetState();
//         var lastEmptyLine = false;
//         var label;
//         var labelSize;
//         for (var i = 0; i < this._textArray.length; ++i) {
//             var richTextElement = this._textArray[i];
//             var text = richTextElement.text;
//             if ("" === text) {
//                 if (richTextElement.style && richTextElement.style.newline) {
//                     this._updateLineInfo();
//                     continue;
//                 }
//                 if (richTextElement.style && richTextElement.style.isImage && this.imageAtlas) {
//                     this._addRichTextImageElement(richTextElement);
//                     continue;
//                 }
//             }
//             var multilineTexts = text.split("\n");
//             for (var j = 0; j < multilineTexts.length; ++j) {
//                 var labelString = multilineTexts[j];
//                 if ("" === labelString) {
//                     if (this._isLastComponentCR(text) && j === multilineTexts.length - 1) continue;
//                     this._updateLineInfo();
//                     lastEmptyLine = true;
//                     continue;
//                 }
//                 lastEmptyLine = false;
//                 if (this.maxWidth > 0) {
//                     var labelWidth = this._measureText(i, labelString);
//                     this._updateRichTextWithMaxWidth(labelString, labelWidth, i);
//                     multilineTexts.length > 1 && j < multilineTexts.length - 1 && this._updateLineInfo();
//                 } else {
//                     label = this._addLabelSegment(labelString, i);
//                     labelSize = label.getContentSize();
//                     this._lineOffsetX += labelSize.width;
//                     this._lineOffsetX > this._labelWidth && (this._labelWidth = this._lineOffsetX);
//                     multilineTexts.length > 1 && j < multilineTexts.length - 1 && this._updateLineInfo();
//                 }
//             }
//         }
//         lastEmptyLine || this._linesWidth.push(this._lineOffsetX);
//         this.maxWidth > 0 && (this._labelWidth = this.maxWidth);
//         this._labelHeight = (this._lineCount + textUtils.BASELINE_RATIO) * this.lineHeight;
//         this.node.setContentSize(this._labelWidth, this._labelHeight);
//         this._updateRichTextPosition();
//         this._layoutDirty = false;
//     }
//     _getFirstWordLen(text, startIndex, textLen) {
//         var character = text.charAt(startIndex);
//         if (textUtils.isUnicodeCJK(character) || textUtils.isUnicodeSpace(character)) return 1;
//         var len = 1;
//         for (var index = startIndex + 1; index < textLen; ++index) {
//             character = text.charAt(index);
//             if (textUtils.isUnicodeSpace(character) || textUtils.isUnicodeCJK(character)) break;
//             len++;
//         }
//         return len;
//     }
//     _updateRichTextPosition() {
//         var nextTokenX = 0;
//         var nextLineIndex = 1;
//         var totalLineCount = this._lineCount;
//         for (var i = 0; i < this._labelSegments.length; ++i) {
//             var label = this._labelSegments[i];
//             var lineCount = label._lineCount;
//             if (lineCount > nextLineIndex) {
//                 nextTokenX = 0;
//                 nextLineIndex = lineCount;
//             }
//             var lineOffsetX = 0;
//             switch (this.horizontalAlign) {
//                 case HorizontalAlign.LEFT:
//                     lineOffsetX = -this._labelWidth / 2;
//                     break;

//                 case HorizontalAlign.CENTER:
//                     lineOffsetX = -this._linesWidth[lineCount - 1] / 2;
//                     break;

//                 case HorizontalAlign.RIGHT:
//                     lineOffsetX = this._labelWidth / 2 - this._linesWidth[lineCount - 1];
//             }
//             label.x = nextTokenX + lineOffsetX;
//             var labelSize = label.getContentSize();
//             label.y = this.lineHeight * (totalLineCount - lineCount) - this._labelHeight / 2;
//             lineCount === nextLineIndex && (nextTokenX += labelSize.width);
//             var sprite = label.getComponent(cc.Sprite);
//             if (sprite) {
//                 var lineHeightSet = this.lineHeight;
//                 var lineHeightReal = this.lineHeight * (1 + textUtils.BASELINE_RATIO);
//                 switch (label.anchorY) {
//                     case 1:
//                         label.y += lineHeightSet + (lineHeightReal - lineHeightSet) / 2;
//                         break;

//                     case .5:
//                         label.y += lineHeightReal / 2;
//                         break;

//                     default:
//                         label.y += (lineHeightReal - lineHeightSet) / 2;
//                 }
//                 if (label._imageOffset) {
//                     var offsets = label._imageOffset.split(",");
//                     if (1 === offsets.length && offsets[0]) {
//                         var offsetY = parseFloat(offsets[0]);
//                         Number.isInteger(offsetY) && (label.y += offsetY);
//                     } else if (2 === offsets.length) {
//                         var offsetX = parseFloat(offsets[0]);
//                         var _offsetY = parseFloat(offsets[1]);
//                         Number.isInteger(offsetX) && (label.x += offsetX);
//                         Number.isInteger(_offsetY) && (label.y += _offsetY);
//                     }
//                 }
//             }
//             var outline = label.getComponent(cc.LabelOutline);
//             outline && outline.width && (label.y = label.y - outline.width);
//         }
//     }
//     _convertLiteralColorValue(color) {
//         var colorValue = color.toUpperCase();
//         if (cc.Color[colorValue]) return cc.Color[colorValue];
//         var out = cc.color();
//         return out.fromHEX(color);
//     }
//     _applyTextAttribute(labelNode, string, force) {
//         var labelComponent = labelNode.getComponent(cc.Label);
//         if (!labelComponent) return;
//         var index = labelNode._styleIndex;
//         var textStyle = null;
//         this._textArray[index] && (textStyle = this._textArray[index].style);
//         textStyle && textStyle.color ? labelNode.color = this._convertLiteralColorValue(textStyle.color) : labelNode.color = this.node.color;
//         labelComponent.cacheMode = this.cacheMode;
//         var isAsset = this.font instanceof cc.Font;
//         isAsset && !this._isSystemFontUsed ? labelComponent.font = this.font : labelComponent.fontFamily = this.fontFamily;
//         labelComponent.useSystemFont = this._isSystemFontUsed;
//         labelComponent.lineHeight = this.lineHeight;
//         labelComponent.enableBold = textStyle && textStyle.bold;
//         labelComponent.enableItalics = textStyle && textStyle.italic;
//         textStyle && textStyle.italic && (labelNode.skewX = 12);
//         labelComponent.enableUnderline = textStyle && textStyle.underline;
//         if (textStyle && textStyle.outline) {
//             var labelOutlineComponent = labelNode.getComponent(cc.LabelOutline);
//             labelOutlineComponent || (labelOutlineComponent = labelNode.addComponent(cc.LabelOutline));
//             labelOutlineComponent.color = this._convertLiteralColorValue(textStyle.outline.color);
//             labelOutlineComponent.width = textStyle.outline.width;
//         }
//         textStyle && textStyle.size ? labelComponent.fontSize = textStyle.size : labelComponent.fontSize = this.fontSize;
//         if (null !== string) {
//             "string" !== typeof string && (string = "" + string);
//             labelComponent.string = string;
//         }
//         force && labelComponent._forceUpdateRenderData();
//         if (textStyle && textStyle.event) {
//             textStyle.event.click && (labelNode._clickHandler = textStyle.event.click);
//             textStyle.event.param ? labelNode._clickParam = textStyle.event.param : labelNode._clickParam = "";
//         } else labelNode._clickHandler = null;
//     }
//     onDestroy() {
//         for (var i = 0; i < this._labelSegments.length; ++i) {
//             this._labelSegments[i].removeFromParent();
//             pool.put(this._labelSegments[i]);
//         }
//     }

//     debounce(func, wait, immediate) {
//         var timeout;
//         return function () {
//             var context = this;
//             var later = function later() {
//                 timeout = null;
//                 immediate || func.apply(context, arguments);
//             };
//             var callNow = immediate && !timeout;
//             clearTimeout(timeout);
//             timeout = setTimeout(later, wait);
//             callNow && func.apply(context, arguments);
//         };
//     }
//     poolPush(node: cc.Node, string: string) {
//         if (!cc.isValid(node)) return false;
//         return true;
//     }
//     poolGet(string, richtext) {
//         var labelNode = this._get();
//         labelNode || (labelNode = new cc.PrivateNode(RichTextChildName));
//         labelNode.setPosition(0, 0);
//         labelNode.setAnchorPoint(.5, .5);
//         labelNode.skewX = 0;
//         var labelComponent = labelNode.getComponent(cc.Label);
//         labelComponent || (labelComponent = labelNode.addComponent(cc.Label));
//         labelComponent.string = "";
//         labelComponent.horizontalAlign = HorizontalAlign.LEFT;
//         labelComponent.verticalAlign = VerticalAlign.CENTER;
//         return labelNode;
//     }
// }