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
  const myUrl = url ?? 'https://discord-clone-wss.fly.dev/furkd';

  const socket = io(myUrl, {
    transports: ['websocket'], // Use WebSocket for better performance
    withCredentials: true, // If cookies are involved
  });

  window.addEventListener('message', function (event) {
    if (event.data.name === 'HOST_ALLOCATED') {
      socket.emit(
        'new-item',
        dom_.reviewRoot.hostAllocatedMessage.reviewData.videoReviewData
          .videoReviewMetadata
      );
    }
  });

  return socket;
}

await loadSocketIO();
var socket = initSocketClient();

// debugging
socket?.onAny((event, payload) => {
  console.log(`Received data for ${event}:\n`, payload);
});

// socket listeners
socket.on('get-filtered-transcript', () => {
  socket.emit('get-filtered-transcript', transcript_.getViolativeWords());
});

socket.on('get-strike-history', async () => {
  const history = await api.get.strikeHistory();
  socket.emit('get-strike-history', history);
});

socket.on('get-filtered-channel-transcripts', async () => {
  const transcripts = await transcript_.getChannelViolativeWords();

  socket.emit('get-filtered-channel-transcripts', transcripts);
});

socket.on('get-channel-id', () => {
  socket.emit(
    'get-channel-id',
    dom_.reviewRoot.hostAllocatedMessage.reviewData.videoReviewData
      .videoReviewMetadata.externalChannelId
  );
});

socket.on('get-history', async () => {
  const history = await rc.getEntityHistory();
  socket.emit('get-history', history);
});

socket.on('submit', () => {
  dom_.submitBtn.click();
});

socket.on('set-review', (review) => {
  console.log(review);
  if (review.policyId === '9008') {
    rc.setSeekTime();
    action_.video.approve(review.language);
    return;
  }
});

socket.on('get-review', () => {
  socket.emit('get-review', rc.getReview());
});
