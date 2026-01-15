(function () {
  function isMobile() {
    return /Android|iPhone|iPod/i.test(navigator.userAgent);
  }

  if (!isMobile()) return;

  function setVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  setVH();

  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', setVH);
})();