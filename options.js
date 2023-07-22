const sidebarLinks = document.querySelectorAll('#sidebar a');
const pages = document.querySelectorAll('.page');

sidebarLinks.forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();

        const pageId = link.dataset.page;
        const page = document.getElementById(pageId);

        sidebarLinks.forEach(link => link.classList.remove('active'));
        link.classList.add('active');

        pages.forEach(page => page.classList.remove('active'));
        page.classList.add('active');
    });
});


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
