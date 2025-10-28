const sideMenu = document.querySelector('aside');
const menuBtn = document.getElementById('menu-btn');
const closeBtn = document.getElementById('close-btn');

const darkMode = document.querySelector('.dark-mode');

menuBtn.addEventListener('click', () => {
    sideMenu.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
    sideMenu.style.display = 'none';
});

darkMode.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode-variables');
    darkMode.querySelector('span:nth-child(1)').classList.toggle('active');
    darkMode.querySelector('span:nth-child(2)').classList.toggle('active');
})

     // JS hiển thị section khi click menu mới
        const menuLinks = document.querySelectorAll('aside .sidebar a[data-target]');
        const sections = document.querySelectorAll('main section.custom-section');
        menuLinks.forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                // remove active menu
                menuLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                // hide all sections
                sections.forEach(sec => sec.classList.remove('active'));
                // show target
                const target = document.getElementById(link.dataset.target);
                if (target) target.classList.add('active');
            });
        });