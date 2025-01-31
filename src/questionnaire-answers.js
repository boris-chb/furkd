const inputMap = new Map([
  [
    'violent_extremism/question/video_incubation/exit_fbl',
    [
      {
        id: 'no_skip',
        label: "I don't need to skip",
        value: {},
      },
    ],
  ],
  [
    'violent_extremism/question/video_incubation/does_this_video_or_its_z2hlS_Bu0t7a',
    [
      {
        id: 'yes',
        label: 'Yes',
        value: {},
      },
    ],
  ],
  [
    'violent_extremism/question/video_incubation/violation',
    [
      {
        id: 'violent_extremism_in_gaming',
        label: 'Violent Extremism in Gaming',
        value: {},
      },
    ],
  ],
  [
    'violent_extremism/question/video_incubation/select_applicable_ve_a_~wyBTCcS14Ia',
    [
      {
        id: 'wagner_pmc',
        label: 'Wagner PMC - VNSA',
        value: {},
      },
    ],
  ],
  [
    'violent_extremism/question/video_incubation/does_the_video_or_meta_G9cqLPDpLshe',
    [
      {
        id: 'no',
        label: 'No',
        value: {},
      },
    ],
  ],
  [
    'violent_extremism/question/video_incubation/what_does_the_video_co_zfRh2R.gSbdn',
    [
      {
        id: 'violative_dissemination_of_ve_actor_content_including_through_sandboxing_or_modding',
        label:
          'Violative Dissemination of VE Actor Content, including through sandboxing or modding',
        value: {},
      },
    ],
  ],
  [
    'violent_extremism/question/video_incubation/does_the_content_conta_l3ShmJL.6KBK',
    [
      {
        id: 'no',
        label: 'No',
        value: {},
      },
    ],
  ],
  [
    'violent_extremism/question/video_incubation/is_the_uploader_a_publ_8mieSJAwjmwS',
    [
      {
        id: 'no',
        label: 'No',
        value: {},
      },
    ],
  ],
  [
    'violent_extremism/question/video_incubation/ts_gaming',
    [
      {
        id: 'time_interval',
        value: {
          timeValue: {
            intervals: [
              {
                startTime: '0s',
                endTime: '784s',
                intervalRatio: 1,
              },
            ],
          },
        },
      },
    ],
  ],
  [
    'violent_extremism/question/video_incubation/recommend_3065',
    [
      {
        id: '3065',
        label: '3065',
        value: {
          integerValue: '3065',
        },
      },
    ],
  ],
]);

const output = Array.from(inputMap).map(([questionId, answers]) => ({
  questionId,
  answers,
}));

console.log(output);
