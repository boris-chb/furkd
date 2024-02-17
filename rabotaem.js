// 01.12.2023

try {
  utils_.clearTimers();
} catch (e) {}

function getElement(query) {
  var myElement;
  function shadowSearch(rootElement, queryselector) {
    if (myElement) {
      return;
    }
    if (
      queryselector &&
      rootElement.querySelectorAll(queryselector) &&
      rootElement.querySelectorAll(queryselector)?.[0]
    ) {
      myElement = rootElement.querySelectorAll(queryselector);
      return;
    }
    if (rootElement.nextElementSibling) {
      shadowSearch(rootElement.nextElementSibling, queryselector);
    }
    if (rootElement.shadowRoot) {
      shadowSearch(rootElement.shadowRoot, queryselector);
    }
    if (rootElement.childElementCount > 0) {
      shadowSearch(rootElement.children[0], queryselector);
    }
  }
  shadowSearch(document.querySelector('yurt-root-app').shadowRoot, query);
  return myElement;
}

let rc = {
  addNote(noteStr) {
    let decisionCard = getElement('yurt-core-decision-policy-card')?.[0];
    decisionCard.annotation.notes = noteStr;
  },
  startReview() {
    getElement('#start-review-button')?.[0]?.click();
  },
  stopReview() {
    try {
      const endReviewBtn = getElement('tcs-button[id="stop-review-button"]')[0];
      endReviewBtn.click();
    } catch (e) {
      console.log('Could not end review', e);
    }
  },
  release() {
    try {
      const releaseBtn = getElement('.release')[0];

      releaseBtn.click();
    } catch (e) {
      console.log('Could not end review', e);
    }
  },
  getMetadata() {
    try {
      const videoRoot = getElement('yurt-video-root')[0];

      return videoRoot.allocatedMessage.reviewData.videoReviewData
        .videoReviewMetadata;
    } catch (e) {
      console.log('Could not get review metadata', e);
    }
  },
  setSeekTime() {
    dom_.playerControls.player.seekTo(
      Math.floor(dom_.playerControls.player.getDuration())
    );
    setTimeout(() => {
      dom_.playerControls.player.seekTo(0);
      dom_.playerControls.player.pauseVideo();
    }, 0);
  },
  getReview() {
    let decisionCard = getElement('yurt-core-decision-policy-card')?.[0];

    return decisionCard.annotation;
  },
  async getEntityHistory(videoId = utils_.get.queue.info().entityID) {
    let enitityHistoryEvents = await fetch(
      `https://yurt.corp.google.com/_/backends/review/v1/entityHistoryData:fetch?alt=json&key=${yt.config_.YURT_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entityId: { externalVideoId: videoId },
          filterEntries: [],
          includeFilterConfigurations: false,
          structuredJustificationId: {
            packetId: '1202917203726073111',
          },
        }),
      }
    )
      .then((response) => response.json())
      .then((data) => data.events);

    formattedEvents = enitityHistoryEvents.map((event) => ({
      time: event.eventTime.value,
      type: event.eventType,
      details: event.eventDetails,
    }));

    return formattedEvents;
  },
};

let observers = {
  mutationObserver: new MutationObserver((mutationsList, observer) => {
    // Iterate through the mutations
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        utils_.appendNode(ui_.components.actionPanel);
        break;
      }
    }
  }),
  transcriptObserver: new MutationObserver((mutationsList, _) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        console.log('TRANSCRIPT CHANGED');
        return;
      }
    }
  }),
  handleTranscriptMutation(mutationsList, observer) {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        console.log('Transcript changed, filtering...');
        utils_.filterTranscriptByCategory();
        return;
      }
    }
  },
  observerOptions: { childList: true },
};

let config_ = {
  SU: true,
  USE_KEYPRESS: false,
  COMMENTS_TIMER_MIN: 1,
  CLICK_BUTTON_RETRY_COUNT: 100,
  CLICK_BUTTON_INTERVAL_MS: 1,
  FUNCTION_CALL_RETRY_MS: 100,
  NOTIFICATION_TIMEOUT_SEC: 10,
  showLogs: true,
};

let store_ = {
  selectedVEGroup: {
    id: 'wagner_pmc',
    label: 'Wagner PMC - VNSA',
    value: {},
  },
  opacity: '0.8',
  textAreaRows: 10,
  veGroups: {
    alq: 'al_qaida_aq_including',
    hezbollah: 'hizballah_political_and_militant_organizations',
    isis: 'islamic_state_of_iraq',
    vnsa: 'violent_nonstate_actor',
    ira: 'irish_republican_army',
    lte: 'liberation_tigers_of_tamil',
    hamas: 'harakat_al_muqawamah_al_islamiyyah',
    taliban: 'tehrike_taliban_pakistan_ttp',
    pkk: 'partiya_karkeren_kurdistani_pkk',
    bla: 'baluchistan_liberation_army_bla',
    osama: 'osama_bin_laden',
    wagner: 'wagner_pmc',
    unknown: 'unknown',
    ik: 'imarat_kavkaz_ik_aka',
  },
  newVeGroups: {
    alq: {
      id: 'al_qaida_aq_including',
      label:
        "Al Qa'ida (AQ) (Jabhat al-Nusrah; al-Nusrah Front; Hay'at Tahrir al-Sham) - AQ",
      value: {},
    },
    hezbollah: {
      id: 'hizballah_political_and_militant_organizations',
      label:
        'Hizballah (Party of God) Political and Militant Organizations (aka Hezbollah) - OUSUK',
      value: {},
    },
    isis: {
      id: 'islamic_state_of_iraq',
      label: 'Islamic State of Iraq & the Levant (ISIL/ISIS/DAISh) - IS',
      value: {},
    },
    vnsa: {
      id: 'violent_nonstate_actor',
      label: 'Violent Non-State Actor (VNSA) - VNSA',
      value: {},
    },
    ira: {
      id: 'continuity_irish_republican_army',
      label: 'Continuity Irish Republican Army (CIRA) - OUSUK',
      value: {},
    },
    lte: {
      id: 'liberation_tigers_of_tamil',
      label: 'Liberation Tigers of Tamil Eelam (LTE) - OUSUK',
      value: {},
    },
    hamas: {
      id: 'harakat_al_muqawamah_al_islamiyyah',
      label:
        'Harakat al-Muqawamah al-Islamiyyah (Hamas; Izz al-Din al-Qassem Brigades) - OUSUK',
      value: {},
    },
    ttp: {
      id: 'tehrike_taliban_pakistan_ttp',
      label: 'Tehrik-e Taliban Pakistan (TTP) - OUSUK',
      value: {},
    },
    pkk: {
      id: 'partiya_karkeren_kurdistani_pkk',
      label:
        'Partiya Karkeren Kurdistani (PKK) (aka Kurdistan Workers Party, Kingra Gel-KGK) (general org) - OUSUK',
      value: {},
    },
    bla: {
      id: 'baluchistan_liberation_army_bla',
      label: 'Baluchistan Liberation Army (BLA) - OUSUK',
      value: {},
    },
    wagner: {
      id: 'wagner_pmc',
      label: 'Wagner PMC - VNSA',
    },
    unknown: {
      id: 'unknown',
      label: 'Unknown',
    },
    ik: {
      id: 'imarat_kavkaz_ik_aka',
      label: 'Imarat Kavkaz (IK) (aka Caucasus Emirate) - OUSUK',
    },
    hizbut: {
      id: 'hizb',
      label: 'Hizb-ut Tahrir - OUSUK',
      value: {},
    },
    osama: 'osama_bin_laden',
  },
  wordsByCategory: {
    ve: [
      '25.000',
      'спецопераци',
      'чувака',
      'чувакова',
      'вагнер',
      'оркестр',
      'музыкант',
      'своб',
      'свинорез',
      'чвк',
      'пригожин',
      'арбалет',
      'prigozhin',
      'wagner',
      'pmc',
      'валькир',
      // nasheed lyrics:
      'اموت لاحيا مع الخالدين مع',
      'نكون مجاهدينا وعقدنا العزم انا فجرنا',
    ],
    hate: [
      ' сво ',
      'демилитаризация',
      'москал',
      'кацап',
      'укроп',
      'русня',
      'пидор',
      'пидар',
      'пидр',
      'хохлы',
      'хохол',
      'хохло',
      'петух',
      'петуш',
      'нигер',
      'пиндос',
      'пендос',
    ],
    adult: [
      'ахуеть',
      'сука',
      'хуй',
      'хуё',
      'уёбище',
      'хуя',
      'охуел',
      'охуительно',
      'дрочить',
      'залупа',
      ' конча ',
      'гондон',
      'гандон',
      'ебало',
      'блять',
      'трахать',
      'ебать',
      'ёбанн',
      'пизд',
      'ебанн',
      'заеб',
      'oтъеб',
      'херня',
      'нахер',
      'ебанутые',
      'шлюх',
      'ебут ',
      'долбоеб',
      'долбаеб',
      'долбоёб',
      'долбаёб',
      'ебанат',
      'уёбок',
      'ебанашка',
      'ёбтвоюмать',
      'ёбарь',
      'хуесос',
      'пиздюк',
      'уебан',
      'блядь',
    ],
  },
  is: {
    get autosubmit() {
      return getElement('.autosubmit-switch')?.[0].checked;
    },
    get endreview() {
      return getElement('.endreview-checkbox')?.[0].checked;
    },
    readyForSubmit() {
      return getElement('yurt-core-decision-submit-panel')?.[0]?.readyForSubmit;
    },
    queue(qName) {
      return utils_.get.queue.name()?.includes(qName.toLowerCase());
    },
    get routing() {
      // return dom_.videoDecisionPanel.viewMode === 1; DEPRECATED
      let decisionViewRoute;
      try {
        decisionViewRoute = getElement('yurt-core-decision-view-route')[0];
      } catch (e) {
        console.log(e);
      }
      return !!decisionViewRoute;
    },
  },
  ignoreQuestionnairePolicies: ['3099'],
  frequentlyUsedPolicies: [
    {
      id: '9008',
      description: 'Approve',
      tags: ['approve'],
      policyVertical: 'APPROVE',
      actionCategorySummary: 'ACTION_APPROVE',
    },
    {
      id: '3065',
      description:
        'Content produced by or glorifying known Violent Extremist Organizations',
      tags: ['ISIS', 'Al-Qaeda', 'gaming', 'song', 'VE group', 'violence'],
      policyVertical: 'VIOLENT_EXTREMISM',
      actionCategorySummary: 'ACTION_REMOVE',
    },
    {
      id: '3039',
      description:
        'Known Violent Extremist Organization depicting or promoting violence',
      tags: [
        'FTO',
        'Al-Qaeda',
        'Gang',
        'hostage',
        'promoting',
        'violence',
        'recruitment',
        'soliciting funding',
      ],
      policyVertical: 'VIOLENT_EXTREMISM',
      actionCategorySummary: 'ACTION_REMOVE',
    },
    {
      id: '3044',
      description: 'Account solely dedicated to FTO/extremism',
      tags: [
        'FTO',
        'ISIS',
        'Al-Qaeda',
        'recruiting, incitement, fund raising, hostage channel dedicated',
        'professional',
      ],
      policyVertical: 'VIOLENT_EXTREMISM',
      actionCategorySummary: 'ACTION_REMOVE',
    },
    {
      id: '3099',
      description:
        'Videos posted to share violent extremism behaviors including glorifying violence, aiding violent organizations, or depicting hostages with the intent to solicit, threaten, or intimidate.',
      tags: ['non-designated VE behaviors'],
      policyVertical: 'VIOLENT_EXTREMISM',
      actionCategorySummary: 'ACTION_REMOVE',
    },
    {
      id: '5013',
      description:
        'Low EDSA incitement to violence, FTO, ultra graphic violence',
      tags: [
        'Low EDSA',
        'four corners',
        'FTO',
        'incitement to violence, ultra graphic violence',
      ],
      policyVertical: 'VIOLENT_EXTREMISM',
      actionCategorySummary: 'ACTION_RESTRICT',
    },
    {
      id: '3999',
      description: 'For VE Escalations Only: SDN individual',
      tags: ['Speaker violation', 'SDN list'],
      policyVertical: 'VIOLENT_EXTREMISM',
      actionCategorySummary: 'ACTION_REMOVE',
    },
    {
      id: '3888',
      description:
        'Dedicated/Owned & Operated Account by Government Designated Person, Government Proscribed Individuals',
      tags: [
        'individual violation',
        'dedicated/owned & operated account',
        'government designated person',
        'gdp',
      ],
      policyVertical: 'VIOLENT_EXTREMISM',
      actionCategorySummary: 'ACTION_REMOVE',
    },
    {
      id: '6120',
      description:
        'Perpetrator-filmed footage where weapons, injured bodies, or violence is in frame or heard in audio uploaded on or after 6/15/2020',
      tags: ['perpetrator-filmed', 'violent extremism', 'weapon'],
      policyVertical: 'VIOLENT_EXTREMISM',
      actionCategorySummary: 'ACTION_REMOVE',
    },
    {
      id: '3048',
      description: 'Footage produced by VE actor, low-EDSA',
      tags: ['Violent extremism reject'],
      policyVertical: 'VIOLENT_EXTREMISM',
      actionCategorySummary: 'ACTION_REMOVE',
    },
  ],
};

let recommendationNotes = {
  approve: [
    {
      title: 'News',
      value: () => 'No violations\n4C EDSA News report\nApprove\nRussian',
    },
    {
      title: 'Comedic intent',
      value: () => 'Comedic intent\nNo violations\nApprove\nRussian',
    },
    {
      title: 'Gaming',
      value: () => 'Gaming content\nNo violations\nApprove\nRussian',
    },
  ],
  route: {
    arabic: [
      {
        title: 'Nasheed',
        value: () =>
          `9008 for Russian VE, no glorification, no EDSA\nTimestamp: #fullvideo\n\nPlease review for Arabic nasheed at ${utils_.get.noteTimestamp}`,
      },
      {
        title: 'Religious',
        value: () =>
          `9008 for Russian VE, no glorification, no EDSA\nTimestamp: #fullvideo\n\nPlease review for religious content at ${utils_.get.noteTimestamp}`,
      },
      {
        title: 'Arabic Part',
        value: () =>
          `9008 for Russian VE, no glorification, no EDSA\nTimestamp: #fullvideo\n\nPlease review Arabic part at ${utils_.get.noteTimestamp}`,
      },
      {
        title: 'Language support (ru)',
        value: () =>
          `9008 for Russian VE, no glorification, no EDSA\nTimestamp: #fullvideo\n\nPlease review language part at ${utils_.get.noteTimestamp}`,
      },
      {
        title: 'Language support (agn)',
        value: () =>
          `Agnostic review\nTimestamp: #fullvideo\n\nPlease review language part at ${utils_.get.noteTimestamp}`,
      },
    ],
    drugs: [
      {
        title: 'Drugs policy',
        value: () =>
          `9008 for VE\nTimestamp: #fullvideo\n\nPlease review for drug policy violation at ${utils_.get.noteTimestamp}`,
      },
      {
        title: 'Illegal Sales',
        value: () =>
          `9008 for VE\nTimestamp: #fullvideo\n\nPlease review for illegal sales at ${utils_.get.noteTimestamp}`,
      },
      {
        title: 'Gambling',
        value: () =>
          `9008 for VE\nTimestamp: #fullvideo\n\nPlease review for gambling violation at ${utils_.get.noteTimestamp}`,
      },
    ],
    gv: [
      {
        title: 'MOD',
        value: () =>
          `9008 for VE\nTimestamp: #fullvideo\n\nPlease review for MOD at ${utils_.get.noteTimestamp}`,
      },
      {
        title: 'GV',
        value: () =>
          `9008 for VE\nTimestamp: #fullvideo\n\nPlease review for graphic violence at ${utils_.get.noteTimestamp}`,
      },
      {
        title: 'POW',
        value: () =>
          `9008 for VE\nTimestamp: #fullvideo\n\nPlease review for prisoners of war at ${utils_.get.noteTimestamp}`,
      },
    ],
    adult: [
      {
        title: 'Vulgar language',
        value: () =>
          `9008 for VE\nTimestamp: #fullvideo\n\nPlease review for excessive vulgar language at ${utils_.get.noteTimestamp}`,
      },
      {
        title: 'Nudity',
        value: () =>
          `9008 for VE\nTimestamp: #fullvideo\n\nPlease review for nudity at ${utils_.get.noteTimestamp}`,
      },
      {
        title: 'Sexual act',
        value: () =>
          `9008 for VE\nTimestamp: #fullvideo\n\nPlease review for implied sexual act at ${utils_.get.noteTimestamp}`,
      },
      {
        title: 'Adult',
        value: () =>
          `9008 for VE\nTimestamp: #fullvideo\n\nPlease review for adult violation at ${utils_.get.noteTimestamp}`,
      },
    ],
    spam: [
      {
        title: 'Spam',
        value: () =>
          `9008 for VE\nTimestamp: #fullvideo\n\nPlease review for intent to drive traffic off-site at ${utils_.get.noteTimestamp}`,
      },
      {
        title: 'Spam (link in comments)',
        value: () =>
          `9008 for VE\nTimestamp: #fullvideo\n\nPlease review for intent to drive traffic off-site (link in comments)`,
      },
      {
        title: 'Spam (link in channel)',
        value: () =>
          `9008 for VE\nTimestamp: #fullvideo\n\nPlease review for intent to drive traffic off-site (link in channel description) #metadata`,
      },
    ],
    hd: [
      {
        title: 'Dangerous Pranks',
        value: () =>
          `9008 for VE\nTimestamp: #fullvideo\n\nPlease review for dangerous pranks at ${utils_.get.noteTimestamp}`,
      },
      {
        title: 'Gambling',
        value: () =>
          `9008 for VE\nTimestamp: #fullvideo\n\nPlease review for gambling at ${utils_.get.noteTimestamp}`,
      },
      {
        title: 'H&D violation',
        value: () =>
          `9008 for VE\nTimestamp: #fullvideo\n\nPlease review for H&D acts at ${utils_.get.noteTimestamp}`,
      },
    ],
    haras: [
      {
        title: 'Doxxing',
        value: () =>
          `9008 for VE\nTimestamp: #fullvideo\n\nPlease review for doxxing at ${utils_.get.noteTimestamp}`,
      },
    ],
    ds: [
      {
        title: 'Terms of Service',
        value: () =>
          `9008 for VE\nTimestamp: #fullvideo\n\nPlease review for TOS violations at ${utils_.get.noteTimestamp}`,
      },
    ],
    cs: [
      {
        title: 'Minors Sex',
        value: () =>
          `9008 for VE\nTimestamp: #fullvideo\n\nPlease review for minors sexualization at ${utils_.get.noteTimestamp}`,
      },
    ],
    hate: [
      {
        title: 'Slur',
        value: () =>
          `9008 for VE\nTimestamp: #fullvideo\n\nPlease review for violative slur at ${utils_.get.noteTimestamp}`,
      },
      {
        title: '{ Slur }',
        value: () =>
          `9008 for VE\nTimestamp: #fullvideo\n\nPlease review for violative slur ${(() => {
            const highlightedWord = getElement('.current-transcript')?.[0]
              .textContent;

            return highlightedWord ? highlightedWord : '';
          })()} at ${utils_.get.noteTimestamp}`,
      },
      {
        title: 'Hate',
        value: () =>
          `9008 for VE\nTimestamp: #fullvideo\n\nPlease review for hate policy violations\n\nTimestamp: ${utils_.get.noteTimestamp}`,
      },
      {
        title: '🇺🇦 🐖 Dehuman',
        value: () =>
          `9008 for VE\nTimestamp: #fullvideo\n\nPlease review for Ukrainian pig dehumanization\n\nTimestamp: ${utils_.get.noteTimestamp}`,
      },
      {
        title: '🇺🇦 Denazi',
        value: () =>
          `9008 for VE\nTimestamp: #fullvideo\n\nPlease review for Denazification of Ukraine\n\nTimestamp: ${utils_.get.noteTimestamp}`,
      },
      {
        title: 'Podolyak',
        value: () =>
          `9008 for VE\nTimestamp: #fullvideo\n\nPlease review for Yury Podolyak circumvention\n\nTimestamp: ${utils_.get.noteTimestamp}`,
      },
    ],
    t2: [
      {
        title: 'Protections',
        value: () =>
          `\nRouting to FTE due to Protections\n${'- '.repeat(
            15
          )}\n${utils_.get.safetyNetProtections()}`,
      },
      {
        title: 'X-Entity',
        value: () =>
          `X-Entity channel violations (channel picture + title)\nRouting to FTE for final call `,
      },
    ],
  },
  strike: {
    3065: [
      {
        title: '[3065] Depictive >50%',
        value: () =>
          `Violation: ${
            utils_.get.selectedVEGroup.text
          } depictive content >50% of video without 4C EDSA or criticism at ${
            utils_.get.noteTimestamp
          }\n${!store_.is.queue('bluechip') ? 'Russian (not agnostic)' : ''}`,
      },
      {
        title: '[3065] Upbeat Music',
        value: () =>
          `Violation: ${
            utils_.get.selectedVEGroup.text
          } depictive content with upbeat music without 4C EDSA or criticism at ${
            utils_.get.noteTimestamp
          }\n${!store_.is.queue('bluechip') ? 'Russian (not agnostic)' : ''}`,
      },
      {
        title: '[3065] >2x',
        value: () =>
          `Violation: ${
            utils_.get.selectedVEGroup.text
          } produced content used 2x or more, without 4C EDSA or criticism at ${
            utils_.get.noteTimestamp
          }\n${!store_.is.queue('bluechip') ? 'Russian (not agnostic)' : ''}`,
      },
      {
        title: '[3065] Glorifying Lyrics',
        value: () =>
          `Violation: ${
            utils_.get.selectedVEGroup.text
          } glorifying lyrics without 4C EDSA or criticism at ${
            utils_.get.noteTimestamp
          }\n${!store_.is.queue('bluechip') ? 'Russian (not agnostic)' : ''}`,
      },
      {
        title: '[3065] Produced Song',
        value: () =>
          `Violation: ${
            utils_.get.selectedVEGroup.text
          } produced song without 4C EDSA or criticism at ${
            utils_.get.noteTimestamp
          }\n${!store_.is.queue('bluechip') ? 'Russian (not agnostic)' : ''}`,
      },
    ],
    3039: [
      {
        title: '[3039] Raw reupload',
        value: () =>
          `Violation: ${
            utils_.get.selectedVEGroup.text
          } raw re-upload without criticism or 4C EDSA at ${
            utils_.get.noteTimestamp
          }\n${!store_.is.queue('bluechip') ? 'Russian (not agnostic)' : ''}`,
      },
      {
        title: '[3039] Glorification',
        value: () =>
          `Violation: Glorification of ${
            utils_.get.selectedVEGroup.text
          } without criticism or 4C EDSA at ${utils_.get.noteTimestamp}\n${
            !store_.is.queue('bluechip') ? 'Russian (not agnostic)' : ''
          }`,
      },
      {
        title: '[3039] Glorifying Lyrics',
        value: () =>
          `Violation: ${
            utils_.get.selectedVEGroup.text
          } glorifying lyrics without criticism or 4C EDSA at ${
            utils_.get.noteTimestamp
          }\n${!store_.is.queue('bluechip') ? 'Russian (not agnostic)' : ''}`,
      },

      {
        title: '[3039] Produced Song',
        value: () =>
          `Violation: ${
            utils_.get.selectedVEGroup.text
          } raw reupload of produced song without criticism or 4C EDSA at ${
            utils_.get.noteTimestamp
          }\n${!store_.is.queue('bluechip') ? 'Russian (not agnostic)' : ''}`,
      },
      {
        title: '[3039] Memorial',
        value: () =>
          `Violation: ${utils_.get.selectedVEGroup.text} memorial video at ${
            utils_.get.noteTimestamp
          }\n${!store_.is.queue('bluechip') ? 'Russian (not agnostic)' : ''}`,
      },
    ],
    3044: [
      {
        title: '[3044] Raw reupload',
        value: () =>
          `Violation: ${
            utils_.get.selectedVEGroup.text
          } raw re-upload without criticism or 4C EDSA ${
            utils_.get.noteTimestamp
          }\n\nViolative video: ___________\n\nViolation: ${
            utils_.get.selectedVEGroup.text
          } __________ @0:00:00\n\nViolative video: ___________\n\nViolation: ${
            utils_.get.selectedVEGroup.text
          } __________ @0:00:00\n${
            !store_.is.queue('bluechip') ? 'Russian (not agnostic)' : ''
          }`,
      },
      {
        title: '[3044] Glorification',
        value: () =>
          `Violation: ${
            utils_.get.selectedVEGroup.text
          } glorification without criticism or 4C EDSA ${
            utils_.get.noteTimestamp
          }\n\nViolative video: ___________\n\nViolation: ${
            utils_.get.selectedVEGroup.text
          } __________ @0:00:00\n\nViolative video: ___________\n\nViolation: ${
            utils_.get.selectedVEGroup.text
          } __________ @0:00:00\n${
            !store_.is.queue('bluechip') ? 'Russian (not agnostic)' : ''
          }`,
      },
      {
        title: '[3044] Glorifying Lyrics',
        value: () =>
          `Violation: ${
            utils_.get.selectedVEGroup.text
          } song with glorifying lyrics ${
            utils_.get.noteTimestamp
          }\n\nViolative video: ___________\n\nViolation: ${
            utils_.get.selectedVEGroup.text
          } __________ @0:00:00\n\nViolative video: ___________\n\nViolation: ${
            utils_.get.selectedVEGroup.text
          } __________ @0:00:00\n${
            !store_.is.queue('bluechip') ? 'Russian (not agnostic)' : ''
          }`,
      },
      {
        title: '[3044][1] Raw reupload',
        value: () =>
          `Violation: ${
            utils_.get.selectedVEGroup.text
          } raw re-upload without criticism or 4C EDSA ${
            utils_.get.noteTimestamp
          }\n${!store_.is.queue('bluechip') ? 'Russian (not agnostic)' : ''}`,
      },
      {
        title: '[3044][1] Glorification',
        value: () =>
          `Violation: ${
            utils_.get.selectedVEGroup.text
          } glorification without criticism or 4C EDSA ${
            utils_.get.noteTimestamp
          }\n${!store_.is.queue('bluechip') ? 'Russian (not agnostic)' : ''}`,
      },
      {
        title: '[3044][1] Glorifying Lyrics',
        value: () =>
          `Violation: ${
            utils_.get.selectedVEGroup.text
          } song with glorifying lyrics ${utils_.get.noteTimestamp}\n${
            !store_.is.queue('bluechip') ? 'Russian (not agnostic)' : ''
          }`,
      },
    ],
    3048: [
      {
        title: '[3048] Hamas hostages',
        value: () =>
          `Violation: Hamas hostages without criticism in 4C at ${
            utils_.get.noteTimestamp
          }\n${!store_.is.queue('bluechip') ? 'Russian (not agnostic)' : ''}`,
      },
    ],
    3999: [
      {
        title: '[3999] Prigozhin',
        value: () =>
          `Violation: Yevgeny Prigozhin (GDP) expressing views, without 4C EDSA or criticism ${
            utils_.get.noteTimestamp
          }\n${!store_.is.queue('bluechip') ? 'Russian (not agnostic)' : ''}`,
      },
    ],
    3099: [
      {
        title: '[3099] School shooting + music',
        value: () =>
          `Violation: School shooting attack in 4C paired with upbeat music ${
            utils_.get.noteTimestamp
          }\n${!store_.is.queue('bluechip') ? 'Russian (not agnostic)' : ''}`,
      },
      {
        title: '[3099] Physical abuse',
        value: () =>
          `Violation: Hostages are being beaten, slapped, shot, sprayed with liquids, left unattended despite visible wounds, burned, submerged in water, or any other form of violent physical contact, without 4C EDSA ${
            utils_.get.noteTimestamp
          }\n${!store_.is.queue('bluechip') ? 'Russian (not agnostic)' : ''}`,
      },
      {
        title: '[3099] Verbal abuse',
        value: () =>
          `Hostages are being threatened, mocked, called names or insults, taunted, etc., without 4C EDSA ${
            utils_.get.noteTimestamp
          }\n${!store_.is.queue('bluechip') ? 'Russian (not agnostic)' : ''}`,
      },
      {
        title: '[3099] Humiliation',
        value: () =>
          `Violation: Hostages are stripped of their clothes, shown naked, paraded in front of crowds, forced to beg, etc., without 4C EDSA  ${
            utils_.get.noteTimestamp
          }\n${!store_.is.queue('bluechip') ? 'Russian (not agnostic)' : ''}`,
      },
      {
        title: '[3099] Restrained',
        value: () =>
          `Violation: Hostages are shown tied up, handcuffed, jailed, blindfolded, gagged, or otherwise confined, without 4C EDSA ${
            utils_.get.noteTimestamp
          }\n${!store_.is.queue('bluechip') ? 'Russian (not agnostic)' : ''}`,
      },
      {
        title: '[3099] Likely prepared or forced statements in captivity',
        value: () =>
          `Violation: Hostages are shown reading scripted or prepared remarks while captive. If the individual is described in the 4-corners or metadata as a hostage, treat statements as though they are prepared or forced. E.g., confessions, appeals to military or civilian leadership, soliciting demands etc., without 4C EDSA  ${
            utils_.get.noteTimestamp
          }\n${!store_.is.queue('bluechip') ? 'Russian (not agnostic)' : ''}`,
      },
      {
        title: '[3099] Drive traffic',
        value: () =>
          `Violation: Statements, legible or audible links in the 4-corners or metadata, directing viewers to footage that could contain hostage-taking content. Link validation is not necessary. Links are assessed based on surrounding context, without 4C EDSA #fullvideo ${
            utils_.get.noteTimestamp
          }\n${!store_.is.queue('bluechip') ? 'Russian (not agnostic)' : ''}`,
      },
    ],
    3888: [
      {
        title: '[3888] Prigozhin',
        value: () =>
          `Yevgeny Prigozhin produced content without 4C EDSA or criticism ${
            utils_.get.noteTimestamp
          }\n${!store_.is.queue('bluechip') ? 'Russian (not agnostic)' : ''}`,
      },
    ],
    5013: [
      {
        title: '[5013] Raw reupload',
        value: () =>
          `${
            utils_.get.selectedVEGroup.text
          } raw re-upload without criticism or 4C EDSA ${
            utils_.get.noteTimestamp
          }\n5013 PIA\n${
            !store_.is.queue('bluechip') ? 'Russian (not agnostic)' : ''
          }`,
      },
    ],
    6120: [
      {
        title: '[6120] PFF + weapon',
        value: () =>
          `Perpetrator-filmed footage where weapons, injured bodies, or violence is in frame or heard in audio ${
            utils_.get.noteTimestamp
          }\n${!store_.is.queue('bluechip') ? 'Russian (not agnostic)' : ''}`,
      },
    ],
  },
};

let utils_ = {
  click: {
    element(queryStr, args, retries = config_.CLICK_BUTTON_RETRY_COUNT) {
      let btn;
      if (queryStr === 'mwc-list-item') {
        // for list-item, convert nodelist to array, then filter based on value
        let btnNodeList = getElement(queryStr);
        let filterKey = Object.keys(args)?.[0];
        let filterValue = Object.values(args)?.[0];

        let foundBtn = btnNodeList
          ? Array.from(btnNodeList).find(
              (listItem) => listItem[filterKey] === filterValue
            )
          : undefined;

        console.log(`[🔍] list-item[${filterKey}=${filterValue}]`);

        btn = foundBtn;
      } else {
        queryStr = args
          ? `${queryStr}[${Object.keys(args)}=${Object.values(args)}]`
          : queryStr;

        btn = getElement(queryStr)?.[0];
      }

      if (btn?.active || btn?.checked) return;

      // Try again until the btn renders
      let btnMissingOrDisabled = !btn || btn?.disabled;

      if (btnMissingOrDisabled && retries) {
        // btn not found, try again
        retries--;
        retries % 10 === 0 &&
          console.log(Math.floor(retries / 10), `[♻] Looking for ${queryStr}`);
        setTimeout(
          () => utils_.click.element(queryStr, null, retries),
          config_.CLICK_BUTTON_INTERVAL_MS
        );
        return;
      }

      if (retries === 0) return;

      try {
        btn.click();
      } catch (e) {
        console.log('COULD NOT CLICK', queryStr);
        console.log(e.stack);
      }
    },
    listItem(listArgs) {
      // Values: 'video' || 'audio' || 'metadata'
      // STEP: Label the location of abuse (modality)
      utils_.click.element('mwc-list-item', listArgs);
    },
    listItemByInnerText(...args) {
      let listItems = [...getElement('mwc-list-item')];

      let item = listItems.find((el) =>
        args.every((innerText) =>
          el.innerText.toLowerCase()?.includes(innerText.toLowerCase())
        )
      );

      try {
        item.click();
      } catch (e) {
        console.log(e.stack);
      }
    },
    checkbox(listArgs) {
      utils_.click.element('mwc-checkbox', listArgs);
    },
    checklist(listArgs) {
      utils_.click.element('mwc-check-list-item', listArgs);
    },
    radio(listArgs) {
      utils_.click.element('mwc-radio', listArgs);
    },
    myReviews() {
      let annotationTabs = getElement(
        'yurt-core-decision-annotation-tabs'
      )?.[0];

      annotationTabs.selectedTab = 0;
    },
  },
  get: {
    get selectedPolicyId() {
      let policyItem = getElement('yurt-core-policy-selector-item')?.[0];
      if (!policyItem) return;
      return policyItem.policy.id;
    },
    get timeElapsed() {
      var timeDiff = Math.round(
        (new Date() - new Date(dom_.reviewRoot?.allocateStartTime)) / 1000
      );

      if (timeDiff === 300) utils_.sendNotification('⏳ 5 min');
      if (timeDiff === 600) utils_.sendNotification('⏳ 10 min');

      return timeDiff >= 19800 ? 0 : timeDiff;
    },
    commentText() {
      let reviewData =
        getElement('yurt-review-root')?.[0].hostAllocatedMessage.reviewData;
      return reviewData.commentReviewData.commentThread.requestedComment
        .commentText;
    },
    get noteTimestamp() {
      if (dom_.playerControls.player.getCurrentTime() === 0) {
        return '#fullvideo';
      }
      return `@${this.currentTimeStr}`;
    },
    get DEPRECATED_noteTimestamp() {
      let t;
      if (dom_.playerControls.player.getCurrentTime() === 0) {
        t = '#fullvideo';
        return t;
      }

      t = store_.is.routing ? `@${this.currentTimeStr}` : '';

      return t;
    },
    safetyNetProtections() {
      let safetyNetDialog = getElement('yurt-core-safety-nets-dialog')?.[0];

      try {
        return safetyNetDialog?.safetyNetProtections
          ?.map((item) => `${item?.id} - ${item?.reason}`)
          .join('\n');
      } catch (e) {
        console.log(arguments.callee.name, e.stack);
      }
    },
    get currentTimeStr() {
      return utils_.formatTime(dom_.playerControls.player.getCurrentTime());
    },
    videoLength(seconds) {
      let vl = getElement('#movie_player');
      if (!vl || !vl[0].innerText) return;
      vl = vl[0].innerText.split(' / ')[1];
      if (vl.split(':').length <= 2) {
        var mins =
          vl.split(':')?.[0] < 10
            ? '0' + vl.split(':')?.[0]
            : vl.split(':')?.[0];
        vl = '0:' + mins + ':' + vl.split(':')[1];
      }
      if (!seconds) {
        return vl;
      }
      let h, m, s, result;
      let videoLengthArr = vl.split(':');
      if (videoLengthArr.length > 2) {
        [h, m, s] = videoLengthArr;
        result =
          parseInt(h, 10) * 3600 + parseInt(m, 10) * 60 + parseInt(s, 10);
      } else {
        [m, s] = videoLengthArr;
        result = parseInt(m, 10) * 60 + parseInt(s, 10);
      }
      return result;
    },
    get videoId() {
      return utils_.get.queue.info().entityID;
    },
    get videoTimestamp() {
      let videoRoot = getElement('yurt-video-root')?.[0];

      return utils_.formatTime(videoRoot.playerApi.getCurrentTime());
    },
    get selectedVEGroup() {
      const text = getElement('mwc-select[value=strike_ve_group_dropdown]')?.[0]
        .selectedText;

      const label = getElement(
        'mwc-select[value=strike_ve_group_dropdown]'
      )?.[0].value;

      return { text, label };
    },
    queue: {
      info() {
        var reviewRoot = getElement('yurt-review-root')?.[0];

        if (!reviewRoot?.hostAllocatedMessage) return;

        // for (const property in Object.keys(reviewRoot.hostAllocatedMessage)) {
        //   if (
        //     Object.keys(reviewRoot.hostAllocatedMessage)[property] ===
        //     'queueName'
        //   ) {
        //     queueName = reviewRoot.hostAllocatedMessage.queueName;
        //     queueTier = reviewRoot.hostAllocatedMessage.queueTier;
        //     break;
        //   } else if (
        //     reviewRoot.hostAllocatedMessage[
        //       Object.keys(reviewRoot.hostAllocatedMessage)[property]
        //     ].hasOwnProperty('queue')
        //   ) {
        //     var queueData =
        //       reviewRoot.hostAllocatedMessage[
        //         Object.keys(reviewRoot.hostAllocatedMessage)[property]
        //       ].queue;
        //     queueName = queueData.name;
        //     queueTier = queueData.tier;
        //     break;
        //   }
        // }

        entityID =
          reviewRoot.hostAllocatedMessage.yurtEntityId[
            Object.keys(reviewRoot.hostAllocatedMessage.yurtEntityId)?.[0]
          ];

        function findMostNested(obj) {
          let result = null;

          for (const key in obj) {
            if (obj.hasOwnProperty(key) && typeof obj[key] === 'object') {
              const nested = findMostNested(obj[key]);
              if (nested) {
                result = nested;
              }
            } else if (
              key === 'id' &&
              obj.id !== undefined &&
              obj.tier !== undefined &&
              obj.name !== undefined
            ) {
              result = { id: obj.id, tier: obj.tier, name: obj.name };
            }
          }

          return result;
        }

        const { name: queueName, tier: queueTier } = findMostNested(
          reviewRoot.hostAllocatedMessage
        );
        return { queueName, queueTier, entityID };
      },
      name() {
        // let queueInfo = $utils.get.queue.info();
        return this.info()?.queueName?.toLowerCase() ?? '';
      },
      type() {
        // let queueType = $utils.get.queue.type();
        return this.name()?.split('-')?.[1]?.trim() ?? '';
      },
      language() {
        return this.name()?.split('-')?.[3]?.trim() ?? '';
      },
    },
  },

  clickNext() {
    utils_.click.element('.next-button', { class: 'next-button' });
  },
  clickSubmit(delay) {
    if (delay) {
      clearTimeout(store_.submitId);
      store_.submitId = setTimeout(() => {
        try {
          dom_.submitBtn.click();
        } catch (e) {
          console.log(e.stack);
        }
      }, delay);

      return;
    }

    dom_.submitBtn?.click();
  },
  clickDone() {
    utils_.click.element('tcs-button', { name: 'label-submit' });
  },
  clickSave() {
    utils_.click.element('tcs-button', {
      'data-test-id': 'decision-annotation-save-button',
    });
  },
  formatTime(input) {
    let hoursString = 0;
    let minutesString = '00';
    let secondsString = Math.floor(input);

    if (secondsString > 59) {
      minutesString = secondsString / 60;
      minutesString = Math.floor(minutesString);
      secondsString = secondsString % 60;
    }

    if (minutesString > 59) {
      hoursString = minutesString / 60;
      hoursString = Math.floor(hoursString);
      minutesString = minutesString % 60;
    }

    if (
      (minutesString !== '00' && minutesString < 10) ||
      minutesString === '0'
    ) {
      minutesString = '0' + minutesString;
    }

    if (secondsString < 10) {
      secondsString = '0' + secondsString;
    }

    return `${hoursString}:${minutesString}:${secondsString}`;
  },

  // UI
  appendNode(node, parent) {
    parent = getElement(
      'yurt-core-decision-annotation-tabs > div:nth-child(1)'
    )?.[0];

    try {
      parent?.appendChild(node);
    } catch (e) {
      console.log(arguments.callee.name, e.stack);
    }
  },
  strToNode(str) {
    const tmp = document.createElement('div');
    tmp.innerHTML = str;
    if (tmp.childNodes.length < 2) {
      return tmp.childNodes[0];
    }
    return tmp.childNodes;
  },

  // Channel
  async getChannelVideos(
    channelId = dom_.reviewRoot.hostAllocatedMessage.reviewData.videoReviewData
      .videoReviewMetadata.externalChannelId ??
      dom_.videoRoot.channel.externalChannelId
  ) {
    try {
      const url = `https://yurt.corp.google.com/_/backends/account/v1/videos:fetch?alt=json&key=${yt.config_.YURT_API_KEY}`;

      let videosArr = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          externalChannelId: channelId,
          fetchLatestPolicy: true,
          maxNumVideosByRecency: 50,
          viewEnums: ['VIEW_INCLUDE_PINNED_COMMENT'],
        }),
      }).then((response) => response.json());

      return videosArr;
    } catch (e) {
      console.log('\n\n\t\tCould not fetch channel videos\n\n', e);
    }
  },
  async filterVideoByKeywords(keywordsArr = store_.wordsByCategory.ve) {
    const { videos } = await this.getChannelVideos();

    let byKeyword = videos.filter((video) =>
      keywordsArr.some((word) =>
        video.videoTitle.toLowerCase().includes(word.toLowerCase())
      )
    );

    let violativeVideoIds = byKeyword
      .map((vid) => vid.externalVideoId)
      .join(', ');

    return violativeVideoIds;
  },

  // SETTERS //
  setNote(noteStr) {
    let decisionCard = getElement('yurt-core-decision-policy-card')?.[0];
    try {
      decisionCard.annotation.notes = noteStr;
    } catch (e) {
      console.log(
        `[❌ ${arguments.callee.name}]`,
        e.stack,
        '\n[i] Could not add note'
      );
    }
  },
  setTimer(minutes, endReview = store_.is.endreview) {
    // clear the previous timer
    clearTimeout(store_.submitId);

    const { submitBtn, submitEndReviewBtn, routeBtn, routeEndReviewBtn } = dom_;
    const { is } = store_;

    let btn;

    // check whether is routing or actioning
    if (is.routing) {
      // routing video
      btn = endReview ? routeEndReviewBtn : routeBtn;
    } else {
      // action
      btn = endReview ? submitEndReviewBtn : submitBtn;
    }

    try {
      store_.submitId = setTimeout(() => btn.click(), minutes * 60 * 1000);
      utils_.removeLock();
      console.log(
        `⌚ [${store_.submitId}] Submit in ${minutes} minutes, at ${new Date(
          Date.now() + minutes * 60 * 1000
        )
          .toJSON()
          .split('T')[1]
          .slice(0, 8)}.${
          endReview ? '\n\n\t\t.. and ending the review ❗\n\n' : ''
        }`
      );
    } catch (e) {
      console.log('Could not set timer', e.stack);
    }
  },
  setFrequentlyUsedPolicies() {
    try {
      getElement('yurt-video-decision-panel-v2')[0].frequentlyUsedPolicies =
        store_.frequentlyUsedPolicies;
    } catch (e) {
      console.log(arguments.callee.name, e.stack);
    }
  },
  showNotes(policyId = utils_.get.selectedPolicyId) {
    // remove old notes
    const existingNotes = getElement('#recommendation-notes')?.[0];

    if (existingNotes) {
      existingNotes.parentNode.removeChild(existingNotes);
    }

    const isRouting = store_.is.routing;
    let notesArr = isRouting ? [] : recommendationNotes.strike[policyId];

    // render new ones
    ui_.components
      .recommendationPanel({
        notesArr,
      })
      .render();
  },
  sendNotification(text, close = true) {
    let n = new Notification(text);
    // this.clearLastNotification();
    n.onclick = () => {
      parent.focus();
      window.focus();
    };

    // clear notification after 10 seconds
    close &&
      setTimeout(() => n.close(), config_.NOTIFICATION_TIMEOUT_SEC * 1000);
  },
  removeLock() {
    let lock = getElement('yurt-review-activity-dialog')?.[0];
    if (lock) {
      lock.lockTimeoutSec = 3000;
      lock.secondsToExpiry = 3000;
      lock.onExpired = () => {};
    }

    console.log(`🔐LOCK: ${utils_.formatTime(lock?.secondsToExpiry)}`);
  },
  seekVideo(timestampStr) {
    let videoRoot = getElement('yurt-video-root')?.[0];
    let timeArr = timestampStr.split(':');
    let h, m, s, secondsTotal;
    if (timeArr.length === 3) {
      // has hours : minutes : seconds
      [h, m, s] = timeArr;
      secondsTotal = parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s);
    } else if (timeArr.length === 2) {
      // minutes : seconds
      [m, s] = timeArr;
      secondsTotal = parseInt(m) * 60 + parseInt(s);
    }

    console.log(secondsTotal);

    videoRoot.playerApi.seekTo(secondsTotal);
  },
};

let lib_ = {
  removeBeforeUnload() {
    try {
      let beforeunloads = getEventListeners(window).beforeunload.map(
        (f) => f.listener
      );

      beforeunloads.forEach((f) =>
        window.removeEventListener('beforeunload', f)
      );

      console.log('removed beforeunloads');
    } catch (e) {
      console.log('could not remove beforeunloads', e);
    }
  },
  changeFavIcon(icon) {
    let currentIcon = document.querySelector("link[rel~='icon']");
    currentIcon.href = icon ? icon : 'https://www.google.com/favicon.ico';
  },
  closePage(ms) {
    setTimeout(window.close, ms);
  },
  openRelLinks(ids) {
    const url = `https://yurt.corp.google.com/?entity_id=${ids
      .split(', ')
      .join(
        '%2C'
      )}&entity_type=VIDEO&config_id=prod%2Freview_session%2Fvideo%2Fstandard_readonly_lookup&jt=yt_admin_review_packet_id&jv=14569122914413829262&ds_id=YURT_LOOKUP!2609626686721411490&de_id=2023-08-06T16%3A49%3A02.150670376%2B00%3A00#lookup-v2`;

    // Open the URL in a new tab
    window.open(url, '_blank');
  },
  dVideo() {
    let ytpPlayer = getElement('ytp-player')?.[0];
    return JSON.parse(ytpPlayer.playerVars.player_response).streamingData
      .formats[0].url;
  },
  dVideoNew() {
    return dom_.reviewRoot.hostAllocatedMessage.reviewData.videoReviewData
      .playerMetadata.playerResponse.uneditedVideoInfo.previewServerUrl;
  },
  reloadPage(minutes) {
    // Convert minutes to milliseconds
    var milliseconds = minutes * 60 * 1000;

    // Set a timeout to reload the page after the specified time
    setTimeout(function () {
      location.reload();
    }, milliseconds);
  },
  benchmark(fn) {
    return function (...args) {
      const startTime = performance.now();
      const result = fn(...args);
      const endTime = performance.now();
      const elapsedTime = endTime - startTime;
      console.log(`[${elapsedTime.toFixed(4)} ms] ${fn?.name}`);
      return result;
    };
  },
  historyPushState() {
    history.pushState({}, '', '#yort');
    window.open('https://yurt.corp.google.com/#review');
  },

  // function tools
  _debounce(func, delay) {
    let timeoutId;

    return function () {
      const args = arguments;

      clearTimeout(timeoutId);
      timeoutId = setTimeout(function () {
        func.apply(this, args);
      }, delay);
    };
  },
  _throttle(func, delay) {
    let timerId;
    let lastExecutedTime = 0;

    return function (...args) {
      const currentTime = Date.now();

      if (currentTime - lastExecutedTime >= delay) {
        // It's time to execute the function
        func.apply(this, args);
        lastExecutedTime = currentTime;
      } else {
        // Schedule the function execution after the remaining delay
        clearTimeout(timerId);
        timerId = setTimeout(() => {
          func.apply(this, args);
          lastExecutedTime = Date.now();
        }, delay - (currentTime - lastExecutedTime));
      }
    };
  },
  async retry(fn, interval = 500, totalDuration = 3000) {
    const startTime = Date.now();
    let endTime = startTime + totalDuration;

    while (Date.now() < endTime) {
      try {
        const result = await fn();
        console.log(`✅ ${fn?.name}()`, result);
        return result;
      } catch (error) {
        console.log(`[ℹ] ${fn?.name}:`, error.message);
        console.log(error);
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    console.log(`❌ ${fn?.name} error. Retried for ${totalDuration} ms.`);
  },
};

let action_ = {
  video: {
    // click add review, select policy, select language etc...
    steps: {
      addReview() {
        try {
          // make 'add review' button visible
          let decisionTab = getElement('yurt-core-decision-capture')[0];
          decisionTab.tabMode = 0;

          // click add review after 200ms
          setTimeout(() => {
            const addReviewBtn = getElement(
              'tcs-button[data-test-id="start-review-button"]'
            )[0];
            addReviewBtn.click();
          }, 100);
        } catch (e) {
          throw new Error('Could not set Add Review');
        }
      },
      selectPolicy(policyId) {
        try {
          let decisionPolicy = getElement('yurt-core-decision-policy')[0];
          decisionPolicy.policyIds = [
            '9008',
            '3039',
            '3044',
            '3065',
            '5013',
            '3099',
            '3999',
            '3888',
          ];
          const foundPolicy = [
            ...(getElement('yurt-core-decision-policy-item') ?? []),
          ].filter((policyItem) => policyItem.policyId === policyId)?.[0];

          foundPolicy.click();
          return foundPolicy.policy;
        } catch (e) {
          console.log(e);
          throw new Error('Could not select policy', policyId);
        }
      },
      selectLanguage(language) {
        // DEPRECATED since 15.02.2024
        return;
        try {
          if (!language) return;
          let langOptions = Array.from(
            getElement('#decision-panel-language-select > mwc-list-item')
          );

          const foundLanguageOption = langOptions.filter((option) =>
            option.value.toLowerCase().includes(language.toLowerCase())
          )?.[0];

          foundLanguageOption.click();

          return foundLanguageOption.value;
        } catch (e) {
          console.log(e);
          throw new Error('Could not select language', language);
        }
      },
      addNote(note) {
        try {
          let noteInputBox =
            getElement('.notes-input')?.[0] ||
            getElement(
              'mwc-textarea[data-test-id=core-decision-policy-edit-notes]'
            )?.[0];

          noteInputBox.value = note;
          action_.video.steps.selectTextArea();
        } catch (e) {
          console.log(arguments.callee.name, e.stack);
        }
      },
      selectTextArea() {
        let link;
        link = getElement('.mdc-text-field__input')?.[0];

        //console.log('text area');
        link && link.select();
      },
    },
    addNote(noteStr) {
      let decisionCard = getElement('yurt-core-decision-policy-card')?.[0];
      decisionCard.annotation.notes = noteStr;
    },
    // actual complete actions
    async approve(language) {
      const { retry } = lib_;

      await retry(action_.video.steps.addReview);
      await retry(() => action_.video.steps.selectPolicy('9008'));
      setTimeout(dom_.saveReview, 1000);

      // setTimeout(() => action_.video.steps.selectPolicy('9008'), 100);

      // if (store_.is.queue('xsource')) {
      //   // approve questionnaire only in xsource
      //   await retry(function approveQuestionnaire() {
      //     questionnaire_.setAnswers(questionnaire_.generateAnswers('9008'));
      //   });
      // }

      // await retry(function saveReview() {
      //   dom_.saveReview();
      //   if (!dom_.decisionCard) throw new Error('Could not save review');
      // });

      if (store_.is.autosubmit) {
        await retry(function submitVideo() {
          dom_.videoDecisionPanel.onSubmit();
        });
        return true;
      }
    },
    async strike(
      policyId = '3039',
      contentType = 'video',
      language = 'russian'
    ) {
      const { expandNotesArea } = ui_.mutations;
      const { setAnswers, generateAnswers } = questionnaire_;
      const { selectLanguage, selectPolicy, addReview } = action_.video.steps;
      const { retry } = lib_;

      await retry(addReview);
      await retry(() => selectPolicy(policyId));

      await retry(function answerQuestionnaire() {
        if (store_.is.queue('bluechip')) return true;
        if (store_.ignoreQuestionnairePolicies.includes(policyId)) return;
        return setAnswers(generateAnswers(policyId));
      });
      await retry(function next() {
        try {
          let nextBtn = getElement('.next-button')[0];

          nextBtn.click();
        } catch (e) {
          throw new Error('Could not Next');
        }
      });
      await retry(function done() {
        try {
          let doneBtn = getElement('tcs-button[name="label-submit"]')[0];
          doneBtn.click();
        } catch (e) {
          throw new Error('Could not click Done');
        }
      });

      await retry(expandNotesArea);
      await retry(() => utils_.showNotes(policyId));
    },
    route(queue, noteType, reason = 'policy vertical') {
      // TODO
      // let { queue, noteType, reason } = routeOptions;

      // helper functions
      function clickRoute() {
        let decisionCapture = getElement('yurt-core-decision-capture')[0];
        decisionCapture.setRouteView();
      }

      function selectTarget(queue) {
        const { listItemByInnerText } = utils_.click;

        listItemByInnerText(...queue.split(' '));
      }

      function selectReason(reasonStr) {
        try {
          if (queue === 'T2' || queue === 'FTE' || queue === 'T2/FTE') {
            routeStr = 'protections';
          }
          const reasons = Array.from(
            getElement('mwc-select[label="Routing reason"] > mwc-list-item')
          );

          const reason = reasons.filter((r) =>
            r.innerText.toLowerCase().includes(reasonStr)
          );

          reason[0].click();
        } catch (e) {
          console.log('Could not select routing reason\n\n', e);
        }
      }

      function selectTextArea() {
        let textArea = getElement('.mdc-text-field__input')?.[0];
        textArea.select();
      }

      // actual routing process

      clickRoute();
      // show recommendations for routing to target queue
      setTimeout(() => {
        selectTarget(queue);
        selectReason(reason);
        selectTextArea();
        ui_.mutations.expandRouteNotesArea();
        ui_.components
          .recommendationPanel({
            notesArr: recommendationNotes.route[noteType],
          })
          .render();
      }, 1);
    },
  },
  comment: {
    steps: {
      selectVEpolicy(commentPolicy = 'FTO') {
        let policiesArr = Array.from(
          getElement('yurt-core-policy-selector-item') || []
        );
        let VEpolicy = policiesArr?.filter((item) => {
          let tags = item.policy.tags;
          return tags?.includes(commentPolicy);
        })?.[0];

        if (!VEpolicy) {
          () => this.selectVEpolicy(commentPolicy);
          return;
        }
        console.log('selectVEpolicy', commentPolicy);
        VEpolicy.click();
      },

      selectActionType(actionType = 'generic_support') {
        console.log('selectActionType', actionType);

        utils_.click.element('mwc-radio', { value: actionType });
      },

      VEgroupType(veType = 've_group_type') {
        console.log('VEgroupType', veType);
        utils_.click.element('mwc-radio', { value: veType });
      },

      selectVEgroup(targetGroup) {
        console.log('selectVEgroup', targetGroup);

        const VEgroupsArr = Array.from(getElement('mwc-list-item'));

        if (VEgroupsArr.length < 20 || !VEgroupsArr) {
          // error check
          setTimeout(
            () => action_.comment.steps.selectVEgroup(targetGroup),
            config_.FUNCTION_CALL_RETRY_MS
          );
          return;
        }

        function getVEGroup() {
          let group = VEgroupsArr?.filter((item) => {
            //console.log(item.value);
            //console.log(groupsMap[targetGroup]);
            return item.value === store_.veGroups[targetGroup];
          })?.[0];
          return group;
        }

        let group = getVEGroup();
        console.log('getVEGroup', group);

        group && group?.click();
      },

      selectRelevance(relevance = 'comment_text') {
        console.log('selectRelevance', relevance);

        utils_.click.element('mwc-checkbox', { value: relevance });
      },

      selectStamp(stampType = 'the_whole_comment') {
        console.log('selectRelevance', stampType);

        utils_.click.element('mwc-radio', { value: stampType });
      },
    },
    strikeComment(VEGroup, timerMin, groupType = 've_group_type') {
      let {
        selectVEpolicy,
        selectActionType,
        VEgroupType,
        selectVEgroup,
        selectRelevance,
        selectStamp,
      } = action_.comment.steps;
      let { clickNext, clickDone } = utils_;

      selectVEpolicy();
      selectActionType();
      // clickNext();
      VEgroupType(groupType);
      // clickNext();
      selectVEgroup(VEGroup);
      clickNext();
      selectRelevance();
      clickNext();
      selectStamp();
      // clickNext();
      clickDone();
      if (timerMin) {
        utils_.setTimer(timerMin, false);
      }
    },
    approveComment: () => {
      let policiesArr = Array.from(
        getElement('yurt-core-policy-selector-item')
      );
      let approvePolicy = policiesArr.filter(
        (policy) => policy.policy.id === '35265'
      )?.[0];

      approvePolicy.click();
    },
    routeComment: (targetQueue) => {
      // TODO?
      let routeTargetsArr = Array.from(getElement('mwc-list-item'));
      let hate = routeTargetsArr.filter(
        (target) =>
          target.innerHTML.includes('Hate') &&
          target.innerHTML.includes('English')
      )?.[0];
      let xlang = routeTargetsArr.filter((target) =>
        target.innerHTML.includes('Xlang')
      )?.[0];
      let policyVertical = routeTargetsArr.filter((target) =>
        target.innerHTML.includes('policy vertical')
      )?.[0];
      let routeBtn = getElement('.submit')?.[0];
    },
  },
  delete() {
    try {
      const deleteBtns = [...getElement('#delete')];

      if (!deleteBtns || deleteBtns.length === 0) {
        return;
      }
      if (deleteBtns.length > 1) {
        deleteBtns.forEach((btn) => btn.click());
        return;
      }
      deleteBtns[0].click();
    } catch (e) {
      console.log('could not delete review');
    }
  },
};

let props_ = {
  button: {
    approve: [
      { text: '🇷🇺 RU', onClick: () => action_.video.approve('russian') },
      { text: '🇺🇦 UA', onClick: () => action_.video.approve('ukrainian') },
      { text: '🇬🇧 ENG', onClick: () => action_.video.approve('english') },
      {
        text: '❔ AGN',
        onClick: () => action_.video.approve('Language agnostic'),
      },
      { text: '🔳 N/A', onClick: () => action_.video.approve() },
    ],
  },
  dropdown: {
    strike: {
      label: 'Select VE Group',
      value: 'strike_ve_group_dropdown',
      options: [
        {
          value: 'wagner',
          label: 'Wagner PMC',
        },
        {
          value: `alq`,
          label: 'Al Qaeda',
        },
        {
          value: `ik`,
          label: 'Imarat Kavkaz',
        },
        {
          value: `isis`,
          label: 'ISIS',
        },
        {
          value: `hamas`,
          label: 'Hamas',
        },
        {
          value: `hezbollah`,
          label: 'Hezbollah',
        },
        {
          value: `hizbut`,
          label: 'Hizbut Tahrir',
        },
        {
          value: `ira`,
          label: 'IRA',
        },
        {
          value: `lte`,
          label: 'LTTE',
        },
        {
          value: `unknown`,
          label: 'UNKNOWN',
        },
        {
          value: `vnsa`,
          label: 'VNSA',
        },
      ],
    },
  },
  dropdownList: {
    9008: {
      label: '9008',
      children: [
        { key: '🇷🇺 Russian', onClick: () => action_.video.approve('russian') },
        {
          key: '🇺🇦 Ukrainian',
          onClick: () => action_.video.approve('ukrainian'),
        },
        { key: '🇬🇧 English', onClick: () => action_.video.approve('english') },
        {
          key: '❔ Agnostic',
          onClick: () => action_.video.approve('Language agnostic'),
        },
        { key: '🔳 No Language', onClick: () => action_.video.approve() },
      ],
    },
    route: {
      label: 'Route ⤴',
      children: [
        {
          key: '🇸🇦 Arabic',
          onClick: () =>
            action_.video.route(
              `ve ${utils_.get.queue.type() ?? ''} arabic`,
              'arabic',
              'routing for language'
            ),
        },
        {
          key: '💉💲 Drugs & Sales',
          onClick: () =>
            action_.video.route(`drugs ${utils_.get.queue.type()}`, 'drugs'),
        },
        {
          key: '🧨 H&D ',
          onClick: () => action_.video.route('Harmful Dangerous Acts', 'hd'),
        },
        {
          key: '🥩 Graphic',
          onClick: () =>
            action_.video.route(`graphic violence enforcement`, 'gv'),
        },
        {
          key: '⚡ Hate',
          onClick: () => action_.video.route('hate russian', 'hate'),
        },
        {
          key: '🏹 Harassment',
          onClick: () =>
            action_.video.route(
              `harassment ${utils_.get.queue.type()} russian`,
              'harass'
            ),
        },
        {
          key: '🔞 Adult',
          onClick: () => action_.video.route('adult', 'adult'),
        },
        { key: '📬 Spam', onClick: () => action_.video.route('spam', 'spam') },
        {
          key: '💽 Digital Security',
          onClick: () => action_.video.route('digital security video', 'ds'),
        },
        {
          key: '🧒 Child Safety',
          onClick: () => action_.video.route('child minors', 'cs'),
        },
        {
          key: '🗞 Misinformation',
          onClick: () => action_.video.route('misinfo'),
        },
        {
          key: '🔐 T2/FTE',
          onClick: () =>
            action_.video.route(
              store_.is.queue('t2') ? 'fte' : 't2',
              't2',
              'protections'
            ),
        },
      ],
    },
    strike: {
      label: 'Strike',
      children: [
        '3065',
        '3039',
        '3044',
        '3048',
        '3099',
        '3999',
        '3888',
        '5013',
        '6120',
      ].map((policyId) => ({
        key: policyId,
        onClick: () => action_.video.strike(policyId),
      })),
    },
  },
};

let dom_ = {
  get filterControlsPanel() {
    return getElement('.filter-controls-on')?.[0];
  },
  get channelId() {},
  get decisionCard() {
    return getElement('yurt-core-decision-policy-card')?.[0];
  },
  get allDecisionCards() {
    return getElement('yurt-core-decision-policy-card');
  },
  get videoTitleRow() {
    return getElement('.video-title-row')?.[0];
  },
  get rightSidebar() {
    return getElement(
      'yurt-core-decision-annotation-tabs > div:nth-child(1)'
    )?.[0];
  },
  get videoDecisionPanel() {
    return getElement('yurt-video-decision-panel-v2')?.[0];
  },
  get header() {
    return store_.is.queue('comments')
      ? getElement('tcs-text[spec=title-2]')?.[0].shadowRoot
      : getElement('yurt-core-plugin-header > div > tcs-view')?.[0];
  },
  get metadataPanel() {
    return getElement('yurt-video-metadata')?.[0].shadowRoot;
  },
  get submitBtn() {
    return getElement('.mdc-button--unelevated')?.[0];
  },
  get submitEndReviewBtn() {
    return getElement('div > mwc-menu > mwc-list-item')?.[0];
  },
  get routeBtn() {
    return getElement('div > tcs-view > tcs-button')?.[0];
  },
  get routeEndReviewBtn() {
    return getElement('div > mwc-menu > mwc-list-item')?.[0];
  },
  get transcriptContainer() {
    let transcriptContainer;
    try {
      transcriptContainer = getElement('.transcript-container')?.[0];
    } catch (e) {
      console.log('Could not find transcript-container');
    }
    return transcriptContainer;
  },
  get videoPlayer() {
    try {
      let videoPlayer = getElement('yurt-video-root')?.[0].playerApi;
      return videoPlayer;
    } catch (e) {
      console.log('[DOM-element] Player not found');
    }
  },
  get questionnaire() {
    return getElement('yurt-core-questionnaire')?.[0];
  },
  get reviewRoot() {
    return getElement('yurt-review-root')?.[0];
  },
  get videoRoot() {
    return getElement('yurt-video-root')?.[0];
  },
  saveReview() {
    try {
      let decisionView = getElement('yurt-core-decision-view-policy')[0];
      // TEMPORARY FIX: built-in function to save questionnaire
      decisionView.wZa();
    } catch (e) {
      throw new Error('Could not Save Review');
    }
  },
  playerControls: {
    get player() {
      return dom_.videoPlayer;
    },
    onFastRewind() {
      this.player.setPlaybackRate(
        this.player.getPlaybackRate() > 0 &&
          this.player.getPlaybackRate() - 0.25
      );
    },
    onFastForward() {
      this.player.setPlaybackRate(this.player.getPlaybackRate() + 0.25);
    },
    onResetPlaybackRate() {
      this.player.setPlaybackRate(1);
    },
    onReset() {
      this.player.pauseVideo();
      this.player.seekTo(0);
    },

    drawControlButtons() {
      const container = utils_.strToNode(
        `<div class='player-controls-btns' style="margin-left: auto; display:flex;"></div>`
      );

      const buttons = [
        ui_.createIconButton(
          'fast_rewind',
          dom_.playerControls.onFastRewind.bind(dom_.playerControls),
          'player-controls-fast-rewind'
        ),
        ui_.createIconButton(
          'play_circle',
          dom_.playerControls.onResetPlaybackRate.bind(dom_.playerControls),
          'player-controls-reset-playback-rate'
        ),
        ui_.createIconButton(
          'fast_forward',
          dom_.playerControls.onFastForward.bind(dom_.playerControls),
          'player-controls-fast-forward'
        ),
        ui_.createIconButton(
          'restart_alt',
          this.onReset.bind(dom_.playerControls),
          'reset-player-btn'
        ),
      ];

      buttons.forEach((btn) => (btn.style.opacity = store_.opacity));

      container.replaceChildren(...buttons);

      try {
        let ytpLeftControls = getElement('.ytp-left-controls')?.[0];
        ytpLeftControls.replaceChildren(
          ...[...ytpLeftControls.children, container]
        );
      } catch (e) {
        throw new Error('Could not draw player control buttons.');
      }

      return buttons;
    },
  },
};

let transcript_ = {
  getTranscript() {
    let transcript = getElement('yurt-video-transcript')?.[0];

    let res = Object.getOwnPropertyNames(transcript)
      .filter((opt) => Array.isArray(transcript[opt]))
      ?.map((opt) => transcript[opt]);

    function findLargestArray(arrays) {
      let largestArray = [];
      let largestSize = 0;

      for (let i = 0; i < arrays.length; i++) {
        const currentArray = arrays[i];
        const currentSize = currentArray.length;

        if (currentSize > largestSize) {
          largestArray = currentArray;
          largestSize = currentSize;
        }
      }

      return largestArray;
    }

    return findLargestArray(res);
  },
  async getAllChannelTranscripts(channelId) {
    const { videos } = await utils_.getChannelVideos(channelId);
    const channelVideosIds = videos.map((video) => video.externalVideoId);

    // Create an array of promises for fetching transcripts
    const fetchTranscriptsPromises = channelVideosIds.map(async (videoId) => {
      const t = await transcript_.getTranscriptById(videoId);
      if (t && Object.keys(t).length > 0) {
        return { [videoId]: t };
      }
      return null;
    });

    // Use Promise.all to fetch transcripts in parallel
    const transcriptsArray = await Promise.all(fetchTranscriptsPromises);

    // Convert the array of fetched transcripts into a single object
    const allTranscripts = Object.assign(
      {},
      ...transcriptsArray.filter(Boolean)
    );

    // Now, allTranscripts contains the results in parallel
    return allTranscripts;
  },
  async getChannelViolativeWords(channelId, veOnly = true) {
    const transcriptById = await this.getAllChannelTranscripts(channelId);

    if (!transcriptById || Object.keys(transcriptById).length === 0) return;

    const result = Object.keys(transcriptById)
      .map((videoId) => {
        const violativeWords = this.getViolativeWords(
          store_.wordsByCategory,
          transcriptById[videoId]
        );

        console.log('violative words', violativeWords);

        // Filter the 've' property and its array from violativeWords
        const filteredViolativeWords = Object.entries(violativeWords)
          .filter(([category]) => category === 've')
          .reduce((obj, [category, words]) => {
            obj[category] = words;
            return obj;
          }, {});

        // Check if 've' property is present
        if (Object.keys(filteredViolativeWords).length > 0) {
          return { videoId, violativeWords: filteredViolativeWords };
        }

        return null;
      })
      .filter(Boolean);

    return result || [];
  },
  async renderChannelViolativeWordsTable(
    channelId = dom_.reviewRoot.hostAllocatedMessage.reviewData.videoReviewData
      .videoReviewMetadata.externalChannelId
  ) {
    let words = await transcript_.getChannelViolativeWords(channelId);
    if (!words || words.length === 0) return;
    words.forEach((word) =>
      ui_.components.createTable(word.violativeWords, word.videoId)
    );
  },
  async getTranscriptById(videoId) {
    if (!videoId) return;
    const url = `https://yurt.corp.google.com/_/backends/video/v1/videos/${videoId}/transcript?alt=json&key=${yt.config_.YURT_API_KEY}`;

    const transcript = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json());

    return transcript.videoTranscriptSegment;
  },
  getViolativeWords(
    violativeWordsByCategory = store_.wordsByCategory,
    sourceList
  ) {
    const allWords = sourceList ?? this.getTranscript();
    if (!allWords || allWords.length === 0) return {};

    const filteredWordsByCategory = {};

    for (const category in violativeWordsByCategory) {
      if (violativeWordsByCategory.hasOwnProperty(category)) {
        const filteredWords = allWords
          .filter((word) =>
            violativeWordsByCategory[category].some((violativeWord) =>
              word.text.toLowerCase().includes(violativeWord)
            )
          )
          .map((obj) => ({
            key: obj.text,
            value: utils_.formatTime(obj.startTimeSec),
            seconds: obj.startTimeSec,
          }));

        if (filteredWords.length > 0) {
          filteredWordsByCategory[category] = filteredWords;
        }
      }
    }

    return filteredWordsByCategory;
  },

  filterTranscriptByCategory(wordsToFilter = store_.wordsByCategory) {
    console.log('[i] Filtering transcript by category...');
    let transcriptNodesArr = [...getElement('.transcript')];

    const categories = ['ve', 'hate', 'adult'];

    categories.forEach((category) => {
      let filteredWordsByCategory = transcriptNodesArr.filter((wordSpan) =>
        wordsToFilter[category].some((word) =>
          wordSpan.textContent.toLowerCase().includes(word)
        )
      );

      filteredWordsByCategory.forEach((word) => {
        console.log('Highlighting', word);
        this.highlighter(word, category);
      });
    });
  },

  observeTranscriptMutations() {
    try {
      const transcriptPages = getElement('.transcript-pages');
      if (!transcriptPages) return;
      transcriptPages.forEach((transcript) => {
        const observer = new MutationObserver(
          observers.handleTranscriptMutation
        );
        observer.observe(transcript, observers.observerOptions);
      });
    } catch (e) {
      console.log('Could not observer transcript mutations', e.stack);
    }
  },

  highlighter(elem, type = 've') {
    if (type === 've') {
      elem.style.backgroundColor = 'red';
    }

    if (type === 'hate') {
      elem.style.color = 'white';
      elem.style.backgroundColor = 'purple';
      elem.style.border = '1px solid yellow';
    }

    if (type === 'adult') {
      elem.classList.add('highlight');
    }
  },
  checkForLewd(
    wordsArray = transcript_.getViolativeWords().adult,
    maxIntervalSeconds = 60,
    wordCount = 10
  ) {
    let sequenceStart = 0;
    let sequenceLength = 0;

    if (!wordsArray) return;

    for (let i = 1; i < wordsArray.length; i++) {
      if (
        wordsArray[i].seconds - wordsArray[sequenceStart].seconds <=
        maxIntervalSeconds
      ) {
        sequenceLength++;
        if (sequenceLength >= wordCount) {
          const firstWord = wordsArray[sequenceStart];
          const lastWord = wordsArray[i];

          const chip = getElement(`tcs-chip[text="${firstWord.value}"]`)?.[0];

          chip.shadowRoot.children[0].style.backgroundColor =
            'var(--google-red-500)';

          return {
            firstWord,
            lastWord,
          };
        }
      } else {
        sequenceStart = i;
        sequenceLength = 0;
      }
    }

    return null;
  },
};

let api_ = {
  KEY: yt.config_.YURT_API_KEY,
  get: {
    async strikeHistory(
      channelId = dom_.reviewRoot.hostAllocatedMessage.reviewData
        .videoReviewData.videoReviewMetadata.externalChannelId
    ) {
      try {
        const url = `https://yurt.corp.google.com/_/backends/review/v1/strikeHistory:fetch?alt=json&key=${yt.config_.YURT_API_KEY}`;

        let history = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            externalChannelId: channelId,
          }),
        }).then((response) => response.json());

        return history;
      } catch (e) {
        console.log('\n\n\t\t[STRIKE HISTORY] Could not fetch:\n\n', e);
      }
    },
    async channelVideos(
      channelId = dom_?.reviewRoot?.hostAllocatedMessage?.reviewData
        ?.videoReviewData?.videoReviewMetadata?.externalChannelId ??
        dom_?.videoRoot?.channel?.externalChannelId
    ) {
      try {
        const url = `https://yurt.corp.google.com/_/backends/account/v1/videos:fetch?alt=json&key=${yt.config_.YURT_API_KEY}`;

        let videosArr = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            externalChannelId: channelId,
            fetchLatestPolicy: true,
            maxNumVideosByRecency: 50,
            viewEnums: ['VIEW_INCLUDE_PINNED_COMMENT'],
          }),
        }).then((response) => response.json());

        return videosArr;
      } catch (e) {
        console.log('\n\n\t\tCould not fetch channel videos\n\n', e);
      }
    },
  },
};

let ui_ = {
  atoms: {
    card({ children }) {
      let elem = utils_.strToNode(`<yurt-core-card></yurt-core-card>`);

      if (children?.length > 1) {
        children.forEach((child) => elem.appendChild(child));
        return elem;
      }

      elem.appendChild(children);
      return elem;
    },
    button({ text, onClick, spec = 'flat-primary' }) {
      let btnStr = `<tcs-button ${spec && `spec=${spec}`}>${text}</tcs-button>`;

      let btn = utils_.strToNode(btnStr);
      btn.onclick = onClick;
      return btn;
    },
    dropdown({ label, value, options }) {
      return utils_.strToNode(`<mwc-select naturalmenuwidth outlined label="${label}" value="${value}">
                ${options
                  ?.map(
                    (option) =>
                      `<mwc-list-item outlined ${
                        option.label.includes('Wagner') ? 'selected' : ''
                      } value="${option.value}" role="option">${
                        option.label
                      }</mwc-list-item>`
                  )
                  .join('')}
              </mwc-select>`);
    },
    switch(label, className) {
      let node =
        utils_.strToNode(`<tcs-view padding="small" fillwidth="" display="flex" spec="row" wrap="nowrap" align="stretch" spacing="none"><mwc-formfield>
      <mwc-switch class=${className} id=${className}></mwc-switch></mwc-formfield><tcs-text text=${
          label ?? ''
        } class="wellness-label" spec="body" texttype="default"></tcs-text></tcs-view>`);

      return node;
    },
    createGrid(cols = 3, elementSize = '170px') {
      const grid = ui_.strToNode(
        `<div style="display: grid; grid-template-columns: repeat(${cols}, ${elementSize}); gap: 8px; margin: 12px;"></div>`
      );

      return grid;
    },
  },
  components: {
    // Ready UI Components

    get btns() {
      const { button: createButton } = ui_.atoms;
      const { button: btnProps } = props_;

      return {
        approve: btnProps.approve.map(({ text, onClick }) =>
          createButton({ text, onClick })
        ),
        strike: btnProps.strike.map(({ text, onClick }) =>
          createButton({ text, onClick })
        ),
        route: btnProps.route.map(({ text, onClick }) =>
          createButton({ text, onClick })
        ),
        comments: btnProps.comments.map(({ text, onClick }) =>
          createButton({ text, onClick })
        ),
      };
    },
    get approvePanelHeader() {
      const container = utils_.strToNode(
        '<div style="display: flex; gap: 8px; opacity: 0; margin-left:auto; margin-right: 64px; transition: opacity 300ms;" class="approve-panel__header"></div>'
      );
      const btns = props_.button.approve.map(({ text, onClick }) =>
        ui_.createButton(text, onClick)
      );

      const routeToArabic = ui_.createButton('🇸🇦 Arabic', () =>
        action_.video.route(
          `ve ${utils_.get.queue.type() ?? ''} arabic`,
          'arabic',
          'routing for language'
        )
      );

      container.replaceChildren(
        ...[dom_.autosubmitSwitch, ...btns, routeToArabic]
      );

      // Function to handle mouseenter event
      function handleMouseEnter() {
        container.style.opacity = 1;
      }

      // Function to handle mouseleave event
      function handleMouseLeave() {
        container.style.opacity = 0;
      }

      // Add event listeners
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);

      return container;
    },
    get stopwatchPanel() {
      const getTimeStr = () => `${utils_.formatTime(utils_.get.timeElapsed)}`;

      const stopwatch = utils_.strToNode(
        `<tcs-chip spec="tag" text=${getTimeStr()} class="stopwatch container"></tcs-chip>`
      );

      let parentNode = store_.is.queue('comments')
        ? getElement('tcs-text[spec=title-2]')?.[0]?.shadowRoot
        : getElement('yurt-core-plugin-header > div > tcs-view')?.[0];

      parentNode.spacing = 'small';

      // MULTIPLE TABS
      if (config_.SU) {
        function showTimers() {
          const { setTimer, strToNode } = utils_;
          let existingTimers = getElement('.timers')?.[0];

          if (existingTimers) {
            existingTimers.remove();
            return;
          }

          const timersWrapper = strToNode(
            `<tcs-view class="timers container" align="center" spec="row"></tcs-view>`
          );
          const autoreloadCheckbox = strToNode(
            `<mwc-checkbox value="autoreload-page"></mwc-checkbox>`
          );

          timersWrapper.replaceChildren(...timersArr);
          timersWrapper.appendChild(autoreloadCheckbox);
          parentNode.appendChild(timersWrapper);
        }

        stopwatch.onclick = () => {
          utils_.removeLock();
          showTimers();
        };
      }

      // tick
      store_.stopwatchId = setInterval(() => {
        stopwatch.text = getTimeStr();
      }, 1000);

      return {
        stopwatch,
      };
    },
    get actionPanel() {
      const {
        createDropdownMenu,
        atoms: { card: createCard, dropdown: createDropdownSelector },
        components: {
          stopwatchPanel: { stopwatch },
        },
      } = ui_;

      const container = utils_.strToNode(
        `<div style="display: flex; flex-direction: column; gap: 8px; align-items: center;" class="strike-panel container"></div>`
      );

      const veGroupDropdownSelector = createDropdownSelector(
        props_.dropdown.strike
      );

      veGroupDropdownSelector.style.width = '80%';
      stopwatch.style.alignSelf = 'flex-start';
      stopwatch.style.paddingLeft = '10px';
      stopwatch.style.paddingTop = '10px';

      veGroupDropdownSelector.onclick = (e) => e.stopPropagation();

      veGroupDropdownSelector.onchange = () => {
        store_.selectedVEGroup =
          store_.newVeGroups[veGroupDropdownSelector.selected.value];
      };

      const [approveMenu, routeMenu, strikeMenu] = Object.keys(
        props_.dropdownList
      ).map((policy) => createDropdownMenu(props_.dropdownList[policy]));

      container.replaceChildren(
        stopwatch,
        approveMenu,
        strikeMenu,
        routeMenu,
        veGroupDropdownSelector
      );

      const element = createCard({
        children: container,
      });

      return element;
    },

    get configPanel() {
      // the panel under player with tools like transcript filtering
      // or triggering notes templates
      const container = ui_.strToNode(
        `<div style="display: flex;" class="config-panel"></div>`
      );

      const buttons = [
        ui_.createIconButton(
          'filter_alt',
          async () => {
            await lib_.retry(ui_.renderWordsTable);
            transcript_.checkForLewd();
          },
          'filter-transcript-table'
        ),
        ui_.createIconButton(
          'troubleshoot',
          async function filterCurrentChannelTranscripts() {
            transcript_.renderChannelViolativeWordsTable();
          },
          'filter-ids-btn'
        ),
        ui_.createIconButton(
          'note_add',
          () => utils_.showNotes(),
          'show-notes-btn'
        ),
        ui_.createIconButton(
          'delete',
          () => {
            clearTimeout(store_.submitId);
            store_.submitId = 0;
          },
          'clear-timers-btn'
        ),
      ];

      container.replaceChildren(...buttons);

      return container;
    },
    recommendationPanel({ notesArr }) {
      // TODO comments recommendations
      if (store_.is.queue('comments')) return;

      let recommendationList = utils_.strToNode(
        `<mwc-list id="recommendation-notes" style="margin: 30px 0px; opacity: 0; transition: opacity 300ms;">${notesArr
          ?.map(
            (note) =>
              `<mwc-list-item class="recommendation-item" graphic="avatar" value="${note.value()}"><span>${
                note.title
              }</span><mwc-icon slot="graphic">note_add</mwc-icon></mwc-list-item>`
          )
          .join('')}</mwc-list>`
      );

      // Function to handle mouseenter event
      function handleMouseEnter() {
        recommendationList.style.opacity = 1;
      }

      // Function to handle mouseleave event
      function handleMouseLeave() {
        recommendationList.style.opacity = 0;
      }

      // Add event listeners
      recommendationList.addEventListener('mouseenter', handleMouseEnter);
      recommendationList.addEventListener('mouseleave', handleMouseLeave);

      [...recommendationList.childNodes].forEach(
        (recommendation) =>
          (recommendation.onclick = () => {
            action_.video.steps.addNote(recommendation.value);
          })
      );

      return {
        element: recommendationList,
        render() {
          // find parent
          const decisionContainer = getElement('.decision-container')[0];
          decisionContainer.appendChild(recommendationList);
        },
      };
    },
    get commentsPanel() {
      commentsPanelWrapper = utils_.strToNode(
        `<tcs-view wrap="wrap" class="action-panel__comments" spacing="small"></tcs-view>`
      );

      commentsPanelWrapper.replaceChildren(...ui_.components.btns.comments);

      let element = atoms.card({ children: commentsPanelWrapper });

      return {
        element,
        render() {
          // return if there is a panel already
          if (getElement('.action-panel__comments')?.[0]) return;

          utils_.appendNode(element);
        },
      };
    },
    createWordsList(listItemsArr) {
      const { strToNode } = ui_;

      let myLabelledList = strToNode(`<tcs-labeled-list spec="primary">
      </tcs-labeled-list>`);

      const listItemsChildren = listItemsArr.map((item) => {
        const listItem = strToNode(`<tcs-labeled-list-item key="${item.key}">
        </tcs-labeled-list-item>`);

        const timeStampChip = strToNode(
          `<tcs-chip spec="tag" text="${item.value}"></tcs-chip>`
        );

        timeStampChip.addEventListener('click', (e) => {
          e.stopPropagation();
          dom_.playerControls.player.seekTo(item.seconds);
        });

        timeStampChip.style.cursor = 'pointer';

        listItem.appendChild(timeStampChip);
        return listItem;
      });

      myLabelledList.replaceChildren(...listItemsChildren);
      return myLabelledList;
    },
    createTable(
      violativeWords = transcript_.getViolativeWords(),
      title,
      tableId = 'my-table'
    ) {
      // if (getElement(`${tableId}`)) return;
      const {
        strToNode,
        components: { createWordsList },
      } = ui_;

      const container = strToNode(
        `<div class="${tableId}-container" style="padding: 24px;"></div>`
      );

      // const { seconds: timeVulgarLanguageSeconds } = findWordSequence(
      //   getViolativeWords().adult
      // ).first;

      let wordsListTablesByCategory = Object.getOwnPropertyNames(
        violativeWords
      ).map((category) => {
        if (!violativeWords[category]) return;

        const mySection = strToNode(
          `<tcs-view class="section ${tableId}-section" spacing="small" spec="column" display="flex" wrap="nowrap" align="stretch" padding="none"><tcs-view spacing="small" align="center" display="flex" spec="row" wrap="nowrap" padding="none"><tcs-text spec="caption-2"  texttype="default">${title}</tcs-text></tcs-view><div style="max-height: 100%;" class="scroll-wrapper"></div></tcs-view>`
        );

        mySection.onclick = () => lib_.openRelLinks(title);

        const wordsList = createWordsList(violativeWords[category]);
        mySection.children[1].replaceChildren(wordsList);

        return mySection;
      });

      if (!wordsListTablesByCategory || wordsListTablesByCategory.length === 0)
        return;

      container.replaceChildren(...wordsListTablesByCategory);
      dom_.metadataPanel.appendChild(container);

      // setTimeout(checkForLewd, 3000);

      return container;
    },
  },

  // methods
  draw() {
    try {
      // stopwatch in header
      // !getElement('.stopwatch') &&
      //   dom_.header.appendChild(ui_.components.stopwatchPanel.stopwatch);

      // panel with policies
      if (!getElement('.action-panel')) {
        dom_.metadataPanel.appendChild(dom_.strikePanel);
      }
      // trigger notes
      !getElement('.player-controls-btns') &&
        dom_.playerControls.drawControlButtons();

      // filter transcript and append words table below metadata
      if (!getElement('.config-panel-btn')) {
        dom_.filterControlsPanel.appendChild(
          ui_.createIconButton(
            'chevron_right',
            toggleConfigPanel,
            'config-panel-btn'
          )
        );

        const configPanel = ui_.components.configPanel;
        dom_.filterControlsPanel.appendChild(configPanel);
        configPanel.style.display = 'none';
        configPanel.style.opacity = '0.2';

        [...configPanel.children].forEach((child) =>
          child.addEventListener('click', toggleConfigPanel)
        );
        function toggleConfigPanel() {
          configPanel.style.display === 'none'
            ? (configPanel.style.display = 'flex')
            : (configPanel.style.display = 'none');
        }
      }

      if (!getElement('.approve-panel__header')) {
        dom_.header.appendChild(ui_.components.approvePanelHeader);
      }
    } catch (e) {
      console.log(e);
      throw new Error('Could not draw UI');
    }
  },
  strToNode(str) {
    const tmp = document.createElement('div');
    tmp.innerHTML = str;
    if (tmp.childNodes.length < 2) {
      return tmp.childNodes[0];
    }
    return tmp.childNodes;
  },
  toggleMediaLibrary() {
    let frame = utils_.strToNode(
      `<iframe src="https://dashboards.corp.google.com/embed/_c2a46c2c_a513_4f1a_8add_135ffc560fe8" height="100%" width="100%" frameborder="0"></iframe>`
    );
    const container = ui_.strToNode(`<div style="height: 1500px;"></div>`);
    container.appendChild(frame);
    getElement('.view-overflow')?.[0].shadowRoot.appendChild(container);
  },
  createButton(label = 'My Button', onClick = () => {}, className) {
    let btn = this.strToNode(
      `<tcs-button spec="flat-primary">${label}</tcs-button>`
    );
    btn.onclick = onClick;
    className && btn.classList.add(className);
    return btn;
  },
  createIconButton(
    icon,
    onClick = () => {},
    className,
    size,
    spec = 'primary'
  ) {
    const element = this.strToNode(
      `<tcs-icon-button ${size && `size=${size}`} icon=${icon} spec=${spec} />`
    );
    element.onclick = onClick;
    if (className) element.classList.add(className);
    if (size) element.size = size;

    return element;
  },
  createDropdownMenu(props) {
    const { strToNode } = ui_;
    const { label, children, style } = props;

    // const parentList =
    //   strToNode(`<mwc-list><mwc-list-item hasmeta="" value="video" mwc-list-item="" tabindex="0" aria-disabled="false">
    // <span class="option-label"><tcs-text>${label ?? ''}</tcs-text></span>
    // <tcs-icon data-test-id="label-questionnaire-list-category-icon" slot="meta" class="category-icon" family="material" spec="default">expand_more
    // </tcs-icon>
    // </mwc-list-item>
    // </mwc-list>`);

    // const childList = strToNode(`<mwc-list></mwc-list>`);

    const container = ui_.atoms.createGrid(3);

    // container.style.display = 'none';

    // function toggleShowList() {
    //   container.style.display === 'none'
    //     ? (container.style.display = 'grid')
    //     : (container.style.display = 'none');
    // }

    const childListItems = children.map((item) => {
      // item.key.startWith is to add letter spacing to buttons that have only policy number, e.g. '3065', as opposed to "Russian" which is approve russian
      // it's done to make the button look nicer :)
      const listItem = strToNode(`<mwc-list-item value="${
        item?.value ?? ''
      }" graphic="control" aria-disabled="false">
      <span class="option-label"><tcs-text style="border-radius: 8px; ${
        item.key.startsWith('3') ||
        item.key.startsWith('5') ||
        item.key.startsWith('6')
          ? 'letter-spacing: 2px;'
          : ''
      }">${item?.key ?? ''}</tcs-text></span>
      </mwc-list-item>`);

      function handleClick(e) {
        e.stopPropagation();
        item.onClick();
        toggleShowList();
      }

      listItem.addEventListener('click', handleClick);

      return listItem;
    });

    container.replaceChildren(...childListItems);
    // parentList.appendChild(childList);
    // parentList.addEventListener('click', (e) => {
    //   e.stopPropagation();
    //   toggleShowList();
    // });
    return container;
  },
  typography(str) {
    const textElement = ui_.strToNode(
      `<tcs-text spec="body" >${str}</tcs-text>`
    );
    return textElement;
  },
  toggleRecommendations(policyId) {
    const existing = getElement('#recommendation-notes')?.[0];
    if (existing) {
      existing.remove();
      return true;
    }
    ui_.components
      .recommendationPanel({
        notesArr: recommendationNotes.strike[policyId],
      })
      .render();
  },
  async renderViolativeIds() {
    if (getElement('.violative-ids-section')) return;
    const violativeIds = await utils_.filterVideoByKeywords();

    let content;
    if (!violativeIds) content = 'No videos.';

    content = violativeIds.toString();

    const urlBtn = ui_.createIconButton(
      'open_in_new',
      () => lib_.openRelLinks(violativeIds),
      'open-violative-ids'
    );

    const mySection =
      utils_.strToNode(`<tcs-view class="section violative-ids-section" spacing="small" spec="column" display="flex" wrap="nowrap" align="stretch" padding="none">
        <tcs-view spacing="small" align="center" display="flex" spec="row" wrap="nowrap" padding="none">
          <tcs-text spec="caption-2" data-test-id="channel-test-id" texttype="default">Violative IDs</tcs-text>
          <!--?lit$7724557512$-->
        </tcs-view>
        <!--?lit$7724557512$--><div class="scroll-wrapper">
        <tcs-text secondary="" compact="" spec="body" texttype="default">
        ${content}
        </tcs-text>
      </div>
      </tcs-view>`);

    dom_.metadataPanel.appendChild(mySection);
    dom_.metadataPanel.appendChild(urlBtn);
  },
  renderWordsTable() {
    if (getElement('.violative-words-container')) return;
    const violativeWords = transcript_.getViolativeWords();
    const {
      strToNode,
      components: { createWordsList },
    } = ui_;

    const container = strToNode(
      `<div style="opacity: 0; transition: opacity 300ms;" class="violative-words-container"></div>`
    );

    // Function to handle mouseenter event
    function handleMouseEnter() {
      container.style.opacity = 1;
    }

    // Function to handle mouseleave event
    function handleMouseLeave() {
      container.style.opacity = 0;
    }

    // Add event listeners
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    // const { seconds: timeVulgarLanguageSeconds } = findWordSequence(
    //   getViolativeWords().adult
    // ).first;

    let wordsListTablesByCategory = Object.getOwnPropertyNames(
      violativeWords
    ).map((category) => {
      if (!violativeWords[category]) return;

      const mySection = strToNode(
        `<tcs-view class="section violative-words-table-section" spacing="small" spec="column" display="flex" wrap="nowrap" align="stretch" padding="none"><tcs-view spacing="small" align="center" display="flex" spec="row" wrap="nowrap" padding="none"><tcs-text spec="caption-2" data-test-id="channel-test-id" texttype="default">${category.toUpperCase()} Violative Words</tcs-text></tcs-view><div style="max-height: 100%;" class="scroll-wrapper"></div></tcs-view>`
      );

      const wordsList = createWordsList(violativeWords[category]);
      mySection.children[1].replaceChildren(wordsList);

      return mySection;
    });

    if (!wordsListTablesByCategory || wordsListTablesByCategory.length === 0)
      return;

    container.replaceChildren(...wordsListTablesByCategory);
    dom_.metadataPanel.appendChild(container);

    setTimeout(transcript_.checkForLewd, 3000);

    return container;
  },
  showTimers() {
    try {
      if (getElement('.submit-timers')) return;
      const { setTimer, strToNode } = utils_;
      let mwcMenu = getElement('md-menu[anchor="share-button"]')[0];

      if (!mwcMenu)
        throw new Error('Nowhere to append buttons (mwcMenu not rendered)');

      const timersArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((timerMin) =>
        ui_.createButton(timerMin, () => {
          setTimer(timerMin);
          mwcMenu.open = false;
        })
      );

      const timersWrapper = strToNode(
        `<div class="submit-timers" style="display: grid; grid-template-columns: 1fr 1fr 1fr;"></div>`
      );
      const endReviewCheckbox = strToNode(
        `<mwc-checkbox class="endreview-checkbox"></mwc-checkbox>`
      );

      timersWrapper.replaceChildren(...[...timersArr, endReviewCheckbox]);
      mwcMenu.replaceChildren(...[...mwcMenu.children, timersWrapper]);
      // stopwatch.parentNode.appendChild(timersWrapper);
    } catch (e) {
      console.log('Could not show timers', e);
    }
  },
  mutations: {
    expandTranscriptContainer() {
      try {
        let videoContextContainer = getElement('.video-context-section')?.[0];
        let videoContextPanel = getElement('yurt-video-context-panel')?.[0];
        let transcriptContainer = getElement(
          '.transcript-container.transcript-container-auto-scroll-disable-fab-padding'
        )?.[0];

        [videoContextContainer, videoContextPanel].forEach((elem) => {
          elem.style.height = '700px';
          elem.style.width = '700px';
        });

        transcriptContainer.style.height = '600px';
      } catch (e) {
        console.log(e);
      }
    },
    expandNotesArea(rows = store_.textAreaRows) {
      let notesTextArea;
      notesTextArea = getElement('.mdc-text-field__input')?.[0];
      notesTextArea.style.resize = 'vertical';

      // increase size of note input box
      notesTextArea.rows = rows;
    },
    expandPoliciesContainer() {
      const policiesWrapper = getElement('.policies-wrapper')?.[0];
      const sidebarBtns = getElement('.action-buttons')?.[0];

      try {
        sidebarBtns.style.paddingBottom = '100px';
        policiesWrapper.style.maxHeight = '550px';
        policiesWrapper.style.height = '550px';
      } catch (e) {
        // console.error('Could not expand add review', e);
      }
    },
    expandRouteNotesArea(rows = store_.textAreaRows) {
      getElement('.notes-input')[0].rows = rows;
    },
    moveChannelLink() {
      let link = getElement('tcs-link[data-test-id="open-in-yurt-link"]')?.[0];
      let videosCount = getElement('tcs-labeled-list-item[key="Videos"]')?.[0]
        .children[0];

      videosCount.appendChild(link);
    },
    cinemaMode() {
      // remove useless thumbnail signals
      getElement('yurt-video-thumbnails-v2')[0].remove();

      // resize + move transcript container
      getElement('.main-content > .main-column')[0].style.width = '100%';
      const videoContainerLayout = getElement('.main-content > .main-column')[0]
        .children[0];
      videoContainerLayout.spec = 'column';
      const transcriptContainer = getElement('yurt-video-context-panel')[0];
      transcriptContainer.style.width = '100%';
      transcriptContainer.style.height = '450px';

      // resize player
      getElement('.video-section')[0].style.width = '100%';
      getElement('.yurt-core-player-container')[0].style.width = '100%';
      getElement('yurt-core-player-v2')[0].style.width = '100%';
      const playerContainer = getElement('.yurt-core-player-container')[0];
      playerContainer.style.maxWidth = '100%';
      playerContainer.style.width = '100%';
      getElement('.player-content')[0].style.width = '100%';
      getElement('.player-content')[0].style.height = '1000px';
    },
  },
};

let questionnaire_ = {
  setAnswers(answers) {
    // BUG TEMPORARY FIX labellingGraph.fh
    if (!dom_.questionnaire) throw new Error('[i] Questionnaire Not Rendered');

    // questionnaire answering logic
    answers.forEach((answer) => dom_.questionnaire.setAnswers(answer));

    if (
      !dom_.questionnaire.labellingGraph.fh ||
      dom_.questionnaire.labellingGraph.fh.size === 0
    ) {
      throw new Error(
        'Questions not Answered!',
        dom_.questionnaire.labellingGraph
      );
    }

    console.log('💾 Saving questionnaire. Answers:');
    return dom_.questionnaire.labellingGraph.fh;
  },
  generateAnswers(policyId = '3039', veGroup = store_.selectedVEGroup) {
    const answers = {};
    // format expected by setAnswers build-in function
    answers['3039'] = [
      {
        questionId: `violent_extremism/question/video_${policyId}_tvc/applicable_ve_group`,
        answers: [veGroup],
      },
      {
        questionId: `violent_extremism/question/video_${policyId}_tvc/act_type`,
        answers: [
          {
            id: 'glorification_terrorism',
            label: 'Glorification of terrorism or terrorist acts',
            value: {},
          },
        ],
      },
    ];

    answers['3065'] = [answers['3039'][0]];

    answers['3044'] = [
      {
        questionId:
          'violent_extremism/question/video_3044_tvc/select_applicable_violation_type',
        answers: [
          {
            id: 've_actor_based_violation',
            label: 'VE Actor based violation',
            value: {},
          },
        ],
      },
      ...answers['3039'],
    ];

    answers['3048'] = [
      {
        questionId: `violent_extremism/question/video_${policyId}_tvc/applicable_ve_group`,
        answers: [store_.selectedVEGroup],
      },
    ];

    answers['3999'] = [
      {
        questionId:
          'violent_extremism/question/video_3999_3888_tvc_fte/applicable_individual_name_beats1',
        answers: [
          {
            id: 'yevgeny_prigozhin',
            label: 'Yevgeny Prigozhin',
            value: {},
          },
        ],
      },
    ];

    return answers[policyId];
  },
};

let on_ = {
  async newVideo() {
    const { sendNotification, removeLock, setFrequentlyUsedPolicies } = utils_;
    !document.hasFocus() && sendNotification(`New item 👀`);

    setTimeout(utils_.click.myReviews, 1000);
    setFrequentlyUsedPolicies();
    removeLock();

    function initUI() {
      // transcript_.observeTranscriptMutations();
      try {
        ui_.draw();
        ui_.mutations.moveChannelLink();
        ui_.showTimers();

        if (store_.is.queue('bluechip')) {
          let queueNameHeader = getElement('.review-dimension-info')[0];
          queueNameHeader.style.color = 'darkred';
        }

        // EXPERIMENTAL
        // ui_.mutations.cinemaMode();
      } catch (e) {
        console.log(e);
        throw new Error('initUI');
      }
    }

    await lib_.retry(initUI, 1000, 10000);
  },
};

function $main() {
  // Event Listeners & Notifications
  dom_.strikePanel = ui_.components.actionPanel;
  dom_.autosubmitSwitch = ui_.atoms.switch('🢅', 'autosubmit-switch');
  dom_.strikePanel.style.position = 'absolute';
  dom_.strikePanel.style.display = 'none';
  dom_.strikePanel.style.opacity = store_.opacity;
  dom_.strikePanel.style.zIndex = '1000';

  window.addEventListener('message', function (event) {
    const { sendNotification } = utils_;
    const notFocused = () => !document.hasFocus();

    // New video, send notification if not focused
    if (event.data.name === 'HOST_ALLOCATED') {
      on_.newVideo();
    }

    // Submitted video, send notification
    if (event.data.name === 'APP_REVIEW_COMPLETED' && notFocused()) {
      sendNotification(
        `✅ Submitted at ${new Date().toJSON().split('T')[1].slice(0, 8)}`
      );

      // removeLock();
    }
  });

  // keypresses
  document.addEventListener('keydown', (event) => {
    if (event.key === '`') {
      try {
        dom_.videoDecisionPanel.onSubmit();
      } catch (e) {
        console.log('Could not submit via keypress');
      }
    }
  });

  document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
    dom_.strikePanel.style.display = 'block';
    dom_.strikePanel.style.left = event.clientX + 'px';
    dom_.strikePanel.style.top = event.clientY + 'px';
  });

  document.addEventListener('click', function () {
    dom_.strikePanel.style.display = 'none';
  });

  // init
  on_.newVideo();

  // multiple tabs
  getElement('.stopwatch')?.[0].addEventListener('contextmenu', (e) => {
    if (e.ctrlKey) {
      history.pushState({}, '', '#yort');
      window.open('https://yurt.corp.google.com/#review');
    }
  });
}

const dummyData = {
  // APP_REVIEW_COMPLETED
  'event.data': {
    name: 'APP_REVIEW_COMPLETED',
    message: {
      sessionId: 'yn87g2xo7d3o',
      result: {
        type: 'COMPLETE',
        payload: {
          applyPolicy: {
            policyOutputs: [
              {
                entityId: {
                  externalVideoId: 'SyZVvekevxk',
                },
                policyId: '3065',
                primary: true,
                reviewerNote:
                  'Violation: Wagner PMC depictive content with upbeat music without 4C EDSA or criticism at @0:00:04\nRussian (not agnostic) ',
                policyDescription:
                  'Content produced by or glorifying known Violent Extremist Organizations',
                dynamicParameters: {
                  passthroughPolicyParameters: {},
                },
                language: 'ru',
                videoReviewInfo: {
                  seekTimeMs: '4044',
                },
              },
            ],
          },
          graphOutputs: [],
        },
      },
      entityId: {
        externalVideoId: 'SyZVvekevxk',
      },
    },
  },
  strikeSummary: {
    strikeSummary: {
      totalStrikeCount: 1,
      activeStrikeCount: 1,
      activeWarningStrikeCount: 1,
    },
    channelStrikeTable: {
      rows: [
        {
          status: 'ACTIVE',
          strikeFlagAndType: {
            flag: 'WARNING',
            strikeType: 'UNIFIED',
          },
          createTime: '2023-06-24T13:59:29Z',
          acknowledgeTime: '2023-06-25T20:57:11Z',
          expirationTime: '1970-01-01T00:00:00Z',
          channelPolicyTrainingSession: {
            trainingCompletionTime: '2023-06-24T13:59:29Z',
          },
          strikeEntity: {
            entityType: 'VIDEO',
            entity: {
              video: {
                externalVideoId: 'sTxvhD_q9ZE',
                videoTitle: 'Срочно! ПРИГОЖИН взял ШТАБ в Ростове',
              },
            },
            policyDescription:
              'Video produced by or glorifying known Violent Extremist group/actor',
            policyId: 3039,
            createTime: '2023-06-24T06:23:27Z',
            channelTouStrikeId: '184884119',
          },
        },
      ],
    },
  },
};

$main();
// [✅] radu pidar
