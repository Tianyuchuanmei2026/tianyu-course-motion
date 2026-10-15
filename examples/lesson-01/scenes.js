/* Original layered teaching graphics. Times are semantic positions in a 30-second scene. */
(()=>{
const C={ink:'#171b21',blue:'#2649ed',red:'#ed5d42',lime:'#d4fb43',paper:'#fffbe9',bg:'#f5edbe'};
const esc=s=>String(s).replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
const T=(x,y,s,z=42,c=C.ink,a='start',w=700)=>`<text x="${x}" y="${y}" font-size="${z}" fill="${c}" text-anchor="${a}" font-weight="${w}">${esc(s)}</text>`;
const P=(d,c=C.ink,w=6,fill='none',extra='')=>`<path d="${d}" stroke="${c}" stroke-width="${w}" fill="${fill}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
const R=(x,y,w,h,c=C.paper)=>`<rect x="${x+9}" y="${y+10}" width="${w}" height="${h}" fill="${C.ink}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" stroke="${C.ink}" stroke-width="5"/>`;
const circ=(x,y,r,fill=C.paper)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${C.ink}" stroke-width="5"/>`;
const G=(id,time,body,out=99,kind='pop')=>`<g id="${id}" data-in="${time}" data-out="${out}" data-kind="${kind}">${body}</g>`;
const A=(d,time,id,c=C.ink,out=99)=>G(id,time,P(d,c,6,'none','marker-end="url(#arrow)" data-draw="true"'),out,'line');
const ribbon=(x,y,w,label,color=C.lime)=>P(`M${x} ${y}H${x+w}L${x+w-12} ${y+39}L${x+w} ${y+79}H${x}Z`,C.ink,5,color)+T(x+24,y+55,label,42,color===C.blue?C.paper:C.ink);
function clock(x,y,r=150){let ticks='';for(let i=0;i<12;i++){let a=i*Math.PI/6;ticks+=P(`M${x+Math.sin(a)*(r-17)} ${y-Math.cos(a)*(r-17)}L${x+Math.sin(a)*(r-32)} ${y-Math.cos(a)*(r-32)}`,C.ink,4);}return circ(x,y,r,C.paper)+ticks+P(`M${x} ${y}V${y-r*.6}`,C.blue,10)+P(`M${x} ${y}L${x-r*.55} ${y+r*.24}`,C.blue,10)+circ(x,y,9,C.blue);}
function map(x=150,y=690,scale=1){return `<g transform="translate(${x} ${y}) scale(${scale})">`+P('M0 200L350 0 700 200M0 200L350 400 700 200','#8c9271',9)+[['起点',0,200],['节点B',350,0],['节点C',350,400],['终点',700,200]].map(([s,a,b])=>circ(a,b,25,C.paper)+T(a,b+65,s,33,C.ink,'middle')).join('')+T(150,60,'3分钟',34)+T(555,60,'4分钟',34)+T(155,385,'5分钟',34)+T(555,385,'4分钟',34)+'</g>';}
const nodeModel=(x,y,w=600)=>R(x,y,w,190,C.blue)+T(x+30,y+70,'模型',56,C.paper)+T(x+30,y+131,'内部参数',34,C.paper)+P(`M${x+w-213} ${y+62}L${x+w-129} ${y+35}M${x+w-213} ${y+62}L${x+w-120} ${y+97}M${x+w-213} ${y+62}L${x+w-139} ${y+146}`,C.paper,4)+[[w-213,62],[w-129,35],[w-120,97],[w-139,146]].map(([a,b])=>circ(x+a,y+b,10,C.lime)).join('');
const header=(n,title,sub)=>T(74,106,'AI通识 · 第一讲',32)+T(1005,106,`${n} / 8`,30,C.blue,'end')+P('M74 135H1006',C.ink,3)+title.split('\n').map((s,i)=>T(72,260+i*110,s,94,i===1?C.blue:C.ink)).join('')+T(77,430,sub,36,'#555b48', 'start',500);
const scene=(id,n,title,sub,body)=>`<g class="scene" id="scene-${id}">${header(n,title,sub)}${body}</g>`;
let S=[];
// 01 Designed complete opening frame, with three concrete examples rather than a title-only slide.
S.push(scene('1',1,'什么是AI，\n什么是自动化','先看系统怎样完成任务',
G('cover-alarm',0,`<g transform="rotate(-7 305 660)">${R(120,510,380,285,C.paper)}${clock(252,625,75)}${T(397,637,'20:00',36,C.blue,'middle')}${T(310,748,'闹钟提醒',43,C.ink,'middle')}</g>`)+
G('cover-map',0,`<g transform="rotate(5 745 970)">${R(515,800,445,330,C.lime)}${P('M570 993L683 866 870 998M570 993L690 1030 870 998',C.ink,6)}${[ [570,993],[683,866],[870,998],[690,1030]].map(([x,y])=>circ(x,y,13,C.paper)).join('')}${T(740,1105,'地图找路线',44,C.ink,'middle')}</g>`)+
G('cover-service',0,`<g transform="rotate(-3 365 1280)">${R(95,1140,600,294,C.blue)}${T(145,1218,'“东西还没到”',47,C.paper)}${P('M160 1267H540',C.paper,4)}${T(147,1348,'客服回留言',56,C.paper)}</g>`)+
G('cover-question',0,ribbon(402,1500,577,'自己会动，就算AI？',C.red),23)+
G('cover-mechanism',5,T(74,885,'到点触发',37,C.blue),10)+G('cover-search',10,T(129,1030,'比较道路',37,C.blue),16)+G('cover-meaning',16,T(744,1336,'处理不同说法',35,C.blue),22)+
G('cover-observe',23,ribbon(138,1510,800,'输入 → 方法 → 输出',C.lime))
));
// 02 Compare an actual trigger, two costed routes and a categorization; each is a separate teaching visual.
S.push(scene('2',2,'三个系统，\n都能自动运行','自动运行，描述的是运行方式',
G('clock-base',0,clock(540,872,245)+T(540,1247,'设定：晚上八点提醒',47,C.ink,'middle'),9)+
G('clock-before',0,R(315,1415,450,100)+T(540,1486,'19:59',64,C.blue,'middle'),4)+G('clock-after',4,R(315,1415,450,100,C.lime)+T(540,1486,'20:00',64,C.ink,'middle'),9)+
G('clock-rings',4,P('M218 751L168 704M221 876H144M866 751L916 704M863 876H940',C.red,12)+ribbon(328,530,430,'到点 → 响铃',C.red),9)+
G('route-map',9,map(165,745,1),21)+G('route-costs',12,T(540,609,'两条能到达的路',53,C.ink,'middle')+T(540,1316,'上路：3 + 4 = 7分钟',46,C.blue,'middle')+T(540,1406,'下路：5 + 4 = 9分钟',46,C.ink,'middle'),21)+
G('route-choice',16,P('M165 945L515 745 865 945',C.blue,15,'none','data-draw="true"')+ribbon(280,1500,520,'比较成本 → 选路线',C.lime),21)+
G('category-message',21,R(115,605,850,148)+T(160,702,'“东西还没到”',67),99)+A('M540 775V855',23,'category-in')+
G('category-model',23,R(205,883,670,190,C.blue)+T(540,1003,'分类模型',66,C.paper,'middle'),99)+A('M540 1098V1170',25,'category-out')+
G('category-result',25,R(330,1195,420,168,C.lime)+T(540,1310,'物流问题',68,C.ink,'middle'))+
G('category-conclude',28,T(540,1515,'自动运行 ≠ 相同方法',46,C.blue,'middle'))
));
// 03 Perception, judgement and action. Later dimming explicitly allows a one-stage AI component.
S.push(scene('3',3,'一句话，\n怎样变成回复？','流程位置，帮助我们看清任务',
G('voice',0,T(90,575,'客户声音',37)+P('M95 683H133L153 644 176 736 200 594 221 769 247 628 270 735 300 660 327 708 353 643 379 720 405 665 440 688H950',C.blue,7,'none','data-draw="true"'))+
G('transcript',4,R(120,801,840,147)+T(156,849,'① 感知 · 声音转文字',34,C.blue)+T(155,917,'“东西还没到”',53))+
A('M540 727V782',3,'voice-route')+
G('intent',10,R(120,1086,840,157,C.lime)+T(154,1138,'② 判断 · 识别问题',34)+T(154,1208,'客户在问：物流进度',51))+
A('M540 975V1063',9,'intent-route')+
G('reply',16,R(120,1371,840,160,C.red)+T(155,1420,'③ 行动 · 生成结果',34,C.paper)+T(156,1492,'“我来帮您查物流。”',48,C.paper))+
A('M540 1270V1348',15,'reply-route')+
G('single-stage',23,ribbon(106,1559,868,'AI也可以只做“声音转文字”',C.lime),26)+
G('ordinary-program',26,R(120,1316,340,179,C.blue)+T(290,1428,'AI模块',55,C.paper,'middle')+P('M490 1406H563',C.ink,6,'none','marker-end="url(#arrow)"')+R(592,1316,365,179,C.paper)+T(775,1428,'普通程序',51,C.ink,'middle')+T(540,1575,'产品还会接上普通程序',43,C.blue,'middle'))+
G('flow-example',28,ribbon(129,1610,822,'流程是示意，顺序不固定',C.lime))
));
// 04 Rules and learning are distinct mechanisms. No parameter is a displayed probability.
S.push(scene('4',4,'规则、搜索和学习，\n办法不同','AI包含多种路线；学习是重要的一类',
G('rule-head',0,ribbon(80,535,920,'办法一：人写条件',C.paper),10)+
G('rule-condition',1,R(140,730,800,150)+T(170,827,'若文字包含“退货”',56),10)+A('M540 901V990',4,'rule-arrow',C.ink,10)+G('rule-result',5,R(250,1015,580,150,C.lime)+T(540,1115,'归入退货类',63,C.ink,'middle'),10)+G('rule-defined',8,T(540,1395,'条件由人明确写出',49,C.blue,'middle'),10)+
G('learn-head',10,ribbon(80,535,920,'办法二：从已标好的例子学习',C.lime),24)+
G('learn-examples',10,R(92,700,426,122)+T(112,750,'“怎么还没到”',38)+T(112,798,'已有标签：物流',34,C.blue)+R(565,700,423,122)+T(585,750,'“我想退货”',38)+T(585,798,'已有标签：退货',34,C.blue),24)+
G('learn-model',13,nodeModel(210,907,660)+P('M820 954V1050',C.paper,3)+'<circle id="learn-parameter-marker" cx="820" cy="982" r="10" fill="#d4fb43"/>',24)+A('M310 847L430 884M770 847L650 884',12,'learn-enter',C.ink,24)+
G('learn-compare',16,R(184,1202,710,130,C.paper)+T(213,1250,'预测：物流   ≠   已有答案：退货',35)+T(540,1309,'计算偏差',48,C.red,'middle'),24)+A('M540 1122V1180',15,'learn-predict',C.ink,24)+
A('M182 1270H113V1010H190',19,'learn-feedback',C.red,24)+G('learn-adjust',19,T(540,1431,'训练调整模型参数',51,C.blue,'middle')+T(540,1510,'通常反复调整，一次未必答对',34,C.ink,'middle'),24)+
G('search-final',24,map(145,762,1.03)+ribbon(150,535,780,'地图还可以用搜索算法',C.paper)+T(540,1382,'道路连接 + 通行成本',48,C.ink,'middle')+T(540,1481,'搜索不必依赖机器学习',43,C.blue,'middle'),26)+
G('method-family',26,T(540,655,'AI有多种做法',66,C.blue,'middle')+ribbon(128,777,824,'规则：把条件写出来',C.paper)+ribbon(128,978,824,'搜索：比较候选路径',C.lime)+ribbon(128,1179,824,'学习：从例子调整参数',C.paper))+
G('alarm-boundary',28,clock(201,1487,68)+T(320,1490,'会自动响',50)+T(320,1554,'≠ 证明用了AI',50,C.red))
));
// 05 AI, ordinary programs and people cooperate; later the drawing turns into two observation lenses.
S.push(scene('5',5,'AI和自动化，\n可以组合','看运行步骤，也看判断依靠什么',
G('combined-input',0,R(119,550,840,120)+T(153,630,'客户留言：“东西还没到”',49),22)+
G('ai-judgement',4,R(119,810,840,185,C.blue)+T(161,864,'AI 判断',42,C.paper)+T(161,941,'物流问题 → 拟一条回复',50,C.paper),22)+
A('M540 699V780',3,'combined-one',C.ink,22)+
G('program-save',9,R(119,1120,840,160,C.paper)+T(159,1175,'普通程序执行',37,C.blue)+T(159,1242,'保存回复草稿',54),22)+
A('M540 1026V1090',8,'combined-two',C.ink,22)+
G('human-confirm',14,R(119,1402,840,162,C.lime)+T(159,1459,'人工确认',41)+T(159,1526,'核对内容后，才发送',52),22)+
A('M540 1310V1372',13,'combined-three',C.ink,22)+
G('confirm-stamp',18,`<g transform="rotate(-8 831 1505)">${circ(831,1505,71,C.red)}${T(831,1521,'确认',36,C.paper,'middle')}</g>`,22)+
G('automation-focus',22,R(81,580,439,352,C.paper)+T(121,672,'自动化',60,C.blue)+T(119,776,'多少步骤',48)+T(119,846,'系统自动执行',43)+R(568,580,432,352,C.lime)+T(610,672,'AI能力',60,C.blue)+T(608,776,'判断和处理',44)+T(608,846,'靠什么办法',43))+
G('ai-focus',24,ribbon(133,1001,812,'全部自动 ≠ 全部正确',C.red))+
G('chat-window',26,R(114,1197,850,219,C.paper)+T(157,1265,'一个聊天窗口',49)+T(157,1355,'不能证明每一步都是大模型',47,C.blue))+
G('evidence-focus',28,ribbon(98,1535,895,'看流程 / 技术说明 / 实际结果',C.lime))
));
// 06 A filled identity card, then concrete learner exercises. No artificial three-minute wait.
S.push(scene('6',6,'小实验：\n写一张系统身份卡','把“它很智能”改成具体描述',
G('identity-base',0,R(115,547,850,996,C.paper)+ribbon(161,586,754,'系统 A · 每天20点提醒',C.blue))+
G('identity-input',3,T(171,773,'输入',37,C.blue)+T(171,841,'当前时间',57)+P('M170 884H907','#85886e',2))+
G('identity-goal',7,T(171,970,'目标',37,C.blue)+T(171,1038,'晚上八点提醒',56)+P('M170 1081H907','#85886e',2))+
G('identity-method',11,T(171,1167,'方法',37,C.blue)+T(171,1235,'到点触发 → 响铃',54))+
G('identity-known',15,ribbon(172,1356,734,'看的是具体任务和办法',C.lime))+
G('practice-overlay',19,R(123,552,844,1004,C.lime)+T(164,636,'轮到你：地图与分类模型',48)+P('M162 675H914',C.ink,3))+
G('practice-map',20,T(169,766,'B  地图',51,C.blue)+T(169,833,'输入：道路与通行成本',39)+T(169,896,'目标：找路线；方法：搜索',37))+
G('practice-class',22,T(169,1010,'C  留言分类',51,C.blue)+T(169,1083,'训练材料：已标好类的留言',37)+T(169,1146,'目标：分问题类别',39)+T(169,1209,'方法：用例子训练模型',39))+
G('practice-pause',24,T(540,1438,'请自行暂停约3分钟',45,C.ink,'middle'))+
G('practice-unknown',26,T(169,1325,'没有证据的办法：写“未知”',37))+
G('practice-boundary',28,T(540,1640,'机制示意，不鉴定商业产品',37,C.blue,'middle'))
));
// 07 Demonstrate A and B at full phone width, then reduce to a compact side-by-side mechanism comparison.
S.push(scene('7',7,'名字相同，\n能力可能差很远','两个都叫“AI客服”的教学情境',
G('serviceA',0,R(104,572,873,909,C.paper)+T(157,663,'客服甲 · 匹配预设问题',52,C.blue)+T(540,876,'“几天发货？”',75,C.ink,'middle')+P('M540 940V1108',C.ink,7,'none','marker-end="url(#arrow)"')+T(540,1213,'固定答案',51,C.blue,'middle')+T(540,1351,'“48小时内发货”',68,C.ink,'middle'),8)+
G('serviceB',8,R(104,572,873,977,C.blue)+T(151,663,'客服乙 · 识别、检索、生成',48,C.paper)+T(540,830,'“等了好久了”',69,C.paper,'middle'),17)+
G('B-intent',8,T(540,1006,'识别意图：询问发货',54,C.paper,'middle'),17)+
G('B-retrieve',11,P('M540 1045V1121',C.paper,6)+T(540,1197,'检索相关发货资料',54,C.paper,'middle'),17)+
G('B-generate',14,P('M540 1234V1310',C.paper,6)+T(540,1398,'依据资料，生成回答',54,C.paper,'middle'),17)+
G('case-pair',17,R(82,593,440,563,C.paper)+T(126,679,'甲',70,C.blue)+T(122,802,'匹配预设问题',43)+T(122,899,'返回固定答案',43)+T(122,1019,'固定问题上',38)+T(122,1080,'可能更稳定',40)+R(568,593,431,563,C.blue)+T(612,679,'乙',70,C.paper)+T(608,802,'识别客户意图',42,C.paper)+T(608,899,'检索并生成',43,C.paper)+T(608,1080,'处理更多说法',39,C.paper))+
G('A-stability',18,T(305,1251,'适用范围较固定',36,C.blue,'middle'))+
G('B-risk',20,ribbon(578,1202,410,'也可能出错',C.red)+T(609,1394,'找错资料',43)+T(609,1459,'写错内容',43))+
G('choice-condition',24,R(82,1527,915,120,C.lime)+T(540,1607,'看问题、回复依据、转人工条件',39,C.ink,'middle'))+
G('case-boundary',28,T(540,1690,'教学情境，不替真实产品作技术鉴定',30,'#555b48','middle'))
));
// 08 Return to the actual three examples, then build one reusable observation map.
S.push(scene('8',8,'看新产品，\n先问三个问题','把能力讲具体，也保留未知',
G('recap-clock',0,clock(206,656,84)+T(206,815,'按时间响铃',34,C.ink,'middle'),12)+
G('recap-map',4,P('M420 661L520 581 637 661M420 661L520 746 637 661',C.blue,6)+[ [420,661],[520,581],[637,661],[520,746]].map(([x,y])=>circ(x,y,11,C.lime)).join('')+T(527,815,'按道路搜索',34,C.ink,'middle'),12)+
G('recap-class',8,R(741,580,245,161,C.lime)+T(863,648,'留言例子',32,C.ink,'middle')+T(863,710,'训练分类',34,C.blue,'middle')+T(863,815,'从例子学习',34,C.ink,'middle'),12)+
G('observe-input',12,ribbon(112,577,856,'输入：它拿到什么？',C.paper))+
G('observe-goal',16,ribbon(112,820,856,'目标：输出要解决什么？',C.lime))+
G('observe-method',20,ribbon(112,1063,856,'方法：靠什么办法？',C.blue))+
G('observe-unknown',24,T(540,1336,'哪些条件还没有证据？',49,C.red,'middle')+T(540,1430,'自动化与AI，多种路线，都可组合',35,C.ink,'middle'))+
G('next-lesson',27,R(111,1510,858,143,C.paper)+T(146,1564,'下一讲',34,C.blue)+T(146,1627,'这些技术怎样发展并组合？',47))
));
window.COURSE_SCENES=S;window.COURSE_PALETTE=C;
})();
