document.addEventListener("DOMContentLoaded", function () {
    function loadLesson(element, videoId, title, desc) {
        const videoFrame = document.getElementById("videoFrame");
        const lessonTitle = document.getElementById("lessonTitle");
        const lessonDesc = document.getElementById("lessonDesc");

        videoFrame.src = `https://www.youtube.com/embed/${videoId}`;
        lessonTitle.textContent = title;
        lessonDesc.textContent = desc;

        const lessonItems = document.querySelectorAll(".name-lesson");
        lessonItems.forEach(item => item.classList.remove("active"));

        element.classList.add("active");
    }

    // Gán lại hàm onclick cho tất cả item (đảm bảo dùng JS, không HTML inline)
    const lessons = document.querySelectorAll('.name-lesson');
    lessons.forEach(item => {
        item.addEventListener('click', function () {
            const videoId = item.getAttribute('data-video-id');
            const title = item.getAttribute('data-title');
            const desc = item.getAttribute('data-desc');
            loadLesson(item, videoId, title, desc);
        });
    });

    // Tự động click phần tử đầu tiên
    if (lessons.length > 0) {
        lessons[0].click();
    }


    const menuIcon = document.getElementById("menu-icon-lesson");
    const sideMenu = document.getElementById("sideMenu");

    menuIcon.addEventListener("click", function (e) {
        e.stopPropagation(); // tránh trigger document click
        sideMenu.classList.toggle("active");
        menuIcon.classList.toggle("bx-x");
        menuIcon.classList.toggle("bx-menu");
        document.body.classList.toggle("dimmed");
    });

    // Click ngoài menu sẽ đóng menu và tắt nền mờ
    document.addEventListener("click", function (event) {
        if (!sideMenu.contains(event.target) && !menuIcon.contains(event.target)) {
            sideMenu.classList.remove("active");
            document.body.classList.remove("dimmed");
            menuIcon.classList.remove("bx-x");
            menuIcon.classList.add("bx-menu");
        }
    });
});
