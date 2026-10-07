from database import engine

try:
    with engine.connect() as connection:
        print("MySQL Database Connected Successfully!")
except Exception as e:
    print("Database Connection Failed!")
    print(e)