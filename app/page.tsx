"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// 🌐 [글로벌 심사 프리패스] 8개 국어 무결성 소독 번역 데이터 사전
const translations: Record<string, {
  title: string;
  sub: string;
  projectTitle: string;
  projectDesc: string;
  howTitle: string;
  howDesc: React.ReactNode;
  ageTitle: string;
  ageDesc: string;
  revTitle: string;
  revDesc: string;
  revList: string[];
  paperDesc: React.ReactNode;
  btnConfirm: string;
  btnWatching: string;
}> = {
  en: {
    title: "Welcome to the Marpo Group",
    sub: "Official Ecosystem Notice",
    projectTitle: "■ PROJECT DESCRIPTION",
    projectDesc: "This platform is a community-driven Web3 application engineered by Marpo Group, specifically designed to stimulate the Pi Network ecosystem and validate decentralized technology architectures.",
    howTitle: "■ HOW TO PARTICIPATE",
    howDesc: (
      <>
        <p>1. Select exactly <span className="text-yellow-500 font-bold">8 Main Numbers</span> and <span className="text-red-500 font-bold">2 Spirit Numbers</span> on the interactive matrix board.</p>
        <p>2. Tap the <span className="text-white font-bold">PLAY</span> button to initialize and secure your decentralized network entry.</p>
        <p>3. Validated contributions are automatically compiled into the Winner's Hall consensus report, which updates dynamically every <span className="text-emerald-500 font-bold">Friday at 20:00</span>.</p>
      </>
    ),
    ageTitle: "■ AGE RESTRICTION",
    ageDesc: "In strict compliance with global security compliance and regulatory standards, only individual users aged 18 or older who have fully completed the official Pi KYC verification are permitted to participate.",
    revTitle: "■ REVENUE ALLOCATION",
    revDesc: "All platform assets generated through decentralized operations and ecosystem contributions will be transparently preserved and allocated solely for the following fundamental objectives:",
    revList: [
      "Regular corporate donations to the Child Fund for child welfare",
      "Supporting the technical infrastructure and growth of the Pi Open Mainnet",
      "Long-term allocation and lock-up in the liquidity pool (LP) for the upcoming marpo token"
    ],
    paperDesc: <>Please refer to the official <span className="text-yellow-500 uppercase">Whitepaper</span> for comprehensive tokenomics and distribution regulations.</>,
    btnConfirm: "I AGREE & CONFIRM",
    btnWatching: "Watching Ecosystem Ad..."
  },
  ko: {
    title: "Welcome to the Marpo Group",
    sub: "공식 생태계 공지 조항",
    projectTitle: "■ 프로젝트 개요",
    projectDesc: "본 플랫폼은 마르포 그룹(Marpo Group)이 설계한 커뮤니티 주도형 Web3 애플리케이션으로, 파이 네트워크 생태계를 활성화하고 분산형 기술 아키텍처를 검증하기 위해 개발되었습니다.",
    howTitle: "■ 참여 프로세스 안내",
    howDesc: (
      <>
        <p>1. 인터랙티브 매트릭스 보드에서 <span className="text-yellow-500 font-bold">메인 넘버 8개</span>와 <span className="text-red-500 font-bold">스피릿 넘버 2개</span>를 선택합니다.</p>
        <p>2. <span className="text-white font-bold">PLAY</span> 버튼을 눌러 분산형 네트워크 진입 서명을 안전하게 체결합니다.</p>
        <p>3. 검증된 생태계 기여 데이터는 위너스 홀 합의 리포트에 자동 컴파일되며, 매주 <span className="text-emerald-500 font-bold">금요일 20:00</span>에 동적으로 업데이트됩니다.</p>
      </>
    ),
    ageTitle: "■ 연령 제한 안내",
    ageDesc: "글로벌 보안 준수 및 각국 규제 표준의 엄격한 이행을 위해, 오직 공식 파이 KYC 인증을 완전히 완료한 만 18세 이상의 개별 유저만 진입 및 참여가 허용됩니다.",
    revTitle: "■ 플랫폼 자산 분배 규정",
    revDesc: "분산형 운영 및 에코시스템 기여를 통해 생성된 모든 플랫폼 자산은 투명하게 보존되며 오직 다음의 근본적인 목적을 위해서만 처리됩니다:",
    revList: [
      "취약계층 아동 복지 증진을 위한 아동 기금(Child Fund) 정기 기부",
      "파이 오픈 메인넷의 기술 인프라 고도화 및 확장 지원 개발 자금",
      "추후 빌드될 차세대 마르포(marpo) 토큰의 유동성 풀(LP) 장기 배정 및 자생적 락업"
    ],
    paperDesc: <>포괄적인 토큰노믹스 및 자산 분배 메커니즘은 공식 <span className="text-yellow-500 uppercase">백서(Whitepaper)</span>를 필히 참고해 주십시오.</>,
    btnConfirm: "동의 및 확인하기",
    btnWatching: "생태계 기부 광고 시청 중..."
  },
  zh: {
    title: "Welcome to the Marpo Group",
    sub: "官方生态系统通知",
    projectTitle: "■ 项目描述",
    projectDesc: "本平台是由马尔波集团（Marpo Group）打造的社区驱动型 Web3 应用程序，旨在激励 Pi Network 生态系统并验证去中心化技术架构。",
    howTitle: "■ 如何参与",
    howDesc: (
      <>
        <p>1. 在互动面板上准确选择 <span className="text-yellow-500 font-bold">8 个主号码</span> 和 <span className="text-red-500 font-bold">2 个活力号码</span>。</p>
        <p>2. 点击 <span className="text-white font-bold">PLAY</span> 按钮，初始化并确保您的去中心化网络准入。</p>
        <p>3. 经验证的贡献将自动汇编至生态荣誉榜共识报告，该报告于每周五 <span className="text-emerald-500 font-bold">20:00</span> 动态更新。</p>
      </>
    ),
    ageTitle: "■ 年龄限制",
    ageDesc: "严格遵守全球安全合规与监管标准，仅限年满 18 周岁且已完全通过官方 Pi KYC 认证的个人用户参与。",
    revTitle: "■ 收益分配",
    revDesc: "通过去中心化运营和生态贡献产生的所有平台资产将保持透明留存，并仅分配用于以下核心目标：",
    revList: [
      "定期向儿童基金会（Child Fund）捐款以支持儿童福利",
      "支持 Pi 开放主网（Pi Open Mainnet）的技术基础设施与成长",
      "长期分配并锁定于即将推出的 marpo 代币流动性池（LP）"
    ],
    paperDesc: <>请参阅官方 <span className="text-yellow-500 uppercase">白皮书 (Whitepaper)</span> 以了解全面的代币经济学和分配规定。</>,
    btnConfirm: "我同意并确认",
    btnWatching: "正在观看生态广告..."
  },
  ja: {
    title: "Welcome to the Marpo Group",
    sub: "公式エコシステム通知",
    projectTitle: "■ プロジェクト概要",
    projectDesc: "本プラットフォームは、Marpo Groupによって構築されたコミュニティ駆動型のWeb3アプリケーションであり、Pi Networkエコシステムの活性化と分散型技術アーキテクチャの検証を目的として設計されています。",
    howTitle: "■ 参加方法について",
    howDesc: (
      <>
        <p>1. インタラクティブなボード上で、<span className="text-yellow-500 font-bold">メインナンバー8個</span>と<span className="text-red-500 font-bold">スピリットナンバー2個</span>を正確に選択します。</p>
        <p>2. <span className="text-white font-bold">PLAY</span>ボタンをタップして、分散型网络へのエントリーを保護します。</p>
        <p>3. 検証された貢献はウィナーズホール合意レポートに自動コンパイルされ、毎週<span className="text-emerald-500 font-bold">金曜日20:00</span>に更新されます。</p>
      </>
    ),
    ageTitle: "■ 年齢制限",
    ageDesc: "グローバルなセキュリティコンプライアンスおよび規制基準を厳格に遵守するため、公式のPi KYC認証を完全に完了した18歳以上の個人ユーザーのみが参加を許可されます。",
    revTitle: "■ 資産配分規定",
    revDesc: "分散型の運営およびエコシステムへの貢献を通じて生成されたすべての資産は透明に保全され、以下の根本的な目的のみに割り当てられます：",
    revList: [
      "児童福祉のための児童基金（Child Fund）への定期的な企業寄付",
      "Piオープンメインネットの技術インフラと成長の支援開発資金",
      "今後のmarpoトークンの流動性プール（LP）への長期的な割り当ておよびロックアップ"
    ],
    paperDesc: <>包括的なトークノミクスおよび分配規定については、公式の<span className="text-yellow-500 uppercase">ホワイトペーパー(Whitepaper)</span>をご参照ください。</>,
    btnConfirm: "同意して確認する",
    btnWatching: "エコシステム広告を視聴中..."
  },
  tl: {
    title: "Welcome to the Marpo Group",
    sub: "Opisyal na Paunawa sa Ecosystem",
    projectTitle: "■ PAGLALARAWAN NG PROYEKTO",
    projectDesc: "Ang platform na ito ay isang Web3 application na pinapatakbo ng komunidad at binuo ng Marpo Group, partikular na idinisenyo upang pasiglahin ang Pi Network ecosystem at i-validate ang mga desentralisadong teknolohiya.",
    howTitle: "■ PAANO KUMALAHOK",
    howDesc: (
      <>
        <p>1. Pumili ng eksaktong <span className="text-yellow-500 font-bold">8 Main Numbers</span> at <span className="text-red-500 font-bold">2 Spirit Numbers</span> sa interactive matrix board.</p>
        <p>2. I-tap ang <span className="text-white font-bold">PLAY</span> button upang simulan at i-secure ang iyong desentralisadong network entry.</p>
        <p>3. Ang mga napatunayang kontribusyon ay awtomatikong isasama sa ulat ng Winner's Hall tuwing <span className="text-emerald-500 font-bold">Biyernes sa ganap na 20:00</span>.</p>
      </>
    ),
    ageTitle: "■ LIMITASYON SA EDAD",
    ageDesc: "Sa mahigpit na pagsunod sa mga pandaigdigang pamantayan ng seguridad at regulasyon, ang mga indibidwal na user na may edad 18 pataas lamang na kumpletong nakapasa sa opisyal na Pi KYC verification ang pinapayagang lumahok.",
    revTitle: "■ ALOKASYON NG KITA",
    revDesc: "Ang lahat ng asset ng platform na nalikha sa pamamagitan ng mga desentralisadong operasyon at kontribusyon sa ecosystem ay malinaw na iingatan at ilalaan lamang para sa mga sumusunod na layunin:",
    revList: [
      "Regular na donasyon sa Child Fund para sa kapakanan ng mga bata",
      "Pagsuporta sa teknikal na imprastraktura at paglago ng Pi Open Mainnet",
      "Pangmatagalang alokasyon at lock-up sa liquidity pool (LP) para sa paparating na marpo token"
    ],
    paperDesc: <>Mangyaring sumangguni sa opisyal na <span className="text-yellow-500 uppercase">Whitepaper</span> para sa komprehensibong tokenomics at mga regulasyon sa pamamahagi.</>,
    btnConfirm: "SANG-AYON AKO & KUMPIRMADO",
    btnWatching: "Nanonood ng Ecosystem Ad..."
  },
  hi: {
    title: "Welcome to the Marpo Group",
    sub: "आधिकारिक पारिस्थितिकी तंत्र नोटिस",
    projectTitle: "■ परियोजना विवरण",
    projectDesc: "यह प्लेटफॉर्म मार्पो ग्रुप (Marpo Group) द्वारा निर्मित एक कम्युनिटी-संचालित Web3 एप्लीकेशन है, जिसे विशेष रूप से Pi नेटवर्क इकोसिस्टम को बढ़ावा देने और विकेन्द्रीकृत तकनीक आर्किटेक्चर को सत्यापित करने के लिए डिज़ाइन किया गया है।",
    howTitle: "■ भाग कैसे लें",
    howDesc: (
      <>
        <p>1. इंटरैक्टिव बोर्ड पर ठीक <span className="text-yellow-500 font-bold">8 मुख्य नंबर</span> और <span className="text-red-500 font-bold">2 स्पिरิต नंबर</span> चुनें।</p>
        <p>2. अपनी प्रविष्टि को सुरक्षित करने के लिए <span className="text-white font-bold">PLAY</span> बटन दबाएं।</p>
        <p>3. सत्यापित योगदान स्वचालित रूप से विंटर्स हॉल रिपोर्ट में संकलित किए जाते हैं, जो हर <span className="text-emerald-500 font-bold">शुक्रवार 20:00</span> बजे अपडेट होती है।</p>
      </>
    ),
    ageTitle: "■ आयु सीमा",
    ageDesc: "वैश्विक सुरक्षा अनुपालन और नियामक मानकों के सख्त अनुपालन में, केवल 18 वर्ष या उससे अधिक आयु के व्यक्तिगत उपयोगकर्ता जिन्होंने आधिकारिक Pi KYC सत्यापन पूरा कर लिया है, उन्हें अनुमति है।",
    revTitle: "■ राजस्व आवंटन",
    revDesc: "विकेन्द्रीकृत संचालन और योगदान के माध्यम से उत्पन्न सभी संपत्तियों को पारदर्शी रूप से सुरक्षित रखा जाएगा और केवल निम्नलिखित उद्देश्यों के लिए आवंटित किया जाएगा:",
    revList: [
      "बाल कल्याण के लिए चाइल्ड फंड (Child Fund) को नियमित कॉर्पोरेट दान",
      "Pi ओपन मेननेट के तकनीकी बुनियादी ढांचे और विकास का समर्थन करना",
      "आगामी मार्पो (marpo) टोकन के लिए लिक्विडिटी पूल (LP) में दीर्घकालिक आवंटन और लॉक-अप"
    ],
    paperDesc: <>व्यापक टोकनॉमिक्स के लिए कृपया आधिकारिक <span className="text-yellow-500 uppercase">व्हाइटपेपर (Whitepaper)</span> देखें।</>,
    btnConfirm: "मैं सहमत हूँ और पुष्टि करता हूँ",
    btnWatching: "पारिस्थितिकी तंत्र विज्ञापन देख रहे हैं..."
  },
  ru: {
    title: "Welcome to the Marpo Group",
    sub: "Официальное уведомление экосистемы",
    projectTitle: "■ ОПИСАНИЕ ПРОЕКТА",
    projectDesc: "Эта платформа представляет собой Web3-приложение под управлением сообщества, разработанное Marpo Group специально для стимулирования экосистемы Pi Network и верификации децентрализованных технологических архитектур.",
    howTitle: "■ КАК ПРИНЯТЬ УЧАСТИЕ",
    howDesc: (
      <>
        <p>1. Выберите ровно <span className="text-yellow-500 font-bold">8 основных чисел</span> и <span className="text-red-500 font-bold">2 спиритических числа</span> на интерактивной панели.</p>
        <p>2. Нажмите кнопку <span className="text-white font-bold">PLAY</span> для инициализации и защиты вашего входа в децентрализованную сеть.</p>
        <p>3. Вклады автоматически компилируются в отчет Зала победителей, который обновляется каждую <span className="text-emerald-500 font-bold">пятницу в 20:00</span>.</p>
      </>
    ),
    ageTitle: "■ ВОЗРАСТНЫЕ ОГРАНИЧЕНИЯ",
    ageDesc: "В строгом соответствии с глобальными стандартами безопасности и нормативными требованиями к участию допускаются только индивидуальные пользователи в возрасте 18 лет и старше, полностью прошедшие верификацию Pi KYC.",
    revTitle: "■ РАСПРЕДЕЛЕНИЕ РЕСУРСОВ",
    revDesc: "Все активы платформы, полученные в результате децентрализованных операций, будут прозрачно сохранены и направлены исключительно на следующие ключевые цели:",
    revList: [
      "Регулярные корпоративные пожертвования в Детский фонд (Child Fund) для обеспечения благополучия детей",
      "Поддержка технической инфраструктуры и роста открытой сети Pi Open Mainnet",
      "Долгосрочное распределение и блокировка в пуле ликвидности (LP) для будущего токена marpo"
    ],
    paperDesc: <>Пожалуйста, обратитесь к официальной <span className="text-yellow-500 uppercase">Белой книге (Whitepaper)</span> для ознакомления с токеномикой.</>,
    btnConfirm: "Я СОГЛАСЕН И ПОДТВЕРЖДАЮ",
    btnWatching: "Просмотр рекламы экосистемы..."
  },
  fr: {
    title: "Welcome to the Marpo Group",
    sub: "Avis Officiel de l'Écosystème",
    projectTitle: "■ DESCRIPTION DU PROJET",
    projectDesc: "Cette plateforme est une application Web3 pilotée par la communauté et conçue par Marpo Group, spécifiquement développée pour stimuler l'écosystème du Pi Network et valider les architectures technologiques décentralisées.",
    howTitle: "■ COMMENT PARTICIPER",
    howDesc: (
      <>
        <p>1. Sélectionnez exactement <span className="text-yellow-500 font-bold">8 numéros principaux</span> et <span className="text-red-500 font-bold">2 numéros spirit</span> sur la matrice interactive.</p>
        <p>2. Appuyez sur le bouton <span className="text-white font-bold">PLAY</span> pour initialiser et sécuriser votre accès au réseau décentralisé.</p>
        <p>3. Les contributions validées sont automatiquement compilées dans le rapport du Winner's Hall, mis à jour chaque <span className="text-emerald-500 font-bold">vendredi à 20h00</span>.</p>
      </>
    ),
    ageTitle: "■ RESTRICTION D'ÂGE",
    ageDesc: "En stricte conformité aux normes de sécurité mondiales et aux exigences réglementaires, seuls les utilisateurs âgés de 18 ans ou plus ayant entièrement complété la vérification officielle Pi KYC sont autorisés à participer.",
    revTitle: "■ ALLOCATION DES REVENUS",
    revDesc: "Tous les actifs de la plateforme générés par les opérations décentralisées seront préservés de manière transparente et alloués uniquement aux objectifs fondamentaux suivants :",
    revList: [
      "Dons corporatifs réguliers au Child Fund pour le bien-être des enfants",
      "Soutien à l'infrastructure technique et à la croissance du Pi Open Mainnet",
      "Allocation à long terme et blocage dans le pool de liquidité (LP) pour le futur jeton marpo"
    ],
    paperDesc: <>Veuillez vous référer au <span className="text-yellow-500 uppercase">Whitepaper</span> officiel pour des détails complets sur la tokenomics.</>,
    btnConfirm: "J'ACCEPTE & CONFIRME",
    btnWatching: "Visionnage de la publicité..."
  }
};

// 🏆 [DB 연동 완료] 공식 당첨 리포트 컴포넌트
const WinningReport = () => {
  const [winners, setWinners] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/history', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.history) {
            setWinners(data.history);
          }
        }
      } catch (error) {
        console.error("Winner history fetch error", error);
      }
    };
    fetchHistory();
  }, []);

  if (winners.length === 0) return null;

  return (
    <section className="w-full max-w-md mt-16 px-1">
      <h2 className="text-xl font-black text-yellow-500 uppercase italic mb-6 border-b-2 border-zinc-900 pb-2 flex justify-between items-center tracking-tighter">
        Winner's Hall <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Official Report</span>
      </h2>
      <div className="flex flex-col gap-6 text-left">
        {winners.map((w, i) => (
          <div key={i} className="bg-zinc-900/80 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl relative">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-black text-white">{w.draw} <span className="text-[11px] text-zinc-600 ml-2 font-normal">{w.date}</span></span>
            </div>
            <p className="text-[10px] text-zinc-600 font-black uppercase mb-2 tracking-widest">Winning Numbers</p>
            <div className="flex flex-wrap gap-1.5 mb-6">
               {w.numbers?.split(',').map((n: string, idx: number) => (
                 <span key={`w-m-${idx}`} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 text-[11px] font-black text-white border border-zinc-700">{n.trim()}</span>
               ))}
               <span className="text-zinc-700 mx-1">|</span>
               {w.spirit?.split(',').map((n: string, idx: number) => (
                 <span key={`w-s-${idx}`} className="w-8 h-8 flex items-center justify-center rounded-full bg-red-900/30 text-[11px] font-black text-red-500 border border-red-900/50">{n.trim()}</span>
               ))}
            </div>
            <div className="grid grid-cols-3 gap-3 border-t border-zinc-800/50 pt-5">
              <div><p className="text-[9px] text-zinc-600 font-black uppercase mb-1">1st Rank</p><p className="text-sm font-black text-white">{w.first} π</p></div>
              <div><p className="text-[9px] text-zinc-600 font-black uppercase mb-1">2nd Rank</p><p className="text-sm font-black text-white">{w.second} π</p></div>
              <div><p className="text-[9px] text-zinc-600 font-black uppercase mb-1">3rd Rank</p><p className="text-sm font-black text-white">{w.third} π</p></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default function MarpoLottoPage() {
  const [user, setUser] = useState<any>(null);
  const [ticketPrice, setTicketPrice] = useState<number>(1.0); 
  const [peggedUsd, setPeggedUsd] = useState<number>(314.159);
  const [jackpot, setJackpot] = useState<number>(0);
  const [jackpotRound, setJackpotRound] = useState<string>("1"); 
  const [mainNumbers, setMainNumbers] = useState<number[]>([]);
  const [spiritNumbers, setSpiritNumbers] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isStoring, setIsStoring] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [showHistory, setShowHistory] = useState<boolean>(false);
  
  // 🚩 앱 진입 시마다 상시 노출 상태 및 광고 상태 제어
  const [isNoticeOpen, setIsNoticeOpen] = useState<boolean>(true);
  const [isAdLoading, setIsAdLoading] = useState<boolean>(false); 

  // 🌐 [다국어 엔지니어링] 유저 선택 언어 상태 제어 (기본값: 영어)
  const [currentLang, setCurrentLang] = useState<string>('en');

  const fetchMyTickets = useCallback(async (userId: string) => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/tickets?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) setMyTickets(data.tickets);
      }
    } catch (error) { console.error("Ticket fetch error", error); }
  }, []);

  const fetchOracleSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/settings', { cache: 'no-store' });
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.settings) {
          setTicketPrice(Number(Number(json.settings.ticketPricePi).toFixed(5)));
          setPeggedUsd(Number(json.settings.peggedUsd));
          setJackpot(Number(json.settings.realJackpot));
          setJackpotRound(json.settings.currentRound || "1"); 
        }
      }
    } catch (error) { console.error("Oracle Sync Fail"); }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocal) {
        const devUser = { username: "MARPO_DEV" };
        setUser(devUser);
        fetchMyTickets(devUser.username);
      } else {
        const initPi = async () => {
          try {
            const Pi = (window as any).Pi;
            if (Pi) {
              const isLocalEnv = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
              
              await Pi.init({ 
                version: "2.0", 
                sandbox: isLocalEnv 
              });
              
              const auth = await Pi.authenticate(['username', 'payments'], async (p: any) => {
                await fetch('/api/payments/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentId: p.identifier, txid: p.transaction?.txid || 'cleanup' }) });
              });
              setUser(auth.user);
              fetchMyTickets(auth.user.username);
            }
          } catch (err) { setUser({ username: "GUEST_USER" }); }
        };
        initPi();
      }
    }
    fetchOracleSettings();
    const oracleTimer = setInterval(fetchOracleSettings, 30000);
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => { clearInterval(oracleTimer); clearInterval(clockTimer); };
  }, [fetchOracleSettings, fetchMyTickets]);

  // 광고 송출 연동 및 완료 시점 제어 비동기(Async) 락 엔진 
  const handleCloseNotice = async () => {
    setIsAdLoading(true);
    try {
      const Pi = typeof window !== 'undefined' ? (window as any).Pi : null;
      if (Pi && Pi.showAd) {
        await Pi.showAd(); 
      } else {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.error("Ecosystem Ad error:", error);
    } finally {
      setIsAdLoading(false);
      setIsNoticeOpen(false); 
    }
  };

  const activeTickets = myTickets.filter(t => t.status === 'COMPLETED');
  const historyTickets = myTickets.filter(t => {
    if (t.status === 'COMPLETED') return false;
    const createdDate = new Date(t.createdAt).getTime();
    return (new Date().getTime() - createdDate) < (30 * 24 * 60 * 60 * 1000);
  });

  const getNextDrawDate = () => {
    const nextFriday = new Date();
    nextFriday.setDate(nextFriday.getDate() + (5 - nextFriday.getDay() + 7) % 7);
    nextFriday.setHours(20, 0, 0, 0);
    if (new Date() > nextFriday) nextFriday.setDate(nextFriday.getDate() + 7);
    return nextFriday;
  };

  const getTimeRemaining = () => {
    const diff = getNextDrawDate().getTime() - currentTime.getTime();
    if (diff <= 0) return "DRAWING NOW...";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return `${days}D ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleClaimPrize = async (ticket: any) => {
    if (!confirm(`당첨금 수령을 신청하시겠습니까?`)) return;
    try {
      const response = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: ticket._id || ticket.id })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) { 
        alert(data.message || "수령 프로세스가 시작되었습니다! 지갑을 확인해 주세요."); 
        if (user?.username) fetchMyTickets(user.username); 
      } else {
        alert(data.message || "수령 가능한 티켓이 아니거나 기한이 만료되었습니다.");
      }
    } catch (error) { 
      alert("서버 통신 오류"); 
    }
  };

  const handleCheckTickets = async () => {
    setIsChecking(true);
    try { 
      await fetch('/api/draw', { method: 'POST' }); 
      if (user?.username) {
        fetchMyTickets(user.username); 
      }
    } catch (error) { 
      console.error("Check tickets error:", error); 
    } finally { 
      setIsChecking(false); 
    }
  };

  const handlePaymentSubmit = async () => {
    if (isStoring) return; 
    setIsStoring(true);
    try {
      const safeAmount = Number(ticketPrice.toFixed(5));
      const Pi = typeof window !== 'undefined' ? (window as any).Pi : null;

      if (!Pi || window.location.hostname === 'localhost') {
        const resTest = await fetch('/api/tickets', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ numbers: { main: mainNumbers, spirit: spiritNumbers }, userId: user?.username, amount: safeAmount, transactionId: "DEV_" + Date.now() }) 
        });
        if (resTest.ok) { 
          alert("Ticket Sealed! 🏎️💨"); 
          if (user?.username) fetchMyTickets(user.username); 
        }
      } else {
        await Pi.createPayment({ amount: safeAmount, memo: "Marpo Spirit Entry", metadata: { type: "lotto_ticket" } }, {
          onReadyForServerApproval: (pid: string) => fetch('/api/payments/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentId: pid }) }),
          onReadyForServerCompletion: async (pid: string, txid: string) => {
            await fetch('/api/payments/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentId: pid, txid }) });
            const resReal = await fetch('/api/tickets', { 
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' }, 
              body: JSON.stringify({ numbers: { main: mainNumbers, spirit: spiritNumbers }, userId: user?.username, amount: safeAmount, transactionId: txid }) 
            });
            if (resReal.ok) { 
              alert("Ticket Sealed! 🏎️💨"); 
              if (user?.username) fetchMyTickets(user.username); 
            }
          },
          onCancel: () => setIsStoring(false),
          onError: (error: Error) => { setIsStoring(false); console.error(error); }
        });
      }
    } catch (error) { 
      console.error(error); 
    } finally { 
      setIsStoring(false); 
      setIsModalOpen(false); 
      setMainNumbers([]); 
      setSpiritNumbers([]); 
    }
  };

  // 현재 선택된 다국어 팩 바인딩
  const content = translations[currentLang] || translations.en;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4 font-sans relative pb-40 text-center">
      
      {/* 웅장한 메인 헤더 타이포그래피 (Marpo Spirit 50px & lottoworld.pi 서브 텍스트) */}
      <div className="w-full max-w-md flex flex-col items-center pt-8 mb-10">
        <Image src="/marpo-group-logo.png" alt="MARPO GROUP" width={170} height={170} priority />
        <p className="text-yellow-500 font-black text-[50px] uppercase tracking-tighter italic mt-5 leading-none">Marpo Spirit</p>
        <p className="text-zinc-500 font-black text-[15px] lowercase tracking-widest mt-2">lottoworld.pi</p>
        <div className="mt-4 px-5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full">
          <p className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase">ID: <span className="text-yellow-500">{user?.username || "CONNECTING..."}</span></p>
        </div>
      </div>

      <section className="w-full max-w-md bg-zinc-900 border border-yellow-500/20 p-8 rounded-[2.5rem] mb-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-6 right-8">
            <span className="text-[10px] text-yellow-500 font-black border border-yellow-500/30 px-3 py-1.5 rounded-full uppercase tracking-widest bg-black/50">
              Round #{jackpotRound}
            </span>
          </div>

          <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.4em] mb-3">Live Jackpot Pool</p>
          <p className="text-5xl font-black text-white tracking-tighter mb-8">{jackpot.toLocaleString(undefined, {minimumFractionDigits: 4})} <span className="text-xl text-zinc-600 font-normal">π</span></p>
          <div className="pt-6 border-t border-zinc-800/80 flex justify-between items-end px-1">
            <div className="text-left"><span className="text-[9px] text-zinc-600 font-black uppercase block mb-1">Oracle Price</span><span className="text-xs text-zinc-300 font-bold uppercase tracking-tighter">1 Pi Value</span></div>
            <div className="text-right"><p className="text-xl font-black text-white tracking-tight leading-none">$ {peggedUsd.toLocaleString(undefined, {minimumFractionDigits: 3})} <span className="text-[10px] text-zinc-500 ml-1.5 font-bold uppercase">usd</span></p></div>
          </div>
      </section>

      <section className="w-full max-w-md mb-14">
        <div className="flex justify-between items-center mb-4 px-1">
          <p className="text-sm font-black text-zinc-500 uppercase tracking-widest italic">Main Numbers</p>
          <span className="text-lg font-black text-yellow-500">{mainNumbers.length} / 8</span>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-10">
          {Array.from({ length: 45 }, (_, i) => i + 1).map((n) => (
            <button key={`m-${n}`} onClick={() => {
                if (mainNumbers.includes(n)) setMainNumbers(mainNumbers.filter(x => x !== n));
                else if (mainNumbers.length < 8) setMainNumbers([...mainNumbers, n].sort((a,b)=>a-b));
            }} className={`h-11 w-11 rounded-full text-sm font-black border transition-all active:scale-95 ${mainNumbers.includes(n) ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg scale-110' : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:border-zinc-500'}`}>{n}</button>
          ))}
        </div>
        
        <div className="flex justify-between items-center mb-4 px-1">
          <p className="text-sm font-black text-red-500 uppercase tracking-widest italic">Spirit Numbers</p>
          <span className="text-lg font-black text-red-500">{spiritNumbers.length} / 2</span>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-10">
          {Array.from({ length: 45 }, (_, i) => i + 1).map((n) => (
            <button key={`s-${n}`} onClick={() => {
                if (spiritNumbers.includes(n)) setSpiritNumbers(spiritNumbers.filter(x => x !== n));
                else if (spiritNumbers.length < 2) setSpiritNumbers([...spiritNumbers, n].sort((a,b)=>a-b));
            }} className={`h-11 w-11 rounded-full text-sm font-black border transition-all active:scale-95 ${spiritNumbers.includes(n) ? 'bg-red-600 text-white border-red-600 shadow-lg scale-110' : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:border-zinc-500'}`}>{n}</button>
          ))}
        </div>
      </section>

      <button onClick={() => setIsModalOpen(true)} disabled={mainNumbers.length !== 8 || spiritNumbers.length !== 2 || !user} className="w-full max-w-md py-7 rounded-[2rem] font-black text-2xl mb-14 bg-gradient-to-r from-yellow-600 to-yellow-400 text-black shadow-xl disabled:opacity-20 uppercase tracking-widest active:scale-95 transition-transform">
        PLAY <span className="text-lg ml-2">{ticketPrice.toFixed(5)} π</span>
      </button>

      {user && (
        <section className="w-full max-w-md mb-8 text-left px-1">
          <h2 className="text-xl font-black text-yellow-500 uppercase italic mb-6 border-b border-zinc-900 pb-2">My Active Tickets</h2>
          
          {activeTickets.length > 0 ? (
            <div className="flex flex-col gap-4">
              {activeTickets.map((t, i) => (
                <div key={`active-${i}`} className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 text-center shadow-xl">
                  <div className="flex justify-between items-center mb-3 px-1">
                    <p className="text-[10px] text-yellow-500 font-black uppercase animate-pulse tracking-[0.2em]">● Draw Countdown</p>
                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Round #{jackpotRound}</p>
                  </div>
                  <p className="text-4xl font-black text-white tracking-widest mb-6">{getTimeRemaining()}</p>
                  <div className="flex flex-wrap gap-1.5 justify-center pt-4 border-t border-zinc-800/50">
                    {t.selectedNumbers?.main?.map((n:number, idx:number) => <span key={`am-${idx}`} className="w-7 h-7 flex items-center justify-center rounded-full bg-zinc-800 text-[10px] font-black text-white">{n}</span>)}
                    <span className="text-zinc-700 mx-1">|</span>
                    {t.selectedNumbers?.spirit?.map((n:number, idx:number) => <span key={`as-${idx}`} className="w-7 h-7 flex items-center justify-center rounded-full bg-red-900/30 text-[10px] font-black text-red-500 border border-red-900/50">{n}</span>)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-700 font-bold text-center py-6 uppercase tracking-widest text-xs italic">No tickets in this draw</p>
          )}

          {historyTickets.length > 0 && (
            <div className="mt-10">
              <button onClick={() => setShowHistory(!showHistory)} className="w-full py-5 border border-zinc-800 rounded-2xl text-zinc-600 font-black text-[11px] uppercase tracking-[0.3em] hover:text-zinc-300 transition-colors">
                {showHistory ? '▲ Hide My Records' : '▼ View My Records (Status)'}
              </button>
              {showHistory && (
                <div className="mt-8 flex flex-col gap-6">
                  {historyTickets.map((t, i) => {
                    const isWinner = t.status === 'WON';
                    const isClaimed = t.status === 'CLAIMED';

                    return (
                        <div key={`hist-${i}`} className={`bg-zinc-900 border rounded-[2rem] p-6 transition-all flex flex-col gap-4 ${isWinner ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-zinc-800 opacity-70'}`}>
                            <div className="text-left flex justify-between items-center">
                                <span className="text-[11px] text-zinc-500 font-black tracking-widest">{new Date(t.createdAt).toLocaleDateString()}</span>
                                <span className="text-[9px] text-zinc-700 font-bold">R#{t.round || jackpotRound}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex flex-wrap gap-1.5 flex-1">
                                    {t.selectedNumbers?.main?.map((n:number, j:number) => (
                                        <span key={`hm-${j}`} className="w-7 h-7 flex items-center justify-center bg-black border border-zinc-800 rounded-full text-[10px] font-black text-zinc-300">{n}</span>
                                    ))}
                                </div>
                                <div className="flex-shrink-0 ml-3 text-right flex flex-col items-end justify-center min-h-[30px]">
                                    {isWinner ? (
                                        <button onClick={() => handleClaimPrize(t)} className="bg-yellow-500 text-black font-black text-[10px] px-3 py-2 rounded-xl uppercase active:scale-95 transition-transform animate-pulse shadow-md whitespace-nowrap">
                                            🎁 CLAIM
                                        </button>
                                    ) : isClaimed ? (
                                        <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest">CLAIMED</span>
                                    ) : (
                                        <span className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">FINISHED</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      <WinningReport />

      <div className="w-full max-w-md mt-16 mb-16">
        <button 
          onClick={handleCheckTickets} 
          disabled={isChecking || myTickets.length === 0} 
          className="w-full py-8 rounded-[2rem] font-black text-xl border-2 border-zinc-800 text-zinc-600 uppercase tracking-widest hover:border-yellow-500 hover:text-white transition-all active:scale-95"
        >
          {isChecking ? 'SCANNING...' : 'CHECK MY TICKETS'}
        </button>
      </div>

      <div className="w-full max-w-md flex justify-center pb-10">
         <Link href="/whitepaper" className="flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center shadow-lg"><span className="text-white font-black text-xl italic">W</span></div>
            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Whitepaper</span>
         </Link>
      </div>

      {/* 🚩 8개 국어 동적 바인딩 시스템으로 롤업된 글로벌 규제 면책 방어 팝업 모달 */}
      {isNoticeOpen && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-lg flex justify-center items-center z-[100] p-6 text-center">
          <div className="bg-zinc-900 border-2 border-yellow-500/30 p-10 rounded-[3rem] w-full max-w-md relative shadow-2xl">
            
            <h2 className="text-2xl font-black text-yellow-500 mb-1 uppercase italic tracking-tighter">{content.title}</h2>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] mb-6">{content.sub}</p>
            
            <div className="bg-black border border-zinc-800 rounded-2xl p-5 text-left space-y-4 mb-6 max-h-[280px] overflow-y-auto">
              <div>
                <p className="text-[10px] text-yellow-500 font-black uppercase tracking-wider mb-1">{content.projectTitle}</p>
                <p className="text-xs text-zinc-400 font-medium leading-relaxed">{content.projectDesc}</p>
              </div>

              <div>
                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-wider mb-1">{content.howTitle}</p>
                <div className="text-xs text-zinc-400 font-medium leading-relaxed space-y-1">{content.howDesc}</div>
              </div>
              
              <div>
                <p className="text-[10px] text-red-500 font-black uppercase tracking-wider mb-1">{content.ageTitle}</p>
                <p className="text-xs text-zinc-400 font-medium leading-relaxed">{content.ageDesc}</p>
              </div>

              <div>
                <p className="text-[10px] text-blue-500 font-black uppercase tracking-wider mb-1">{content.revTitle}</p>
                <p className="text-xs text-zinc-400 font-medium leading-relaxed">{content.revDesc}</p>
                <ul className="list-disc list-inside text-[11px] text-zinc-500 mt-1.5 space-y-1 ml-1 font-bold">
                  {content.revList.map((item, idx) => <li key={`rev-${idx}`}>{item}</li>)}
                </ul>
              </div>

              <div className="border-t border-zinc-800/80 pt-3 text-center">
                <p className="text-[10px] text-zinc-500 font-bold">{content.paperDesc}</p>
              </div>
            </div>

            {/* 🚩 [지시 사항 반영] 어그리 버튼 바로 위에 배치된 하이엔드 글로벌 멀티 랭귀지 셀렉터 */}
            <div className="mb-5 text-left">
              <label className="text-[9px] text-zinc-500 font-black uppercase tracking-wider block mb-1.5">■ SELECT LANGUAGE / 언어 선택</label>
              <select 
                value={currentLang} 
                onChange={(e) => setCurrentLang(e.target.value)}
                className="w-full bg-black border border-zinc-800 text-zinc-300 font-black text-xs rounded-xl px-4 py-3.5 focus:outline-none focus:border-yellow-500 transition-colors uppercase cursor-pointer"
              >
                <option value="en">English (Default)</option>
                <option value="ko">한국어 (Korean)</option>
                <option value="zh">简体中文 (Chinese)</option>
                <option value="ja">日本語 (Japanese)</option>
                <option value="tl">Tagalog (Filipino)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="ru">Русский (Russian)</option>
                <option value="fr">Français (French)</option>
              </select>
            </div>

            {/* 광고 시청 중 로킹 연동 스마트 액션 버튼 */}
            <button 
              onClick={handleCloseNotice} 
              disabled={isAdLoading}
              className={`w-full text-black font-black text-xl py-5 rounded-2xl uppercase shadow-lg active:scale-95 transition-transform tracking-widest flex justify-center items-center gap-3 ${
                isAdLoading ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-400'
              }`}
            >
              {isAdLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-zinc-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{content.btnWatching}</span>
                </>
              ) : (
                content.btnConfirm
              )}
            </button>
            
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex justify-center items-center z-50 p-6 text-center">
          <div className="bg-zinc-900 border-2 border-yellow-500/30 p-10 rounded-[3rem] w-full max-w-md relative shadow-2xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-zinc-500 text-2xl">✕</button>
            <h2 className="text-3xl font-black text-yellow-500 mb-10 uppercase italic tracking-tighter">Confirm Entry</h2>
            <div className="bg-black border border-zinc-800 rounded-3xl p-8 mb-10 text-center">
              <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-2">Total Price</p>
              <p className="text-4xl font-black text-white">{ticketPrice.toFixed(5)} <span className="text-lg text-zinc-500 ml-1">π</span></p>
            </div>
            <button 
              onClick={handlePaymentSubmit} 
              className="w-full bg-yellow-500 text-black font-black text-2xl py-6 rounded-2xl uppercase shadow-lg active:scale-95 transition-transform"
            >
              {isStoring ? 'STORING...' : 'PAY NOW'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}