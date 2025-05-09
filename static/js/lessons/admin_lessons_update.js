import { getCoursesForSelection } from "../utils.js";

const courseSelect = document.getElementById("courseId");
const updateLessonForm = document.getElementsByClassName("update-lesson-form")[0];
const lessonVideoPreview = document.getElementById("lesson-video-preview");
const lessonVideoInput = document.getElementById("lessonVideo");
const lessonYoutubePreview = document.getElementById("lesson-youtube-preview");
const lessonYoutubeInput= document.getElementById("lessonYoutube");
let lessonId;

document.addEventListener("DOMContentLoaded", async () => {
    const pathParts = window.location.pathname.split('/');
    lessonId = pathParts[pathParts.length - 1];
    let courses;
    let selectedLesson;
    try {
        courses = await getCoursesForSelection();
        console.log(courses);
        if (!courses || courses.length <= 0){
            throw new Error("No courses found.")
        }

        const response = await fetch("/api/admin/lessons/"+lessonId, {
            method: "GET"
        });
        const data = await response.json();
        selectedLesson = data.lesson;
        if (!selectedLesson){
            throw new Error("No lesson found.")
        }
        console.log(selectedLesson);

    } catch (error) {
        alert(`There was an error getting courses: ${error.message}`);
        return;
    }

    let courseOptions = ``;
    for (let course of courses){
        courseOptions += `<option value="${course.id}">${course.name}</option>`
    }
    courseSelect.insertAdjacentHTML("beforeend", courseOptions);
    
    updateLessonForm.elements["courseId"].value=selectedLesson.course_id;
    updateLessonForm.elements["lessonName"].value=selectedLesson.name;
    updateLessonForm.elements["lessonContent"].value=selectedLesson.content;
    
    const lessonVideoUrl = selectedLesson.video_url;
    console.log(lessonVideoUrl.includes("youtube"))
    if (lessonVideoUrl.includes("youtube")){
        lessonYoutubeInput.value = lessonVideoUrl;
        lessonYoutubePreview.src = lessonVideoUrl
    }
    else {
        lessonVideoPreview.src=selectedLesson.video_url || "";
        lessonVideoPreview.style.display = "block";
    }
    

});

lessonVideoInput.addEventListener("change", () => {
    const file = lessonVideoInput.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      lessonVideoPreview.src = url;
      lessonVideoPreview.style.display = "block";
      lessonYoutubeInput.disabled=true;
    }
  });

updateLessonForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append('courseId',updateLessonForm.elements['courseId'].value);
    formData.append('lessonName',updateLessonForm.elements['lessonName'].value);
    formData.append('lessonContent',updateLessonForm.elements['lessonContent'].value);
    formData.append('lessonVideo',updateLessonForm.elements['lessonVideo'].files[0]);
    formData.append('lessonYoutube',updateLessonForm.elements['lessonYoutube'].value);


    fetch('/api/admin/lessons/update/'+lessonId, {
        method: 'PUT',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Upload success: ', data);
        const newLessonId = data.lesson_id;
        alert('Lesson updated successfully!');
        window.location.href = '/admin/lessons/'+newLessonId;
    })
    .catch(err => console.error(err));
    
});

lessonYoutubeInput.addEventListener("input", (e) => {
    console.log(e.target.value);
    lessonYoutubePreview.src = e.target.value;
    lessonVideoInput.disabled=true;
});