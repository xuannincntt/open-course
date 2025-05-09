import { getCoursesForSelection } from "../utils.js";

const courseSelect = document.getElementById("courseId");
const updateLessonForm = document.getElementsByClassName("update-lesson-form")[0];
const lessonVideoPreview = document.getElementById("lesson-video-preview");
const lessonVideoInput = document.getElementById("lessonVideo");


document.addEventListener("DOMContentLoaded", async () => {
    const pathParts = window.location.pathname.split('/');
    const lessonId = pathParts[pathParts.length - 1];
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
    lessonVideoPreview.src=selectedLesson.video_url;
    lessonVideoPreview.style.display = "block";

});

lessonVideoInput.addEventListener("change", () => {
    const file = lessonVideoInput.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      lessonVideoPreview.src = url;
      lessonVideoPreview.style.display = "block";
    }
  });