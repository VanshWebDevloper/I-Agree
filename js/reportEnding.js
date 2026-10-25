const endingPage = new URL('../ending.html', document.currentScript.src).href;
const reportForm = document.getElementById('report');

if (reportForm) {
  reportForm.addEventListener('submit', () => {
    if (localStorage.getItem('hackAlert') !== '1') return;

    localStorage.setItem('reported', '1');
    setTimeout(() => {
      if (window.top !== window) {
        window.top.location.href = endingPage;
        return;
      }

      window.location.href = endingPage;
    }, 1500);
  });
}
