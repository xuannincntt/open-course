const coursesTableBody = document.getElementById("courses-table-body");
const backdropContainer = document.getElementById("backdrop");
const backdropModal = document.getElementById("modal");
const courseBody = document.getElementById("courses-table-body");
let courseTableRows;

document.addEventListener("DOMContentLoaded", async () => {
    let coursesRow = ``;

    await fetch("/api/admin/courses", {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        return data.courses
    })
    .then(coursesData => {
        coursesData.forEach((course,index) => {
            const courseRow = `<tr class="courses-table-data" data-index="${index}" id="courseId-${course.id}">
                    <td class="align-left">${index+1}</td>
                    <td class="align-left">
                        <img 
                            src=${course.image_url || "/static/images/course_placeholder.svg"} 
                            alt="Course ${index+1}"
                        />
                    </td>
                    <td class="align-left">${course.name}</td>
                    <td class="align-center">${new Date(course.created_at).toLocaleDateString()}</td>
                    <td class="align-center">${course.status}</td>
                    <td class="align-center">
                        <a href="/admin/courses/update/${course.id}" class="course-edit-btn">
                            <i class='bx bx-pencil edit-icon'></i>
                        </a>
                        <button type="button" class="course-delete-btn">
                            <i class="bx bx-trash delete-icon"></i>
                        </button>
                    </td>
                </tr>`;

            coursesRow += courseRow;
        });

        
        coursesTableBody.innerHTML = coursesRow;

        courseTableRows = courseBody.childNodes;

        handleCourseClick();

        handleCourseDeleteBtns();
    })
    .catch((err) => {
        console.log(err);
    }); 
    
});

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

