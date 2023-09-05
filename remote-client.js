//  https://cdn.socket.io/4.5.4/socket.io.min.js
function loadSocketIO() {
  return new Promise((resolve, reject) => {
    var script = document.createElement('script');
    script.src = 'https://cdn.socket.io/4.5.4/socket.io.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function initSocketClient(url) {
  const myUrl = url ?? 'https://yqs9mn-3000.csb.app/';

  const socket = io(myUrl, {
    transports: ['websocket'], // Use WebSocket for better performance
    withCredentials: true, // If cookies are involved
  });

  window.addEventListener('message', function (event) {
    if (event.data.name === 'HOST_ALLOCATED') {
      socket.emit(
        'chat message',
        dom_.reviewRoot.hostAllocatedMessage.reviewData.videoReviewData
          .videoReviewMetadata
      );
    }
  });

  return socket;
}

await loadSocketIO();
var socket = initSocketClient();

// socket listeners
socket.on('chat message', (msg) => {
  const { payload } = msg;
  if (payload?.policyId === '9008') {
    action_.video.approve(payload.language);
  } else if (payload?.policyId?.startsWith('30')) {
    const { policyId, contentType } = payload;
    action_.video.strike(policyId, contentType);
  }
});

socket.on('save', () => {
  dom_.videoDecisionPanel.onSave();
});

socket.on('submit', () => {
  dom_.videoDecisionPanel.onSubmit();
});

socket.on('approve', (language) => {
  action_.video.approve(language);
});

socket.on('add note', (note) => {
  action_.video.addNote(note);
});

socket.on('delete review', () => {
  action_.delete();
});

socket.on('strike', ({ policyId, contentType }) => {
  action_.video.strike(policyId, contentType);
});

let metadata = {
  externalVideoId: 'Yz7cCgNfaQE',
  videoTitle: '9 января 2023 г.',
  videoViewCount: '51',
  videoUploadTime: '2023-01-09T19:02:24Z',
  externalChannelId: 'UCJ7AjllXyajzdmEU0Qi-JsA',
  userGaiaId: '499639566631',
  userDisplayName: 'Zeta_zloradik',
  channelAvatarUrl:
    'https://yt3.ggpht.com/ckOtocmAFZfz4N-7avT3JP1RbpSGGoGxgEM1fqKhCPbeVl9iKivnyKFA1qmy70gwJJHHYS1FWA=s176-c-k-c0x00ffffff-no-rj',
  userAge: 33,
  channelDescription: 'Я НАЧИНЩИЙ ЮТУБЕР ТТ:zeta_zloradik ',
  channelCountryCode: 'MD',
  channelVideoCount: '38',
  channelSubscriberCount: '28',
  channelGradsScore: '4',
  channelTitle: 'Zeta_zloradik',
  videoAsrLanguage: 'ro',
  videoIsShortMobileVideo: true,
  videoPrivacy: 'PUBLIC',
  videoActiveGeoBlockSummary: {},
  videoStateFields: {
    state: 'PROCESSED',
    stateDetail: 'STATE_DETAIL_EMPTY',
  },
  hasMaxresThumbnail: true,
  alcInfo: {},
};

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
