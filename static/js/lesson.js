document.addEventListener("DOMContentLoaded", function () {
    function loadLesson(element, videoId, title, desc) {
        const videoFrame = document.getElementById("videoFrame");
        const video = document.getElementById("video");
        const lessonTitle = document.getElementById("lessonTitle");
        const lessonDesc = document.getElementById("lessonDesc");

        if (videoId.includes("youtube")) {
            videoFrame.src = `${videoId}`;
            console.log(videoId);
            video.style.display = "none";
            videoFrame.style.display = "block";
        } else {
            video.src = `${videoId}`;
            videoFrame.style.display = "none";
            video.style.display = "block";
        }
        lessonTitle.textContent = title;
        lessonDesc.textContent = desc;
        const lessonItems = document.querySelectorAll(".name-lesson");
        lessonItems.forEach(item => item.classList.remove("active"));

        element.classList.add("active");
    }

    function enrollLesson(userId, courseId, lessonId) {
        fetch('/enroll_lesson', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,      // NOTE: biến này lấy từ template
                course_id: courseId,  // NOTE: biến này lấy từ template
                lesson_id: lessonId
            })
        })
        .then(response => response.json())
        .then(data => console.log(data.message))
        .catch(error => console.error('Error:', error));
    }

    // Gán lại hàm onclick cho tất cả item (đảm bảo dùng JS, không HTML inline)
    const lessons = document.querySelectorAll('.name-lesson');
    lessons.forEach(item => {
        item.addEventListener('click', function () {
            const videoId = item.getAttribute('data-video-id');
            const title = item.getAttribute('data-title');
            const desc = item.getAttribute('data-desc');
            const userId = item.getAttribute('data-userId');
            const courseId = item.getAttribute('data-courseId');
            const lessonId = item.getAttribute('data-lesson-id');
            console.log(lessonId)
            loadLesson(item, videoId, title, desc);
            enrollLesson(userId, courseId, lessonId);
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
