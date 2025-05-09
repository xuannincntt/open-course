document.addEventListener("DOMContentLoaded", function () {
    /*================== check pass ================== */
    document.querySelector(".savePass").addEventListener("click", async (e) => {
        e.preventDefault(); // Ngăn chuyển hướng trang nếu là <a>
        const password = document.getElementById("inf-pass").value;
        const updatePassMessage = document.getElementById("update_pass");
        try {
            const response = await fetch("/check_password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ password: password })
            });
            const result = await response.json();
            if (result.success) {
                updatePassMessage.style.color = "green";
                updatePassMessage.textContent = result.message;
                // Ví dụ: Mở popup đổi mật khẩu nếu đúng
                document.getElementById("popupOverlayPass").classList.add("active-popup");
                document.getElementById("wrapperPass").classList.add("active-popup");
                document.getElementById("wrapperPass").classList.add("active");
            } else {
                updatePassMessage.innerHTML = "<i class='bx bxs-error-circle'></i> " + result.message;
                updatePassMessage.style.color = "red";
            }
        } catch (error) {
            updatePassMessage.style.color = "red";
            updatePassMessage.textContent = "Lỗi kết nối tới server!";
            console.error("Error:", error);
        }
    });

    /*================== update pass ================== */
    document.querySelector(".saveNewPass").addEventListener("click", async (e) => {
        e.preventDefault(); // Ngăn chuyển hướng trang nếu là <a>
        const newPassword = document.getElementById("inf-newpass").value;
        const reNewPassword = document.getElementById("re-inf-newpass").value;
        const updatePassMessage = document.getElementById("update_newpass");
        const updateRePassMessage = document.getElementById("update_re_newpass");
        // Gửi yêu cầu đến server để cập nhật mật khẩu
        try {
            const response = await fetch("/update_password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    newpassword: newPassword,
                    "re-newpassword": reNewPassword
                })
            });
            const result = await response.json();
            if (result.success) {
                updatePassMessage.style.color = "green";
                updatePassMessage.textContent = result.message;
                location.reload();

            }
            // Kiểm tra xem các ô mật khẩu có bị bỏ trống không
            if (!newPassword || !reNewPassword) {
                updatePassMessage.style.color = "red";
                updatePassMessage.innerHTML = "<i class='bx bxs-error-circle'></i> " + result.message;
                return;
            }
            if (newPassword != reNewPassword) {
                updateRePassMessage.style.color = "red";
                updateRePassMessage.innerHTML = "<i class='bx bxs-error-circle'></i> " + result.message2;
                return;
            }

        } catch (error) {
            updatePassMessage.style.color = "red";
            updatePassMessage.textContent = "Lỗi kết nối tới server!";
            console.error("Error:", error);
        }
    });

    /*================== name-popup ================== */
    // Lấy các phần tử
    const openImg = document.getElementById("openImgPopup");
    const openName = document.getElementById("openNamePopup");
    const openEmail = document.getElementById("openEmailPopup");
    const openPassword = document.getElementById("openPassPopup");

    const closeImg = document.getElementById("closeImgPopup");
    const closeName = document.getElementById("closeNamePopup");
    const closeEmail = document.getElementById("closeEmailPopup");
    const closePassword = document.getElementById("closePassPopup");
    const closeNewPassword = document.getElementById("closeNewPassPopup");

    const imgPopup = document.getElementById("img-popup");
    const namePopup = document.getElementById("name-popup");
    const emailPopup = document.getElementById("email-popup");
    const passwordPopup = document.getElementById("popupOverlayPass");
    const passPopup = document.getElementById("pass-popup");
    const newpassPopup = document.getElementById("newpass-popup");
    const backpassPopup = document.getElementById("backToPassPopup");
    const wrapperPass = document.getElementById("wrapperPass");
    
    // Mở popup khi click vào name-contain
    openImg.addEventListener("click", () => {
        imgPopup.style.display = "flex";
    });
    openName.addEventListener("click", () => {
        namePopup.style.display = "flex";
    });
    openEmail.addEventListener("click", () => {
        emailPopup.style.display = "flex";
    });
    openPassword.addEventListener("click", () => {
        passwordPopup.style.display = "flex";
    });
    // Đóng popup khi click vào nút đóng
    closeImg.addEventListener("click", () => {
        imgPopup.style.display = "none";
    });
    closeName.addEventListener("click", () => {
        namePopup.style.display = "none";
    });
    closeEmail.addEventListener("click", () => {
        emailPopup.style.display = "none";
    });
    closePassword.addEventListener("click", () => {
        passwordPopup.style.display = "none";
    });
    closeNewPassword.addEventListener("click", () => {
        passwordPopup.style.display = "none";
    });

    passPopup.addEventListener("click", () => {
        passwordPopup.classList.add("active-popup");
        wrapperPass.classList.add("active-popup");
        wrapperPass.classList.remove("active");
    });
    backpassPopup.addEventListener("click", () => {
        passwordPopup.classList.add("active-popup");
        wrapperPass.classList.add("active-popup");
        wrapperPass.classList.remove("active");
    });
    newpassPopup.addEventListener("click", () => {
        passwordPopup.classList.add("active-popup");
        wrapperPass.classList.add("active-popup");
        wrapperPass.classList.add("active");
    });
    

    // Đóng popup khi click ra ngoài
    window.addEventListener("click", (e) => {
        if (e.target === imgPopup) {
            imgPopup.style.display = "none";
        }
        if (e.target === namePopup) {
            namePopup.style.display = "none";
        }
        if (e.target === emailPopup) {
            emailPopup.style.display = "none";
        }
        if (e.target === passwordPopup) {
            passwordPopup.style.display = "none";
            wrapper.classList.remove("active-popup");
            popupOverlay.classList.remove("active-popup");
        }
    });
    document.getElementById("uploadDiv").addEventListener("click", function () {
        document.getElementById("avatar").click();
    });

    /*================== avatar-update ================== */
    document.getElementById("avatar").addEventListener("change", async function () {
        const file = this.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("avatar", file);
        const res = await fetch("/upload_avatar", {
            method: "POST",
            body: formData,
        });
        const data = await res.json();
        if (data.success) {
            document.querySelector(".avatar img").src = data.avatar_url;
            location.reload();
        } else {
            alert(data.message);
        }
    });

    /*================== name-update ================== */
    let saveName = document.querySelector(".saveName");
    saveName.addEventListener("click", async function (e) {
        e.preventDefault();
        let newname = document.getElementById("name").value;
        let update_name = document.getElementById("update_name");
        let response = await fetch("/update_name", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newname }),
        });
        let data = await response.json();
        if (data.success) {
            window.location.href = `/${newname}/edit`;
        } else {
            update_name.innerHTML = "<i class='bx bxs-error-circle'></i> " + data.message;
            update_name.style.color = "red";
        }
    });

    /*================== email-update ================== */
    let saveEmail = document.querySelector(".saveEmail");
    saveEmail.addEventListener("click", async function (e) {
        e.preventDefault();
        let newemail = document.getElementById("inf-email").value;
        let update_email = document.getElementById("update_email");
        let response = await fetch("/update_email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newemail }),
        });
        let data = await response.json();
        if (data.success) {
            location.reload();
        } else {
            update_email.innerHTML = "<i class='bx bxs-error-circle'></i> " + data.message;
            update_email.style.color = "red";
        }
    });
});