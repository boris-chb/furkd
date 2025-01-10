let targets = [
  'МоСкВиЧкА',
  // '_Татарин_',
  // 'Реактивный',
  // 'Kitsune',
  // 'Федор Мармеладович',
];

async function rerollPvp(top = false) {
  await fetch('http://moswar.net/travel2/', {
    headers: {
      accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
      'cache-control': 'max-age=0',
      'content-type': 'application/x-www-form-urlencoded',
      'upgrade-insecure-requests': '1',
    },
    referrer: 'http://moswar.net/travel2/',
    referrerPolicy: 'strict-origin-when-cross-origin',
    body: `action=roll${
      top ? '2' : ''
    }&ajax=1&__referrer=%2Ftravel2%2F&return_url=%2Ftravel2%2F`,
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
  });
}

async function delay(s = 1) {
  return new Promise((res) => setTimeout(res, s * 1000));
}

async function rerollMoskvichka() {
  try {
    for (let i = 0; i <= 10; i++) {
      const enemyNickname = await utils_.getElementsOnThePage(
        '.worldtour__enemy-nickname',
        'http://moswar.net/travel2/'
      );

      const nickname = enemyNickname[0].innerText;

      if (!nickname) {
        console.log('Nickname not found');
        return;
      }

      if (targets.includes(nickname)) {
        console.log(`Found enemy! ${nickname}`);
        await fightPvp();
        AngryAjax.goToUrl('/travel2/');
      }

      console.log(`Rerolling (attempt ${i + 1}) ${nickname}`);
      await rerollPvp(i === 0); // First reroll with true, subsequent with false
    }
    console.log('МоСкВиЧкА not found after 10 attempts.');
  } catch (e) {
    console.log('Could not search for opponent:\n', e);
  }
}

async function secondSelf() {
  await fetch('http://moswar.net/fight/', {
    headers: {
      accept: '*/*',
      'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'x-requested-with': 'XMLHttpRequest',
    },
    referrer: 'http://moswar.net/fight/238690835/',
    referrerPolicy: 'strict-origin-when-cross-origin',
    body: 'action=useabl&json=1&target=363&__referrer=%2Ffight%2F238690835%2F&return_url=%2Ffight%2F238690835%2F',
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
  });
}

async function attackRandom() {
  await fetch('http://moswar.net/fight/', {
    headers: {
      accept: '*/*',
      'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'x-requested-with': 'XMLHttpRequest',
    },
    referrer: 'http://moswar.net/fight/238690835/',
    referrerPolicy: 'strict-origin-when-cross-origin',
    body: 'action=attack&json=1&__referrer=%2Ffight%2F238690835%2F&return_url=%2Ffight%2F238690835%2F',
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
  });
}

async function roar() {
  await fetch('http://moswar.net/fight/', {
    headers: {
      accept: '*/*',
      'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'x-requested-with': 'XMLHttpRequest',
    },
    referrer: 'http://moswar.net/fight/238691291/',
    referrerPolicy: 'strict-origin-when-cross-origin',
    body: 'action=useabl&json=1&target=-310&__referrer=%2Ffight%2F238691291%2F&return_url=%2Ffight%2F238691291%2F',
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
  });
}

async function fightPvp() {
  showHPAlert();
  await delay(0.5);
  await fetch('http://moswar.net/travel2/', {
    headers: {
      accept: '*/*',
      'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'x-requested-with': 'XMLHttpRequest',
    },
    referrer: 'http://moswar.net/travel2/',
    referrerPolicy: 'strict-origin-when-cross-origin',
    body: 'action=fight&ajax=1&__referrer=%2Ftravel2%2F&return_url=%2Ftravel2%2F',
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
  });

  AngryAjax.goToUrl('/travel2/');
}

async function battle() {
  await secondSelf();
  await roar();
  for (let i = 0; i < 10; i++) {
    await attackRandom();
  }

  setTimeout(() => AngryAjax.goToUrl('/travel2/'), 12000);
  setTimeout(() => AngryAjax.goToUrl('/travel2/'), 13000);
}
