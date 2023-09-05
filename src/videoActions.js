import { dom } from './ui';

function approveVideo() {
  const { videoDecisionPanel } = dom;

  videoDecisionPanel.viewMode = 2;
}

function retry(func) {
  return new Promise((resolve, reject) => {
    // Do something asynchronously, e.g., AJAX request, form submission
    // If successful, resolve the promise, otherwise reject it
    // Example:
    setTimeout(() => {
      try {
        func();
      } catch (e) {
        reject(e);
      }
    }, 1000); // Replace 1000 with the actual time needed for this step
  });
}

let myList = `<mwc-list>
<!--?lit$658385021$--><!----> <mwc-list-item hasmeta="" value="video" mwc-list-item="" tabindex="0" aria-disabled="false">
<!--?lit$658385021$-->
<span class="option-label"><!--?lit$658385021$-->Video</span>
<tcs-icon data-test-id="label-questionnaire-list-category-icon" slot="meta" class="category-icon" family="material" spec="default">
<!--?lit$658385021$-->expand_more
</tcs-icon>
</mwc-list-item>
<mwc-list class=" hide ">
<!--?lit$658385021$--><!---->
<mwc-check-list-item value="3044" group="policy-selector" mwc-list-item="" tabindex="0" graphic="control" aria-disabled="false">
<!--?lit$658385021$-->&nbsp;&nbsp;&nbsp;&nbsp;
<span class="option-label"> <!--?lit$658385021$-->3044</span>
</mwc-check-list-item>
<!----><!---->
<mwc-check-list-item value="3039" group="policy-selector" mwc-list-item="" tabindex="0" graphic="control" aria-disabled="false">
<!--?lit$658385021$-->&nbsp;&nbsp;&nbsp;&nbsp;
<span class="option-label"> <!--?lit$658385021$-->3039</span>
</mwc-check-list-item>
<!----><!---->
<mwc-check-list-item value="3065" group="policy-selector" mwc-list-item="" tabindex="0" graphic="control" aria-disabled="false">
<!--?lit$658385021$-->&nbsp;&nbsp;&nbsp;&nbsp;
<span class="option-label"> <!--?lit$658385021$-->3065</span>
</mwc-check-list-item>
<!----><!---->
</mwc-list><!---->
</mwc-list>`;

function createDropdownMenu(props) {
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
}

uiFactory.dom.metadataPanel.appendChild(
  createDropdownMenu({
    label: 'bro',
    children: [{ key: 'bro', value: 'brobro' }],
  })
);

function createWordsList(listItemsArr) {
  const { strToNode } = uiFactory;
  let myLabelledList = strToNode(`<tcs-labeled-list spec="primary">
  </tcs-labeled-list>`);

  const listItemsChildren = listItemsArr.map((item) => {
    const listItem = strToNode(`<tcs-labeled-list-item key="${item.key}">
    </tcs-labeled-list-item>`);

    const timeStampChip = strToNode(
      `<tcs-chip spec="tag" text="${item.value}"></tcs-chip>`
    );

    timeStampChip.onclick = () => playerControls.player.seekTo(item.seconds);
    timeStampChip.style.cursor = 'pointer';

    listItem.appendChild(timeStampChip);
    return listItem;
  });

  myLabelledList.replaceChildren(...listItemsChildren);
  return myLabelledList;
}

function getViolativeWords() {
  const transcript = getTranscript();
  const allWords = getTranscript()[0];
  if (!allWords || allWords.length === 0) return;

  const filteredWords = allWords
    .filter((word) => word.text.includes('бля'))
    .reduce((result, obj) => {
      result.push({
        key: obj.text,
        value: $utils.formatTime(obj.startTimeSec),
        seconds: obj.startTimeSec,
      });
      return result;
    }, []);

  return filteredWords;
}

Object.keys($reviewRoot.hostAllocatedMessage).forEach((property) => {
  let res = Object.keys($reviewRoot.hostAllocatedMessage[property]).forEach(
    (nestedProperty) => {
      if (
        $reviewRoot.hostAllocatedMessage[property][nestedProperty]?.id &&
        $reviewRoot.hostAllocatedMessage[property][nestedProperty]?.tier &&
        $reviewRoot.hostAllocatedMessage[property][nestedProperty]?.name
      ) {
        return $reviewRoot.hostAllocatedMessage[property][nestedProperty];
      }
    }
  );
  console.log(res);

  return res;
});
