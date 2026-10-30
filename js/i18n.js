// =============================================
//  ことば（日本語・English・繁體中文・한국어）
//  ===========================================

(function () {
  var LANGS = ['ja', 'en', 'zh', 'ko'];
  var KEY = 'pinchbowl-lang';
  var D = {
 "lang_label": [
  "ことば",
  "Language",
  "語言",
  "언어"
 ],
 "home": [
  "なすびのお庭へ",
  "Nasubi's Garden (more games)",
  "前往茄子的庭院",
  "가지의 정원으로"
 ],
 "howto": [
  "あそびかた",
  "How to play",
  "玩法",
  "플레이 방법"
 ],
 "close": [
  "とじる",
  "Close",
  "關閉",
  "닫기"
 ],
 "back": [
  "もどる",
  "Back",
  "返回",
  "돌아가기"
 ],
 "to_title": [
  "タイトルへ",
  "Back to title",
  "回到標題",
  "타이틀로"
 ],
 "again": [
  "もう一回",
  "Play again",
  "再來一局",
  "한 판 더"
 ],
 "easy": [
  "よわい",
  "Easy",
  "簡單",
  "약함"
 ],
 "normal": [
  "ふつう",
  "Normal",
  "普通",
  "보통"
 ],
 "hard": [
  "つよい",
  "Hard",
  "困難",
  "강함"
 ],
 "vs_cpu": [
  "CPUとたいせん",
  "VS CPU",
  "對戰CPU",
  "CPU와 대전"
 ],
 "online": [
  "あいことばで対戦",
  "Play with a passcode",
  "用暗號對戰",
  "암호로 대전"
 ],
 "passcode": [
  "あいことば",
  "Passcode",
  "暗號",
  "암호"
 ],
 "name": [
  "なまえ",
  "Name",
  "名字",
  "이름"
 ],
 "noname": [
  "ななし",
  "Anonymous",
  "無名氏",
  "익명"
 ],
 "online_hint": [
  "同じあいことばを入れた人と対戦。3人目からは観戦になります。",
  "Play against whoever enters the same passcode. From the 3rd person on, you watch.",
  "和輸入相同暗號的人對戰。第3個人開始為觀戰。",
  "같은 암호를 입력한 사람과 대전. 3번째 사람부터는 관전이 됩니다."
 ],
 "join": [
  "はいる",
  "Join",
  "進入",
  "입장"
 ],
 "wait_pre": [
  "あいことば「",
  "Passcode: ",
  "暗號「",
  "암호 「"
 ],
 "wait_post": [
  "」",
  "",
  "」",
  "」"
 ],
 "waiting": [
  "あいてを待っています…",
  "Waiting for an opponent…",
  "等待對手中…",
  "상대를 기다리는 중…"
 ],
 "copy_link": [
  "さそうリンクをコピー",
  "Copy invite link",
  "複製邀請連結",
  "초대 링크 복사"
 ],
 "copied": [
  "コピーしました！",
  "Copied!",
  "已複製！",
  "복사했어요!"
 ],
 "send_link": [
  "このリンクを送ってください",
  "Send this link",
  "請傳送這個連結",
  "이 링크를 보내 주세요"
 ],
 "err_code": [
  "あいことばを入れてください（. # $ / [ ] は使えません）",
  "Enter a passcode (. # $ / [ ] are not allowed)",
  "請輸入暗號（不能使用 . # $ / [ ]）",
  "암호를 입력해 주세요 (. # $ / [ ] 는 사용할 수 없어요)"
 ],
 "err_code_short": [
  "あいことばを入れてください",
  "Enter a passcode",
  "請輸入暗號",
  "암호를 입력해 주세요"
 ],
 "connecting": [
  "つないでいます…",
  "Connecting…",
  "連線中…",
  "연결 중…"
 ],
 "err_net": [
  "通信できませんでした。電波のよいところでもう一度ためしてください",
  "Couldn't connect. Please try again where the signal is better.",
  "無法連線。請在訊號好的地方再試一次。",
  "연결하지 못했어요. 신호가 좋은 곳에서 다시 시도해 주세요."
 ],
 "err_notready": [
  "オンライン対戦はまだ準備中です",
  "Online play isn't ready yet",
  "線上對戰還在準備中",
  "온라인 대전은 아직 준비 중이에요"
 ],
 "err_conn": [
  "つながりませんでした",
  "Couldn't connect",
  "無法連線",
  "연결되지 않았어요"
 ],
 "left_win": [
  "相手が抜けたので、あなたの勝ち！",
  "Your opponent left, so you win!",
  "對手離開了，你贏了！",
  "상대가 나가서 당신의 승리!"
 ],
 "left": [
  "あいてが退室しました",
  "Your opponent left",
  "對手已離開",
  "상대가 퇴장했어요"
 ],
 "watch_in": [
  "観戦で入りました。試合が始まるのを待っています…",
  "You joined as a spectator. Waiting for the game to start…",
  "已用觀戰身分進入。等待比賽開始…",
  "관전으로 입장했어요. 경기 시작을 기다리는 중…"
 ],
 "wait_next": [
  "次の試合が始まるのを待っています…",
  "Waiting for the next game…",
  "等待下一局開始…",
  "다음 경기를 기다리는 중…"
 ],
 "wait_rematch": [
  "あいての「もう一回」を待っています…",
  "Waiting for your opponent to choose \"Play again\"…",
  "等待對手按「再來一局」…",
  "상대의 '한 판 더'를 기다리는 중…"
 ],
 "you": [
  "あなた",
  "You",
  "你",
  "나"
 ],
 "cpu": [
  "CPU",
  "CPU",
  "CPU",
  "CPU"
 ],
 "your_turn": [
  "あなたの番",
  "Your turn",
  "輪到你",
  "내 차례"
 ],
 "cpu_wait_label": [
  "CPU（ふつう）と遊びながら待つ",
  "Play the CPU (Normal) while waiting",
  "一邊和CPU（普通）玩一邊等",
  "기다리는 동안 CPU(보통)와 플레이"
 ],
 "qm_btn": [
  "だれかと対戦",
  "Play someone online",
  "隨機對戰",
  "아무나와 대전"
 ],
 "qm_stat": [
  "対戦待ち <b>{w}</b>人・対戦中 <b>{p}</b>組",
  "<b>{w}</b> waiting · <b>{p}</b> playing",
  "等待中 <b>{w}</b>人・對戰中 <b>{p}</b>組",
  "대기 <b>{w}</b>명 · 대전 중 <b>{p}</b>쌍"
 ],
 "qm_prime_hot": [
  "🔥 いま対戦タイム！（22時まで）",
  "🔥 Battle time now! (until 22:00 JST)",
  "🔥 現在是對戰時間！（到日本時間22點）",
  "🔥 지금은 대전 타임! (일본 시간 22시까지)"
 ],
 "qm_prime": [
  "🌙 毎晩21時〜22時は対戦タイム",
  "🌙 Battle time every night 21:00–22:00 JST",
  "🌙 每晚日本時間21〜22點是對戰時間",
  "🌙 매일 밤 일본 시간 21~22시는 대전 타임"
 ],
 "qm_sub": [
  "いま待っている人と、自動でつながります。",
  "You'll be matched automatically with someone who's waiting.",
  "自動和正在等待的人配對。",
  "기다리고 있는 사람과 자동으로 연결돼요."
 ],
 "qm_go": [
  "さがす",
  "Find a match",
  "尋找",
  "찾기"
 ],
 "qm_badname": [
  "その名前は使えません。ほかの名前にしてね",
  "That name can't be used. Please choose another.",
  "這個名字不能使用，請換一個。",
  "그 이름은 사용할 수 없어요. 다른 이름으로 해 주세요."
 ],
 "qm_searching": [
  "相手をさがしています",
  "Looking for an opponent",
  "正在尋找對手",
  "상대를 찾는 중"
 ],
 "qm_wait_pre": [
  "いま対戦待ち ",
  "Waiting now: ",
  "目前等待中 ",
  "현재 대기 "
 ],
 "qm_wait_post": [
  "人",
  "",
  "人",
  "명"
 ],
 "qm_cpu": [
  "CPUと遊びながら待つ",
  "Play the CPU while waiting",
  "一邊和CPU玩一邊等",
  "기다리는 동안 CPU와 플레이"
 ],
 "qm_cancel": [
  "やめる",
  "Cancel",
  "取消",
  "그만두기"
 ],
 "qm_retry": [
  "もう一度さがす",
  "Search again",
  "再找一次",
  "다시 찾기"
 ],
 "qm_searching_t": [
  "相手をさがしています… {t}",
  "Looking for an opponent… {t}",
  "正在尋找對手… {t}",
  "상대를 찾는 중… {t}"
 ],
 "qm_calling": [
  "CPUと遊んでいる人に声をかけています…",
  "Inviting someone who is playing the CPU…",
  "正在邀請正在和CPU玩的人…",
  "CPU와 플레이 중인 사람에게 신청하는 중…"
 ],
 "qm_declined": [
  "相手が見送りました。ほかの人をさがします",
  "They passed. Looking for someone else.",
  "對方跳過了，改找其他人。",
  "상대가 넘겼어요. 다른 사람을 찾을게요."
 ],
 "qm_found": [
  "相手が見つかりました！",
  "Opponent found!",
  "找到對手了！",
  "상대를 찾았어요!"
 ],
 "qm_avail": [
  "対戦できる相手がいます！",
  "Someone is ready to play!",
  "有可以對戰的對手！",
  "대전할 수 있는 상대가 있어요!"
 ],
 "qm_play": [
  "対戦する",
  "Play",
  "對戰",
  "대전하기"
 ],
 "qm_pass": [
  "見送る",
  "Pass",
  "跳過",
  "넘기기"
 ],
 "qm_taken": [
  "さっきの相手は、ほかの人と対戦を始めました。もう少し待ってね",
  "That player started a match with someone else. Please wait a little longer.",
  "剛才的對手已經和別人開始對戰了。請再等一下。",
  "방금 상대는 다른 사람과 대전을 시작했어요. 조금만 더 기다려 주세요."
 ],
 "qm_fail": [
  "相手とつながりませんでした（{c}）",
  "Couldn't connect to your opponent ({c})",
  "無法和對手連線（{c}）",
  "상대와 연결되지 않았어요 ({c})"
 ],
 "qm_nojoin": [
  "入れませんでした",
  "Couldn't join",
  "無法進入",
  "들어가지 못했어요"
 ],
 "qm_next": [
  "次の相手をさがす",
  "Find next opponent",
  "尋找下一位對手",
  "다음 상대 찾기"
 ],
 "doc_title": [
  "ピンチボウル",
  "Pinch Bowl",
  "閃避保齡球",
  "핀치 볼"
 ],
 "doc_desc": [
  "ボウリングのピンになって、球をよけろ！ 投げる番とよける番を交代する1対1。ピンがたくさん残った方が勝ち。",
  "Become a bowling pin and dodge the ball! A 1-on-1 where you take turns throwing and dodging. Most pins left wins.",
  "變成保齡球瓶，閃開球！投球和閃避輪流交換的1對1。剩下較多球瓶的人獲勝。",
  "볼링 핀이 되어 공을 피해라! 던지는 차례와 피하는 차례를 교대하는 1대1. 핀이 많이 남은 쪽이 승리."
 ],
 "l1": [
  "ピンチ",
  "PINCH",
  "閃避",
  "핀치"
 ],
 "l2": [
  "ボウル",
  "BOWL",
  "保齡球",
  "볼"
 ],
 "sign": [
  "ピンチボウル",
  "PINCH BOWL",
  "閃避保齡球",
  "핀치 볼"
 ],
 "sub": [
  "ピンになって、球をよけろ！ <b>1対1</b>",
  "Be the pin. Dodge the ball! <b>1 vs 1</b>",
  "變成球瓶，閃開球！ <b>1對1</b>",
  "핀이 되어 공을 피해라! <b>1대1</b>"
 ],
 "color": [
  "いろ",
  "Color",
  "顏色",
  "색"
 ],
 "deco": [
  "かざり",
  "Accessory",
  "裝飾",
  "장식"
 ],
 "lv_easy": [
  "かんたん",
  "Easy",
  "簡單",
  "쉬움"
 ],
 "lv_normal": [
  "ふつう",
  "Normal",
  "普通",
  "보통"
 ],
 "lv_hard": [
  "むずかしい",
  "Hard",
  "困難",
  "어려움"
 ],
 "online2": [
  "あいことば対戦",
  "Passcode match",
  "暗號對戰",
  "암호 대전"
 ],
 "snd": [
  "音：",
  "Sound: ",
  "音效：",
  "소리: "
 ],
 "snd_on": [
  "あり",
  "On",
  "開",
  "켜짐"
 ],
 "snd_off": [
  "なし",
  "Off",
  "關",
  "꺼짐"
 ],
 "on_note": [
  "同じ「あいことば」を入れた人と1対1。3人目からは観戦になります。",
  "1-on-1 with whoever enters the same passcode. From the 3rd person on, you watch.",
  "和輸入相同「暗號」的人1對1。第3個人開始為觀戰。",
  "같은 \"암호\"를 입력한 사람과 1대1. 3번째 사람부터는 관전이 됩니다."
 ],
 "ph_name": [
  "8文字まで",
  "Up to 8 characters",
  "最多8個字",
  "8자까지"
 ],
 "ex_code": [
  "例：ストライク",
  "e.g. strike",
  "例：strike",
  "예: strike"
 ],
 "join2": [
  "入る",
  "Join",
  "進入",
  "입장"
 ],
 "h1": [
  "<b>100本のピンのうち、1本があなた。</b>はじめに自分になるピンをえらびます。",
  "<b>One of the 100 pins is you.</b> First, pick which pin you will be.",
  "<b>100支球瓶中，有1支是你。</b>一開始先選自己要當哪一支。",
  "<b>100개의 핀 중 1개가 나.</b> 처음에 내가 될 핀을 고릅니다."
 ],
 "h2": [
  "「投げる番」と「よける番」を<b>3回ずつ</b>交代。最後に<b>ピンがたくさん残っていた方が勝ち</b>。",
  "Take turns throwing and dodging, <b>3 times each</b>. <b>Whoever has more pins standing at the end wins</b>.",
  "「投球回合」和「閃避回合」<b>各3次</b>輪流交換。最後<b>剩下較多球瓶的一方獲勝</b>。",
  "'던지는 차례'와 '피하는 차례'를 <b>3번씩</b> 교대. 마지막에 <b>핀이 많이 남은 쪽이 승리</b>."
 ],
 "h3": [
  "<b>よける番：</b>左がわをさわってスティックで動く（ジャンプはできない）。動いてほかのピンにぶつかると、そのピンも倒れてしまう。",
  "<b>Dodging:</b> touch the left side and move with the stick (no jumping). If you bump into other pins, they fall too.",
  "<b>閃避回合：</b>按住左側用搖桿移動（不能跳）。移動時撞到其他球瓶，那支球瓶也會倒。",
  "<b>피하는 차례:</b> 왼쪽을 터치해 스틱으로 이동 (점프 불가). 움직이다 다른 핀에 부딪히면 그 핀도 쓰러져요."
 ],
 "h4": [
  "ピンにたくさん当たって<b class=\"blue\">青く光った球</b>は、ぶつかれば<b>止められる</b>。<b class=\"red\">赤い球</b>に当たると<b>ふっとんで、その場で負け！</b>",
  "A ball that has hit lots of pins <b class=\"blue\">glows blue</b> — touch it to <b>stop it</b>. Get hit by a <b class=\"red\">red ball</b> and you <b>go flying and lose on the spot!</b>",
  "撞到很多球瓶而<b class=\"blue\">發出藍光的球</b>，撞上去就能<b>擋下來</b>。被<b class=\"red\">紅色的球</b>打到會<b>飛出去，當場輸掉！</b>",
  "핀에 많이 맞아서 <b class=\"blue\">파랗게 빛나는 공</b>은 부딪히면 <b>멈출 수 있어요</b>. <b class=\"red\">빨간 공</b>에 맞으면 <b>날아가서 그 자리에서 패배!</b>"
 ],
 "h5": [
  "<b>前の方のピンをえらぶとボーナス</b>（前から5列：＋15本、6〜10列：＋8本）。最後まで生き残ったら足されます。",
  "<b>Front pins earn a bonus</b> (rows 1–5: +15, rows 6–10: +8). It is added if you survive to the end.",
  "<b>選前面的球瓶有加分</b>（前5排：＋15支，第6〜10排：＋8支）。撐到最後就會加上去。",
  "<b>앞쪽 핀을 고르면 보너스</b> (앞에서 5줄: +15개, 6~10줄: +8개). 끝까지 살아남으면 더해져요."
 ],
 "h6": [
  "<b>投げる番：</b>左右にドラッグで位置、<b>上にスワイプ</b>で投げる。速くスワイプすると速い球、指を曲げるとカーブ。横のガードレールで<b>はね返り</b>もねらえます。「＋バンパー」で、1投に1本<b>はね返り用のバンパー</b>を好きな場所・向きに置けます（相手にも見えます）。",
  "<b>Throwing:</b> drag left/right to set position, <b>swipe up</b> to throw. A fast swipe makes a fast ball; curve your finger for a curve. You can also aim for <b>bounces</b> off the side rails. With \"+ Bumper\", place one <b>bounce bumper</b> per throw anywhere, at any angle (your opponent can see it).",
  "<b>投球回合：</b>左右拖曳調整位置，<b>往上滑</b>投球。滑得快球就快，手指畫弧就會曲球。也可以利用旁邊的護欄<b>反彈</b>。按「＋保險桿」，每投可以在喜歡的位置和方向放1個<b>反彈用保險桿</b>（對手也看得到）。",
  "<b>던지는 차례:</b> 좌우로 드래그해 위치, <b>위로 스와이프</b>해서 던지기. 빠르게 스와이프하면 빠른 공, 손가락을 휘면 커브. 옆 가드레일로 <b>튕기기</b>도 노릴 수 있어요. \"+ 범퍼\"로 한 투구에 1개, <b>튕김용 범퍼</b>를 원하는 위치·방향에 놓을 수 있어요 (상대에게도 보여요)."
 ],
 "pc_note": [
  "PC：よける＝WASD／矢印　投げる＝マウスでスワイプ（キーボードなら ←→で位置、Q/Eでカーブ、スペース長押しで投げる）",
  "PC: Dodge = WASD / arrows · Throw = swipe with the mouse (keyboard: ←→ position, Q/E curve, hold Space to throw)",
  "電腦：閃避＝WASD／方向鍵　投球＝用滑鼠滑動（鍵盤：←→調位置、Q/E曲球、長按空白鍵投球）",
  "PC: 피하기 = WASD / 방향키 · 던지기 = 마우스로 스와이프 (키보드: ←→ 위치, Q/E 커브, 스페이스 길게 눌러 던지기)"
 ],
 "credit": [
  "素材：Kenney「Impact Sounds」（CC0）　音楽：自作",
  "Sounds: Kenney \"Impact Sounds\" (CC0) · Music: original",
  "素材：Kenney「Impact Sounds」（CC0）　音樂：原創",
  "소재: Kenney \"Impact Sounds\" (CC0) · 음악: 자작"
 ],
 "cam": [
  "視点",
  "View",
  "視角",
  "시점"
 ],
 "speed": [
  "はやさ",
  "SPEED",
  "速度",
  "속도"
 ],
 "can_stop": [
  "とめられる",
  "STOP IT",
  "擋得住",
  "멈출 수 있음"
 ],
 "auto": [
  "おまかせ",
  "Auto",
  "隨機",
  "자동"
 ],
 "watching": [
  "観戦中",
  "Watching",
  "觀戰中",
  "관전 중"
 ],
 "bumper": [
  "＋ バンパー",
  "+ Bumper",
  "＋ 保險桿",
  "+ 범퍼"
 ],
 "rot": [
  "↻ まわす",
  "↻ Rotate",
  "↻ 旋轉",
  "↻ 돌리기"
 ],
 "bdel": [
  "とる",
  "Remove",
  "移除",
  "빼기"
 ],
 "pause_t": [
  "ひと休み",
  "Paused",
  "暫停",
  "잠깐 휴식"
 ],
 "resume": [
  "つづける",
  "Resume",
  "繼續",
  "계속하기"
 ],
 "loading": [
  "よみこみ中…",
  "Loading…",
  "讀取中…",
  "불러오는 중…"
 ],
 "pick_tap": [
  "自分になるピンを<br>タップ！",
  "TAP THE PIN<br>THAT'S YOU!",
  "點選要當自己的<br>球瓶！",
  "내가 될 핀을<br>탭!"
 ],
 "pick_hint": [
  "前ほどボーナス！（生き残ったら +15 / +8 本）　でも球は速くて危ない",
  "Front pins: +15 / +8 bonus if you survive — but the ball is faster",
  "越前面加分越多！（活下來 +15 / +8 支）但球很快很危險",
  "앞일수록 보너스! (살아남으면 +15 / +8개) 하지만 공이 빨라서 위험"
 ],
 "pick_wait": [
  "ふたりがピンをえらんでいます…",
  "Both players are picking pins…",
  "兩人正在選球瓶…",
  "두 사람이 핀을 고르는 중…"
 ],
 "pick_me": [
  "このピンが<br>あなた！",
  "THIS PIN<br>IS YOU!",
  "這支球瓶<br>就是你！",
  "이 핀이<br>나!"
 ],
 "throw_n": [
  "{n}投目 / {m}",
  "Throw {n}/{m}",
  "第{n}投/{m}",
  "투구 {n}/{m}"
 ],
 "t_me_throw": [
  "あなたが投げる！<small>{name} のピンをねらえ</small>",
  "YOUR THROW!<small>Aim for {name}'s pin</small>",
  "輪到你投球！<small>瞄準{name}的球瓶</small>",
  "내가 던진다!<small>{name}의 핀을 노려라</small>"
 ],
 "t_me_dodge": [
  "よけろ！<small>{name} が投げてくる</small>",
  "DODGE!<small>{name} is throwing</small>",
  "快閃開！<small>{name}要投球了</small>",
  "피해라!<small>{name}의 공이 온다</small>"
 ],
 "t_watch": [
  "{a} が投げる<small>{b} がよける</small>",
  "{a} throws<small>{b} dodges</small>",
  "{a}投球<small>{b}閃避</small>",
  "{a}의 투구<small>{b}의 회피</small>"
 ],
 "hint_throw": [
  "左右ドラッグで位置　↑ スワイプで投げる（指を曲げるとカーブ）",
  "Drag ←→ to aim · Swipe ↑ to throw (bend to curve)",
  "左右拖曳調位置　↑ 滑動投球（手指畫弧會曲球）",
  "좌우 드래그로 위치 · ↑ 스와이프로 던지기 (손가락을 휘면 커브)"
 ],
 "hint_dodge": [
  "左がわをさわって動く（ピンにぶつかると倒れる）",
  "Touch the left side to move (pins you bump fall over)",
  "按住左側移動（撞到球瓶會倒）",
  "왼쪽을 터치해 이동 (핀에 부딪히면 쓰러짐)"
 ],
 "hint_roll": [
  "よけろ！　青く光ったら止められる",
  "Dodge! Blue glow = you can stop it",
  "快閃！發藍光就能擋下",
  "피해라! 파랗게 빛나면 멈출 수 있음"
 ],
 "hint_bump": [
  "さわった場所にバンパー　↻で向きをかえる",
  "Tap to place the bumper · ↻ to rotate",
  "點哪裡就放保險桿　↻ 改變方向",
  "터치한 곳에 범퍼 · ↻ 로 방향 바꾸기"
 ],
 "ph_aim": [
  "ねらって投げる",
  "Aim & throw",
  "瞄準投球",
  "노려서 던지기"
 ],
 "ph_dodge": [
  "よける",
  "Dodge",
  "閃避",
  "피하기"
 ],
 "ph_watch": [
  "観戦",
  "Watching",
  "觀戰",
  "관전"
 ],
 "ph_pick": [
  "ピンをえらぶ {n}",
  "Pick {n}",
  "選球瓶 {n}",
  "핀 선택 {n}"
 ],
 "ph_dodge2": [
  "よけろ！",
  "Dodge!",
  "快閃！",
  "피해라!"
 ],
 "ph_go": [
  "いけー！",
  "Go!",
  "衝啊！",
  "가라!"
 ],
 "down_n": [
  "{n}本たおれた",
  "{n} pins down",
  "倒了{n}支",
  "{n}개 쓰러짐"
 ],
 "left_n": [
  "のこり {n}本",
  "{n} left",
  "剩 {n} 支",
  "{n}개 남음"
 ],
 "nodmg": [
  "ノーダメージ！",
  "NO DAMAGE!",
  "毫髮無傷！",
  "노 데미지!"
 ],
 "big": [
  "だいはかい！",
  "DEMOLISHED!",
  "大破壞！",
  "대파괴!"
 ],
 "stop": [
  "ストップ！",
  "STOPPED!",
  "擋下了！",
  "스톱!"
 ],
 "res_win": [
  "かち！",
  "YOU WIN!",
  "贏了！",
  "승리!"
 ],
 "res_lose": [
  "まけ…",
  "You lose…",
  "輸了…",
  "패배…"
 ],
 "res_draw": [
  "ひきわけ",
  "Draw",
  "平手",
  "무승부"
 ],
 "x_wins": [
  "{name} の勝ち",
  "{name} wins",
  "{name}獲勝",
  "{name} 승리"
 ],
 "why_blown": [
  "{name} が球に当たってふっとんだ！",
  "{name} got hit and went flying!",
  "{name}被球打中飛出去了！",
  "{name}, 공에 맞아 날아갔다!"
 ],
 "why_score": [
  "のこったピン＋前列ボーナスで勝負！",
  "Decided by pins left + front-row bonus!",
  "以剩下的球瓶＋前排加分決勝負！",
  "남은 핀 + 앞줄 보너스로 승부!"
 ],
 "out": [
  "ふっとび",
  "OUT",
  "飛走",
  "아웃"
 ],
 "pts": [
  "点",
  "pts",
  "分",
  "점"
 ],
 "rem_n": [
  "のこり{n}本",
  "{n} pins left",
  "剩{n}支",
  "{n}개 남음"
 ],
 "bonus_plus": [
  " ＋ 前列ボーナス{b}",
  " + front bonus {b}",
  " ＋ 前排加分{b}",
  " + 앞줄 보너스 {b}"
 ],
 "self": [
  "じばく！",
  "SELF-HIT!",
  "自爆！",
  "자폭!"
 ],
 "opp_self": [
  "あいてがじばく！",
  "OPPONENT SELF-HIT!",
  "對手自爆！",
  "상대 자폭!"
 ],
 "blown_me": [
  "ふっとび！<small>まけ…</small>",
  "KNOCKED OUT!<small>You lose…</small>",
  "飛出去了！<small>輸了…</small>",
  "날아갔다!<small>패배…</small>"
 ],
 "blown_x": [
  "{name} がふっとんだ！",
  "{name} went flying!",
  "{name}飛出去了！",
  "{name}, 날아갔다!"
 ],
 "opp_gone": [
  "あいてがいなくなりました",
  "Your opponent left",
  "對手離開了",
  "상대가 나갔어요"
 ],
 "leave_confirm": [
  "もう一度おすと<br>タイトルにもどります",
  "Press again to<br>return to title",
  "再按一次<br>回到標題",
  "한 번 더 누르면<br>타이틀로 돌아가요"
 ],
 "watch_wait": [
  "観戦します。試合を待っています…",
  "Watching. Waiting for the match…",
  "觀戰中。等待比賽開始…",
  "관전합니다. 경기를 기다리는 중…"
 ],
 "watch_full": [
  "この部屋は観戦の人でいっぱいです（10人まで）",
  "This room is full of spectators (10 max)",
  "這個房間的觀戰人數已滿（最多10人）",
  "이 방은 관전자가 꽉 찼어요 (10명까지)"
 ],
 "ok_tag": [
  "とめられる！",
  "STOP IT!",
  "擋得住！",
  "멈출 수 있어!"
 ],
 "col0": [
  "あか",
  "Red",
  "紅",
  "빨강"
 ],
 "col1": [
  "あお",
  "Blue",
  "藍",
  "파랑"
 ],
 "col2": [
  "みどり",
  "Green",
  "綠",
  "초록"
 ],
 "col3": [
  "きいろ",
  "Yellow",
  "黃",
  "노랑"
 ],
 "col4": [
  "むらさき",
  "Purple",
  "紫",
  "보라"
 ],
 "col5": [
  "ピンク",
  "Pink",
  "粉紅",
  "분홍"
 ],
 "hat0": [
  "パーティ",
  "Party",
  "派對帽",
  "파티"
 ],
 "hat1": [
  "リボン",
  "Ribbon",
  "緞帶",
  "리본"
 ],
 "hat2": [
  "おうかん",
  "Crown",
  "王冠",
  "왕관"
 ],
 "hat3": [
  "ぼうし",
  "Cap",
  "帽子",
  "모자"
 ],
 "hat4": [
  "めがね",
  "Glasses",
  "眼鏡",
  "안경"
 ],
 "hat5": [
  "はちまき",
  "Headband",
  "頭巾",
  "머리띠"
 ]
};
  function pick() {
    try { var q = new URLSearchParams(location.search).get('lang'); if (q && LANGS.indexOf(q) >= 0) { try { localStorage.setItem(KEY, q); } catch (e) {} return q; } } catch (e) {}
    try { var s = localStorage.getItem(KEY); if (s && LANGS.indexOf(s) >= 0) return s; } catch (e) {}
    var n = (navigator.language || 'ja').toLowerCase();
    if (n.indexOf('ja') === 0) return 'ja'; if (n.indexOf('ko') === 0) return 'ko'; if (n.indexOf('zh') === 0) return 'zh'; return 'en';
  }
  var L = pick();
  function t(k, v) {
    var row = D[k]; var i = LANGS.indexOf(L);
    var s = row ? (row[i] != null ? row[i] : row[0]) : k;
    if (v) for (var x in v) s = s.split('{' + x + '}').join(v[x]);
    return s;
  }
  function koFont() {
    if (L !== 'ko' || document.getElementById('ko-font')) return;
    var l = document.createElement('link'); l.id = 'ko-font'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Black+Han+Sans&display=swap'; document.head.appendChild(l);
  }
  function apply() {
    koFont();
    var de = document.documentElement;
    de.lang = L === 'zh' ? 'zh-Hant' : L; de.setAttribute('data-lang', L);
    document.querySelectorAll('[data-i]').forEach(function (e) { e.textContent = t(e.dataset.i); });
    document.querySelectorAll('[data-ih]').forEach(function (e) { e.innerHTML = t(e.dataset.ih); });
    document.querySelectorAll('[data-ip]').forEach(function (e) { e.placeholder = t(e.dataset.ip); });
    document.querySelectorAll('[data-ia]').forEach(function (e) { e.setAttribute('aria-label', t(e.dataset.ia)); });
    document.querySelectorAll('.langs button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.lang === L ? 'true' : 'false'); });
    document.title = t('doc_title');
    var md = document.querySelector('meta[name="description"]'); if (md) md.setAttribute('content', t('doc_desc'));
    try { document.dispatchEvent(new CustomEvent('langchange', { detail: L })); } catch (e) {}
  }
  function set(l) { if (LANGS.indexOf(l) < 0) return; L = l; try { localStorage.setItem(KEY, l); } catch (e) {} apply(); }
  function bind() {
    document.querySelectorAll('.langs button').forEach(function (b) { b.addEventListener('click', function () { set(b.dataset.lang); }); });
    apply();
  }
  window.I18N = { t: t, set: set, apply: apply, get lang() { return L; } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind); else bind();
})();
