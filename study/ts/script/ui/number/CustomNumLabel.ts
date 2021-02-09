import CommonRollNumber from "../component/CommonRollNumber";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CustomNumLabel extends cc.Component {

    // 居中
    public static ALIGN_CENTER = "align_center"
    // 左对齐
    public static ALIGN_LEFT = "align_left"
    // 右对齐
    public static ALIGN_RIGHT = "align_right"


    public static SIGN_HAS = 1
    public static SIGN_NO = 0
    public static SIGN_STR = 2

    private _numberNode: cc.Node;
    private _needSpcial: boolean;
    private _spriteFrames: string;
    private _sign: number;
    private _align: string;
    private _spriteAtlas: cc.SpriteAtlas;
    private _number: number;
    private _str: string;
    private _numberUnitWidth: number;
    private _commonRollNumber: CommonRollNumber;

    public init(spriteFrames: string, dir: string, num: number, sign: number, align?: string, needSpcial?: boolean) {

        this.node.name = "CustomNumLabel";
        this._numberNode = new cc.Node("_numberNode");
        this.node.addChild(this._numberNode);
        this._needSpcial = needSpcial;
        let plist = dir + (spriteFrames);
        this._spriteAtlas = cc.resources.get(plist, cc.SpriteAtlas);
        if (this._spriteAtlas == null) {
            console.error("[CustomNumLabel] init", spriteFrames, "not have");
        }
        this._spriteFrames = spriteFrames;
        this._sign = sign == null ? CustomNumLabel.SIGN_HAS : sign;
        this._align = align || CustomNumLabel.ALIGN_LEFT;
        if (!num) {
            return;
        }
        if (this._sign != CustomNumLabel.SIGN_STR) {
            this.setNumber(num);
        } else {
            this.setString(num.toString());
        }
    }
    public setNumber(num: number) {
        this._number = num;
        this._numberNode.removeAllChildren();
        function _splitNumber(num: number): string[] {
            let nums: string[] = [];
            while (num != 0) {
                let unit = num % 10;
                nums.push(unit.toString());
                num = (num - unit) / 10;
            }
            return nums;
        }
        var nums = _splitNumber(Math.abs(num));
        if (this._sign == CustomNumLabel.SIGN_HAS) {
            if (num < 0) {
                nums.push("-");
            } else if (num > 0) {
                nums.push("+");
            } else {
                nums.push("0");
            }
        } else {
            if (num == 0) {
                nums.push("0");
            }
        }
        var size = new cc.Size(0, 0);
        var numSprites: cc.Node[] = [];
        var numlist: string[] = [];
        for (let i = nums.length - 1; i >= 0; i--) {
            var sprite = new cc.Node().addComponent(cc.Sprite);
            sprite.spriteFrame = this._spriteAtlas.getSpriteFrame(this._spriteFrames + '_' + nums[i]);
            numlist.push(num[i])
            this._numberNode.addChild(sprite.node);
            numSprites.push(sprite.node);
            size.width = size.width + sprite.node.width;
            size.height = sprite.node.height;
        }

        if (!this._needSpcial) {
            numlist = null;
        }
        this._updateNodeAlign(numSprites, CustomNumLabel.ALIGN_LEFT, 0, cc.v2(0, 0), numlist);
        this._numberUnitWidth = size.width / nums.length;
        this.node.setContentSize(size);
        this.node.setAnchorPoint(0.5, 0.5);
        this._numberNode.setPosition(0, 0);
    }

    public setString(str: string) {
        this._str = str.toString();
        this._numberNode.removeAllChildren();
        var size = new cc.Size(0, 0);
        var numSprites: cc.Node[] = [];
        var nums: number = this._str.length;
        for (let i = 0; i < nums; i++) {
            var char = this._str[i];
            var sprite = new cc.Node().addComponent(cc.Sprite);
            sprite.spriteFrame = this._spriteAtlas.getSpriteFrame(this._spriteFrames + '_' + char)
            this._numberNode.addChild(sprite.node);
            numSprites.push(sprite.node);
            size.width = size.width + sprite.node.width;
            size.height = sprite.node.height;
        }

        this._updateNodeAlign(numSprites, CustomNumLabel.ALIGN_LEFT, 0);
        this._numberUnitWidth = size.width / nums;
        this.node.setContentSize(size);
        this.node.setAnchorPoint(0.5, 0.5);
        this._numberNode.setPosition(0, 0);
    }

    public registerRoll(listener) {
        if (this._commonRollNumber == null) {
            this._commonRollNumber = this.node.addComponent(CommonRollNumber);
        }

        this._commonRollNumber.setRollListener(listener);
    }

    public updateTxtValue(num) {
        if (this._commonRollNumber) {
            this._commonRollNumber.updateTxtValue(num);
        }
    }

    public getString() {
        return this._str;
    }

    public getNumber() {
        return this._number;
    }

    public getNumberUnit(): number {
        let strNum: string;
        if (this._sign == CustomNumLabel.SIGN_HAS) {
            strNum = (Math.abs(this._number)).toString();
            return strNum.length + 1;
        } else if (this._sign == CustomNumLabel.SIGN_NO) {
            strNum = Math.abs(this._number).toString();
            return strNum.length;
        } else if (this._sign == CustomNumLabel.SIGN_STR) {
            return this._str.length;
        }
        return 0;
    }

    public getNumberUnitWidth() {
        return this._numberUnitWidth;
    }

    public addNumber(number) {
        this.setNumber(this._number + number);
    }


    private _autoAlign(items: cc.Node[], space) {
        space = space || 2;
        var totalWidth = 0;
        for (let i = 0; i < items.length; i++) {
            totalWidth = totalWidth + items[i].getContentSize().width;
        }

        totalWidth = totalWidth + (items.length - 1) * space;
        return totalWidth;
    }

    private _convertToNodePosition(position, item) {
        var anchorPoint = item.getAnchorPoint();
        return new cc.Vec2(position.x + anchorPoint.x * item.getContentSize().width, position.y + (anchorPoint.y - 0.5) * item.getContentSize().height);
    }

    private _getAlignPos(index: number, items: cc.Node[], totalWidth: number, basePosition: cc.Vec2, align: string, space: number) {
        var _width = 0;
        for (let i = 0; i <= index - 1; i++) {
            _width = _width + items[i].getContentSize().width + space;
        }
        var _rWidth = 0;
        if (align == CustomNumLabel.ALIGN_LEFT) {
            _rWidth = 0;
        } else if (align == CustomNumLabel.ALIGN_CENTER) {
            _rWidth = -totalWidth / 2;
        } else if (align == CustomNumLabel.ALIGN_RIGHT) {
            _rWidth = -totalWidth;
        } else {
        }
        return this._convertToNodePosition(cc.v2(basePosition.x + _rWidth + _width, 0), items[index]);
    }


    private _updateNodeAlign(nodes, align, alignSpace, basePosition?: cc.Vec2, nums?) {
        let totalWidth = this._autoAlign(nodes, alignSpace);
        for (let i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            var position = this._getAlignPos(i, nodes, totalWidth, basePosition || cc.v2(0, 0), align, alignSpace);
            if (nums && nums[i] == '7') {
                position.x = position.x + 3;
            }
            node.setPosition(position);
        }
    }
}