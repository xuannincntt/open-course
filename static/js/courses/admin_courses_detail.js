import courseCategories from "../courseCategories.js";
import courseLevels from "../courseLevels.js";
import { capitalizeOneWord } from "../utils.js";

const imagePreview = document.getElementsByClassName("course-image-preview")[0];
const lessonContainer = document.getElementsByClassName("course-lesson-tbody")[0];
const courseName = document.getElementById("course-name");
const courseIntro = document.getElementById("course-intro");
const courseNumOfLessons = document.getElementById("course-numOfLessons");
const courseCategory = document.getElementById("course-category");
const courseLevel = document.getElementById("course-level");
const courseDesc = document.getElementById("course-description");
let numberOfLessons = 1;

document.addEventListener("DOMContentLoaded", async () => {

    const pathParts = window.location.pathname.split('/');
    console.log(pathParts);
    const courseId = pathParts[pathParts.length - 1];

    const imagePlaceholder = await getImagePlaceholder();

    console.log("Course ID:", courseId); // "1"
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
        courseName.textContent=courseData.name || "";
        courseIntro.textContent=courseData.intro || "";
        courseNumOfLessons.textContent=courseData.number_of_lessons || numberOfLessons;
        courseCategory.textContent=courseData.category.name? capitalizeOneWord(courseData.category.name): "Other";
        courseLevel.textContent=courseData.level? courseLevels[courseData.level] : "";
        courseDesc.textContent=courseData.description || "";
        console.log(courseData.image_url);
        imagePreview.src=courseData.image_url || imagePlaceholder;

        // asign existing lessons data
        for (let i=0;i<numberOfLessons;i++){
            existingLessons = existingLessons + `
            <tr class="course-lesson-data">
                <td class="align-left">${i+1}</td>
                <td class="align-left">${courseLessons[i].name}</td>
                <td class="align-right">${courseLessons[i].content}</td>
            </tr>`
        }

            lessonContainer.insertAdjacentHTML('beforeend', existingLessons);
        })
    .catch(err => console.error('Error:', err));
});

const getImagePlaceholder = async () => {
    fetch("/api/image-placeholder", {
        method: "GET"
    })
    .then(response => response.json)
    .then(data => {
        return data.image_url;
    })
    .catch(err => {
        console.error('Error:', err)
    })
}