class pagesM {
    constructor() {
        this.sidebarLinks = document.querySelectorAll('#sidebar div');
        this.pages = document.querySelectorAll('.page');
        this.sidebar = document.getElementById('sidebar');
        this.mainDiv = document.getElementById('main');
        this.Listener()
    }
    Listener = () => {
        this.sidebarLinks.forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();

                const pageId = link.dataset.page;
                location.hash = '#' + pageId;
                window.scrollTo(0, 0)
            });
        });
        window.addEventListener('hashchange', this.showDiv);
        document.addEventListener('DOMContentLoaded', () => {
            if (location.hash.indexOf('#') == -1) {
                location.hash = '#welcome'
            }
            this.showDiv()
        });
        this.mainDiv.addEventListener('click', () => {
            this.sidebar.classList.add("collapsed")
            this.mainDiv.classList.add("collapsed")
            // BlockadeM.BlockingSettings.classList.add("collapsed")
        })
        
        this.sidebar.addEventListener('click', () => {
            // BlockadeM.BlockingSettings.classList.remove("collapsed")
            this.sidebar.classList.remove('collapsed');
            this.mainDiv.classList.remove('collapsed');
        });
    }
    showDiv = () => {
        let hash = location.hash;

        this.pages.forEach(page => page.classList.remove('active'));
        document.querySelector(hash).classList.add('active');

        this.sidebarLinks.forEach(link => link.classList.remove('active'));
        document.querySelector(`[data-page=${hash.substring(1)}]`).classList.add('active');

    }
}

//--------------------------------------------------------------------------
