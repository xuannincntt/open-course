import { getCategoriesForSelection, capitalizeOneWord } from "../utils.js";

const imagePreview = document.getElementsByClassName("course-image-preview")[0];
const imageInput = document.getElementById("courseImage");
const addCourseForm = document.getElementsByClassName("add-course-form")[0];
const addLessonBtn = document.getElementsByClassName("add-lesson-btn")[0];
const rmLessonBtns = document.getElementsByClassName("course-lesson-delete");
const lessonContainer = document.getElementsByClassName("course-lesson-list")[0];
let numberOfLessons = 1;


document.addEventListener("DOMContentLoaded", async () => {
    const categories = await getCategoriesForSelection();
    console.log(categories);
    const categorySelect = document.getElementById("courseCategory");
    let categoryOptions = ``;
    for (let category of categories){
        const categoryOption = `<option value="${category.name}">${capitalizeOneWord(category.name)}</option>`;
        categoryOptions += categoryOption;
    }
    categorySelect.insertAdjacentHTML("beforeend",categoryOptions);
    const newLesson = `<div class="course-lesson-card" id="lesson${numberOfLessons}">
                    <div class="lesson-card-header">
                        <span class="course-lesson-number">Lesson ${numberOfLessons}</span>
                        <i class='bx bx-x course-lesson-delete lesson-${numberOfLessons}'></i>
                    </div>
                    <div class="form-field lesson-name-field">
                        <label for="lessonName_${numberOfLessons}" class="form-label">
                            <span class="field-name lesson-name">Lesson Name</span>
                            <input 
                                type="text"
                                id="lessonName_${numberOfLessons}"
                                name="lessonName_${numberOfLessons}"
                                class="form-input lesson-name-input"
                                placeholder="Enter the name of this lesson"
                            />
                        </label>
                        
                    </div>
                    <div class="form-field lesson-video-field">
                        <label for="lessonVideo_${numberOfLessons}" class="form-label">
                            <span class="field-name lesson-video">Lesson Video</span>
                            <input 
                                type="file"
                                id="lessonVideo_${numberOfLessons}"
                                name="lessonVideo_${numberOfLessons}"
                                class="form-input lesson-video-input"
                                accept="video/*"
                            />
                            <video 
                                id="videoPreview" 
                                class="lesson-video-preview" 
                                style="display: none;"
                                controls 
                                width="400">
                            </video>
                        </label>
                        
                    </div>
                    <div class="form-field lesson-content-field">
                        <label for="lessonContent_${numberOfLessons}" class="form-label">
                            <span class="field-name lesson-name">Lesson Content</span>
                            <textarea 
                                id="lessonContent_${numberOfLessons}"
                                name="lessonContent_${numberOfLessons}"
                                class="form-input lesson-content-input"
                                cols="100" 
                                rows="7" 
                            >
                            </textarea>

                        </label>
                        
                    </div>`
    lessonContainer.insertAdjacentHTML('beforeend', newLesson);
});

imageInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      imagePreview.src = url;
    }
});

addLessonBtn.addEventListener('click',  () => {
    numberOfLessons++;
    const newLesson = `<div class="course-lesson-card" id="lesson${numberOfLessons}" data-index="${numberOfLessons}">
                    <div class="lesson-card-header">
                        <span class="course-lesson-number">Lesson ${numberOfLessons}</span>
                        <i class='bx bx-x course-lesson-delete lesson-${numberOfLessons}'></i>
                    </div>
                    <div class="form-field lesson-name-field">
                        <label for="lessonName_${numberOfLessons}" class="form-label">
                            <span class="field-name lesson-name">Lesson Name</span>
                            <input 
                                type="text"
                                id="lessonName_${numberOfLessons}"
                                name="lessonName_${numberOfLessons}"
                                class="form-input lesson-name-input"
                                placeholder="Enter the name of this lesson"
                            />
                        </label>
                        
                    </div>
                    <div class="form-field lesson-video-field">
                        <label for="lessonVideo_${numberOfLessons}" class="form-label">
                            <span class="field-name lesson-video">Lesson Video</span>
                            <input 
                                type="file"
                                id="lessonVideo_${numberOfLessons}"
                                name="lessonVideo_${numberOfLessons}"
                                class="form-input lesson-video-input"
                                accept="video/*"
                            />
                            <video 
                                id="videoPreview" 
                                class="lesson-video-preview" 
                                style="display: none;"
                                controls 
                                width="400">
                            </video>
                        </label>
                        
                    </div>
                    <div class="form-field lesson-content-field">
                        <label for="lessonContent_${numberOfLessons}" class="form-label">
                            <span class="field-name lesson-name">Lesson Content</span>
                            <textarea 
                                id="lessonContent_${numberOfLessons}"
                                name="lessonContent_${numberOfLessons}"
                                class="form-input lesson-content-input"
                                cols="100" 
                                rows="7" 
                            >
                            </textarea>

                        </label>
                        
                    </div>`
    lessonContainer.insertAdjacentHTML('beforeend', newLesson);
});

const updateLessonOrder = () => {
    const lessonDivs = document.querySelectorAll(".course-lesson-card");
    lessonDivs.forEach((lesson, index) => {
        const newIndex = index + 1;
        lesson.setAttribute('data-index', newIndex);
        lesson.querySelector('.course-lesson-number').textContent = `Lesson ${newIndex}`;
        lesson.querySelector('.lesson-name-input').id = `lessonName_${newIndex}`;
        lesson.querySelector('.lesson-name-input').name = `lessonName_${newIndex}`;
        lesson.querySelectorAll('.form-label')[0].htmlFor = `lessonName_${newIndex}`;

        lesson.querySelector('.lesson-video-input').id = `lessonVideo_${newIndex}`;
        lesson.querySelector('.lesson-video-input').name = `lessonVideo_${newIndex}`;
        lesson.querySelectorAll('.form-label')[1].htmlFor = `lessonVideo_${newIndex}`;

        lesson.querySelector('.lesson-content-input').id = `lessonContent_${newIndex}`;
        lesson.querySelector('.lesson-content-input').name = `lessonContent_${newIndex}`;
        lesson.querySelectorAll('.form-label')[2].htmlFor = `lessonContent_${newIndex}`;
    });
};

const handleDeleteLesson = (e) => {
    numberOfLessons--;
    const lessonDiv = e.target.closest(".course-lesson-card");
    lessonDiv.remove();
    updateLessonOrder();
};

lessonContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('course-lesson-delete')) {
        handleDeleteLesson(e);
    }
});

addCourseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    

    const numOfLessons = parseInt(addCourseForm.elements['numOfLessons'].value) || numberOfLessons;
    console.log(numOfLessons);

    const formData = new FormData();

    // Thêm thông tin khóa học
    formData.append('name', addCourseForm.elements['courseName'].value);
    formData.append('intro', addCourseForm.elements['courseIntro'].value);
    formData.append('image', addCourseForm.elements['courseImage'].files[0]); // Lưu ý .files[0]
    formData.append('number_of_lessons', numberOfLessons);
    formData.append('category', addCourseForm.elements['courseCategory'].value);
    formData.append('level', addCourseForm.elements['courseLevel'].value);
    formData.append('description', addCourseForm.elements['courseDescription'].value);

    console.log(addCourseForm);
    // Thêm từng bài học
    for (let i = 1; i <= numberOfLessons; i++) {
        const name = addCourseForm.elements[`lessonName_${i}`].value;
        let video;
        if (addCourseForm.elements[`lessonVideo_${i}`].files){
            video = addCourseForm.elements[`lessonVideo_${i}`].files[0]
        }
        const content = addCourseForm.elements[`lessonContent_${i}`].value;

        formData.append(`lessons[${i}][name]`, name);
        formData.append(`lessons[${i}][video]`, video || null);
        formData.append(`lessons[${i}][content]`, content);
    }

    // Gửi lên backend
    fetch('/api/admin/courses/new', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Upload success:', data);
        const newCourseId = data.course_id;
        alert('Course added successfully!');
        window.location.href = '/admin/courses/'+newCourseId;
    })
    .catch(err => console.error('Error:', err));

    
});


const validateAddCourseForm = () => {

}