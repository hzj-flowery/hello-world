import { RollNoticeConst } from "../const/RollNoticeConst";

export namespace Color {
    export let COLOR_BUTTON_LITTLE = new cc.Color(255, 248, 198);
    export let COLOR_BUTTON_LITTLE_OUTLINE = new cc.Color(145, 72, 6, 255);
    export let COLOR_BUTTON_LITTLE_NOTE = new cc.Color(255, 254, 232);
    export let COLOR_BUTTON_LITTLE_NOTE_OUTLINE = new cc.Color(165, 57, 36, 255);
    export let COLOR_BUTTON_LITTLE_GRAY = new cc.Color(255, 248, 198);
    export let COLOR_BUTTON_LITTLE_GRAY_OUTLINE = new cc.Color(82, 78, 74, 255);
    export let COLOR_BUTTON_BIG = new cc.Color(255, 248, 198);
    export let COLOR_BUTTON_BIG_OUTLINE = new cc.Color(145, 72, 6, 255);
    export let COLOR_BUTTON_BIG_NOTE = new cc.Color(255, 255, 255);
    export let COLOR_BUTTON_BIG_NOTE_OUTLINE = new cc.Color(165, 57, 36, 255);
    export let COLOR_BUTTON_BIG_GRAY = new cc.Color(255, 248, 198);
    export let COLOR_BUTTON_BIG_GRAY_OUTLINE = new cc.Color(82, 78, 74, 255);
    export let COMMON_RANK_COLOR = 4;
    export let RANK_COLOR = [
        new cc.Color(221, 21, 0),
        new cc.Color(194, 72, 0),
        new cc.Color(123, 19, 189),
        new cc.Color(136, 68, 27)
    ];
    export let getRankColor = function (index) {
        if (RANK_COLOR[index - 1]) {
            return RANK_COLOR[index - 1];
        }
        return RANK_COLOR[COMMON_RANK_COLOR - 1];
    };
    export let ReportParseColor = [
        new cc.Color(0, 0, 0),
        new cc.Color(255, 0, 0),
        new cc.Color(128, 255, 15),
        new cc.Color(0, 0, 255)
    ];
    export let ReportParseColorDefault = new cc.Color(182, 101, 17);
    export let COLOR_BULLET_QUALITY = [
        new cc.Color(255, 246, 229),
        new cc.Color(128, 255, 15),
        new cc.Color(0, 169, 255),
        new cc.Color(255, 14, 255),
        new cc.Color(255, 206, 10),
        new cc.Color(255, 8, 8),
        new cc.Color(247, 255, 19)
    ];
    export let COLOR_BULLET_QUALITY_OUTLINE = [
        new cc.Color(43, 9, 0, 255),
        new cc.Color(24, 54, 0, 255),
        new cc.Color(0, 21, 64, 255),
        new cc.Color(53, 0, 64, 255),
        new cc.Color(62, 15, 0, 255),
        new cc.Color(58, 0, 0, 255),
        new cc.Color(172, 42, 0, 255)
    ];
    export let COLOR_HOMELAND = [
        new cc.Color(120, 255, 19),
        new cc.Color(50, 214, 255),
        new cc.Color(0, 132, 255),
        new cc.Color(255, 136, 214),
        new cc.Color(239, 43, 239),
        new cc.Color(203, 50, 255),
        new cc.Color(255, 236, 28),
        new cc.Color(255, 174, 0),
        new cc.Color(255, 123, 17),
        new cc.Color(255, 112, 74),
        new cc.Color(255, 0, 0),
        cc.color(255, 170, 174),
        cc.color(244, 244, 128)
    ];
    export let COLOR_HOMELAND_OUTLINE = [
        new cc.Color(20, 99, 9),
        new cc.Color(0, 72, 169),
        new cc.Color(0, 45, 119),
        new cc.Color(118, 0, 72),
        new cc.Color(116, 0, 119),
        new cc.Color(67, 0, 158),
        new cc.Color(158, 82, 0),
        new cc.Color(144, 58, 0),
        new cc.Color(118, 39, 0),
        new cc.Color(142, 30, 0),
        new cc.Color(126, 18, 0),
        cc.color(167, 14, 15),
        cc.color(238, 91, 38)
    ];
    export let getHomelandColor = function (index) {
        return COLOR_HOMELAND[index - 1];
    };
    export let getHomelandOutline = function (index) {
        return COLOR_HOMELAND_OUTLINE[index - 1];
    };
    export let getBulletColor = function (index) {
        return COLOR_BULLET_QUALITY[index - 1];
    };
    export let getBulletColorOutline = function (index) {
        return COLOR_BULLET_QUALITY_OUTLINE[index - 1];
    };
    export let COLOR_ATTR_NAME_ACTIVE = new cc.Color(194, 80, 0, 255);
    export let COLOR_ATTR_DES_ACTIVE = new cc.Color(0, 167, 8, 255);
    export let COLOR_ATTR_UNACTIVE = new cc.Color(134, 85, 44, 255);
    export let COLOR_UNLOCK_TIP = new cc.Color(225, 27, 1, 255);
    export let COLOR_KARMA_ACTIVE = new cc.Color(251, 254, 203, 255);
    export let COLOR_KARMA_UNACTIVE = new cc.Color(225, 213, 177, 255);
    export let COLOR_MAIN_TEXT = new cc.Color(104, 68, 40, 255);
    export let COLOR_SECONDARY_TEXT = new cc.Color(134, 85, 44, 255);
    export let uiColors = {
        GREEN: new cc.Color(0, 167, 8),
        RED: new cc.Color(225, 27, 1),
        BROWN: new cc.Color(194, 80, 0),
        BEIGE: new cc.Color(238, 202, 147),
        THIN_YELLOW: new cc.Color(255, 248, 198)
    };
    export let Gray = new cc.Color(80, 80, 80);
    export let Noraml = new cc.Color(255, 255, 255);
    export let modelColor = new cc.Color(0, 0, 0, 178);
    export let tipTextColor = new cc.Color(255, 255, 204);
    export let strokeBlack = new cc.Color(0, 0, 0, 255);
    export let strokeHalfBlack = new cc.Color(0, 0, 0, 255 * 0.5);
    export let strokeBrown = new cc.Color(51, 0, 0, 255);
    export let strokeYellow = new cc.Color(237, 198, 0, 255);
    export let strokeGreen = new cc.Color(22, 131, 138, 255);
    export let activeSkill = new cc.Color(197, 45, 0);
    export let inActiveSkill = new cc.Color(80, 62, 50);
    export let titleGreen = new cc.Color(177, 239, 101);
    export let titleRed = new cc.Color(197, 45, 0);
    export let TAB_NORMAL = new cc.Color(70, 39, 9);
    export let TAB_DOWN = new cc.Color(255, 224, 149);
    export let TAB_GRAY = new cc.Color(51, 51, 51);
    export let WHITE = new cc.Color(255, 255, 255);
    export let COFFEE = new cc.Color(131, 92, 66);
    export let RED = new cc.Color(230, 0, 0);
    export let BABY_BLUE = new cc.Color(68, 120, 187, 255);
    export let WHITE_BROWN = new cc.Color(123, 62, 6, 255);
    export let WHITE_DEFAULT = new cc.Color(255, 246, 226, 255);
    export let DEFAULT_OUTLINE_COLOR = new cc.Color(85, 57, 35, 255);
    export let DEFAULT_OUTLINE_COLOR2 = new cc.Color(182, 108, 69, 255);
    export let GRAY_OUTLINE_COLOR = new cc.Color(139, 138, 138, 255);
    export let KNIGHT_NAME_WIHTE_COLOR = new cc.Color(255, 246, 226, 255);
    export let darkColors = {
        TITLE_01: new cc.Color(255, 214, 105),
        TITLE_02: new cc.Color(255, 246, 226),
        DESCRIPTION: new cc.Color(245, 237, 208),
        ATTRIBUTE: new cc.Color(177, 239, 102),
        TIPS_01: new cc.Color(224, 21, 0),
        TIPS_02: new cc.Color(213, 173, 126),
        UN_ACTIVE: new cc.Color(153, 144, 132, 255)
    };
    export let lightColors = {
        TITLE_01: new cc.Color(151, 32, 0),
        TITLE_02: new cc.Color(137, 64, 19),
        DESCRIPTION: new cc.Color(97, 60, 43),
        ATTRIBUTE: new cc.Color(2, 174, 0),
        TIPS_01: new cc.Color(224, 21, 0),
        TIPS_02: new cc.Color(151, 100, 47),
        UN_ACTIVE: new cc.Color(105, 105, 105, 255)
    };
    export let qualityColors = [
        new cc.Color(255, 255, 255),
        new cc.Color(153, 255, 51),
        new cc.Color(0, 222, 255),
        new cc.Color(249, 83, 255),
        new cc.Color(255, 129, 36),
        new cc.Color(255, 41, 18),
        new cc.Color(255, 234, 0)
    ];
    export let toColor3B = function (num) {
        if (!num) {
            return new cc.Color(0, 0, 0);
        }
        var hex = 16;
        function _hexConvert(raw, bit) {
            return Math.floor(raw / Math.pow(hex, bit - 1)) % hex;
        }
        return new cc.Color(_hexConvert(num, 6) * hex + _hexConvert(num, 5), _hexConvert(num, 4) * hex + _hexConvert(num, 3), _hexConvert(num, 2) * hex + _hexConvert(num, 1));
    };
    Color[11] = toColor3B(9911301);
    Color[12] = toColor3B(5443078);
    Color[13] = toColor3B(1973790);
    Color[14] = toColor3B(131586);
    Color[31] = toColor3B(51012);
    Color[41] = toColor3B(41727);
    Color[43] = toColor3B(4811403);
    Color[44] = toColor3B(2652347);
    Color[51] = toColor3B(12783103);
    Color[61] = toColor3B(15753216);
    Color[71] = toColor3B(15532032);
    Color[73] = toColor3B(14876672);
    Color[81] = toColor3B(12885248);
    Color[83] = toColor3B(8673282);
    Color[101] = toColor3B(8816262);
    Color[113] = toColor3B(1549978);
    Color[21] = toColor3B(1046242);
    Color[22] = toColor3B(13746598);
    Color[23] = toColor3B(16645887);
    Color[32] = toColor3B(51012);
    Color[42] = toColor3B(41727);
    Color[52] = toColor3B(12783103);
    Color[62] = toColor3B(15753216);
    Color[72] = toColor3B(15532032);
    Color[74] = toColor3B(16750712);
    Color[82] = toColor3B(12885248);
    Color[91] = toColor3B(10191451);
    Color[111] = toColor3B(1113796);
    Color[112] = toColor3B(3272447);
    export let lightQualityColors = [
        Color[11],
        Color[31],
        Color[41],
        Color[51],
        Color[61],
        Color[71],
        Color[81]
    ];
    export let darkQualityColors = [
        Color[21],
        Color[32],
        Color[42],
        Color[52],
        Color[62],
        Color[72],
        Color[82]
    ];
    export let stageKnightNameColors = [
        KNIGHT_NAME_WIHTE_COLOR,
        Color[31],
        Color[41],
        Color[51],
        Color[61],
        Color[71],
        Color[81]
    ];
    export let getKnightNameColorOfStage = function (quality) {
        return stageKnightNameColors[quality - 1];
    };
    export let hexConvertColor = function (str) {
        var colorNum = parseFloat(('%d' as any).format(str));
        return toColor3B(colorNum);
    };
    export let toHexNum = function (color) {
        var colorStr = ('0x%X%X%X' as any).format(color.r, color.g, color.b);
        return parseInt(colorStr);
    };

    export let toHexStr = function (color) {
        var colorStr = ('0x%02X%02X%02X').format(color.r, color.g, color.b);
        return colorStr;
    }
    export let toColor4B = function (num) {
        var color: any = toColor3B(num);
        return new cc.Color(color.r, color.g, color.b, 255);
    };
    export let colorToNumber = function (color) {
        if (color instanceof cc.Color) {
            return color.getR() * 65536 + color.getG() * 256 + color.getB();
        } else if (typeof color == 'string') {
            let result: RegExpExecArray;
            if (color.charAt(0) == '#') {
                return Number(color.substring(1))
            } else if (result = /rgba\((\d+), (\d+), (\d+), \d+\)/.exec(color)) {
                return Number(result)[1] * 65536 + Number(result)[2] * 256 + Number(result[3]);
            }
        } else {
            return parseInt(color);
        }
    };

    export function colorToHexStr(color: cc.Color) {
        if (color) {
            return color.toCSS("#rrggbb");
        }
    }
    export let COLOR_POPUP_TITLE = new cc.Color(151, 32, 0);
    export let COLOR_POPUP_TITLE_TINY = new cc.Color(137, 64, 19);
    export let COLOR_POPUP_DESC_NOTE = new cc.Color(97, 60, 43);
    export let COLOR_POPUP_DESC_NORMAL = new cc.Color(151, 100, 47);
    export let COLOR_POPUP_NOTE = new cc.Color(224, 21, 0);
    export let COLOR_POPUP_ADD_PROPERTY = new cc.Color(2, 174, 0);
    export let COLOR_POPUP_UNACTIVATED = new cc.Color(105, 105, 105);
    export let COLOR_POPUP_SPECIAL_NOTE = new cc.Color(255, 222, 0);
    export let COLOR_POPUP_PROG_NUM = new cc.Color(255, 254, 232);
    export let getDarkColor = function (index) {
        return COLOR_QUALITY_DARK[index - 1];
    };
    export let getCritColor = function (index, isNotDark) {
        console.assert(typeof (index) == 'number', 'Invalid color index: ' + (index));
        index = index == 1 && index || index - 1;
        index = index + 1;
        return getColor(index, !isNotDark);
    };
    export let getCritColorOutline = function (index) {
        console.assert(typeof (index) == 'number', 'Invalid color outline index: ' + (index));
        index = index == 1 && index || index - 1;
        index = index + 1;
        return COLOR_QUALITY_OUTLINE[index];
    };
    export let colorToc4b = function (color) {
        return new cc.Color(color.r, color.g, color.b, 255);
    };
    export let COLOR_SECRET_QIANYAN = new cc.Color(57, 55, 55);
    export let COLOR_SECRET_WORDS = new cc.Color(105, 103, 103);
    export let COLOR_SCENE_TITLE = new cc.Color(97, 60, 43);
    export let COLOR_SCENE_TITLE_TINY = new cc.Color(117, 52, 12);
    export let COLOR_SCENE_DESC_NOTE = new cc.Color(255, 255, 255);
    export let COLOR_SCENE_DESC_NORMAL = new cc.Color(238, 225, 207);
    export let COLOR_SCENE_NOTE = new cc.Color(255, 144, 46);
    export let COLOR_SCENE_ADD_PROPERTY = new cc.Color(110, 241, 45);
    export let COLOR_SCENE_TIP = new cc.Color(214, 208, 112);
    export let COLOR_SCENE_OUTLINE = new cc.Color(85, 57, 35, 255);
    export let COLOR_SCENE_ICON_NUM = new cc.Color(238, 225, 207);
    export let COLOR_SCENE_ICON_NUM_OUTLINE = new cc.Color(52, 48, 41, 255);
    export let COLOR_BUTTON_BACK = new cc.Color(166, 42, 8);
    export let COLOR_BUTTON_BACK_SHADOW = new cc.Color(238, 225, 206, 255);
    export let COLOR_BUTTON_SELL = new cc.Color(97, 60, 43);
    export let COLOR_BUTTON_SELL_SHADOW = new cc.Color(238, 225, 206, 255);
    export let COLOR_TAB_BIG_SELECTED = new cc.Color(166, 42, 8);
    export let COLOR_TAB_BIG_UNSELECTED = new cc.Color(151, 32, 0);
    export let COLOR_TAB_BIG_SHADOW = new cc.Color(238, 225, 206, 255);
    export let COLOR_TAB_LITTLE_SELECTED = new cc.Color(117, 52, 12);
    export let COLOR_TAB_LITTLE_UNSELECTED = new cc.Color(151, 32, 0);
    export let COLOR_TAB_LITTLE_SHADOW = new cc.Color(238, 225, 206, 255);
    export let COLOR_TAB_ITEM = new cc.Color(104, 68, 40);
    export let COLOR_TITLE_MAIN = new cc.Color(134, 85, 44);
    export let COLOR_TITLE_SEC = new cc.Color(104, 68, 40);
    export let channelColors = {
        1: {
            hex: 8453903,
            color: new cc.Color(128, 255, 15),
            outlineColor: new cc.Color(24, 54, 0)
        },
        2: {
            hex: 8453903,
            color: new cc.Color(128, 255, 15),
            outlineColor: new cc.Color(24, 54, 0)
        },
        3: {
            hex: 1749759,
            color: new cc.Color(26, 178, 255),
            outlineColor: new cc.Color(0, 21, 64)
        },
        4: {
            hex: 16762393,
            color: new cc.Color(255, 198, 25),
            outlineColor: new cc.Color(89, 30, 0)
        },
        6: {
            hex: 16724944,
            color: new cc.Color(255, 51, 208),
            outlineColor: new cc.Color(89, 30, 0)
        },
        7: {
            hex: 12743679,
            color: cc.color(214, 149, 255),
            outlineColor: cc.color(89, 30, 0)
        }
    };
    export let ChapterType = [
        {
            color: new cc.Color(214, 159, 95),
            outlineColor: new cc.Color(88, 33, 6)
        },
        {
            color: new cc.Color(255, 247, 226),
            outlineColor: new cc.Color(214, 80, 23)
        },
        {
            color: new cc.Color(140, 89, 6),
            outlineColor: new cc.Color(88, 33, 6)
        }
    ];
    export let getChapterTypeColor = function (type) {
        return ChapterType[type - 1].color;
    };
    export let getChapterTypeOutline = function (type) {
        return ChapterType[type - 1].outlineColor;
    };
    export let getChapterNameColor = function () {
        return new cc.Color(255, 173, 57);
    };
    export let getChapterNameOutline = function () {
        return new cc.Color(109, 47, 12);
    };
    export let getDrawCardResColor = function () {
        return [
            new cc.Color(255, 247, 226),
            new cc.Color(142, 87, 0)
        ];
    };
    export let getChatNormalColor = function () {
        return new cc.Color(165, 99, 45);
    };
    export let getHeroYellowShowColor = function () {
        return [
            new cc.Color(255, 216, 0),
            new cc.Color(78, 0, 0)
        ];
    };
    export let getETypeColor = function () {
        return [
            new cc.Color(178, 107, 36),
            new cc.Color(178, 255, 25)
        ];
    };
    export let getFTypeColor = function () {
        return [
            new cc.Color(255, 216, 0),
            new cc.Color(119, 41, 9)
        ];
    };
    export let getATypeGreen = function () {
        return new cc.Color(47, 159, 7);
    };
    export let getATypeYellow = function () {
        return new cc.Color(182, 101, 17);
    };
    export let getFTypeRed = function () {
        return new cc.Color(224, 75, 10);
    };
    export let DailyChooseColor = [
        {
            color: new cc.Color(250, 250, 242),
            outlineColor: new cc.Color(101, 71, 42)
        },
        {
            color: new cc.Color(228, 255, 192),
            outlineColor: new cc.Color(41, 83, 24)
        },
        {
            color: new cc.Color(192, 251, 255),
            outlineColor: new cc.Color(40, 65, 107)
        },
        {
            color: new cc.Color(252, 194, 255),
            outlineColor: new cc.Color(91, 33, 112)
        },
        {
            color: new cc.Color(255, 198, 124),
            outlineColor: new cc.Color(111, 60, 14)
        },
        {
            color: new cc.Color(255, 194, 161),
            outlineColor: new cc.Color(131, 17, 17)
        }
    ];
    export let getDailyChooseColor = function (index) {
        if (index > DailyChooseColor.length) {
            index = DailyChooseColor.length;
        }
        return DailyChooseColor[index - 1];
    };
    export let getTypeAColor = function () {
        return new cc.Color(112, 56, 13);
    };
    export let getSettlementRankColor = function (type) {
        if (type == 1) {
            return [
                new cc.Color(254, 225, 2),
                new cc.Color(119, 31, 0)
            ];
        } else if (type == 2) {
            return [
                new cc.Color(168, 255, 0),
                new cc.Color(30, 51, 0)
            ];
        }
    };
    export let getSummaryStarColor = function () {
        return new cc.Color(255, 184, 12);
    };
    export let getSummaryLineColor = function () {
        return new cc.Color(255, 184, 12);
    };
    export let getFamousNameColor = function () {
        return new cc.Color(254, 243, 243);
    };
    export let getMineGuildGreen = function () {
        return new cc.Color(8, 255, 0);
    };
    export let getMineGuildRed = function () {
        return new cc.Color(255, 0, 0);
    };
    export let MinePercentColor = [
        {
            color: new cc.Color(255, 255, 255),
            outlineColor: new cc.Color(58, 154, 0)
        },
        {
            color: new cc.Color(255, 255, 255),
            outlineColor: new cc.Color(168, 67, 0)
        },
        {
            color: new cc.Color(255, 255, 255),
            outlineColor: new cc.Color(164, 0, 1)
        }
    ]
    export let getMinePercentColor = function (percent) {
        var type = 1;
        if (percent > 25 && percent <= 75) {
            type = 2;
        } else if (percent <= 25) {
            type = 3;
        }
        return MinePercentColor[type - 1];
    };
    export let MineStateColor = [
        new cc.Color(37, 255, 1),
        new cc.Color(255, 198, 0),
        new cc.Color(255, 0, 6)
    ];
    export let getMineStateColor = function (type) {
        return MineStateColor[type - 1];
    };
    export let MineGuildColor = [
        new cc.Color(47, 159, 7),
        new cc.Color(255, 0, 0)
    ];
    export let getMineGuildColor = function (type) {
        return MineGuildColor[type - 1];
    };
    export let MineInfoColor = [
        new cc.Color(8, 255, 0),
        new cc.Color(255, 184, 12),
        new cc.Color(255, 0, 0),
        new cc.Color(118, 118, 118)
    ];
    export let getMineInfoColor = function (type) {
        return MineInfoColor[type - 1];
    };
    export let getSmallMineGuild = function () {
        return new cc.Color(255, 245, 206);
    };
    export let getCampGray = function () {
        return new cc.Color(151, 151, 151);
    };
    export let getCampWhite = function () {
        return new cc.Color(255, 255, 255);
    };
    export let getCampRed = function () {
        return new cc.Color(255, 0, 0);
    };
    export let getCampGreen = function () {
        return new cc.Color(168, 255, 0);
    };
    export let getCampBrownOutline = function () {
        return new cc.Color(183, 118, 65, 255);
    };
    export let getCampBrown = function () {
        return new cc.Color(201, 101, 40);
    };
    export let getCampScoreGray = function () {
        return new cc.Color(172, 127, 105);
    };
    export let BuffCountColor = [
        {
            color: new cc.Color(219, 255, 14),
            outline: new cc.Color(52, 153, 20)
        },
        {
            color: new cc.Color(255, 230, 27),
            outline: new cc.Color(184, 122, 17)
        },
        {
            color: new cc.Color(255, 159, 22),
            outline: new cc.Color(189, 34, 21)
        }
    ]
    export let getBuffCountColor = function (index) {
        return BuffCountColor[index - 1];
    };

    export let NORMAL_BG_ONE = new cc.Color(180, 100, 20);
    export let BRIGHT_BG_ONE = new cc.Color(113, 67, 6);
    export let BRIGHT_BG_GREEN = new cc.Color(47, 159, 7);
    export let BRIGHT_BG_RED = new cc.Color(255, 0, 0);
    export let NUMBER_GREEN = new cc.Color(130, 241, 0);
    export let NUMBER_GREEN_OUTLINE = new cc.Color(11, 46, 5, 255);
    export let NUMBER_WHITE = new cc.Color(255, 255, 255);
    export let NUMBER_WHITE_OUTLINE = new cc.Color(0, 0, 0, 255);
    export let NUMBER_QUALITY = [
        new cc.Color(255, 255, 255),
        new cc.Color(255, 255, 255),
        new cc.Color(255, 255, 255),
        new cc.Color(255, 255, 255),
        new cc.Color(255, 255, 255),
        new cc.Color(255, 255, 255),
        new cc.Color(255, 252, 0)
    ];
    export let NUMBER_QUALITY_OUTLINE = [
        new cc.Color(0, 0, 0, 255),
        new cc.Color(73, 153, 46, 255),
        new cc.Color(0, 143, 191, 255),
        new cc.Color(166, 0, 166, 255),
        new cc.Color(229, 138, 46, 255),
        new cc.Color(204, 39, 20, 255),
        new cc.Color(170, 56, 0, 255)
    ];
    export let TITLE_ONE = new cc.Color(149, 87, 32);
    export let TITLE_TWO = new cc.Color(218, 228, 255);
    export let TITLE_THREE = new cc.Color(218, 228, 255);
    export let DARK_BG_OUTLINE = new cc.Color(178, 93, 30);
    export let DARK_BG_THREE = new cc.Color(255, 204, 0);
    export let OBVIOUS_GREEN = new cc.Color(168, 255, 0);
    export let OBVIOUS_GREEN_OUTLINE = new cc.Color(30, 51, 0);
    export let OBVIOUS_YELLOW = new cc.Color(254, 225, 2);
    export let OBVIOUS_YELLOW_OUTLINE = new cc.Color(119, 31, 0, 255);
    export let BUTTON_WHITE = new cc.Color(210, 110, 30);
    export let BUTTON_ONE_NORMAL = new cc.Color(140, 49, 0);
    export let BUTTON_ONE_NOTE = new cc.Color(180, 38, 0);
    export let BUTTON_ONE_DISABLE = new cc.Color(102, 102, 102);
    export let DAY7_TAB_BRIGHT = new cc.Color(239, 118, 0, 255);
    export let DAY7_TAB_NORMAL = new cc.Color(232, 184, 128, 255);
    export let DAY7_TAB_BRIGHT_OUTLINE = new cc.Color(250, 233, 169, 255);
    export let DAY7_TAB_NORMAL_OUTLINE = new cc.Color(109, 0, 0, 255);
    export let INPUT_PLACEHOLDER = new cc.Color(207, 164, 128);
    export let BRIGHT_BG_TWO = new cc.Color(182, 101, 17);
    export let BRIGHT_BG_OUT_LINE_TWO = new cc.Color(81, 23, 0, 255);
    export let DARK_BG_ONE = new cc.Color(255, 247, 232);
    export let DARK_BG_TWO = new cc.Color(252, 197, 118);
    export let DARK_BG_GREEN = new cc.Color(48, 217, 33);
    export let DARK_BG_RED = new cc.Color(255, 0, 0);
    export let SYSTEM_TIP = new cc.Color(255, 216, 0);
    export let SYSTEM_TIP_OUTLINE = new cc.Color(119, 41, 9, 255);
    export let SYSTEM_TARGET = new cc.Color(47, 159, 7);
    export let SYSTEM_TARGET_RED = new cc.Color(224, 75, 10);
    export let COLOR_QUALITY = [
        new cc.Color(250, 250, 242),
        new cc.Color(47, 159, 7),
        new cc.Color(17, 123, 222),
        new cc.Color(206, 29, 214),
        new cc.Color(249, 123, 0),
        new cc.Color(255, 0, 0),
        new cc.Color(255, 252, 0)
    ];

    export let COLOR_QUALITY_LIGHT = [
        cc.color(250, 250, 242),
        cc.color(64, 209, 10),
        cc.color(31, 179, 240),
        cc.color(255, 14, 229),
        cc.color(249, 123, 0),
        cc.color(255, 0, 0),
        cc.color(255, 252, 0)
    ]
    export let COLOR_QUALITY_DARK = [
        new cc.Color(88, 88, 88),
        new cc.Color(3, 130, 0),
        new cc.Color(0, 113, 183),
        new cc.Color(157, 0, 167),
        new cc.Color(213, 84, 0),
        new cc.Color(198, 0, 0),
        cc.color(255, 252, 0)
    ];
    export let COLOR_QUALITY_OUTLINE = [
        new cc.Color(51, 41, 31, 255),
        new cc.Color(33, 64, 0, 255),
        new cc.Color(0, 27, 76, 255),
        new cc.Color(73, 4, 87, 255),
        new cc.Color(93, 41, 7, 255),
        new cc.Color(99, 6, 6, 255),
        new cc.Color(150, 67, 0, 255)
    ];
    export let TAB_ICON_NORMAL = new cc.Color(149, 179, 229);
    export let TAB_ICON_DISABLE = new cc.Color(95, 107, 162);
    export let TAB_ICON_SELECTED = new cc.Color(226, 106, 0);
    export let TAB_ICON_NORMAL_OUTLINE = new cc.Color(61, 113, 17, 255);
    export let TAB_ICON_DISABLE_OUTLINE = new cc.Color(64, 75, 54, 255);
    export let TAB_ICON_SELECTED_OUTLINE = new cc.Color(212, 240, 134, 255);
    export let TERRITRY_CITY_NAME = new cc.Color(255, 247, 232);
    export let BUTTON_ONE_NOTE_OUTLINE = new cc.Color(255, 200, 104);
    export let BUTTON_ONE_NORMAL_OUTLINE = new cc.Color(255, 238, 155);
    export let BUTTON_ONE_DISABLE_OUTLINE = new cc.Color(197, 197, 197);
    export let BUTTON_TWO_NOTE = new cc.Color(255, 243, 225);
    export let BUTTON_TWO_NOTE_OUTLINE = new cc.Color(224, 106, 13, 255);
    export let BUTTON_TWO_NORMAL = new cc.Color(255, 243, 225);
    export let BUTTON_TWO_NORMAL_OUTLINE = new cc.Color(215, 138, 39, 255);
    export let BUTTON_TWO_DISABLE = new cc.Color(255, 243, 225);
    export let BUTTON_TWO_DISABLE_OUTLINE = new cc.Color(98, 98, 98, 255);
    export let BUTTON_THREE_NORMAL = new cc.Color(128, 76, 12);
    export let TAB_ONE_NORMAL = new cc.Color(184, 201, 238);
    export let TAB_ONE_NORAML_OUTLINE = new cc.Color(119, 132, 185);
    export let TAB_ONE_SELECTED = new cc.Color(159, 77, 27);
    export let TAB_ONE_SELECTED_OUTLINE = new cc.Color(255, 237, 189);
    export let TAB_ONE_DISABLE = new cc.Color(255, 247, 226);
    export let TAB_ONE_DISABLE_OUTLINE = new cc.Color(98, 98, 98, 255);
    export let TAB_TWO_NORMAL = new cc.Color(232, 184, 128);
    export let TAB_TWO_NORAML_OUTLINE = new cc.Color(119, 132, 185);
    export let TAB_TWO_SELECTED = new cc.Color(157, 99, 60);
    export let TAB_TWO_SELECTED_OUTLINE = new cc.Color(248, 240, 211);
    export let TAB_TWO_DISABLE = new cc.Color(255, 247, 226);
    export let TAB_TWO_DISABLE_OUTLINE = new cc.Color(83, 78, 75, 255);
    export let LIST_TEXT = new cc.Color(136, 68, 27);
    export let LIST_RED = new cc.Color(191, 0, 0);
    export let CLASS_TEXT = new cc.Color(136, 68, 27);
    export let CLASS_WHITE = new cc.Color(255, 255, 255);
    export let CLASS_WHITE_OUTLINE = new cc.Color(0, 0, 0, 255);
    export let CLASS_GREEN = new cc.Color(159, 241, 0);
    export let CLASS_GREEN_OUTLINE = new cc.Color(35, 58, 0, 255);
    export let PAOMADENG = new cc.Color(255, 247, 229);
    export let PAOMADENG_OUTLINE = new cc.Color(73, 42, 27);
    export let CLICK_SCREEN_CONTINUE = new cc.Color(120, 120, 120);
    export let CHAT_TAB_BRIGHT = new cc.Color(175, 116, 76);
    export let CHAT_TAB_NORMAL = new cc.Color(152, 173, 230);
    export let CHAT_TAB_BRIGHT_OUTLINE = TAB_ONE_SELECTED_OUTLINE;
    export let CHAT_TAB_NORMAL_OUTLINE = TAB_ONE_NORAML_OUTLINE;
    export let CHAT_MSG = BRIGHT_BG_ONE;
    export let CARNIVAL_TAB_BRIGHT = new cc.Color(191, 67, 1, 255);
    export let CARNIVAL_TAB_NORMAL = new cc.Color(255, 191, 68, 255);
    export let CARNIVAL_TAB_BRIGHT_OUTLINE = new cc.Color(112, 61, 19, 255);
    export let CARNIVAL_TAB_NORMAL_OUTLINE = new cc.Color(112, 61, 19, 255);
    export let DRAK_TEXT = new cc.Color(202, 202, 202);
    export let DRAK_TEXT_OUTLINE = new cc.Color(43, 43, 43);
    export let TERRITRY_CITY_NAME_OUTLINE = new cc.Color(117, 64, 28);
    export let TERRITRY_CITY_NAME_DRAK = new cc.Color(218, 218, 218);
    export let TERRITRY_CITY_NAME_DRAK_OUTLINE = new cc.Color(84, 84, 84);
    export let WORLD_BOSS_RANK_COLOR1 = new cc.Color(215, 20, 0);
    export let WORLD_BOSS_RANK_COLOR2 = new cc.Color(194, 72, 0);
    export let WORLD_BOSS_RANK_COLOR3 = new cc.Color(123, 19, 189);
    export let WORLD_BOSS_RANK_COLOR4 = new cc.Color(112, 56, 13);
    export let GUILD_DUNGEON_RANK_COLOR1 = new cc.Color(255, 25, 25);
    export let GUILD_DUNGEON_RANK_COLOR2 = new cc.Color(255, 198, 25);
    export let GUILD_DUNGEON_RANK_COLOR3 = new cc.Color(255, 0, 255);
    export let GUILD_DUNGEON_RANK_COLOR4 = new cc.Color(255, 247, 232);
    export let COUNTRY_BOSS_RANK_COLOR1 = new cc.Color(255, 25, 25);
    export let COUNTRY_BOSS_RANK_COLOR2 = new cc.Color(255, 198, 25);
    export let COUNTRY_BOSS_RANK_COLOR3 = new cc.Color(255, 0, 255);
    export let TAB_NORMAL_TEXT_COLOR = new cc.Color(215, 239, 255);
    export let TAB_CHOOSE_TEXT_COLOR = new cc.Color(186, 85, 17);
    export let INPUT_CREATE_ROLE = new cc.Color(255, 255, 255);
    export let INPUT_PLACEHOLDER_2 = new cc.Color(245, 197, 148);
    export let CUSTOM_ACT_TAB_BRIGHT = new cc.Color(206, 104, 36);
    export let CUSTOM_ACT_TAB_NORMAL = new cc.Color(93, 112, 164);
    export let CUSTOM_ACT_TAB_BRIGHT_OUTLINE = new cc.Color(239, 212, 140);
    export let CUSTOM_ACT_TAB_NORMAL_OUTLINE = new cc.Color(113, 25, 5);
    export let CUSTOM_ACT_DES_HILIGHT = new cc.Color(168, 255, 0);
    export let CUSTOM_ACT_DES = new cc.Color(255, 255, 255);
    export let CUSTOM_ACT_DES_OUTLINE = new cc.Color(119, 31, 0);
    export let SELL_TIPS_COLOR_NORMAL = new cc.Color(164, 110, 71);
    export let SELL_TIPS_COLOR_HIGHLIGHT = new cc.Color(204, 59, 10);
    export let GUILD_WAR_MY_COLOR = new cc.Color(47, 159, 7);
    export let GUILD_WAR_MY_COLOR_OUTLINE = new cc.Color(33, 64, 0, 255);
    export let GUILD_WAR_SAME_GUILD_COLOR = new cc.Color(17, 123, 222);
    export let GUILD_WAR_SAME_GUILD_COLOR_OUTLINE = new cc.Color(0, 27, 76, 255);
    export let GUILD_WAR_ENEMY_COLOR = new cc.Color(255, 0, 0);
    export let GUILD_WAR_ENEMY_COLOR_OUTLINE = new cc.Color(99, 6, 6, 255);
    export let GUILD_WAR_NOTICE_ATTACK_COLOR = new cc.Color(128, 255, 15);
    export let GUILD_WAR_NOTICE_ATTACK_COLOR_OUTLINE = new cc.Color(24, 54, 0, 255);
    export let GUILD_WAR_NOTICE_BE_ATTACK_COLOR = new cc.Color(255, 0, 0);
    export let GUILD_WAR_NOTICE_BE_ATTACK_COLOR_OUTLINE = new cc.Color(99, 6, 6, 255);
    export let SEASON_SILKBINDING_TEXT = new cc.Color(136, 82, 38);
    export let SEASON_SILKUNLOCKCONTENT_TEXT = new cc.Color(182, 101, 17);
    export let THREEKINDOMS_LINKED_REWARD = new cc.Color(153, 153, 153);
    export let THREEKINDOMS_LINKED_REWARDED = new cc.Color(168, 255, 0);
    export let FUNDSWEEK_V2_NOTGOT = new cc.Color(161, 83, 0);
    export let FUNDSWEEK_V2_GOT = new cc.Color(51, 156, 17);
    export let GUILDCROSSWAR_ATCCOLOR = new cc.Color(255, 186, 0);
    export let GUILDCROSSWAR_ATCCOLOR_OUT = new cc.Color(117, 36, 0);
    export let GUILDCROSSWAR_NOT_ATCCOLOR = new cc.Color(230, 232, 252);
    export let GUILDCROSSWAR_NOT_ATCCOLOR_OUT = new cc.Color(29, 33, 70);
    export let BOUT_POINTNAME_COLOR = [
        [
            cc.color(255, 255, 254),
            cc.color(196, 170, 90)
        ],
        [
            cc.color(235, 100, 9),
            cc.color(249, 233, 175)
        ],
        [
            cc.color(255, 102, 0),
            cc.color(255, 235, 191)
        ]
    ];
    export let NEW_RED_PACKET_NAME_COLOR = new cc.Color(255, 102, 0);
    export let NO_INJECT_COLOR = new cc.Color(117, 59, 7);
    export let GOLDENHERO_RANK_TOP = [
        new cc.Color(255, 0, 0),
        new cc.Color(255, 160, 0),
        new cc.Color(222, 0, 255),
        new cc.Color(255, 255, 255)
    ];
    export let GOLDENHERO_RANK_COLOR_NML = new cc.Color(169, 106, 42);
    export let GOLDENHERO_RANK_COLOR_IMP = new cc.Color(254, 173, 58);
    export let GOLDENHERO_TAB_COLOR_NML = new cc.Color(136, 72, 33);
    export let GOLDENHERO_TAB_COLOR_IMP = new cc.Color(176, 67, 14);
    export let GOLDENHERO_ACTIVITY_END_NORMAL = new cc.Color(255, 174, 0);
    export let OBSERVER_GUILD_SELECT = cc.color(172, 68, 22);
    export let OBSERVER_GUILD_UNSELECT = cc.color(221, 184, 139);
    export let COLOR_QUALITY_OUTLINE_SHOW = [
        false,
        false,
        false,
        false,
        false,
        false,
        true
    ];
    export let COLOR_OFFICIAL_RANK_OUTLINE_SHOW = [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        true
    ];
    export let COLOR_OFFICIAL_RANK = [
        cc.color(82, 207, 37),
        cc.color(97, 198, 220),
        cc.color(88, 170, 254),
        cc.color(255, 132, 224),
        cc.color(255, 71, 235),
        cc.color(247, 61, 255),
        cc.color(199, 119, 255),
        new cc.Color(255, 183, 0),
        new cc.Color(255, 170, 0),
        new cc.Color(249, 123, 0),
        new cc.Color(249, 94, 0),
        new cc.Color(249, 90, 105),
        new cc.Color(255, 86, 64),
        new cc.Color(255, 63, 31),
        new cc.Color(255, 0, 0),
        new cc.Color(255, 228, 0),
        cc.color(252, 255, 0)
    ];
    export let COLOR_OFFICIAL_RANK_OUTLINE = [
        cc.color(35, 76, 5),
        cc.color(11, 76, 109),
        cc.color(11, 66, 109),
        cc.color(121, 23, 115),
        cc.color(131, 17, 130),
        cc.color(98, 19, 121),
        cc.color(71, 7, 95),
        cc.color(138, 62, 1),
        cc.color(138, 43, 1),
        cc.color(138, 49, 1),
        cc.color(138, 39, 1),
        cc.color(137, 17, 17),
        cc.color(130, 7, 7),
        cc.color(135, 12, 12),
        cc.color(130, 0, 0),
        cc.color(189, 0, 0),
        cc.color(234, 0, 0)
    ];
    export let crtColors = [
        {
            color: new cc.Color(250, 250, 242),
            outlineColor: new cc.Color(85, 55, 25)
        },
        {
            color: new cc.Color(47, 159, 7),
            outlineColor: new cc.Color(41, 54, 3)
        },
        {
            color: new cc.Color(17, 123, 222),
            outlineColor: new cc.Color(37, 39, 36)
        },
        {
            color: new cc.Color(17, 123, 222),
            outlineColor: new cc.Color(37, 39, 36)
        },
        {
            color: new cc.Color(249, 123, 0),
            outlineColor: new cc.Color(46, 40, 58)
        },
        {
            color: new cc.Color(249, 123, 0),
            outlineColor: new cc.Color(46, 40, 58)
        },
        {
            color: new cc.Color(249, 123, 0),
            outlineColor: new cc.Color(46, 40, 58)
        },
        {
            color: new cc.Color(249, 123, 0),
            outlineColor: new cc.Color(46, 40, 58)
        },
        {
            color: new cc.Color(249, 123, 0),
            outlineColor: new cc.Color(46, 40, 58)
        },
        {
            color: new cc.Color(255, 0, 0),
            outlineColor: new cc.Color(78, 51, 23)
        }
    ];

    crtColors.length = 10;

    export let PET_COLORS = [
        new cc.Color(47, 159, 7),
        new cc.Color(47, 159, 7),
        new cc.Color(239, 248, 255),
        new cc.Color(249, 237, 255),
        new cc.Color(255, 247, 234),
        cc.color(255, 255, 255)
    ];
    export let COLOR_GUILD_FLAGS = [
        new cc.Color(255, 255, 255),
        new cc.Color(255, 255, 255),
        new cc.Color(255, 255, 255),
        new cc.Color(255, 255, 255),
        new cc.Color(255, 255, 255),
        new cc.Color(255, 255, 255),
        new cc.Color(255, 255, 255),
        new cc.Color(255, 255, 255),
        new cc.Color(255, 255, 255),
        new cc.Color(255, 255, 255),
        cc.color(255, 255, 255)
    ];
    export let COLOR_GUILD_FLAGS_OUTLINE = [
        new cc.Color(160, 4, 0),
        new cc.Color(215, 66, 0),
        new cc.Color(233, 148, 0),
        new cc.Color(45, 186, 0),
        new cc.Color(0, 141, 70),
        new cc.Color(0, 150, 122),
        new cc.Color(21, 91, 187),
        new cc.Color(119, 0, 179),
        new cc.Color(166, 0, 176),
        cc.color(180, 86, 51),
        cc.color(180, 86, 51)
    ];
    export let COLOR_PIT_NAME = {
        [3]: {
            color: cc.color(235, 164, 147),
            outlineColor: cc.color(54, 2, 2)
        },
        [4]: {
            color: cc.color(205, 216, 246),
            outlineColor: cc.color(30, 34, 48)
        },
        [5]: {
            color: cc.color(255, 228, 0),
            outlineColor: cc.color(89, 20, 2)
        }
    };
    export let getPetColor = function (index) {
        return PET_COLORS[index - 1];
    };
    export let getOfficialColor = function (index) {
        // return COLOR_OFFICIAL_RANK[index+1];
        return COLOR_OFFICIAL_RANK[index];
    };
    export let getOfficialColorOutline = function (index) {
        // return COLOR_OFFICIAL_RANK_OUTLINE[index+1];
        return COLOR_OFFICIAL_RANK_OUTLINE[index];
    };
    export let getOfficialColorOutlineEx = function (index) {
        var isShow = isOfficialColorOutlineShow(index);
        if (isShow) {
            return getOfficialColorOutline(index);
        } else {
            return null;
        }
    };
    export let getColor = function (index: number, isDark?: boolean) {
        if (!isDark) {
            return COLOR_QUALITY[index - 1];
        } else {
            return getDarkColor(index);
        }
    };
    export let getColorLight = function (index) {
        return COLOR_QUALITY_LIGHT[index -1];
    };
    export let getColorOutline = function (index) {
        return COLOR_QUALITY_OUTLINE[index - 1];
    };
    export let isColorOutlineShow = function (index) {
        console.assert(COLOR_QUALITY_OUTLINE_SHOW[index - 1] != null, 'Invalid color outline show: ' + (index - 1));
        return COLOR_QUALITY_OUTLINE_SHOW[index - 1];
    };
    export let isOfficialColorOutlineShow = function (index) {
        console.assert(COLOR_OFFICIAL_RANK_OUTLINE_SHOW[index] != null, 'Invalid official rank color outline show: ' + (index));
        return COLOR_OFFICIAL_RANK_OUTLINE_SHOW[index];
    };
    export let getNumberColor = function (index) {
        return NUMBER_QUALITY[index - 1];
    };
    export let getNumberColorOutline = function (index) {
        return NUMBER_QUALITY_OUTLINE[index - 1];
    };
    export let getColorsByServerColorData = function (colorType, colorValue) {
        if (colorType == undefined || colorValue == undefined) {
            return [
                null,
                null
            ];
        }
        if (colorType == RollNoticeConst.NOTICE_COLOR_COLOR) {
            return colorValue;
        } else if (colorType == RollNoticeConst.NOTICE_COLOR_USER) {
            return [
                getOfficialColor(colorValue),
                getOfficialColorOutline(colorValue)
            ];
        } else if (colorType == 2) {
            return [
                getColor(colorValue, false),
                getColorOutline(colorValue)
            ];
        } else if (colorType == RollNoticeConst.NOTICE_COLOR_EQUIPMENT) {
            return [
                getColor(colorValue, false),
                getColorOutline(colorValue)
            ];
        }
    };
    export let getRankColor2 = function () {
        return [
            CLASS_GREEN,
            CLASS_GREEN_OUTLINE
        ];
    };
    export let getCritPromptColor = function (crt) {
        var colorData = crtColors[crt - 1];
        if (!colorData) {
            colorData = crtColors[crtColors.length - 1];
        }
        return colorData.color;
    };
    export let getCritPromptColorOutline = function (crt) {
        var colorData = crtColors[crt - 1];
        if (!colorData) {
            colorData = crtColors[crtColors.length - 1];
        }
        return colorData.outlineColor;
    };
    export let getGuildFlagColor = function (index) {
        return COLOR_GUILD_FLAGS[index - 1];
    };
    export let getGuildFlagColorOutline = function (index) {
        return COLOR_GUILD_FLAGS_OUTLINE[index - 1];
    };

    export let TacticsActiveColor = cc.color(0, 255, 30);
    export let TacticsBlackColor = cc.color(0, 0, 0);
    export let TacticsGrayColor = cc.color(228, 228, 228);
    export let TacticsCommonColor = cc.color(180, 100, 20);
    export let TacticsCommonColor2 = cc.color(113, 67, 6);
    export let TacticsBlueColor = cc.color(17, 178, 0);
    export let TacticsDescriptionColor = cc.color(180, 100, 20);
};