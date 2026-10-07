// ============ DATA ============
const WORD_DATA = {
words: [
{word:"add",meaning:"加える、足す",page:"2"},{word:"addition",meaning:"足し算、追加",page:"2"},{word:"equal",meaning:"等しい",page:"2"},{word:"female",meaning:"雌、女性の",page:"2"},{word:"male",meaning:"雄、男性の",page:"2"},{word:"plus",meaning:"プラス、足す",page:"2"},{word:"sum",meaning:"合計、和",page:"2"},{word:"system",meaning:"体系、システム、系",page:"2"},{word:"technical",meaning:"技術的な",page:"2"},{word:"therefore",meaning:"それゆえに、従って",page:"2"},{word:"total",meaning:"全体の、合計の",page:"2"},{word:"approximately",meaning:"約、およそ",page:"4"},{word:"difference",meaning:"違い、差",page:"4"},{word:"million",meaning:"百万",page:"4"},{word:"population",meaning:"人口、個体群",page:"4"},{word:"subtract",meaning:"引く",page:"4"},{word:"subtraction",meaning:"引き算",page:"4"},{word:"cardboard",meaning:"段ボール、厚紙",page:"6"},{word:"contain",meaning:"含む",page:"6"},{word:"dozen",meaning:"ダース（12個）",page:"6"},{word:"expression",meaning:"（数）式、表現",page:"6"},{word:"factor",meaning:"要因、因数",page:"6"},{word:"multiplication",meaning:"掛け算",page:"6"},{word:"multiply",meaning:"掛ける",page:"6"},{word:"product",meaning:"積、生成物、製品",page:"6"},{word:"result",meaning:"結果",page:"6"},{word:"above",meaning:"上に",page:"8"},{word:"average",meaning:"平均",page:"8"},{word:"bar",meaning:"棒",page:"8"},{word:"below",meaning:"下に",page:"8"},{word:"denominator",meaning:"分母",page:"8"},{word:"distance",meaning:"距離",page:"8"},{word:"divide",meaning:"割る",page:"8"},{word:"division",meaning:"割り算、分割",page:"8"},{word:"fraction",meaning:"分数",page:"8"},{word:"numerator",meaning:"分子（分数）",page:"8"},{word:"object",meaning:"物体、対象",page:"8"},{word:"per",meaning:"〜につき",page:"8"},{word:"unit",meaning:"単位",page:"8"},{word:"angle",meaning:"角、角度",page:"14"},{word:"classify",meaning:"分類する",page:"14"},{word:"connect",meaning:"結ぶ、つなぐ",page:"14"},{word:"corner",meaning:"角、頂点",page:"14"},{word:"degree",meaning:"度（角度・温度）",page:"14"},{word:"equiangular",meaning:"等角の",page:"14"},{word:"equilateral",meaning:"等辺の",page:"14"},{word:"figure",meaning:"図、図形、数字",page:"14"},{word:"form",meaning:"形、形成する",page:"14"},{word:"length",meaning:"長さ",page:"14"},{word:"measure",meaning:"測る、測定する",page:"14"},{word:"polygon",meaning:"多角形",page:"14"},{word:"quadrilateral",meaning:"四角形",page:"14"},{word:"rectangle",meaning:"長方形",page:"14"},{word:"regular",meaning:"正〜（正多角形など）、規則的な",page:"14"},{word:"square",meaning:"正方形、平方",page:"14"},{word:"vertex",meaning:"頂点",page:"14"},{word:"area",meaning:"面積",page:"16"},{word:"base",meaning:"底辺、底面、塩基",page:"16"},{word:"calculate",meaning:"計算する",page:"16"},{word:"choose",meaning:"選ぶ",page:"16"},{word:"draw",meaning:"描く、引く",page:"16"},{word:"height",meaning:"高さ",page:"16"},{word:"mean",meaning:"平均、意味する",page:"16"},{word:"opposite",meaning:"反対の、向かいの",page:"16"},{word:"parallel",meaning:"平行な",page:"16"},{word:"parallelogram",meaning:"平行四辺形",page:"16"},{word:"perpendicular",meaning:"垂直な",page:"16"},{word:"approximate",meaning:"おおよその、近似の",page:"18"},{word:"center",meaning:"中心",page:"18"},{word:"circumference",meaning:"円周",page:"18"},{word:"constant",meaning:"定数、一定の",page:"18"},{word:"diameter",meaning:"直径",page:"18"},{word:"fix",meaning:"固定する、修理する",page:"18"},{word:"pi",meaning:"円周率（π）",page:"18"},{word:"radius",meaning:"半径",page:"18"},{word:"bottom",meaning:"底",page:"20"},{word:"circular",meaning:"円形の",page:"20"},{word:"cone",meaning:"円錐",page:"20"},{word:"congruent",meaning:"合同な",page:"20"},{word:"cube",meaning:"立方体",page:"20"},{word:"curved",meaning:"曲がった、曲線の",page:"20"},{word:"cylinder",meaning:"円柱",page:"20"},{word:"lateral",meaning:"側面の",page:"20"},{word:"prism",meaning:"角柱、プリズム",page:"20"},{word:"pyramid",meaning:"角錐、ピラミッド",page:"20"},{word:"solid",meaning:"固体、立体の",page:"20"},{word:"space",meaning:"空間、宇宙",page:"20"},{word:"triangular",meaning:"三角形の",page:"20"},{word:"volume",meaning:"体積、容積",page:"22"},{word:"atom",meaning:"原子",page:"28"},{word:"boil",meaning:"沸騰する",page:"28"},{word:"bond",meaning:"結合",page:"28"},{word:"Celsius",meaning:"セルシウス（摂氏）",page:"28"},{word:"freeze",meaning:"凍る",page:"28"},{word:"gas",meaning:"気体、ガス",page:"28"},{word:"hardly",meaning:"ほとんど〜ない",page:"28"},{word:"heat",meaning:"熱",page:"28"},{word:"hydrogen",meaning:"水素",page:"28"},{word:"molecule",meaning:"分子",page:"28"},{word:"originally",meaning:"元々は、最初は",page:"28"},{word:"oxygen",meaning:"酸素",page:"28"},{word:"particle",meaning:"粒子",page:"28"},{word:"separate",meaning:"分ける、分離する",page:"28"},{word:"substance",meaning:"物質",page:"28"},{word:"tiny",meaning:"とても小さい",page:"28"},{word:"vapor",meaning:"蒸気",page:"28"},{word:"certain",meaning:"ある、特定の、確かな",page:"30"},{word:"compare",meaning:"比較する",page:"30"},{word:"daily",meaning:"毎日の",page:"30"},{word:"exist",meaning:"存在する",page:"30"},{word:"liquid",meaning:"液体",page:"30"},{word:"melt",meaning:"溶ける",page:"30"},{word:"temperature",meaning:"温度",page:"30"},{word:"carbon",meaning:"炭素",page:"32"},{word:"depend",meaning:"依存する",page:"32"},{word:"dioxide",meaning:"二酸化物",page:"32"},{word:"dry",meaning:"乾いた",page:"32"},{word:"gaseous",meaning:"気体の",page:"32"},{word:"liter",meaning:"リットル",page:"32"},{word:"mass",meaning:"質量",page:"32"},{word:"regardless",meaning:"〜に関係なく",page:"32"},{word:"still",meaning:"静止した、まだ",page:"32"},{word:"whole",meaning:"全体の",page:"32"},{word:"axes",meaning:"軸（axisの複数形）",page:"38"},{word:"axis",meaning:"軸",page:"38"},{word:"coordinate",meaning:"座標",page:"38"},{word:"cross",meaning:"交差する",page:"38"},{word:"dimension",meaning:"次元、寸法",page:"38"},{word:"horizontally",meaning:"水平に",page:"38"},{word:"negative",meaning:"負の、陰性の",page:"38"},{word:"position",meaning:"位置",page:"38"},{word:"represent",meaning:"表す",page:"38"},{word:"respectively",meaning:"それぞれ",page:"38"},{word:"vertically",meaning:"垂直に",page:"38"},{word:"formula (formulae)",meaning:"公式、化学式",page:"40"},{word:"function",meaning:"関数、機能",page:"40"},{word:"gradient",meaning:"勾配、傾き",page:"40"},{word:"graph",meaning:"グラフ",page:"40"},{word:"linear",meaning:"線形の",page:"40"},{word:"proportion",meaning:"比例、割合",page:"40"},{word:"proportional",meaning:"比例する",page:"40"},{word:"relationship",meaning:"関係",page:"40"},{word:"slope",meaning:"傾き、斜面",page:"40"},{word:"type",meaning:"種類、型",page:"40"},{word:"velocity",meaning:"速度",page:"40"},{word:"visual",meaning:"視覚の",page:"40"},{word:"coefficient",meaning:"係数",page:"42"},{word:"decimal",meaning:"小数",page:"42"},{word:"describe",meaning:"描写する、説明する",page:"42"},{word:"downward",meaning:"下向きの",page:"42"},{word:"equation",meaning:"方程式",page:"42"},{word:"express",meaning:"表現する、表す",page:"42"},{word:"general",meaning:"一般的な",page:"42"},{word:"integer",meaning:"整数",page:"42"},{word:"maximum",meaning:"最大の",page:"42"},{word:"minimum",meaning:"最小の",page:"42"},{word:"parabola",meaning:"放物線",page:"42"},{word:"positive",meaning:"正の、陽性の",page:"42"},{word:"quadratic",meaning:"二次の",page:"42"},{word:"shape",meaning:"形",page:"42"},{word:"solution",meaning:"解、溶液",page:"42"},{word:"upward",meaning:"上向きの",page:"42"},{word:"blood",meaning:"血液",page:"48"},{word:"bone",meaning:"骨",page:"48"},{word:"brain",meaning:"脳",page:"48"},{word:"contract",meaning:"収縮する、契約する",page:"48"},{word:"damage",meaning:"損傷、ダメージ",page:"48"},{word:"digest",meaning:"消化する",page:"48"},{word:"intestine",meaning:"腸",page:"48"},{word:"joint",meaning:"関節",page:"48"},{word:"muscle",meaning:"筋肉",page:"48"},{word:"organ",meaning:"器官、臓器",page:"48"},{word:"pump",meaning:"ポンプ",page:"48"},{word:"skull",meaning:"頭蓋骨",page:"48"},{word:"stomach",meaning:"胃",page:"48"},{word:"thighbone",meaning:"大腿骨",page:"48"},{word:"various",meaning:"様々な",page:"48"},{word:"ammonia",meaning:"アンモニア",page:"50"},{word:"cell",meaning:"細胞、電池",page:"50"},{word:"circulate",meaning:"循環する",page:"50"},{word:"combine",meaning:"結合する、組み合わせる",page:"50"},{word:"component",meaning:"構成要素、成分",page:"50"},{word:"deliver",meaning:"運ぶ、伝達する",page:"50"},{word:"hemoglobin",meaning:"ヘモグロビン",page:"50"},{word:"infectious",meaning:"感染性の",page:"50"},{word:"lung",meaning:"肺",page:"50"},{word:"nutrient(s)",meaning:"栄養素",page:"50"},{word:"organism",meaning:"生物、有機体",page:"50"},{word:"plasma",meaning:"血漿、プラズマ",page:"50"},{word:"platelet",meaning:"血小板",page:"50"},{word:"protein",meaning:"タンパク質",page:"50"},{word:"release",meaning:"放出する",page:"50"},{word:"route",meaning:"経路",page:"50"},{word:"vessel",meaning:"血管、導管、容器",page:"50"},{word:"absorb",meaning:"吸収する",page:"52"},{word:"anus",meaning:"肛門",page:"52"},{word:"chew",meaning:"噛む",page:"52"},{word:"digestion",meaning:"消化",page:"52"},{word:"digestive",meaning:"消化の",page:"52"},{word:"enzyme",meaning:"酵素",page:"52"},{word:"feces",meaning:"糞便",page:"52"},{word:"glucose",meaning:"グルコース、ブドウ糖",page:"52"},{word:"gullet",meaning:"食道",page:"52"},{word:"juicy",meaning:"水分が多い",page:"52"},{word:"saliva",meaning:"唾液",page:"52"},{word:"starch",meaning:"デンプン",page:"52"},{word:"swallow",meaning:"飲み込む",page:"52"},{word:"unable",meaning:"〜できない",page:"52"},{word:"variety",meaning:"種類、多様性",page:"52"},{word:"automatic",meaning:"自動の",page:"54"},{word:"backbone",meaning:"脊椎、背骨",page:"54"},{word:"cause",meaning:"原因、引き起こす",page:"54"},{word:"control",meaning:"制御する",page:"54"},{word:"immediately",meaning:"すぐに",page:"54"},{word:"nerve",meaning:"神経",page:"54"},{word:"nervous",meaning:"神経の",page:"54"},{word:"pan",meaning:"鍋、皿",page:"54"},{word:"process",meaning:"過程、プロセス",page:"54"},{word:"reaction",meaning:"反応",page:"54"},{word:"reflex",meaning:"反射",page:"54"},{word:"signal",meaning:"信号",page:"54"},{word:"skin",meaning:"皮膚",page:"54"},{word:"balance",meaning:"バランス、釣り合い",page:"60"},{word:"charge",meaning:"電荷、充電する",page:"60"},{word:"electric",meaning:"電気、電気的な",page:"60"},{word:"electrically",meaning:"電気的に",page:"60"},{word:"electricity",meaning:"電気",page:"60"},{word:"imbalance",meaning:"不均衡",page:"60"},{word:"negatively",meaning:"負に、陰性に",page:"60"},{word:"neutral",meaning:"中性の",page:"60"},{word:"positively",meaning:"正に、陽性に",page:"60"},{word:"rub",meaning:"こする",page:"60"},{word:"ruler",meaning:"定規",page:"60"},{word:"static",meaning:"静的な、静電気の",page:"60"},{word:"upset",meaning:"乱す、動揺させる",page:"60"},{word:"ammeter",meaning:"電流計",page:"62"},{word:"ampere (amps)",meaning:"アンペア",page:"62"},{word:"battery",meaning:"電池、バッテリー",page:"62"},{word:"bright",meaning:"明るい",page:"62"},{word:"bulb",meaning:"電球",page:"62"},{word:"chemical",meaning:"化学の",page:"62"},{word:"circuit",meaning:"回路",page:"62"},{word:"current",meaning:"電流、流れ",page:"62"},{word:"flow",meaning:"流れ、流れる",page:"62"},{word:"provide",meaning:"供給する、提供する",page:"62"},{word:"series",meaning:"直列、一連",page:"62"},{word:"supply",meaning:"供給、供給する",page:"62"},{word:"voltage",meaning:"電圧",page:"62"},{word:"voltmeter",meaning:"電圧計",page:"62"},{word:"wire",meaning:"導線、ワイヤー",page:"62"},{word:"allow",meaning:"許容する、可能にする",page:"64"},{word:"aluminum",meaning:"アルミニウム",page:"64"},{word:"amount",meaning:"量",page:"64"},{word:"conductor",meaning:"導体",page:"64"},{word:"contrary",meaning:"反対の",page:"64"},{word:"copper",meaning:"銅",page:"64"},{word:"electrical",meaning:"電気",page:"64"},{word:"insulator",meaning:"絶縁体",page:"64"},{word:"material",meaning:"材料、物質",page:"64"},{word:"metal",meaning:"金属",page:"64"},{word:"plug",meaning:"プラグ",page:"64"},{word:"resistance",meaning:"抵抗",page:"64"},{word:"rubber",meaning:"ゴム",page:"64"},{word:"safety",meaning:"安全",page:"64"},{word:"inversely",meaning:"反比例して、逆に",page:"66"},{word:"law",meaning:"法則",page:"66"},{word:"major",meaning:"主要な",page:"66"},{word:"observe",meaning:"観察する",page:"66"},{word:"ohm",meaning:"オーム（抵抗の単位）",page:"66"},{word:"potential",meaning:"電位、位置（エネルギー）、潜在的な",page:"66"},{word:"relation",meaning:"関係",page:"66"},{word:"resistor",meaning:"抵抗器",page:"66"},{word:"conduction",meaning:"伝導",page:"72"},{word:"cookware",meaning:"調理器具",page:"72"},{word:"escape",meaning:"逃げる、漏れる",page:"72"},{word:"feather",meaning:"羽",page:"72"},{word:"fur",meaning:"毛皮",page:"72"},{word:"handle",meaning:"取っ手、扱う",page:"72"},{word:"iron",meaning:"鉄",page:"72"},{word:"movement",meaning:"動き、運動",page:"72"},{word:"prevent",meaning:"防ぐ",page:"72"},{word:"probably",meaning:"おそらく",page:"72"},{word:"rod",meaning:"棒",page:"72"},{word:"trap",meaning:"罠、閉じ込める",page:"72"},{word:"wooden",meaning:"木製の",page:"72"},{word:"wool",meaning:"羊毛、ウール",page:"72"},{word:"convection",meaning:"対流",page:"74"},{word:"fact",meaning:"事実",page:"74"},{word:"kettle",meaning:"やかん",page:"74"},{word:"rise",meaning:"上がる、上昇する",page:"74"},{word:"sink",meaning:"沈む",page:"74"},{word:"thermal",meaning:"熱の",page:"74"},{word:"transfer",meaning:"移動する、伝達する",page:"74"},{word:"conduct",meaning:"伝導する、行う",page:"76"},{word:"determine",meaning:"決定する",page:"76"},{word:"extremely",meaning:"極端に",page:"76"},{word:"grill",meaning:"焼き網",page:"76"},{word:"industry",meaning:"産業、工業",page:"76"},{word:"infrared",meaning:"赤外線",page:"76"},{word:"radiate",meaning:"放射する",page:"76"},{word:"radiation",meaning:"放射、輻射",page:"76"},{word:"ray",meaning:"光線、放射線",page:"76"},{word:"research",meaning:"研究",page:"76"},{word:"scientific",meaning:"科学の",page:"76"},{word:"thermometer",meaning:"温度計",page:"76"},{word:"though",meaning:"〜だけれども",page:"76"},{word:"universe",meaning:"宇宙",page:"76"},{word:"visible",meaning:"目に見える、可視の",page:"76"},{word:"calendar",meaning:"カレンダー",page:"82"},{word:"celebrate",meaning:"祝う",page:"82"},{word:"decoration",meaning:"装飾",page:"82"},{word:"lover",meaning:"愛好家",page:"82"},{word:"lunisolar",meaning:"太陽太陰の",page:"82"},{word:"moonless",meaning:"月のない",page:"82"},{word:"origin",meaning:"起源、原点",page:"82"},{word:"starry",meaning:"星の多い",page:"82"},{word:"stick",meaning:"棒、くっつく",page:"82"},{word:"wonder",meaning:"驚き、不思議に思う",page:"82"},{word:"Altair",meaning:"アルタイル",page:"84"},{word:"astronomer",meaning:"天文学者",page:"84"},{word:"band",meaning:"帯、バンド",page:"84"},{word:"belong",meaning:"属する",page:"84"},{word:"billion",meaning:"十億",page:"84"},{word:"brightness",meaning:"明るさ",page:"84"},{word:"exactly",meaning:"正確に",page:"84"},{word:"galaxy",meaning:"銀河",page:"84"},{word:"least",meaning:"最小の",page:"84"},{word:"solar",meaning:"太陽の",page:"84"},{word:"urban",meaning:"都会の",page:"84"},{word:"Vega",meaning:"ベガ",page:"84"},{word:"ancient",meaning:"古代の",page:"86"},{word:"asteroid",meaning:"小惑星",page:"86"},{word:"celestial",meaning:"天体の",page:"86"},{word:"central",meaning:"中心の",page:"86"},{word:"discover",meaning:"発見する",page:"86"},{word:"except",meaning:"〜を除いて",page:"86"},{word:"gravity",meaning:"重力",page:"86"},{word:"include",meaning:"含む",page:"86"},{word:"Jupiter",meaning:"木星",page:"86"},{word:"Mars",meaning:"火星",page:"86"},{word:"Mercury",meaning:"水星",page:"86"},{word:"naked",meaning:"裸の（naked eyeで肉眼）",page:"86"},{word:"Neptune",meaning:"海王星",page:"86"},{word:"satellite",meaning:"衛星",page:"86"},{word:"Saturn",meaning:"土星",page:"86"},{word:"Uranus",meaning:"天王星",page:"86"},{word:"Venus",meaning:"金星",page:"86"},{word:"Goddess",meaning:"女神",page:"88"},{word:"imagine",meaning:"想像する",page:"88"},{word:"magnitude",meaning:"マグニチュード、大きさ",page:"88"},{word:"prehistoric",meaning:"有史以前の",page:"88"},{word:"sunrise",meaning:"日の出",page:"88"},{word:"sunset",meaning:"日の入り",page:"88"},{word:"anion",meaning:"陰イオン",page:"94"},{word:"basic",meaning:"塩基性の、基本的な",page:"94"},{word:"cation",meaning:"陽イオン",page:"94"},{word:"chloride",meaning:"塩化物",page:"94"},{word:"commonly",meaning:"一般に",page:"94"},{word:"compose",meaning:"構成する",page:"94"},{word:"electron",meaning:"電子",page:"94"},{word:"gain",meaning:"得る",page:"94"},{word:"ion",meaning:"イオン",page:"94"},{word:"ionization",meaning:"イオン化",page:"94"},{word:"matter",meaning:"物質",page:"94"},{word:"neutron",meaning:"中性子",page:"94"},{word:"proton",meaning:"陽子",page:"94"},{word:"resolve",meaning:"分解する、解決する",page:"94"},{word:"salt",meaning:"塩",page:"94"},{word:"sodium",meaning:"ナトリウム",page:"94"},{word:"anode",meaning:"陽極",page:"96"},{word:"cathode",meaning:"陰極",page:"96"},{word:"compound",meaning:"化合物",page:"96"},{word:"electrode",meaning:"電極",page:"96"},{word:"electrolysis",meaning:"電気分解",page:"96"},{word:"electrolyte",meaning:"電解質",page:"96"},{word:"element",meaning:"元素、要素",page:"96"},{word:"experiment",meaning:"実験",page:"96"},{word:"hydroxide",meaning:"水酸化物",page:"96"},{word:"ionic",meaning:"イオンの",page:"96"},{word:"occur",meaning:"起こる",page:"96"},{word:"surface",meaning:"表面",page:"96"},{word:"acid",meaning:"酸",page:"98"},{word:"alkali",meaning:"アルカリ",page:"98"},{word:"aqueous",meaning:"水溶液の",page:"98"},{word:"characteristic(s)",meaning:"特徴、特性",page:"98"},{word:"concentration",meaning:"濃度、集中",page:"98"},{word:"dissolve",meaning:"溶かす、溶解する",page:"98"},{word:"litmus",meaning:"リトマス",page:"98"},{word:"mixture",meaning:"混合物",page:"98"},{word:"neither",meaning:"どちらも〜ない",page:"98"},{word:"neutralization",meaning:"中和",page:"98"},{word:"nor",meaning:"〜もまた〜ない",page:"98"},{word:"progress",meaning:"進行、進歩",page:"98"},{word:"react",meaning:"反応する",page:"98"},{word:"unique",meaning:"独特の、唯一の",page:"98"},{word:"appliance(s)",meaning:"器具、家電",page:"102"},{word:"indirectly",meaning:"間接的に",page:"102"},{word:"meat",meaning:"肉",page:"102"},{word:"obviously",meaning:"明らかに",page:"102"},{word:"source",meaning:"源",page:"102"},{word:"technology",meaning:"技術",page:"102"},{word:"term",meaning:"用語、期間",page:"102"},{word:"coil",meaning:"コイル",page:"104"},{word:"conservation",meaning:"保存",page:"104"},{word:"consume",meaning:"消費する",page:"104"},{word:"disappear",meaning:"消える",page:"104"},{word:"generate",meaning:"発電する、発生させる",page:"104"},{word:"generator",meaning:"発電機",page:"104"},{word:"kinetic",meaning:"運動の",page:"104"},{word:"magnet",meaning:"磁石",page:"104"},{word:"motor",meaning:"モーター",page:"104"},{word:"spin",meaning:"回転する、スピン",page:"104"},{word:"fall",meaning:"落下、落ちる",page:"106"},{word:"gravitational",meaning:"重力の",page:"106"},{word:"hammer",meaning:"ハンマー",page:"106"},{word:"lift",meaning:"持ち上げる、揚力",page:"106"},{word:"consequently",meaning:"その結果",page:"108"},{word:"dam",meaning:"ダム",page:"108"},{word:"eventually",meaning:"最終的に",page:"108"},{word:"hydraulic",meaning:"水力の、水圧の",page:"108"},{word:"original",meaning:"元の、最初の",page:"108"},{word:"power",meaning:"電力、動力、累乗",page:"108"},{word:"store",meaning:"蓄える",page:"108"},{word:"transform",meaning:"変換する、変形する",page:"108"},{word:"transformation",meaning:"変換、変形",page:"108"},
// ============ APPENDIX: NUMBERS & EXPRESSIONS ============
{word:"0.01",meaning:"zero point zero one",page:"110"},{word:"3.14",meaning:"three point one four",page:"110"},{word:"100",meaning:"one hundred",page:"110"},{word:"1,000",meaning:"one thousand",page:"110"},{word:"2,000",meaning:"two thousand",page:"110"},{word:"10,000",meaning:"ten thousand",page:"110"},{word:"11,000",meaning:"eleven thousand",page:"110"},{word:"20,000",meaning:"twenty thousand",page:"110"},{word:"21,000",meaning:"twenty-one thousand",page:"110"},{word:"30,000",meaning:"thirty thousand",page:"110"},{word:"100,000",meaning:"one hundred thousand",page:"110"},{word:"999,000",meaning:"nine hundred (and) ninety-nine thousand",page:"110"},{word:"1,000,000",meaning:"one million",page:"110"},{word:"10,000,000",meaning:"ten million",page:"110"},{word:"100,000,000",meaning:"one hundred million",page:"110"},{word:"1,000,000,000",meaning:"one billion",page:"110"},
{word:"1/3",meaning:"one third",page:"111"},{word:"1/8",meaning:"one eighth",page:"111"},{word:"1/10",meaning:"one tenth",page:"111"},{word:"1/15",meaning:"one fifteenth",page:"111"},{word:"1/100",meaning:"one hundredth",page:"111"},{word:"1/1000",meaning:"one thousandth",page:"111"},{word:"1/1000000",meaning:"one millionth",page:"111"},{word:"a/b",meaning:"a over b",page:"111"},{word:"2/3",meaning:"two thirds",page:"111"},{word:"3/8",meaning:"three eighths",page:"111"},{word:"9/10",meaning:"nine tenths",page:"111"},{word:"13/15",meaning:"thirteen fifteenths / thirteen over fifteen",page:"111"},{word:"20/100",meaning:"twenty one-hundredths / twenty over one-hundred",page:"111"},{word:"3/2000",meaning:"three two-thousandths",page:"111"},{word:"5/3000000",meaning:"five three-millionths",page:"111"},{word:"61/125",meaning:"sixty-one over one hundred twenty-five",page:"111"},
{word:"x^2",meaning:"x squared",page:"112"},{word:"x^3",meaning:"x cubed / x to the third power",page:"112"},{word:"x^4",meaning:"x to the fourth power / x to the power of four",page:"112"},{word:"x^n",meaning:"x to the power of n (x to the n)",page:"112"},{word:"√x",meaning:"the square root of x",page:"112"},{word:"3√x",meaning:"the cube root of x",page:"112"},
{word:"m",meaning:"meter",page:"113"},{word:"cm",meaning:"centimeter",page:"113"},{word:"mm",meaning:"millimeter",page:"113"},{word:"m²",meaning:"square meter",page:"113"},{word:"km²",meaning:"square kilometer",page:"113"},{word:"m³",meaning:"cubic meter",page:"113"},{word:"cm³",meaning:"cubic centimeter (cc)",page:"113"},{word:"ℓ",meaning:"liter",page:"113"},{word:"dℓ",meaning:"deciliter",page:"113"},{word:"mℓ",meaning:"milliliter",page:"113"},{word:"g",meaning:"gram",page:"113"},{word:"kg",meaning:"kilogram",page:"113"},{word:"mg",meaning:"milligram",page:"113"},{word:"km/h",meaning:"kilometers per hour",page:"113"},{word:"m/s",meaning:"meters per second",page:"113"},{word:"A",meaning:"ampere",page:"113"},{word:"V",meaning:"volt",page:"113"},{word:"Ω",meaning:"ohm",page:"113"},{word:"℃",meaning:"degrees Celsius",page:"113"},{word:"°F",meaning:"degrees Fahrenheit",page:"113"},{word:"K",meaning:"Kelvin",page:"113"},{word:"Hz",meaning:"hertz",page:"113"},{word:"rpm",meaning:"revolutions per minute",page:"113"},
{word:"A + B = C",meaning:"A plus B equals C",page:"114"},{word:"A - B = C",meaning:"A minus B equals C",page:"114"},{word:"A × B = C",meaning:"A times B equals C / A multiplied by B equals C",page:"114"},{word:"A ÷ B = C",meaning:"A divided by B equals C",page:"114"},{word:"A > B",meaning:"A is greater than B",page:"114"},{word:"A ≥ B",meaning:"A is greater than or equal to B",page:"114"},{word:"A < B",meaning:"A is less than B",page:"114"},{word:"A ≤ B",meaning:"A is less than or equal to B",page:"114"},{word:"y = ax + b",meaning:"y equals ax plus b",page:"114"},{word:"ax² + bx + c = 0",meaning:"ax squared plus bx plus c equals zero",page:"114"},{word:"y = x/a + b",meaning:"y equals x over a plus b",page:"114"},{word:"x = (-b ± √(b²-4ac))/2a",meaning:"x equals minus b plus or minus the square root of b squared minus four ac over two a",page:"114"}]
};
// Parse all page numbers to integers at load time
WORD_DATA.words.forEach(w => { w.page = Number(w.page); });

const WORD_COUNT = 498;

// ============ APP STATE ============
const state = {
  studyMode: 'kosen',
  currentTab: 'flashcard',
  flashcardIndex: 0,
  flashcardOrder: [],
  flashcardSeen: new Set(),
  flashcardFlipped: false,
  flashcardShuffle: false,
  flashcardMode: null,
  flashcardKnown: new Set(),
  flashcardUnknown: new Set(),
  quizMode: 'en-jp',
  quizShuffle: false,
  quizPageOrder: false,
  quizIndex: 0,
  quizOrder: [],
  quizSeen: new Set(),
  quizGeneration: 0,
  quizAnsweredGeneration: null,
  quizCorrect: 0,
  quizTotal: 0,
  listFilter: 'all',
  listSearch: '',
};

function getUniquePages() {
  const pages = new Set(WORD_DATA.words.map(w => w.page));
  return [...pages].sort((a, b) => a - b);
}

function getPageFilter(key) {
  const saved = localStorage.getItem('wordcard_page_filter_' + key);
  if (!saved) return null; // null means "all pages"
  try { return JSON.parse(saved); } catch { return null; }
}
function setPageFilter(key, pages) {
  localStorage.setItem('wordcard_page_filter_' + key, JSON.stringify(pages));
}

function getFilteredWords(key) {
  const pages = getPageFilter(key);
  if (!pages) return [...WORD_DATA.words];
  return WORD_DATA.words.filter(w => pages.includes(w.page));
}

const LEARNING_FILTERS = ['all', 'perfect', 'uncertain', 'unattempted'];
const LEARNING_FILTER_LABELS = {
  all: '全部',
  perfect: '完璧',
  uncertain: '不安',
  unattempted: '未挑戦',
};

function getWordIdentity(word) {
  return typeof word === 'string' ? word : (word?.id || word?.word);
}

function getLearningStatusStore() {
  const prefix = state.studyMode === 'toeic' ? 'wordcard_toeic_' : 'wordcard_';
  return LearningStatus.createLearningStatusStore({
    storage: localStorage,
    prefix,
    getWords: () => WORD_DATA.words,
    getIdentity: getWordIdentity,
  });
}

function getLearningStatuses() {
  return getLearningStatusStore().getAll();
}

function getWordStatus(word) {
  return getLearningStatusStore().get(getWordIdentity(word));
}

function setWordStatus(word, status) {
  return getLearningStatusStore().set(getWordIdentity(word), status);
}

function getStatusFilterStorageKey(tab) {
  const prefix = state.studyMode === 'toeic' ? 'wordcard_toeic_' : 'wordcard_';
  return `${prefix}${tab}_status_filter_v1`;
}

function getLearningFilter(tab) {
  const saved = localStorage.getItem(getStatusFilterStorageKey(tab));
  return LEARNING_FILTERS.includes(saved) ? saved : 'all';
}

function updateLearningFilterButtons(tab) {
  const group = document.getElementById(tab + 'StatusFilters');
  if (!group) return;
  const selected = getLearningFilter(tab);
  group.querySelectorAll('[data-status-filter]').forEach(button => {
    const active = button.dataset.statusFilter === selected;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function getStatusFilteredWords(tab, words = getFilteredWords(tab)) {
  return LearningStatus.filterWordsByStatus(words, getLearningStatuses(), getLearningFilter(tab), getWordIdentity);
}

function setLearningFilter(tab, filter) {
  if (!['flashcard', 'quiz', 'list'].includes(tab) || !LEARNING_FILTERS.includes(filter)) return;
  localStorage.setItem(getStatusFilterStorageKey(tab), filter);
  updateLearningFilterButtons(tab);
  if (tab === 'flashcard') initFlashcard();
  else if (tab === 'quiz') initQuiz();
  else renderList();
}

function getMastery() {
  return new Set(Object.entries(getLearningStatuses())
    .filter(([, status]) => status === 'perfect')
    .map(([key]) => key));
}

function setMastery(set) {
  const store = getLearningStatusStore();
  const next = store.getAll();
  const perfect = new Set([...set].filter(key => store.validKeys().has(key)));
  for (const [key, status] of Object.entries(next)) {
    if (status === 'perfect' && !perfect.has(key)) delete next[key];
  }
  for (const key of perfect) next[key] = 'perfect';
  store.replace(next);
}

function getFlashcardStats() {
  const statuses = getLearningStatuses();
  return {
    known: new Set(Object.entries(statuses).filter(([, value]) => value === 'perfect').map(([key]) => key)),
    unknown: new Set(Object.entries(statuses).filter(([, value]) => value === 'uncertain').map(([key]) => key)),
  };
}

function setFlashcardStats(known, unknown) {
  const store = getLearningStatusStore();
  const next = store.getAll();
  const keys = store.validKeys();
  for (const key of [...known, ...unknown]) if (keys.has(key)) delete next[key];
  for (const key of known) if (keys.has(key)) next[key] = 'perfect';
  for (const key of unknown) if (keys.has(key)) next[key] = 'uncertain';
  store.replace(next);
}

// ============ PAGE FILTER ============
function setupPageFilter(key) {
  const grid = document.getElementById(key + 'PageGrid');
  if (!grid) return;
  const pages = getUniquePages();
  const selected = getPageFilter(key);
  grid.innerHTML = '';
  pages.forEach(p => {
    const label = document.createElement('label');
    label.className = 'page-filter-item';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.value = p;
    cb.checked = selected === null || selected.includes(p);
    cb.addEventListener('change', () => savePageFilter(key));
    label.appendChild(cb);
    label.appendChild(document.createTextNode('p.' + p));
    grid.appendChild(label);
  });
}

function savePageFilter(key) {
  const grid = document.getElementById(key + 'PageGrid');
  const checked = [...grid.querySelectorAll('input:checked')].map(cb => Number(cb.value));
  if (checked.length === 0) {
    setPageFilter(key, null); // null = all pages
  } else {
    setPageFilter(key, checked);
  }
  switchTab(state.currentTab); // Re-render with filter
}

function selectAllPages(key) {
  const grid = document.getElementById(key + 'PageGrid');
  grid.querySelectorAll('input').forEach(cb => cb.checked = true);
  savePageFilter(key);
}

function deselectAllPages(key) {
  const grid = document.getElementById(key + 'PageGrid');
  grid.querySelectorAll('input').forEach(cb => cb.checked = false);
  savePageFilter(key);
}

function togglePageFilter(key) {
  const panel = document.getElementById(key + 'PageFilter');
  panel.classList.toggle('open');
  if (panel.classList.contains('open')) setupPageFilter(key);
}

function clearAllPageFilters() {
  ['flashcard', 'quiz', 'list'].forEach(k => {
    setPageFilter(k, null);
  });
  switchTab(state.currentTab);
}

// ============ TAB SWITCHING ============
function switchTab(tab) {
  state.currentTab = tab;
  localStorage.setItem('wordcard_last_tab', tab);
  updateLearningFilterButtons(tab);
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.mode-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + tab).classList.add('active');

  if (tab === 'flashcard') {
    initFlashcard();
  }
  if (tab === 'quiz') {
    if (!state.quizMode) state.quizMode = 'en-jp';
    document.getElementById('quizModeBtn').textContent = state.quizMode === 'en-jp' ? '英→和' : '和→英';
    document.getElementById('quizModeBtn').classList.toggle('active', state.quizMode === 'jp-en');
    initQuiz();
  }
  if (tab === 'list') renderList();
}

// ============ HELPERS ============
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getWrongAnswers(correctAnswer, count = 3, field = 'meaning') {
  const all = WORD_DATA.words.filter(w => w[field] !== correctAnswer);
  const wrong = shuffle(all).slice(0, count);
  return wrong.map(w => w[field]);
}

function updateProgressInfo() {
  const mastery = getMastery();
  const count = mastery.size;
  document.getElementById('progressInfo').textContent = `${count} / ${WORD_COUNT} 習得済み`;
}

// ============ FLASHCARD ============
function refreshPendingWords(tab, order, seen, shuffleAdditions = false) {
  const pending = getStatusFilteredWords(tab).filter(word => !seen.has(getWordIdentity(word)));
  const eligible = new Set(pending.map(getWordIdentity));
  const retained = order.filter(word => eligible.has(getWordIdentity(word)));
  const retainedKeys = new Set(retained.map(getWordIdentity));
  let additions = pending.filter(word => !retainedKeys.has(getWordIdentity(word)));
  if (shuffleAdditions) additions = shuffle(additions);
  return retained.concat(additions);
}

function setFlashcardControlsDisabled(disabled) {
  document.querySelectorAll('#panel-flashcard .card-controls button').forEach(button => {
    button.disabled = disabled;
  });
  const card = document.getElementById('flashcard');
  card.setAttribute('aria-disabled', String(disabled));
  card.classList.toggle('card-empty', disabled);
}

function initFlashcard() {
  const stats = getFlashcardStats();
  state.flashcardKnown = stats.known;
  state.flashcardUnknown = stats.unknown;
  state.flashcardSeen = new Set();
  state.flashcardIndex = 0;
  state.flashcardFlipped = false;
  const filtered = getStatusFilteredWords('flashcard');
  updateLearningFilterButtons('flashcard');
  if (filtered.length === 0) {
    state.flashcardOrder = [];
    showFlashcard();
    return;
  }
  if (!state.flashcardMode) {
    state.flashcardMode = 'page';
  }
  if (state.flashcardMode === 'shuffle') {
    state.flashcardOrder = shuffle(filtered);
  } else {
    state.flashcardOrder = filtered;
  }
  showFlashcard();
}

function toggleShuffle() {
  state.flashcardMode = 'shuffle';
  state.flashcardIndex = 0;
  state.flashcardSeen = new Set();
  state.flashcardFlipped = false;
  const filtered = getStatusFilteredWords('flashcard');
  state.flashcardOrder = shuffle(filtered);
  document.getElementById('shuffleBtn').classList.add('active');
  document.getElementById('pageOrderBtn').classList.remove('active');
  showFlashcard();
  setTimeout(() => {
    document.getElementById('shuffleBtn').classList.remove('active');
  }, 200);
}

function togglePageOrder() {
  state.flashcardMode = 'page';
  state.flashcardIndex = 0;
  state.flashcardSeen = new Set();
  state.flashcardFlipped = false;
  const filtered = getStatusFilteredWords('flashcard');
  state.flashcardOrder = filtered;
  document.getElementById('pageOrderBtn').classList.add('active');
  document.getElementById('shuffleBtn').classList.remove('active');
  showFlashcard();
  setTimeout(() => {
    document.getElementById('pageOrderBtn').classList.remove('active');
  }, 200);
}

function showFlashcard() {
  state.flashcardOrder = refreshPendingWords(
    'flashcard', state.flashcardOrder, state.flashcardSeen, state.flashcardMode === 'shuffle'
  );
  state.flashcardIndex = 0;
  const word = state.flashcardOrder[0];
  const card = document.getElementById('flashcard');

  if (!word) {
    card.classList.remove('card-flipped');
    document.getElementById('flashcardWord').textContent = '';
    document.getElementById('flashcardMeaning').textContent = '';
    document.getElementById('flashcardPage').textContent = '';
    document.getElementById('flashcardStats').textContent =
      getStatusFilteredWords('flashcard').length === 0
        ? '条件に合う単語がありません'
        : 'おめでとうございます！全語完了！';
    setFlashcardControlsDisabled(true);
    state.flashcardFlipped = false;
    return;
  }

  setFlashcardControlsDisabled(false);
  card.classList.remove('card-flipped');
  const isApp = isAppendix(word);
  document.getElementById('flashcardWord').textContent = isApp ? word.meaning : word.word;
  document.getElementById('flashcardMeaning').textContent = isApp ? word.word : word.meaning;

  const known = state.flashcardKnown.size;
  const unknown = state.flashcardUnknown.size;
  const total = state.flashcardSeen.size + state.flashcardOrder.length;
  const progress = state.flashcardSeen.size + 1;
  document.getElementById('flashcardStats').textContent = `${progress}/${total} | 知っていた: ${known} | 知っていなかった: ${unknown}`;
  document.getElementById('flashcardPage').textContent = state.studyMode === 'toeic'
    ? `CEFR ${word.cefr} / #${word.rank} / ${word.priority}`
    : 'p.' + word.page;
}

function flipCard() {
  if (!state.flashcardOrder[0]) return;
  const card = document.getElementById('flashcard');
  state.flashcardFlipped = !state.flashcardFlipped;
  card.classList.toggle('card-flipped', state.flashcardFlipped);
}

function markCard(known) {
  const word = state.flashcardOrder[0];
  if (!word) return;
  const key = getWordIdentity(word);
  setWordStatus(word, known ? 'perfect' : 'uncertain');
  const stats = getFlashcardStats();
  state.flashcardKnown = stats.known;
  state.flashcardUnknown = stats.unknown;
  state.flashcardSeen.add(key);
  state.flashcardOrder = refreshPendingWords(
    'flashcard', state.flashcardOrder, state.flashcardSeen, state.flashcardMode === 'shuffle'
  );
  state.flashcardIndex = 0;
  state.flashcardFlipped = false;
  showFlashcard();
  updateProgressInfo();
}

// ============ QUIZ (Unified) ============
function getQuizFields() {
  if (state.quizMode === 'en-jp') return { questionField: 'word', answerField: 'meaning', wrongField: 'meaning' };
  return { questionField: 'meaning', answerField: 'word', wrongField: 'word' };
}

function isAppendix(word) {
  const p = parseInt(word.page);
  return p >= 110 && p <= 114;
}

function initQuiz() {
  state.quizSeen = new Set();
  state.quizIndex = 0;
  const filtered = getStatusFilteredWords('quiz');
  if (state.quizShuffle) {
    state.quizOrder = shuffle(filtered);
  } else if (state.quizPageOrder) {
    state.quizOrder = filtered;
  } else {
    state.quizOrder = shuffle(filtered);
  }
  state.quizCorrect = 0;
  state.quizTotal = 0;
  updateLearningFilterButtons('quiz');
  showQuiz();
}

function showQuiz() {
  state.quizOrder = refreshPendingWords(
    'quiz', state.quizOrder, state.quizSeen, state.quizShuffle || !state.quizPageOrder
  );
  state.quizIndex = 0;
  const token = ++state.quizGeneration;
  state.quizAnsweredGeneration = null;
  const word = state.quizOrder[0];

  if (!word) {
    const container = document.getElementById('quizOptions');
    container.innerHTML = '';
    if (getStatusFilteredWords('quiz').length > 0 && state.quizSeen.size > 0) {
      const rate = state.quizTotal > 0 ? Math.round(state.quizCorrect / state.quizTotal * 100) : 0;
      document.getElementById('quizResult').textContent = `おめでとうございます！全問題完了！正解率: ${rate}%`;
      document.getElementById('quizWord').textContent = '✓完了！';
      const retry = document.createElement('button');
      retry.className = 'btn btn-primary';
      retry.textContent = 'もう一度';
      retry.onclick = initQuiz;
      container.appendChild(retry);
    } else {
      document.getElementById('quizResult').textContent = '条件に合う単語がありません';
      document.getElementById('quizWord').textContent = '';
    }
    return;
  }
  const { questionField, answerField, wrongField } = getQuizFields();
  const question = word[questionField];
  const correct = word[answerField];
  const wrongAnswers = getWrongAnswers(correct, 3, wrongField);
  const options = shuffle([correct, ...shuffle(wrongAnswers).slice(0, 3)]);

  document.getElementById('quizWord').textContent = question;
  document.getElementById('quizScore').textContent = state.quizCorrect;
  document.getElementById('quizTotal').textContent = state.quizTotal;
  document.getElementById('quizResult').textContent = '';

  const container = document.getElementById('quizOptions');
  container.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.textContent = opt;
    const key = getWordIdentity(word);
    const mode = state.studyMode;
    btn.onclick = () => checkQuiz(btn, opt, correct, token, key, mode);
    container.appendChild(btn);
  });
}

function checkQuiz(btn, selected, correct, token = state.quizGeneration,
  wordKey = getWordIdentity(state.quizOrder[0]), mode = state.studyMode) {
  if (token !== state.quizGeneration || state.quizAnsweredGeneration === token || mode !== state.studyMode) return;
  const word = state.quizOrder[0];
  if (!word || getWordIdentity(word) !== wordKey) return;
  state.quizAnsweredGeneration = token;

  const buttons = document.querySelectorAll('#quizOptions .quiz-option');
  buttons.forEach(b => {
    b.classList.add('disabled');
    if (b.textContent === correct) b.classList.add('correct');
  });

  if (selected === correct) {
    btn.classList.add('correct');
    state.quizCorrect++;
  } else {
    btn.classList.add('wrong');
  }
  state.quizTotal++;

  setWordStatus(word, selected === correct ? 'perfect' : 'uncertain');
  const stats = getFlashcardStats();
  state.flashcardKnown = stats.known;
  state.flashcardUnknown = stats.unknown;

  document.getElementById('quizResult').textContent = selected === correct ? '正解！' : `不正解 😅 正解は ${correct}`;
  updateProgressInfo();

  setTimeout(() => {
    if (state.quizGeneration !== token || state.studyMode !== mode) return;
    state.quizSeen.add(wordKey);
    state.quizOrder = refreshPendingWords(
      'quiz', state.quizOrder, state.quizSeen, state.quizShuffle || !state.quizPageOrder
    );
    state.quizIndex = 0;
    showQuiz();
  }, 1200);
}

function toggleQuizMode() {
  state.quizMode = state.quizMode === 'en-jp' ? 'jp-en' : 'en-jp';
  document.getElementById('quizModeBtn').textContent = state.quizMode === 'en-jp' ? '英→和' : '和→英';
  document.getElementById('quizModeBtn').classList.toggle('active', state.quizMode === 'jp-en');
  initQuiz();
}

function toggleQuizShuffle() {
  state.quizShuffle = true;
  state.quizPageOrder = false;
  document.getElementById('quizShuffleBtn').classList.add('active');
  document.getElementById('quizPageOrderBtn').classList.remove('active');
  initQuiz();
  setTimeout(() => {
    document.getElementById('quizShuffleBtn').classList.remove('active');
    state.quizShuffle = false;
  }, 200);
}

function toggleQuizPageOrder() {
  state.quizPageOrder = true;
  state.quizShuffle = false;
  document.getElementById('quizPageOrderBtn').classList.add('active');
  document.getElementById('quizShuffleBtn').classList.remove('active');
  initQuiz();
  setTimeout(() => {
    document.getElementById('quizPageOrderBtn').classList.remove('active');
    state.quizPageOrder = false;
  }, 200);
}

// ============ LIST ============
function renderList() {
  const statuses = getLearningStatuses();
  let filtered = getFilteredWords('list');

  if (state.listSearch) {
    const s = state.listSearch.toLowerCase();
    filtered = filtered.filter(w => w.word.toLowerCase().includes(s) || w.meaning.includes(s));
  }

  filtered = LearningStatus.filterWordsByStatus(filtered, statuses, getLearningFilter('list'), getWordIdentity);
  updateLearningFilterButtons('list');

  document.getElementById('listStats').textContent = `${filtered.length}語中表示`;

  const tbody = document.getElementById('wordTableBody');
  tbody.innerHTML = '';
  filtered.forEach(w => {
    const status = statuses[getWordIdentity(w)] || 'unattempted';
    const tr = document.createElement('tr');
    if (status === 'perfect') tr.classList.add('learning-perfect');
    if (status === 'uncertain') tr.classList.add('learning-uncertain');

    const isApp = isAppendix(w);
    const td1 = document.createElement('td');
    td1.className = 'word-cell';
    if (w.phonetic) {
      const wordText = document.createElement('div');
      wordText.textContent = w.word;
      const phonetic = document.createElement('div');
      phonetic.className = 'word-phonetic';
      phonetic.textContent = w.phonetic;
      td1.appendChild(wordText);
      td1.appendChild(phonetic);
    } else {
      td1.textContent = isApp ? w.meaning : w.word;
    }

    const td2 = document.createElement('td');
    td2.textContent = isApp ? w.word : w.meaning;

    const td3 = document.createElement('td');
    td3.textContent = state.studyMode === 'toeic'
      ? `${w.cefr} / ${w.priority}`
      : 'p.' + w.page;

    const td4 = document.createElement('td');
    td4.className = 'status-cell';
    ['perfect', 'uncertain'].forEach(value => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'status-tag status-tag-' + value + (status === value ? ' selected' : '');
      button.textContent = LEARNING_FILTER_LABELS[value];
      button.setAttribute('aria-label', `${w.word}を${LEARNING_FILTER_LABELS[value]}に設定`);
      button.setAttribute('aria-pressed', String(status === value));
      button._wordKey = getWordIdentity(w);
      button._status = value;
      td4.appendChild(button);
    });
    const emptyStatus = document.createElement('span');
    emptyStatus.className = 'status-empty';
    emptyStatus.textContent = LEARNING_FILTER_LABELS.unattempted;
    emptyStatus.hidden = status !== 'unattempted';
    td4.appendChild(emptyStatus);

    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);
    tbody.appendChild(tr);
  });
}

function filterList() {
  state.listSearch = document.getElementById('searchInput').value;
  renderList();
}

function setFilter(filter) {
  const mapped = ({ done: 'perfect', undone: 'unattempted' })[filter] || filter;
  setLearningFilter('list', LEARNING_FILTERS.includes(mapped) ? mapped : 'all');
}

function toggleMastery(word, el) {
  const status = getWordStatus(word);
  setWordStatus(word, status === 'perfect' ? 'unattempted' : 'perfect');
  renderList();
  updateProgressInfo();
}

// Row status controls use properties rather than data attributes so original
// vocabulary identities are not parsed or truncated by HTML.
document.addEventListener('click', (e) => {
  const toggle = e.target.closest('.status-tag');
  if (toggle && toggle._wordKey) {
    const nextStatus = getWordStatus(toggle._wordKey) === toggle._status
      ? 'unattempted' : toggle._status;
    setWordStatus(toggle._wordKey, nextStatus);
    renderList();
    updateProgressInfo();
  }
});

// ============ PROGRESS EXPORT/IMPORT ============
function exportProgress() {
  const statuses = getLearningStatuses();
  const stats = getFlashcardStats();
  const data = {
    statuses,
    mastery: [...getMastery()],
    flashcardKnown: [...stats.known],
    flashcardUnknown: [...stats.unknown],
    quizCorrect: state.quizCorrect,
    quizTotal: state.quizTotal,
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wordcard_progress.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importProgress(event) {
  const file = event.target.files[0];
  if (!file) return;
  const importMode = state.studyMode;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (state.studyMode !== importMode) throw new Error('Study mode changed during import.');
      const store = getLearningStatusStore();
      const statuses = LearningStatus.normalizeImportedStatuses(data, store.validKeys());
      store.replace(statuses);
      const stats = getFlashcardStats();
      state.flashcardKnown = stats.known;
      state.flashcardUnknown = stats.unknown;
      updateProgressInfo();
      if (state.currentTab === 'flashcard') initFlashcard();
      else if (state.currentTab === 'quiz') initQuiz();
      else renderList();
      alert('進捗データをインポートしました！');
    } catch (err) {
      alert('ファイルの読み込みに失敗しました');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

// ============ KEYBOARD NAVIGATION ============
document.addEventListener('keydown', (e) => {
  const interactiveTarget = e.target?.closest?.(
    'button, input, select, textarea, a, [contenteditable], [role="textbox"]'
  );
  if (e.target?.isContentEditable || interactiveTarget) return;

  if (state.currentTab === 'flashcard') {
    if (e.code === 'Space') { e.preventDefault(); flipCard(); }
    if (e.code === 'ArrowRight' || e.code === 'Enter') {
      e.preventDefault();
      markCard(true);
    }
    if (e.code === 'ArrowLeft') {
      e.preventDefault();
      markCard(false);
    }
  }
  if (state.currentTab === 'quiz') {
    const buttons = document.querySelectorAll('#quizOptions .quiz-option');
    buttons.forEach((b, i) => {
      if (e.code === 'Digit' + (i + 1) || e.code === 'Numpad' + (i + 1)) {
        e.preventDefault();
        b.click();
      }
    });
    if (e.code === 'Enter' && document.getElementById('quizWord').textContent === '✓完了！') {
      e.preventDefault();
      initQuiz();
    }
  }
});

// ============ INIT ============
function initApp() {
  // Restore last tab
  const lastTab = localStorage.getItem('wordcard_last_tab');
  const mappedTab = lastTab === 'reverse' ? 'quiz' : lastTab;
  const targetTab = ['flashcard', 'quiz', 'list'].includes(mappedTab) ? mappedTab : 'flashcard';
  switchTab(targetTab);
  updateProgressInfo();
}

window.addEventListener('storage', event => {
  const store = getLearningStatusStore();
  const prefix = state.studyMode === 'toeic' ? 'wordcard_toeic_' : 'wordcard_';
  if (event.key === store.statusKey) {
    const stats = getFlashcardStats();
    state.flashcardKnown = stats.known;
    state.flashcardUnknown = stats.unknown;
    updateProgressInfo();
    if (state.currentTab === 'list') renderList();
    if (state.currentTab === 'flashcard') showFlashcard();
    if (state.currentTab === 'quiz' && state.quizAnsweredGeneration !== state.quizGeneration) {
      state.quizOrder = refreshPendingWords(
        'quiz', state.quizOrder, state.quizSeen, state.quizShuffle || !state.quizPageOrder
      );
      showQuiz();
    }
    return;
  }

  const filterMatch = /^wordcard_(?:toeic_)?(flashcard|quiz|list)_status_filter_v1$/.exec(event.key || '');
  if (filterMatch && event.key === prefix + filterMatch[1] + '_status_filter_v1') {
    updateLearningFilterButtons(filterMatch[1]);
    if (state.currentTab === filterMatch[1]) {
      if (filterMatch[1] === 'flashcard') initFlashcard();
      else if (filterMatch[1] === 'quiz') {
        if (state.quizAnsweredGeneration !== state.quizGeneration) initQuiz();
      } else renderList();
    }
  }
});
