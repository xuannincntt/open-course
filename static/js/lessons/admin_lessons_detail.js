
document.addEventListener("DOMContentLoaded", async () => {
    const courseName = document.getElementById("course-name");
    const lessonName = document.getElementById("lesson-name");
    const lessonContent = document.getElementById("lesson-video");
    const lessonVideo = document.getElementById("lesson-video");
    const pathParts = window.location.pathname.split('/');
    const lessonId = pathParts[pathParts.length - 1];
    console.log(lessonId);
    let selectedLesson;
    try {
        const response = await fetch("/api/admin/lessons/"+lessonId,{
            method: "GET"
        });
        const data = await response.json();
        selectedLesson = data.lesson;
        console.log(selectedLesson);
        if (!selectedLesson){
            throw new Error("Lesson not found");
        }
        
    } catch (error) {
        console.error(error);
        alert(error.message);
        return;
    }

    courseName.textContent = selectedLesson.courseName;
    lessonName.textContent = selectedLesson.name;
    lessonContent.textContent = selectedLesson.content;
    lessonVideo.src=selectedLesson.video_url;
    lessonVideo.style.display="block";

});