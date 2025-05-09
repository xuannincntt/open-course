document.querySelectorAll('.section-header').forEach(header => {
    header.addEventListener('click', () => {
        const section = header.parentElement;
        section.classList.toggle('open');
    });
});

document.querySelector('.toggle-all')?.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.section').forEach(section => section.classList.add('open'));
});