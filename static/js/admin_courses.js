import { debounce, sortList } from "./utils.js";

const coursesTableBody = document.getElementById("courses-table-body");
const backdropContainer = document.getElementById("backdrop");
const backdropModal = document.getElementById("modal");
const courseBody = document.getElementById("courses-table-body");
const courseSortForm = document.getElementById("courses-content-sortForm");
const searchInput = document.getElementById("searchTerm");
let courseTableRows;
let courses;
let userRole;

document.addEventListener("DOMContentLoaded", async () => {

    await fetch("/api/admin/courses", {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        userRole = data.userRole;
        return data.courses
    })
    .then(coursesData => {
        courses = [...coursesData];
        updateCoursesTable();
    })
    .catch((err) => {
        console.log(err);
    }); 
    
});

const handleSearchInput = async (e) => {
    const searchTerm = e.target.value;
    try {
        const response = await fetch("/api/admin/courses/search?searchTerm="+searchTerm,{
            method: "GET"
        });
        const data = await response.json();
        courses = data.courses;
        console.log(courses);
        updateCoursesTable();
    } catch (error) {
        console.error(error);
        return;
    }
};

const handleCourseDeleteBtns = () => {
    const courseDeleteBtns = document.querySelectorAll(".course-delete-btn");
    courseDeleteBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const courseRow = btn.closest("tr");
            const courseId = courseRow.id.split("-")[1];
            backdropContainer.classList.toggle("hidden");
            backdropModal.innerHTML=`
            <div class="course-delete-card">
                <div class="card-header"></div>
                <div class="card-content">
                    <div class="card-content-title">
                        <h4 class="card-content-text">Are you sure you want to delete this course?</h4>
                    </div>
                    <div class="card-content-action">
                        <button type="button" class="action-btn cancel-btn">Cancel</button>
                        <button type="button" class="action-btn confirm-btn" id="deleteCourse-${courseId}">Delete</button>
                    </div>
                </div>
            </div>`;
            backdropModal.classList.toggle("hidden");

            handleCourseCancelBtns();
            handleCourseConfirmBtns();
        });
    });
};

const handleApproveBtns = () => {
    const courseApproveBtns = document.querySelectorAll(".course-approve-btn");
    courseApproveBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const courseRow = btn.closest("tr");
            const courseId = courseRow.id.split("-")[1];
            
            try {
                const response = await fetch("/api/admin/courses/approve/"+courseId, {
                    method: "POST"
                });
                const data = response.json();
                alert("Course approved successfully");
                location.replace(location.href);
            } catch (error) {
                console.error(error);
                alert(data.message);
            }
        });
    });

};

const handleDenyBtns = () => {
    const courseDenyBtns = document.querySelectorAll(".course-deny-btn");
    courseDenyBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const courseRow = btn.closest("tr");
            const courseId = courseRow.id.split("-")[1];
            
            try {
                const response = await fetch("/api/admin/courses/deny/"+courseId, {
                    method: "POST"
                });
                const data = response.json();
                alert("Course denied successfully");
                location.replace(location.href);
            } catch (error) {
                console.error(error);
                alert(data.message);
            }
        });
    });

};

const handleCourseCancelBtns = () => {
    const cancelBtn = document.getElementsByClassName("cancel-btn")[0];
    console.log(cancelBtn);
    cancelBtn.addEventListener('click', () => {
        backdropModal.classList.toggle("hidden");
        backdropContainer.classList.toggle("hidden");
        backdropModal.innerHTML= "";
    });
};

const handleCourseClick = () => {
    courseTableRows.forEach(courseRow => {
        courseRow.addEventListener("click", () => {
            
            const courseId = courseRow.id.split("-")[1];
            console.log(courseId);
            window.location.href = '/admin/courses/'+courseId;
        })
    })
};

const handleCourseConfirmBtns = () => {
    const confirmBtn = document.getElementsByClassName("confirm-btn")[0];
    confirmBtn.addEventListener('click', () => {
        const courseId = confirmBtn.id.split("-")[1];
        console.log(courseId);
        fetch("/api/admin/courses/delete/"+courseId,
            {
                method: "DELETE"
            }
        )
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            window.location.href = '/admin/courses';

        })
        .catch(err => console.error(err));
    });
};

courseSortForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const sortCriteria = courseSortForm.elements["sortCriteria"].value || "";
    const sortOrder = courseSortForm.elements["sortOrder"].value || "";
    console.log(sortCriteria, sortOrder);
    courses = sortList(courses, sortCriteria, sortOrder);
    updateCoursesTable();
});

const updateCoursesTable = () => {
    let coursesRow = ``;

    courses.forEach((course,index) => {
        const courseRow = `<tr class="courses-table-data" data-index="${index}" id="courseId-${course.id}">
                <td class="align-left">${index+1}</td>
                <td class="align-left">
                    <img 
                        src=${course.image_url || "/static/images/course_placeholder.svg"} 
                        alt="Course ${index+1}"
                    />
                </td>
                <td class="align-left">${course.name}</td>
                <td class="align-center">${new Date(course.created_at).toLocaleDateString("vi-VN")}</td>
                <td class="align-center">${course.status}</td>
                <td class="align-center">
                    <a href="/admin/courses/update/${course.id}" class="course-edit-btn">
                        <i class='bx bx-pencil edit-icon'></i>
                    </a>
                    <button type="button" class="course-delete-btn">
                        <i class="bx bx-trash delete-icon"></i>
                    </button>
                    ${userRole == "ADMIN" && course.status == "Pending"? 
                        `<button type="button" class="course-approve-btn">
                            <i class='bx bx-check approve-icon' ></i>
                        </button>
                        <button type="button" class="course-deny-btn">
                            <i class='bx bx-x deny-icon' ></i>
                        </button>`
                    : ``}
                </td>
            </tr>`;

        coursesRow += courseRow;
    });

    
    coursesTableBody.innerHTML = coursesRow;

    courseTableRows = courseBody.childNodes;

    handleCourseClick();

    handleCourseDeleteBtns();

    handleApproveBtns();

    handleDenyBtns();
};

const debouncedSearch = debounce(handleSearchInput, 500);

searchInput.addEventListener("input", debouncedSearch);



