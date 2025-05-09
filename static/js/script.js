document.addEventListener("DOMContentLoaded", function () {
    /*================== Hiển thị khóa học ================== */
    fetch("/api/popular-course")
    .then(response => response.json())
    .then(data => {
        const courses = data.courses;
        const container = document.querySelector(".popular-container");
        container.innerHTML = ""; // Xóa dữ liệu cũ

        courses.forEach(course => {
            const courseHTML = `
                <div class="popular-box">
                    <img src="${course.image_url}" alt="">
                    <div class="popular-inf">
                        <div class="price">
                            <h5>Miễn phí</h5>
                        </div>
                    </div>
                    <div class="popular-layer">
                        <h4>${course.name}</h4>
                        <p>${course.intro}</p>
                        <div class="popular-end">
                            <img src="${course.teacher_avatar}" alt="">
                            <p>${course.teacher_name}</p>
                            <h5><i class='bx bxs-group'></i> ${course.number_of_students}</h5>
                            <h5><i class='bx bxs-book' ></i>${course.number_of_lessons}</h5>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += courseHTML;
        });
    })
    .catch(error => console.error("Lỗi khi tải khóa học:", error));

    async function fetchUserInfo() {
        const username = document.getElementById("name-user").textContent;
        try {
            let response = await fetch(`/api/${username}`);
            let data = await response.json();
            if (data.success) {
                document.getElementById("account").innerText = data.account;
                document.getElementById("role").innerText = (data.role == "TEACHER" || data.role == "ADMIN") ? (data.role=="ADMIN"? "Quản trị viên": "Giáo viên") : "Học viên"; 
                document.getElementById("time").innerText = data.time;
                const container = document.querySelector(".register-container");
                container.innerHTML = ""; // Xóa dữ liệu cũ
    
                data.courses.forEach(course => {
                    // Chuyển đổi tên khóa học thành URL-friendly (thay khoảng trắng bằng dấu -)
                    const courseSlug = encodeURIComponent(course.name.replace(/\s+/g, '-'));
    
                    const courseHTML = `
                        <div class="popular-box" data-course="${courseSlug}">
                            <img src="${course.image_url}" alt="">
                            <div class="popular-layer">
                                <h4>${course.name}</h4>
                                <p>${course.intro}</p>
                                <div class="popular-end">
                                    <img src="${course.teacher_avatar}" alt="">
                                    <p>${course.teacher_name}</p>
                                </div>
                            </div>
                        </div>
                    `;
                    container.innerHTML += courseHTML;
                });
    
                // Thêm sự kiện click sau khi render xong
                document.querySelectorAll('.popular-box').forEach(box => {
                    box.addEventListener('click', function() {
                        const courseName = this.getAttribute('data-course');
                        window.location.href = `/lesson/${courseName}`;
                    });
                });
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin người dùng:", error);
        }
    }
    
    // Gọi hàm khi trang tải xong
    window.onload = fetchUserInfo;
    
    /*================== Login ================== */
    let loginForm = document.getElementById("loginForm");
    let registerForm = document.getElementById("registerForm");
    let emailInput = document.getElementById("email");
    let passwordInput = document.getElementById("password");

    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault(); // Ngăn trang load lại
            let email = emailInput.value;
            let password = passwordInput.value;
            let messageBox = document.getElementById("loginMessage");
            let response = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            let result = await response.json();
            if (result.success) {
                if (result.role === "TEACHER" || result.role === "ADMIN") {
                    window.location.href = "/admin";
                } else {
                    location.reload();
                }
            } else {
                messageBox.innerHTML = "<i class='bx bxs-error-circle'></i> " + result.message;
                messageBox.style.color = "red";
            }
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            let username = document.getElementById("registerName").value;
            let email = document.getElementById("registerEmail").value;
            let password = document.getElementById("registerPassword").value;
            let role = document.getElementById("registerRole").value;
            let messageBox = document.getElementById("registerMessage");
            let response = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password, role }),
            });
            let data = await response.json();
            if (data.success) {
                if (data.role === "TEACHER") {
                    window.location.href = "/admin";
                } else {
                    location.reload();
                }
            } else {
                messageBox.innerHTML = "<i class='bx bxs-error-circle'></i> " + data.message;
                messageBox.style.color = "red";
            }
        });
    }

    /*================== change login and register ================== */
    const popupOverlay = document.querySelector(".popup-overlay");
    const wrapper = document.querySelector(".wrapper");

    const loginLink = document.querySelector(".login-link");
    const registerLink = document.querySelector(".register-link");

    const login = document.getElementById("login");
    const signup = document.getElementById("signup");
    const closeBtn = document.querySelector(".close-btn");

    if (login) {
        login.addEventListener("click", () => {
            popupOverlay.classList.add("active-popup");
            wrapper.classList.add("active-popup");
            wrapper.classList.remove("active");
        });
    }
    if (signup) {
        signup.addEventListener("click", () => {
            wrapper.classList.add("active-popup");
            popupOverlay.classList.add("active-popup");
            wrapper.classList.add("active");
        });
    }
    if (registerLink) {
        registerLink.addEventListener("click", () => {
            wrapper.classList.add("active");
        });
    }
    if (loginLink) {
        loginLink.addEventListener("click", () => {
            wrapper.classList.remove("active");
        });
    }
    if (popupOverlay) {
        popupOverlay.addEventListener("click", () => {
            wrapper.classList.remove("active-popup");
            popupOverlay.classList.remove("active-popup");
        });
    }

    /*================= Kiểm tra đăng nhập ================*/
    let lesson = document.querySelector(".btn-lesson");

    if (lesson) {
        lesson.addEventListener("click", async function (e) {
            const cookies = document.cookie
                .split('; ')
                .reduce((acc, curr) => {
                    const [name, value] = curr.split('=');
                    acc[name] = value;
                    return acc;
                }, {});
    
            if (!cookies.username) {
                popupOverlay.classList.add("active-popup");
                wrapper.classList.add("active-popup");
                wrapper.classList.remove("active");
            } else {
                const pathParts = window.location.pathname.split('/');
                const encodedCourseName = pathParts[pathParts.length - 1];
                const decodedCourseName = decodeURIComponent(encodedCourseName);
                const courseName = decodedCourseName.replace(/-/g, ' ');
                const username = document.getElementById("name-user").textContent;
                try {
                    const response = await fetch("/api/enroll", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            username: username,
                            course_name: courseName
                        })
                    });
    
                    const result = await response.json();
                    if (result.success) {
                        alert(result.message);
                        window.location.href = `/lesson/${courseName}`;
                    } else {
                        alert(result.message + courseName);
                    }
                } catch (error) {
                    console.error("Lỗi khi đăng ký khóa học:", error);
                }
            }
        });
    }


    /*================== icon user-inf ================== */
    let iconuser = document.querySelector(".dropdown");
    let userinf = document.querySelector(".user-inf");
    let dropdown = document.querySelector("#dropdown");

    if (iconuser && userinf) {
        iconuser.onclick = () => {
            userinf.classList.toggle("active");
            iconuser.classList.toggle("open");
            // dropdown.classList.toggle('bx-chevron-up');
        };
        // Đóng user-inf khi click bên ngoài
        document.addEventListener("click", (event) => {
            if (!userinf.contains(event.target) && !iconuser.contains(event.target)) {
                userinf.classList.remove("active");
            }
        });
    }

    /*================== icon navbar ================== */
    let menuIcon = document.querySelector('#menu-icon');
    let navbar = document.querySelector('.navbar');

    menuIcon.onclick = () => {
        menuIcon.classList.toggle('bx-x');
        navbar.classList.toggle('active');
    };

});

function closeLoginPopup() {
    popupOverlay.classList.remove('active-popup');
}

/*================== Initialize Swiper ================== */
var swiper = new Swiper(".mySwiper", {
    slidesPerView: "auto",
    spaceBetween: 30,
    pagination: {
    el: ".swiper-pagination",
    clickable: true,
    },
});
/*================== Logout ================== */
function logout() {
    fetch('/logout', { method: 'GET' })  // Gửi request logout đến server
    .then(response => {
        location.reload();  // Reload lại trang hiện tại sau khi đăng xuất
    })
    .catch(error => {
        console.error("Lỗi khi đăng xuất:", error);
    });
}