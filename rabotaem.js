// 19.09.2023

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
      rootElement.querySelectorAll(queryselector)[0]
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

let remoteController = {
  addNote(noteStr) {
    let decisionCard = getElement('yurt-core-decision-policy-card')[0];
    decisionCard.annotation.notes = noteStr;
  },
  startReview() {
    getElement('#start-review-button')?.[0]?.click();
  },
  release() {
    getElement('.release')?.[0].click();
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
  applicableVEgroup: {
    id: '',
    label: '',
  },
  selectedVEGroup: '',
  opacity: '0.8',
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
    osama: 'osama_bin_laden',
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
  },
  wordsByCategory: {
    ve: [
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
    ],
    hate: [
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
      return getElement('.autosubmit-switch')[0].checked;
    },
    readyForSubmit() {
      return getElement('yurt-core-decision-submit-panel')?.[0]?.readyForSubmit;
    },
    queue(qName) {
      return utils_.get.queue.name()?.includes(qName.toLowerCase());
    },
    get routing() {
      return dom_.videoDecisionPanel.viewMode === 1;
    },
  },
  frequentlyUsedPolicies: [
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
      id: '3065',
      description:
        'Content produced by or glorifying known Violent Extremist Organizations',
      tags: ['ISIS', 'Al-Qaeda', 'gaming', 'song', 'VE group', 'violence'],
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
      id: '6120',
      description:
        'Perpetrator-filmed footage where weapons, injured bodies, or violence is in frame or heard in audio uploaded on or after 6/15/2020',
      tags: ['perpetrator-filmed', 'violent extremism', 'weapon'],
      policyVertical: 'VIOLENT_EXTREMISM',
      actionCategorySummary: 'ACTION_REMOVE',
    },
    {
      id: '9008',
      description: 'Approve',
      tags: ['approve'],
      policyVertical: 'APPROVE',
      actionCategorySummary: 'ACTION_APPROVE',
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
          `Please check nasheed ${utils_.get.noteTimestamp}\nRussian part is approve`,
      },
      {
        title: 'Religious',
        value: () =>
          `Russian part is approve, religious content ${utils_.get.noteTimestamp}\nPlease action for Arabic`,
      },
      {
        title: 'Arabic Part',
        value: () =>
          `Please check Arabic part ${utils_.get.noteTimestamp}\nRussian part is approve`,
      },
    ],
    drugs: [
      {
        title: 'Drugs policy',
        value: () =>
          `please check for drugs ${utils_.get.noteTimestamp}\napprove for VE`,
      },
      {
        title: 'Illegal Sales',
        value: () =>
          `please check for illegal sales ${utils_.get.noteTimestamp}\napprove for VE`,
      },
      {
        title: 'Gambling',
        value: () =>
          `please check for gambling policy violations ${utils_.get.noteTimestamp}\napprove for VE`,
      },
    ],
    gv: [
      {
        title: 'MOD',
        value: () =>
          `please check for MOD ${utils_.get.noteTimestamp}\napprove for VE`,
      },
      {
        title: 'GV',
        value: () =>
          `please check for GV ${utils_.get.noteTimestamp}\napprove for VE`,
      },
    ],
    adult: [
      {
        title: 'Vulgar language',
        value: () =>
          `please check for excessive use of vulgar language ${utils_.get.noteTimestamp}\napprove for VE`,
      },
      {
        title: 'Nudity',
        value: () =>
          `please check for nudity ${utils_.get.noteTimestamp}\napprove for VE`,
      },
      {
        title: 'Sexual act',
        value: () =>
          `please check for implied sexual act ${utils_.get.noteTimestamp}\napprove for VE`,
      },
      {
        title: 'Adult',
        value: () =>
          `please check for adult violations ${utils_.get.noteTimestamp}\napprove for VE`,
      },
    ],
    spam: [
      {
        title: 'Spam',
        value: () =>
          `please check for intent to drive traffic off-site ${utils_.get.noteTimestamp}\napprove for VE`,
      },
      {
        title: 'Spam (link)',
        value: () =>
          `please check for intent to drive traffic off-site (link in comments)\napprove for VE`,
      },
    ],
    hd: [
      {
        title: 'Dangerous Pranks',
        value: () =>
          `please check for dangerous pranks ${utils_.get.noteTimestamp}\napprove for VE`,
      },
      {
        title: 'Gambling',
        value: () =>
          `please check for gambling ${utils_.get.noteTimestamp}\napprove for VE`,
      },
      {
        title: 'H&D violation',
        value: () =>
          `please check for H&D acts ${utils_.get.noteTimestamp}\napprove for VE`,
      },
    ],
    haras: [
      {
        title: 'Doxxing',
        value: () =>
          `please check for doxxing ${utils_.get.noteTimestamp}\napprove for VE`,
      },
    ],
    ds: [
      {
        title: 'Terms of Service',
        value: () =>
          `please check for TOS violations ${utils_.get.noteTimestamp}\napprove for VE`,
      },
    ],
    cs: [
      {
        title: 'Minors Sex',
        value: () =>
          `please check for minors sexualization ${utils_.get.noteTimestamp}\napprove for VE`,
      },
    ],
    hate: [
      {
        title: 'Slur',
        value: () =>
          `please check for slur ${utils_.get.noteTimestamp}\napprove for VE`,
      },
      {
        title: '{ Slur }',
        value: () =>
          `please check for slur ${(() => {
            const highlightedWord = getElement('.current-transcript')?.[0]
              .textContent;

            return highlightedWord ? highlightedWord : '';
          })()} ${utils_.get.noteTimestamp}\napprove for VE`,
      },
      {
        title: 'Hate',
        value: () =>
          `please check for hate policy violations ${utils_.get.noteTimestamp}\napprove for VE`,
      },
      {
        title: '🇺🇦 🐖 Dehuman',
        value: () =>
          `please check for Ukrainian pig dehumanization ${utils_.get.noteTimestamp}\napprove for VE`,
      },
      {
        title: '🇺🇦 Denazi',
        value: () =>
          `please check for Denazification of Ukraine ${utils_.get.noteTimestamp}\napprove for VE`,
      },
      {
        title: 'Podolyak',
        value: () =>
          `please check for Yury Podolyak circumvention ${utils_.get.noteTimestamp}\napprove for VE`,
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
          `${store_.selectedVEGroup.text} depictive content >50% of video without 4C EDSA or criticism ${utils_.get.noteTimestamp}\nRussian (not agnostic)`,
      },
      {
        title: '[3065] Upbeat Music',
        value: () =>
          `${store_.selectedVEGroup.text} depictive content with upbeat music without 4C EDSA or criticism ${utils_.get.noteTimestamp}\nRussian (not agnostic)`,
      },
      {
        title: '[3065] >2x',
        value: () =>
          `${store_.selectedVEGroup.text} produced content used 2x or more, without 4C EDSA or criticism ${utils_.get.noteTimestamp}\nRussian (not agnostic)`,
      },
      {
        title: '[3065] Glorifying Lyrics',
        value: () =>
          `${store_.selectedVEGroup.text} glorifying lyrics without 4C EDSA or criticism ${utils_.get.noteTimestamp}\nRussian (not agnostic)`,
      },
      {
        title: '[3065] Produced Song',
        value: () =>
          `${store_.selectedVEGroup.text} produced song without 4C EDSA or criticism ${utils_.get.noteTimestamp}\nRussian (not agnostic)`,
      },
    ],
    3039: [
      {
        title: '[3039] Raw reupload',
        value: () =>
          `${store_.selectedVEGroup.text} raw re-upload without criticism or 4C EDSA ${utils_.get.noteTimestamp}\nChannel not dedicated\nRussian (not agnostic)`,
      },
      {
        title: '[3039] Glorification',
        value: () =>
          `Glorification of ${store_.selectedVEGroup.text} ${utils_.get.noteTimestamp}\nChannel not dedicated\nRussian (not agnostic)`,
      },
      {
        title: '[3039] Glorifying Lyrics',
        value: () =>
          `${store_.selectedVEGroup.text} glorifying lyrics ${utils_.get.noteTimestamp}\nChannel not dedicated\nRussian (not agnostic)`,
      },

      {
        title: '[3039] Produced Song',
        value: () =>
          `${store_.selectedVEGroup.text} produced song ${utils_.get.noteTimestamp}\nChannel not dedicated\nRussian (not agnostic)`,
      },
      {
        title: '[3039] Memorial',
        value: () =>
          `${store_.selectedVEGroup.text} memorial video ${utils_.get.noteTimestamp}\nChannel not dedicated\nRussian (not agnostic)`,
      },
    ],
    3044: [
      {
        title: '[3044] Raw reupload',
        value: () =>
          `${store_.selectedVEGroup.text} raw re-upload without criticism or 4C EDSA ${utils_.get.noteTimestamp}\nChannel dedicated\n• _________\n• _________\nRussian (not agnostic)`,
      },
      {
        title: '[3044] Glorification',
        value: () =>
          `Glorification of ${store_.selectedVEGroup.text} ${utils_.get.noteTimestamp}\nChannel dedicated\n• _________\n• _________\nRussian (not agnostic)`,
      },
      {
        title: '[3044] Glorifying Lyrics',
        value: () =>
          `${store_.selectedVEGroup.text} glorifying lyrics ${utils_.get.noteTimestamp}\nChannel dedicated\n• _________\n• _________\nRussian (not agnostic)`,
      },
      {
        title: '[3044][1] Raw reupload',
        value: () =>
          `${store_.selectedVEGroup.text} raw re-upload without criticism or 4C EDSA ${utils_.get.noteTimestamp}\nChannel dedicated (single video on channel)\nRussian (not agnostic)`,
      },
      {
        title: '[3044][1] Glorification',
        value: () =>
          `Glorification of ${store_.selectedVEGroup.text} ${utils_.get.noteTimestamp}\nChannel dedicated (single video on channel)\nRussian (not agnostic)`,
      },
      {
        title: '[3044][1] Glorifying Lyrics',
        value: () =>
          `${store_.selectedVEGroup.text} glorifying lyrics ${utils_.get.noteTimestamp}\nChannel dedicated (single video on channel)\nRussian (not agnostic)`,
      },
    ],
    3999: [
      {
        title: '[3999] Prigozhin',
        value: () =>
          `Yevgeny Prigozhin footage without 4C EDSA or criticism ${utils_.get.noteTimestamp}\nRussian (not agnostic)`,
      },
    ],
    5013: [
      {
        title: '[5013] Raw reupload',
        value: () =>
          `${store_.selectedVEGroup.text} raw re-upload without criticism or 4C EDSA ${utils_.get.noteTimestamp}\n5013 PIA\nRussian (not agnostic)`,
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
        let filterKey = Object.keys(args)[0];
        let filterValue = Object.values(args)[0];

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
        getElement('yurt-review-root')[0].hostAllocatedMessage.reviewData;
      return reviewData.commentReviewData.commentThread.requestedComment
        .commentText;
    },
    get noteTimestamp() {
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
          vl.split(':')[0] < 10 ? '0' + vl.split(':')[0] : vl.split(':')[0];
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
    videoId() {
      return utils_.get.queue.info().entityID;
    },
    get videoTimestamp() {
      let videoRoot = getElement('yurt-video-root')[0];

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
            Object.keys(reviewRoot.hostAllocatedMessage.yurtEntityId)[0]
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
  async getChannelVideos(id) {
    const url = `https://yurt.corp.google.com/_/backends/account/v1/videos:fetch?alt=json&key=${yt.config_.YURT_API_KEY}`;

    const channelId =
      id ??
      dom_.reviewRoot.hostAllocatedMessage.reviewData.videoReviewData
        .videoReviewMetadata.externalChannelId;

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

  setTimer(minutes, endReview = store_.is.autosubmit) {
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
  showNotes() {
    // remove old notes
    const existingNotes = getElement('#recommendation-notes')?.[0];

    if (existingNotes) {
      existingNotes.parentNode.removeChild(existingNotes);
    }

    const isRouting = store_.is.routing;
    let notesArr = isRouting
      ? []
      : recommendationNotes.strike[utils_.get.selectedPolicyId];

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
    let videoRoot = getElement('yurt-video-root')[0];
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
  async retry(fn, interval = 200, totalDuration = 3000) {
    const startTime = Date.now();
    let endTime = startTime + totalDuration;

    while (Date.now() < endTime) {
      try {
        const result = await fn();
        console.log(`✅ ${fn?.name}() ${result ?? ''}`);
        return result;
      } catch (error) {
        console.log(`[ℹ] ${fn?.name}:`, error.message);
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
        dom_.videoDecisionPanel.viewMode = 2;
        return dom_.videoDecisionPanel.viewMode === 2;
      },
      selectPolicy(policyId) {
        let foundPolicy = [
          ...(getElement('yurt-core-policy-selector-item') ?? []),
        ]?.filter((policyItem) => policyItem?.policy?.id === policyId)?.[0];

        if (!foundPolicy) {
          //console.log('[recursion] looking for 9008 tag');
          // FIX
          setTimeout(
            () => action_.video.steps.selectPolicy(policyId),
            config_.FUNCTION_CALL_RETRY_MS
          );
          return;
        }

        //console.log('approvePolicyTag');
        foundPolicy?.click();
      },
      selectLanguage(language) {
        let langOptions = Array.from(
          getElement('#decision-panel-language-select > mwc-list-item')
        );

        const foundLanguageOption = langOptions.filter(
          (option) => option.value.toLowerCase() === language.toLowerCase()
        )[0];

        foundLanguageOption.click();
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
        link = getElement('.mdc-text-field__input')[0];

        //console.log('text area');
        link && link.select();
      },
    },
    addNote(noteStr) {
      let decisionCard = getElement('yurt-core-decision-policy-card')[0];
      decisionCard.annotation.notes = noteStr;
    },
    // actual complete actions
    async approve(language) {
      const { retry } = lib_;

      dom_.videoDecisionPanel.viewMode = 2;
      if (language)
        await lib_.retry(function selectLanguage() {
          action_.video.steps.selectLanguage(language);
        });

      action_.video.steps.selectPolicy('9008');

      function approveQuestionnaire() {
        questionnaire_.setAnswers(questionnaire_.answersByPolicy['9008']);
      }

      if (store_.is.queue('metrics')) {
        setTimeout(() => dom_.videoDecisionPanel.onSave(), 500);
        console.log('saving in 0.5s');
      } else {
        await retry(approveQuestionnaire);
        await retry(function saveReviewShowTimers() {
          dom_.videoDecisionPanel.onSave();
        });
      }

      if (store_.is.autosubmit) {
        await retry(function submitVideo() {
          dom_.videoDecisionPanel.onSubmit();
        });
        return true;
      }

      setTimeout(ui_.showTimers, 1);

      // langAndSave();
    },
    async strike(policyId = '3039', contentType = 'video') {
      store_.selectedVEGroup = utils_.get.selectedVEGroup;
      const { expandNotesArea } = ui_.mutations;
      const { answersByPolicy, setAnswers } = questionnaire_;
      const {
        selectLanguage: selectLanguageDropdrown,
        selectPolicy,
        addReview,
      } = action_.video.steps;

      addReview();
      selectPolicy(policyId);
      store_.selectedVEGroup.text === 'Wagner PMC' &&
        (await lib_.retry(selectLanguage));

      function answerQuestionnaireAndSave() {
        const selectedPolicyId = policyId === '3044' ? '3039' : policyId;
        setAnswers(answersByPolicy[selectedPolicyId][contentType]);
      }

      function selectLanguage() {
        selectLanguageDropdrown('russian');
      }

      await lib_.retry(answerQuestionnaireAndSave, 800, 4000);
      utils_.showNotes();
      expandNotesArea();

      setTimeout(ui_.showTimers, 1);
    },
    route(queue, noteType, reason = 'policy vertical') {
      // TODO
      // let { queue, noteType, reason } = routeOptions;

      // helper functions
      function clickRoute() {
        dom_.videoDecisionPanel.viewMode = 1;
        return dom_.videoDecisionPanel.viewMode === 1;
      }

      function $selectTarget(queue, reason) {
        const { listItemByInnerText } = utils_.click;

        listItemByInnerText(...queue.split(' '));
        listItemByInnerText(reason);
      }

      function selectTextArea() {
        let textArea = getElement('.mdc-text-field__input')[0];
        textArea.select();
      }

      // actual routing process

      clickRoute();
      // show recommendations for routing to target queue
      setTimeout(() => {
        $selectTarget(queue, reason);
        selectTextArea();
        ui_.mutate();
        ui_.showTimers();
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
        })[0];

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
          })[0];
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
      )[0];

      approvePolicy.click();
    },
    routeComment: (targetQueue) => {
      // TODO?
      let routeTargetsArr = Array.from(getElement('mwc-list-item'));
      let hate = routeTargetsArr.filter(
        (target) =>
          target.innerHTML.includes('Hate') &&
          target.innerHTML.includes('English')
      )[0];
      let xlang = routeTargetsArr.filter((target) =>
        target.innerHTML.includes('Xlang')
      )[0];
      let policyVertical = routeTargetsArr.filter((target) =>
        target.innerHTML.includes('policy vertical')
      )[0];
      let routeBtn = getElement('.submit')[0];
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
  dropdown: {
    approve: {},
    route: {},
    strike: {
      label: 'Select VE Group',
      value: 'strike_ve_group_dropdown',
      options: [
        { value: store_.veGroups.wagner, label: 'Wagner PMC' },
        { value: store_.veGroups.alq, label: 'Al Qaeda' },
        { value: store_.veGroups.ik, label: 'Imarat Kavkaz' },
        { value: store_.veGroups.isis, label: 'ISIS' },
        { value: store_.veGroups.hamas, label: 'Hamas' },
        { value: store_.veGroups.hezbollah, label: 'Hezbollah' },
        { value: store_.veGroups.ira, label: 'IRA' },
        { value: store_.veGroups.lte, label: 'LTTE' },
        { value: store_.veGroups.unknown, label: 'UNKNOWN' },
        { value: store_.veGroups.vnsa, label: 'VNSA' },
      ],
    },
  },
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
    strike: [
      {
        text: '3065 :: Produced Content 📽',
        onClick: () => action_.video.strike('3065', 'video'),
      },
      {
        text: '3065 :: Song 🎻',
        onClick: () => action_.video.strike('3065', 'song'),
      },
      {
        text: '3065 :: Speech 🎤',
        onClick: () => action_.video.strike('3065', 'speech'),
      },

      {
        text: '3039 :: Produced Content 📽',
        onClick: () => action_.video.strike('3039', 'video'),
      },
      {
        text: '3039 :: Song 🎻',
        onClick: () => action_.video.strike('3039', 'song'),
      },
      {
        text: '3039 :: Speech 🎤',
        onClick: () => action_.video.strike('3039', 'speech'),
      },

      {
        text: '3044 :: Produced Content 📽',
        onClick: () => action_.video.strike('3044', 'video'),
      },
      {
        text: '3044 :: Song 🎻',
        onClick: () => action_.video.strike('3044', 'song'),
      },
      {
        text: '3044 :: Speech 🎤',
        onClick: () => action_.video.strike('3044', 'speech'),
      },
    ],
    route: [
      {
        text: '🇸🇦 Arabic',
        onClick: () =>
          action_.video.route(
            `ve ${utils_.get.queue.type() ?? ''} arabic`,
            'arabic',
            'routing for language'
          ),
      },
      {
        text: '💉💲 Drugs',
        onClick: () =>
          action_.video.route(`drugs ${utils_.get.queue.type()}`, 'drugs'),
      },
      {
        text: '🧨 H&D ',
        onClick: () => action_.video.route('Harmful Dangerous Acts', 'hd'),
      },
      {
        text: '🥩 Graphic',
        onClick: () =>
          action_.video.route(`graphic violence enforcement`, 'gv'),
      },
      {
        text: '⚡ Hate',
        onClick: () => action_.video.route('hate russian', 'hate'),
      },
      {
        text: '🏹 Harass',
        onClick: () =>
          action_.video.route(
            `harassment ${utils_.get.queue.type()} russian`,
            'harass'
          ),
      },
      {
        text: '🔞 Adult',
        onClick: () => action_.video.route('adult', 'adult'),
      },
      { text: '📬 SPAM', onClick: () => action_.video.route('spam', 'spam') },
      {
        text: '💽 DS',
        onClick: () => action_.video.route('digital security video', 'ds'),
      },
      {
        text: '🧒 Child',
        onClick: () => action_.video.route('child minors', 'cs'),
      },
      {
        text: '🗞 Misinfo',
        onClick: () => action_.video.route('misinfo'),
      },
      {
        text: '🔐 T2/FTE',
        onClick: () =>
          action_.video.route(
            store_.is.queue('t2') ? 'fte' : 't2',
            't2',
            'protections'
          ),
      },
    ],
    comments: [
      {
        text: 'Al Qaeda',
        onClick: () =>
          action_.comment.strikeComment('alq', config_.COMMENTS_TIMER_MIN),
      },
      {
        text: ' BLA',
        onClick: () =>
          action_.comment.strikeComment('bla', config_.COMMENTS_TIMER_MIN),
      },
      {
        text: '🇵🇸 Hamas',
        onClick: () =>
          action_.comment.strikeComment('hamas', config_.COMMENTS_TIMER_MIN),
      },
      {
        text: '🇱🇧 Hezbollah',
        onClick: () =>
          action_.comment.strikeComment(
            'hezbollah',
            config_.COMMENTS_TIMER_MIN
          ),
      },
      {
        text: '🇮🇪 IRA',
        onClick: () =>
          action_.comment.strikeComment('ira', config_.COMMENTS_TIMER_MIN),
      },
      {
        text: '🏴‍☠ ISIS',
        onClick: () =>
          action_.comment.strikeComment('isis', config_.COMMENTS_TIMER_MIN),
      },
      {
        text: '🇱🇰 LTTE',
        onClick: () =>
          action_.comment.strikeComment('lte', config_.COMMENTS_TIMER_MIN),
      },
      {
        text: '🟥 PKK',
        onClick: () =>
          action_.comment.strikeComment('pkk', config_.COMMENTS_TIMER_MIN),
      },
      {
        text: '🇵🇰 TTP',
        onClick: () =>
          action_.comment.strikeComment('taliban', config_.COMMENTS_TIMER_MIN),
      },
      {
        text: ' VNSA',
        onClick: () =>
          action_.comment.strikeComment('vnsa', config_.COMMENTS_TIMER_MIN),
      },
      {
        text: 'OSAMA',
        onClick: () =>
          action_.comment.strikeComment(
            'osama',
            config_.COMMENTS_TIMER_MIN,
            'gdp_speaker_type'
          ),
      },
      {
        text: 'Unknown',
        onClick: () =>
          action_.comment.strikeComment('unknown', config_.COMMENTS_TIMER_MIN),
      },
      {
        text: '❔ Custom',
        onClick: () =>
          action_.comment.strikeComment('', config_.COMMENTS_TIMER_MIN),
      },
      {
        text: 'Custom GDP',
        onClick: () =>
          action_.comment.strikeComment(
            '',
            config_.COMMENTS_TIMER_MIN,
            'isGDP'
          ),
      },
      { text: '⏭ Hate', onClick: () => action_.video.route('hate') },
      { text: 'X L A N G', onClick: () => action_.video.route('xlang') },
    ],
    timers: [
      {
        text: '1',
        onClick: () => utils_.setTimer(1, store_.is.autosubmit),
      },
      {
        text: '2',
        onClick: () => utils_.setTimer(2, store_.is.autosubmit),
      },
      {
        text: '3',
        onClick: () => utils_.setTimer(3, store_.is.autosubmit),
      },
      {
        text: '4',
        onClick: () => utils_.setTimer(4, store_.is.autosubmit),
      },
      {
        text: '5',
        onClick: () => utils_.setTimer(5, store_.is.autosubmit),
      },
      {
        text: '10',
        onClick: () => utils_.setTimer(10, store_.is.autosubmit),
      },
    ],
  },
  dropdownList: {
    9008: {
      label: '9008',
      children: [
        { key: '🇷🇺 RU', onClick: () => action_.video.approve('russian') },
        { key: '🇺🇦 UA', onClick: () => action_.video.approve('ukrainian') },
        { key: '🇬🇧 ENG', onClick: () => action_.video.approve('english') },
        {
          key: '❔ AGN',
          onClick: () => action_.video.approve('Language agnostic'),
        },
        { key: '🔳 N/A', onClick: () => action_.video.approve() },
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
          key: '💉💲 Drugs',
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
          key: '🏹 Harass',
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
        { key: '📬 SPAM', onClick: () => action_.video.route('spam', 'spam') },
        {
          key: '💽 DS',
          onClick: () => action_.video.route('digital security video', 'ds'),
        },
        {
          key: '🧒 Child',
          onClick: () => action_.video.route('child minors', 'cs'),
        },
        {
          key: '🗞 Misinfo',
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
    3065: {
      label: '3065',
      children: [
        {
          key: '📽 Video',
          value: 'video',
          onClick: () => action_.video.strike('3065', 'video'),
        },
        {
          key: '🎻 Song',
          value: 'song',
          onClick: () => action_.video.strike('3065', 'song'),
        },
        {
          key: '🎤 Speech',
          value: 'speech',
          onClick: () => action_.video.strike('3065', 'speech'),
        },
        {
          key: '📎 Metadata',
          value: 'metadata',
          onClick: () => action_.video.strike('3065', 'metadata'),
        },
      ],
    },
    3039: {
      label: '3039',
      children: [
        {
          key: '📽 Video',
          value: 'video',
          onClick: () => action_.video.strike('3039', 'video'),
        },
        {
          key: '🎻 Song',
          value: 'song',
          onClick: () => action_.video.strike('3039', 'song'),
        },
        {
          key: '🎤 Speech',
          value: 'speech',
          onClick: () => action_.video.strike('3039', 'speech'),
        },
        {
          key: '📎 Metadata',
          value: 'metadata',
          onClick: () => action_.video.strike('3039', 'metadata'),
        },
      ],
    },
    3044: {
      label: '3044',
      children: [
        {
          key: '📽 Video',
          value: 'video',
          onClick: () => action_.video.strike('3044', 'video'),
        },
        {
          key: '🎻 Song',
          value: 'song',
          onClick: () => action_.video.strike('3044', 'song'),
        },
        {
          key: '🎤 Speech',
          value: 'speech',
          onClick: () => action_.video.strike('3044', 'speech'),
        },
        {
          key: '📎 Metadata',
          value: 'metadata',
          onClick: () => action_.video.strike('3044', 'metadata'),
        },
      ],
    },
  },
};

let dom_ = {
  get filterControlsPanel() {
    return getElement('.filter-controls-on')?.[0];
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
      ? getElement('tcs-text[spec=title-2]')?.[0]?.shadowRoot
      : getElement('yurt-core-plugin-header > div > tcs-view')?.[0];
  },
  get metadataPanel() {
    return getElement('yurt-video-metadata-video')?.[0]?.shadowRoot;
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
      transcriptContainer = getElement('.transcript-container')[0];
    } catch (e) {
      console.log('Could not find transcript-container');
    }
    return transcriptContainer;
  },
  get videoPlayer() {
    try {
      let videoPlayer = getElement('yurt-video-root')[0].playerApi;
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
        let ytpLeftControls = getElement('.ytp-left-controls')[0];
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
    let transcript = getElement('yurt-video-transcript')[0];

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

    return result;
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
};

transcript_.throttledFilter = lib_._throttle(
  transcript_.filterTranscriptByCategory,
  1000
);
transcript_.debouncedFilter = lib_._debounce(
  transcript_.filterTranscriptByCategory,
  1000
);

let ui_ = {
  draw() {
    try {
      // stopwatch in header
      // !getElement('.stopwatch') &&
      //   dom_.header.appendChild(ui_.components.stopwatchPanel.stopwatch);

      // panel with policies
      if (!getElement('.action-panel')) {
        dom_.metadataPanel.appendChild(dom_.strikePanel);
      }
      // autosubmit switch
      if (!getElement('.autosubmit-switch'))
        dom_.metadataPanel.appendChild(dom_.autosubmitSwitch);

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
    } catch (e) {
      throw new Error('Could not draw UI', e);
    }
  },
  mutate() {
    const { expandTranscriptContainer } = ui_.mutations;

    expandTranscriptContainer();
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
    const { label, children } = props;

    const parentList =
      strToNode(`<mwc-list><mwc-list-item hasmeta="" value="video" mwc-list-item="" tabindex="0" aria-disabled="false">
    <!--?lit$658385021$-->
    <span class="option-label"><tcs-text>${label ?? ''}</tcs-text></span>
    <tcs-icon data-test-id="label-questionnaire-list-category-icon" slot="meta" class="category-icon" family="material" spec="default">
    <!--?lit$658385021$-->expand_more
    </tcs-icon>
    </mwc-list-item>
    </mwc-list>`);

    const childList = strToNode(`<mwc-list></mwc-list>`);
    childList.style.display = 'none';

    function toggleShowList() {
      childList.style.display === 'none'
        ? (childList.style.display = 'block')
        : (childList.style.display = 'none');
    }

    const childListItems = children.map((item) => {
      const listItem = strToNode(`<mwc-list-item value="${
        item?.value ?? ''
      }" graphic="control" aria-disabled="false">
      <span class="option-label"><tcs-text>${item?.key ?? ''}</tcs-text></span>
      </mwc-list-item>`);

      function handleClick(e) {
        e.stopPropagation();
        item.onClick();
        toggleShowList();
      }

      listItem.addEventListener('click', handleClick);

      return listItem;
    });

    childList.replaceChildren(...childListItems);

    parentList.appendChild(childList);
    parentList.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleShowList();
    });
    return parentList;
  },
  typography(str) {
    const textElement = ui_.strToNode(
      `<tcs-text spec="body" >${str}</tcs-text>`
    );
    return textElement;
  },
  strToNode(str) {
    const tmp = document.createElement('div');
    tmp.innerHTML = str;
    if (tmp.childNodes.length < 2) {
      return tmp.childNodes[0];
    }
    return tmp.childNodes;
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
      `<div style="opacity: 0; transition: opacity 500ms;" class="violative-words-container"></div>`
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

    setTimeout(checkForLewd, 3000);

    return container;
  },

  showTimers() {
    const { setTimer, strToNode } = utils_;
    let mwcMenu = getElement('.share-menu')[0];

    if (!mwcMenu)
      throw new Error('Nowhere to append buttons (mwcMenu not rendered)');

    const timersArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((timerMin) =>
      ui_.createButton(timerMin, () => {
        setTimer(timerMin, store_.is.autosubmit);
        timersWrapper.remove();
      })
    );

    const timersWrapper = strToNode(
      `<div style="display: grid; grid-template-columns: 1fr 1fr 1fr;"></div>`
    );
    const autoreloadCheckbox = strToNode(
      `<mwc-checkbox value="autoreload-page"></mwc-checkbox>`
    );

    timersWrapper.replaceChildren(...[...timersArr, autoreloadCheckbox]);
    mwcMenu.replaceChildren(...[...mwcMenu.children, timersWrapper]);
    // stopwatch.parentNode.appendChild(timersWrapper);
  },

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
  },

  components: {
    // Ready UI Components
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

      const container = strToNode(`<div class="${tableId}-container"></div>`);

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
    get approvePanel() {
      const { strToNode: $ } = utils_;
      let wrapperDiv = $(
        `<div class="action-panel" style="display: grid; grid-template-columns: repeat(2, 2fr)"></div>`
      );

      let routeDiv = $(
        `<div style="display:grid; grid-template-columns: 1fr 1fr 1fr;" class="action-panel__route"></div>`
      );
      let approveDiv = $(`<div class="action-panel__action"></div>`);

      [routeDiv, approveDiv].forEach((div) => {
        div.style.display = 'flex';
        div.style.flexDirection = 'column';
      });

      approveDiv.replaceChildren(...this.btns.approve);
      routeDiv.replaceChildren(...this.btns.route);

      wrapperDiv.replaceChildren(routeDiv, approveDiv);

      let element = ui_.atoms.card({ children: wrapperDiv });

      // element.style.marginTop = '300px';

      return element;
    },
    get strikePanel() {
      const {
        createDropdownMenu,
        atoms: { card: createCard, dropdown: createDropdownSelector },
        components: {
          stopwatchPanel: { stopwatch },
        },
      } = ui_;

      const container = utils_.strToNode(
        `<div class="strike-panel container"></div>`
      );

      stopwatch.style.marginBottom = '20px';

      const veGroupDropdownSelector = createDropdownSelector(
        props_.dropdown.strike
      );

      const strikeDropdownMenus = Object.keys(props_.dropdownList).map(
        (policy) => createDropdownMenu(props_.dropdownList[policy])
      );

      container.replaceChildren(
        stopwatch,
        strikeDropdownMenus[3],
        strikeDropdownMenus[4],
        strikeDropdownMenus[2],
        strikeDropdownMenus[0],
        strikeDropdownMenus[1],
        veGroupDropdownSelector
      );

      const element = createCard({
        children: container,
      });

      return element;
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

          const timersArr = [1, 2, 3, 4, 5, 10].map((timerMin) =>
            ui_.createButton(timerMin, function () {
              setTimer(timerMin, store_.is.autosubmit);
              ui_.components.stopwatchPanel.showTimers();
            })
          );

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

    get configPanel() {
      const container = ui_.strToNode(
        `<div style="display: flex;" class="config-panel"></div>`
      );

      const buttons = [
        ui_.createIconButton(
          'filter_alt',
          async () => {
            await lib_.retry(ui_.renderWordsTable);
            checkForLewd();
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
        ui_.createIconButton('note_add', utils_.showNotes, 'show-notes-btn'),
        ui_.createIconButton('delete', utils_.clearTimers, 'clear-timers-btn'),
      ];

      container.replaceChildren(...buttons);

      return container;
    },
    approveNotesPanel() {
      const container = utils_.strToNode(
        `<div class="approve-notes container"></div>`
      );

      let panel = utils_.strToNode(
        `<mwc-list>${recommendationNotes.approve
          .map(
            (note) =>
              `<mwc-list-item class="recommendation-item" graphic="avatar" value="${note.value()}"><tcs-text>${
                note.title
              }</tcs-text><mwc-icon slot="graphic">note_add</mwc-icon></mwc-list-item>`
          )
          .join('')}</mwc-list>`
      );

      // add onclicks
      [...panel.childNodes].forEach(
        (noteItem) =>
          (noteItem.onclick = () => {
            // APPROVE NOTE RECOMMENDATION
            utils_.setNote(noteItem.value);
            console.log('note', noteItem.value);
            getElement('tcs-icon-button#create')?.[0]?.click();
            utils_.clickSave();
          })
      );

      container.appendChild(panel);

      return {
        element: container,
        render() {
          if (getElement('.approve-notes')) return;
          utils_.appendNode(container);
        },
      };
    },
    recommendationPanel({ notesArr }) {
      // TODO comments recommendations
      if (store_.is.queue('comments')) return;

      let recommendationList = utils_.strToNode(
        `<mwc-list id="recommendation-notes" style="margin: 30px 0px; opacity: 0; transition: opacity 500ms;">${notesArr
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
          const parent =
            getElement('yurt-core-decision-route')?.[0]?.shadowRoot ||
            getElement('yurt-core-decision-annotation-edit')?.[0]?.shadowRoot;

          parent.appendChild(recommendationList);
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
    get actionPanel() {
      const { approvePanel, strikePanel } = this;

      let container = utils_.strToNode(
        `<div class="action-panel" style="display: flex; flex-direction: column; justify-content: start; gap: 1rem; padding: 3rem 0 10rem 0;"></div>`
      );

      const elemsArr = [
        // approvePanel,
        strikePanel,
        // approveNotesPanel,
      ];

      container.replaceChildren(...elemsArr);

      return container;
    },
  },
  create: {},

  mutations: {
    expandTranscriptContainer() {
      try {
        let videoContextContainer = getElement('.video-context-section')?.[0];
        let videoContextPanel = getElement('yurt-video-context-panel')?.[0];
        let transcriptContainer = getElement(
          '.transcript-container.transcript-container-auto-scroll-disable-fab-padding'
        )[0];

        [videoContextContainer, videoContextPanel].forEach((elem) => {
          elem.style.height = '700px';
          elem.style.width = '700px';
        });

        transcriptContainer.style.height = '600px';
      } catch (e) {
        console.log(e);
      }
    },
    expandNotesArea(rows = 12, actionType = 'route') {
      let notesTextArea;
      notesTextArea = actionType = 'route'
        ? getElement('.mdc-text-field__input')?.[0]
        : getElement(
            'mwc-textarea[data-test-id=core-decision-policy-edit-notes]'
          )?.[0];

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
  },
};

let questionnaire_ = {
  setAnswers(answers) {
    // BUG TEMPORARY FIX labellingGraph.fh
    if (!dom_.questionnaire) throw new Error('[i] Questionnaire Not Rendered');

    if (!dom_.questionnaire.labellingGraph.ih)
      throw new Error('[i] Questions not Answered!');

    // questionnaire answering logic
    answers.forEach((answer) => dom_.questionnaire.setAnswers(answer));

    if (dom_.questionnaire.labellingGraph.ih.size === 0) {
      throw new Error('Questions not Answered!');
    }

    console.log(
      '💾 Saving questionnaire. Answers:',
      dom_.questionnaire.labellingGraph.ih
    );
    dom_.questionnaire.onSave();
  },
  answersByPolicy: {
    3039: {
      song: [
        {
          questionId: 'violent_extremism/question/abuse_location',
          answers: [
            {
              id: 'audio_abusive',
              label: 'Abusive',
              parentId: 'audio',
            },
          ],
        },
        {
          questionId: 'violent_extremism/question/applicable_ve_group',
          answers: [
            {
              id: 'wagner_pmc',
              label: 'Wagner PMC - VNSA',
              value: {},
            },
          ],
        },
        {
          questionId: 'violent_extremism/question/act_type',
          answers: [
            {
              id: 'glorification_terrorism',
              label: 'Glorification of terrorism or terrorist acts',
              value: {},
            },
          ],
        },
        {
          questionId: 'violent_extremism/question/audio_features',
          answers: [
            {
              id: 'song',
              label: 'Song',
              value: {},
            },
          ],
        },
        {
          questionId: 'violent_extremism/question/audio_segment',
          answers: [
            {
              id: 'audio_time_interval',
              value: {
                timeValue: {
                  intervals: [
                    {
                      startTime: `${Math.floor(
                        dom_?.playerControls?.player?.getCurrentTime() ?? 0
                      )}s`,
                      endTime: `${Math.floor(
                        dom_?.playerControls?.player?.getDuration() ?? 0
                      )}s`,
                    },
                  ],
                },
              },
            },
          ],
        },
        {
          questionId: 'violent_extremism/question/confidence_level',
          answers: [
            {
              id: 'very_confident',
              label: 'Very confident',
              value: {},
            },
          ],
        },
      ],
      video: [
        {
          questionId: 'violent_extremism/question/abuse_location',
          answers: [
            {
              id: 'video_abusive',
              label: 'Abusive',
              parentId: 'video',
            },
          ],
        },
        {
          questionId: 'violent_extremism/question/applicable_ve_group',
          answers: [
            {
              id: 'wagner_pmc',
              label: 'Wagner PMC - VNSA',
              value: {},
            },
          ],
        },
        {
          questionId: 'violent_extremism/question/act_type',
          answers: [
            {
              id: 'glorification_terrorism',
              label: 'Glorification of terrorism or terrorist acts',
              value: {},
            },
          ],
        },
        {
          questionId: 'violent_extremism/question/video_contents',
          answers: [
            {
              id: 'other',
              label: 'Other',
            },
          ],
        },
        {
          questionId: 'violent_extremism/question/video_features',
          answers: [
            {
              id: 've_logo',
              label: 'Logo of VE actor',
              value: {},
            },
            {
              id: 'featured_person',
              label: 'Featured person',
              value: {},
            },
          ],
        },
        {
          questionId: 'violent_extremism/question/video_type',
          answers: [
            {
              id: 'single_take',
              label: 'Single take / no changes of scene',
              value: {},
            },
          ],
        },
        {
          questionId: 'violent_extremism/question/video_segment',
          answers: [
            {
              id: 'video_time_interval',
              value: {
                timeValue: {
                  intervals: [
                    {
                      startTime: `${Math.floor(
                        dom_?.playerControls?.player?.getCurrentTime() ?? 0
                      )}s`,
                      endTime: `${Math.floor(
                        dom_?.playerControls?.player?.getDuration() ?? 0
                      )}s`,
                    },
                  ],
                },
              },
            },
          ],
        },
        {
          questionId: 'violent_extremism/question/confidence_level',
          answers: [
            {
              id: 'very_confident',
              label: 'Very confident',
              value: {},
            },
          ],
        },
      ],
      speech: [
        {
          questionId: 'violent_extremism/question/abuse_location',
          answers: [
            {
              id: 'audio_abusive',
              label: 'Abusive',
              parentId: 'audio',
            },
          ],
        },
        {
          questionId: 'violent_extremism/question/applicable_ve_group',
          answers: [
            {
              id: 'wagner_pmc',
              label: 'Wagner PMC - VNSA',
              value: {},
            },
          ],
        },
        {
          questionId: 'violent_extremism/question/act_type',
          answers: [
            {
              id: 'glorification_terrorism',
              label: 'Glorification of terrorism or terrorist acts',
              value: {},
            },
          ],
        },
        {
          questionId: 'violent_extremism/question/audio_features',
          answers: [
            {
              id: 'speech',
              label: 'Speech',
              value: {},
            },
          ],
        },
        {
          questionId: 'violent_extremism/question/audio_segment',
          answers: [
            {
              id: 'audio_time_interval',
              value: {
                timeValue: {
                  intervals: [
                    {
                      startTime: `${Math.floor(
                        dom_?.playerControls?.player?.getCurrentTime() ?? 0
                      )}s`,
                      endTime: `${Math.floor(
                        dom_?.playerControls?.player?.getDuration() ?? 0
                      )}s`,
                    },
                  ],
                },
              },
            },
          ],
        },
        {
          questionId: 'violent_extremism/question/confidence_level',
          answers: [
            {
              id: 'very_confident',
              label: 'Very confident',
              value: {},
            },
          ],
        },
      ],
      metadata: [
        {
          questionId: 'violent_extremism/question/abuse_location',
          answers: [
            {
              id: 'metadata_abusive',
              label: 'Abusive',
              parentId: 'metadata',
            },
          ],
        },
        {
          questionId: 'violent_extremism/question/applicable_ve_group',
          answers: [
            {
              id: 'wagner_pmc',
              label: 'Wagner PMC - VNSA',
              value: {},
            },
          ],
        },
        {
          questionId: 'violent_extremism/question/act_type',
          answers: [
            {
              id: 'glorification_terrorism',
              label: 'Glorification of terrorism or terrorist acts',
              value: {},
            },
          ],
        },
        {
          questionId: 'violent_extremism/question/metadata_features',
          answers: [
            {
              id: 'video_title',
              label: 'Video Title',
              value: {},
            },
          ],
        },
        {
          questionId: 'violent_extremism/question/metadata_abuse_type',
          answers: [
            {
              id: 'abusive_meaning',
              label: 'Metadata has relevant/abusive meaning',
              value: {},
            },
          ],
        },
        {
          questionId: 'violent_extremism/question/confidence_level',
          answers: [
            {
              id: 'very_confident',
              label: 'Very confident',
              value: {},
            },
          ],
        },
      ],
    },
    3065: {
      song: [
        {
          questionId:
            'violent_extremism/question/video_3065_tvc/applicable_ve_group',
          answers: [
            {
              id: 'wagner_pmc',
              label: 'Wagner PMC - VNSA',
              value: {},
            },
          ],
        },
        {
          questionId: 'violent_extremism/question/video_3065_tvc/act_type',
          answers: [
            {
              id: 'glorification_terrorism',
              label: 'Glorification of terrorism or terrorist acts',
              value: {},
            },
          ],
        },
        {
          questionId:
            'violent_extremism/question/video_3065_tvc/violation_reason',
          answers: [
            {
              id: 'produced_content',
              label: 'Produced Content',
              value: {},
            },
          ],
        },
        {
          questionId:
            'violent_extremism/question/video_3065_tvc/abuse_location',
          answers: [
            {
              id: 'audio_abusive',
              label: 'Audio: Abusive',
              value: {},
            },
          ],
        },
        {
          questionId:
            'violent_extremism/question/video_3065_tvc/audio_features',
          answers: [
            {
              id: 'song',
              label: 'Song',
              value: {},
            },
          ],
        },
        {
          questionId: 'violent_extremism/question/video_3065_tvc/audio_segment',
          answers: [
            {
              id: 'time_interval',
              value: {
                timeValue: {
                  intervals: [
                    {
                      startTime: `${Math.floor(
                        dom_?.playerControls?.player?.getCurrentTime() ?? 0
                      )}s`,
                      endTime: `${Math.floor(
                        dom_?.playerControls?.player?.getDuration() ?? 0
                      )}s`,
                    },
                  ],
                },
              },
            },
          ],
        },
        {
          questionId:
            'violent_extremism/question/video_3065_tvc/confidence_level',
          answers: [
            {
              id: 'very_confident',
              label: 'Very confident',
              value: {},
            },
          ],
        },
      ],
      video: [
        {
          questionId:
            'violent_extremism/question/video_3065_tvc/applicable_ve_group',
          answers: [
            {
              id: 'wagner_pmc',
              label: 'Wagner PMC - VNSA',
              value: {},
            },
          ],
        },
        {
          questionId: 'violent_extremism/question/video_3065_tvc/act_type',
          answers: [
            {
              id: 'glorification_terrorism',
              label: 'Glorification of terrorism or terrorist acts',
              value: {},
            },
          ],
        },
        {
          questionId:
            'violent_extremism/question/video_3065_tvc/violation_reason',
          answers: [
            {
              id: 'produced_content',
              label: 'Produced Content',
              value: {},
            },
          ],
        },
        {
          questionId:
            'violent_extremism/question/video_3065_tvc/abuse_location',
          answers: [
            {
              id: 'abusive',
              label: 'Video: Abusive',
              value: {},
            },
          ],
        },
        {
          questionId:
            'violent_extremism/question/video_3065_tvc/video_features',
          answers: [
            {
              id: 've_logo',
              label: 'Logo of VE actor',
              value: {},
            },
          ],
        },
        {
          questionId: 'violent_extremism/question/video_3065_tvc/video_type',
          answers: [
            {
              id: 'compilation',
              label: 'Compliation of videos',
              value: {},
            },
          ],
        },
        {
          questionId:
            'violent_extremism/question/video_3065_tvc/video_contents',
          answers: [
            {
              id: 'other',
              label: 'Other',
              value: {},
            },
          ],
        },
        {
          questionId:
            'violent_extremism/question/video_3065_tvc/visual_segment',
          answers: [
            {
              id: 'time_interval',
              value: {
                timeValue: {
                  intervals: [
                    {
                      startTime: `${Math.floor(
                        dom_?.playerControls?.player?.getCurrentTime() ?? 0
                      )}s`,
                      endTime: `${Math.floor(
                        dom_?.playerControls?.player?.getDuration() ?? 0
                      )}s`,
                    },
                  ],
                },
              },
            },
          ],
        },
        {
          questionId:
            'violent_extremism/question/video_3065_tvc/confidence_level',
          answers: [
            {
              id: 'very_confident',
              label: 'Very confident',
              value: {},
            },
          ],
        },
      ],
      speech: [
        {
          questionId:
            'violent_extremism/question/video_3065_tvc/applicable_ve_group',
          answers: [
            {
              id: 'wagner_pmc',
              label: 'Wagner PMC - VNSA',
              value: {},
            },
          ],
        },
        {
          questionId: 'violent_extremism/question/video_3065_tvc/act_type',
          answers: [
            {
              id: 'glorification_terrorism',
              label: 'Glorification of terrorism or terrorist acts',
              value: {},
            },
          ],
        },
        {
          questionId:
            'violent_extremism/question/video_3065_tvc/violation_reason',
          answers: [
            {
              id: 'produced_content',
              label: 'Produced Content',
              value: {},
            },
          ],
        },
        {
          questionId:
            'violent_extremism/question/video_3065_tvc/abuse_location',
          answers: [
            {
              id: 'audio_abusive',
              label: 'Audio: Abusive',
              value: {},
            },
          ],
        },
        {
          questionId:
            'violent_extremism/question/video_3065_tvc/audio_features',
          answers: [
            {
              id: 'speech',
              label: 'Speech',
              value: {},
            },
          ],
        },
        {
          questionId: 'violent_extremism/question/video_3065_tvc/audio_segment',
          answers: [
            {
              id: 'time_interval',
              value: {
                timeValue: {
                  intervals: [
                    {
                      startTime: `${Math.floor(
                        dom_?.playerControls?.player?.getCurrentTime() ?? 0
                      )}s`,
                      endTime: `${Math.floor(
                        dom_?.playerControls?.player?.getDuration() ?? 0
                      )}s`,
                    },
                  ],
                },
              },
            },
          ],
        },
        {
          questionId:
            'violent_extremism/question/video_3065_tvc/confidence_level',
          answers: [
            {
              id: 'very_confident',
              label: 'Very confident',
              value: {},
            },
          ],
        },
      ],
      metadata: [],
    },
    GDP: {
      3999: [
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
        {
          questionId:
            'violent_extremism/question/video_3999_3888_tvc_fte/abuse_location',
          answers: [
            {
              id: 'audio',
              label: 'Audio',
              value: {},
            },
          ],
        },
      ],
      3888: [
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
        {
          questionId:
            'violent_extremism/question/video_3999_3888_tvc_fte/abuse_location',
          answers: [
            {
              id: 'audio',
              label: 'Audio',
              value: {},
            },
          ],
        },
      ],
    },
    9008: [
      {
        questionId:
          'violent_extremism/question/borderline_video/borderline_decision',
        answers: [
          {
            id: 'no',
            label: 'No, unrelated to VE',
          },
        ],
      },
    ],
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
      ui_.draw();
      ui_.mutate();
      ui_.showTimers();
    }

    await lib_.retry(initUI, 1000, 10000);
  },
  onScrollFilterTranscript() {
    // for testing WbpGScJMwag
    try {
      getElement('.transcript-container')[0].addEventListener('scroll', () =>
        transcript_.throttledFilter()
      );
    } catch (e) {
      console.log(e.stack);
    }
  },
};

function $main() {
  // Event Listeners & Notifications
  dom_.strikePanel = ui_.components.strikePanel;
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

  getElement('.stopwatch')?.[0].addEventListener('contextmenu', (e) => {
    if (e.ctrlKey) {
      history.pushState({}, '', '#yort');
      window.open('https://yurt.corp.google.com/#review');
    }
  });
}

function checkForLewd(
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
}

$main();

// 19.09.2023
// [✅] radu pidar
