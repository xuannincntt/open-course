from db import db, Category
from app import app
from sqlalchemy.exc import SQLAlchemyError

sample_categories = [
    {
        "name": "technology"
    },
    {
        "name": "health"
    },
    {
        "name": "languages"
    },
    {
        "name": "finance"
    }
]

def add_sample_categories():
    new_categories = []
    for category in sample_categories:
        new_category = Category(
            name=category["name"]
        )
        new_categories.append(new_category)

    try:
        db.session.add_all(new_categories)
        db.session.commit()
    except SQLAlchemyError as e:
        print("SQLAlchemyError",e)

with app.app_context():
    add_sample_categories()