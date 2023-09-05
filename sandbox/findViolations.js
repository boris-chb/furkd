function findViolations(array1, array2) {
  let violationsCount = 0;
  let startTimeOfViolations = null;

  for (let i = 0; i < array1.length; i++) {
    const word = array1[i].text;
    const startTime = array1[i].startTimeSec;

    if (array2.includes(word)) {
      violationsCount++;

      if (violationsCount === 1) {
        // Store the start time of the first violation in the 60-second series
        startTimeOfViolations = startTime;
      }

      if (violationsCount === 10) {
        // Check if the 10 violations are within a 60-second period
        const endTimeOfLastViolation = array1[i].endTimeSec;
        const timeDifference = endTimeOfLastViolation - startTimeOfViolations;

        if (timeDifference <= 61) {
          return startTimeOfViolations; // Return the start time of the 10 violations
        } else {
          violationsCount = 1; // Reset violations count and start new series
          startTimeOfViolations = startTime;
        }
      }
    } else {
      violationsCount = 0; // Reset violations count if the word is not a violation
    }
  }

  return null; // Return null if no 60-second series with 10 violations is found
}

let array1 = [
  { text: 'myWord', startTimeSec: 0.0, endTimeSec: 6.0 },
  { text: 'myWord1', startTimeSec: 6.0, endTimeSec: 12.0 },
  { text: 'myWord1', startTimeSec: 12.0, endTimeSec: 18.0 },
  { text: 'myWord1', startTimeSec: 18.0, endTimeSec: 24.0 },
  { text: 'myWord1', startTimeSec: 24.0, endTimeSec: 30.0 },
  { text: 'myWord1', startTimeSec: 30.0, endTimeSec: 36.0 },
  { text: 'myWord1', startTimeSec: 36.0, endTimeSec: 42.0 },
  { text: 'myWord1', startTimeSec: 42.0, endTimeSec: 48.0 },
  { text: 'myWord1', startTimeSec: 48.0, endTimeSec: 54.0 },
  { text: 'myWord1', startTimeSec: 54.0, endTimeSec: 60.0 },
  { text: 'myWord11', startTimeSec: 60.0, endTimeSec: 66.0 },
  { text: 'myWord1', startTimeSec: 66.0, endTimeSec: 72.0 },
  { text: 'myWord13', startTimeSec: 72.0, endTimeSec: 78.0 },
  { text: 'myWord14', startTimeSec: 78.0, endTimeSec: 84.0 },
  { text: 'myWord15', startTimeSec: 84.0, endTimeSec: 90.0 },
  { text: 'myWord1', startTimeSec: 90.0, endTimeSec: 96.0 },
  { text: 'myWord17', startTimeSec: 96.0, endTimeSec: 102.0 },
  { text: 'myWord18', startTimeSec: 102.0, endTimeSec: 108.0 },
  { text: 'myWord19', startTimeSec: 108.0, endTimeSec: 114.0 },
  { text: 'myWord20', startTimeSec: 114.0, endTimeSec: 120.0 },
];

const array2 = ['myWord1', 'myWord20', 'wasup'];

let res = findViolations(array1, array2);
console.log(res);
