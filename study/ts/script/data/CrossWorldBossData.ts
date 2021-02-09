import { ConfigNameConst } from "../const/ConfigNameConst";
import { CrossWorldBossConst } from "../const/CrossWorldBossConst";
import { FunctionConst } from "../const/FunctionConst";
import { MessageIDConst } from "../const/MessageIDConst";
import { SignalConst } from "../const/SignalConst";
import { TimeLimitActivityConst } from "../const/TimeLimitActivityConst";
import { G_ConfigLoader, G_NetworkManager, G_ServerTime, G_ServiceManager, G_SignalManager, G_StorageManager, G_UserData } from "../init";
import { CrossWorldBossHelperT } from "../scene/view/crossWorldBoss/CrossWorldBossHelperT";
import { UserDataHelper } from "../utils/data/UserDataHelper";
import { clone2 } from "../utils/GlobleFunc";
import { handler } from "../utils/handler";
import { FunctionCheck } from "../utils/logic/FunctionCheck";
import { table } from "../utils/table";
import { BaseData } from "./BaseData";



export interface CrossWorldBossData {
    getBossPos(): object
    setBossPos(data: object): void
    getLeftAttackPos(): object
    setLeftAttackPos(data: object): void
    getRightAttackPos(): object
    setRightAttackPos(data: object): void
    getNormalPos(): Array<any>
    setNormalPos(data: object): void
    getPozhenPos(): Array<any>
    setPozhenPos(data: object): void
    getBoss_id(): number
    setBoss_id(data: number): void
    getStart_time(): number
    setStart_time(data: number): void
    getEnd_time(): number
    setEnd_time(data: number): void
    getAvailable_time(): number
    setAvailable_time(data: number): void
    getShow_time(): number
    setShow_time(data: number): void
    getUser_point(): number
    setUser_point(data: number): void
    getChallenge_boss_time(): number
    setChallenge_boss_time(data: number): void
    getChallenge_user_time(): number
    setChallenge_user_time(data: number): void
    getStamina(): number
    setStamina(data: number): void
    getTotal_stamina(): number
    setTotal_stamina(data: number): void
    getUsers(): any[]
    setUsers(data: any[]): void
    getState(): number
    setState(data: number): void
    getSelf_camp(): number
    setSelf_camp(data: number): void
    isIs_end(): boolean
    setIs_end(data: boolean): void
    isFakeTime(): boolean
    setFakeTime(data: boolean): void
    isChatOpen(): boolean
    setChatOpen(data: boolean): void
    getEnd_notice(): object
    setEnd_notice(data: object): void
    getActivityState(): number
    setActivityState(data: number): void
    getState_startTime(): number
    setState_startTime(data: number): void
    getSelf_user_rank(): number
    setSelf_user_rank(data: number): void
    getSelf_guild_rank(): number
    setSelf_guild_rank(data: number): void
    getGuild_point(): number
    setGuild_point(data: number): void
    getUser_rank(): object
    setUser_rank(data: object): void
    getGuild_rank(): object
    setGuild_rank(data: object): void
    isFirst_enter(): boolean
    setFirst_enter(data: boolean): void
    setVote_info(value:Array<any>):void
    getVote_info():Array<any>
}

var schema = {};
schema['bossPos'] = [
    'object',
    {
        x: 0,
        y: 0
    }
];
schema['leftAttackPos'] = [
    'object',
    {
        x: 0,
        y: 0
    }
];
schema['rightAttackPos'] = [
    'object',
    {
        x: 0,
        y: 0
    }
];
schema['normalPos'] = [
    'array',
    []
];
schema['pozhenPos'] = [
    'array',
    []
];
schema['boss_id'] = [
    'number',
    0
];
schema['start_time'] = [
    'number',
    0
];
schema['end_time'] = [
    'number',
    0
];
schema['available_time'] = [
    'number',
    0
];
schema['show_time'] = [
    'number',
    0
];
schema['user_point'] = [
    'number',
    0
];
schema['challenge_boss_time'] = [
    'number',
    0
];
schema['challenge_user_time'] = [
    'number',
    0
];
schema['stamina'] = [
    'number',
    0
];
schema['total_stamina'] = [
    'number',
    0
];
schema['users'] = [
    'object',
    {}
];
schema['state'] = [
    'number',
    0
];
schema['self_camp'] = [
    'number',
    0
];
schema['is_end'] = [
    'boolean',
    false
];
schema['fakeTime'] = [
    'boolean',
    false
];
schema['chatOpen'] = [
    'boolean',
    false
];
schema['end_notice'] = [
    'object',
    {}
];
schema['activityState'] = [
    'number',
    0
];
schema['state_startTime'] = [
    'number',
    0
];
schema['self_user_rank'] = [
    'number',
    0
];
schema['self_guild_rank'] = [
    'number',
    0
];
schema['guild_point'] = [
    'number',
    0
];
schema['user_rank'] = [
    'object',
    {}
];
schema['guild_rank'] = [
    'object',
    {}
];
schema['first_enter'] = [
    'boolean',
    false
];
schema['vote_info'] = [
    'object',
    {}
];
let maxYArray = [
    377.690399861,
    377.91887867746,
    378.14647346179,
    378.37318978368,
    378.59903314487,
    378.82400898035,
    379.04812265947,
    379.27137948704,
    379.49378470438,
    379.71534349043,
    379.93606096273,
    380.15594217845,
    380.3749921354,
    380.59321577294,
    380.81061797299,
    381.02720356091,
    381.24297730643,
    381.45794392455,
    381.67210807638,
    381.88547437,
    382.09804736133,
    382.3098315549,
    382.52083140468,
    382.73105131487,
    382.94049564065,
    383.14916868895,
    383.35707471918,
    383.56421794396,
    383.77060252983,
    383.97623259795,
    384.18111222478,
    384.38524544276,
    384.58863624093,
    384.79128856562,
    384.99320632107,
    385.19439337003,
    385.39485353439,
    385.59459059575,
    385.79360829606,
    385.99191033813,
    386.18950038622,
    386.38638206661,
    386.58255896812,
    386.77803464265,
    386.9728126057,
    387.1668963369,
    387.36028928049,
    387.55299484582,
    387.74501640787,
    387.93635730766,
    388.12702085279,
    388.31701031786,
    388.50632894491,
    388.69497994393,
    388.8829664932,
    389.0702917398,
    389.25695879999,
    389.44297075964,
    389.62833067464,
    389.81304157126,
    389.9971064466,
    390.18052826893,
    390.36330997812,
    390.54545448594,
    390.7269646765,
    390.90784340655,
    391.08809350588,
    391.26771777765,
    391.44671899873,
    391.62509992002,
    391.80286326684,
    391.98001173917,
    392.15654801206,
    392.33247473586,
    392.5077945366,
    392.68251001626,
    392.85662375306,
    393.03013830178,
    393.20305619406,
    393.37537993862,
    393.54711202164,
    393.71825490695,
    393.88881103635,
    394.05878282984,
    394.22817268594,
    394.3969829819,
    394.56521607397,
    394.73287429766,
    394.89995996797,
    395.06647537965,
    395.23242280744,
    395.3978045063,
    395.56262271163,
    395.72687963951,
    395.89057748696,
    396.05371843209,
    396.21630463437,
    396.37833823484,
    396.53982135632,
    396.70075610359,
    396.86114456365,
    397.02098880587,
    397.18029088223,
    397.33905282748,
    397.49727665937,
    397.65496437881,
    397.81211797009,
    397.96873940103,
    398.12483062319,
    398.28039357205,
    398.43543016716,
    398.58994231233,
    398.74393189584,
    398.89740079053,
    399.05035085406,
    399.20278392899,
    399.35470184299,
    399.50610640901,
    399.65699942541,
    399.80738267611,
    399.95725793079,
    400.10662694498,
    400.25549146027,
    400.4038532044,
    400.55171389147,
    400.69907522201,
    400.84593888319,
    400.9923065489,
    401.13817987994,
    401.28356052411,
    401.4284501164,
    401.57285027906,
    401.71676262175,
    401.86018874171,
    402.00313022383,
    402.1455886408,
    402.28756555323,
    402.42906250979,
    402.5700810473,
    402.71062269088,
    402.85068895401,
    402.99028133873,
    403.12940133569,
    403.26805042428,
    403.40623007275,
    403.54394173829,
    403.6811868672,
    403.81796689492,
    403.95428324619,
    404.09013733514,
    404.22553056537,
    404.3604643301,
    404.49494001221,
    404.6289589844,
    404.76252260922,
    404.89563223923,
    405.02828921707,
    405.16049487554,
    405.2922505377,
    405.42355751698,
    405.55441711726,
    405.68483063294,
    405.81479934905,
    405.94432454134,
    406.07340747634,
    406.20204941149,
    406.33025159516,
    406.4580152668,
    406.58534165699,
    406.71223198749,
    406.83868747138,
    406.9647093131,
    407.09029870855,
    407.21545684515,
    407.3401849019,
    407.46448404952,
    407.58835545044,
    407.71180025893,
    407.83481962117,
    407.95741467529,
    408.07958655146,
    408.20133637198,
    408.3226652513,
    408.44357429613,
    408.56406460551,
    408.68413727083,
    408.80379337596,
    408.92303399725,
    409.04186020364,
    409.16027305672,
    409.27827361078,
    409.39586291286,
    409.51304200285,
    409.6298119135,
    409.74617367054,
    409.86212829267,
    409.97767679169,
    410.09282017252,
    410.20755943323,
    410.32189556516,
    410.43582955294,
    410.54936237454,
    410.66249500133,
    410.77522839817,
    410.88756352338,
    410.99950132891,
    411.11104276026,
    411.22218875666,
    411.33294025103,
    411.44329817005,
    411.55326343426,
    411.66283695804,
    411.7720196497,
    411.88081241153,
    411.98921613982,
    412.09723172493,
    412.20486005134,
    412.31210199769,
    412.4189584368,
    412.52543023576,
    412.63151825596,
    412.73722335311,
    412.84254637732,
    412.94748817311,
    413.05204957948,
    413.15623142994,
    413.26003455256,
    413.36345976999,
    413.46650789954,
    413.56917975318,
    413.6714761376,
    413.77339785425,
    413.87494569938,
    413.97612046409,
    414.07692293432,
    414.17735389096,
    414.27741410984,
    414.37710436177,
    414.47642541259,
    414.57537802322,
    414.67396294965,
    414.77218094303,
    414.87003274966,
    414.96751911108,
    415.06464076404,
    415.16139844057,
    415.25779286802,
    415.35382476908,
    415.44949486181,
    415.54480385969,
    415.63975247164,
    415.73434140205,
    415.82857135082,
    415.9224430134,
    416.0159570808,
    416.10911423963,
    416.20191517213,
    416.29436055623,
    416.38645106551,
    416.47818736931,
    416.56957013272,
    416.66060001658,
    416.75127767757,
    416.84160376822,
    416.93157893689,
    417.02120382788,
    417.11047908139,
    417.19940533357,
    417.28798321655,
    417.3762133585,
    417.46409638357,
    417.55163291201,
    417.63882356014,
    417.7256689404,
    417.81216966136,
    417.89832632777,
    417.98413954055,
    418.06960989683,
    418.15473799001,
    418.23952440973,
    418.32396974191,
    418.40807456881,
    418.49183946901,
    418.57526501743,
    418.65835178541,
    418.74110034068,
    418.82351124738,
    418.90558506614,
    418.98732235403,
    419.06872366462,
    419.14978954803,
    419.23052055089,
    419.31091721639,
    419.39098008433,
    419.47070969108,
    419.55010656967,
    419.62917124976,
    419.70790425767,
    419.78630611641,
    419.86437734573,
    419.94211846205,
    420.0195299786,
    420.09661240533,
    420.173366249,
    420.24979201317,
    420.32589019823,
    420.4016613014,
    420.4771058168,
    420.55222423539,
    420.62701704505,
    420.70148473058,
    420.77562777371,
    420.84944665313,
    420.92294184451,
    420.99611382049,
    421.06896305073,
    421.14149000192,
    421.21369513778,
    421.28557891911,
    421.35714180375,
    421.42838424666,
    421.49930669992,
    421.56990961269,
    421.64019343132,
    421.71015859929,
    421.77980555726,
    421.84913474308,
    421.9181465918,
    421.98684153571,
    422.0552200043,
    422.12328242434,
    422.19102921986,
    422.25846081216,
    422.32557761985,
    422.39238005885,
    422.45886854238,
    422.52504348103,
    422.59090528272,
    422.65645435276,
    422.72169109382,
    422.78661590598,
    422.85122918671,
    422.91553133094,
    422.97952273099,
    423.04320377665,
    423.10657485519,
    423.16963635133,
    423.23238864729,
    423.29483212279,
    423.35696715507,
    423.41879411887,
    423.48031338651,
    423.54152532784,
    423.60243031027,
    423.6630286988,
    423.72332085601,
    423.78330714208,
    423.84298791481,
    423.90236352961,
    423.96143433954,
    424.02020069531,
    424.07866294526,
    424.13682143544,
    424.19467650956,
    424.25222850902,
    424.30947777293,
    424.36642463812,
    424.42306943912,
    424.47941250823,
    424.53545417548,
    424.59119476865,
    424.64663461331,
    424.70177403278,
    424.75661334819,
    424.81115287845,
    424.86539294031,
    424.9193338483,
    424.9729759148,
    425.02631945003,
    425.07936476205,
    425.13211215678,
    425.184561938,
    425.23671440738,
    425.28856986448,
    425.34012860673,
    425.39139092948,
    425.44235712601,
    425.49302748748,
    425.54340230302,
    425.59348185969,
    425.64326644249,
    425.69275633439,
    425.74195181632,
    425.79085316717,
    425.83946066385,
    425.88777458123,
    425.9357951922,
    425.98352276763,
    426.03095757644,
    426.07809988557,
    426.12494995996,
    426.17150806263,
    426.21777445462,
    426.26374939505,
    426.30943314109,
    426.35482594798,
    426.39992806904,
    426.44473975568,
    426.48926125741,
    426.53349282182,
    426.57743469464,
    426.6210871197,
    426.66445033893,
    426.70752459244,
    426.75031011842,
    426.79280715326,
    426.83501593146,
    426.8769366857,
    426.91856964681,
    426.9599150438,
    427.00097310385,
    427.04174405234,
    427.08222811282,
    427.12242550706,
    427.16233645502,
    427.20196117486,
    427.24129988298,
    427.28035279398,
    427.31912012071,
    427.35760207424,
    427.39579886388,
    427.4337106972,
    427.47133778,
    427.50868031636,
    427.54573850861,
    427.58251255735,
    427.61900266148,
    427.65520901815,
    427.6911318228,
    427.72677126918,
    427.76212754932,
    427.79720085357,
    427.83199137057,
    427.86649928728,
    427.90072478899,
    427.9346680593,
    427.96832928013,
    428.00170863176,
    428.03480629279,
    428.06762244017,
    428.1001572492,
    428.13241089353,
    428.16438354517,
    428.19607537448,
    428.22748655022,
    428.25861723949,
    428.28946760778,
    428.32003781897,
    428.35032803531,
    428.38033841744,
    428.41006912441,
    428.43952031366,
    428.46869214103,
    428.49758476078,
    428.52619832556,
    428.55453298646,
    428.58258889298,
    428.61036619304,
    428.63786503298,
    428.6650855576,
    428.69202791011,
    428.71869223217,
    428.74507866388,
    428.77118734379,
    428.7970184089,
    428.82257199466,
    428.847848235,
    428.87284726228,
    428.89756920734,
    428.92201419949,
    428.94618236651,
    428.97007383467,
    428.99368872869,
    429.0170271718,
    429.04008928569,
    429.06287519056,
    429.0853850051,
    429.10761884649,
    429.1295768304,
    429.15125907101,
    429.17266568101,
    429.19379677159,
    429.21465245245,
    429.23523283181,
    429.25553801639,
    429.27556811144,
    429.29532322074,
    429.31480344658,
    429.33400888978,
    429.3529396497,
    429.37159582421,
    429.38997750974,
    429.40808480124,
    429.42591779221,
    429.44347657469,
    429.46076123925,
    429.47777187502,
    429.4945085697,
    429.51097140949,
    429.5271604792,
    429.54307586215,
    429.55871764025,
    429.57408589395,
    429.58918070227,
    429.6040021428,
    429.61855029169,
    429.63282522366,
    429.646827012,
    429.66055572857,
    429.6740114438,
    429.68719422671,
    429.70010414489,
    429.7127412645,
    429.7251056503,
    429.73719736562,
    429.74901647237,
    429.76056303106,
    429.77183710077,
    429.78283873919,
    429.7935680026,
    429.80402494583,
    429.81420962237,
    429.82412208425,
    429.83376238211,
    429.84313056522,
    429.85222668139,
    429.86105077709,
    429.86960289735,
    429.87788308581,
    429.88589138473,
    429.89362783495,
    429.90109247594,
    429.90828534576,
    429.91520648109,
    429.92185591719,
    429.92823368798,
    429.93433982593,
    429.94017436217,
    429.94573732641,
    429.951028747,
    429.95604865087,
    429.9607970636,
    429.96527400936,
    429.96947951094,
    429.97341358974,
    429.97707626581,
    429.98046755776,
    429.98358748287,
    429.98643605701,
    429.98901329466,
    429.99131920896,
    429.99335381162,
    429.99511711299,
    429.99660912205,
    429.99782984639,
    429.99877929222,
    429.99945746436,
    429.99986436626,
    430,
    429.99986436626,
    429.99945746436,
    429.99877929222,
    429.99782984639,
    429.99660912205,
    429.99511711299,
    429.99335381162,
    429.99131920896,
    429.98901329466,
    429.98643605701,
    429.98358748287,
    429.98046755776,
    429.97707626581,
    429.97341358974,
    429.96947951094,
    429.96527400936,
    429.9607970636,
    429.95604865087,
    429.951028747,
    429.94573732641,
    429.94017436217,
    429.93433982593,
    429.92823368798,
    429.92185591719,
    429.91520648109,
    429.90828534576,
    429.90109247594,
    429.89362783495,
    429.88589138473,
    429.87788308581,
    429.86960289735,
    429.86105077709,
    429.85222668139,
    429.84313056522,
    429.83376238211,
    429.82412208425,
    429.81420962237,
    429.80402494583,
    429.7935680026,
    429.78283873919,
    429.77183710077,
    429.76056303106,
    429.74901647237,
    429.73719736562,
    429.7251056503,
    429.7127412645,
    429.70010414489,
    429.68719422671,
    429.6740114438,
    429.66055572857,
    429.646827012,
    429.63282522366,
    429.61855029169,
    429.6040021428,
    429.58918070227,
    429.57408589395,
    429.55871764025,
    429.54307586215,
    429.5271604792,
    429.51097140949,
    429.4945085697,
    429.47777187502,
    429.46076123925,
    429.44347657469,
    429.42591779221,
    429.40808480124,
    429.38997750974,
    429.37159582421,
    429.3529396497,
    429.33400888978,
    429.31480344658,
    429.29532322074,
    429.27556811144,
    429.25553801639,
    429.23523283181,
    429.21465245245,
    429.19379677159,
    429.17266568101,
    429.15125907101,
    429.1295768304,
    429.10761884649,
    429.0853850051,
    429.06287519056,
    429.04008928569,
    429.0170271718,
    428.99368872869,
    428.97007383467,
    428.94618236651,
    428.92201419949,
    428.89756920734,
    428.87284726228,
    428.847848235,
    428.82257199466,
    428.7970184089,
    428.77118734379,
    428.74507866388,
    428.71869223217,
    428.69202791011,
    428.6650855576,
    428.63786503298,
    428.61036619304,
    428.58258889298,
    428.55453298646,
    428.52619832556,
    428.49758476078,
    428.46869214103,
    428.43952031366,
    428.41006912441,
    428.38033841744,
    428.35032803531,
    428.32003781897,
    428.28946760778,
    428.25861723949,
    428.22748655022,
    428.19607537448,
    428.16438354517,
    428.13241089353,
    428.1001572492,
    428.06762244017,
    428.03480629279,
    428.00170863176,
    427.96832928013,
    427.9346680593,
    427.90072478899,
    427.86649928728,
    427.83199137057,
    427.79720085357,
    427.76212754932,
    427.72677126918,
    427.6911318228,
    427.65520901815,
    427.61900266148,
    427.58251255735,
    427.54573850861,
    427.50868031636,
    427.47133778,
    427.4337106972,
    427.39579886388,
    427.35760207424,
    427.31912012071,
    427.28035279398,
    427.24129988298,
    427.20196117486,
    427.16233645502,
    427.12242550706,
    427.08222811282,
    427.04174405234,
    427.00097310385,
    426.9599150438,
    426.91856964681,
    426.8769366857,
    426.83501593146,
    426.79280715326,
    426.75031011842,
    426.70752459244,
    426.66445033893,
    426.6210871197,
    426.57743469464,
    426.53349282182,
    426.48926125741,
    426.44473975568,
    426.39992806904,
    426.35482594798,
    426.30943314109,
    426.26374939505,
    426.21777445462,
    426.17150806263,
    426.12494995996,
    426.07809988557,
    426.03095757644,
    425.98352276763,
    425.9357951922,
    425.88777458123,
    425.83946066385,
    425.79085316717,
    425.74195181632,
    425.69275633439,
    425.64326644249,
    425.59348185969,
    425.54340230302,
    425.49302748748,
    425.44235712601,
    425.39139092948,
    425.34012860673,
    425.28856986448,
    425.23671440738,
    425.184561938,
    425.13211215678,
    425.07936476205,
    425.02631945003,
    424.9729759148,
    424.9193338483,
    424.86539294031,
    424.81115287845,
    424.75661334819,
    424.70177403278,
    424.64663461331,
    424.59119476865,
    424.53545417548,
    424.47941250823,
    424.42306943912,
    424.36642463812,
    424.30947777293,
    424.25222850902,
    424.19467650956,
    424.13682143544,
    424.07866294526,
    424.02020069531,
    423.96143433954,
    423.90236352961,
    423.84298791481,
    423.78330714208,
    423.72332085601,
    423.6630286988,
    423.60243031027,
    423.54152532784,
    423.48031338651,
    423.41879411887,
    423.35696715507,
    423.29483212279,
    423.23238864729,
    423.16963635133,
    423.10657485519,
    423.04320377665,
    422.97952273099,
    422.91553133094,
    422.85122918671,
    422.78661590598,
    422.72169109382,
    422.65645435276,
    422.59090528272,
    422.52504348103,
    422.45886854238,
    422.39238005885,
    422.32557761985,
    422.25846081216,
    422.19102921986,
    422.12328242434,
    422.0552200043,
    421.98684153571,
    421.9181465918,
    421.84913474308,
    421.77980555726,
    421.71015859929,
    421.64019343132,
    421.56990961269,
    421.49930669992,
    421.42838424666,
    421.35714180375,
    421.28557891911,
    421.21369513778,
    421.14149000192,
    421.06896305073,
    420.99611382049,
    420.92294184451,
    420.84944665313,
    420.77562777371,
    420.70148473058,
    420.62701704505,
    420.55222423539,
    420.4771058168,
    420.4016613014,
    420.32589019823,
    420.24979201317,
    420.173366249,
    420.09661240533,
    420.0195299786,
    419.94211846205,
    419.86437734573,
    419.78630611641,
    419.70790425767,
    419.62917124976,
    419.55010656967,
    419.47070969108,
    419.39098008433,
    419.31091721639,
    419.23052055089,
    419.14978954803,
    419.06872366462,
    418.98732235403,
    418.90558506614,
    418.82351124738,
    418.74110034068,
    418.65835178541,
    418.57526501743,
    418.49183946901,
    418.40807456881,
    418.32396974191,
    418.23952440973,
    418.15473799001,
    418.06960989683,
    417.98413954055,
    417.89832632777,
    417.81216966136,
    417.7256689404,
    417.63882356014,
    417.55163291201,
    417.46409638357,
    417.3762133585,
    417.28798321655,
    417.19940533357,
    417.11047908139,
    417.02120382788,
    416.93157893689,
    416.84160376822,
    416.75127767757,
    416.66060001658,
    416.56957013272,
    416.47818736931,
    416.38645106551,
    416.29436055623,
    416.20191517213,
    416.10911423963,
    416.0159570808,
    415.9224430134,
    415.82857135082,
    415.73434140205,
    415.63975247164,
    415.54480385969,
    415.44949486181,
    415.35382476908,
    415.25779286802,
    415.16139844057,
    415.06464076404,
    414.96751911108,
    414.87003274966,
    414.77218094303,
    414.67396294965,
    414.57537802322,
    414.47642541259,
    414.37710436177,
    414.27741410984,
    414.17735389096,
    414.07692293432,
    413.97612046409,
    413.87494569938,
    413.77339785425,
    413.6714761376,
    413.56917975318,
    413.46650789954,
    413.36345976999,
    413.26003455256,
    413.15623142994,
    413.05204957948,
    412.94748817311,
    412.84254637732,
    412.73722335311,
    412.63151825596,
    412.52543023576,
    412.4189584368,
    412.31210199769,
    412.20486005134,
    412.09723172493,
    411.98921613982,
    411.88081241153,
    411.7720196497,
    411.66283695804,
    411.55326343426,
    411.44329817005,
    411.33294025103,
    411.22218875666,
    411.11104276026,
    410.99950132891,
    410.88756352338,
    410.77522839817,
    410.66249500133,
    410.54936237454,
    410.43582955294,
    410.32189556516,
    410.20755943323,
    410.09282017252,
    409.97767679169,
    409.86212829267,
    409.74617367054,
    409.6298119135,
    409.51304200285,
    409.39586291286,
    409.27827361078,
    409.16027305672,
    409.04186020364,
    408.92303399725,
    408.80379337596,
    408.68413727083,
    408.56406460551,
    408.44357429613,
    408.3226652513,
    408.20133637198,
    408.07958655146,
    407.95741467529,
    407.83481962117,
    407.71180025893,
    407.58835545044,
    407.46448404952,
    407.3401849019,
    407.21545684515,
    407.09029870855,
    406.9647093131,
    406.83868747138,
    406.71223198749,
    406.58534165699,
    406.4580152668,
    406.33025159516,
    406.20204941149,
    406.07340747634,
    405.94432454134,
    405.81479934905,
    405.68483063294,
    405.55441711726,
    405.42355751698,
    405.2922505377,
    405.16049487554,
    405.02828921707,
    404.89563223923,
    404.76252260922,
    404.6289589844,
    404.49494001221,
    404.3604643301,
    404.22553056537,
    404.09013733514,
    403.95428324619,
    403.81796689492,
    403.6811868672,
    403.54394173829,
    403.40623007275,
    403.26805042428,
    403.12940133569,
    402.99028133873,
    402.85068895401,
    402.71062269088,
    402.5700810473,
    402.42906250979,
    402.28756555323,
    402.1455886408,
    402.00313022383,
    401.86018874171,
    401.71676262175,
    401.57285027906,
    401.4284501164,
    401.28356052411,
    401.13817987994,
    400.9923065489,
    400.84593888319,
    400.69907522201,
    400.55171389147,
    400.4038532044,
    400.25549146027,
    400.10662694498,
    399.95725793079,
    399.80738267611,
    399.65699942541,
    399.50610640901,
    399.35470184299,
    399.20278392899,
    399.05035085406,
    398.89740079053,
    398.74393189584,
    398.58994231233,
    398.43543016716,
    398.28039357205,
    398.12483062319,
    397.96873940103,
    397.81211797009,
    397.65496437881,
    397.49727665937,
    397.33905282748,
    397.18029088223,
    397.02098880587,
    396.86114456365,
    396.70075610359,
    396.53982135632,
    396.37833823484,
    396.21630463437,
    396.05371843209,
    395.89057748696,
    395.72687963951,
    395.56262271163,
    395.3978045063,
    395.23242280744,
    395.06647537965,
    394.89995996797,
    394.73287429766,
    394.56521607397,
    394.3969829819,
    394.22817268594,
    394.05878282984,
    393.88881103635,
    393.71825490695,
    393.54711202164,
    393.37537993862,
    393.20305619406,
    393.03013830178,
    392.85662375306,
    392.68251001626,
    392.5077945366,
    392.33247473586,
    392.15654801206,
    391.98001173917,
    391.80286326684,
    391.62509992002,
    391.44671899873,
    391.26771777765,
    391.08809350588,
    390.90784340655,
    390.7269646765,
    390.54545448594,
    390.36330997812,
    390.18052826893,
    389.9971064466,
    389.81304157126,
    389.62833067464,
    389.44297075964,
    389.25695879999,
    389.0702917398,
    388.8829664932,
    388.69497994393,
    388.50632894491,
    388.31701031786,
    388.12702085279,
    387.93635730766,
    387.74501640787,
    387.55299484582,
    387.36028928049,
    387.1668963369,
    386.9728126057,
    386.77803464265,
    386.58255896812,
    386.38638206661,
    386.18950038622,
    385.99191033813,
    385.79360829606,
    385.59459059575,
    385.39485353439,
    385.19439337003,
    384.99320632107,
    384.79128856562,
    384.58863624093,
    384.38524544276,
    384.18111222478,
    383.97623259795,
    383.77060252983,
    383.56421794396,
    383.35707471918,
    383.14916868895,
    382.94049564065,
    382.73105131487,
    382.52083140468,
    382.3098315549,
    382.09804736133,
    381.88547437,
    381.67210807638,
    381.45794392455,
    381.24297730643,
    381.02720356091,
    380.81061797299,
    380.59321577294,
    380.3749921354,
    380.15594217845,
    379.93606096273,
    379.71534349043,
    379.49378470438,
    379.27137948704,
    379.04812265947,
    378.82400898035,
    378.59903314487,
    378.37318978368,
    378.14647346179,
    377.91887867746,
    377.690399861
];
export  class CrossWorldBossData extends BaseData {
    name: 'CrossWorldBossData';
    static maxYArray = maxYArray;
    static schema = schema;
    private _msgEnterCrossWorldBoss: any;
    private _msgAttackCrossWorldBoss: any;
    private _msgGetCrossWorldBossGrabList: any;
    private _msgGrabCrossWorldBossPoint: any;
    private _msgGetCrossWorldBossInfo: any;
    private _msgUpdateCrossWorldBossRank: any;
    private _msgCrossWorldBossVote:any;
    private _msgCrossGetWorldBossVoteInfo:any;
    constructor(properties?) {
        super(properties);

        this._msgCrossWorldBossVote = G_NetworkManager.add(MessageIDConst.ID_S2C_CrossWorldBossVote,this._s2cCrossWorldBossVote.bind(this));
        this._msgCrossGetWorldBossVoteInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_GetCrossWorldBossVoteInfo,this._s2cGetCrossWorldBossVoteInfo.bind(this));

        this._msgEnterCrossWorldBoss = G_NetworkManager.add(MessageIDConst.ID_S2C_EnterCrossWorldBoss, handler(this, this._s2cEnterCrossWorldBoss));
        this._msgAttackCrossWorldBoss = G_NetworkManager.add(MessageIDConst.ID_S2C_AttackCrossWorldBoss, handler(this, this._s2cAttackCrossWorldBoss));
        this._msgGetCrossWorldBossGrabList = G_NetworkManager.add(MessageIDConst.ID_S2C_GetCrossWorldBossGrabList, handler(this, this._s2cGetCrossWorldBossGrabList));
        this._msgGrabCrossWorldBossPoint = G_NetworkManager.add(MessageIDConst.ID_S2C_GrabCrossWorldBossPoint, handler(this, this._s2cGrabCrossWorldBossPoint));
        this._msgGetCrossWorldBossInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_GetCrossWorldBossInfo, handler(this, this._s2cGetCrossWorldBossInfo));
        this._msgUpdateCrossWorldBossRank = G_NetworkManager.add(MessageIDConst.ID_S2C_SyncCrossWorldBossRank, handler(this, this._s2cUpdateCrossWorldBossRank));
        this._initPositionInfo();
    }
    clear() {
        this._msgEnterCrossWorldBoss.remove();
        this._msgEnterCrossWorldBoss = null;
        this._msgAttackCrossWorldBoss.remove();
        this._msgAttackCrossWorldBoss = null;
        this._msgGetCrossWorldBossGrabList.remove();
        this._msgGetCrossWorldBossGrabList = null;
        this._msgGrabCrossWorldBossPoint.remove();
        this._msgGrabCrossWorldBossPoint = null;
        this._msgGetCrossWorldBossInfo.remove();
        this._msgGetCrossWorldBossInfo = null;
        this._msgUpdateCrossWorldBossRank.remove();
        this._msgUpdateCrossWorldBossRank = null;
        this._msgCrossWorldBossVote.remove();
        this._msgCrossWorldBossVote = null;
        this._msgCrossGetWorldBossVoteInfo.remove();
        this._msgCrossGetWorldBossVoteInfo = null;
    }
    reset() {
    }
    _calculateMaxY() {
        var result = [];
        for (var i = 0; i <= 1136; i++) {
            var n = 270 + Math.sqrt(160 * 160 - 160 * 160 * (i - 568) * (i - 568) / (768 * 768));
            table.insert(result, n);
        }
        G_StorageManager.save('result', result);
    }
    getMaxYByX(x):number {
        var maxY = 300;
        var result = CrossWorldBossData.maxYArray[x];
        if (result) {
            maxY = result;
        }
        return maxY;
    }
    getEndNoticeValue(key):number {
        var noticeTable = this.getEnd_notice();
        if (noticeTable) {
            return parseInt(noticeTable[key]);
        }
        return null;
    }
    needShopPromptDlg():boolean {
        var currTime = G_ServerTime.getTime();
        var [isCurrOpen] = this.isBossStart();
        var noticeTable = this.getEnd_notice();
        cc.log(noticeTable);
        var userId = G_UserData.getBase().getId();
        if (isCurrOpen == false && noticeTable && noticeTable['rank']) {
            var data = G_StorageManager.load('crossbossdata' + userId) || {};
            if (data.showNotice == '1') {
                return false;
            } else {
                data['showNotice'] = '1';
                G_StorageManager.save('crossbossdata' + userId, data);
                return true;
            }
        }
        return false;
    }
    isBossStart():Array<any> {
        var startTime = this.getStart_time();
        var endTime = this.getEnd_time();
        var isFakeTime = this.isFakeTime();
        if (isFakeTime) {
            return [false,null];
        }
        var currTime = G_ServerTime.getTime();
        if (currTime >= startTime && currTime <= endTime) {
            return [true,null];
        }
        return [
            false,
            startTime
        ];
    }
    isActivityAvailable():Array<any> {
        var availabelTime = CrossWorldBossHelperT.getAvailableTime();
        var endTime = this.getEnd_time();
        var currTime = G_ServerTime.getTime();
        if (availabelTime && availabelTime > 0 && currTime >= availabelTime && currTime <= endTime) {
            return [true,null];
        }
        return [
            false,
            availabelTime
        ];
    }
    _initPositionInfo() {
        var CrossAvatarPositionConfig = G_ConfigLoader.getConfig(ConfigNameConst.CROSS_BOSS_AVATAR_POSITION);
        var length = CrossAvatarPositionConfig.length();
        for (var i = 1; i <= length; i++) {
            var configInfo = CrossAvatarPositionConfig.get(i);
            var pos = {
                x: configInfo.x - cc.winSize.width/2+100,
                y: configInfo.y - cc.winSize.height/2
            };
            if (configInfo.type == CrossWorldBossConst.BOSS_TYPE_POSITION) {
                this.setBossPos(pos);
            } else if (configInfo.type == CrossWorldBossConst.ATTACK_TYPE_POSITION) {
                if (configInfo.x <= 0) {
                    this.setLeftAttackPos(pos);
                } else {
                    this.setRightAttackPos(pos);
                }
            } else if (configInfo.type == CrossWorldBossConst.NORMAL_TYPE_POSITION) {
                table.insert(this.getNormalPos(), [
                    pos,
                    configInfo.hitorder
                ]);
            } else if (configInfo.type == CrossWorldBossConst.POZHEN_TYPE_POSITION) {
                table.insert(this.getPozhenPos(), [
                    pos,
                    configInfo.hitorder
                ]);
            }
        }
    }
   
    _registerAlarmClock(startTime, endTime) {
        if (!startTime || !endTime) {
            return;
        }
        var curTime = G_ServerTime.getTime();
        if (curTime <= endTime) {
            G_ServiceManager.registerOneAlarmClock('CROSS_WORLD_BOSS_GET_NEXT', endTime + 1, function () {
                var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_CROSS_WORLD_BOSS)[0];
                if (isOpen) {
                    this.c2sEnterCrossWorldBoss();
                }
            });
        }
    }
    c2sEnterCrossWorldBoss() {
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_CROSS_WORLD_BOSS)[0];
        if (isOpen == false) {
            return;
        }
        G_NetworkManager.send(MessageIDConst.ID_C2S_EnterCrossWorldBoss, {});
    }
    _s2cEnterCrossWorldBoss(id, message) {
        cc.log(message);
        if (message.ret != 1) {
            return;
        }
        this.setBoss_id(message.boss_id);
        if (message.start_time == null || message.start_time == 0) {
            var [nextStartTime, nextEndTime] = CrossWorldBossHelperT.getNextStartEndTime();
            this.setStart_time(nextStartTime);
            this.setEnd_time(nextEndTime);
            this.setFakeTime(true);
        } else {
            this.setStart_time(message.start_time);
            this.setFakeTime(false);
        }
        this.setStamina(message[ 'stamina'] || 0);
        this.setTotal_stamina(message[ 'total_stamina'] || 0);
        this.setState(message[ 'state'] || 0);
        this.setSelf_camp(message[ 'self_camp'] || 0);
        this.setIs_end(message.is_end);
        this.setState_startTime(message[ 'state_time'] || 0);
        this.setChatOpen(message[ 'is_chat'] || false);
        this.setUser_point(message.user_point);
        this.setChallenge_boss_time(message.challenge_boss_time);
        this.setChallenge_user_time(message.challenge_user_time);
        var endNotice = {};
        function converEndNotice(message) {
            var noticeList = {};
            var endNotice = message[ 'end_notice'] || {};
            var endNoticeList = endNotice[ 'sys_notice'] || {};
            for (let i in endNoticeList) {
                var value = endNoticeList[i];
                noticeList[value.key] = value.value;
            }
            return noticeList;
        }
        this.setEnd_notice(converEndNotice(message));
        var showUsers = {};
        function convertUsers(message) {
            var userList = [];
            var serverList = message[ 'users'] || {};
            var userId = G_UserData.getBase().getId();
            for (let i in serverList) {
                var value = serverList[i];
                var [converId, playerInfo] = UserDataHelper.convertAvatarId(value);
                var data:any = {};
                data.userId = value.user_id;
                data.name = value.name;
                data.officialLevel = value.officer_level;
                data.baseId = converId;
                data.playerInfo = playerInfo;
                data.index = i;
                data.titleId = value.title;
                data.camp = value.camp;
                // if (data.userId == userId) {
                //     table.insertValueByPos(userList,0, data);
                // } else {
                //     table.insert(userList, data);
                // }
                table.insert(userList, data);
            }
            return userList;
        }
        this.setUsers(convertUsers(message));
        G_SignalManager.dispatch(SignalConst.EVENT_CROSS_WORLDBOSS_GET_INFO, message);
    }
    
    //判断是否有跨服boss
    public isHaveBoss():boolean{
        return this.getBoss_id()!=0;
    }

    //玩家报名
    public c2sCrossWorldBossVote():void{
        G_NetworkManager.send(MessageIDConst.ID_C2S_CrossWorldBossVote,{});
     }
     private _s2cCrossWorldBossVote(id,message):void{
         if (message.ret != 1) {
             return;
         }
         //再一次刷新
         this.c2sGetCrossWorldBossVoteInfo();
         G_SignalManager.dispatch(SignalConst.EVENT_CROSS_WORLD_BOSS_VOTE_SUCCESS,{})//报名成功
     }
     //获取玩家报名信息
     public c2sGetCrossWorldBossVoteInfo():void{
         G_NetworkManager.send(MessageIDConst.ID_C2S_GetCrossWorldBossVoteInfo,{});
     }
     private _s2cGetCrossWorldBossVoteInfo(id,message):void{
         if (message.ret != 1) {
             return;
         }
         this.setVote_info(message["vote_info"]);
         G_SignalManager.dispatch(SignalConst.EVENT_GET_CROSS_WORLD_BOSS_VOTE_INFO,{});
     }
     
     /**
      * 时间是否可以开启
      */
     public isTimeCanOpen():boolean{
        let isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_CROSS_WORLD_BOSS)[0];
        if (isOpen == false) {
            return false;
        }
        let curTime = G_ServerTime.getTime();
        let curWeek = G_ServerTime.getWeekdayAndHour(curTime)[0];
        let limitConfig = G_ConfigLoader.getConfig(ConfigNameConst.TIME_LIMIT_ACTIVITY);
        let crossConfig = limitConfig.get(19);
        let p = crossConfig.start_week.split("|");
        let openWeek = [];
        for(let j = 0;j<p.length;j++)
        {
            openWeek.push(parseInt(p[j]));
        }
        if(openWeek.indexOf(curWeek)<0)
        {
            //不在开启的时间段里
            return false;
        }
        let config = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
         let configInfor19 = config.get(2021);
         let p2 = configInfor19.content.split("|");
         let time2 = [parseInt(p2[0]),parseInt(p2[1])];
         let s1 = G_ServerTime.secondsFromToday(curTime)/60/60;
        if(time2[0]<s1&&time2[1]>s1)
         {
             //13 - 19
             return true;
         }
         return false;
     }
     /**
      * 是否可以报名
      */
     public isCanVote():boolean{
         if(this.getBoss_id()==0)
         {
             //没有boss 无法报名
             return false;
         }
         let isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_CROSS_WORLD_BOSS)[0];
         if (isOpen == false) {
             return false;
         }
         let curTime = G_ServerTime.getTime();
         let curWeek = G_ServerTime.getWeekdayAndHour(curTime)[0];
         let limitConfig = G_ConfigLoader.getConfig(ConfigNameConst.TIME_LIMIT_ACTIVITY);
         let crossConfig = limitConfig.get(19);
         let p = crossConfig.start_week.split("|");
         let openWeek = [];
         for(let j = 0;j<p.length;j++)
         {
             openWeek.push(parseInt(p[j]));
         }
         if(openWeek.indexOf(curWeek)<0)
         {
             //不在开启的时间段里
             return false;
         }

         let config = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
         let configInfor19 = config.get(2021);
         let p2 = configInfor19.content.split("|");
         let time2 = [parseInt(p2[0]),parseInt(p2[1])];
         let s1 = G_ServerTime.secondsFromToday(curTime)/60/60;
        if(time2[0]<s1&&time2[1]>s1)
         {
             //处于第二阶段报名
             return !this.isHasVote();
         }
 
         return false;
     }
     public isHasVote():boolean{
         if(this.isTimeCanOpen()==false)
         {
             //不在时间里 无论如何都没有报名数据的
             return false;
         }
         if(this.getBoss_id()==0)
         {
             //没有boss 无论如何都不可以报名的
             return false;
         }
         let userid = G_UserData.getBase().getId();
         let voteInfor: Array<any> = this.getVote_info();
         if (voteInfor && voteInfor.length > 0) {
             for (let j = 0; j < voteInfor.length; j++) {
                 if (voteInfor[j].ids.indexOf(userid) >= 0) {
                     //已经报名
                     return true;
                 }
             }
         }
         return false;
     }

    _updateCrossWorldBossRank(message) {
        if (message[ 'user_point']) {
            this.setUser_point(message.user_point || 0);
        }
        if (message[ 'guild_point']) {
            this.setGuild_point(message.guild_point || 0);
        }
        function convertUserRank(message) {
            var rankList = [];
            var userRankList = message[ 'user_rank'] || {};
            for (let i in userRankList) {
                var value = userRankList[i];
                var temp:any = {};
                temp.userId = value.user_id;
                temp.rank = value.rank;
                temp.name = value.name;
                temp.point = value.point;
                temp.official = value.office_level;
                temp.sid = value.sid;
                temp.sname = value.sname;
                table.insert(rankList, temp);
            }
            table.sort(rankList, function (sort1, sort2) {
                return sort1.rank < sort2.rank;
            });
            return rankList;
        }
        function convertGuildRank(message) {
            var rankList = [];
            var guildRankList = message[ 'guild_rank'] || {};
            for (let i in guildRankList) {
                var value = guildRankList[i];
                var temp:any = {};
                temp.guildId = value.guild_id;
                temp.rank = value.rank;
                temp.name = value.name;
                temp.point = value.point;
                temp.num = value.num;
                temp.sid = value.sid;
                temp.sname = value.sname;
                table.insert(rankList, temp);
            }
            table.sort(rankList, function (sort1, sort2) {
                return sort1.rank < sort2.rank;
            });
            return rankList;
        }
        if (message[ 'self_user_rank']) {
            this.setSelf_user_rank(message.self_user_rank || 0);
            this.setUser_rank(convertUserRank(message));
        }
        if (message[ 'self_guild_rank']) {
            this.setSelf_guild_rank(message.self_guild_rank || 0);
            this.setGuild_rank(convertGuildRank(message));
        }
    }
    c2sAttackCrossWorldBoss() {
        var message = {};
        G_NetworkManager.send(MessageIDConst.ID_C2S_AttackCrossWorldBoss, message);
    }
    _s2cAttackCrossWorldBoss(id, message) {
        if (message.ret != 1) {
            return;
        }
        this.setChallenge_boss_time(message[ 'attack_time'] || 0);
        this.setStamina(message[ 'stamina'] || 0);
        G_SignalManager.dispatch(SignalConst.EVENT_CROSS_WORLDBOSS_ATTACK_BOSS, message);
    }
    c2sGetCrossWorldBossGrabList() {
        var message = {};
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetCrossWorldBossGrabList, message);
    }
    _s2cGetCrossWorldBossGrabList(id, message) {
        if (message.ret != 1) {
            return;
        }
        function convertAvatarId(temp) {
            for (let i in temp.heroList) {
                var value = temp.heroList[i];
                temp.heroList[i] = [
                    value,
                    0
                ];
                if (value > 0 && value < 100 && temp.avatarId > 0) {
                    var [baseId,limit] = UserDataHelper.convertToBaseIdByAvatarBaseId(temp.avatarId);
                    temp.heroList[i] = [
                        baseId,
                        limit
                    ];
                }
            }
            return temp;
        }
        function convertGrabList(message) {
            var rankList = [];
            var grabList = message[ 'list'] || {};
            for (let i in grabList) {
                var value = grabList[i];
                var temp:any = {};
                if (value.rank > 0) {
                    temp.userId = value.user_id;
                    temp.rank = value.rank;
                    temp.name = value.name;
                    temp.point = value.point;
                    temp.official = value.office_level;
                    temp.heroList = value[ 'hero_base_id'] || {};
                    temp.guildName = value[ 'guild_name'] || '';
                    temp.avatarId = value[ 'avatar_base_id'] || 0;
                    temp.sid = value[ 'sid'] || 0;
                    temp.sname = value[ 'sname'] || '';
                    temp = convertAvatarId(temp);
                    table.insert(rankList, temp);
                }
            }
            table.sort(rankList, function (sort1, sort2) {
                return sort1.rank < sort2.rank;
            });
            return rankList;
        }
        var grabList = convertGrabList(message);
        G_SignalManager.dispatch(SignalConst.EVENT_CROSS_WORLDBOSS_GET_GRAB_LIST, grabList);
    }
    c2sGrabCrossWorldBossPoint(userId, usersid) {
        var message = {
            uid: userId,
            sid: usersid
        };
        G_NetworkManager.send(MessageIDConst.ID_C2S_GrabCrossWorldBossPoint, message);
    }
    _s2cGrabCrossWorldBossPoint(id, message) {
        if (message.ret != 1) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_CROSS_WORLDBOSS_GET_GRAB_POINT, message);
    }
    _s2cGetCrossWorldBossInfo(id, message) {
        if (message.ret != 1) {
            return;
        }
        cc.log(message);
        this.setBoss_id(message[ 'boss_id'] || 0);
        this.setStart_time(message[ 'start_time'] || 0);
        this.setEnd_time(message[ 'end_time'] || 0);
        this.setStamina(message[ 'stamina'] || 0);
        this.setTotal_stamina(message[ 'total_stamina'] || 0);
        if (this.getStart_time() > 0) {
            this.setFakeTime(false);
        }
        var camp = message[ 'self_camp'];
        if (camp) {
            this.setSelf_camp(camp);
        }
        var isChatOpen = message[ 'is_chat'];
        if (isChatOpen) {
            this.setChatOpen(isChatOpen);
        }
        var available_time = CrossWorldBossHelperT.getAvailableTime();
        this.setAvailable_time(available_time);
        var showTime = CrossWorldBossHelperT.getShowTime();
        this.setShow_time(showTime);
        var newState = message.state || 0;
        var oldBossState = this.getState();
        this.setState(newState);
        this.setState_startTime(message.state_startTime || 0);
        if (oldBossState != newState) {
            G_SignalManager.dispatch(SignalConst.EVENT_CROSS_WORLDBOSS_STATE_CHANGE);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_CROSS_WORLDBOSS_UPDATE_BOSS);
    }
    _s2cUpdateCrossWorldBossRank(id, message) {
        if (message.ret != 1) {
            return;
        }
        cc.log(message);
        var currTime = G_ServerTime.getTime();
        cc.log('currTime ' + currTime);
        this._updateCrossWorldBossRank(message);
        G_SignalManager.dispatch(SignalConst.EVENT_CROSS_WORLDBOSS_UPDATE_RANK, message);
    }
}