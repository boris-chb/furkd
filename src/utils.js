export function clickElement(
  queryStr,
  args,
  retries = $config.CLICK_BUTTON_RETRY_COUNT
) {
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
}

export function listItem(listArgs) {
  // Values: 'video' || 'audio' || 'metadata'
  // STEP: Label the location of abuse (modality)
  $utils.click.element('mwc-list-item', listArgs);
}

export function listItemByInnerText(...args) {
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
}
export function checkbox(listArgs) {
  $utils.click.element('mwc-checkbox', listArgs);
}
export function checklist(listArgs) {
  $utils.click.element('mwc-check-list-item', listArgs);
}
export function radio(listArgs) {
  $utils.click.element('mwc-radio', listArgs);
}
export function myReviews() {
  $utils.click.element('mwc-tab', {
    label: '"My Reviews (0)"',
  });
  $utils.click.element('mwc-tab', {
    label: '"My Reviews"',
  });
}

export function getSelectedPolicyId() {
  let policyItem = shadowDOMSearch('yurt-core-policy-selector-item')?.[0];
  if (!policyItem) return;
  return policyItem.policy.id;
}
export function getTimeElapsed() {
  var timeDiff = Math.round(
    (new Date() - new Date($reviewRoot?.allocateStartTime)) / 1000
  );

  if (timeDiff === 300) $utils.sendNotification('⏳ 5 min');
  if (timeDiff === 600) $utils.sendNotification('⏳ 10 min');

  return timeDiff >= 19800 ? 0 : timeDiff;
}
export function getCommentText() {
  let reviewData =
    shadowDOMSearch('yurt-review-root')[0].hostAllocatedMessage.reviewData;
  return reviewData.commentReviewData.commentThread.requestedComment
    .commentText;
}
export function getSafetyNetProtections() {
  let safetyNetDialog = shadowDOMSearch('yurt-core-safety-nets-dialog')?.[0];

  try {
    return safetyNetDialog?.safetyNetProtections
      ?.map((item) => `${item?.id} - ${item?.reason}`)
      .join('\n');
  } catch (e) {
    console.log(arguments.callee.name, e.stack);
  }
}
export function getCurrentTimeStr() {
  return $utils.formatTime($utils.get.timeElapsed);
}

export function videoLength(seconds) {
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
    result = parseInt(h, 10) * 3600 + parseInt(m, 10) * 60 + parseInt(s, 10);
  } else {
    [m, s] = videoLengthArr;
    result = parseInt(m, 10) * 60 + parseInt(s, 10);
  }
  return result;
}
export function videoId() {
  return $utils.get.queue.info().entityID;
}
export function videoTimestamp() {
  let videoRoot = shadowDOMSearch('yurt-video-root')[0];

  return $utils.formatTime(videoRoot.playerApi.getCurrentTime());
}
export function selectedVEGroup(label = false) {
  const textLabel = shadowDOMSearch(
    'mwc-select[value=strike_ve_group_dropdown]'
  )?.[0].selectedText;

  const value = shadowDOMSearch(
    'mwc-select[value=strike_ve_group_dropdown]'
  )?.[0].value;

  return label ? textLabel : value;
}

const queue = {
  info() {
    var queueName;
    var queueTier;
    var entityID;
    var reviewRoot = shadowDOMSearch('yurt-review-root')?.[0];

    if (!reviewRoot?.hostAllocatedMessage) return;

    for (const property in Object.keys(reviewRoot.hostAllocatedMessage)) {
      if (
        Object.keys(reviewRoot.hostAllocatedMessage)[property] === 'queueName'
      ) {
        queueName = reviewRoot.hostAllocatedMessage.queueName;
        queueTier = reviewRoot.hostAllocatedMessage.queueTier;
        break;
      } else if (
        reviewRoot.hostAllocatedMessage[
          Object.keys(reviewRoot.hostAllocatedMessage)[property]
        ].hasOwnProperty('queue')
      ) {
        var queueData =
          reviewRoot.hostAllocatedMessage[
            Object.keys(reviewRoot.hostAllocatedMessage)[property]
          ].queue;
        queueName = queueData.name;
        queueTier = queueData.tier;
        break;
      }
    }
    entityID =
      reviewRoot.hostAllocatedMessage.yurtEntityId[
        Object.keys(reviewRoot.hostAllocatedMessage.yurtEntityId)[0]
      ];

    // BUG: THESE VALUES MIGHT BREAK IN THE FUTURE (.zb.fc property names seem to be generated by the framework):

    // try {
    //   queueName = reviewRoot.hostAllocatedMessage.zb.fc.name;
    //   queueTier = reviewRoot.hostAllocatedMessage.zb.fc.tier;
    //   entityID =
    //     reviewRoot.hostAllocatedMessage.yurtEntityId.externalVideoId;
    // } catch (e) {
    //   console.log('Could not fetch queue name, tier and entityId', e.stack);
    // }
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
};

export function clickNext() {
  $utils.click.element('.next-button', { class: 'next-button' });
}
export function clickSubmit(delay) {
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
}
export function submitEndReview(delayMinutes = 0) {
  try {
    setTimeout(
      () => uiFactory.dom.submitEndReviewBtn.click(),
      delayMinutes * 60 * 1000
    );
  } catch (e) {
    console.log('Could not submit and end review\n\n', e);
  }
}
export function clickDone() {
  $utils.click.element('tcs-button', { name: 'label-submit' });
}
export function clickSave() {
  $utils.click.element('tcs-button', {
    'data-test-id': 'decision-annotation-save-button',
  });
}

export function formatTime(input) {
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

  if ((minutesString !== '00' && minutesString < 10) || minutesString === '0') {
    minutesString = '0' + minutesString;
  }

  if (secondsString < 10) {
    secondsString = '0' + secondsString;
  }

  return `${hoursString}:${minutesString}:${secondsString}`;
}

// UI
export function appendNode(node, parent) {
  parent = shadowDOMSearch(
    'yurt-core-decision-annotation-tabs > div:nth-child(1)'
  )?.[0];

  // parent.style.marginBottom = '50px';
  try {
    parent?.appendChild(node);
  } catch (e) {
    console.log(arguments.callee.name, e.stack);
  }
}
export function strToNode(str) {
  const tmp = document.createElement('div');
  tmp.innerHTML = str;
  if (tmp.childNodes.length < 2) {
    return tmp.childNodes[0];
  }
  return tmp.childNodes;
}

// Channel
export async function getChannelVideos() {
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
}
export async function filterVideosByPolicy(policyId = '9008') {
  const { videos } = await this.getChannelVideos();

  let byPolicy = videos.filter((video) => video.appliedPolicy?.id === policyId);

  let violativeIds = byPolicy.map((vid) => vid.externalVideoId).join(', ');
  return byPolicy;
}
export async function filterVideoByKeywords(keywordsArr) {
  const { videos } = await this.getChannelVideos();

  if (!keywordsArr) keywordsArr = $const.filterKeywords;
  let byKeyword = videos.filter((video) =>
    keywordsArr.some((word) => video.videoTitle.toLowerCase().includes(word))
  );

  let violativeVideoIds = byKeyword
    .map((vid) => vid.externalVideoId)
    .join(', ');

  return violativeVideoIds;
}
export async function filterVideoByDescription(keywordsArr) {
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
}

// SETTERS //
export function setNote(noteStr) {
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
}

export function setTimer(minutes, reload = $const.is.autosubmit()) {
  // clean old submit and reload timer
  clearTimeout($timers.SUBMIT_ID);
  clearTimeout($timers.RELOAD_ID);

  if (!$const.is.readyForSubmit()) {
    action.video.review('russian', '9008');
  }

  $utils.clickSubmit(minutes * 60 * 1000);

  console.log(
    `⌚ ✅ Submit in ${minutes} minutes, at ${new Date(
      Date.now() + minutes * 60 * 1000
    )
      .toJSON()
      .split('T')[1]
      .slice(0, 8)}.`
  );

  if (reload) {
    console.log(`🔃 ... with reload.`);

    $lib.reloadPage(minutes + 0.05);
  }

  $utils.removeLock();
  console.table($timers);
}

export function setPageReload(minutes, reset = false) {
  if (reset) {
    clearTimeout($timers.RELOAD_ID);
    $timers.RELOAD_ID = undefined;
    return;
  }
  $timers.RELOAD_ID = setTimeout(
    window.location.reload.bind(window.location),
    // window.close,
    minutes * 60 * 1000
  );
}

export function setFrequentlyUsedPolicies() {
  try {
    shadowDOMSearch('yurt-video-decision-panel-v2')[0].frequentlyUsedPolicies =
      $const.frequentlyUsedPolicies;
  } catch (e) {
    console.log(arguments.callee.name, e.stack);
  }
}

export function sendNotification(text, close = true) {
  let n = new Notification(text);
  // this.clearLastNotification();
  n.onclick = () => {
    parent.focus();
    window.focus();
  };

  // clear notification after 10 seconds
  close && setTimeout(() => n.close(), $config.NOTIFICATION_TIMEOUT_SEC * 1000);
}

export function removeLock() {
  let lock = shadowDOMSearch('yurt-review-activity-dialog')?.[0];
  if (lock) {
    lock.lockTimeoutSec = 3000;
    lock.secondsToExpiry = 3000;
    lock.onExpired = () => {};
  }

  console.log(`🔐LOCK: ${$utils.formatTime(lock?.secondsToExpiry)}`);
}

export function seekVideo(timestampStr) {
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
}

export function clearTimers() {
  Object.keys($timers).forEach((timer) => {
    clearTimeout($timers[timer]);
    clearInterval($timers[timer]);
    console.log(`[🧹] removed ${timer} = ${$timers[timer]}`);
    $timers[timer] = 0;
  });
}
