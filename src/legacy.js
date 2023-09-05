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
    strike(answers) {
      const { addReview, selectLanguage } = action.video.steps;

      let veGroup = $utils.get.selectedVEGroup();

      selectedVEGroup = $utils.get.selectedVEGroup(true);

      answers.applicable_ve_group = { value: veGroup };

      addReview();
      veGroup === 'wagner_pmc' && selectLanguage('russian');

      console.log('[i] Strike:', answers);

      clearInterval($timers.STRIKE_ID);

      $timers.STRIKE_ID = setInterval(
        () => answerQuestionnaire(answers),
        $config.FUNCTION_CALL_RETRY_MS
      );
      setTimeout(() => clearInterval($timers.STRIKE_ID), 10000);
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

function answerQuestion(question, answers) {
  const {
    abuse_location,
    applicable_ve_group,
    act_type,
    audio_features,
    video_features,
    video_contents,
    video_type,
    audio_segment,
    video_segment,
    confidence_level,
    violation_reason,
  } = answers;

  const {
    click: {
      checklist,
      listItem,
      checkbox,
      element: clickElement,
      radio: clickRadioBtn,
    },
    clickDone,
    clickNext,
  } = $utils;

  const questionnaire = shadowDOMSearch('yurt-core-questionnaire')?.[0];
  // questionId is always last
  let lastElementIndex = question.id.split('/').length - 1;
  let questionId = question.id.split('/')[lastElementIndex];

  console.log(`[❔] Answering ${questionId}.`);

  // Video Strike
  if (questionId === 'abuse_location') {
    listItem(abuse_location.listItem);
    checklist(abuse_location.checklist);
    checkbox({ value: 'video' });
  } else if (
    ['applicable_ve_group', 'applicable_ve_actor'].includes(questionId)
  ) {
    listItem(applicable_ve_group);
  } else if (questionId === 'act_type') {
    listItem(act_type);
  } else if (questionId === 'violation_reason') {
    clickRadioBtn(violation_reason);
  } else if (questionId === 'video_features') {
    video_features.forEach((arg) => checkbox(arg));
  } else if (questionId === 'audio_features') {
    listItem(audio_features);
  } else if (questionId === 'video_contents') {
    video_contents.forEach((arg) => checkbox(arg));
  } else if (questionId === 'video_type') {
    listItem(video_type);
  } else if (questionId === 'borderline_video/borderline_decision') {
    listItem();
  } else if (
    ['video_segment', 'audio_segment', 'visual_segment'].includes(questionId) &&
    (audio_segment || video_segment || visual_segment)
  ) {
    clickElement('tcs-button', {
      'data-test-id': 'label-questionnaire-time-annotation-button',
    });

    clickElement('tcs-button', {
      'data-test-id': 'label-questionnaire-time-annotation-button',
    });
  } else if (questionId === 'confidence_level') {
    listItem(confidence_level);
  }

  // Click Next after answering each question, just to be sure
  clickNext();

  console.log(`[✅] Question Answered: ${questionId}`);
  if (question.deferTraversal || questionnaire.labellingGraph.isCompleted) {
    console.log('[✅] Questionnaire Submitted');
    clickDone();
    clearInterval($timers.STRIKE_ID);
    // render notes recommendations for strike with chosen policy id

    const chosenPolicyId = shadowDOMSearch('yurt-core-questionnaire')?.[0]
      ?.policy?.id;

    setTimeout(() => uiFactory.mutations.expandNotesArea(), 1);

    // SHOW STRIKE RECOMMENDATIONS
    $ui.components
      .recommendationPanel({
        notesArr: recommendationNotes.strike[chosenPolicyId],
      })
      .render();
  }
}

function answerQuestionnaire(answerArgs) {
  let currentQuestions = shadowDOMSearch(
    'yurt-core-label-questionnaire-question-type-mapper'
  )?.[0]?.currentQuestions;

  if (!currentQuestions) {
    return;
  }

  if (currentQuestions?.length > 1) {
    currentQuestions.forEach((subQuestion) =>
      answerQuestion(subQuestion, answerArgs)
    );
    return;
  }

  try {
    answerQuestion(currentQuestions[0], answerArgs);
  } catch (e) {
    console.log(arguments.callee.name, e.stack);
  } finally {
    return;
  }
}
