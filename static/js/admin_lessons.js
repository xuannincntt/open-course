import { shortenText } from "./utils.js";

const lessonsTableBody = document.getElementById("lessons-table-body");
const backdropContainer = document.getElementById("backdrop");
const backdropModal = document.getElementById("modal");
let lessonTableRows;

document.addEventListener("DOMContentLoaded", async () => {
    let lessonsRow = ``;

    await fetch("/api/admin/lessons", {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        return data.lessons
    })
    .then(lessonsData => {
        lessonsData.forEach((lesson,index) => {
            const lessonRow = `<tr class="lessons-table-data" data-index="${index}" id="lessonId-${lesson.id}">
                    <td class="align-left">${index+1}</td>
                    <td class="align-left">${shortenText(lesson.name, 40)}</td>
                    <td class="align-left">${lesson.content}</td>
                    <td class="align-center">${new Date(lesson.created_at).toLocaleDateString()}</td>
                    <td class="align-center">
                        <a href="/admin/lessons/update/${lesson.id}" class="lesson-edit-btn">
                            <i class='bx bx-pencil edit-icon'></i>
                        </a>
                        <button type="button" class="lesson-delete-btn">
                            <i class="bx bx-trash delete-icon"></i>
                        </button>
                    </td>
                </tr>`;

            lessonsRow += lessonRow;
        });

        
        lessonsTableBody.innerHTML = lessonsRow;

        lessonTableRows = lessonsTableBody.childNodes;

        handleLessonClick();

        handleLessonDeleteBtns();
    })
    .catch((err) => {
        console.log(err);
    }); 
    
});

const handleLessonDeleteBtns = () => {
    const lessonDeleteBtns = document.querySelectorAll(".lesson-delete-btn");
    lessonDeleteBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const lessonRow = btn.closest("tr");
            const lessonId = lessonRow.id.split("-")[1];
            backdropContainer.classList.toggle("hidden");
            backdropModal.innerHTML=`
            <div class="course-delete-card">
                <div class="card-header"></div>
                <div class="card-content">
                    <div class="card-content-title">
                        <h4 class="card-content-text">Are you sure you want to delete this lesson?</h4>
                    </div>
                    <div class="card-content-action">
                        <button type="button" class="action-btn cancel-btn">Cancel</button>
                        <button type="button" class="action-btn confirm-btn" id="deleteCourse-${lessonId}">Delete</button>
                    </div>
                </div>
            </div>`;
            backdropModal.classList.toggle("hidden");

            handleLessonCancelBtns();
            handleLessonConfirmBtns();
        });
    });
};

const handleLessonCancelBtns = () => {
    const cancelBtn = document.getElementsByClassName("cancel-btn")[0];
    cancelBtn.addEventListener('click', () => {
        backdropModal.classList.toggle("hidden");
        backdropContainer.classList.toggle("hidden");
        backdropModal.innerHTML= "";
    });
};

const handleLessonClick = () => {
    lessonTableRows.forEach(lessonRow => {
        lessonRow.addEventListener("click", () => {
            const lessonId = lessonRow.id.split("-")[1];
            console.log(lessonId);
            window.location.href = '/admin/lessons/'+lessonId;
        })
    })
};

const handleLessonConfirmBtns = () => {
    const confirmBtn = document.getElementsByClassName("confirm-btn")[0];
    confirmBtn.addEventListener('click', () => {
        const lessonId = confirmBtn.id.split("-")[1];
        console.log(lessonId);
        fetch("/api/admin/lessons/delete/"+lessonId,
            {
                method: "DELETE"
            }
        )
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            window.location.href = '/admin/lessons';

        })
        .catch(err => console.error(err));
    });
};

