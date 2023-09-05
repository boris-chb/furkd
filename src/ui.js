export function createButton(
  label = 'My Button',
  onClick = () => {},
  className
) {
  let btn = this.strToNode(
    `<tcs-button spec="flat-primary">${label}</tcs-button>`
  );
  btn.onclick = onClick;
  className && btn.classList.add(className);
  return btn;
}
export function createIconButton(icon, onClick = () => {}, className) {
  const element = this.strToNode(`<tcs-icon-button icon="${icon}" />`);
  element.onclick = onClick;
  if (className) element.classList.add(className);

  return element;
}
export function strToNode(str) {
  const tmp = document.createElement('div');
  tmp.innerHTML = str;
  if (tmp.childNodes.length < 2) {
    return tmp.childNodes[0];
  }
  return tmp.childNodes;
}
export function showNotesRecommendations(policyId) {
  $ui.components
    .recommendationPanel({
      notesArr: recommendationNotes.strike[policyId],
    })
    .render();
}

// DOM elements
export const dom = {
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
    return shadowDOMSearch('yurt-video-decision-panel-v2')[0];
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
  getElementByQueryStr(queryStr) {
    let element;
    try {
      element = shadowDOMSearch(queryStr)[0];
    } catch (e) {
      console.log(`Could not find ${queryStr}`);
    }
    return element;
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
};

export const mutations = {
  expandTranscriptContainer() {
    try {
      let videoContextContainer = shadowDOMSearch(
        '.video-context-section'
      )?.[0];
      let videoContextPanel = shadowDOMSearch('yurt-video-context-panel')?.[0];
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
};
