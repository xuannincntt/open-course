import { getCategoriesForSelection, capitalizeOneWord } from "../utils.js";

const imagePreview = document.getElementsByClassName("course-image-preview")[0];
const imageInput = document.getElementById("courseImage");
const updateCourseForm = document.getElementsByClassName("update-course-form")[0];
const updateLessonBtn = document.getElementsByClassName("update-lesson-btn")[0];
const rmLessonBtns = document.getElementsByClassName("course-lesson-delete");
const lessonContainer = document.getElementsByClassName("course-lesson-list")[0];
let courseId = null;
let numberOfLessons = 1;

document.addEventListener("DOMContentLoaded", async () => {
    const pathParts = window.location.pathname.split('/');
    courseId = pathParts[pathParts.length - 1];

    console.log("Course ID:", courseId); // "1"

    const categories = await getCategoriesForSelection();
    console.log(categories);
    const categorySelect = document.getElementById("courseCategory");
    let categoryOptions = ``;
    for (let category of categories){
        const categoryOption = `<option value="${category.name}">${capitalizeOneWord(category.name)}</option>`;
        categoryOptions += categoryOption;
    }
    categorySelect.insertAdjacentHTML("beforeend",categoryOptions);

    let courseData;
    fetch('/api/admin/courses/'+courseId, {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        console.log('Course data:', data);
        const courseData = data.course;
        numberOfLessons = courseData.lessons.length;
        const courseLessons = courseData.lessons;
        let existingLessons = ``;

        // assign course data
        updateCourseForm.elements["courseName"].value=courseData.name || "";
        updateCourseForm.elements["courseIntro"].value=courseData.intro || "";
        updateCourseForm.elements["numOfLessons"].value=courseData.number_of_lessons || "";
        updateCourseForm.elements["courseCategory"].value=courseData.category.name || "";
        updateCourseForm.elements["courseLevel"].value=courseData.level || "";
        updateCourseForm.elements["courseDescription"].value=courseData.description || "";
        console.log(courseData.image_url);
        imagePreview.src=courseData.image_url || "";
    })
    .catch(err => console.error('Error:', err));

    
});

imageInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      imagePreview.src = url;
    }
});

updateCourseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    

    const numOfLessons = parseInt(updateCourseForm.elements['numOfLessons'].value) || numberOfLessons;
    console.log(numOfLessons);

    const formData = new FormData();

    // Thêm thông tin khóa học
    formData.append('name', updateCourseForm.elements['courseName'].value);
    formData.append('intro', updateCourseForm.elements['courseIntro'].value);
    formData.append('image', updateCourseForm.elements['courseImage'].files[0]); // Lưu ý .files[0]
    formData.append('number_of_lessons', numberOfLessons);
    formData.append('category', updateCourseForm.elements['courseCategory'].value);
    formData.append('level', updateCourseForm.elements['courseLevel'].value);
    formData.append('description', updateCourseForm.elements['courseDescription'].value);

    // Gửi lên backend
    fetch('/api/admin/courses/update/'+courseId, {
        method: 'PUT',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Upload success:', data);
        const updatedCourseId = data.course_id;
        window.location.href = '/admin/courses/'+updatedCourseId;
    })
    .catch(err => console.error('Error:', err));

    alert('Course added successfully!');
});


