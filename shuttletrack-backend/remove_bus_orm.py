# remove_bus_orm.py
from sqlmodel import Session, select
from app.db.session import engine
from app import models

name_to_delete = "Bus 101"

with Session(engine) as session:
    stmt = select(models.Bus).where(models.Bus.name == name_to_delete)
    results = session.exec(stmt).all()

    if not results:
        print(f"No bus found with name '{name_to_delete}'.")
    else:
        for b in results:
            print(f"Deleting: {b.id} - {b.name}")
            session.delete(b)
        session.commit()
        print(f"Deleted {len(results)} record(s).")
