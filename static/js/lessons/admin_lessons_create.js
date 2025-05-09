import { getCoursesForSelection } from "../utils.js";

const courseSelect = document.getElementById("courseId");
const addLessonForm = document.getElementsByClassName("add-lesson-form")[0];
const lessonVideoPreview = document.getElementById("lesson-video-preview");
const lessonVideoInput = document.getElementById("lessonVideo");


document.addEventListener("DOMContentLoaded", async () => {
    let courses;
    try {
        courses = await getCoursesForSelection();
        console.log(courses);
        if (!courses || courses.length <= 0){
            throw new Error("No courses found.")
        }
    } catch (error) {
        alert(`There was an error getting courses: ${error.message}`);
        return;
    }
    
    let courseOptions = ``;
    for (let course of courses){
        courseOptions += `<option value="${course.id}">${course.name}</option>`
    }

    courseSelect.insertAdjacentHTML("beforeend", courseOptions);

});


addLessonForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append('courseId',addLessonForm.elements['courseId'].value);
    formData.append('lessonName',addLessonForm.elements['lessonName'].value);
    formData.append('lessonContent',addLessonForm.elements['lessonContent'].value);
    formData.append('lessonVideo',addLessonForm.elements['lessonVideo'].files[0]);

    fetch('/api/admin/lessons/new', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Upload success: ', data);
        const newLessonId = data.lesson_id;
        alert('Lesson added successfully!');
        window.location.href = '/admin/lessons/'+newLessonId;
    })
    .catch(err => console.error(err));
    
});

lessonVideoInput.addEventListener("change", () => {
    const file = lessonVideoInput.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      lessonVideoPreview.src = url;
      lessonVideoPreview.style.display = "block";
    }
  });