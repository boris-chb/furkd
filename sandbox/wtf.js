try {
  $utils.clearTimers();
} catch (e) {}

function shadowDOMSearch(query) {
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

let $reviewRoot = shadowDOMSearch('yurt-review-root')?.[0];

let observers = {
  mutationObserver: new MutationObserver((mutationsList, observer) => {
    // Iterate through the mutations
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        $utils.appendNode(rightPanel);
        break;
      }
    }
  }),
  transcriptObserver: new MutationObserver((mutationsList, _) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        console.log('TRANSCRIPT CHANGED');
        break;
      }
    }
  }),
  handleTranscriptMutation(mutationsList, observer) {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        console.log('Transcript changed, filtering...');
        filterTranscriptByCategory();
        break;
      }
    }
  },
  observerOptions: { childList: true },
};

let $config = {
  SU: true,
  USE_KEYPRESS: false,
  COMMENTS_TIMER_MIN: 1,
  CLICK_BUTTON_RETRY_COUNT: 100,
  CLICK_BUTTON_INTERVAL_MS: 1,
  FUNCTION_CALL_RETRY_MS: 100,
  NOTIFICATION_TIMEOUT_SEC: 10,
  showLogs: true,
};

let $const = (() => {
  let veGroups = {
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
  };

  let newVeGroups = {
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
  };

  let selectedVEGroup;

  return {
    veGroups,
    newVeGroups,
    filterKeywords: [
      'чвк',
      'вагнер',
      'пригожин',
      'prigozhin',
      'wagner',
      'pmc',
      'арбалет',
    ],
    selectedVEGroup,
    violativeWordsByCategory: {
      ve: [
        'чувака',
        'вагнер',
        'арбалеты',
        'оркестр',
        'музыкант',
        'своб',
        'свинорез',
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
    strikeAnswers: {
      song: {
        abuse_location: {
          listItem: { value: 'audio' },
          checklist: { value: 'audio_abusive' },
        },
        applicable_ve_group: {
          value: veGroups.wagner,
        },
        act_type: { value: 'glorification_terrorism' },
        audio_features: { value: 'song' },
        audio_segment: true,
        confidence_level: { value: 'very_confident' },
      },
      speech: {
        abuse_location: {
          listItem: { value: 'audio' },
          checklist: { value: 'audio_abusive' },
        },
        applicable_ve_group: {
          value: veGroups.wagner,
        },
        act_type: { value: 'glorification_terrorism' },
        audio_features: { value: 'speech' },
        audio_segment: true,
        confidence_level: { value: 'very_confident' },
      },
      video: {
        abuse_location: {
          listItem: { value: 'video' },
          checklist: { value: 'video_abusive' },
        },
        applicable_ve_group: {
          value: veGroups.wagner,
        },
        act_type: { value: 'glorification_terrorism' },
        video_features: [{ value: 've_logo' }],
        video_type: { value: 'compilation' },
        video_contents: [{ value: 'other' }],
        violation_reason: { value: 'produced_content' },
        video_segment: true,
        visual_segment: true,
        confidence_level: { value: 'very_confident' },
      },
    },
    is: {
      autosubmit() {
        return shadowDOMSearch('mwc-checkbox[value="autoreload-page"]')?.[0]
          ?.checked;
      },
      readyForSubmit() {
        return shadowDOMSearch('yurt-core-decision-submit-panel')?.[0]
          ?.readyForSubmit;
      },
      queue(qName) {
        return $utils.get.queue.name()?.includes(qName.toLowerCase());
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
})();

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
          `Please check nasheed ${$utils.get.noteTimestamp}\nRussian part is approve`,
      },
      {
        title: 'Religious',
        value: () =>
          `Russian part is approve, religious content ${$utils.get.noteTimestamp}\nPlease action for Arabic`,
      },
      {
        title: 'Arabic Part',
        value: () =>
          `Please check Arabic part ${$utils.get.noteTimestamp}\nRussian part is approve`,
      },
    ],
    drugs: [
      {
        title: 'Drugs policy',
        value: () =>
          `please check for drugs policy violations ${$utils.get.noteTimestamp}\napprove for VE`,
      },
      {
        title: 'Gambling',
        value: () =>
          `please check for gambling policy violations ${$utils.get.noteTimestamp}\napprove for VE`,
      },
    ],
    gv: [
      {
        title: 'MOD',
        value: () =>
          `please check for MOD ${$utils.get.noteTimestamp}\napprove for VE`,
      },
      {
        title: 'GV',
        value: () =>
          `please check for GV ${$utils.get.noteTimestamp}\napprove for VE`,
      },
    ],
    adult: [
      {
        title: 'Vulgar language',
        value: () =>
          `please check for excessive use of vulgar language ${$utils.get.noteTimestamp}\napprove for VE`,
      },
      {
        title: 'Nudity',
        value: () =>
          `please check for nudity ${$utils.get.noteTimestamp}\napprove for VE`,
      },
      {
        title: 'Sexual act',
        value: () =>
          `please check for implied sexual act ${$utils.get.noteTimestamp}\napprove for VE`,
      },
      {
        title: 'Adult',
        value: () =>
          `please check for adult violations ${$utils.get.noteTimestamp}\napprove for VE`,
      },
    ],
    spam: [
      {
        title: 'Spam',
        value: () =>
          `please check for spam ${$utils.get.noteTimestamp}\napprove for VE`,
      },
      {
        title: 'Spam (link)',
        value: () => `please check for spam (link in comments)\napprove for VE`,
      },
    ],
    hd: [
      {
        title: 'Dangerous Pranks',
        value: () =>
          `please check for dangerous pranks ${$utils.get.noteTimestamp}\napprove for VE`,
      },
      {
        title: 'Gambling',
        value: () =>
          `please check for gambling ${$utils.get.noteTimestamp}\napprove for VE`,
      },
      {
        title: 'H&D violation',
        value: () =>
          `please check for H&D acts ${$utils.get.noteTimestamp}\napprove for VE`,
      },
    ],
    haras: [
      {
        title: 'Doxxing',
        value: () =>
          `please check for doxxing ${$utils.get.noteTimestamp}\napprove for VE`,
      },
    ],
    ds: [
      {
        title: 'Terms of Service',
        value: () =>
          `please check for TOS violations ${$utils.get.noteTimestamp}\napprove for VE`,
      },
    ],
    cs: [
      {
        title: 'Minors Sex',
        value: () =>
          `please check for minors sexualization ${$utils.get.noteTimestamp}\napprove for VE`,
      },
    ],
    hate: [
      {
        title: 'Slur',
        value: () =>
          `please check for slur ${$utils.get.noteTimestamp}\napprove for VE`,
      },
      {
        title: '{ Slur }',
        value: () =>
          `please check for slur ${(() => {
            const highlightedWord = shadowDOMSearch('.current-transcript')?.[0]
              .textContent;

            return highlightedWord ? highlightedWord : '';
          })()} ${$utils.get.noteTimestamp}\napprove for VE`,
      },
      {
        title: 'Hate',
        value: () =>
          `please check for hate policy violations ${$utils.get.noteTimestamp}\napprove for VE`,
      },
      {
        title: '🇺🇦 🐖 Dehuman',
        value: () =>
          `please check for Ukrainian pig dehumanization ${$utils.get.noteTimestamp}\napprove for VE`,
      },
      {
        title: '🇺🇦 Denazi',
        value: () =>
          `please check for Denazification of Ukraine ${$utils.get.noteTimestamp}\napprove for VE`,
      },
      {
        title: 'Podolyak',
        value: () =>
          `please check for Yury Podolyak circumvention ${$utils.get.noteTimestamp}\napprove for VE`,
      },
    ],
    t2: [
      {
        title: 'Protections',
        value: () =>
          `\n${'- '.repeat(15)}\n${$utils.get.safetyNetProtections()}`,
      },
    ],
  },
  strike: {
    3065: [
      {
        title: '[3065] Depictive >50%',
        value: () =>
          `${$const.selectedVEGroup.text} depictive content >50% of video without 4C EDSA or criticism ${$utils.get.noteTimestamp}\n3065 Strike\nRussian`,
      },
      {
        title: '[3065] Depictive+Music',
        value: () =>
          `${$const.selectedVEGroup.text} depictive content with upbeat music without 4C EDSA or criticism ${$utils.get.noteTimestamp}\n3065 Strike\nRussian`,
      },
      {
        title: '[3065] Song/Nasheed',
        value: () =>
          `${$const.selectedVEGroup.text} glorifying song without 4C EDSA or criticism ${$utils.get.noteTimestamp}\n3065 Strike\nRussian`,
      },
    ],
    3039: [
      {
        title: '[3039] Raw reupload',
        value: () =>
          `${$const.selectedVEGroup.text} raw re-upload without criticism or 4C EDSA ${$utils.get.noteTimestamp}\n3039 Strike (not dedicated)\nRussian`,
      },
      {
        title: '[3039] Song',
        value: () =>
          `${$const.selectedVEGroup.text} glorifying lyrics ${$utils.get.noteTimestamp}\n3039 Strike (not dedicated)\nRussian`,
      },
      {
        title: '[3039] Glorification',
        value: () =>
          `Glorification of ${$const.selectedVEGroup.text} ${$utils.get.noteTimestamp}\n3039 Strike (not dedicated)\nRussian`,
      },
    ],
    3044: [
      {
        title: '[3044] Raw reupload',
        value: () =>
          `${$const.selectedVEGroup.text} raw re-upload without criticism or 4C EDSA ${$utils.get.noteTimestamp}\nChannel dedicated\n• _________\n• _________\n3044 Terminate\nRussian`,
      },
      {
        title: '[3044] Glorification',
        value: () =>
          `Glorification of ${$const.selectedVEGroup.text} ${$utils.get.noteTimestamp}\nChannel dedicated\n• _________\n• _________\n3044 Terminate\nRussian`,
      },
      {
        title: '[3044] Song',
        value: () =>
          `${$const.selectedVEGroup.text} glorifying lyrics ${$utils.get.noteTimestamp}\nChannel dedicated\n• _________\n• _________\n3044 Terminate\nRussian`,
      },
      {
        title: '[3044][1] Raw reupload',
        value: () =>
          `${$const.selectedVEGroup.text} raw re-upload without criticism or 4C EDSA ${$utils.get.noteTimestamp}\nChannel dedicated (single video on channel)\n3044 Terminate\nRussian`,
      },
      {
        title: '[3044][1] Glorification',
        value: () =>
          `Glorification of ${$const.selectedVEGroup.text} ${$utils.get.noteTimestamp}\nChannel dedicated (single video on channel)\n3044 Terminate\nRussian`,
      },
      {
        title: '[3044][1] Song',
        value: () =>
          `${$const.selectedVEGroup.text} glorifying lyrics ${$utils.get.noteTimestamp}\nChannel dedicated (single video on channel)\n3044 Terminate\nRussian`,
      },
    ],
    5013: [
      {
        title: '[5013] Raw reupload',
        value: () =>
          `${$const.selectedVEGroup.text} raw re-upload without criticism or 4C EDSA ${$utils.get.noteTimestamp}\n5013 PIA\nRussian`,
      },
    ],
  },
};

let $utils = {
  click: {
    element(queryStr, args, retries = $config.CLICK_BUTTON_RETRY_COUNT) {
      let btn;
      if (queryStr === 'mwc-list-item') {
        // for list-item, convert nodelist to array, then filter based on value
        let btnNodeList = shadowDOMSearch(queryStr);
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

        btn = shadowDOMSearch(queryStr)?.[0];
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
          () => $utils.click.element(queryStr, null, retries),
          $config.CLICK_BUTTON_INTERVAL_MS
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
      $utils.click.element('mwc-list-item', listArgs);
    },
    listItemByInnerText(...args) {
      let listItems = [...shadowDOMSearch('mwc-list-item')];

      console.log('looking for', args);

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
      $utils.click.element('mwc-checkbox', listArgs);
    },
    checklist(listArgs) {
      $utils.click.element('mwc-check-list-item', listArgs);
    },
    radio(listArgs) {
      $utils.click.element('mwc-radio', listArgs);
    },
    myReviews() {
      $utils.click.element('mwc-tab', {
        label: '"My Reviews (0)"',
      });
      $utils.click.element('mwc-tab', {
        label: '"My Reviews"',
      });
    },
  },
  get: {
    get selectedPolicyId() {
      let policyItem = shadowDOMSearch('yurt-core-policy-selector-item')?.[0];
      if (!policyItem) return;
      return policyItem.policy.id;
    },
    get timeElapsed() {
      var timeDiff = Math.round(
        (new Date() - new Date($reviewRoot?.allocateStartTime)) / 1000
      );

      if (timeDiff === 300) $utils.sendNotification('⏳ 5 min');
      if (timeDiff === 600) $utils.sendNotification('⏳ 10 min');

      return timeDiff >= 19800 ? 0 : timeDiff;
    },
    commentText() {
      let reviewData =
        shadowDOMSearch('yurt-review-root')[0].hostAllocatedMessage.reviewData;
      return reviewData.commentReviewData.commentThread.requestedComment
        .commentText;
    },
    get noteTimestamp() {
      return uiFactory.dom.playerControls.player.getCurrentTime() === 0
        ? '#fullvideo'
        : `@${$utils.get.videoTimestamp}`;
    },
    safetyNetProtections() {
      let safetyNetDialog = shadowDOMSearch(
        'yurt-core-safety-nets-dialog'
      )?.[0];

      try {
        return safetyNetDialog?.safetyNetProtections
          ?.map((item) => `${item?.id} - ${item?.reason}`)
          .join('\n');
      } catch (e) {
        console.log(arguments.callee.name, e.stack);
      }
    },
    getCurrentTimeStr() {
      return $utils.formatTime(
        uiFactory.dom.playerControls.player.getCurrentTime()
      );
    },
    videoLength(seconds) {
      let vl = shadowDOMSearch('#movie_player');
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
      return $utils.get.queue.info().entityID;
    },
    get videoTimestamp() {
      let videoRoot = shadowDOMSearch('yurt-video-root')[0];

      return $utils.formatTime(videoRoot.playerApi.getCurrentTime());
    },
    get selectedVEGroup() {
      const text = shadowDOMSearch(
        'mwc-select[value=strike_ve_group_dropdown]'
      )?.[0].selectedText;

      const label = shadowDOMSearch(
        'mwc-select[value=strike_ve_group_dropdown]'
      )?.[0].value;

      return { text, label };
    },
    queue: {
      info() {
        var reviewRoot = shadowDOMSearch('yurt-review-root')?.[0];

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
        return this.info().queueName?.toLowerCase() ?? '';
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
    $utils.click.element('.next-button', { class: 'next-button' });
  },
  clickSubmit(delay) {
    if (delay) {
      clearTimeout($timers.SUBMIT_ID);
      $timers.SUBMIT_ID = setTimeout(() => {
        try {
          uiFactory.dom.submitBtn.click();
        } catch (e) {
          console.log(e.stack);
        }
      }, delay);

      return;
    }

    uiFactory.dom.submitBtn?.click();
  },
  clickDone() {
    $utils.click.element('tcs-button', { name: 'label-submit' });
  },
  clickSave() {
    $utils.click.element('tcs-button', {
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
    parent = shadowDOMSearch(
      'yurt-core-decision-annotation-tabs > div:nth-child(1)'
    )?.[0];

    // parent.style.marginBottom = '50px';
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
  async getChannelVideos() {
    let videosArr = await fetch(
      `https://yurt.corp.google.com/_/backends/account/v1/videos:fetch?alt=json&key=${yt.config_.YURT_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          externalChannelId:
            $reviewRoot.hostAllocatedMessage.reviewData.videoReviewData
              .videoReviewMetadata.externalChannelId,
          fetchLatestPolicy: true,
          maxNumVideosByRecency: 50,
          viewEnums: ['VIEW_INCLUDE_PINNED_COMMENT'],
        }),
      }
    ).then((response) => response.json());

    return videosArr;
  },
  async filterVideosByPolicy(policyId = '9008') {
    const { videos } = await this.getChannelVideos();

    let byPolicy = videos.filter(
      (video) => video.appliedPolicy?.id === policyId
    );

    let violativeIds = byPolicy.map((vid) => vid.externalVideoId).join(', ');
    return byPolicy;
  },
  async filterVideoByKeywords(keywordsArr = $const.filterKeywords) {
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
  async filterVideoByDescription(keywordsArr) {
    const { videos } = await this.getChannelVideos();

    if (!keywordsArr) keywordsArr = $const.filterKeywords;
    let byKeyword = videos.filter((video) => {
      if (!video.videoDescription) return;
      keywordsArr.some((word) =>
        video.videoDescription.toLowerCase().includes(word)
      );
    });

    let violativeVideoIds = byKeyword
      .map((vid) => vid.externalVideoId)
      .join(', ');

    return violativeVideoIds;
  },

  // SETTERS //
  setNote(noteStr) {
    let decisionCard = shadowDOMSearch('yurt-core-decision-policy-card')?.[0];
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

  setTimer(minutes, endReview = $const.is.autosubmit()) {
    // clear the previous timer
    clearTimeout($timers.SUBMIT_ID);

    const {
      submitBtn,
      submitEndReviewBtn,
      routeBtn,
      routeEndReviewBtn,
      videoDecisionPanel,
    } = uiFactory.dom;

    let btn;

    // check whether is routing or actioning
    if (videoDecisionPanel.viewMode === 1) {
      // routing video
      btn = endReview ? routeEndReviewBtn : routeBtn;
    } else {
      btn = endReview ? submitEndReviewBtn : submitBtn;
    }

    try {
      $timers.SUBMIT_ID = setTimeout(() => btn.click(), minutes * 60 * 1000);
      $utils.removeLock();
      console.table($timers);
      console.log(
        `⌚ ✅ Submit in ${minutes} minutes, at ${new Date(
          Date.now() + minutes * 60 * 1000
        )
          .toJSON()
          .split('T')[1]
          .slice(0, 8)}.${
          endReview ? '\n\n\t\t.. and ending the review ❗\n\n' : ''
        }`
      );
    } catch (e) {
      console.log('Could not Submit', e.stack);
    }
  },
  setFrequentlyUsedPolicies() {
    try {
      shadowDOMSearch(
        'yurt-video-decision-panel-v2'
      )[0].frequentlyUsedPolicies = $const.frequentlyUsedPolicies;
    } catch (e) {
      console.log(arguments.callee.name, e.stack);
    }
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
      setTimeout(() => n.close(), $config.NOTIFICATION_TIMEOUT_SEC * 1000);
  },
  removeLock() {
    let lock = shadowDOMSearch('yurt-review-activity-dialog')?.[0];
    if (lock) {
      lock.lockTimeoutSec = 3000;
      lock.secondsToExpiry = 3000;
      lock.onExpired = () => {};
    }

    console.log(`🔐LOCK: ${$utils.formatTime(lock?.secondsToExpiry)}`);
  },

  seekVideo(timestampStr) {
    let videoRoot = shadowDOMSearch('yurt-video-root')[0];
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
  clearTimers() {
    Object.keys($timers).forEach((timer) => {
      clearTimeout($timers[timer]);
      clearInterval($timers[timer]);
      console.log(`[🧹] removed ${timer} = ${$timers[timer]}`);
      $timers[timer] = 0;
    });
  },
};

let $lib = {
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
  dVideo() {
    let ytpPlayer = shadowDOMSearch('ytp-player')?.[0];
    return JSON.parse(ytpPlayer.playerVars.player_response).streamingData
      .formats[0].url;
  },
  dVideoNew() {
    return $reviewRoot.hostAllocatedMessage.reviewData.videoReviewData
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
      console.log(
        `Function "${fn.name}" took ${elapsedTime.toFixed(4)} milliseconds`
      );
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
};

let $props = {
  dropdown: {
    strike: {
      label: 'Select VE Group',
      value: 'strike_ve_group_dropdown',
      options: [
        { value: $const.veGroups.wagner, label: 'Wagner PMC' },
        { value: $const.veGroups.alq, label: 'Al Qaeda' },
        { value: $const.veGroups.ik, label: 'Imarat Kavkaz' },
        { value: $const.veGroups.isis, label: 'ISIS' },
        { value: $const.veGroups.hamas, label: 'Hamas' },
        { value: $const.veGroups.hezbollah, label: 'Hezbollah' },
        { value: $const.veGroups.ira, label: 'IRA' },
        { value: $const.veGroups.lte, label: 'LTTE' },
        { value: $const.veGroups.unknown, label: 'UNKNOWN' },
        { value: $const.veGroups.vnsa, label: 'VNSA' },
      ],
    },
  },
  button: {
    approve: [
      { text: '🇷🇺 RU', onClick: () => handleApprove('russian') },
      { text: '🇺🇦 UA', onClick: () => handleApprove('ukrainian') },
      { text: '🇬🇧 ENG', onClick: () => handleApprove('english') },
      {
        text: '❔ AGN',
        onClick: () => handleApprove('Language agnostic'),
      },
      { text: '🔳 N/A', onClick: () => handleApprove() },
    ],
    strike: [
      {
        text: '3065 :: Produced Content 📽',
        onClick: () => handleStrike('3065', 'video'),
      },
      {
        text: '3065 :: Song 🎻',
        onClick: () => handleStrike('3065', 'song'),
      },
      {
        text: '3065 :: Speech 🎤',
        onClick: () => handleStrike('3065', 'speech'),
      },

      {
        text: '3039 :: Produced Content 📽',
        onClick: () => handleStrike('3039', 'video'),
      },
      {
        text: '3039 :: Song 🎻',
        onClick: () => handleStrike('3039', 'song'),
      },
      {
        text: '3039 :: Speech 🎤',
        onClick: () => handleStrike('3039', 'speech'),
      },

      {
        text: '3044 :: Produced Content 📽',
        onClick: () => handleStrike('3044', 'video'),
      },
      {
        text: '3044 :: Song 🎻',
        onClick: () => handleStrike('3044', 'song'),
      },
      {
        text: '3044 :: Speech 🎤',
        onClick: () => handleStrike('3044', 'speech'),
      },
    ],
    route: [
      {
        text: '🇸🇦 Arabic',
        onClick: () =>
          action.video.route(
            `ve ${$utils.get.queue.type() ?? ''} arabic`,
            'arabic',
            'routing for language'
          ),
      },
      {
        text: '💉💲 Drugs',
        onClick: () =>
          action.video.route(`drugs ${$utils.get.queue.type()}`, 'drugs'),
      },
      {
        text: '🧨 H&D ',
        onClick: () => action.video.route('Harmful Dangerous Acts', 'hd'),
      },
      {
        text: '🥩 Graphic',
        onClick: () => action.video.route(`graphic violence enforcement`, 'gv'),
      },
      {
        text: '⚡ Hate',
        onClick: () => action.video.route('hate russian', 'hate'),
      },
      {
        text: '🏹 Harass',
        onClick: () =>
          action.video.route(
            `harassment ${$utils.get.queue.type()} russian`,
            'harass'
          ),
      },
      { text: '🔞 Adult', onClick: () => action.video.route('adult', 'adult') },
      { text: '📬 SPAM', onClick: () => action.video.route('spam', 'spam') },
      {
        text: '💽 DS',
        onClick: () => action.video.route('digital security video', 'ds'),
      },
      {
        text: '🧒 Child',
        onClick: () => action.video.route('child minors', 'cs'),
      },
      {
        text: '🗞 Misinfo',
        onClick: () => action.video.route('misinfo'),
      },
      {
        text: '🔐 T2/FTE',
        onClick: () =>
          action.video.route(
            $const.is.queue('t2') ? 'fte' : 't2',
            't2',
            'protections'
          ),
      },
    ],
    comments: [
      {
        text: 'Al Qaeda',
        onClick: () =>
          action.comment.strikeComment('alq', $config.COMMENTS_TIMER_MIN),
      },
      {
        text: ' BLA',
        onClick: () =>
          action.comment.strikeComment('bla', $config.COMMENTS_TIMER_MIN),
      },
      {
        text: '🇵🇸 Hamas',
        onClick: () =>
          action.comment.strikeComment('hamas', $config.COMMENTS_TIMER_MIN),
      },
      {
        text: '🇱🇧 Hezbollah',
        onClick: () =>
          action.comment.strikeComment('hezbollah', $config.COMMENTS_TIMER_MIN),
      },
      {
        text: '🇮🇪 IRA',
        onClick: () =>
          action.comment.strikeComment('ira', $config.COMMENTS_TIMER_MIN),
      },
      {
        text: '🏴‍☠ ISIS',
        onClick: () =>
          action.comment.strikeComment('isis', $config.COMMENTS_TIMER_MIN),
      },
      {
        text: '🇱🇰 LTTE',
        onClick: () =>
          action.comment.strikeComment('lte', $config.COMMENTS_TIMER_MIN),
      },
      {
        text: '🟥 PKK',
        onClick: () =>
          action.comment.strikeComment('pkk', $config.COMMENTS_TIMER_MIN),
      },
      {
        text: '🇵🇰 TTP',
        onClick: () =>
          action.comment.strikeComment('taliban', $config.COMMENTS_TIMER_MIN),
      },
      {
        text: ' VNSA',
        onClick: () =>
          action.comment.strikeComment('vnsa', $config.COMMENTS_TIMER_MIN),
      },
      {
        text: 'OSAMA',
        onClick: () =>
          action.comment.strikeComment(
            'osama',
            $config.COMMENTS_TIMER_MIN,
            'gdp_speaker_type'
          ),
      },
      {
        text: 'Unknown',
        onClick: () =>
          action.comment.strikeComment('unknown', $config.COMMENTS_TIMER_MIN),
      },
      {
        text: '❔ Custom',
        onClick: () =>
          action.comment.strikeComment('', $config.COMMENTS_TIMER_MIN),
      },
      {
        text: 'Custom GDP',
        onClick: () =>
          action.comment.strikeComment('', $config.COMMENTS_TIMER_MIN, 'isGDP'),
      },
      { text: '⏭ Hate', onClick: () => action.video.route('hate') },
      { text: 'X L A N G', onClick: () => action.video.route('xlang') },
    ],
    timers: [
      {
        text: '1',
        onClick: () => $utils.setTimer(1, $const.is.autosubmit()),
      },
      {
        text: '2',
        onClick: () => $utils.setTimer(2, $const.is.autosubmit()),
      },
      {
        text: '3',
        onClick: () => $utils.setTimer(3, $const.is.autosubmit()),
      },
      {
        text: '4',
        onClick: () => $utils.setTimer(4, $const.is.autosubmit()),
      },
      {
        text: '5',
        onClick: () => $utils.setTimer(5, $const.is.autosubmit()),
      },
      {
        text: '10',
        onClick: () => $utils.setTimer(10, $const.is.autosubmit()),
      },
    ],
  },
  dropdownList: {
    3039: {
      label: '3039',
      children: [
        { key: '📽 Video', value: 'video' },
        { key: '🎻 Song', value: 'song' },
        { key: '🎤 Speech', value: 'speech' },
        { key: '📎 Metadata', value: 'metadata' },
      ],
    },
    3065: {
      label: '3065',
      children: [
        { key: '📽 Video', value: 'video' },
        { key: '🎻 Song', value: 'song' },
        { key: '🎤 Speech', value: 'speech' },
        { key: '📎 Metadata', value: 'metadata' },
      ],
    },
    3044: {
      label: '3044',
      children: [
        { key: '📽 Video', value: 'video' },
        { key: '🎻 Song', value: 'song' },
        { key: '🎤 Speech', value: 'speech' },
        { key: '📎 Metadata', value: 'metadata' },
      ],
    },
  },
};

let uiFactory = {
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
      `<tcs-icon-button ${size && `size=${size}`} ${
        size && `size=${size}`
      } icon=${icon} />`
    );
    element.onclick = onClick;
    if (className) element.classList.add(className);
    if (size) element.size = size;

    return element;
  },
  createDropdownMenu(props) {
    const { strToNode } = uiFactory;
    const { label, children } = props;

    const parentList =
      strToNode(`<mwc-list><mwc-list-item hasmeta="" value="video" mwc-list-item="" tabindex="0" aria-disabled="false">
    <!--?lit$658385021$-->
    <span class="option-label"><tcs-text>${label}</tcs-text></span>
    <tcs-icon data-test-id="label-questionnaire-list-category-icon" slot="meta" class="category-icon" family="material" spec="default">
    <!--?lit$658385021$-->expand_more
    </tcs-icon>
    </mwc-list-item>
    </mwc-list>`);

    const childList = strToNode(`<mwc-list></mwc-list>`);
    const childListItems = children.map((item) => {
      const listItem =
        strToNode(`<mwc-list-item value="${item.value}" graphic="control" aria-disabled="false">
      <span class="option-label"><tcs-text>${item.key}</tcs-text></span>
      </mwc-list-item>`);

      function handleClick(e) {
        e.stopPropagation();
        console.log(item.key, item.value);
        handleStrike(label, item.value);
      }

      listItem.addEventListener('click', handleClick);

      return listItem;
    });

    childList.replaceChildren(...childListItems);

    const toggleShowList = () =>
      childList.style.display === 'none'
        ? (childList.style.display = 'block')
        : (childList.style.display = 'none');

    parentList.appendChild(childList);
    parentList.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleShowList();
    });
    return parentList;
  },
  typography(str) {
    const textElement = uiFactory.strToNode(
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

  showNotesRecommendations(policyId) {
    $ui.components
      .recommendationPanel({
        notesArr: recommendationNotes.strike[policyId],
      })
      .render();
  },
  async renderViolativeIds() {
    if (shadowDOMSearch('.violative-ids-section')) return;
    const violativeIds = await $utils.filterVideoByKeywords();

    let content;
    if (!violativeIds) content = 'No videos.';

    content = violativeIds.toString();

    const urlBtn = uiFactory.createIconButton(
      'open_in_new',
      () => openRelLinks(violativeIds),
      'open-violative-ids'
    );

    const mySection =
      $utils.strToNode(`<tcs-view class="section violative-ids-section" spacing="small" spec="column" display="flex" wrap="nowrap" align="stretch" padding="none">
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

    uiFactory.dom.metadataPanel.appendChild(mySection);
    uiFactory.dom.metadataPanel.appendChild(urlBtn);
  },
  renderWordsTable() {
    if (shadowDOMSearch('.violative-words-container')) return;
    const violativeWords = getViolativeWords();
    const {
      strToNode,
      components: { createWordsList },
    } = uiFactory;

    const container = strToNode(
      `<div class="violative-words-container"></div>`
    );

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

    console.log('wordsListTablesByCategory', wordsListTablesByCategory);

    container.replaceChildren(...wordsListTablesByCategory);
    uiFactory.dom.metadataPanel.appendChild(container);
  },

  components: {
    createWordsList(listItemsArr) {
      const { strToNode } = uiFactory;

      function findWordSequence(wordsArray) {
        let sequenceStart = 0;
        let sequenceLength = 0;

        for (let i = 1; i < wordsArray.length; i++) {
          if (wordsArray[i].seconds - wordsArray[sequenceStart].seconds <= 60) {
            sequenceLength++;
            if (sequenceLength >= 10) {
              return {
                first: wordsArray[sequenceStart].key,
                last: wordsArray[i].key,
              };
            }
          } else {
            sequenceStart = i;
            sequenceLength = 0;
          }
        }

        return null;
      }

      const violativeWords = findWordSequence(listItemsArr);
      const firstViolativeTimestamp = violativeWords?.[0].seconds ?? -1;

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
          uiFactory.dom.playerControls.player.seekTo(item.seconds);
        });

        timeStampChip.style.cursor = 'pointer';

        listItem.appendChild(timeStampChip);
        return listItem;
      });

      myLabelledList.replaceChildren(...listItemsChildren);
      return myLabelledList;
    },
  },

  // DOM elements
  dom: {
    get filterControlsPanel() {
      return shadowDOMSearch('.filter-controls-on')?.[0];
    },
    get videoTitleRow() {
      return shadowDOMSearch('.video-title-row')?.[0];
    },
    get rightSidebar() {
      return shadowDOMSearch(
        'yurt-core-decision-annotation-tabs > div:nth-child(1)'
      )?.[0];
    },
    get videoDecisionPanel() {
      return shadowDOMSearch('yurt-video-decision-panel-v2')?.[0];
    },
    get header() {
      return $const.is.queue('comments')
        ? shadowDOMSearch('tcs-text[spec=title-2]')?.[0]?.shadowRoot
        : shadowDOMSearch('yurt-core-plugin-header > div > tcs-view')?.[0];
    },
    get metadataPanel() {
      return shadowDOMSearch('yurt-video-metadata-video')?.[0]?.shadowRoot;
    },
    get submitBtn() {
      return shadowDOMSearch('.mdc-button--unelevated')?.[0];
    },
    get submitEndReviewBtn() {
      return shadowDOMSearch('div > mwc-menu > mwc-list-item')?.[0];
    },
    get routeBtn() {
      return shadowDOMSearch('div > tcs-view > tcs-button')?.[0];
    },
    get routeEndReviewBtn() {
      return shadowDOMSearch('div > mwc-menu > mwc-list-item')?.[0];
    },
    get transcriptContainer() {
      let transcriptContainer;
      try {
        transcriptContainer = shadowDOMSearch('.transcript-container')[0];
      } catch (e) {
        console.log('Could not find transcript-container');
      }
      return transcriptContainer;
    },
    get videoPlayer() {
      try {
        let videoPlayer = shadowDOMSearch('yurt-video-root')[0].playerApi;
        return videoPlayer;
      } catch (e) {
        console.log('[DOM-element] Player not found');
      }
    },
    get questionnaire() {
      return shadowDOMSearch('yurt-core-questionnaire')?.[0];
    },
    playerControls: {
      get player() {
        return uiFactory.dom.videoPlayer;
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
        const container = $utils.strToNode(
          `<div class='player-controls-container' style="display:flex;"></div>`
        );

        const buttons = [
          uiFactory.createIconButton(
            'fast_rewind',
            uiFactory.dom.playerControls.onFastRewind.bind(
              uiFactory.dom.playerControls
            ),
            'player-controls-fast-rewind'
          ),
          uiFactory.createIconButton(
            'play_circle',
            uiFactory.dom.playerControls.onResetPlaybackRate.bind(
              uiFactory.dom.playerControls
            ),
            'player-controls-reset-playback-rate'
          ),
          uiFactory.createIconButton(
            'fast_forward',
            uiFactory.dom.playerControls.onFastForward.bind(
              uiFactory.dom.playerControls
            ),
            'player-controls-fast-forward'
          ),
          uiFactory.createIconButton(
            'restart_alt',
            this.onReset.bind(uiFactory.dom.playerControls),
            'reset-player-btn'
          ),
        ];

        container.replaceChildren(...buttons);
        uiFactory.dom.videoTitleRow.appendChild(container);
      },
    },
    getElementByQueryStr(queryStr) {
      let element;
      try {
        element = shadowDOMSearch(queryStr)[0];
      } catch (e) {
        console.log(`Could not find ${queryStr}`);
      }
      return element;
    },
  },

  mutations: {
    expandTranscriptContainer() {
      try {
        let videoContextContainer = shadowDOMSearch(
          '.video-context-section'
        )?.[0];
        let videoContextPanel = shadowDOMSearch(
          'yurt-video-context-panel'
        )?.[0];
        let transcriptContainer = shadowDOMSearch(
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
        ? shadowDOMSearch('.mdc-text-field__input')?.[0]
        : shadowDOMSearch(
            'mwc-textarea[data-test-id=core-decision-policy-edit-notes]'
          )?.[0];

      // increase size of note input box
      notesTextArea.rows = rows;
    },
    expandPoliciesContainer() {
      const policiesWrapper = shadowDOMSearch('.policies-wrapper')?.[0];
      const sidebarBtns = shadowDOMSearch('.action-buttons')?.[0];

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

function openRelLinks(ids) {
  const url = `https://yurt.corp.google.com/?entity_id=${ids
    .split(', ')
    .join(
      '%2C'
    )}&entity_type=VIDEO&config_id=prod%2Freview_session%2Fvideo%2Fstandard_readonly_lookup&jt=yt_admin_review_packet_id&jv=14569122914413829262&ds_id=YURT_LOOKUP!2609626686721411490&de_id=2023-08-06T16%3A49%3A02.150670376%2B00%3A00#lookup-v2`;

  // Open the URL in a new tab
  window.open(url, '_blank');
}

let $ui = (function () {
  let atoms = {
    card({ children }) {
      let elem = $utils.strToNode(`<yurt-core-card></yurt-core-card>`);

      if (children?.length > 1) {
        children.forEach((child) => elem.appendChild(child));
        return elem;
      }

      elem.appendChild(children);
      return elem;
    },
    button({ text, onClick, spec = 'flat-primary' }) {
      let btnStr = `<tcs-button ${spec && `spec=${spec}`}>${text}</tcs-button>`;

      let btn = $utils.strToNode(btnStr);
      btn.onclick = onClick;
      return btn;
    },
    dropdown({ label, value, options }) {
      return $utils.strToNode(`<mwc-select naturalmenuwidth outlined label="${label}" value="${value}">
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
        $utils.strToNode(`<tcs-view padding="small" fillwidth="" display="flex" spec="row" wrap="nowrap" align="stretch" spacing="none"><mwc-formfield>
      <mwc-switch class=${className} id=${className}></mwc-switch></mwc-formfield><tcs-text text=${label} class="wellness-label" spec="body" texttype="default"></tcs-text></tcs-view>`);

      return node;
    },
  };

  let components = {
    // Ready UI Components

    get btns() {
      const { button: createButton } = atoms;
      const { button: btnProps } = $props;

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
    get actionPanel() {
      const { strToNode: $ } = $utils;
      let wrapperDiv = $(
        `<div class="action-panel" style="display: grid; grid-template-columns: repeat(2, 2fr)"></div>`
      );

      let routeDiv = $(`<div class="action-panel__route"></div>`);
      let approveDiv = $(`<div class="action-panel__action"></div>`);

      [routeDiv, approveDiv].forEach((div) => {
        div.style.display = 'flex';
        div.style.flexDirection = 'column';
      });

      approveDiv.replaceChildren(...this.btns.approve);
      routeDiv.replaceChildren(...this.btns.route);

      wrapperDiv.replaceChildren(routeDiv, approveDiv);

      let element = atoms.card({ children: wrapperDiv });

      // element.style.marginTop = '300px';

      return element;
    },

    get strikePanel() {
      const { createDropdownMenu } = uiFactory;
      const { card: createCard, dropdown: createDropdownSelector } = atoms;

      const container = $utils.strToNode(
        `<div class="strike-panel container"></div>`
      );

      const dropdownMenus = Object.keys($props.dropdownList).map((policy) =>
        createDropdownMenu($props.dropdownList[policy])
      );

      const veGroupDropdownSelector = createDropdownSelector(
        $props.dropdown.strike
      );

      container.replaceChildren(veGroupDropdownSelector, ...dropdownMenus);

      const element = createCard({
        children: container,
      });

      return element;
    },
    get stopwatchPanel() {
      const getTimeStr = () => `${$utils.formatTime($utils.get.timeElapsed)}`;

      const stopwatch = $utils.strToNode(
        `<tcs-chip spec="tag" text=${getTimeStr()} class="stopwatch container"></tcs-chip>`
      );

      let parentNode = $const.is.queue('comments')
        ? shadowDOMSearch('tcs-text[spec=title-2]')?.[0]?.shadowRoot
        : shadowDOMSearch('yurt-core-plugin-header > div > tcs-view')?.[0];

      parentNode.spacing = 'small';

      // MULTIPLE TABS
      if ($config.SU) {
        function showTimers() {
          const { setTimer, strToNode } = $utils;
          let existingTimers = shadowDOMSearch('.timers')?.[0];

          if (existingTimers) {
            existingTimers.remove();
            return;
          }

          const timersArr = [1, 2, 3, 4, 5, 10].map((timerMin) =>
            uiFactory.createButton(timerMin, function () {
              setTimer(timerMin, $const.is.autosubmit());
              $ui.components.stopwatchPanel.showTimers();
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
          $utils.removeLock();
          showTimers();
        };
      }

      // tick
      STOPWATCH_TICK = setInterval(() => {
        stopwatch.text = getTimeStr();
      }, 1000);

      return {
        stopwatch,
        showTimers() {
          const { setTimer, strToNode } = $utils;
          let existingTimers = shadowDOMSearch('.timers')?.[0];

          if (existingTimers) {
            existingTimers.remove();
            return;
          }

          const timersArr = [1, 2, 3, 4, 5, 10].map((timerMin) =>
            uiFactory.createButton(timerMin, () => {
              setTimer(timerMin, $const.is.autosubmit());
              timersWrapper.remove();
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
        },
      };
    },
    approveNotesPanel() {
      const container = $utils.strToNode(
        `<div class="approve-notes container"></div>`
      );

      let panel = $utils.strToNode(
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
            $utils.setNote(noteItem.value);
            console.log('note', noteItem.value);
            shadowDOMSearch('tcs-icon-button#create')?.[0]?.click();
            $utils.clickSave();
          })
      );

      container.appendChild(panel);

      return {
        element: container,
        render() {
          if (shadowDOMSearch('.approve-notes')) return;
          $utils.appendNode(container);
        },
      };
    },
    recommendationPanel({ notesArr }) {
      // TODO comments recommendations
      if ($const.is.queue('comments')) return;

      let recommendationList = $utils.strToNode(
        `<mwc-list id="recommendation-notes" style="margin-bottom: 100px;">${notesArr
          .map(
            (note) =>
              `<mwc-list-item class="recommendation-item" graphic="avatar" value="${note.value()}"><span>${
                note.title
              }</span><mwc-icon slot="graphic">note_add</mwc-icon></mwc-list-item>`
          )
          .join('')}</mwc-list>`
      );

      [...recommendationList.childNodes].forEach(
        (node) =>
          (node.onclick = () => {
            action.video.steps.addNote(node.value);
          })
      );

      return {
        element: recommendationList,
        render() {
          // find parent
          const parent =
            shadowDOMSearch('yurt-core-decision-route')?.[0]?.shadowRoot ||
            shadowDOMSearch('yurt-core-decision-annotation-edit')?.[0]
              ?.shadowRoot;

          parent.appendChild(recommendationList);
        },
      };
    },
    get configPanel() {
      let configPanel = $utils.strToNode(
        `<tcs-view class="config-panel" spacing="small"></tcs-view>`
      );
      let noteSwitch = $utils.strToNode(
        `<div><mwc-formfield><mwc-switch></mwc-mwc-switch></mwc-formfield><tcs-text text="🗒Add Note" spec="body" texttype="default"></tcs-text></div>`
      );

      let autoSubmit = $utils.strToNode(
        `<div><mwc-formfield><mwc-switch></mwc-mwc-switch></mwc-formfield><tcs-text text="Submit?" spec="body" texttype="default"></tcs-text></div>`
      );

      configPanel.replaceChildren(
        ...noteSwitch.children,
        ...autoSubmit.children
      );
      return configPanel;
    },
    get commentsPanel() {
      commentsPanelWrapper = $utils.strToNode(
        `<tcs-view wrap="wrap" class="action-panel__comments" spacing="small"></tcs-view>`
      );

      commentsPanelWrapper.replaceChildren(...$ui.components.btns.comments);

      let element = atoms.card({ children: commentsPanelWrapper });

      return {
        element,
        render() {
          // return if there is a panel already
          if (shadowDOMSearch('.action-panel__comments')?.[0]) return;

          $utils.appendNode(element);
        },
      };
    },
  };

  return {
    components,
  };
})();

let $timers = {
  SUBMIT_ID: undefined,
  STOPWATCH_ID: undefined,
  DISPLAY_STOPWATCH: undefined,
};

let action = {
  video: {
    // click add review, select policy, select language etc...
    steps: {
      addReview() {
        uiFactory.dom.videoDecisionPanel.viewMode = 2;
        return uiFactory.dom.videoDecisionPanel.viewMode === 2;
      },
      selectPolicy(policyId) {
        let foundPolicy = [
          ...(shadowDOMSearch('yurt-core-policy-selector-item') ?? []),
        ]?.filter((policyItem) => policyItem?.policy?.id === policyId)?.[0];

        if (!foundPolicy) {
          //console.log('[recursion] looking for 9008 tag');
          // FIX
          setTimeout(
            () => action.video.steps.selectPolicy(policyId),
            $config.FUNCTION_CALL_RETRY_MS
          );
          return;
        }

        //console.log('approvePolicyTag');
        foundPolicy?.click();
      },
      selectLanguage(language) {
        let langOptions = Array.from(
          shadowDOMSearch('#decision-panel-language-select > mwc-list-item')
        );

        const foundLanguageOption = langOptions.filter(
          (option) => option.value.toLowerCase() === language.toLowerCase()
        )[0];

        foundLanguageOption.click();
      },

      isRelatedToVE(related = 'no') {
        let possibleValues = ['no', 'yes_borderline', 'yes_edsa'];
        $utils.click.radio({ value: related });
      },
      addNote(note) {
        try {
          let noteInputBox =
            shadowDOMSearch('.notes-input')?.[0] ||
            shadowDOMSearch(
              'mwc-textarea[data-test-id=core-decision-policy-edit-notes]'
            )?.[0];

          noteInputBox.value = note;
          action.video.steps.selectTextArea();
        } catch (e) {
          console.log(arguments.callee.name, e.stack);
        }
      },
      selectTextArea() {
        let link;
        link = shadowDOMSearch('.mdc-text-field__input')[0];

        //console.log('text area');
        link && link.select();
      },
    },
    // actual complete actions
    review(language = 'russian', policyId = '9008', relatedToVE = 'no') {
      // There is a policy already
      if ($const.is.readyForSubmit()) return;

      let { clickNext, clickDone, clickSave, clickSubmit } = $utils;
      let { addReview, selectPolicy, selectLanguage, isRelatedToVE } =
        action.video.steps;

      addReview();
      selectPolicy(policyId);
      newStrike.answerQuestionnaire(newStrike.answers['9008']);

      // clickNext();
      clickDone();
      clickSave();
      selectLanguage(language);
    },
    route(queue, noteType, reason = 'policy vertical') {
      // TODO
      // let { queue, noteType, reason } = routeOptions;

      // helper functions
      function clickRoute() {
        uiFactory.dom.videoDecisionPanel.viewMode = 1;
        return uiFactory.dom.videoDecisionPanel.viewMode === 1;
      }

      function $selectTarget(queue, reason) {
        const { listItemByInnerText } = $utils.click;

        listItemByInnerText(...queue.split(' '));
        listItemByInnerText(reason);
      }

      function selectTextArea() {
        let textArea = shadowDOMSearch('.mdc-text-field__input')[0];
        textArea.select();
      }

      // actual routing process
      clickRoute();
      setTimeout(() => $selectTarget(queue, reason), 1);
      setTimeout(selectTextArea, 1);
      setTimeout(() => uiFactory.mutations.expandNotesArea(), 1);

      // show recommendations for routing to target queue
      setTimeout(
        () =>
          $ui.components
            .recommendationPanel({
              notesArr: recommendationNotes.route[noteType],
            })
            .render(),
        1
      );
    },
  },
  comment: {
    steps: {
      selectVEpolicy(commentPolicy = 'FTO') {
        let policiesArr = Array.from(
          shadowDOMSearch('yurt-core-policy-selector-item') || []
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

        $utils.click.element('mwc-radio', { value: actionType });
      },

      VEgroupType(veType = 've_group_type') {
        console.log('VEgroupType', veType);
        $utils.click.element('mwc-radio', { value: veType });
      },

      selectVEgroup(targetGroup) {
        console.log('selectVEgroup', targetGroup);

        const VEgroupsArr = Array.from(shadowDOMSearch('mwc-list-item'));

        if (VEgroupsArr.length < 20 || !VEgroupsArr) {
          // error check
          setTimeout(
            () => action.comment.steps.selectVEgroup(targetGroup),
            $config.FUNCTION_CALL_RETRY_MS
          );
          return;
        }

        function getVEGroup() {
          let group = VEgroupsArr?.filter((item) => {
            //console.log(item.value);
            //console.log(groupsMap[targetGroup]);
            return item.value === $const.veGroups[targetGroup];
          })[0];
          return group;
        }

        let group = getVEGroup();
        console.log('getVEGroup', group);

        group && group?.click();
      },

      selectRelevance(relevance = 'comment_text') {
        console.log('selectRelevance', relevance);

        $utils.click.element('mwc-checkbox', { value: relevance });
      },

      selectStamp(stampType = 'the_whole_comment') {
        console.log('selectRelevance', stampType);

        $utils.click.element('mwc-radio', { value: stampType });
      },
    },
    strikeComment(VEGroup, timerMin, groupType = 've_group_type') {
      // there is a policy card, means a policy has been set already
      // if (!shadowDOMSearch('yurt-core-decision-policy-card')?.[0]) {
      //   return;
      // }
      let {
        selectVEpolicy,
        selectActionType,
        VEgroupType,
        selectVEgroup,
        selectRelevance,
        selectStamp,
      } = action.comment.steps;
      let { clickNext, clickDone } = $utils;

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
        $utils.setTimer(timerMin, false);
      }
    },
    approveComment: () => {
      let policiesArr = Array.from(
        shadowDOMSearch('yurt-core-policy-selector-item')
      );
      let approvePolicy = policiesArr.filter(
        (policy) => policy.policy.id === '35265'
      )[0];

      approvePolicy.click();
    },
    routeComment: (targetQueue) => {
      // TODO?
      let routeTargetsArr = Array.from(shadowDOMSearch('mwc-list-item'));
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
      let routeBtn = shadowDOMSearch('.submit')[0];
    },
  },
};

let rightPanel = (function () {
  const { actionPanel, strikePanel } = $ui.components;

  let container = $utils.strToNode(
    `<div class="superuser-panel" style="display: flex; flex-direction: column; justify-content: start; gap: 1rem; padding: 3rem 0 10rem 0;"></div>`
  );

  const elemsArr = [
    actionPanel,
    strikePanel,
    // approveNotesPanel,
  ];

  container.replaceChildren(...elemsArr);

  return container;
})();

function showRecommendations() {
  // remove old notes
  const existingNotes = shadowDOMSearch('#recommendation-notes')?.[0];

  if (existingNotes) {
    existingNotes.parentNode.removeChild(existingNotes);
    console.log('removed old notes', existingNotes);
  }

  // render new ones
  $ui.components
    .recommendationPanel({
      notesArr: recommendationNotes.strike[$utils.get.selectedPolicyId],
    })
    .render();
}

function highlighter(elem, type = 've') {
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
}

function filterTranscript(keywordsArr = $const.violativeWords) {
  console.log('filtering transcript...');
  let transcriptNodesArr = [...shadowDOMSearch('.transcript')];

  let filteredWords = transcriptNodesArr.filter((wordSpan) =>
    keywordsArr.some((word) =>
      wordSpan.textContent.toLowerCase().includes(word)
    )
  );

  console.log(filteredWords);

  filteredWords.forEach((word) => highlighter(word));
  return filteredWords;
}

function filterTranscriptByCategory(
  wordsToFilter = $const.violativeWordsByCategory
) {
  console.log('filtering transcript by category...');
  let transcriptNodesArr = [...shadowDOMSearch('.transcript')];

  let veWords = transcriptNodesArr.filter((wordSpan) => {
    const veWords = wordsToFilter.ve.some((word) =>
      wordSpan.textContent.toLowerCase().includes(word)
    );

    return veWords;
  });

  let hateWords = transcriptNodesArr.filter((wordSpan) => {
    const hateWords = wordsToFilter.hate.some((word) =>
      wordSpan.textContent.toLowerCase().includes(word)
    );

    return hateWords;
  });

  let adultWords = transcriptNodesArr.filter((wordSpan) => {
    const adultWords = wordsToFilter.adult.some((word) =>
      wordSpan.textContent.toLowerCase().includes(word)
    );

    return adultWords;
  });

  // console.log('veWords', veWords);
  // console.log('hateWords', hateWords);
  // console.log('adultWords', adultWords);

  veWords.forEach((word) => highlighter(word, 've'));
  hateWords.forEach((word) => highlighter(word, 'hate'));
  adultWords.forEach((word) => highlighter(word, 'adult'));
}

let debouncedFilterTranscript = $lib._debounce(
  () => filterTranscriptByCategory(),
  1000
);

let throttledFilterTranscript = $lib._throttle(
  () => filterTranscriptByCategory(),
  2000
);

let onHandlers = {
  newVideo() {
    const { click, sendNotification, removeLock, setFrequentlyUsedPolicies } =
      $utils;

    !document.hasFocus() && sendNotification(`New item 👀`);

    $utils.clearTimers();

    setTimeout(click.myReviews, 1000);
    setFrequentlyUsedPolicies();
    removeLock();
    drawUI();
    uiFactory.mutations.expandTranscriptContainer();

    // DEPRECATED, use mutation observers
    // onHandlers.onScrollFilterTranscript();

    // set up mutation observer
    observers.mutationObserver.observe(
      uiFactory.dom.videoDecisionPanel.shadowRoot,
      observers.observerOptions
    );

    setTimeout(observeTranscriptMutations, 2000);
    setTimeout(uiFactory.renderWordsTable, 2000);
  },
  onScrollFilterTranscript() {
    // for testing WbpGScJMwag
    try {
      shadowDOMSearch('.transcript-container')[0].addEventListener(
        'scroll',
        () => throttledFilterTranscript()
      );
    } catch (e) {
      console.log(e.stack);
    }
  },
};

function observeTranscriptMutations() {
  try {
    const transcriptPages = shadowDOMSearch('.transcript-pages');
    transcriptPages.forEach((transcript) => {
      const observer = new MutationObserver(observers.handleTranscriptMutation);
      observer.observe(transcript, observers.observerOptions);
    });
  } catch (e) {
    console.log('Could not observer transcript mutations', e.stack);
  }
}

function drawUI() {
  try {
    // right panel with actions
    !shadowDOMSearch('.action-panel') &&
      uiFactory.dom.rightSidebar.appendChild(rightPanel);

    // stopwatch in header
    !shadowDOMSearch('.stopwatch') &&
      uiFactory.dom.header.appendChild($ui.components.stopwatchPanel.stopwatch);

    // trigger notes
    !shadowDOMSearch('.show-notes-btn') &&
      uiFactory.dom.filterControlsPanel.appendChild(
        uiFactory.createIconButton(
          'note_add',
          showRecommendations,
          'show-notes-btn'
        )
      );

    // playback controls
    !shadowDOMSearch('.player-controls-container') &&
      uiFactory.dom.playerControls.drawControlButtons();

    // filter transcript and append words table below metadata
    !shadowDOMSearch('.filter-transcript-table') &&
      uiFactory.dom.filterControlsPanel.appendChild(
        uiFactory.createIconButton(
          'filter_alt',
          uiFactory.renderWordsTable,
          'filter-transcript-table'
        )
      );

    // filter transcript with highlighter
    !shadowDOMSearch('.transcript-filter-btn') &&
      uiFactory.dom.filterControlsPanel.appendChild(
        uiFactory.createIconButton(
          'search',
          throttledFilterTranscript,
          'transcript-filter-btn'
        )
      );

    // check violative videos on channel
    !shadowDOMSearch('.filter-ids-btn') &&
      uiFactory.dom.filterControlsPanel.appendChild(
        uiFactory.createIconButton(
          'troubleshoot',
          uiFactory.renderViolativeIds,
          'filter-ids-btn'
        )
      );

    if (yt.config_.LOGGED_IN_USER === 'bciobirca') initSU();
  } catch (e) {}
}

let newStrike = {
  answers: {},
  answerQuestionnaire(answers) {
    if (!uiFactory.dom.questionnaire)
      throw new Error('Questionnaire Not Rendered!');

    if (!$const.is.queue('metrics')) {
      answers.forEach((answer) =>
        uiFactory.dom.questionnaire.setAnswers(answer)
      );
      uiFactory.dom.questionnaire.onSave();
    }
  },
};

newStrike.answers = {
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
                    startTime: '0s',
                    endTime: '0s',
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
                    startTime: '0s',
                    endTime: '0s',
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
                    startTime: '0s',
                    endTime: '0s',
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
        questionId: 'violent_extremism/question/video_3065_tvc/abuse_location',
        answers: [
          {
            id: 'audio_abusive',
            label: 'Audio: Abusive',
            value: {},
          },
        ],
      },
      {
        questionId: 'violent_extremism/question/video_3065_tvc/audio_features',
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
                    startTime: '0s',
                    endTime: '0s',
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
        questionId: 'violent_extremism/question/video_3065_tvc/abuse_location',
        answers: [
          {
            id: 'abusive',
            label: 'Video: Abusive',
            value: {},
          },
        ],
      },
      {
        questionId: 'violent_extremism/question/video_3065_tvc/video_features',
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
        questionId: 'violent_extremism/question/video_3065_tvc/video_contents',
        answers: [
          {
            id: 'other',
            label: 'Other',
            value: {},
          },
        ],
      },
      {
        questionId: 'violent_extremism/question/video_3065_tvc/visual_segment',
        answers: [
          {
            id: 'time_interval',
            value: {
              timeValue: {
                intervals: [
                  {
                    startTime: '0s',
                    endTime: '0s',
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
        questionId: 'violent_extremism/question/video_3065_tvc/abuse_location',
        answers: [
          {
            id: 'audio_abusive',
            label: 'Audio: Abusive',
            value: {},
          },
        ],
      },
      {
        questionId: 'violent_extremism/question/video_3065_tvc/audio_features',
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
                    startTime: '0s',
                    endTime: '0s',
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
};

function $main() {
  // Event Listeners & Notifications
  window.addEventListener('message', function (event) {
    const { click, sendNotification, removeLock } = $utils;
    const notFocused = () => !document.hasFocus();

    // New video, send notification if not focused
    if (event.data.name === 'HOST_ALLOCATED') {
      onHandlers.newVideo();
    }

    // Submitted video, send notification
    if (event.data.name === 'APP_REVIEW_COMPLETED' && notFocused()) {
      sendNotification(
        `✅ Submitted at ${new Date().toJSON().split('T')[1].slice(0, 8)}`
      );

      // removeLock();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === '`') {
      try {
        uiFactory.dom.videoDecisionPanel.onSubmit();
      } catch (e) {}
    }
  });

  // init
  onHandlers.newVideo();
}

$main();

// superuser
function initSU() {
  // multiple tabs

  shadowDOMSearch('.stopwatch')?.[0].addEventListener('contextmenu', (e) => {
    if (e.ctrlKey) {
      history.pushState({}, '', '#yort');
      window.open('https://yurt.corp.google.com/#review');
    }
  });

  // control panel btns
  !shadowDOMSearch('.clear-unload-btn') &&
    uiFactory.dom.filterControlsPanel.appendChild(
      uiFactory.createIconButton(
        'delete',
        $utils.clearTimers,
        'clear-unload-btn'
      )
    );
}

setTimeout(initSU, 1000);

async function handleApprove(language) {
  const { videoDecisionPanel } = uiFactory.dom;

  videoDecisionPanel.viewMode = 2;
  if (language)
    await retryUntilSuccess(() => action.video.steps.selectLanguage(language));

  action.video.steps.selectPolicy('9008');

  function answerQuestionnaireAndSave() {
    if (!$const.is.queue('metrics')) {
      console.log('not metrics, answering questionnaire');
      newStrike.answerQuestionnaire(newStrike.answers['9008']);
    }
    console.log('saving...');
    uiFactory.dom.questionnaire.onSave();
  }

  await retryUntilSuccess(answerQuestionnaireAndSave);
  videoDecisionPanel.onSave();

  // langAndSave();
}

async function handleStrike(policyId = '3039', contentType = 'video') {
  $const.selectedVEGroup = $utils.get.selectedVEGroup;
  const { expandNotesArea } = uiFactory.mutations;
  const { answers, answerQuestionnaire } = newStrike;
  const {
    selectLanguage: selectLanguageDropdrown,
    selectPolicy,
    addReview,
  } = action.video.steps;

  addReview();
  selectPolicy(policyId);
  $const.selectedVEGroup.text === 'Wagner PMC' &&
    (await retryUntilSuccess(selectLanguage));

  function answerQuestionnaireAndSave() {
    const selectedPolicyId = policyId === '3044' ? '3039' : policyId;
    answerQuestionnaire(answers[selectedPolicyId][contentType]);

    // TODO
    // uiFactory.dom.questionnaire.onSave();
  }

  function selectLanguage() {
    selectLanguageDropdrown('russian');
  }

  await retryUntilSuccess(answerQuestionnaireAndSave);
  showRecommendations();
  expandNotesArea();
}

async function retryUntilSuccess(fn, interval = 200, totalDuration = 1500) {
  const startTime = Date.now();
  let endTime = startTime + totalDuration;

  while (Date.now() < endTime) {
    try {
      const result = await fn();
      console.log(`✅ Function ${fn.name} succeeded: ${result ?? ''}`);
      return result;
    } catch (error) {
      console.log(`[ℹ] Function ${fn.name} failed:`, error.message);
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  console.log(
    `❌ Function ${fn.name} failed after retrying for ${totalDuration} ms.`
  );
}

function getTranscript() {
  let transcript = shadowDOMSearch('yurt-video-transcript')[0];

  let res = Object.getOwnPropertyNames(transcript.__proto__)
    .filter((opt) => Array.isArray(transcript[opt]))
    ?.map((opt) => transcript[opt]);

  return res;
}

function getViolativeWords(
  violativeWordsByCategory = $const.violativeWordsByCategory
) {
  const allWords = getTranscript()[0];
  if (!allWords || allWords.length === 0) return {};

  const filteredWordsByCategory = {};

  for (const category in violativeWordsByCategory) {
    if (violativeWordsByCategory.hasOwnProperty(category)) {
      filteredWordsByCategory[category] = allWords
        .filter((word) =>
          violativeWordsByCategory[category].some((violativeWord) =>
            word.text.toLowerCase().includes(violativeWord)
          )
        )
        .map((obj) => ({
          key: obj.text,
          value: $utils.formatTime(obj.startTimeSec),
          seconds: obj.startTimeSec,
        }));
    }
  }

  return filteredWordsByCategory;
}
// [✅] radu pidar
