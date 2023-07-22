const sidebarLinks = document.querySelectorAll('#sidebar div');
const pages = document.querySelectorAll('.page');

sidebarLinks.forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();

        const pageId = link.dataset.page;
        location.hash = '#' + pageId;
        window.scrollTo(0,0)
    });
});
window.addEventListener('hashchange', showDiv);
document.addEventListener('DOMContentLoaded', () => {
    if (location.hash.indexOf('#') == -1) {
        location.hash = '#welcome'
    }
    showDiv()
});

function showDiv() {
    let hash = location.hash;

    pages.forEach(page => page.classList.remove('active'));
    document.querySelector(hash).classList.add('active');

    sidebarLinks.forEach(link => link.classList.remove('active'));
    document.querySelector(`[data-page=${hash.substring(1)}]`).classList.add('active');

}

const sidebar = document.getElementById('sidebar');
const mainDiv = document.getElementById('main');

mainDiv.addEventListener('click', () => {
    sidebar.classList.add("collapsed")
    mainDiv.classList.add("collapsed")
})

sidebar.addEventListener('click', () => {
    sidebar.classList.remove('collapsed');
    mainDiv.classList.remove('collapsed');
});
//--------------------------------------------------------------------------
setTimeout(() => {
    window.scrollTo(0,0)
}, 100);
