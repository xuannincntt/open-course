from flask import Flask, render_template, request, url_for, jsonify, make_response, redirect
import requests
import secrets
from sqlalchemy.exc import SQLAlchemyError
from flask_migrate import Migrate
import cloudinary
import cloudinary.uploader
from utils import extract_public_id

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI']="sqlite:///app.db"
app.secret_key="WEB_DEV_COURSE"

# Configuration       
cloudinary.config( 
    cloud_name = "dtlz0jfb6", 
    api_key = "364415425436136", 
    api_secret = "ukOrpbutb-rc6eIpyKcykK-J5wI", # Click 'View API Keys' above to copy your API secret
    secure=True
)

from db import db, User, Category, Course, Lesson, Enrollment
migrate = Migrate(app, db)
db.init_app(app)
    
with app.app_context():
    db.create_all()

# User
@app.route("/", methods=["GET", "POST"])
def index():
    username = request.cookies.get("username")
    user = User.query.filter_by(name=username).first()
    if user:
        avatar_url = user.avatar
    if username:
        index_html = render_template("index.html", loggedin=True, username=username, avatar=avatar_url)
        response = make_response(index_html)
        response.set_cookie("username", user.name, max_age=3600*24)
        response.set_cookie("user_id", str(user.id), max_age=3600*24)
        response.set_cookie("user_role", user.role, max_age=3600*24)
        return response
    return render_template("index.html", loggedin=False)
@app.route("/api/popular-course", methods=["GET"]) 
def popular():
    keyword = request.args.get("keyword", "").strip().lower()
    query = Course.query
    if keyword:
        query = query.filter(Course.name.ilike(f"%{keyword}%"))
    else:
        # Sắp xếp theo số người học giảm dần và lấy tối đa 3 khóa học
        query = query.order_by(Course.number_of_students.desc()).limit(3)
    courses = query.all()
    # Lấy danh sách giáo viên tương ứng để tránh N+1
    teacher_ids = list(set(course.teacher_id for course in courses))
    teachers = User.query.filter(User.id.in_(teacher_ids), User.role == "TEACHER").all()
    teacher_map = {teacher.id: teacher for teacher in teachers}
    course_list = [
        {
            "id": course.id,
            "name": course.name,
            "intro": course.intro,
            "description": course.description,
            "image_url": course.image_url or "/static/img/default_course.jpg",
            "teacher_id": teacher_map.get(course.teacher_id).id if teacher_map.get(course.teacher_id) else None,
            "teacher_name": teacher_map.get(course.teacher_id).name if teacher_map.get(course.teacher_id) else "N/A",
            "teacher_avatar": teacher_map.get(course.teacher_id).avatar if teacher_map.get(course.teacher_id) else "/static/img/default_avatar.jpg",
            "category_id": course.category_id,
            "number_of_lessons": course.number_of_lessons,
            "number_of_students": course.number_of_students,
        }
        for course in courses
    ]
    # Nếu cần, bạn vẫn có thể trả categories
    category_list = [
        {"id": cat.id, "name": cat.name}
        for cat in Category.query.all()
    ]
    return jsonify({
        "courses": course_list,
        "categories": category_list
    })
@app.route("/api/course", methods=["GET"])
def course():
    keyword = request.args.get("keyword", "").strip().lower()
    # Tìm khóa học theo keyword (nếu có)
    query = Course.query
    if keyword:
        query = query.filter(Course.name.ilike(f"%{keyword}%"))
    courses = query.all()
    course_list = []
    for course in courses:
        teacher = User.query.filter_by(id=course.teacher_id).first()
        # print(teacher.to_dict())
        teacher_name = teacher.name if teacher else "N/A"
        teacher_avatar = teacher.avatar if teacher else ""
        teacher_id = teacher.id if teacher else None
        course_list.append({
            "id": course.id,
            "name": course.name,
            "intro": course.intro,
            "description": course.description,
            "image_url": course.image_url,
            "teacher_id": teacher_id,
            "teacher_name": teacher_name,
            "teacher_avatar": teacher_avatar,
            "category_id": course.category_id,
            "number_of_lessons": course.number_of_lessons,
            "number_of_students": course.number_of_students,
        })
    # Truy vấn danh sách category
    categories = Category.query.all()
    category_list = []
    for category in categories:
        category_list.append({
            "id": category.id,
            "name": category.name
        })
    return jsonify({
        "courses": course_list,
        "categories": category_list
    })
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email, password=password).first()
    if not user:
        return jsonify({'success': False, 
                        'message': "Sai email hoặc mật khẩu!"})
    # Tạo response và lưu cookie
    response = make_response(jsonify({
        "success": True,
        "message": "Đăng nhập thành công!",
        "avatar": user.avatar,
        "role": user.role  # Trả thêm role
    }))
    response.set_cookie("username", user.name, max_age=3600*24)
    response.set_cookie("user_id", str(user.id), max_age=3600*24)
    response.set_cookie("user_role", user.role, max_age=3600*24)
    return response
@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    name = data.get('username')
    email = data.get('email')
    role = data.get('role', "STUDENT")
    password = data.get('password')
    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'message': "Email đã tồn tại!"})
    user = User(name=name, email=email, password=password, role=role)
    db.session.add(user)
    db.session.commit()
    response = make_response(jsonify({"success": True, "message": "Đăng ký thành công!", "avatar": user.avatar, "role": user.role}))
    response.set_cookie("username", user.name, max_age=3600*24)
    response.set_cookie("user_id", str(user.id), max_age=3600*24)
    response.set_cookie("user_role", user.role, max_age=3600*24)
    return response
@app.route("/logout")
def logout():
    response = make_response(redirect(url_for("index")))
    response.delete_cookie("username")
    response.delete_cookie("user_id")
    response.delete_cookie("user_role")
    return response
@app.route("/<username>")
def account(username):
    name = request.cookies.get("username")
    user = User.query.filter_by(name=username).first()
    if not user:
        return render_template("404.html")
    avatar_url = user.avatar
    if not name:
        return render_template("404.html")
    if name != username:
        return render_template("404.html", loggedin=True, username=name, avatar=avatar_url)
    return render_template("account.html", loggedin=True, username=name, avatar=avatar_url)
@app.route("/api/<username>")
def account_api(username):
    user = User.query.filter_by(name=username).first()
    enrollments = Enrollment.query.filter_by(user_id=user.id).all()
    course_list = []
    for enrollment in enrollments:
        course = Course.query.filter_by(id=enrollment.course_id).first()
        if course:
            teacher = User.query.filter_by(id=course.teacher_id).first()
            course_list.append({
                "id": course.id,
                "name": course.name,
                "intro": course.intro,
                "description": course.description,
                "image_url": course.image_url,
                "teacher_name": teacher.name if teacher else "Unknown",
                "teacher_avatar": teacher.avatar if teacher else ""
            })
    return jsonify({
        "success": True,
        "username": user.name,
        "account": user.email,
        "role": user.role,
        "time": user.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        "courses": course_list
    })
@app.route("/api/enroll", methods=["POST"])
def enroll_course():
    data = request.get_json()
    username = data.get("username")
    course_name = data.get("course_name")
    # Tìm user và khóa học
    user = User.query.filter_by(name=username).first()
    course = Course.query.filter_by(name=course_name).first()
    if not user or not course:
        return jsonify({"success": False, "message": "Người dùng hoặc khóa học không tồn tại."}), 404
    # Kiểm tra nếu đã đăng ký rồi
    existing = Enrollment.query.filter_by(user_id=user.id, course_id=course.id).first()
    if existing:
        return jsonify({"success": True, "message": "Bạn đã đăng ký khóa học này rồi."}), 400
    # Tạo mới bản ghi
    new_enrollment = Enrollment(user_id=user.id, course_id=course.id, lesson_id=1)
    db.session.add(new_enrollment)
    course.number_of_students += 1  # cập nhật số học viên
    db.session.commit()
    return jsonify({"success": True, "message": "Đăng ký khóa học thành công!"})
@app.route("/<username>/edit")
def edit(username):
    name = request.cookies.get("username")
    user = User.query.filter_by(name=username).first()
    if not user:
        return render_template("404.html")
    avatar_url = user.avatar
    if not name:
        return render_template("404.html")
    if name != username:
        return render_template("404.html", loggedin=True, username=name, avatar=avatar_url)
    return render_template("edit.html", loggedin=True, username=name, avatar=avatar_url)
@app.route("/upload_avatar", methods=["POST"])
def upload_avatar():
    # Configuration       
    cloudinary.config( 
        cloud_name = "dtlz0jfb6", 
        api_key = "364415425436136", 
        api_secret = "ukOrpbutb-rc6eIpyKcykK-J5wI", # Click 'View API Keys' above to copy your API secret
        secure=True
    )
    file = request.files.get("avatar")
    if not file:
        return jsonify({"success": False, "message": "Không có file nào được chọn."})
    # Tải ảnh lên Cloudinary
    upload_result = cloudinary.uploader.upload(file)
    avatar_url = upload_result.get("secure_url")
    # Cập nhật cơ sở dữ liệu
    username = request.cookies.get("username")
    user = User.query.filter_by(name=username).first()
    if user:
        user.avatar = avatar_url
        db.session.commit()
        return jsonify({"success": True, "avatar_url": avatar_url})
    return jsonify({"success": False, "message": "Không tìm thấy người dùng."})
@app.route("/update_name", methods=["POST"])
def update_name():
    data = request.json
    name = request.cookies.get("username")
    user = User.query.filter_by(name=name).first()
    new_name = data.get('newname')
    if not new_name:
        return jsonify({'success': False, 'message': "Tên không được để trống!"})
    user.name = new_name
    db.session.commit()
    response = make_response(jsonify({"success": True, "message": "Cập nhật tên thành công!"}))
    response.set_cookie("username", new_name, max_age=3600*24)
    return response
@app.route("/update_email", methods=["POST"])
def update_email():
    data = request.json
    name = request.cookies.get("username")
    user = User.query.filter_by(name=name).first()
    new_email = data.get('newemail')
    if not new_email:
        return jsonify({'success': False, 'message': "Email không được để trống!"})
    if User.query.filter_by(email=new_email).first():
        return jsonify({'success': False, 'message': "Email đã tồn tại!"})
    user.email = new_email
    db.session.commit()
    return jsonify({"success": True, "message": "Cập nhật email thành công!"})
@app.route("/update_password", methods=["POST"])
def update_password():
    data = request.json
    name = request.cookies.get("username")
    user = User.query.filter_by(name=name).first()
    new_password = data.get('newpassword')
    re_new_password = data.get('re-newpassword')
    if not re_new_password or not new_password:
        return jsonify({'success': False, 'message': "Mật khẩu không được để trống!"})
    if new_password != re_new_password:
        return jsonify({'success': False, 'message2': "Mật khẩu không khớp!"})
    user.password = new_password
    db.session.commit()
    return jsonify({"success": True, "message": "Cập nhật mật khẩu thành công!"})
@app.route("/check_password", methods=["POST"])
def check_password():
    data = request.json
    name = request.cookies.get("username")
    user = User.query.filter_by(name=name).first()
    password = data.get('password')
    if not password:
        return jsonify({'success': False, 'message': "Mật khẩu không được để trống!"})
    if user.password != password:
        return jsonify({'success': False, 'message': "Sai mật khẩu!"})
    return jsonify({"success": True, "message": "Mật khẩu chính xác!"})
@app.route("/course")
def course_page():
    username = request.cookies.get("username")
    user = User.query.filter_by(name=username).first()
    if user:
        avatar_url = user.avatar
    if username:
        return render_template("course.html", loggedin=True, username=username, avatar=avatar_url)
    return render_template("course.html", loggedin=False)
@app.route('/course/<course_name>')
def course_detail(course_name):
    course_name = course_name.replace("-", " ")
    course = Course.query.filter(Course.name.ilike(course_name)).first()
    course_img = course.image_url
    username = request.cookies.get("username")
    user = User.query.filter_by(name=username).first()
    if user:
        avatar_url = user.avatar
    if username:
        return render_template("detail.html", loggedin=True, username=username, avatar=avatar_url, course_name=course_name, course_img=course_img)
    return render_template("detail.html", loggedin=False, course_name=course_name, course_img=course_img)
@app.route("/teacher")
def teacher():
    username = request.cookies.get("username")
    user = User.query.filter_by(name=username).first()
    if user:
        avatar_url = user.avatar
    if username:
        return render_template("teacher.html", loggedin=True, username=username, avatar=avatar_url)
    return render_template("teacher.html", loggedin=False)
@app.route("/api/teacher")
def teacher_api():
    teachers = User.query.filter_by(role="TEACHER").all()
    teacher_list = []
    for teacher in teachers:
        course = Course.query.filter_by(teacher_id=teacher.id).first()
        nameCategory = None
        if course:
            nameCategory = Category.query.filter_by(id=course.category_id).first()
        teacher_list.append({
            "id": teacher.id,
            "name": teacher.name,
            "avatar": teacher.avatar or "",
            "description": teacher.description or "",
            "branch": nameCategory.name if nameCategory else "Unknown",
        })
    category_names = [cat.name for cat in Category.query.all()]
    return jsonify({"teacher_list": teacher_list, "branch_list": category_names})
@app.route("/lesson/<course_name>")
def lesson(course_name):
    # Chuyển tên từ URL slug về tên gốc (ví dụ JavaScript-cơ-bản → JavaScript cơ bản)
    course_name_clean = course_name.replace("-", " ")
    # Tìm khóa học
    course = Course.query.filter(Course.name.ilike(course_name_clean)).first()
    if not course:
        return "Khóa học không tồn tại", 404
    # Lấy danh sách bài học của khóa học
    lessons = Lesson.query.filter_by(course_id=course.id).all()
    # Kiểm tra đăng nhập
    username = request.cookies.get("username")
    user = User.query.filter_by(name=username).first() if username else None
    avatar_url = user.avatar if user else None
    # Render template, truyền đầy đủ dữ liệu
    return render_template(
        "lesson.html",
        loggedin=bool(user),
        username=username,
        avatar=avatar_url,
        course=course,
        lessons=lessons
    )
@app.route("/contact")
def contact():
    username = request.cookies.get("username")
    user = User.query.filter_by(name=username).first()
    if user:
        avatar_url = user.avatar
    if username:
        return render_template("contact.html", loggedin=True, username=username, avatar=avatar_url)
    return render_template("contact.html", loggedin=False)

#Admin
@app.route("/admin", methods=["GET", "POST"])
def admin():
    user_id = request.cookies.get("user_id","")
    print(user_id)
    try:
        selected_user = User.query.get_or_404(user_id)
        print(selected_user.role)
        if not selected_user or selected_user.role not in ["TEACHER","ADMIN"]:
            return redirect("/")
        
        html_resp = render_template("admin_home.html", username=selected_user.name)
        resp = make_response(html_resp)
        resp.set_cookie("username", selected_user.name, max_age=3600*24)
        resp.set_cookie("user_id", str(selected_user.id), max_age=3600*24)
        resp.set_cookie("user_role", selected_user.role, max_age=3600*24)
        return resp 

    except SQLAlchemyError as e:
        print(e)
   
@app.route("/admin/courses", methods=["GET", "POST"])
def courses_page(): 
    username = request.cookies.get("username")
    return render_template("admin_courses.html", username=username)
@app.route("/admin/courses/<int:id>", methods=["GET"])
def detail_course_page(id):
    username = request.cookies.get("username")
    return render_template("courses/admin_courses_detail.html", username=username)
@app.route("/admin/courses/new", methods=["GET"])
def add_course_page():
    username = request.cookies.get("username")
    return render_template("courses/admin_courses_create.html", username=username)
@app.route("/admin/courses/update/<int:id>", methods=["GET"])
def update_course_page(id):
    username = request.cookies.get("username")
    return render_template("courses/admin_courses_update.html", username=username)
@app.route("/admin/lessons", methods=["GET"])
def lessons_page(): 
    username = request.cookies.get("username")
    return render_template("admin_lessons.html", username=username)
@app.route("/admin/lessons/<int:id>", methods=["GET"])
def detail_lesson_page(id): 
    username = request.cookies.get("username")
    return render_template("lessons/admin_lessons_detail.html", username=username)
@app.route("/admin/lessons/new", methods=["GET"])
def add_lesson_page(): 
    username = request.cookies.get("username")
    return render_template("lessons/admin_lessons_create.html", username=username)
@app.route("/admin/lessons/update/<int:id>", methods=["GET"])
def update_lesson_page(id): 
    username = request.cookies.get("username")
    return render_template("lessons/admin_lessons_update.html", username=username)
@app.route("/api/admin/courses", methods=["GET"])
def get_courses():
    user_id = request.cookies.get("user_id", "")
    try:
        user = User.query.get_or_404(user_id)
        if not user or user.role not in ["TEACHER","ADMIN"]:
            return jsonify({
                "message": "Unauthorized access"
            }), 400
        courses = []
        if user.role == "TEACHER":
            courses = Course.query\
                .filter(Course.teacher_id==user_id)\
                .order_by(Course.created_at.desc())\
                .all()
        else: 
            courses = Course.query\
                .order_by(Course.created_at.desc())\
                .all()
        if not courses:
            return jsonify({
                "message": "No courses found"
            }), 404
        courses_dict = [course.to_dict() for course in courses]
        return jsonify({
            "courses": courses_dict
        }), 200
    except SQLAlchemyError as e:
        print("Error getting courses:", e)
        return jsonify({
            "message": "There was an error getting courses. Try again later."
        }), 500
@app.route("/api/admin/courses/<int:id>", methods=["GET"])
def get_course_by_id(id):
    user_id = request.cookies.get("user_id", "")
    try:
        user = User.query.get_or_404(user_id)
        if not user or user.role not in ["TEACHER","ADMIN"]:
            return jsonify({
                "message": "Unauthorized access"
            }), 400
        selectedCourse = Course.query.get_or_404(id)
        if not selectedCourse:
            return jsonify({
                "message": "Course not found"
            }), 404
        return jsonify({
            "course": selectedCourse.to_dict()
        }), 200
    except:
        print("Error getting lesson by id")
        return jsonify({
            "message": "There was an error getting course. Try again later."
        }), 500
@app.route("/api/admin/courses/new", methods=["GET", "POST"])
def add_course():
    user_id = request.cookies.get("user_id", "") # giả sử user id 2 là teacher
    user = User.query.get_or_404(user_id)
    if not user or user.role not in ["TEACHER","ADMIN"]:
        return jsonify({
            "message": "Unauthorized access"
        }), 400
    if request.method == "POST":
        new_course_data = {
            "name": request.form.get("name"),
            "intro": request.form.get("intro"),
            "image": request.files.get("image",None),
            "number_of_lessons": request.form.get("number_of_lessons"),
            "category": request.form.get("category"),
            "level": request.form.get("level"),
            "description": request.form.get("description")
        }
        print(new_course_data)
        category_id = ""
        category = Category.query.filter(Category.name==new_course_data["category"]).first()
        if category:
            category_dict = category.to_dict()
            category_id = category_dict['id']
        # image_url = ""
        # Logic gửi dữ liệu ảnh lên cloudinary
        image_url = ""
        if new_course_data["image"]:
            response = cloudinary.uploader.upload(new_course_data["image"])
            print(response)
            image_url = response['secure_url']
        new_course = Course(
            name=new_course_data["name"],
            intro=new_course_data["intro"],
            image_url=image_url if image_url else "",
            number_of_lessons=new_course_data["number_of_lessons"],
            category_id=category_id,
            level=new_course_data["level"],
            description=new_course_data["description"],
            teacher_id=user_id
        )
        for i in range(1, int(new_course_data["number_of_lessons"])+1):
            lesson_name = request.form.get(f'lessons[{i}][name]')
            lesson_content = request.form.get(f'lessons[{i}][content]')
            lesson_video = request.files.get(f'lessons[{i}][video]', None)
            lesson_video_url = ""
            # Thêm logic xử lý gửi video lên cloudinary sau đó nhận url về và thêm vào
            if lesson_video:
                response = cloudinary.uploader.upload(lesson_video, resource_type='video')
                lesson_video_url = response['secure_url']
            new_lesson = Lesson(
                name=lesson_name,
                content=lesson_content,
                video_url=lesson_video_url if lesson_video_url else "",
                teacher_id=user_id
            )
            new_course.lessons.append(new_lesson)
        try:
            db.session.add(new_course)
            db.session.commit()
            print("Thêm mới khóa học thành công")
            return jsonify({
                "message": "Course created successfully!",
                "course_id": new_course.id
            }), 201
        except SQLAlchemyError as e:
            print("Error adding new course:", e)
            return jsonify({
                "message": "There was an error adding your course. Try again later."
            }), 500
    return jsonify({
        "message": "Undefined route"
    }), 404
@app.route("/api/admin/courses/update/<int:id>", methods=["PUT"])
def update_course(id):
    user_id = request.cookies.get("user_id", "") # giả sử user id 2 là teacher
    user = User.query.get_or_404(user_id)
    if not user or user.role not in ["TEACHER","ADMIN"]:
        return jsonify({
            "message": "Unauthorized access"
        }), 400
    selected_course = Course.query.get_or_404(id)
    if not selected_course:
        return jsonify({
            "message": "Course not found"
        }), 404
    updated_course_data = {
        "name": request.form.get("name"),
        "intro": request.form.get("intro"),
        "image": request.files.get("image",None),
        "number_of_lessons": request.form.get("number_of_lessons"),
        "category": request.form.get("category"),
        "level": request.form.get("level"),
        "description": request.form.get("description")
    }
    print(updated_course_data)
    category_id = ""
    category = Category.query.filter(Category.name==updated_course_data["category"]).first()
    if category:
        category_dict = category.to_dict()
        category_id = category_dict['id']
    # image_url = ""
    # Logic gửi dữ liệu ảnh lên cloudinary
    old_image_url = selected_course.image_url
    new_image_url = ""
    if updated_course_data["image"]:
        
        response = cloudinary.uploader.upload(updated_course_data["image"])
        new_image_url = response['secure_url']
        if len(old_image_url) > 0:
            image_public_id = extract_public_id(old_image_url) 
            response = cloudinary.uploader.destroy(image_public_id)

    # new_course = Course(
    #     name=updated_course_data["name"],
    #     intro=updated_course_data["intro"],
    #     image_url=image_url if image_url else "",
    #     number_of_lessons=updated_course_data["number_of_lessons"],
    #     category_id=updated_course_data["category"],
    #     level=updated_course_data["level"],
    #     description=updated_course_data["description"],
    #     teacher_id=user_id
    # )
    try:
        # db.session.add(new_course)
        # db.session.query(Course).filter(Course.id==id).update(
        #     name=updated_course_data["name"],
        #     intro=updated_course_data["intro"],
        #     image_url=new_image_url,
        #     number_of_lessons=updated_course_data["number_of_lessons"],
        #     category_id=category_id,
        #     level=updated_course_data["level"],
        #     description=updated_course_data["description"]
        # )

        selected_course.name = updated_course_data["name"]
        selected_course.intro = updated_course_data["intro"]
        if new_image_url and len(new_image_url) > 0:
            selected_course.image_url = new_image_url
        selected_course.number_of_lessons = updated_course_data["number_of_lessons"]
        selected_course.category_id = category_id
        selected_course.level = updated_course_data["level"]
        selected_course.description = updated_course_data["description"]

        db.session.commit()
        print("Cập nhật khóa học thành công")
        return jsonify({
            "message": "Course created successfully!",
            "course_id": id
        }), 200
    except SQLAlchemyError as e:
        print("Error updating course:", e)
        return jsonify({
            "message": "There was an error updating your course. Try again later."
        }), 500
@app.route("/api/admin/courses/delete/<int:id>", methods=['DELETE'])
def delete_course(id):
    user_id = request.cookies.get("user_id", "")
    user = User.query.get_or_404(user_id)
    if not user or user.role not in ["TEACHER","ADMIN"]:
        return jsonify({
            "message": "Unauthorized access"
        }), 400
    try:
        response = Lesson.query.filter(Lesson.course_id==id).delete()
        response = Course.query.filter(Course.id==id).delete()
        db.session.commit()
        return jsonify({
            "message": "Course deleted successfully!"
        }), 200
    except SQLAlchemyError as e:
        print("Error updating course:", e)
        return jsonify({
            "message": "There was an error updating your course. Try again later."
        }), 500
@app.route("/api/admin/lessons", methods=["GET", "POST"])
def get_lessons(): 
    user_id = request.cookies.get("user_id", "")
    try:
        user = User.query.get_or_404(int(user_id))
        if not user or user.role not in ["TEACHER","ADMIN"]:
            return jsonify({
                "message": "Unauthorized access"
            }), 400
        lessons = []
        if user.role == "TEACHER":
            lessons = Lesson.query\
                .filter(Lesson.teacher_id==user_id)\
                .order_by(Lesson.created_at.desc())\
                .all()
        else:
            lessons = Lesson.query\
                .order_by(Lesson.created_at.desc())\
                .all()
        print(lessons)
        if not lessons:
            return jsonify({
                "message": "No courses found"
            }), 404
        lessons_dict = [lesson.to_dict() for lesson in lessons]
        return jsonify({
            "lessons": lessons_dict
        }), 200
    except SQLAlchemyError as e:
        print("Error getting lessons:", e)
        return jsonify({
            "message": "There was an error getting courses. Try again later."
        }), 500
@app.route("/api/admin/lessons/<int:id>", methods=["GET"])
def get_lesson_by_id(id):
    user_id = request.cookies.get("user_id", "")
    try:
        user = User.query.get_or_404(user_id)
        if not user or user.role not in ["TEACHER","ADMIN"]:
            return jsonify({
                "message": "Unauthorized access"
            }), 400
        selected_lesson = Lesson.query.get_or_404(id)
        if not selected_lesson:
            return jsonify({
                "message": "Lesson not found"
            }), 404
        selected_course = Course.query.get_or_404(selected_lesson.course_id)
        if not selected_course:
            return jsonify({
                "message": "Course not found"
            }), 404
        return jsonify({
            "lesson": {
                **selected_lesson.to_dict(),
                "courseName": selected_course.name 
            }
        }), 200
    except:
        print("Error getting lesson")
        return jsonify({
            "message": "There was an error getting lesson. Try again later."
        }), 500
@app.route("/api/admin/lessons/new", methods=["POST"])
def add_lesson():
    user_id = request.cookies.get("user_id", "")
    try:
        user = User.query.get_or_404(user_id)
        if not user or user.role not in ["TEACHER","ADMIN"]:
            return jsonify({
                "message": "Unauthorized access"
            }), 400
        course_id = request.form.get("courseId", "")
        selected_course = Course.query.get_or_404(course_id)
        if not selected_course:
            return jsonify({
                "message": "Course not found."
            })
        lesson_video = request.files.get("lessonVideo", None)
        lesson_video_url = ""
        if lesson_video:
            response = cloudinary.uploader.upload(lesson_video, resource_type='video')
            lesson_video_url = response['secure_url']
        new_lesson = Lesson(
            name=request.form.get("lessonName"),
            content=request.form.get("lessonContent"),
            video_url=lesson_video_url,
            teacher_id=user_id,
            course_id=selected_course.id
        )
        db.session.add(new_lesson)
        db.session.commit()
        print("Thêm mới bài học thành công!")
        return jsonify({
            "message": "Lesson created successfully!",
            "lesson_id": new_lesson.id
        }), 201
    except SQLAlchemyError as e:
        print("Error adding lesson:", e)
        return jsonify({
            "message": "There was an error adding lesson. Try again later."
        }), 500
@app.route("/api/admin/lessons/update/<int:id>", methods=["PUT"])
def update_lesson(id):
    user_id = request.cookies.get("user_id", "")
    try:
        user = User.query.get_or_404(user_id)
        if not user or user.role not in ["TEACHER","ADMIN"]:
            return jsonify({
                "message": "Unauthorized access"
            }), 400
        selected_lesson = Lesson.query.get_or_404(id)
        if not selected_lesson:
            return jsonify({
                "message": "Lesson not found."
            }), 404
        course_id = request.form.get("courseId", "")
        selected_course = Course.query.get_or_404(course_id)
        if not selected_course:
            return jsonify({
                "message": "Course not found."
            })
        lesson_video = request.files.get("lessonVideo", None)
        lesson_video_url = selected_lesson.video_url
        if lesson_video:
            response = cloudinary.uploader.upload(lesson_video, resource_type='video')
            lesson_video_url = response['secure_url']
        existing_video_url = selected_lesson.to_dict().video_url
        if len(existing_video_url) > 0:
            response = cloudinary.uploader.destroy(existing_video_url, resource_type='video')
        selected_lesson.name = request.form.get("lessonName")
        selected_lesson.content = request.form.get("lessonContent")
        selected_lesson.video_url = lesson_video_url
        selected_lesson.teacher_id = user_id
        selected_lesson.course_id = selected_course.id
        db.session.commit()
        print("Cập nhật bài học thành công!")
        return jsonify({
            "message": "Lesson updated successfully!",
            "lesson_id": selected_lesson.id
        }), 200
    except SQLAlchemyError as e:
        print("Error updating lesson:", e)
        return jsonify({
            "message": "There was an error updating lesson. Try again later."
        }), 500
@app.route("/api/admin/lessons/delete/<int:id>", methods=["DELETE"])
def delete_lesson(id):
    user_id = request.cookies.get("user_id", "")
    try:
        user = User.query.get_or_404(user_id)
        if not user or user.role not in ["TEACHER","ADMIN"]:
            return jsonify({
                "message": "Unauthorized access"
            }), 400
        selected_lesson = Lesson.query.get_or_404(id)
        if not selected_lesson:
            return jsonify({
                "message": "Lesson not found."
            }), 404
        response = Lesson.query.filter(Lesson.id==id).delete()
        db.session.commit()
        return jsonify({
            "message": "Lesson delete successfully!"
        }), 200
    except SQLAlchemyError as e:
        print("Error deleting lesson:", e)
        return jsonify({
            "message": "There was an error deleting lesson. Try again later."
        }), 500
@app.route("/api/admin/teachers", methods=["GET"])
def get_teachers():
    try:
        teachers = User.query.filter(User.role=="teacher").all()
        if not teachers:
            return jsonify({
                "message": "No courses found"
            }), 404
        teachers_dict = [teacher.to_dict() for teacher in teachers]
        return jsonify({
            "teachers": teachers_dict
        }), 200
    except SQLAlchemyError as e:
        print("Error getting courses:", e)
        return jsonify({
            "message": "There was an error getting courses. Try again later."
        }), 500
@app.route("/api/category", methods=["GET"])
def get_categories():
    categories = []
    try:
        # db.session.add(new_category)
        # db.session.commit()
        categories = Category.query.all()
        if categories or len(categories) == 0:
            print("No categories found.")
        categories_dict = [category.to_dict() for category in categories]
        print(categories_dict)
        return jsonify({
            "categories": categories_dict
        }), 200
    except SQLAlchemyError as e:
        print("Error getting category")
        return jsonify({
            "message": "There was an error getting categories. Try again later."
        }), 500
@app.route('/api/image-placeholder')
def get_image_url():
    url = url_for('static', filename='images/course_placeholder.svg')
    return jsonify({'image_url': url}), 200

if __name__ == '__main__':
    app.run(debug=True)